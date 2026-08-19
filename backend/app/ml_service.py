"""
Machine Learning Inference Engine for Facial Emotion Recognition (FER)
Backbone: EfficientNet-B5 (Fine-tuned on FER-4 dataset: Angry, Happy, Neutral, Sad)
"""

import os
import io
import time
import base64
import logging
from typing import Dict, Any, List, Optional, Tuple

import numpy as np
from PIL import Image, ImageOps

logger = logging.getLogger("ml_service")

# Try importing torch & torchvision
try:
    import torch
    import torch.nn as nn
    from torchvision import transforms, models
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    logger.warning("PyTorch/Torchvision not installed. ML inference will run in simulated mode.")

# Try importing OpenCV for face detection
try:
    import cv2
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False
    logger.warning("OpenCV not installed. Direct image cropping without face cascade.")

# =========================================================
# Configuration
# =========================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..", ".."))

CANDIDATE_MODEL_PATHS = [
    os.path.join(PROJECT_ROOT, "ml_engine", "best_efficientnet_b5_faces_fer4.pth"),
    os.path.join(BASE_DIR, "best_efficientnet_b5_faces_fer4.pth"),
    os.path.join(PROJECT_ROOT, "best_efficientnet_b5_faces_fer4.pth")
]

EMOTION_CLASSES = ["angry", "happy", "neutral", "sad"]
EMOTION_DISPLAY_NAMES = {
    "angry": "Angry",
    "happy": "Happy",
    "neutral": "Neutral",
    "sad": "Sad"
}

EMOTION_COLORS = {
    "Happy": "#F59E0B",
    "Sad": "#3B82F6",
    "Neutral": "#8B5CF6",
    "Angry": "#EF4444"
}

IMAGE_SIZE = 456

# =========================================================
# Preprocessing Helper Classes
# =========================================================
class AutoContrastPIL:
    def __call__(self, img: Image.Image) -> Image.Image:
        return ImageOps.autocontrast(img)


# =========================================================
# Emotion Predictor Engine
# =========================================================
class EmotionPredictor:
    def __init__(self):
        self.device = torch.device("cuda" if (TORCH_AVAILABLE and torch.cuda.is_available()) else "cpu")
        self.model: Optional[Any] = None
        self.face_cascade: Optional[Any] = None
        self.is_loaded = False
        self.model_path = None
        self.transform = None

        if TORCH_AVAILABLE:
            self.transform = transforms.Compose([
                AutoContrastPIL(),
                transforms.Grayscale(num_output_channels=3),
                transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225]
                )
            ])

        self._init_face_detector()
        self._load_model()

    def _init_face_detector(self):
        if not OPENCV_AVAILABLE:
            return
        try:
            cascade_path = None
            if hasattr(cv2, "data") and hasattr(cv2.data, "haarcascades"):
                cascade_path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
            if not cascade_path or not os.path.isfile(cascade_path):
                local_xml = os.path.join(PROJECT_ROOT, "ml_engine", "haarcascade_frontalface_default.xml")
                if os.path.isfile(local_xml):
                    cascade_path = local_xml

            if cascade_path and os.path.isfile(cascade_path):
                self.face_cascade = cv2.CascadeClassifier(cascade_path)
        except Exception as e:
            logger.warning(f"Could not load face cascade: {e}")

    def _load_model(self):
        if not TORCH_AVAILABLE:
            return

        for path in CANDIDATE_MODEL_PATHS:
            if os.path.isfile(path) and os.path.getsize(path) > 10 * 1024 * 1024:
                self.model_path = path
                break

        if not self.model_path:
            logger.warning("EfficientNet-B5 model checkpoint not found in candidate paths.")
            return

        try:
            logger.info(f"Loading EfficientNet-B5 model from {self.model_path} ...")
            model = models.efficientnet_b5(weights=None)
            in_features = model.classifier[-1].in_features
            model.classifier = nn.Sequential(
                nn.Dropout(p=0.4),
                nn.Linear(in_features, 512),
                nn.ReLU(),
                nn.Dropout(p=0.25),
                nn.Linear(512, len(EMOTION_CLASSES))
            )

            ckpt = torch.load(self.model_path, map_location="cpu")
            if isinstance(ckpt, dict) and "model_state_dict" in ckpt:
                state_dict = ckpt["model_state_dict"]
            elif isinstance(ckpt, dict) and "state_dict" in ckpt:
                state_dict = ckpt["state_dict"]
            else:
                state_dict = ckpt

            clean_state_dict = {}
            for k, v in state_dict.items():
                nk = k.replace("module.", "") if k.startswith("module.") else k
                clean_state_dict[nk] = v

            model.load_state_dict(clean_state_dict, strict=True)
            model = model.to(self.device)
            model.eval()

            self.model = model
            self.is_loaded = True
            logger.info(f"EfficientNet-B5 model loaded successfully onto {self.device}!")
        except Exception as e:
            logger.error(f"Error loading model from {self.model_path}: {e}", exc_info=True)

    def _crop_face(self, pil_img: Image.Image) -> Tuple[Image.Image, bool, Optional[List[int]]]:
        """
        Detects the primary face and expands with 20% margin padding.
        Falls back to full image if no face detected.
        """
        if not self.face_cascade or not OPENCV_AVAILABLE:
            return pil_img, False, None

        try:
            img_np = np.array(pil_img)
            h, w = img_np.shape[:2]

            if len(img_np.shape) == 3 and img_np.shape[2] == 3:
                gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
            elif len(img_np.shape) == 3 and img_np.shape[2] == 4:
                gray = cv2.cvtColor(img_np, cv2.COLOR_RGBA2GRAY)
            else:
                gray = img_np

            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=4,
                minSize=(max(16, int(w * 0.08)), max(16, int(h * 0.08)))
            )

            if len(faces) == 0:
                return pil_img, False, None

            # Choose largest face
            largest_face = max(faces, key=lambda f: f[2] * f[3])
            fx, fy, fw, fh = largest_face

            # 20% padding
            pad_w = fw * 0.20
            pad_h = fh * 0.20

            x1 = max(0, int(round(fx - pad_w)))
            y1 = max(0, int(round(fy - pad_h)))
            x2 = min(w, int(round(fx + fw + pad_w)))
            y2 = min(h, int(round(fy + fh + pad_h)))

            crop_img = pil_img.crop((x1, y1, x2, y2))
            return crop_img, True, [x1, y1, x2 - x1, y2 - y1]
        except Exception as e:
            logger.warning(f"Face cropping exception: {e}")
            return pil_img, False, None

    def predict_pil(self, pil_img: Image.Image) -> Dict[str, Any]:
        start_t = time.time()

        # Crop face if available
        cropped_img, face_detected, face_box = self._crop_face(pil_img)

        # If model is loaded and torch is active, run real EfficientNet-B5 inference
        if self.is_loaded and self.model is not None and self.transform is not None:
            try:
                tensor = self.transform(cropped_img).unsqueeze(0).to(self.device)
                with torch.no_grad():
                    logits = self.model(tensor)
                    probs = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()

                scores_list = []
                for idx, class_key in enumerate(EMOTION_CLASSES):
                    display_name = EMOTION_DISPLAY_NAMES[class_key]
                    prob_val = float(probs[idx])
                    scores_list.append({
                        "emotion": display_name,
                        "score": round(prob_val, 4),
                        "color": EMOTION_COLORS.get(display_name, "#8B5CF6")
                    })

                best = max(scores_list, key=lambda s: s["score"])
                elapsed_ms = round((time.time() - start_t) * 1000, 2)

                return {
                    "emotion": best["emotion"],
                    "confidence": best["score"],
                    "scores": scores_list,
                    "faceDetected": face_detected,
                    "box": face_box,
                    "model": "EfficientNet-B5 (Pretrained FER-4)",
                    "device": str(self.device),
                    "executionTimeMs": elapsed_ms,
                    "status": "success"
                }
            except Exception as e:
                logger.error(f"Inference execution error: {e}", exc_info=True)

        # Fallback heuristic analyzer if model weights aren't loaded
        return self._heuristic_fallback(cropped_img, face_detected, face_box, start_t)

    def _heuristic_fallback(self, pil_img: Image.Image, face_detected: bool,
                            face_box: Optional[List[int]], start_t: float) -> Dict[str, Any]:
        gray = pil_img.convert("L")
        arr = np.array(gray, dtype=np.float32)
        mean_lum = float(np.mean(arr))
        std_lum = float(np.std(arr))

        if std_lum > 50:
            primary = "Happy"
            scores = [
                {"emotion": "Happy", "score": 0.88, "color": EMOTION_COLORS["Happy"]},
                {"emotion": "Neutral", "score": 0.06, "color": EMOTION_COLORS["Neutral"]},
                {"emotion": "Sad", "score": 0.03, "color": EMOTION_COLORS["Sad"]},
                {"emotion": "Angry", "score": 0.03, "color": EMOTION_COLORS["Angry"]}
            ]
        elif mean_lum < 80:
            primary = "Sad"
            scores = [
                {"emotion": "Sad", "score": 0.82, "color": EMOTION_COLORS["Sad"]},
                {"emotion": "Neutral", "score": 0.08, "color": EMOTION_COLORS["Neutral"]},
                {"emotion": "Angry", "score": 0.06, "color": EMOTION_COLORS["Angry"]},
                {"emotion": "Happy", "score": 0.04, "color": EMOTION_COLORS["Happy"]}
            ]
        else:
            primary = "Neutral"
            scores = [
                {"emotion": "Neutral", "score": 0.85, "color": EMOTION_COLORS["Neutral"]},
                {"emotion": "Happy", "score": 0.07, "color": EMOTION_COLORS["Happy"]},
                {"emotion": "Sad", "score": 0.05, "color": EMOTION_COLORS["Sad"]},
                {"emotion": "Angry", "score": 0.03, "color": EMOTION_COLORS["Angry"]}
            ]

        elapsed_ms = round((time.time() - start_t) * 1000, 2)
        return {
            "emotion": primary,
            "confidence": scores[0]["score"],
            "scores": scores,
            "faceDetected": face_detected,
            "box": face_box,
            "model": "EfficientNet-B5 (Heuristic Fallback)",
            "device": "CPU",
            "executionTimeMs": elapsed_ms,
            "status": "fallback"
        }

    def predict_bytes(self, image_bytes: bytes) -> Dict[str, Any]:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return self.predict_pil(image)

    def predict_base64(self, base64_str: str) -> Dict[str, Any]:
        if "," in base64_str:
            base64_str = base64_str.split(",", 1)[1]
        image_bytes = base64.b64decode(base64_str)
        return self.predict_bytes(image_bytes)


# Singleton instance
_predictor_instance: Optional[EmotionPredictor] = None

def get_emotion_predictor() -> EmotionPredictor:
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = EmotionPredictor()
    return _predictor_instance

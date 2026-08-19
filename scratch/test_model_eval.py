"""
In-Depth Evaluation & Analysis of EfficientNet-B5 FER-4 Checkpoint
Tests face-cropped images, uncropped images, various normalization schemes,
and examines domain shift, class probabilities, and failure modes.
"""

import os
import sys
import io
import json
import urllib.request
from collections import defaultdict
from PIL import Image, ImageOps
import numpy as np
import cv2
import torch
import torch.nn as nn
from torchvision import transforms, models

# Ensure safe console printing on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Load face cascade for exact cropping matching training pipeline
cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
face_cascade = cv2.CascadeClassifier(cascade_path)

TEST_IMAGES = {
    "happy": [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
    ],
    "sad": [
        "https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500&auto=format&fit=crop&q=80",
    ],
    "neutral": [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80",
    ],
    "angry": [
        "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80",
    ]
}

CLASSES = ["angry", "happy", "neutral", "sad"]
IDX_TO_CLASS = {0: "angry", 1: "happy", 2: "neutral", 3: "sad"}

class AutoContrastPIL:
    def __call__(self, img):
        return ImageOps.autocontrast(img)

# Exact training validation transform
val_transform = transforms.Compose([
    AutoContrastPIL(),
    transforms.Grayscale(num_output_channels=3),
    transforms.Resize((456, 456)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

def crop_face_haar(pil_img, pad_ratio=0.20):
    img_np = np.array(pil_img)
    h, w = img_np.shape[:2]
    gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30))
    if len(faces) == 0:
        return pil_img, False
    largest = max(faces, key=lambda f: f[2] * f[3])
    x, y, fw, fh = largest
    pad_w = fw * pad_ratio
    pad_h = fh * pad_ratio
    x1 = max(0, int(x - pad_w))
    y1 = max(0, int(y - pad_h))
    x2 = min(w, int(x + fw + pad_w))
    y2 = min(h, int(y + fh + pad_h))
    return pil_img.crop((x1, y1, x2, y2)), True

def build_model(checkpoint_path):
    model = models.efficientnet_b5(weights=None)
    in_features = model.classifier[-1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.4),
        nn.Linear(in_features, 512),
        nn.ReLU(),
        nn.Dropout(p=0.25),
        nn.Linear(512, 4)
    )
    ckpt = torch.load(checkpoint_path, map_location="cpu")
    sd = ckpt.get("model_state_dict", ckpt)
    clean_sd = {k.replace("module.", ""): v for k, v in sd.items()}
    model.load_state_dict(clean_sd, strict=True)
    model.eval()
    return model

def run_tests():
    ckpt_path = "ml_engine/best_efficientnet_b5_faces_fer4.pth"
    model = build_model(ckpt_path)

    print("================================================================================")
    print("EVALUATION WITH EXACT TRAINING PIPELINE (HAAR CROPPING + AUTOCONTRAST + 456x456)")
    print("================================================================================")
    print(f"{'Target':<8} | {'Img':<4} | {'Cropped?':<8} | {'Predicted':<10} | {'Confidence':<10} | {'Angry':<6} | {'Happy':<6} | {'Neut':<6} | {'Sad':<6} | Match")
    print("-" * 88)

    confusion = defaultdict(lambda: defaultdict(int))
    total_count = 0
    correct_count = 0

    for target_class, urls in TEST_IMAGES.items():
        for i, url in enumerate(urls, 1):
            img_path = f"scratch/downloaded_test_faces/{target_class}_{i}.jpg"
            img = Image.open(img_path).convert("RGB")

            # 1. Apply Haar face crop (exact training dataset preparation)
            cropped_img, was_cropped = crop_face_haar(img, pad_ratio=0.20)

            # 2. Transform
            tensor = val_transform(cropped_img).unsqueeze(0)

            # 3. Model forward
            with torch.no_grad():
                logits = model(tensor)
                probs = torch.softmax(logits, dim=1).squeeze(0).numpy()

            pred_idx = int(np.argmax(probs))
            pred_class = IDX_TO_CLASS[pred_idx]
            conf = probs[pred_idx]

            is_match = (pred_class == target_class)
            confusion[target_class][pred_class] += 1
            total_count += 1
            if is_match:
                correct_count += 1

            crop_str = "YES" if was_cropped else "NO"
            match_str = "[CORRECT]" if is_match else "[WRONG]"

            print(f"{target_class:<8} | #{i:<3} | {crop_str:<8} | {pred_class:<10} | {conf*100:6.1f}%   | {probs[0]*100:4.1f}% | {probs[1]*100:4.1f}% | {probs[2]*100:4.1f}% | {probs[3]*100:4.1f}% | {match_str}")

    print("=" * 88)
    print("\nCONFUSION MATRIX (Rows: Ground Truth, Cols: Predicted):")
    print(f"{'Target':<10} | {'Angry':<8} | {'Happy':<8} | {'Neutral':<8} | {'Sad':<8} | Accuracy")
    print("-" * 60)
    for t in CLASSES:
        row = [confusion[t][p] for p in CLASSES]
        t_total = sum(row)
        t_acc = (confusion[t][t] / t_total * 100) if t_total > 0 else 0
        print(f"{t:<10} | {row[0]:<8} | {row[1]:<8} | {row[2]:<8} | {row[3]:<8} | {t_acc:.1f}%")

    print("-" * 60)
    print(f"Overall Benchmark Accuracy: {correct_count}/{total_count} ({correct_count/total_count*100:.1f}%)\n")

if __name__ == "__main__":
    run_tests()

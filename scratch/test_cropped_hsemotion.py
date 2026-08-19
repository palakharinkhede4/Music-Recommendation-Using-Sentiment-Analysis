import cv2
import os
import sys
import numpy as np
import torch
_orig_load = torch.load
torch.load = lambda *args, **kwargs: _orig_load(*args, **{k: v for k, v in kwargs.items() if k != 'weights_only'}, weights_only=False)

from hsemotion.facial_emotions import HSEmotionRecognizer
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_indian_faces import INDIAN_FACES

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

fer = HSEmotionRecognizer(model_name='enet_b0_8_best_vgaf', device='cpu')
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

MAPPING = {
    'Anger': 'angry',
    'Contempt': 'angry',
    'Disgust': 'angry',
    'Fear': 'sad',
    'Happiness': 'happy',
    'Neutral': 'neutral',
    'Sadness': 'sad',
    'Surprise': 'happy'
}

correct = 0
total = 0
print("=" * 85)
print("HSEmotion EVALUATION WITH HAAR FACE CROPPING (AFFECTNET PRETRAINED CNN)")
print("=" * 85)

for target, items in INDIAN_FACES.items():
    for i, (desc, _) in enumerate(items, 1):
        img_path = f'scratch/indian_test_faces/{target}_{i}.jpg'
        img_bgr = cv2.imread(img_path)
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4, minSize=(30,30))
        if len(faces) > 0:
            x, y, w, h = max(faces, key=lambda f: f[2]*f[3])
            # Add 10% margin
            pad_w = int(w * 0.1)
            pad_h = int(h * 0.1)
            x1 = max(0, x - pad_w)
            y1 = max(0, y - pad_h)
            x2 = min(img_bgr.shape[1], x + w + pad_w)
            y2 = min(img_bgr.shape[0], y + h + pad_h)
            face_crop = img_bgr[y1:y2, x1:x2]
        else:
            face_crop = img_bgr
        
        label, scores = fer.predict_emotions(face_crop, logits=False)
        conf = float(np.max(scores))
        mapped = MAPPING.get(label, label.lower())
        is_m = (mapped == target)
        total += 1
        if is_m:
            correct += 1
        match_str = "[CORRECT] ✅" if is_m else "[WRONG] ❌"
        print(f"{target:<8} #{i} | Raw: {label:<10} ({conf*100:4.1f}%) | Mapped: {mapped:<8} | {match_str}")

print("=" * 85)
print(f"HSEmotion Face-Cropped Real-World Accuracy: {correct}/{total} ({correct/total*100:.1f}%)")

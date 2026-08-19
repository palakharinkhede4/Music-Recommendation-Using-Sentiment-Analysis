"""
Testing HSEmotion: Proven State-of-the-Art Facial Emotion Recognizer (AffectNet / RAF-DB CNN)
Evaluates directly on the 16 real-world Indian test face images.
"""

import os
import sys
from collections import defaultdict
import numpy as np
from PIL import Image
import cv2
import torch

# Allow loading full PyTorch model object from HSEmotion in PyTorch 2.6+
_orig_load = torch.load
torch.load = lambda *args, **kwargs: _orig_load(*args, **{k: v for k, v in kwargs.items() if k != 'weights_only'}, weights_only=False)

from hsemotion.facial_emotions import HSEmotionRecognizer

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

TEST_IMAGES = {
    "happy": [f"scratch/indian_test_faces/happy_{i}.jpg" for i in range(1, 5)],
    "sad": [f"scratch/indian_test_faces/sad_{i}.jpg" for i in range(1, 5)],
    "neutral": [f"scratch/indian_test_faces/neutral_{i}.jpg" for i in range(1, 5)],
    "angry": [f"scratch/indian_test_faces/angry_{i}.jpg" for i in range(1, 5)]
}

# 7/8 emotion mapping to our 4 target emotions
MAPPING = {
    "Anger": "angry",
    "Contempt": "angry",
    "Disgust": "angry",
    "Fear": "sad",
    "Happiness": "happy",
    "Neutral": "neutral",
    "Sadness": "sad",
    "Surprise": "happy"
}

def main():
    print("=" * 95)
    print("EVALUATING PROVEN REAL-WORLD CNN MODEL: HSEmotion (enet_b0_8_best_vgaf / AffectNet)")
    print("=" * 95)

    # Initialize model (lightweight 15MB EfficientNet backbone)
    fer = HSEmotionRecognizer(model_name='enet_b0_8_best_vgaf', device='cpu')

    print(f"{'Target':<8} | {'Image':<10} | {'Raw 8-Class Prediction':<26} | {'Confidence':<10} | {'Mapped 4-Class':<14} | Match?")
    print("-" * 95)

    confusion = defaultdict(lambda: defaultdict(int))
    total = 0
    correct = 0

    for target_class, img_paths in TEST_IMAGES.items():
        for i, img_path in enumerate(img_paths, 1):
            if not os.path.exists(img_path):
                continue

            # Read image with BGR (OpenCV format expected by HSEmotion)
            img_bgr = cv2.imread(img_path)

            emotion_label, scores = fer.predict_emotions(img_bgr, logits=False)
            conf = float(np.max(scores))
            mapped_class = MAPPING.get(emotion_label, emotion_label.lower())

            is_match = (mapped_class == target_class)
            confusion[target_class][mapped_class] += 1
            total += 1
            if is_match:
                correct += 1

            match_str = "[CORRECT] ✅" if is_match else "[WRONG] ❌"
            print(f"{target_class:<8} | #{i:<9} | {emotion_label:<26} | {conf*100:6.1f}%    | {mapped_class:<14} | {match_str}")

    print("=" * 95)
    print(f"\nREAL-WORLD BENCHMARK RESULTS (HSEmotion on Indian Face Dataset):")
    print(f"Overall Accuracy: {correct}/{total} ({correct/total*100:.1f}%)\n")
    for c in ["angry", "happy", "neutral", "sad"]:
        row = confusion[c]
        c_tot = sum(row.values())
        c_acc = (row[c] / c_tot * 100) if c_tot > 0 else 0
        print(f"  {c:<10}: {row[c]}/{c_tot} ({c_acc:.1f}%) -> {dict(row)}")
    print("=" * 95)

if __name__ == "__main__":
    main()

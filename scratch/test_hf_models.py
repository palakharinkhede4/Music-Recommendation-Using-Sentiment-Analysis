"""
Testing Proven Pretrained Facial Emotion Models from Hugging Face
Evaluates on the exact same 16 real-world Indian test face photos.
Models tested:
1. dima806/facial_emotions_image_detection (ViT, 91% accuracy)
2. abhilash88/face-emotion-detection (FER-2013 fine-tuned PyTorch model)
"""

import os
import sys
from collections import defaultdict
from PIL import Image
import torch
from transformers import pipeline

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

TEST_IMAGES = {
    "happy": [f"scratch/indian_test_faces/happy_{i}.jpg" for i in range(1, 5)],
    "sad": [f"scratch/indian_test_faces/sad_{i}.jpg" for i in range(1, 5)],
    "neutral": [f"scratch/indian_test_faces/neutral_{i}.jpg" for i in range(1, 5)],
    "angry": [f"scratch/indian_test_faces/angry_{i}.jpg" for i in range(1, 5)]
}

# 7-class to 4-class mapping for comparison (surprise/fear/disgust maps into closest sentiment if triggered)
EMOTION_MAPPING = {
    "happy": "happy",
    "sad": "sad",
    "neutral": "neutral",
    "angry": "angry",
    "disgust": "angry",
    "fear": "sad",
    "surprise": "happy"
}

def evaluate_model(model_name):
    print("=" * 90)
    print(f"EVALUATING MODEL: {model_name}")
    print("=" * 90)
    
    classifier = pipeline("image-classification", model=model_name)

    print(f"{'Target':<8} | {'Image':<10} | {'Raw 7-Class Top Prediction':<30} | {'Mapped 4-Class':<14} | Match?")
    print("-" * 90)

    confusion = defaultdict(lambda: defaultdict(int))
    total = 0
    correct = 0

    for target_class, img_paths in TEST_IMAGES.items():
        for i, img_path in enumerate(img_paths, 1):
            if not os.path.exists(img_path):
                print(f"Missing {img_path}")
                continue
            
            img = Image.open(img_path).convert("RGB")
            results = classifier(img)
            top = results[0]
            raw_label = top["label"].lower()
            conf = top["score"]

            mapped_class = EMOTION_MAPPING.get(raw_label, raw_label)
            is_match = (mapped_class == target_class)

            confusion[target_class][mapped_class] += 1
            total += 1
            if is_match:
                correct += 1

            raw_str = f"{raw_label} ({conf*100:.1f}%)"
            match_str = "[CORRECT] ✅" if is_match else "[WRONG] ❌"

            print(f"{target_class:<8} | #{i:<9} | {raw_str:<30} | {mapped_class:<14} | {match_str}")

    print("=" * 90)
    print(f"ACCURACY ON REAL-WORLD INDIAN FACES FOR {model_name}:")
    print(f"Overall Accuracy: {correct}/{total} ({correct/total*100:.1f}%)\n")
    for c in ["angry", "happy", "neutral", "sad"]:
        row = confusion[c]
        c_tot = sum(row.values())
        c_acc = (row[c] / c_tot * 100) if c_tot > 0 else 0
        print(f"  {c:<10}: {row[c]}/{c_tot} ({c_acc:.1f}%) -> Predictions: {dict(row)}")
    print("=" * 90 + "\n")

if __name__ == "__main__":
    print("[*] Testing pretrained Hugging Face emotion models...\n")
    evaluate_model("dima806/facial_emotions_image_detection")
    evaluate_model("abhilash88/face-emotion-detection")

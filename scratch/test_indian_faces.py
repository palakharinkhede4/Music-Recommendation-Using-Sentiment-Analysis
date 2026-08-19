"""
Direct PyTorch Model Testing on Indian Faces (4 Expressions: Happy, Sad, Neutral, Angry)
No frontend, no heuristics, direct raw tensor inference from best_efficientnet_b5_faces_fer4.pth.
"""

import os
import sys
import io
import urllib.request
from collections import defaultdict
from PIL import Image, ImageOps
import numpy as np
import torch
import torch.nn as nn
from torchvision import transforms, models

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Curated Indian face images from Unsplash / Wikimedia with clear facial expressions
INDIAN_FACES = {
    "happy": [
        # Happy smiling Indian woman
        ("Indian Woman Joyful Smile", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80"),
        # Happy Indian man laughing
        ("Indian Man Broad Smile", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80"),
        # Cheerful Indian young adult
        ("Indian Young Adult Cheerful", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"),
        # Indian festival smile
        ("Indian Festive Portrait Smile", "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80")
    ],
    "sad": [
        # Sad / crying Indian expression
        ("Indian Woman Sad Tearful", "https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?w=500&auto=format&fit=crop&q=80"),
        # Distressed Indian man
        ("Indian Man Distressed Downcast", "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&auto=format&fit=crop&q=80"),
        # Gloomy / heartbroken expression
        ("Indian Person Melancholy", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80"),
        # Sad upset face
        ("Indian Woman Upset Expression", "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500&auto=format&fit=crop&q=80")
    ],
    "neutral": [
        # Indian man passport/neutral expression
        ("Indian Man Neutral Serious", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80"),
        # Indian woman calm neutral
        ("Indian Woman Neutral Gaze", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80"),
        # Indian corporate headshot neutral
        ("Indian Professional Neutral Face", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80"),
        # Relaxed neutral face
        ("Indian Young Man Neutral", "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80")
    ],
    "angry": [
        # Indian man furious / tense expression
        ("Indian Man Angry Frown", "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&auto=format&fit=crop&q=80"),
        # Frustrated / annoyed Indian portrait
        ("Indian Person Stern Angry Glare", "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=500&auto=format&fit=crop&q=80"),
        # Aggressive / fierce look
        ("Indian Man Intense Grimace", "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80"),
        # Harsh furious look
        ("Indian Male Tight Jaw Angry", "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80")
    ]
}

CLASSES = ["angry", "happy", "neutral", "sad"]
IDX_TO_CLASS = {0: "angry", 1: "happy", 2: "neutral", 3: "sad"}

class AutoContrastPIL:
    def __call__(self, img):
        return ImageOps.autocontrast(img)

# Exact validation transform from training code
transform_user_exact = transforms.Compose([
    AutoContrastPIL(),
    transforms.Grayscale(num_output_channels=3),
    transforms.Resize((456, 456)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

def build_user_model(checkpoint_path):
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
    return model, ckpt

def download_img(url, save_path):
    if os.path.exists(save_path):
        return Image.open(save_path).convert("RGB")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = resp.read()
        img = Image.open(io.BytesIO(data)).convert("RGB")
        img.save(save_path)
        return img

def main():
    os.makedirs("scratch/indian_test_faces", exist_ok=True)
    ckpt_path = "ml_engine/best_efficientnet_b5_faces_fer4.pth"

    print("=" * 95)
    print("DIRECT LOCAL PYTORCH INFERENCE TEST: EFFICIENTNET-B5 (FER-4)")
    print(f"Model Checkpoint: {ckpt_path}")
    print("=" * 95)

    model, ckpt = build_user_model(ckpt_path)
    print(f"Checkpoint Metadata: Epoch={ckpt.get('epoch')}, BestAcc={ckpt.get('best_acc')*100:.2f}%, ClassMap={ckpt.get('class_to_idx')}")
    print(f"Classifier Final Bias: {model.classifier[-1].bias.detach().numpy().round(4)}")
    print("=" * 95)

    print(f"\n{'Target':<8} | {'Description':<32} | {'Predicted':<8} | {'Conf':<6} | {'Raw Logits [A, H, N, S]':<26} | Match?")
    print("-" * 95)

    confusion = defaultdict(lambda: defaultdict(int))
    total = 0
    correct = 0

    for target_class, items in INDIAN_FACES.items():
        for i, (desc, url) in enumerate(items, 1):
            img_path = f"scratch/indian_test_faces/{target_class}_{i}.jpg"
            try:
                img = download_img(url, img_path)
                tensor = transform_user_exact(img).unsqueeze(0)

                with torch.no_grad():
                    logits = model(tensor).squeeze(0)
                    probs = torch.softmax(logits, dim=0).numpy()
                    raw_l = logits.numpy()

                pred_idx = int(np.argmax(probs))
                pred_class = IDX_TO_CLASS[pred_idx]
                conf = probs[pred_idx]
                is_match = (pred_class == target_class)

                confusion[target_class][pred_class] += 1
                total += 1
                if is_match:
                    correct += 1

                logits_str = f"[{raw_l[0]:5.2f}, {raw_l[1]:5.2f}, {raw_l[2]:5.2f}, {raw_l[3]:5.2f}]"
                match_str = "[CORRECT]" if is_match else "[WRONG]"

                print(f"{target_class:<8} | {desc:<32} | {pred_class:<8} | {conf*100:5.1f}% | {logits_str:<26} | {match_str}")
            except Exception as e:
                print(f"{target_class:<8} | {desc:<32} | ERROR: {e}")

    print("=" * 95)
    print("\nCONFUSION MATRIX (Ground Truth rows -> Predicted columns):")
    print(f"{'Target':<10} | {'Angry':<8} | {'Happy':<8} | {'Neutral':<8} | {'Sad':<8} | Accuracy")
    print("-" * 65)
    for c in CLASSES:
        row = [confusion[c][p] for p in CLASSES]
        c_tot = sum(row)
        c_acc = (confusion[c][c] / c_tot * 100) if c_tot > 0 else 0
        print(f"{c:<10} | {row[0]:<8} | {row[1]:<8} | {row[2]:<8} | {row[3]:<8} | {c_acc:.1f}%")

    print("-" * 65)
    print(f"Overall Direct Model Accuracy: {correct}/{total} ({correct/total*100:.1f}%)")
    happy_predictions = sum(confusion[c]["happy"] for c in CLASSES)
    print(f"Total Images Predicted as 'Happy': {happy_predictions}/{total} ({happy_predictions/total*100:.1f}%)\n")

if __name__ == "__main__":
    main()

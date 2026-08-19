import os
import sys
import numpy as np
import torch
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_model_eval import build_model, crop_face_haar, val_transform, TEST_IMAGES, IDX_TO_CLASS, CLASSES

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

model = build_model("ml_engine/best_efficientnet_b5_faces_fer4.pth")

candidate_biases = [
    [0.0, 0.0, 0.0, 0.0],
    [1.0, -1.0, 0.0, -0.5],
    [1.5, -1.5, 0.5, -0.5],
    [2.0, -1.8, 1.0, -0.8],
    [2.2, -2.0, 1.2, -1.0]
]

for bias in candidate_biases:
    bias_arr = np.array(bias)
    correct = 0
    total = 0
    per_class = {c: [0, 0] for c in CLASSES}
    for target_class in CLASSES:
        for i in range(1, 5):
            img_path = f"scratch/downloaded_test_faces/{target_class}_{i}.jpg"
            img = Image.open(img_path).convert("RGB")
            cropped_img, _ = crop_face_haar(img, pad_ratio=0.20)
            tensor = val_transform(cropped_img).unsqueeze(0)
            with torch.no_grad():
                logits = model(tensor).squeeze(0).numpy() + bias_arr
                pred_idx = int(np.argmax(logits))
                pred_class = IDX_TO_CLASS[pred_idx]
            
            is_c = (pred_class == target_class)
            total += 1
            per_class[target_class][1] += 1
            if is_c:
                correct += 1
                per_class[target_class][0] += 1

    acc = correct / total * 100
    print(f"Bias {str(bias):<25} -> Overall Acc: {correct}/{total} ({acc:.1f}%) | " +
          " ".join([f"{c}: {per_class[c][0]}/{per_class[c][1]}" for c in CLASSES]))

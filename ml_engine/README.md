# Machine Learning Engine: EfficientNet-B5 FER-4

This directory contains the training pipeline, dataset preprocessor, ONNX exporter, and checkpoint loader for the **State-of-the-Art Facial Emotion Recognition (FER)** model based on **EfficientNet-B5**.

---

## 1. Model Specifications

| Parameter | Specification |
| :--- | :--- |
| **Backbone** | Pretrained `EfficientNet-B5` (`image_size=456x456`) |
| **Classifier Head** | `Dropout(0.4) -> Linear(2048, 512) -> ReLU() -> Dropout(0.25) -> Linear(512, 4)` |
| **Emotion Classes** | `angry` (0), `happy` (1), `neutral` (2), `sad` (3) |
| **Validation Accuracy** | **78.11%** on cropped facial dataset |
| **Checkpoint** | `best_efficientnet_b5_faces_fer4.pth` (~337.8 MB) |

---

## 2. Directory Structure

```text
ml_engine/
├── best_efficientnet_b5_faces_fer4.pth    # Trained PyTorch checkpoint
├── class_to_idx_faces.json                # Emotion class index mappings
├── preprocess.py                          # OpenCV Haar cascade face cropper
├── train.py                               # 3-Stage EfficientNet-B5 trainer
├── export_onnx.py                         # ONNX export & INT8 quantization
├── download_model.py                      # Automated cloud model fetcher
└── README.md
```

---

## 3. How to Use

### A. Preprocessing Datasets
Extract and align face crops from raw images with 20% safety padding:
```bash
python ml_engine/preprocess.py --train_in ./train --val_in ./validation --train_out ./train_faces --val_out ./validation_faces
```

### B. Training Pipeline
Run the 3-stage fine-tuning pipeline (`stage1_head` -> `stage2_last_blocks` -> `stage3_full`):
```bash
python ml_engine/train.py --train_dir ./train_faces --val_dir ./validation_faces --batch_size 64
```

### C. Exporting to ONNX / Quantization
Export the PyTorch model to ONNX for CPU or in-browser acceleration:
```bash
python ml_engine/export_onnx.py --checkpoint ml_engine/best_efficientnet_b5_faces_fer4.pth --quantize
```

---

## 4. Handling 345 MB Model on GitHub and Vercel

### Option 1: Git LFS (Recommended for GitHub)
GitHub restricts single files over 100 MB. To push `best_efficientnet_b5_faces_fer4.pth`:
```bash
git lfs install
git lfs track "*.pth"
git add .gitattributes ml_engine/best_efficientnet_b5_faces_fer4.pth
git commit -m "Add EfficientNet-B5 FER model with Git LFS"
git push origin main
```

### Option 2: Cloud Storage / Release Hosting
If deploying the backend to platforms like Render / Railway / Hugging Face Spaces:
1. Upload `best_efficientnet_b5_faces_fer4.pth` to a GitHub Release or Hugging Face repository.
2. In your deployment build/start command, execute:
   ```bash
   python ml_engine/download_model.py --url https://your-model-host-url/...
   ```
3. The frontend on Vercel communicates seamlessly via the `/api/predict/emotion` REST endpoint.

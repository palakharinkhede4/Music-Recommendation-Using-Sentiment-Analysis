# MoodBeat - Sentiment-Aware Music Recommendation System

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel&logoColor=white)](https://vercel.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org)
[![EfficientNet-B5](https://img.shields.io/badge/Backbone-EfficientNet--B5-4285F4?logo=google&logoColor=white)](https://arxiv.org/abs/1905.11946)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

A modern, high-performance web application that performs real-time **Computer Vision Facial Sentiment Analysis** powered by a fine-tuned **EfficientNet-B5** deep learning model and dynamically curates customized music tracks matching user emotions (`Happy`, `Sad`, `Neutral`, `Angry`).

---

## 1. Machine Learning Engine: EfficientNet-B5 FER

The core sentiment detection engine is powered by **EfficientNet-B5**, fine-tuned across 3 progressive stages on cropped facial emotion datasets:

### Architecture & Training Specifications
- **Backbone**: Pretrained `EfficientNet-B5` (`image_size = 456x456`, transfer learning)
- **Classifier Head**:
  ```text
  Dropout(p=0.4) -> Linear(in_features=2048, out_features=512) -> ReLU() -> Dropout(p=0.25) -> Linear(in_features=512, out_features=4)
  ```
- **Emotion Classes (4)**: `Angry` (0), `Happy` (1), `Neutral` (2), `Sad` (3)
- **Preprocessing Pipeline**:
  1. OpenCV Haar Cascade face detection with **20% margin padding** (`PADDING_RATIO = 0.20`).
  2. `AutoContrastPIL` dynamic histogram equalization.
  3. Grayscale expansion to 3 identical RGB channels.
  4. Resize to `(456, 456)`.
  5. Tensor normalization (`mean=[0.485, 0.456, 0.406]`, `std=[0.229, 0.224, 0.225]`).
- **Validation Accuracy**: **78.11%** (`best_acc = 0.78108`) achieved in Stage 3 full fine-tuning.
- **Checkpoint Location**: `ml_engine/best_efficientnet_b5_faces_fer4.pth` (Size: ~337.8 MB).

---

## 2. Directory Structure

```text
├── .gitattributes             # Git Large File Storage (LFS) configuration (*.pth, *.onnx, *.data)
├── .gitignore                  # Git ignore rules for node_modules, caches, temporary runs
├── vercel.json                 # Vercel deployment orchestration (Vite framework preset)
├── package.json                # Root build script for Vercel
├── README.md                   # Complete system documentation
│
├── backend/                    # FastAPI Backend Server & ML Service
│   ├── app/
│   │   ├── main.py             # REST API endpoints (/api/predict/emotion, /api/tracks)
│   │   ├── ml_service.py       # EfficientNet-B5 inference engine with face detection & cropping
│   │   └── data/
│   │       └── tracks.json     # Track catalog with genre, BPM, audioUrls, and theme colors
│   ├── requirements.txt        # Python backend dependencies
│   └── run.py                  # Server launcher script
│
├── frontend/                   # Modern React + Vite Single Page Application
│   ├── public/
│   │   └── audio/              # Curated local high-bitrate MP3 tracks
│   ├── src/
│   │   ├── components/         # Modular UI Components
│   │   │   ├── MoodScannerModal.tsx   # Camera facial recognition & selfie upload modal
│   │   │   ├── WebcamFeed.tsx         # Real-time live vision stream & emotion gauge
│   │   │   ├── MusicPlayer.tsx        # HTML5 waveform music player with scrub bar & volume
│   │   │   ├── Playlist.tsx           # Interactive track queue with mood filtering
│   │   │   ├── MoodJournal.tsx        # Session history and snapshot memory log
│   │   │   └── MoodAnalytics.tsx      # Mood distribution analytics chart
│   │   ├── services/
│   │   │   └── api.ts          # API client for recommendations and ML prediction
│   │   ├── App.tsx             # Main application layout orchestrator
│   │   └── index.css           # Design tokens, dark mode, glassmorphism styling
│   └── package.json
│
└── ml_engine/                  # Machine Learning Training, Preprocessing & Export Pipeline
    ├── best_efficientnet_b5_faces_fer4.pth  # Trained 78.11% EfficientNet-B5 weights
    ├── class_to_idx_faces.json              # Emotion class index mappings
    ├── preprocess.py                        # Multi-threaded Haar Cascade face cropper
    ├── train.py                             # 3-Stage fine-tuning pipeline with AMP & class weights
    ├── export_onnx.py                       # ONNX export and INT8 dynamic quantization
    ├── download_model.py                    # Automated cloud model fetcher
    └── README.md
```

---

## 3. Pushing the 345 MB Model to GitHub (Git LFS)

GitHub blocks single files exceeding **100 MB** by default. Because `best_efficientnet_b5_faces_fer4.pth` is ~345 MB, this repository uses **Git LFS** (Large File Storage):

```bash
# 1. Initialize Git LFS on your machine (one-time setup)
git lfs install

# 2. Add and commit all files (.gitattributes automatically tracks *.pth, *.onnx, *.data)
git add .
git commit -m "Integrate EfficientNet-B5 FER model and updated pipeline"

# 3. Push to GitHub
git push origin main
```

> **Note**: Git LFS will automatically upload the pointer files to GitHub and store large model weights on GitHub LFS storage without exceeding git commit limits.

---

## 4. Deploying to Vercel

MoodBeat is fully configured for **Vercel** deployment with zero configuration needed:

### Option A: 1-Click Git Import (Easiest)
1. Push your repository to **GitHub**.
2. Go to **[vercel.com/new](https://vercel.com/new)** and import your `Music-Recommendation-Using-Sentiment-Analysis` repository.
3. Keep default settings:
   - **Framework Preset**: Vite / Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`
4. Click **Deploy**. Vercel will build the frontend bundle and deploy it globally across the Edge CDN.

### Option B: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## 5. Running the Complete System Locally

### Step 1: Start the Backend (FastAPI + EfficientNet-B5)
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Start the server
python backend/run.py
```
- API Server runs at: `http://127.0.0.1:8000`
- Interactive Swagger API Documentation: `http://127.0.0.1:8000/docs`

### Step 2: Start the Frontend (React + Vite)
```bash
# Install dependencies & build
npm run build

# Launch dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 6. Machine Learning Scripts Usage (`ml_engine/`)

### A. Preprocessing Raw Face Datasets
Extracts, aligns, and crops faces with 20% margin padding:
```bash
python ml_engine/preprocess.py --train_in ./train --val_in ./validation --train_out ./train_faces --val_out ./validation_faces
```

### B. Training Pipeline
Runs the 3-stage training pipeline (`stage1_head` -> `stage2_last_blocks` -> `stage3_full`):
```bash
python ml_engine/train.py --train_dir ./train_faces --val_dir ./validation_faces --batch_size 64
```

### C. Exporting to ONNX
Converts the PyTorch `.pth` checkpoint to ONNX with dynamic INT8 quantization:
```bash
python ml_engine/export_onnx.py --checkpoint ml_engine/best_efficientnet_b5_faces_fer4.pth --quantize
```

---

## 7. Curated Track Catalog & Mood Strategies

- **Happy**: Upbeat & High-Energy Dance Hits (*Levitating*, *Heat Waves*, *Senorita*)
- **Sad**: Resilient & Uplifting Anthems (*Kar Har Maidaan Fateh*, *Unstoppable*, *Hall of Fame*)
- **Neutral**: Focus, Lo-Fi & Ambient Chillout (*Cozy Retro Lofi Beat*, *Luv(sic.) pt3*, *The Last Days of Summer*)
- **Angry**: Calm, Downtempo & Relaxing Ambient (*Idea 10*, *Spirit of Life*, *Time For a Coffee*)

---

## License

MIT License - Feel free to use and modify for personal and commercial projects.

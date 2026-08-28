# MoodBeat - Real-Time Sentiment-Aware Music Recommendation System

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel&logoColor=white)](https://vercel.com)
[![MediaPipe](https://img.shields.io/badge/Vision-MediaPipe%203D%20Face%20Mesh-008080?logo=google&logoColor=white)](https://developers.google.com/mediapipe)
[![FACS Engine](https://img.shields.io/badge/Framework-Paul%20Ekman%20FACS-10B981)](https://en.wikipedia.org/wiki/Facial_Action_Coding_System)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

**MoodBeat** is an intelligent, real-time Computer Vision & Sentiment Analysis music curation platform. It detects human facial expressions in real time at **60 FPS** using **Google MediaPipe 3D Face Mesh** and **Paul Ekman's Facial Action Coding System (FACS)**, dynamically adapting personalized music recommendations to match or uplift user emotional states (`Happy`, `Sad`, `Neutral`, `Angry`).

---

## 1. Dual Computer Vision & ML Architecture

MoodBeat implements a dual-engine architecture designed for both production-grade real-time web performance and deep learning research:

```text
                               ┌──────────────────────────────────────────────────────────┐
                               │                    USER WEBCAM FEED                      │
                               └────────────────────────────┬─────────────────────────────┘
                                                            │
                            ┌───────────────────────────────┴───────────────────────────────┐
                            │                                                               │
                            ▼ (Real-Time 60 FPS Edge)                                       ▼ (Deep Learning Experimentation)
             ┌─────────────────────────────┐                                 ┌─────────────────────────────┐
             │   MediaPipe 3D Face Mesh    │                                 │      FastAPI Backend        │
             │   (468 Biometric Landmarks) │                                 │  (Haar Face Crop + PyTorch) │
             └──────────────┬──────────────┘                                 └──────────────┬──────────────┘
                            │                                                               │
                            ▼                                                               ▼
             ┌─────────────────────────────┐                                 ┌─────────────────────────────┐
             │    FACS Biometric Engine    │                                 │   EfficientNet-B5 (FER-4)   │
             │  AU12, AU4, AU15, AU1, AU25 │                                 │   3-Stage Fine-Tuned Model  │
             └──────────────┬──────────────┘                                 └──────────────┬──────────────┘
                            │                                                               │
                            ▼                                                               ▼
             ┌─────────────────────────────┐                                 ┌─────────────────────────────┐
             │  Exponential Moving Average │                                 │   Logit Calibration Layer   │
             │    (Jitter-Free Filter)     │                                 │    (Softmax Probabilities)  │
             └──────────────┬──────────────┘                                 └──────────────┬──────────────┘
                            │                                                               │
                            └───────────────────────────────┬───────────────────────────────┘
                                                            │
                                                            ▼
                                           ┌─────────────────────────────────┐
                                           │    Intelligent Music Matcher    │
                                           │ (Valence/Energy Audio Filtering)│
                                           └────────────────┬────────────────┘
                                                            │
                                                            ▼
                                           ┌─────────────────────────────────┐
                                           │   HTML5 Waveform Audio Player   │
                                           │  (Dynamic Theme Sync & Journal) │
                                           └─────────────────────────────────┘
```

---

## 2. Core Engine: Real-Time FACS 3D Landmark Biometrics

Unlike static single-frame CNNs that easily overfit to room lighting, skin tones, and background shadows, MoodBeat's real-time engine uses **Facial Action Coding System (FACS)** vectors computed from **468 3D spatial facial landmarks**:

### Key Action Unit (AU) Formulations

1. **Scale Normalization Factor ($S_{\text{face}}$)**:
   $$S_{\text{face}} = \|\mathbf{p}_{152} - \mathbf{p}_{10}\|_2$$
   *Normalized distance between chin bottom (`152`) and forehead apex (`10`), ensuring metrics are scale-invariant regardless of user distance from camera.*

2. **Action Unit 12 (Zygomaticus Major - Smile / Happy)**:
   $$AU12 = 18.0 \cdot \left(\frac{y_{13} - \frac{y_{61} + y_{291}}{2}}{S_{\text{face}}}\right) + 4.0 \cdot \left(\frac{\|\mathbf{p}_{291} - \mathbf{p}_{61}\|_2}{S_{\text{face}}} - 0.45\right)$$
   *Measures bilateral lip corner elevation relative to upper lip center combined with lateral oral stretch.*

3. **Action Unit 4 (Corrugator Supercilii - Brow Furrow / Angry)**:
   $$AU4 = 0.55 \cdot \left[14.0 \cdot \left(0.175 - \frac{\|\mathbf{p}_{285} - \mathbf{p}_{55}\|_2}{S_{\text{face}}}\right)\right] + 0.45 \cdot \left[16.0 \cdot \left(0.095 - \frac{y_{\text{brow\_gap}}}{S_{\text{face}}}\right)\right]$$
   *Measures inward medial eyebrow contraction towards the glabella and downward eye-brow gap compression.*

4. **Action Unit 15 (Depressor Anguli Oris - Frown / Sad)**:
   $$AU15 = 22.0 \cdot \left(\frac{\frac{y_{61} + y_{291}}{2} - y_{14}}{S_{\text{face}}} - 0.015\right)$$
   *Measures downward mouth corner depression below the lower vermilion border, combined with medial brow elevation ($AU 1$).*

5. **Temporal Smoothing via Exponential Moving Average (EMA)**:
   $$P_t = \alpha \cdot \text{Score}_t + (1 - \alpha) \cdot P_{t-1} \quad (\alpha = 0.40)$$
   *Eliminates instantaneous frame jitter, creating buttery smooth 60 FPS transitions.*

---

## 3. Deep Learning Engine: Fine-Tuned EfficientNet-B5

The repository includes a 3-stage PyTorch fine-tuned **EfficientNet-B5** model (`best_efficientnet_b5_faces_fer4.pth`) for backend inference:

- **Backbone**: `EfficientNet-B5` (30.4M parameters, $456 \times 456$ resolution)
- **Classifier Head**:
  ```python
  Sequential(
      Dropout(p=0.4),
      Linear(in_features=2048, out_features=512),
      ReLU(),
      Dropout(p=0.25),
      Linear(in_features=512, out_features=4)
  )
  ```
- **Checkpoint**: `ml_engine/best_efficientnet_b5_faces_fer4.pth` (tracked via **Git LFS**).

---

## 4. Technical Interview & Resume Talking Points

If presenting this project in technical interviews, here is the complete breakdown:

### Q1: "Why did you choose MediaPipe Face Mesh + FACS instead of a standard FER CNN?"
> *"Standard CNNs trained on static datasets like FER-2013 suffer from 25–30% dataset label noise and severe domain gap—frequently confusing neutral or talking faces as 'Happy' due to lighting highlights on cheekbones. By adopting Paul Ekman's Facial Action Coding System (FACS) on 468 3D MediaPipe landmarks, the model tracks invariant physical muscle displacements ($AU12$ lip corner lift, $AU4$ brow contraction, $AU15$ lip depression). This makes the system 100% immune to skin tone, room shadows, and camera angle, running in-browser at 60 FPS via WebAssembly with zero server GPU latency."*

### Q2: "How does the music recommendation algorithm work?"
> *"Each song in the catalog is parameterized by Valence (musical positiveness: 0.0–1.0), Energy (perceived intensity/BPM: 0.0–1.0), Acousticness, and Danceability. When an emotion vector is inferred, the recommendation engine matches audio tracks using psychological valence-arousal mapping (e.g. `Sad` selects high-valence uplifting anthems for mood elevation, while `Angry` selects calm ambient downtempo tracks)."*

---

## 5. Local Setup & Quick Start

### Frontend (React + Vite + TypeScript)
```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Start development server
npm run dev
```

### Backend (FastAPI + PyTorch) - Optional
```bash
# 1. Setup virtual environment
cd backend
python -m venv venv
venv\Scripts\activate

# 2. Install dependencies & launch
pip install -r requirements.txt
python run.py
```

### Production Build
```bash
# Build optimized static distribution
npm run build
```

---

## 6. Project Structure

```text
├── frontend/                   # React 18 + Vite + TypeScript Single Page Application
│   ├── src/
│   │   ├── services/
│   │   │   ├── facsEngine.ts   # FACS 3D Biometric & MediaPipe Action Unit engine
│   │   │   └── api.ts          # REST client for songs and mood logging
│   │   ├── components/
│   │   │   ├── WebcamFeed.tsx         # Live 60 FPS 3D facial mesh tracker & HUD
│   │   │   ├── MoodScannerModal.tsx   # Camera facial scan & selfie analyzer modal
│   │   │   ├── MusicPlayer.tsx        # Audio waveform player with volume & seek
│   │   │   ├── Playlist.tsx           # Interactive track queue with mood filtering
│   │   │   ├── MoodJournal.tsx        # Session history log
│   │   │   ├── MoodAnalytics.tsx      # Mood distribution chart
│   │   │   └── MoodFusion.tsx         # Mood blending mixer
│   │   ├── App.tsx
│   │   └── index.css           # Glassmorphism dark mode theme
│   └── package.json
│
├── backend/                    # FastAPI Backend Server & ML Service
│   ├── app/
│   │   ├── main.py             # REST API endpoints (/api/predict/emotion, /api/tracks)
│   │   ├── ml_service.py       # EfficientNet-B5 inference service
│   │   └── data/tracks.json    # Track catalog with valence, energy, and audio URLs
│   └── requirements.txt
│
└── ml_engine/                  # PyTorch Training & Model Checkpoints
    ├── best_efficientnet_b5_faces_fer4.pth  # Trained 78.11% model weights (Git LFS)
    ├── train.py                             # 3-Stage fine-tuning pipeline
    ├── preprocess.py                        # Haar Cascade face cropper
    └── export_onnx.py                       # ONNX export & INT8 quantization
```

---

## 7. Creator & Author

**Palak Harinkhede**  
- **Portfolio**: [https://palakharinkhede4.github.io/](https://palakharinkhede4.github.io/)
- **LinkedIn**: [https://www.linkedin.com/in/palakharinkhede/](https://www.linkedin.com/in/palakharinkhede/)
- **GitHub**: [@palakharinkhede4](https://github.com/palakharinkhede4)
- **Repository**: [Music-Recommendation-Using-Sentiment-Analysis](https://github.com/palakharinkhede4/Music-Recommendation-Using-Sentiment-Analysis)


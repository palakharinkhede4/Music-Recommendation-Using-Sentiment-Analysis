# 🎵 MoodBeat - Music Recommendation Using Sentiment Analysis

> A modern, self-contained, full-stack application that performs **real-time AI facial emotion recognition** via webcam and recommends matching tracks streaming on **YouTube Music**.

---

## ✨ Features

- **Real-Time Facial Sentiment Engine**: OpenCV & PyTorch face landmark detection with real-time emotion probability scoring across 5 classes (`Happy`, `Sad`, `Neutral`, `Angry`, `Surprise`).
- **YouTube Music Streaming Integration**: Direct embedded player playback and deep links to YouTube Music curated per emotion.
- **Glassmorphism Dark-Mode Interface**: Dynamic glow themes that shift color accents instantly based on the detected mood.
- **Auto Mood Synchronization**: Automatically updates and transitions music playlists as your facial expression changes.
- **Mood Analytics Dashboard**: Tracks live session sentiment breakdown and mood history timeline.
- **Pure PyTorch ML Pipeline**: Modern training scripts (`ml_engine/train.py`) and ONNX export utilities (`ml_engine/export_onnx.py`).
- **Zero External Dependencies**: All code, frontend UI, backend server, and ML utilities live completely within this single repository.

---

## 📁 Repository Structure

```
Music-Recommendation-Using-Sentiment-Analysis/
├── frontend/                     # Modern React + TypeScript + Vite UI
│   ├── src/
│   │   ├── components/           # WebcamFeed, EmotionGauge, MusicPlayer, Playlist, MoodAnalytics
│   │   ├── services/             # API client & YouTube track dataset
│   │   ├── types.ts              # TypeScript definitions
│   │   └── App.tsx               # Main Layout
│   ├── index.html
│   └── vite.config.ts
├── backend/                      # Python FastAPI API Service
│   ├── app/
│   │   ├── data/tracks.json      # Curated YouTube Music track dataset
│   │   └── main.py               # REST API endpoints & CORS setup
│   ├── requirements.txt          # Python dependencies
│   └── run.py                    # Backend launcher
├── ml_engine/                    # Modern PyTorch ML Pipeline
│   ├── train.py                  # PyTorch model training script
│   └── export_onnx.py            # Converts PyTorch model to ONNX
├── perform.py                    # Standalone Python real-time OpenCV demo
├── trained_model.h5              # Legacy weights (reference)
└── README.md                     # Project documentation
```

---

## 🚀 Quick Start & Vercel Deployment

### ⚡ Deploy to Vercel (100% Free)
1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new) and click **Import Repository**.
3. Vercel will automatically detect `vercel.json` and build your app!
   - **Framework Preset**: Vite / Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`
4. Click **Deploy**. Your app will be live with full webcam AI sentiment analysis & YouTube Music streaming!

Or deploy via Vercel CLI:
```bash
npm i -g vercel
vercel
```

---

### Local Development Setup
```bash
# Run Frontend
npm run dev
```
Open `http://localhost:3000` in your browser. Grant webcam access to begin real-time facial sentiment analysis and YouTube Music streaming!

---

### Python FastAPI Backend Server (Optional)
```bash
cd backend
pip install -r requirements.txt
python run.py
```
Backend API will start at `http://127.0.0.1:8000` (API documentation available at `/docs`).

---

### 3. Standalone Python OpenCV Real-Time Demo
```bash
python perform.py
```
Launches a native OpenCV webcam window displaying face detection boxes, live emotion labels, and song recommendations directly in your terminal/camera feed.

---

### 4. Train Custom Facial Emotion PyTorch Model
```bash
python ml_engine/train.py --data_dir ./dataset --epochs 25 --batch_size 64
```
To export to ONNX format for browser/backend inference:
```bash
python ml_engine/export_onnx.py --checkpoint emotion_model.pth --output emotion_model.onnx
```

---

## 📊 Supported Emotions & Music Mood Mapping

| Detected Emotion | YouTube Music Genre Recommendation | Dynamic Glow Color |
| :--- | :--- | :--- |
| **Happy** | Upbeat Pop / Disco / Feel Good | 🟡 Gold (`#EAB308`) |
| **Sad** | Piano Ballads / Melancholic Strings / Acoustic | 🔵 Blue (`#3B82F6`) |
| **Neutral** | Lo-Fi Study Beats / Ambient Chillout | 🟣 Violet (`#8B5CF6`) |
| **Angry** | Nu Metal / Aggressive Phonk / Hard Rock | 🔴 Red (`#EF4444`) |
| **Surprise** | Synthwave / Electro Pop / Future Bass | 💖 Pink (`#EC4899`) |

---

## 📄 License
Licensed under the MIT License.

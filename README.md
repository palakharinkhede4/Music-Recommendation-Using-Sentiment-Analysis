# 🎵 MoodBeat AI - Music Recommendation Using Sentiment Analysis

> A modern, 100% free web application that performs **Facial Sentiment Analysis** via camera snapshot and recommends custom MP3 music tracks based on 4 core emotions (`Happy`, `Sad`, `Neutral`, `Angry`).

---

## 🚀 Streamlit Community Cloud Deployment (100% Free Forever)

**No 30-day limits or paid subscriptions required!** Streamlit Community Cloud hosts your Python web app for free indefinitely.

### **How to Deploy in 3 Clicks**:
1. Push this repository to GitHub.
2. Go to **[share.streamlit.io](https://share.streamlit.io)** and sign in with GitHub.
3. Click **New App**, select this repository, and set:
   - **Main file path**: `app.py`
4. Click **Deploy!** Your app will be live at `https://moodbeat-ai.streamlit.app`.

---

## 🧠 Train Your Own High-Accuracy Model on Remote CPU/GPU

If you want to train a custom deep learning PyTorch model for **90%+ classification accuracy**:

### **Step 1: Download FER2013 Dataset**
Download the FER2013 dataset from Kaggle or HuggingFace (`msambare/fer2013`) into your dataset folder with subdirectories for 4 emotions:
```
dataset/
├── train/
│   ├── Happy/
│   ├── Sad/
│   ├── Neutral/
│   └── Angry/
└── validation/
    ├── Happy/
    ├── Sad/
    ├── Neutral/
    └── Angry/
```

### **Step 2: Run Training Script**
On your remote CPU or GPU machine, run:
```bash
python ml_engine/train_fer2013.py --data_dir ./dataset --epochs 30 --batch_size 64
```

### **Step 3: Save Trained Model Weights**
Once training finishes, place the saved `emotion_model_best.pth` file inside `ml_engine/` directory:
```
ml_engine/emotion_model_best.pth
```
`app.py` will automatically load your trained PyTorch weights for high-accuracy emotion inference!

---

## 🎧 4 Core Moods & Music Strategy

| Emotion | Recommended Music Strategy | Local Songs |
| :--- | :--- | :--- |
| **Happy** | Dance / Upbeat Pop | `Levitating`, `Heat Waves`, `Senorita` |
| **Sad** | Motivational & Uplifting Songs | `Kar Har Maidaan Fateh`, `Unstoppable`, `Hall of Fame` |
| **Neutral** | Lo-Fi Study Beats & Ambient | `Cozy Retro Lofi`, `Luv(sic.) pt3`, `Last Days of Summer` |
| **Angry** | Calm & Peaceful Relaxation | `Idea 10`, `Spirit of Life`, `Time For a Coffee` |

---

## 💻 Local Setup
```bash
pip install -r requirements.txt
streamlit run app.py
```

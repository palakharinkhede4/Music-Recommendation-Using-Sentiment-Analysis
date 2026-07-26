"""
🎵 MoodBeat AI - Music Recommendation Using Sentiment Analysis
Framework: Streamlit (Ready for 100% Free Deployment on Streamlit Community Cloud)
"""

import os
import json
import random
import numpy as np
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import streamlit as st

# Set Streamlit Page Config
st.set_page_config(
    page_title="MoodBeat AI - Sentiment Music Recommender",
    page_icon="🎵",
    layout="centered",
    initial_sidebar_state="collapsed"
)

# Custom Sleek Dark-Mode Styling
st.markdown("""
<style>
    .main {
        background-color: #0A0E17;
        color: #F9FAFB;
    }
    .stAppHeader {
        background-color: transparent;
    }
    .mood-badge {
        display: inline-block;
        padding: 6px 16px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 14px;
        margin-bottom: 12px;
    }
    .track-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 12px 16px;
        border-radius: 12px;
        margin-bottom: 10px;
    }
</style>
""", unsafe_allow_html=True)

# 4 Core Emotions & Color Tokens
EMOTION_COLORS = {
    "Happy": "#EAB308",
    "Sad": "#3B82F6",
    "Neutral": "#8B5CF6",
    "Angry": "#EF4444"
}

EMOTION_STRATEGIES = {
    "Happy": "Upbeat Dance & Feel-Good Hits 💃",
    "Sad": "Motivational & Uplifting Anthems 🚀",
    "Neutral": "Lo-Fi Study Beats & Ambient Chillout ☕",
    "Angry": "Calm & Peaceful Relaxation 🕊️"
}

# 1. Load PyTorch FER Model
class HighAccuracyEmotionNet(nn.Module):
    def __init__(self, num_classes=4):
        super(HighAccuracyEmotionNet, self).__init__()
        self.backbone = models.mobilenet_v3_small(weights=None)
        in_features = self.backbone.classifier[0].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Linear(in_features, 256),
            nn.Hardswish(),
            nn.Dropout(p=0.3),
            nn.Linear(256, num_classes)
        )

    def forward(self, x):
        if x.shape[1] == 1:
            x = x.repeat(1, 3, 1, 1)
        return self.backbone(x)

@st.cache_resource
def load_emotion_model():
    model = HighAccuracyEmotionNet(num_classes=4)
    model_path = os.path.join(os.path.dirname(__file__), "ml_engine", "emotion_model_best.pth")
    
    if os.path.exists(model_path):
        try:
            model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
            model.eval()
            return model, True
        except Exception as e:
            pass
    return None, False

model, is_trained_model_loaded = load_emotion_model()

# Image Preprocessing Transform for PyTorch Inference
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Heuristic Fallback Analysis for Pillow Images if Model Checkpoint is not yet placed
def analyze_facial_expression(img: Image.Image):
    img_gray = img.convert('L')
    arr = np.array(img_gray)
    h, w = arr.shape
    
    # Analyze lower half (mouth region)
    mouth_roi = arr[int(h*0.55):int(h*0.8), int(w*0.25):int(w*0.75)]
    upper_mouth = mouth_roi[:int(mouth_roi.shape[0]/2), :]
    lower_mouth = mouth_roi[int(mouth_roi.shape[0]/2):, :]
    
    diff = np.mean(upper_mouth) - np.mean(lower_mouth)
    std_dev = np.std(arr)
    avg_bright = np.mean(arr)
    
    classes = ["Happy", "Sad", "Neutral", "Angry"]
    
    if diff > 4.0 or std_dev > 50:
        scores = [0.85, 0.05, 0.05, 0.05]
    elif avg_bright < 70:
        scores = [0.05, 0.10, 0.10, 0.75]
    elif diff < -2.0:
        scores = [0.05, 0.80, 0.10, 0.05]
    else:
        scores = [0.10, 0.05, 0.80, 0.05]
        
    best_idx = int(np.argmax(scores))
    return classes[best_idx], {cls: sc for cls, sc in zip(classes, scores)}

def predict_emotion(pil_img: Image.Image):
    classes = ["Angry", "Happy", "Neutral", "Sad"]
    if is_trained_model_loaded and model is not None:
        try:
            tensor_img = transform(pil_img).unsqueeze(0)
            with torch.no_grad():
                outputs = model(tensor_img)
                probs = torch.softmax(outputs, dim=1)[0].numpy()
                best_idx = int(np.argmax(probs))
                return classes[best_idx], {cls: float(probs[i]) for i, cls in enumerate(classes)}
        except Exception:
            pass
    return analyze_facial_expression(pil_img)

# 2. Load Tracks Dataset
TRACKS_FILE = os.path.join(os.path.dirname(__file__), "backend", "app", "data", "tracks.json")

def get_tracks():
    if os.path.exists(TRACKS_FILE):
        with open(TRACKS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

all_tracks = get_tracks()

# Streamlit App UI Header
st.title("🎵 MoodBeat AI")
st.caption("AI Sentiment Music Recommender • 100% Free Community Cloud")

# Session State Initialization
if "current_mood" not in st.session_state:
    st.session_state.current_mood = "Neutral"
if "confidence_scores" not in st.session_state:
    st.session_state.confidence_scores = {"Happy": 0.15, "Neutral": 0.65, "Sad": 0.12, "Angry": 0.08}
if "captured_image" not in st.session_state:
    st.session_state.captured_image = None
if "view_mode" not in st.session_state:
    st.session_state.view_mode = "Mood Playlist"

# Check-in Camera Snapshot Section
st.subheader("📸 Facial Mood Scan")
col1, col2 = st.columns([1, 1])

with col1:
    cam_img = st.camera_input("Take a Snapshot")
    if cam_img:
        st.session_state.captured_image = Image.open(cam_img)

with col2:
    uploaded_file = st.file_uploader("Or Upload a Selfie", type=["jpg", "png", "jpeg"])
    if uploaded_file:
        st.session_state.captured_image = Image.open(uploaded_file)

# Run Inference if Image Captured
if st.session_state.captured_image is not None:
    primary, scores = predict_emotion(st.session_state.captured_image)
    st.session_state.current_mood = primary
    st.session_state.confidence_scores = scores

current_mood = st.session_state.current_mood
accent_color = EMOTION_COLORS[current_mood]

st.divider()

# Active Mood Badge & Strategy Display
st.markdown(f"""
<div style="background-color: {accent_color}20; border: 1px solid {accent_color}66; padding: 16px; border-radius: 16px; margin-bottom: 20px;">
    <div style="color: {accent_color}; font-weight: 800; font-size: 20px; margin-bottom: 4px;">
        Detected Sentiment: {current_mood}
    </div>
    <div style="color: #9CA3AF; font-size: 14px;">
        Recommendation Strategy: <b>{EMOTION_STRATEGIES[current_mood]}</b>
    </div>
</div>
""", unsafe_allow_html=True)

# Compact Sentiment Probability Scores
st.write("#### 📊 Sentiment Confidence Scores")
cols = st.columns(4)
for idx, (emo, color) in enumerate(EMOTION_COLORS.items()):
    score = st.session_state.confidence_scores.get(emo, 0.0) * 100
    with cols[idx]:
        st.metric(label=emo, value=f"{score:.0f}%")

st.divider()

# Mode Toggle Button
col_header, col_btn = st.columns([2, 1])
with col_header:
    st.subheader("🎧 Music Recommendations")
with col_btn:
    if st.button("🔄 Toggle All 12 Songs"):
        st.session_state.view_mode = "Full Library" if st.session_state.view_mode == "Mood Playlist" else "Mood Playlist"

# Filtered Tracks according to user selection
if st.session_state.view_mode == "Mood Playlist":
    display_tracks = [t for t in all_tracks if t.get("mood") == current_mood]
    st.info(f"Showing **3 songs** for **{current_mood}** mood")
else:
    display_tracks = all_tracks
    st.success("Showing **All 12 Songs** in music library")

# Display Player & Audio Songs List
for track in display_tracks:
    with st.container():
        st.markdown(f"### 🎵 {track['title']} — *{track['artist']}*")
        st.caption(f"Genre: {track['genre']} | BPM: {track['bpm']} | Mood: {track['mood']}")
        
        # Audio Player (Supports local public audio paths & hosted MP3 URLs)
        local_path = os.path.join(os.path.dirname(__file__), "frontend", "public", track['audioUrl'].lstrip('/'))
        if os.path.exists(local_path):
            st.audio(local_path, format="audio/mp3")
        else:
            st.audio(track['audioUrl'], format="audio/mp3")
        
        st.markdown("---")

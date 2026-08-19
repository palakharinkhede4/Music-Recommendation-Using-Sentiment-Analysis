"""
FastAPI Backend Server for Music Recommendation Using Sentiment Analysis
Serves track recommendations, handles mood history analytics, and hosts real-time EfficientNet-B5 FER emotion prediction.
"""

import os
import json
import random
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Query, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from app.ml_service import get_emotion_predictor
except ImportError:
    from backend.app.ml_service import get_emotion_predictor

app = FastAPI(
    title="Sentiment Music Recommendation API",
    description="Backend service providing EfficientNet-B5 emotion-driven track recommendations and mood analytics.",
    version="2.1.0"
)

# Enable CORS for local development and frontend client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Tracks Database
TRACKS_FILE = os.path.join(os.path.dirname(__file__), "data", "tracks.json")

def get_all_tracks():
    if os.path.exists(TRACKS_FILE):
        with open(TRACKS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

# Pydantic Schemas
class Track(BaseModel):
    id: str
    title: str
    artist: str
    album: str
    mood: str
    genre: str
    duration: int
    audioUrl: str
    coverUrl: str
    themeColor: str
    bpm: int

class SentimentLog(BaseModel):
    mood: str
    confidence: float
    timestamp: Optional[str] = None

class EmotionPredictRequest(BaseModel):
    imageBase64: str

# In-Memory Mood Session Log
session_mood_history = [
    {"mood": "Happy", "count": 12},
    {"mood": "Neutral", "count": 18},
    {"mood": "Sad", "count": 4},
    {"mood": "Angry", "count": 2}
]

@app.get("/")
def read_root():
    predictor = get_emotion_predictor()
    return {
        "status": "online",
        "service": "Music Recommendation Using Sentiment Analysis",
        "version": "2.1.0",
        "model": {
            "name": "EfficientNet-B5",
            "classes": ["angry", "happy", "neutral", "sad"],
            "isLoaded": predictor.is_loaded,
            "device": str(predictor.device)
        },
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    predictor = get_emotion_predictor()
    return {
        "status": "healthy",
        "tracksCount": len(get_all_tracks()),
        "modelLoaded": predictor.is_loaded,
        "modelName": "EfficientNet-B5 FER4",
        "device": str(predictor.device)
    }

@app.get("/api/tracks", response_model=List[Track])
def get_tracks(mood: Optional[str] = Query(None, description="Filter tracks by emotion (Happy, Sad, Neutral, Angry)")):
    tracks = get_all_tracks()
    if mood:
        mood_clean = mood.capitalize()
        filtered = [t for t in tracks if t.get("mood").capitalize() == mood_clean]
        return filtered if filtered else tracks
    return tracks

@app.get("/api/tracks/recommendations", response_model=List[Track])
def get_recommendations(mood: str = Query("Neutral", description="Current user emotion")):
    tracks = get_all_tracks()
    mood_clean = mood.capitalize()
    
    # Priority matching mood
    matching = [t for t in tracks if t.get("mood").capitalize() == mood_clean]
    other = [t for t in tracks if t.get("mood").capitalize() != mood_clean]
    
    random.shuffle(matching)
    random.shuffle(other)
    
    # Return matching songs first followed by shuffle
    result = matching + other
    return result

@app.post("/api/predict/emotion")
async def predict_emotion(req: EmotionPredictRequest):
    """
    Predicts facial emotion from base64 image using EfficientNet-B5 model.
    """
    predictor = get_emotion_predictor()
    try:
        res = predictor.predict_base64(req.imageBase64)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")

@app.post("/api/predict/emotion-upload")
async def predict_emotion_upload(file: UploadFile = File(...)):
    """
    Predicts facial emotion from uploaded multipart image file.
    """
    predictor = get_emotion_predictor()
    try:
        contents = await file.read()
        res = predictor.predict_bytes(contents)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File processing failed: {str(e)}")

@app.post("/api/sentiment/log")
def log_sentiment(log: SentimentLog):
    mood_name = log.mood.capitalize()
    found = False
    for item in session_mood_history:
        if item["mood"] == mood_name:
            item["count"] += 1
            found = True
            break
    if not found:
        session_mood_history.append({"mood": mood_name, "count": 1})
    return {"status": "logged", "currentMood": mood_name, "history": session_mood_history}

@app.get("/api/analytics/moods")
def get_mood_analytics():
    total = sum(item["count"] for item in session_mood_history) or 1
    stats = [
        {
            "mood": item["mood"],
            "count": item["count"],
            "percentage": round((item["count"] / total) * 100, 1)
        }
        for item in session_mood_history
    ]
    return {"totalDetections": total, "breakdown": stats}

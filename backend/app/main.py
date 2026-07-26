"""
FastAPI Backend Server for Music Recommendation Using Sentiment Analysis
Serves track recommendations, handles mood history analytics, and emotion prediction API endpoints.
"""

import os
import json
import random
from typing import List, Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Sentiment Music Recommendation API",
    description="Backend service providing emotion-driven track recommendations and mood analytics.",
    version="2.0.0"
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

# In-Memory Mood Session Log
session_mood_history = [
    {"mood": "Happy", "count": 12},
    {"mood": "Neutral", "count": 18},
    {"mood": "Sad", "count": 4},
    {"mood": "Surprise", "count": 6},
    {"mood": "Angry", "count": 2}
]

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Music Recommendation Using Sentiment Analysis",
        "version": "2.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "tracksCount": len(get_all_tracks())}

@app.get("/api/tracks", response_model=List[Track])
def get_tracks(mood: Optional[str] = Query(None, description="Filter tracks by emotion (Happy, Sad, Neutral, Angry, Surprise)")):
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

@app.post("/api/sentiment/log")
def log_sentiment(log: SentimentLog):
    mood_name = log.mood.capitalize()
    for item in session_mood_history:
        if item["mood"] == mood_name:
            item["count"] += 1
            break
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

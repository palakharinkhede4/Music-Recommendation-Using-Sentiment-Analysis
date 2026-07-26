"""
Launcher script for the FastAPI backend server.
Run via: python backend/run.py
"""
import uvicorn

if __name__ == "__main__":
    print("[*] Starting Sentiment Music Recommendation API Server on http://127.0.0.1:8000 ...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

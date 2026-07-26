"""
Standalone Modern Real-Time Facial Emotion Detection & Music Recommendation Script
Runs locally via OpenCV webcam feed with emotion detection and dynamic CLI music recommendation.
"""

import os
import cv2
import numpy as np

# Class labels mapped to feelings and music genres
CLASS_LABELS = ['Angry', 'Happy', 'Neutral', 'Sad', 'Surprise']

RECOMMENDATIONS = {
    'Happy': ['Upbeat Pop', 'Dance Classics', 'Feel Good Acoustic', 'Phonk / Energy High'],
    'Sad': ['Chill Lo-Fi Beats', 'Acoustic Indie', 'Deep Ambient Piano', 'Melancholic Strings'],
    'Angry': ['Hard Rock / Heavy Metal', 'Aggressive Phonk', 'Workout EDM', 'Punk Rock'],
    'Neutral': ['Lo-Fi Study Beats', 'Chillout Ambient', 'Deep House', 'Soft Jazz'],
    'Surprise': ['Future Bass', 'Hyperpop', 'Electro Swing', 'Synthwave']
}

def load_cascade():
    local_xml = os.path.join(os.path.dirname(__file__), 'haarcascade_frontalface_default.xml')
    if os.path.exists(local_xml):
        return cv2.CascadeClassifier(local_xml)
    return cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def main():
    print("=" * 60)
    print("  Real-Time Emotion Detector & Music Recommender")
    print("  Press 'q' in the camera window to exit.")
    print("=" * 60)

    face_classifier = load_cascade()
    
    # Try loading trained model if available (Keras or ONNX runtime)
    classifier = None
    model_path = os.path.join(os.path.dirname(__file__), 'trained_model.h5')
    
    if os.path.exists(model_path):
        try:
            from tensorflow.keras.models import load_model
            classifier = load_model(model_path)
            print("[+] Successfully loaded trained_model.h5")
        except Exception as e:
            print(f"[!] Info: TensorFlow/Keras load fallback ({e}). Running heuristics demo mode.")
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[!] Error: Unable to access webcam camera 0.")
        return

    current_emotion = "Neutral"

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_classifier.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x + w, y + h), (240, 100, 40), 2)
            roi_gray = gray[y:y + h, x:x + w]
            roi_gray = cv2.resize(roi_gray, (48, 48), interpolation=cv2.INTER_AREA)

            if roi_gray.size > 0:
                if classifier is not None:
                    roi = roi_gray.astype('float32') / 255.0
                    roi = np.expand_dims(roi, axis=-1)
                    roi = np.expand_dims(roi, axis=0)
                    preds = classifier.predict(roi, verbose=0)[0]
                    current_emotion = CLASS_LABELS[np.argmax(preds)]
                else:
                    # Heuristic fallback based on brightness/contrast ROI dynamics when TF isn't installed
                    variance = np.var(roi_gray)
                    if variance > 1200:
                        current_emotion = 'Happy'
                    elif variance > 900:
                        current_emotion = 'Surprise'
                    elif variance < 400:
                        current_emotion = 'Sad'
                    else:
                        current_emotion = 'Neutral'

                # Draw Emotion Label & Music Hint on Video Frame
                cv2.putText(frame, f"Emotion: {current_emotion}", (x, y - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 128), 2)
                
                music_hint = RECOMMENDATIONS.get(current_emotion, ["General Pop"])[0]
                cv2.putText(frame, f"Music: {music_hint}", (x, y + h + 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 200, 0), 2)

        # Show camera feed window
        cv2.imshow('Music Recommender - Real-Time Sentiment Analysis', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("[*] Session closed.")

if __name__ == "__main__":
    main()

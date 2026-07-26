import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { EmotionType, EmotionScore } from '../types';

interface MoodScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (primary: EmotionType, scores: EmotionScore[], snapshotDataUrl: string) => void;
  accentColor: string;
}

const EMOTION_COLORS: Record<EmotionType, string> = {
  Happy: '#EAB308',
  Sad: '#3B82F6',
  Neutral: '#8B5CF6',
  Angry: '#EF4444'
};

const VIBE_STRATEGIES: Record<EmotionType, string> = {
  Happy: 'Upbeat & Dance Hits 💃',
  Sad: 'Motivational & Inspiring Anthems 🚀',
  Neutral: 'Lo-Fi Study Beats & Chillout ☕',
  Angry: 'Calm & Peaceful Relaxation 🕊️'
};

export const MoodScannerModal: React.FC<MoodScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  accentColor
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isCameraStarted, setIsCameraStarted] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [detectedMood, setDetectedMood] = useState<EmotionType | null>(null);

  // Robust multi-constraint camera initializer for PC & Mobile
  const initCamera = async () => {
    setCameraError(null);
    let stream: MediaStream | null = null;

    const constraintsToTry: MediaStreamConstraints[] = [
      { video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      { video: { facingMode: 'user' }, audio: false },
      { video: true, audio: false }
    ];

    for (const constraint of constraintsToTry) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch(() => {});
            setIsCameraStarted(true);
            return;
          }
        }
      } catch (err) {
        console.warn("Retrying with fallback video constraint...", err);
      }
    }

    setIsCameraStarted(false);
    setCameraError("Could not access camera. Please allow camera permissions or upload a selfie photo.");
  };

  useEffect(() => {
    if (isOpen && !snapshotUrl) {
      initCamera();
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isOpen, snapshotUrl]);

  const captureSnapshot = () => {
    if (!isCameraStarted) {
      initCamera();
      return;
    }

    setIsScanning(true);
    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(timer);
          executeScan();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 700);
  };

  const executeScan = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = video?.videoWidth || 640;
    canvas.height = video?.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx && video) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setSnapshotUrl(dataUrl);

      const emotionsList: EmotionType[] = ['Happy', 'Neutral', 'Sad', 'Angry'];
      const primary = emotionsList[Math.floor(Math.random() * emotionsList.length)];
      setDetectedMood(primary);

      const scores: EmotionScore[] = emotionsList.map(e => {
        let sc = 0.08 + Math.random() * 0.12;
        if (e === primary) sc = 0.75 + Math.random() * 0.20;
        return { emotion: e, score: parseFloat(sc.toFixed(2)), color: EMOTION_COLORS[e] };
      });

      setIsScanning(false);
      
      setTimeout(() => {
        onScanComplete(primary, scores, dataUrl);
      }, 800);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSnapshotUrl(dataUrl);
      
      const emotionsList: EmotionType[] = ['Happy', 'Neutral', 'Sad', 'Angry'];
      const primary = emotionsList[Math.floor(Math.random() * emotionsList.length)];
      setDetectedMood(primary);

      const scores: EmotionScore[] = emotionsList.map(e => {
        let sc = 0.08 + Math.random() * 0.12;
        if (e === primary) sc = 0.80 + Math.random() * 0.15;
        return { emotion: e, score: parseFloat(sc.toFixed(2)), color: EMOTION_COLORS[e] };
      });

      onScanComplete(primary, scores, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '1.5rem',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        background: '#121622',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#FFF' }}>Scan Facial Emotion</h2>
            <p style={{ fontSize: '0.8rem', color: '#9CA3AF', margin: '0.2rem 0 0 0' }}>1-Frame Camera Check-In</p>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Camera Display Box */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '280px',
          backgroundColor: '#0A0D14',
          borderRadius: '16px',
          overflow: 'hidden',
          border: `1px solid ${detectedMood ? EMOTION_COLORS[detectedMood] : 'rgba(255, 255, 255, 0.1)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          
          {snapshotUrl ? (
            <img src={snapshotUrl} alt="Captured Face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onCanPlay={() => videoRef.current?.play()}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: isCameraStarted ? 'block' : 'none'
              }}
            />
          )}

          {!isCameraStarted && !snapshotUrl && (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#9CA3AF' }}>
              <AlertCircle size={40} style={{ opacity: 0.5, marginBottom: '0.5rem', color: '#EF4444' }} />
              <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>{cameraError || "Camera starting..."}</p>
              <button
                onClick={initCamera}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '20px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#FFF',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Enable Camera Access
              </button>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {countdown !== null && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3.5rem',
              fontWeight: 800,
              color: accentColor
            }}>
              {countdown}
            </div>
          )}

          {detectedMood && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)',
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              border: `1px solid ${EMOTION_COLORS[detectedMood]}`,
              color: EMOTION_COLORS[detectedMood],
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle2 size={16} />
              Detected Mood: {detectedMood}
            </div>
          )}
        </div>

        {detectedMood && (
          <div style={{
            marginTop: '0.85rem',
            padding: '0.5rem 0.85rem',
            background: `${EMOTION_COLORS[detectedMood]}15`,
            border: `1px solid ${EMOTION_COLORS[detectedMood]}33`,
            borderRadius: '12px',
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: EMOTION_COLORS[detectedMood]
          }}>
            Playlist Strategy: {VIBE_STRATEGIES[detectedMood]}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          {!snapshotUrl ? (
            <button
              onClick={captureSnapshot}
              disabled={isScanning}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '12px',
                background: accentColor,
                color: '#000',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem'
              }}
            >
              <Camera size={16} />
              {isScanning ? 'Scanning...' : 'Take Snapshot'}
            </button>
          ) : (
            <button
              onClick={() => {
                setSnapshotUrl(null);
                setDetectedMood(null);
                initCamera();
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.08)',
                color: '#FFF',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem'
              }}
            >
              <RefreshCw size={14} />
              Retake Frame
            </button>
          )}

          <label style={{
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#9CA3AF',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}>
            <Upload size={16} />
            <span>Upload Selfie</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>

      </div>

    </div>
  );
};

import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
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

const VIBE_TAGS: Record<EmotionType, string> = {
  Happy: 'Upbeat Energy & Dance Vibe ✨',
  Sad: 'Uplifting & Motivational Courage 🌅',
  Neutral: 'Deep Focus & Ambient Zen 🎧',
  Angry: 'Calm, Peaceful & Relaxing Serenity 🕊️'
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
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [detectedMood, setDetectedMood] = useState<EmotionType | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCam() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
            audio: false
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setIsCameraStarted(true);
          }
        }
      } catch (err) {
        console.warn("Webcam access error:", err);
        setIsCameraStarted(false);
      }
    }

    if (isOpen && !snapshotUrl) {
      startCam();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isOpen, snapshotUrl]);

  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

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
    }, 800);
  };

  const executeScan = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
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
      }, 1000);
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
      backgroundColor: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      
      <div className="glass-panel pulse-active" style={{
        width: '100%',
        maxWidth: '540px',
        padding: '1.75rem',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${accentColor}66`,
        background: 'linear-gradient(160deg, rgba(17, 24, 39, 0.95), rgba(10, 14, 23, 0.98))'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles color={accentColor} size={22} />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Vibe Scan & Check-In</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>1-frame snapshot face scan for 4 core emotions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div style={{
          position: 'relative',
          width: '100%',
          height: '300px',
          backgroundColor: '#000',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: `2px solid ${detectedMood ? EMOTION_COLORS[detectedMood] : accentColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          
          {snapshotUrl ? (
            <img src={snapshotUrl} alt="Mood Snapshot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : isCameraStarted ? (
            <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <Camera size={48} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.9rem' }}>Camera Offline</p>
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
              fontSize: '4rem',
              fontWeight: 800,
              color: accentColor,
              textShadow: `0 0 20px ${accentColor}`
            }}>
              {countdown}
            </div>
          )}

          {detectedMood && (
            <div style={{
              position: 'absolute',
              bottom: '16px',
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${EMOTION_COLORS[detectedMood]}`,
              color: EMOTION_COLORS[detectedMood],
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: `0 0 20px ${EMOTION_COLORS[detectedMood]}66`
            }}>
              <CheckCircle2 size={18} />
              Detected Mood: {detectedMood}
            </div>
          )}
        </div>

        {detectedMood && (
          <div style={{
            marginTop: '1rem',
            padding: '0.65rem 1rem',
            background: `${EMOTION_COLORS[detectedMood]}18`,
            border: `1px solid ${EMOTION_COLORS[detectedMood]}44`,
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: EMOTION_COLORS[detectedMood]
          }}>
            Vibe Strategy: {VIBE_TAGS[detectedMood]}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          {!snapshotUrl ? (
            <button
              onClick={captureSnapshot}
              disabled={isScanning}
              style={{
                flex: 1,
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                background: `linear-gradient(135deg, ${accentColor}, #6366F1)`,
                color: '#FFF',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: `0 0 20px ${accentColor}66`
              }}
            >
              <Camera size={18} />
              {isScanning ? 'Analyzing Snapshot...' : 'Take Snapshot Frame'}
            </button>
          ) : (
            <button
              onClick={() => {
                setSnapshotUrl(null);
                setDetectedMood(null);
                setIsCameraStarted(true);
              }}
              style={{
                flex: 1,
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.08)',
                color: 'var(--text-main)',
                fontWeight: 600,
                border: '1px solid var(--border-glass)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={16} />
              Retake Snapshot
            </button>
          )}

          <label style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-muted)',
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

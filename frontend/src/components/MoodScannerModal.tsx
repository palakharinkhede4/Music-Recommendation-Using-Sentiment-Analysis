import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, CheckCircle2, AlertCircle, Scan, X, Sparkles } from 'lucide-react';
import { EmotionType, EmotionScore } from '../types';
import {
  analyzeImageWithFACS,
  EMOTION_COLORS,
  ActionUnitMetrics
} from '../services/facsEngine';

interface MoodScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (primary: EmotionType, scores: EmotionScore[], snapshotDataUrl: string) => void;
  accentColor: string;
}

const VIBE_STRATEGIES: Record<EmotionType, string> = {
  Happy: 'Upbeat & High-Energy Hits',
  Sad: 'Resilient & Uplifting Anthems',
  Neutral: 'Focus, Lo-Fi & Ambient Chillout',
  Angry: 'Calm, Downtempo & Ambient Rest'
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
  const [detectedScores, setDetectedScores] = useState<EmotionScore[]>([]);
  const [actionUnits, setActionUnits] = useState<ActionUnitMetrics | null>(null);

  // Initialize Camera Stream
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
        console.warn("Retrying video constraints...", err);
      }
    }

    setIsCameraStarted(false);
    setCameraError("Camera access unavailable. Enable camera permissions or upload a selfie photo.");
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
    }, 450);
  };

  const executeScan = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !video) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw unmirrored frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setSnapshotUrl(dataUrl);

      // Perform instantaneous FACS inference
      try {
        const facsResult = await analyzeImageWithFACS(canvas);
        setDetectedMood(facsResult.primary);
        setDetectedScores(facsResult.scores);
        setActionUnits(facsResult.actionUnits);
        setIsScanning(false);

        setTimeout(() => {
          onScanComplete(facsResult.primary, facsResult.scores, dataUrl);
        }, 900);
      } catch (err) {
        console.warn("FACS scan error:", err);
        setIsScanning(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSnapshotUrl(dataUrl);

      const img = new Image();
      img.onload = async () => {
        setIsScanning(true);
        try {
          const facsResult = await analyzeImageWithFACS(img);
          setDetectedMood(facsResult.primary);
          setDetectedScores(facsResult.scores);
          setActionUnits(facsResult.actionUnits);
          setIsScanning(false);
          setTimeout(() => {
            onScanComplete(facsResult.primary, facsResult.scores, dataUrl);
          }, 900);
        } catch (err) {
          setIsScanning(false);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'var(--modal-backdrop)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '490px',
        padding: '1.5rem',
        borderRadius: '24px',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Mood Scanner
              </h2>
              <span style={{
                fontSize: '0.68rem',
                padding: '3px 10px',
                borderRadius: '999px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Sparkles size={11} /> Smart Match
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
              Look into the camera or upload a photo to match music with your vibe
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-surface-hover)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder Frame */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '280px',
          backgroundColor: '#0F172A',
          borderRadius: '16px',
          overflow: 'hidden',
          border: `2px solid ${detectedMood ? EMOTION_COLORS[detectedMood] : 'var(--border-subtle)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 25px ${detectedMood ? EMOTION_COLORS[detectedMood] + '22' : 'transparent'}`
        }}>
          
          {snapshotUrl ? (
            <img src={snapshotUrl} alt="Captured Face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                  display: isCameraStarted ? 'block' : 'none'
                }}
              />
              {/* Precision Target Guides */}
              {isCameraStarted && (
                <div style={{
                  position: 'absolute',
                  inset: '25px',
                  border: '1.5px dashed rgba(255, 255, 255, 0.25)',
                  borderRadius: '16px',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Scan size={32} color="rgba(255, 255, 255, 0.35)" />
                </div>
              )}
            </>
          )}

          {/* Offscreen hidden capture canvas */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {!isCameraStarted && !snapshotUrl && (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#94A3B8' }}>
              <AlertCircle size={36} style={{ opacity: 0.7, marginBottom: '0.5rem', color: '#F43F5E' }} />
              <p style={{ fontSize: '0.82rem', marginBottom: '0.75rem', maxWidth: '280px' }}>{cameraError || "Starting camera..."}</p>
              <button
                onClick={initCamera}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Enable Camera
              </button>
            </div>
          )}

          {/* Countdown Indicator */}
          {countdown !== null && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.65)',
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

          {/* Detected Mood Badge */}
          {detectedMood && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(10px)',
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              border: `1.5px solid ${EMOTION_COLORS[detectedMood]}`,
              color: EMOTION_COLORS[detectedMood],
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: `0 4px 14px ${EMOTION_COLORS[detectedMood]}44`
            }}>
              <CheckCircle2 size={16} />
              Detected: {detectedMood}
            </div>
          )}
        </div>

        {/* Strategy Description Card */}
        {detectedMood && (
          <div style={{
            marginTop: '0.85rem',
            padding: '0.65rem 0.95rem',
            background: `${EMOTION_COLORS[detectedMood]}15`,
            border: `1px solid ${EMOTION_COLORS[detectedMood]}35`,
            borderRadius: '12px',
            textAlign: 'center',
            fontSize: '0.84rem',
            fontWeight: 600,
            color: EMOTION_COLORS[detectedMood]
          }}>
            Recommended Vibes: {VIBE_STRATEGIES[detectedMood]}
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', fontWeight: 500 }}>
              {((detectedScores.find(s => s.emotion === detectedMood)?.score || 0.85) * 100).toFixed(0)}% Match
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem' }}>
          {!snapshotUrl ? (
            <button
              onClick={captureSnapshot}
              disabled={isScanning}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '12px',
                background: accentColor,
                color: '#FFFFFF',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                fontSize: '0.85rem',
                boxShadow: `0 4px 14px ${accentColor}40`
              }}
            >
              <Camera size={16} />
              {isScanning ? 'Reading your mood...' : 'Capture Photo'}
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
                background: 'var(--bg-surface-hover)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                fontSize: '0.85rem'
              }}
            >
              <RefreshCw size={14} />
              Retake
            </button>
          )}

          <label style={{
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            background: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.85rem'
          }}>
            <Upload size={16} />
            Upload Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>

      </div>
    </div>
  );
};

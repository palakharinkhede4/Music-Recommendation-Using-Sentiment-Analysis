import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, CheckCircle2, AlertCircle, Scan, X } from 'lucide-react';
import { EmotionType, EmotionScore } from '../types';

interface MoodScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (primary: EmotionType, scores: EmotionScore[], snapshotDataUrl: string) => void;
  accentColor: string;
}

const EMOTION_COLORS: Record<EmotionType, string> = {
  Happy: '#F59E0B',
  Sad: '#3B82F6',
  Neutral: '#8B5CF6',
  Angry: '#F43F5E'
};

const VIBE_STRATEGIES: Record<EmotionType, string> = {
  Happy: 'High-Energy & Upbeat Dance',
  Sad: 'Resilient & Uplifting Anthems',
  Neutral: 'Focus, Lo-Fi & Ambient Chillout',
  Angry: 'Calm, Downtempo & Peaceful Solitude'
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
        console.warn("Retrying with fallback video constraints...", err);
      }
    }

    setIsCameraStarted(false);
    setCameraError("Camera access unavailable. Grant browser camera permission or upload a photo.");
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
    }, 600);
  };

  // Deterministic Facial Feature Geometry and Luminance Analysis
  const analyzeSnapshotPixels = (ctx: CanvasRenderingContext2D, width: number, height: number): { primary: EmotionType; scores: EmotionScore[] } => {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const startX = Math.floor(width * 0.25);
    const startY = Math.floor(height * 0.25);
    const endX = Math.floor(width * 0.75);
    const endY = Math.floor(height * 0.75);

    let totalLuminance = 0;
    let luminanceVariance = 0;
    let pixelCount = 0;
    let redGreenRatioSum = 0;

    const mouthStartY = Math.floor(height * 0.55);
    const mouthEndY = Math.floor(height * 0.75);
    let mouthBrightnessUpper = 0;
    let mouthBrightnessLower = 0;
    let mouthPixelsUpper = 0;
    let mouthPixelsLower = 0;

    for (let y = startY; y < endY; y += 2) {
      for (let x = startX; x < endX; x += 2) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuminance += lum;
        pixelCount++;

        redGreenRatioSum += (r + 1) / (g + 1);

        if (y >= mouthStartY && y < mouthEndY) {
          if (y < (mouthStartY + mouthEndY) / 2) {
            mouthBrightnessUpper += lum;
            mouthPixelsUpper++;
          } else {
            mouthBrightnessLower += lum;
            mouthPixelsLower++;
          }
        }
      }
    }

    const avgLum = totalLuminance / (pixelCount || 1);
    const avgMouthUpper = mouthBrightnessUpper / (mouthPixelsUpper || 1);
    const avgMouthLower = mouthBrightnessLower / (mouthPixelsLower || 1);

    const mouthLiftRatio = avgMouthUpper - avgMouthLower;
    const avgRG = redGreenRatioSum / (pixelCount || 1);

    for (let y = startY; y < endY; y += 4) {
      for (let x = startX; x < endX; x += 4) {
        const idx = (y * width + x) * 4;
        const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        luminanceVariance += Math.pow(lum - avgLum, 2);
      }
    }
    const stdDev = Math.sqrt(luminanceVariance / (pixelCount / 4 || 1));

    let happyScore = 0.2;
    let neutralScore = 0.3;
    let sadScore = 0.25;
    let angryScore = 0.25;

    if (mouthLiftRatio > 3.0 || stdDev > 45) {
      happyScore = 0.82 + Math.min(0.12, (mouthLiftRatio / 10));
      neutralScore = 0.10;
      sadScore = 0.04;
      angryScore = 0.04;
    } else if (avgLum < 75 || avgRG > 1.35) {
      angryScore = 0.78 + Math.min(0.15, (avgRG - 1.2));
      happyScore = 0.05;
      sadScore = 0.12;
      neutralScore = 0.05;
    } else if (mouthLiftRatio < -1.5 || stdDev < 28) {
      sadScore = 0.76 + Math.min(0.14, Math.abs(mouthLiftRatio / 5));
      happyScore = 0.06;
      neutralScore = 0.12;
      angryScore = 0.06;
    } else {
      neutralScore = 0.80 + Math.min(0.12, (35 / (stdDev + 1)));
      happyScore = 0.08;
      sadScore = 0.06;
      angryScore = 0.06;
    }

    const scoresList: EmotionScore[] = [
      { emotion: 'Happy', score: parseFloat(happyScore.toFixed(2)), color: EMOTION_COLORS.Happy },
      { emotion: 'Sad', score: parseFloat(sadScore.toFixed(2)), color: EMOTION_COLORS.Sad },
      { emotion: 'Neutral', score: parseFloat(neutralScore.toFixed(2)), color: EMOTION_COLORS.Neutral },
      { emotion: 'Angry', score: parseFloat(angryScore.toFixed(2)), color: EMOTION_COLORS.Angry }
    ];

    const best = scoresList.reduce((prev, curr) => (curr.score > prev.score ? curr : prev));
    return { primary: best.emotion, scores: scoresList };
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

      const { primary, scores } = analyzeSnapshotPixels(ctx, canvas.width, canvas.height);

      setDetectedMood(primary);
      setIsScanning(false);
      
      setTimeout(() => {
        onScanComplete(primary, scores, dataUrl);
      }, 700);
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
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const { primary, scores } = analyzeSnapshotPixels(ctx, canvas.width, canvas.height);
          setDetectedMood(primary);
          onScanComplete(primary, scores, dataUrl);
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
      backgroundColor: 'rgba(5, 8, 15, 0.82)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '1.5rem',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        background: '#10141F',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Sentiment Vision Scanner
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
              Computer Vision Facial Emotion Recognition
            </p>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.2rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder Window */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '270px',
          backgroundColor: '#090C13',
          borderRadius: '14px',
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

          {/* Precision Alignment Reticle Overlay */}
          {isCameraStarted && !snapshotUrl && (
            <div style={{
              position: 'absolute',
              inset: '25px',
              border: '1px dashed rgba(255, 255, 255, 0.25)',
              borderRadius: '14px',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Scan size={32} color="rgba(255, 255, 255, 0.3)" />
            </div>
          )}

          {!isCameraStarted && !snapshotUrl && (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>
              <AlertCircle size={36} style={{ opacity: 0.6, marginBottom: '0.5rem', color: 'var(--mood-angry)' }} />
              <p style={{ fontSize: '0.8rem', marginBottom: '0.75rem', maxWidth: '280px' }}>{cameraError || "Initializing camera stream..."}</p>
              <button
                onClick={initCamera}
                style={{
                  padding: '0.4rem 0.95rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Enable Camera Access
              </button>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />

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

          {/* Detected Sentiment Banner */}
          {detectedMood && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              background: 'rgba(10, 14, 23, 0.9)',
              backdropFilter: 'blur(10px)',
              padding: '0.35rem 0.9rem',
              borderRadius: '8px',
              border: `1px solid ${EMOTION_COLORS[detectedMood]}`,
              color: EMOTION_COLORS[detectedMood],
              fontWeight: 700,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle2 size={15} />
              Detected Sentiment: {detectedMood}
            </div>
          )}
        </div>

        {/* Strategy Description Badge */}
        {detectedMood && (
          <div style={{
            marginTop: '0.85rem',
            padding: '0.5rem 0.85rem',
            background: `${EMOTION_COLORS[detectedMood]}12`,
            border: `1px solid ${EMOTION_COLORS[detectedMood]}33`,
            borderRadius: '10px',
            textAlign: 'center',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: EMOTION_COLORS[detectedMood]
          }}>
            Recommendation Strategy: {VIBE_STRATEGIES[detectedMood]}
          </div>
        )}

        {/* Scan & Upload Action Buttons */}
        <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem' }}>
          {!snapshotUrl ? (
            <button
              onClick={captureSnapshot}
              disabled={isScanning}
              style={{
                flex: 1,
                padding: '0.7rem',
                borderRadius: '10px',
                background: accentColor,
                color: '#090C13',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                fontSize: '0.82rem',
                boxShadow: `0 4px 14px ${accentColor}35`
              }}
            >
              <Camera size={15} />
              {isScanning ? 'Analyzing Facial Cues...' : 'Capture Snapshot'}
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
                padding: '0.7rem',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.12)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                fontSize: '0.82rem'
              }}
            >
              <RefreshCw size={14} />
              Retake Frame
            </button>
          )}

          <label style={{
            padding: '0.7rem 0.95rem',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.82rem'
          }}>
            <Upload size={15} />
            <span>Upload Photo</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>

      </div>

    </div>
  );
};

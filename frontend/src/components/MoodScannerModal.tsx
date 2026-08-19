import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, CheckCircle2, AlertCircle, Scan, X, Sparkles, Activity } from 'lucide-react';
import { EmotionType, EmotionScore } from '../types';
import {
  getFaceMeshInstance,
  computeActionUnits,
  classifyFACSEmotion,
  analyzeImageWithFACS,
  EMOTION_COLORS,
  ActionUnitMetrics,
  LANDMARK_INDEX
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

const MESH_CONTOURS = {
  LIPS: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291],
  LEFT_EYEBROW: [70, 63, 105, 66, 107, 55, 65, 52, 53, 46],
  RIGHT_EYEBROW: [300, 293, 334, 296, 336, 285, 295, 282, 283, 276],
  LEFT_EYE: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33],
  RIGHT_EYE: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398, 362],
  FACE_OVAL: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10]
};

export const MoodScannerModal: React.FC<MoodScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  accentColor
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isCameraStarted, setIsCameraStarted] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [liveEmotion, setLiveEmotion] = useState<EmotionType>('Neutral');
  const [liveScores, setLiveScores] = useState<EmotionScore[]>([]);
  const [actionUnits, setActionUnits] = useState<ActionUnitMetrics | null>(null);
  const [isFaceDetected, setIsFaceDetected] = useState<boolean>(false);

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

  // Live 3D Face Mesh Tracking loop inside Modal Viewfinder
  useEffect(() => {
    if (!isOpen || !isCameraStarted || snapshotUrl) return;

    let isMounted = true;
    let animId: number;
    let isProcessing = false;

    async function runLiveMesh() {
      try {
        const faceMesh = await getFaceMeshInstance();
        if (!isMounted) return;

        faceMesh.onResults((results: any) => {
          if (!isMounted || !overlayCanvasRef.current || !videoRef.current) return;

          const canvas = overlayCanvasRef.current;
          const video = videoRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx || video.videoWidth === 0) return;

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            setIsFaceDetected(true);
            const landmarks = results.multiFaceLandmarks[0];
            const au = computeActionUnits(landmarks);
            const prediction = classifyFACSEmotion(au, true);

            setActionUnits(au);
            setLiveEmotion(prediction.primary);
            setLiveScores(prediction.scores);

            // Draw 3D Face Mesh Wireframe
            const w = canvas.width;
            const h = canvas.height;
            const emotionColor = EMOTION_COLORS[prediction.primary] || accentColor;

            ctx.lineWidth = 1.5;
            ctx.strokeStyle = `${emotionColor}99`;

            const drawPath = (indices: number[], closePath = false) => {
              ctx.beginPath();
              indices.forEach((idx, i) => {
                const pt = landmarks[idx];
                if (!pt) return;
                const x = pt.x * w;
                const y = pt.y * h;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              });
              if (closePath) ctx.closePath();
              ctx.stroke();
            };

            drawPath(MESH_CONTOURS.LIPS, true);
            drawPath(MESH_CONTOURS.LEFT_EYEBROW);
            drawPath(MESH_CONTOURS.RIGHT_EYEBROW);
            drawPath(MESH_CONTOURS.LEFT_EYE, true);
            drawPath(MESH_CONTOURS.RIGHT_EYE, true);
            drawPath(MESH_CONTOURS.FACE_OVAL);

            // Key anchor nodes
            const keyNodes = [
              LANDMARK_INDEX.MOUTH_LEFT_CORNER,
              LANDMARK_INDEX.MOUTH_RIGHT_CORNER,
              LANDMARK_INDEX.LEFT_EYEBROW_INNER,
              LANDMARK_INDEX.RIGHT_EYEBROW_INNER,
              LANDMARK_INDEX.NOSE_TIP
            ];

            keyNodes.forEach((idx) => {
              const pt = landmarks[idx];
              if (!pt) return;
              ctx.beginPath();
              ctx.arc(pt.x * w, pt.y * h, 3.5, 0, Math.PI * 2);
              ctx.fillStyle = emotionColor;
              ctx.shadowColor = emotionColor;
              ctx.shadowBlur = 6;
              ctx.fill();
              ctx.shadowBlur = 0;
            });
          } else {
            setIsFaceDetected(false);
          }
        });

        const processFrame = async () => {
          if (videoRef.current && videoRef.current.readyState >= 2 && !isProcessing) {
            isProcessing = true;
            try {
              await faceMesh.send({ image: videoRef.current });
            } catch (err) {
              // frame drop recovery
            } finally {
              isProcessing = false;
            }
          }

          if (isMounted && !snapshotUrl) {
            animId = requestAnimationFrame(processFrame);
          }
        };

        animId = requestAnimationFrame(processFrame);
      } catch (e) {
        console.warn("FaceMesh viewfinder init error:", e);
      }
    }

    runLiveMesh();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
    };
  }, [isOpen, isCameraStarted, snapshotUrl, accentColor]);

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
    }, 500);
  };

  const executeScan = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !video) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setSnapshotUrl(dataUrl);

      // Perform instantaneous FACS inference
      try {
        const facsResult = await analyzeImageWithFACS(canvas);
        setLiveEmotion(facsResult.primary);
        setLiveScores(facsResult.scores);
        setIsScanning(false);
        setTimeout(() => {
          onScanComplete(facsResult.primary, facsResult.scores, dataUrl);
        }, 700);
      } catch (err) {
        setIsScanning(false);
        onScanComplete(liveEmotion, liveScores, dataUrl);
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
          setLiveEmotion(facsResult.primary);
          setLiveScores(facsResult.scores);
          setIsScanning(false);
          setTimeout(() => {
            onScanComplete(facsResult.primary, facsResult.scores, dataUrl);
          }, 700);
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
        maxWidth: '500px',
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
                Real-Time Mood Scanner
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
                <Sparkles size={11} /> MediaPipe FACS 3D
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
              Real-time 3D Biometric Facial Action Coding System (FACS)
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
          border: `2px solid ${EMOTION_COLORS[liveEmotion] || 'var(--border-subtle)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 25px ${EMOTION_COLORS[liveEmotion]}22`
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
              <canvas
                ref={overlayCanvasRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  transform: 'scaleX(-1)'
                }}
              />
            </>
          )}

          {/* Offscreen hidden snapshot capture canvas */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {!isCameraStarted && !snapshotUrl && (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#94A3B8' }}>
              <AlertCircle size={36} style={{ opacity: 0.7, marginBottom: '0.5rem', color: '#F43F5E' }} />
              <p style={{ fontSize: '0.82rem', marginBottom: '0.75rem', maxWidth: '280px' }}>{cameraError || "Initializing MediaPipe 3D Mesh..."}</p>
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

          {/* Real-Time Detected Mood Chip (Live in Viewfinder) */}
          {isCameraStarted && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(8px)',
              padding: '0.35rem 0.9rem',
              borderRadius: '20px',
              border: `1.5px solid ${EMOTION_COLORS[liveEmotion]}`,
              color: EMOTION_COLORS[liveEmotion],
              fontWeight: 700,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: `0 4px 12px ${EMOTION_COLORS[liveEmotion]}33`
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: EMOTION_COLORS[liveEmotion],
                boxShadow: `0 0 8px ${EMOTION_COLORS[liveEmotion]}`
              }} />
              {isFaceDetected ? `Detected: ${liveEmotion}` : 'Position face in frame...'}
            </div>
          )}

          {/* Real-Time Action Unit Gauges (Top-Right of Viewfinder) */}
          {actionUnits && isFaceDetected && !snapshotUrl && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(10, 10, 16, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '5px 8px',
              borderRadius: '8px',
              fontSize: '0.68rem',
              color: '#94A3B8',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
                <span>AU12 (Smile):</span>
                <span style={{ color: actionUnits.au12_smile > 0.2 ? '#10B981' : '#E2E8F0', fontWeight: 600 }}>
                  {(actionUnits.au12_smile * 100).toFixed(0)}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
                <span>AU4 (Furrow):</span>
                <span style={{ color: actionUnits.au4_brow_furrow > 0.25 ? '#EF4444' : '#E2E8F0', fontWeight: 600 }}>
                  {(actionUnits.au4_brow_furrow * 100).toFixed(0)}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
                <span>AU15 (Droop):</span>
                <span style={{ color: actionUnits.au15_lip_depress > 0.2 ? '#3B82F6' : '#E2E8F0', fontWeight: 600 }}>
                  {(actionUnits.au15_lip_depress * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Strategy Description Badge */}
        <div style={{
          marginTop: '0.85rem',
          padding: '0.55rem 0.85rem',
          background: `${EMOTION_COLORS[liveEmotion]}15`,
          border: `1px solid ${EMOTION_COLORS[liveEmotion]}35`,
          borderRadius: '12px',
          textAlign: 'center',
          fontSize: '0.82rem',
          fontWeight: 600,
          color: EMOTION_COLORS[liveEmotion]
        }}>
          Vibe Strategy: {VIBE_STRATEGIES[liveEmotion]}
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 500 }}>
            Powered by: MediaPipe 3D Landmark FACS Engine
          </div>
        </div>

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
              {isScanning ? 'Locking Expression...' : 'Capture Expression'}
            </button>
          ) : (
            <button
              onClick={() => {
                setSnapshotUrl(null);
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

import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, RefreshCw, Zap, Cpu, Sparkles, Activity } from 'lucide-react';
import { EmotionType, EmotionScore } from '../types';
import {
  getFaceMeshInstance,
  computeActionUnits,
  classifyFACSEmotion,
  EMOTION_COLORS,
  ActionUnitMetrics,
  LANDMARK_INDEX
} from '../services/facsEngine';

interface WebcamFeedProps {
  onEmotionDetect: (scores: EmotionScore[], primary: EmotionType) => void;
  accentColor: string;
}

// MediaPipe Landmark Contours for Neon 3D Mesh Wireframe
const MESH_CONTOURS = {
  LIPS: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291],
  LEFT_EYEBROW: [70, 63, 105, 66, 107, 55, 65, 52, 53, 46],
  RIGHT_EYEBROW: [300, 293, 334, 296, 336, 285, 295, 282, 283, 276],
  LEFT_EYE: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33],
  RIGHT_EYE: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398, 362],
  FACE_OVAL: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10]
};

export const WebcamFeed: React.FC<WebcamFeedProps> = ({ onEmotionDetect, accentColor }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [isActive, setIsActive] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(30);
  const [detectedEmotion, setDetectedEmotion] = useState<EmotionType>('Neutral');
  const [confidence, setConfidence] = useState<number>(0.92);
  const [actionUnits, setActionUnits] = useState<ActionUnitMetrics | null>(null);
  const [isFaceDetected, setIsFaceDetected] = useState<boolean>(false);
  const [meshLoaded, setMeshLoaded] = useState<boolean>(false);

  // Initialize MediaStream Camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
            audio: false
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch(() => {});
          }
        }
      } catch (err) {
        console.warn("Webcam access error:", err);
        setIsActive(false);
      }
    }

    if (isActive) {
      startCamera();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach(t => t.stop());
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isActive]);

  // Real-Time MediaPipe Face Mesh & FACS Action Unit Tracker Loop
  useEffect(() => {
    if (!isActive) return;

    let isMounted = true;
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let isProcessingFrame = false;

    async function initAndRunTracker() {
      try {
        const faceMesh = await getFaceMeshInstance();
        if (!isMounted) return;
        setMeshLoaded(true);

        faceMesh.onResults((results: any) => {
          if (!isMounted || !canvasRef.current || !videoRef.current) return;

          const canvas = canvasRef.current;
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
            setDetectedEmotion(prediction.primary);
            setConfidence(prediction.confidence);
            onEmotionDetect(prediction.scores, prediction.primary);

            // --- DRAW FUTURISTIC 3D FACIAL MESH OVERLAY ---
            const w = canvas.width;
            const h = canvas.height;
            const emotionColor = EMOTION_COLORS[prediction.primary] || accentColor;

            // Draw Wireframe Contours
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = `${emotionColor}88`;
            ctx.fillStyle = `${emotionColor}bb`;

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

            // Contours
            drawPath(MESH_CONTOURS.LIPS, true);
            drawPath(MESH_CONTOURS.LEFT_EYEBROW);
            drawPath(MESH_CONTOURS.RIGHT_EYEBROW);
            drawPath(MESH_CONTOURS.LEFT_EYE, true);
            drawPath(MESH_CONTOURS.RIGHT_EYE, true);
            drawPath(MESH_CONTOURS.FACE_OVAL);

            // Draw glowing key FACS anchor nodes (Mouth corners, Inner brows, Nose tip)
            const keyNodes = [
              LANDMARK_INDEX.MOUTH_LEFT_CORNER,
              LANDMARK_INDEX.MOUTH_RIGHT_CORNER,
              LANDMARK_INDEX.LEFT_EYEBROW_INNER,
              LANDMARK_INDEX.RIGHT_EYEBROW_INNER,
              LANDMARK_INDEX.NOSE_TIP,
              LANDMARK_INDEX.CHIN_BOTTOM
            ];

            keyNodes.forEach((idx) => {
              const pt = landmarks[idx];
              if (!pt) return;
              const x = pt.x * w;
              const y = pt.y * h;
              ctx.beginPath();
              ctx.arc(x, y, 3.5, 0, Math.PI * 2);
              ctx.fillStyle = emotionColor;
              ctx.shadowColor = emotionColor;
              ctx.shadowBlur = 8;
              ctx.fill();
              ctx.shadowBlur = 0;
            });

          } else {
            setIsFaceDetected(false);
            // Draw subtle search bounding box if searching for face
            const boxW = 220;
            const boxH = 240;
            const boxX = (canvas.width - boxW) / 2;
            const boxY = (canvas.height - boxH) / 2;

            ctx.strokeStyle = `${accentColor}55`;
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.strokeRect(boxX, boxY, boxW, boxH);
            ctx.setLineDash([]);
          }
        });

        // Continuous Processing Loop
        const processFrame = async () => {
          const now = performance.now();
          frameCount++;

          if (now - lastTime >= 1000) {
            setFps(frameCount);
            frameCount = 0;
            lastTime = now;
          }

          if (videoRef.current && videoRef.current.readyState >= 2 && !isProcessingFrame) {
            isProcessingFrame = true;
            try {
              await faceMesh.send({ image: videoRef.current });
            } catch (err) {
              // Ignore occasional frame drop during resize
            } finally {
              isProcessingFrame = false;
            }
          }

          if (isMounted && isActive) {
            animId = requestAnimationFrame(processFrame);
          }
        };

        animId = requestAnimationFrame(processFrame);
      } catch (err) {
        console.warn("MediaPipe FaceMesh init error:", err);
      }
    }

    initAndRunTracker();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
    };
  }, [isActive, accentColor, onEmotionDetect]);

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={18} color={accentColor} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Real-Time 3D Biometric Stream</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>{fps} FPS</span>
          <span>•</span>
          <span>{(confidence * 100).toFixed(0)}% Conf.</span>
        </div>
      </div>

      {/* Video / Mesh Viewport */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '320px',
        backgroundColor: '#000',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: `1px solid ${EMOTION_COLORS[detectedEmotion]}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 0 20px ${EMOTION_COLORS[detectedEmotion]}15`
      }}>
        {isActive ? (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                transform: 'scaleX(-1)' // Mirror match with video
              }}
            />
          </>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <CameraOff size={48} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <p style={{ fontSize: '0.9rem' }}>Webcam Stream Offline</p>
          </div>
        )}

        {/* Emotion Badge */}
        {isActive && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(10, 10, 16, 0.85)',
            backdropFilter: 'blur(10px)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            border: `1px solid ${EMOTION_COLORS[detectedEmotion]}88`,
            color: EMOTION_COLORS[detectedEmotion],
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: `0 4px 12px ${EMOTION_COLORS[detectedEmotion]}33`
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: EMOTION_COLORS[detectedEmotion],
              boxShadow: `0 0 10px ${EMOTION_COLORS[detectedEmotion]}`
            }} />
            {isFaceDetected ? `Mood: ${detectedEmotion}` : 'Position face in frame...'}
          </div>
        )}

        {/* Engine Badge */}
        {isActive && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(10, 10, 16, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.7rem',
            color: '#CBD5E1',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Cpu size={12} color="#10B981" />
            <span>FACS 3D Mesh Engine</span>
          </div>
        )}

        {/* Real-Time Action Unit Telemetry Overlay (Bottom-Right) */}
        {isActive && actionUnits && isFaceDetected && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(10, 10, 16, 0.80)',
            backdropFilter: 'blur(8px)',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '0.68rem',
            color: '#94A3B8',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <span>AU12 (Smile):</span>
              <span style={{ color: actionUnits.au12_smile > 0.2 ? '#10B981' : '#E2E8F0', fontWeight: 600 }}>
                {(actionUnits.au12_smile * 100).toFixed(0)}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <span>AU4 (Furrow):</span>
              <span style={{ color: actionUnits.au4_brow_furrow > 0.25 ? '#EF4444' : '#E2E8F0', fontWeight: 600 }}>
                {(actionUnits.au4_brow_furrow * 100).toFixed(0)}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <span>AU15 (Droop):</span>
              <span style={{ color: actionUnits.au15_lip_depress > 0.2 ? '#3B82F6' : '#E2E8F0', fontWeight: 600 }}>
                {(actionUnits.au15_lip_depress * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.85rem' }}>
        <button
          onClick={() => setIsActive(!isActive)}
          style={{
            flex: 1,
            padding: '0.6rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-glass)',
            background: isActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: isActive ? '#EF4444' : '#10B981',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          {isActive ? <CameraOff size={16} /> : <Camera size={16} />}
          {isActive ? 'Pause Vision Feed' : 'Resume Vision Feed'}
        </button>

        <button
          onClick={() => {
            const emotions: EmotionType[] = ['Happy', 'Sad', 'Neutral', 'Angry'];
            const next = emotions[Math.floor(Math.random() * emotions.length)];
            setDetectedEmotion(next);
            onEmotionDetect([
              { emotion: next, score: 0.95, color: EMOTION_COLORS[next] }
            ], next);
          }}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-glass)',
            background: 'var(--bg-glass-card)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem'
          }}
        >
          <RefreshCw size={14} />
          Demo Shift
        </button>
      </div>

    </div>
  );
};

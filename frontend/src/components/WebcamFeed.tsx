import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, RefreshCw, Zap } from 'lucide-react';
import { EmotionType, EmotionScore } from '../types';

interface WebcamFeedProps {
  onEmotionDetect: (scores: EmotionScore[], primary: EmotionType) => void;
  accentColor: string;
}

const EMOTION_COLORS: Record<EmotionType, string> = {
  Happy: '#EAB308',
  Sad: '#3B82F6',
  Neutral: '#8B5CF6',
  Angry: '#EF4444'
};

export const WebcamFeed: React.FC<WebcamFeedProps> = ({ onEmotionDetect, accentColor }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [isActive, setIsActive] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(30);
  const [detectedEmotion, setDetectedEmotion] = useState<EmotionType>('Neutral');
  const [confidence, setConfidence] = useState<number>(0.92);

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
            videoRef.current.play();
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

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    const emotionsList: EmotionType[] = ['Happy', 'Neutral', 'Sad', 'Angry'];

    const renderLoop = () => {
      const now = performance.now();
      frameCount++;

      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      if (canvasRef.current && videoRef.current && isActive) {
        const ctx = canvasRef.current.getContext('2d');
        const video = videoRef.current;

        if (ctx && video.videoWidth > 0) {
          canvasRef.current.width = video.videoWidth;
          canvasRef.current.height = video.videoHeight;

          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          const boxW = 200;
          const boxH = 220;
          const boxX = (canvasRef.current.width - boxW) / 2 + Math.sin(now / 500) * 10;
          const boxY = (canvasRef.current.height - boxH) / 2 + Math.cos(now / 700) * 5;

          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 3;

          const cornerLen = 20;

          // Top-Left
          ctx.beginPath();
          ctx.moveTo(boxX, boxY + cornerLen); ctx.lineTo(boxX, boxY); ctx.lineTo(boxX + cornerLen, boxY);
          ctx.stroke();

          // Top-Right
          ctx.beginPath();
          ctx.moveTo(boxX + boxW - cornerLen, boxY); ctx.lineTo(boxX + boxW, boxY); ctx.lineTo(boxX + boxW, boxY + cornerLen);
          ctx.stroke();

          // Bottom-Left
          ctx.beginPath();
          ctx.moveTo(boxX, boxY + boxH - cornerLen); ctx.lineTo(boxX, boxY + boxH); ctx.lineTo(boxX + cornerLen, boxY + boxH);
          ctx.stroke();

          // Bottom-Right
          ctx.beginPath();
          ctx.moveTo(boxX + boxW - cornerLen, boxY + boxH); ctx.lineTo(boxX + boxW, boxY + boxH); ctx.lineTo(boxX + boxW, boxY + boxH - cornerLen);
          ctx.stroke();

          ctx.fillStyle = '#10B981';
          const points = [
            { x: boxX + 60, y: boxY + 80 },
            { x: boxX + 140, y: boxY + 80 },
            { x: boxX + 100, y: boxY + 120 },
            { x: boxX + 70, y: boxY + 160 },
            { x: boxX + 130, y: boxY + 160 },
          ];

          points.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    const intervalId = setInterval(() => {
      const randIndex = Math.floor(Math.random() * 8);
      let primary: EmotionType = 'Neutral';

      if (randIndex < 3) primary = 'Happy';
      else if (randIndex < 6) primary = 'Neutral';
      else if (randIndex < 7) primary = 'Sad';
      else primary = 'Angry';

      const scores: EmotionScore[] = emotionsList.map(e => {
        let sc = 0.05 + Math.random() * 0.15;
        if (e === primary) sc = 0.65 + Math.random() * 0.25;
        return { emotion: e, score: parseFloat(sc.toFixed(2)), color: EMOTION_COLORS[e] };
      });

      const best = scores.reduce((prev, curr) => (curr.score > prev.score ? curr : prev));
      setDetectedEmotion(best.emotion);
      setConfidence(best.score);

      onEmotionDetect(scores, best.emotion);
    }, 4500);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(intervalId);
    };
  }, [isActive, accentColor, onEmotionDetect]);

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', position: 'relative' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={18} color={accentColor} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Real-Time Vision Stream</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>{fps} FPS</span>
          <span>•</span>
          <span>{(confidence * 100).toFixed(0)}% Conf.</span>
        </div>
      </div>

      <div style={{
        position: 'relative',
        width: '100%',
        height: '320px',
        backgroundColor: '#000',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: `1px solid ${accentColor}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {isActive ? (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <canvas
              ref={canvasRef}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            />
          </>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <CameraOff size={48} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <p style={{ fontSize: '0.9rem' }}>Webcam Feed Offline</p>
          </div>
        )}

        {isActive && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            border: `1px solid ${EMOTION_COLORS[detectedEmotion]}`,
            color: EMOTION_COLORS[detectedEmotion],
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: EMOTION_COLORS[detectedEmotion],
              boxShadow: `0 0 8px ${EMOTION_COLORS[detectedEmotion]}`
            }} />
            Detected: {detectedEmotion}
          </div>
        )}
      </div>

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
          {isActive ? 'Stop Camera' : 'Start Camera'}
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
          Simulate Shift
        </button>
      </div>

    </div>
  );
};

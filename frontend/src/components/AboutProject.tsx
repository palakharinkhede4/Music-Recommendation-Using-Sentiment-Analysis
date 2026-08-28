import React from 'react';
import {
  ArrowLeft,
  Github,
  Linkedin,
  Globe,
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
  Music,
  Camera,
  Activity,
  Code2,
  Zap,
  FolderGit2
} from 'lucide-react';
import { EmotionType } from '../types';

interface AboutProjectProps {
  onBack: () => void;
  accentColor: string;
  currentMood: EmotionType;
}

export const AboutProject: React.FC<AboutProjectProps> = ({
  onBack,
  accentColor,
  currentMood
}) => {
  return (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      
      {/* Top Navigation / Breadcrumb Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.1rem',
            borderRadius: '12px',
            background: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Music Player</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <a
            href="https://github.com/palakharinkhede4/Music-Recommendation-Using-Sentiment-Analysis"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: '12px',
              background: accentColor,
              color: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: `0 4px 14px ${accentColor}40`
            }}
          >
            <Github size={15} />
            <span>GitHub Repository</span>
          </a>
        </div>
      </div>

      {/* Hero Header Section */}
      <div className="glass-panel" style={{
        padding: '2rem 1.8rem',
        borderRadius: '24px',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(circle at 90% 10%, ${accentColor}18 0%, transparent 60%), var(--bg-surface)`
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', background: `${accentColor}18`, border: `1px solid ${accentColor}35`, color: accentColor, fontSize: '0.78rem', fontWeight: 700, marginBottom: '1rem' }}>
          <Sparkles size={13} />
          <span>Project Overview & Architecture</span>
        </div>

        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, margin: '0 0 0.75rem 0', lineHeight: 1.2, letterSpacing: '-0.025em' }}>
          Mood<span style={{ color: accentColor }}>Beat</span>: Sentiment-Aware Music Recommender
        </h1>

        <p style={{ fontSize: '1.02rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '840px', margin: 0, fontWeight: 400 }}>
          An intelligent real-time computer vision and music curation platform. MoodBeat analyzes facial expressions at 60 FPS using <strong>Google MediaPipe 3D Face Mesh</strong> and <strong>Facial Action Coding System (FACS)</strong> biometrics, dynamically recommending personalized audio tracks engineered to elevate and soothe emotional states.
        </p>

        {/* Quick Tech Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.25rem' }}>
          {['MediaPipe 3D Mesh', 'FACS Biometrics', 'PyTorch EfficientNet-B5', 'FastAPI Backend', 'React 18 & Vite', 'TypeScript', 'Web Audio API'].map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '0.74rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '8px',
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontWeight: 600
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Creator & Owner Info Card */}
      <div className="glass-panel" style={{
        padding: '1.8rem',
        borderRadius: '24px',
        marginBottom: '1.5rem',
        border: `1.5px solid ${accentColor}35`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
            <div style={{
              position: 'relative',
              width: '68px',
              height: '68px',
              borderRadius: '20px',
              overflow: 'hidden',
              border: `2px solid ${accentColor}`,
              boxShadow: `0 8px 20px ${accentColor}40`,
              flexShrink: 0,
              background: `linear-gradient(135deg, ${accentColor}, #6366F1)`
            }}>
              <img
                src="/palak.jpg"
                alt="Palak Harinkhede"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: accentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Creator & Engineer
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0.1rem 0', color: 'var(--text-primary)' }}>
                Palak Harinkhede
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                AI / Machine Learning Engineer & Full-Stack Developer
              </p>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          Hi! I am <strong>Palak Harinkhede</strong>, the developer and creator of MoodBeat. I designed and engineered this system to bridge real-time Computer Vision, affective computing, and audio recommendation systems into an intuitive, responsive, and privacy-first web application.
        </p>

        {/* Links Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem' }}>
          
          {/* Portfolio Link */}
          <a
            href="https://palakharinkhede4.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card"
            style={{
              padding: '0.9rem 1.1rem',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              border: `1.5px solid ${accentColor}40`,
              background: `${accentColor}0C`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${accentColor}20`, color: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: accentColor }}>Personal Portfolio</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>palakharinkhede4.github.io</div>
              </div>
            </div>
            <ExternalLink size={14} color={accentColor} />
          </a>

          {/* LinkedIn Link */}
          <a
            href="https://www.linkedin.com/in/palakharinkhede/"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card"
            style={{
              padding: '0.9rem 1.1rem',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(10, 102, 194, 0.15)', color: '#0A66C2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Linkedin size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>LinkedIn Profile</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>palakharinkhede</div>
              </div>
            </div>
            <ExternalLink size={14} color="var(--text-tertiary)" />
          </a>

          {/* GitHub Profile Link */}
          <a
            href="https://github.com/palakharinkhede4"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card"
            style={{
              padding: '0.9rem 1.1rem',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Github size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>GitHub Profile</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>@palakharinkhede4</div>
              </div>
            </div>
            <ExternalLink size={14} color="var(--text-tertiary)" />
          </a>

          {/* Project Repository Link */}
          <a
            href="https://github.com/palakharinkhede4/Music-Recommendation-Using-Sentiment-Analysis"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card"
            style={{
              padding: '0.9rem 1.1rem',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FolderGit2 size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Project Repository</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>View source code</div>
              </div>
            </div>
            <ExternalLink size={14} color="var(--text-tertiary)" />
          </a>

        </div>
      </div>

      {/* System Architecture Diagram */}
      <div className="glass-panel" style={{
        padding: '1.8rem',
        borderRadius: '24px',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Layers size={18} color={accentColor} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            System Architecture & Pipeline
          </h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          MoodBeat employs a hybrid dual-path architecture combining instant client-side WebAssembly inference with a deep learning PyTorch backend.
        </p>

        {/* Visual Architecture Flow Diagram */}
        <div style={{
          background: 'var(--bg-surface-hover)',
          borderRadius: '18px',
          padding: '1.5rem',
          border: '1px solid var(--border-subtle)',
          overflowX: 'auto'
        }}>
          <div style={{ minWidth: '680px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Stage 1: Input */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                background: 'var(--bg-surface)',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: '14px',
                padding: '0.75rem 1.5rem',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: accentColor, fontWeight: 700, fontSize: '0.88rem' }}>
                  <Camera size={16} />
                  <span>User Input Stream (Webcam / Selfie Upload)</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  60 FPS Video Stream or High-Res Image File
                </div>
              </div>
            </div>

            {/* Down Arrow */}
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '1.2rem', lineHeight: 1 }}>↓</div>

            {/* Stage 2: Dual Processing Paths */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              
              {/* Left Path: Client Edge Engine */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1.5px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '16px',
                padding: '1.2rem',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10B981', fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                  <Zap size={16} />
                  <span>Path A: Edge WebAssembly Engine</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <li><strong>MediaPipe Tasks Vision</strong>: Extracts 468 3D facial mesh coordinates in real-time.</li>
                  <li><strong>Geometric FACS Engine</strong>: Computes AU12 (Smile), AU4 (Brow Furrow), AU15 (Frown droop).</li>
                  <li><strong>52 Neural Blendshapes</strong>: Softmax ensemble fusing geometric and neural probabilities.</li>
                  <li><strong>Zero Latency</strong>: 100% on-device private execution.</li>
                </ul>
              </div>

              {/* Right Path: PyTorch Backend */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1.5px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '16px',
                padding: '1.2rem',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6366F1', fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                  <Cpu size={16} />
                  <span>Path B: Deep Learning FastAPI Server</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <li><strong>FastAPI REST API</strong>: Receives base64 image data payload.</li>
                  <li><strong>Haar Cascade Face Normalizer</strong>: Aligns and crops region of interest.</li>
                  <li><strong>EfficientNet-B5 (FER-4)</strong>: 30.4M parameter fine-tuned PyTorch neural classifier.</li>
                  <li><strong>Calibrated Softmax Logits</strong>: Outputs multiclass confidence scores.</li>
                </ul>
              </div>

            </div>

            {/* Down Arrow */}
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '1.2rem', lineHeight: 1 }}>↓</div>

            {/* Stage 3: Recommendation & Playback */}
            <div style={{
              background: 'var(--bg-surface)',
              border: `1.5px solid ${accentColor}40`,
              borderRadius: '16px',
              padding: '1.2rem',
              textAlign: 'center',
              boxShadow: `0 4px 16px ${accentColor}18`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: accentColor, fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.35rem' }}>
                <Music size={17} />
                <span>Emotion Mapping & Adaptive Audio Player</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '650px', marginLeft: 'auto', marginRight: 'auto' }}>
                Translates emotional vectors into psychological valence-energy pairs, querying audio tracks matching tempo, key, and mood, with real-time dynamic UI color synchronization.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Psychological Valence & Emotion Strategy Matrix */}
      <div className="glass-panel" style={{
        padding: '1.8rem',
        borderRadius: '24px',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Activity size={18} color={accentColor} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Mood-to-Music Psychology Matrix
          </h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
          How MoodBeat matches psychological valence-arousal states to specific audio acoustic characteristics:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
          
          {/* Happy */}
          <div className="glass-card" style={{ padding: '1.1rem', borderRadius: '16px', borderLeft: '4px solid #F59E0B' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#F59E0B', marginBottom: '0.3rem' }}>
              Happy Mood
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '0.4rem' }}>
              High Valence • High Energy (120-128 BPM)
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Curates dance-pop, disco beats, and celebratory Latin rhythms (e.g., Dua Lipa, Glass Animals, Senorita) to sustain euphoria.
            </p>
          </div>

          {/* Sad */}
          <div className="glass-card" style={{ padding: '1.1rem', borderRadius: '16px', borderLeft: '4px solid #3B82F6' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#3B82F6', marginBottom: '0.3rem' }}>
              Sad Mood
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '0.4rem' }}>
              Uplifting Valence • Moderate Energy (85-105 BPM)
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Selects motivational anthems, power-pop, and resilient rock (e.g., Kar Har Maidaan Fateh, Sia, Hall of Fame) for positive elevation.
            </p>
          </div>

          {/* Neutral */}
          <div className="glass-card" style={{ padding: '1.1rem', borderRadius: '16px', borderLeft: '4px solid #8B5CF6' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#8B5CF6', marginBottom: '0.3rem' }}>
              Neutral Mood
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '0.4rem' }}>
              Balanced Valence • Calm Energy (80-88 BPM)
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Delivers Lo-Fi hip-hop, chillout beats, and jazzhop (e.g., Nujabes, Cozy Lofi Beats) for deep focus, studying, and equilibrium.
            </p>
          </div>

          {/* Angry */}
          <div className="glass-card" style={{ padding: '1.1rem', borderRadius: '16px', borderLeft: '4px solid #F43F5E' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#F43F5E', marginBottom: '0.3rem' }}>
              Angry / Stressed Mood
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '0.4rem' }}>
              Soothing Valence • Low BPM Grounding (58-65 BPM)
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Channels calming acoustic classical piano, ambient guitar, and restful melodies (e.g., Gibran Alcocer, Blackmill) to reduce heart rate.
            </p>
          </div>

        </div>
      </div>

      {/* Tech Stack & Specifications */}
      <div className="glass-panel" style={{
        padding: '1.8rem',
        borderRadius: '24px',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
          <Code2 size={18} color={accentColor} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Technology Stack & Tools
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          
          <div className="glass-card" style={{ padding: '1rem', borderRadius: '14px' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: accentColor, marginBottom: '0.35rem' }}>Frontend Client</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              • React 18 SPA with Vite<br />
              • Strict TypeScript 5.0<br />
              • Glassmorphism CSS Architecture<br />
              • Lucide React Icons
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1rem', borderRadius: '14px' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#10B981', marginBottom: '0.35rem' }}>Computer Vision & ML</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              • Google MediaPipe Tasks Vision<br />
              • 468 3D Facial Landmarks<br />
              • Paul Ekman FACS Framework<br />
              • 52 ARKit Blendshapes
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1rem', borderRadius: '14px' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#6366F1', marginBottom: '0.35rem' }}>Backend & Deep Learning</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              • PyTorch 2.0+ Fine-Tuning<br />
              • EfficientNet-B5 FER-4 Model<br />
              • FastAPI Async Web Server<br />
              • Haar Cascade Preprocessing
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1rem', borderRadius: '14px' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#F59E0B', marginBottom: '0.35rem' }}>Audio & Theming</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              • HTML5 Web Audio Player<br />
              • Reactive Ambient Lighting Glow<br />
              • Dynamic Equalizer Animation<br />
              • Real-time Mood Blending
            </div>
          </div>

        </div>
      </div>

      {/* Bottom CTA & Return Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 1.8rem',
            borderRadius: '16px',
            background: accentColor,
            color: '#FFFFFF',
            fontSize: '0.95rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: `0 6px 20px ${accentColor}40`,
            transition: 'all 0.15s ease'
          }}
        >
          <Music size={18} />
          <span>Return to Music Player</span>
        </button>
      </div>

    </div>
  );
};

import React from 'react';
import { Radio, Camera, Disc3, Layers } from 'lucide-react';
import { EmotionType } from '../types';

interface NavbarProps {
  currentMood: EmotionType;
  snapshotUrl: string | null;
  accentColor: string;
  onOpenScanner: () => void;
  onToggleLibrary: () => void;
  isLibraryOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMood,
  snapshotUrl,
  accentColor,
  onOpenScanner,
  onToggleLibrary,
  isLibraryOpen
}) => {
  return (
    <header className="glass-panel" style={{ padding: '0.85rem 1.4rem', marginBottom: '1.25rem', borderRadius: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        
        {/* Brand Icon & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: `linear-gradient(135deg, ${accentColor}, #4F46E5)`,
            width: '40px',
            height: '40px',
            borderRadius: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 16px ${accentColor}40`
          }}>
            <Radio color="#FFF" size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, lineHeight: 1.1, color: '#FFF', letterSpacing: '-0.03em' }}>
                Mood<span style={{ color: accentColor }}>Beat</span>
              </h1>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '0.15rem 0.45rem',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-secondary)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                v2.0
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 400 }}>
              Real-Time Sentiment Audio Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          
          {/* Library Toggle Button */}
          <button
            onClick={onToggleLibrary}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              background: isLibraryOpen ? `${accentColor}1C` : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isLibraryOpen ? accentColor : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: isLibraryOpen ? accentColor : 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={14} />
            <span>{isLibraryOpen ? 'Mood Tracks' : 'Full Library'}</span>
          </button>

          {/* Scan Sentiment Button */}
          <button
            onClick={onOpenScanner}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.95rem',
              background: accentColor,
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#090C13',
              cursor: 'pointer',
              boxShadow: `0 4px 14px ${accentColor}35`,
              transition: 'transform 0.15s ease'
            }}
          >
            <Camera size={14} />
            <span>Scan Sentiment</span>
          </button>

          {/* Active Mood Pill & User Snapshot */}
          <div
            onClick={onOpenScanner}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.2rem 0.65rem 0.2rem 0.2rem',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${accentColor}35`,
              borderRadius: '12px',
              cursor: 'pointer'
            }}
            title="Current Detected Mood. Click to re-scan."
          >
            {snapshotUrl ? (
              <img
                src={snapshotUrl}
                alt="Captured Face"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  border: `1.5px solid ${accentColor}`
                }}
              />
            ) : (
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: `${accentColor}25`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: accentColor
              }}>
                <Disc3 size={14} />
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 600, color: accentColor }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: accentColor,
                display: 'inline-block'
              }} />
              <span>{currentMood}</span>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};

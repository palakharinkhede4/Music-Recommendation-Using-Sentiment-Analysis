import React from 'react';
import { Music, Camera, Sparkles, Library } from 'lucide-react';
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
    <header className="glass-panel" style={{ padding: '0.85rem 1.5rem', marginBottom: '1.5rem', borderRadius: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: `linear-gradient(135deg, ${accentColor}, #6366F1)`,
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 15px ${accentColor}55`
          }}>
            <Music color="#FFF" size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, lineHeight: 1.1, color: '#FFF' }}>
              Mood<span style={{ color: accentColor }}>Beat AI</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>
              AI Sentiment Music Player
            </p>
          </div>
        </div>

        {/* Top Right Action Controls: All Songs, Scan Vibe, Mini Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* Library Mode Toggle Button */}
          <button
            onClick={onToggleLibrary}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              background: isLibraryOpen ? `${accentColor}25` : 'rgba(255,255,255,0.06)',
              border: `1px solid ${isLibraryOpen ? accentColor : 'rgba(255,255,255,0.12)'}`,
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: isLibraryOpen ? accentColor : '#E5E7EB',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Library size={14} />
            <span>{isLibraryOpen ? 'Mood Tracks' : 'All 12 Songs'}</span>
          </button>

          {/* Capture New Snapshot Button */}
          <button
            onClick={onOpenScanner}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.95rem',
              background: accentColor,
              border: 'none',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#000',
              cursor: 'pointer',
              boxShadow: `0 4px 14px ${accentColor}44`,
              transition: 'transform 0.15s ease'
            }}
          >
            <Camera size={15} />
            <span>Scan Vibe</span>
          </button>

          {/* Captured Selfie Avatar + Mood Badge */}
          <div
            onClick={onOpenScanner}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.75rem 0.25rem 0.25rem',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${accentColor}44`,
              borderRadius: '24px',
              cursor: 'pointer'
            }}
            title="Click to view/retake snapshot"
          >
            {snapshotUrl ? (
              <img
                src={snapshotUrl}
                alt="Captured Face"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${accentColor}`
                }}
              />
            ) : (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: `${accentColor}33`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: accentColor
              }}>
                <Camera size={16} />
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600, color: accentColor }}>
              <Sparkles size={12} />
              <span>{currentMood}</span>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};

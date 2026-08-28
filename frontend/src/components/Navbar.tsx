import React from 'react';
import { Radio, Camera, Sun, Moon } from 'lucide-react';
import { EmotionType } from '../types';

interface NavbarProps {
  currentMood: EmotionType;
  snapshotUrl: string | null;
  accentColor: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenScanner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMood,
  snapshotUrl,
  accentColor,
  theme,
  onToggleTheme,
  onOpenScanner
}) => {
  return (
    <header className="glass-panel" style={{ padding: '0.85rem 1.4rem', marginBottom: '1.25rem', borderRadius: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        
        {/* Brand Icon & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: `linear-gradient(135deg, ${accentColor}, #6366F1)`,
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 14px ${accentColor}35`,
            color: '#FFFFFF'
          }}>
            <Radio size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Mood<span style={{ color: accentColor }}>Beat</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
              Music for your mood
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-hover)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          {/* Primary Detect Mood Button */}
          <button
            onClick={onOpenScanner}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1.1rem',
              background: accentColor,
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: `0 4px 14px ${accentColor}40`,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
          >
            <Camera size={16} />
            <span>Detect Mood</span>
          </button>

          {/* User Snapshot / Mood Chip */}
          <div
            onClick={onOpenScanner}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.2rem 0.65rem 0.2rem 0.25rem',
              background: 'var(--bg-surface-hover)',
              border: `1px solid ${accentColor}35`,
              borderRadius: '12px',
              cursor: 'pointer'
            }}
            title="Current mood • Tap to change"
          >
            {snapshotUrl ? (
              <img
                src={snapshotUrl}
                alt="Face Snapshot"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '9px',
                  objectFit: 'cover',
                  border: `1.5px solid ${accentColor}`
                }}
              />
            ) : (
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '9px',
                backgroundColor: `${accentColor}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: accentColor,
                fontWeight: 700,
                fontSize: '0.75rem'
              }}>
                <Camera size={15} />
              </div>
            )}

            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: accentColor }}>
              {currentMood}
            </span>
          </div>

        </div>

      </div>
    </header>
  );
};

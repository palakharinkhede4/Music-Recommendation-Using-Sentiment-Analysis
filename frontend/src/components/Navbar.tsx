import React from 'react';
import { Music, Camera, Activity, Sparkles } from 'lucide-react';
import { EmotionType } from '../types';

interface NavbarProps {
  currentMood: EmotionType;
  isCamActive: boolean;
  accentColor: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentMood, isCamActive, accentColor }) => {
  return (
    <header className="glass-panel" style={{ padding: '0.85rem 1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: `linear-gradient(135deg, ${accentColor}, #6366F1)`,
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 15px ${accentColor}66`
          }}>
            <Music color="#FFF" size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
              Mood<span style={{ color: accentColor }}>Beat</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              AI Real-Time Sentiment Music Recommender
            </p>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* Camera Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.8rem',
            background: isCamActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${isCamActive ? '#10B981' : '#EF4444'}`,
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 500,
            color: isCamActive ? '#10B981' : '#EF4444'
          }}>
            <Camera size={14} />
            <span>{isCamActive ? 'Vision Live' : 'Camera Off'}</span>
          </div>

          {/* Current Mood Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.9rem',
            background: `${accentColor}22`,
            border: `1px solid ${accentColor}66`,
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: accentColor,
            boxShadow: `0 0 12px ${accentColor}33`
          }}>
            <Sparkles size={14} />
            <span>Mood: {currentMood}</span>
          </div>

        </div>

      </div>
    </header>
  );
};

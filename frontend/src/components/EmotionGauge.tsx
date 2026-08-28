import React from 'react';
import { Sparkles } from 'lucide-react';
import { EmotionScore, EmotionType } from '../types';

interface EmotionGaugeProps {
  scores: EmotionScore[];
  primaryMood: EmotionType;
}

export const EmotionGauge: React.FC<EmotionGaugeProps> = ({ scores, primaryMood }) => {
  const filteredScores = scores.filter(s => s.emotion !== ('Surprise' as any));

  return (
    <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', borderRadius: '18px', marginBottom: '1.25rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          <Sparkles size={14} color="var(--active-accent)" />
          <span>Current Vibe</span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
          Mood Breakdown
        </span>
      </div>

      {/* 4 Mood Confidence Pills Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
        {filteredScores.map(({ emotion, score, color }) => {
          const isPrimary = emotion === primaryMood;
          const percentage = (score * 100).toFixed(0);

          return (
            <div
              key={emotion}
              style={{
                background: isPrimary ? `${color}18` : 'var(--bg-surface-hover)',
                border: `1.5px solid ${isPrimary ? color : 'transparent'}`,
                borderRadius: '14px',
                padding: '0.5rem 0.65rem',
                textAlign: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                fontSize: '0.72rem',
                color: isPrimary ? color : 'var(--text-secondary)',
                fontWeight: isPrimary ? 700 : 600
              }}>
                {emotion}
              </div>
              <div style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: isPrimary ? color : 'var(--text-primary)',
                margin: '0.1rem 0'
              }}>
                {percentage}%
              </div>
              <div style={{
                width: '100%',
                height: '3.5px',
                backgroundColor: 'var(--slider-track)',
                borderRadius: '3px',
                overflow: 'hidden',
                marginTop: '0.15rem'
              }}>
                <div style={{
                  width: `${percentage}%`,
                  height: '100%',
                  backgroundColor: color,
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

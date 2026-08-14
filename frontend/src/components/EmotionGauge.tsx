import React from 'react';
import { Activity } from 'lucide-react';
import { EmotionScore, EmotionType } from '../types';

interface EmotionGaugeProps {
  scores: EmotionScore[];
  primaryMood: EmotionType;
}

export const EmotionGauge: React.FC<EmotionGaugeProps> = ({ scores, primaryMood }) => {
  const filteredScores = scores.filter(s => s.emotion !== ('Surprise' as any));

  return (
    <div className="glass-panel" style={{ padding: '0.9rem 1.25rem', borderRadius: '18px', marginBottom: '1.25rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          <Activity size={14} color="var(--active-accent)" />
          <span>Real-Time Sentiment Metrics</span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
          Neural Vision Analysis
        </span>
      </div>

      {/* Compact Horizontal Grid for 4 Sentiments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
        {filteredScores.map(({ emotion, score, color }) => {
          const isPrimary = emotion === primaryMood;
          const percentage = (score * 100).toFixed(0);

          return (
            <div
              key={emotion}
              style={{
                background: isPrimary ? `${color}14` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isPrimary ? `${color}55` : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '12px',
                padding: '0.55rem 0.75rem',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                fontSize: '0.72rem',
                color: isPrimary ? color : 'var(--text-secondary)',
                fontWeight: isPrimary ? 700 : 500,
                letterSpacing: '0.01em'
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
              {/* Refined Indicator Bar */}
              <div style={{
                width: '100%',
                height: '3.5px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: '3px',
                overflow: 'hidden',
                marginTop: '0.2rem'
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

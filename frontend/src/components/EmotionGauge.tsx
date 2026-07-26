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
    <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: '20px', marginBottom: '1.25rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#FFF' }}>
          <Activity size={15} color="var(--active-accent)" />
          <span>Emotion Confidence Scores</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>4 Core Sentiments</span>
      </div>

      {/* Compact Horizontal Grid for 4 Emotions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem' }}>
        {filteredScores.map(({ emotion, score, color }) => {
          const isPrimary = emotion === primaryMood;
          const percentage = (score * 100).toFixed(0);

          return (
            <div
              key={emotion}
              style={{
                background: isPrimary ? `${color}18` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isPrimary ? color : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '14px',
                padding: '0.5rem 0.65rem',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: isPrimary ? color : '#9CA3AF', fontWeight: isPrimary ? 700 : 500 }}>
                {emotion}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isPrimary ? color : '#FFF', margin: '0.1rem 0' }}>
                {percentage}%
              </div>
              {/* Mini Bar */}
              <div style={{
                width: '100%',
                height: '4px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: '4px',
                overflow: 'hidden',
                marginTop: '0.2rem'
              }}>
                <div style={{
                  width: `${percentage}%`,
                  height: '100%',
                  backgroundColor: color
                }} />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

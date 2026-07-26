import React from 'react';
import { Activity, Smile, Frown, Meh, Flame, Zap } from 'lucide-react';
import { EmotionScore, EmotionType } from '../types';

interface EmotionGaugeProps {
  scores: EmotionScore[];
  primaryMood: EmotionType;
}

const EMOTION_ICONS: Record<EmotionType, React.ReactNode> = {
  Happy: <Smile size={16} color="#EAB308" />,
  Sad: <Frown size={16} color="#3B82F6" />,
  Neutral: <Meh size={16} color="#8B5CF6" />,
  Angry: <Flame size={16} color="#EF4444" />,
  Surprise: <Zap size={16} color="#EC4899" />
};

export const EmotionGauge: React.FC<EmotionGaugeProps> = ({ scores, primaryMood }) => {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginTop: '1rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="var(--active-accent)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Sentiment Distribution</h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-Time Inference</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {scores.map(({ emotion, score, color }) => {
          const isPrimary = emotion === primaryMood;
          const percentage = (score * 100).toFixed(1);

          return (
            <div key={emotion} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: isPrimary ? 600 : 400, color: isPrimary ? color : 'var(--text-main)' }}>
                  {EMOTION_ICONS[emotion]}
                  <span>{emotion}</span>
                </div>
                <span style={{ fontWeight: 600, color: isPrimary ? color : 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {percentage}%
                </span>
              </div>

              {/* Progress Track */}
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  width: `${percentage}%`,
                  height: '100%',
                  backgroundColor: color,
                  borderRadius: 'var(--radius-full)',
                  boxShadow: isPrimary ? `0 0 12px ${color}` : 'none',
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

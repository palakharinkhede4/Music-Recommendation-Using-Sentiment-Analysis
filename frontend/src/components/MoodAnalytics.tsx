import React from 'react';
import { BarChart3, Clock } from 'lucide-react';
import { EmotionType } from '../types';

interface MoodAnalyticsProps {
  history: EmotionType[];
  accentColor: string;
}

const EMOTION_COLORS: Record<EmotionType, string> = {
  Happy: '#EAB308',
  Sad: '#3B82F6',
  Neutral: '#8B5CF6',
  Angry: '#EF4444'
};

export const MoodAnalytics: React.FC<MoodAnalyticsProps> = ({ history, accentColor }) => {
  const totalDetections = history.length || 1;

  const counts: Record<EmotionType, number> = {
    Happy: history.filter(h => h === 'Happy').length,
    Sad: history.filter(h => h === 'Sad').length,
    Neutral: history.filter(h => h === 'Neutral').length,
    Angry: history.filter(h => h === 'Angry').length,
  };

  const emotions: EmotionType[] = ['Happy', 'Neutral', 'Sad', 'Angry'];

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginTop: '1.5rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={18} color={accentColor} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Mood Session Analytics</h2>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Clock size={12} />
          <span>{history.length} Live Check-Ins</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {emotions.map(m => {
          const cnt = counts[m];
          const pct = ((cnt / totalDetections) * 100).toFixed(0);
          const col = EMOTION_COLORS[m];

          return (
            <div
              key={m}
              style={{
                background: `${col}12`,
                border: `1px solid ${col}44`,
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: col, fontWeight: 600, marginBottom: '0.2rem' }}>
                {m}
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {pct}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                {cnt} check-ins
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>
          Recent Mood Timeline
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', maxHeight: '50px', overflow: 'hidden' }}>
          {history.slice(-25).map((item, idx) => (
            <span
              key={idx}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: EMOTION_COLORS[item] || '#8B5CF6',
                boxShadow: `0 0 6px ${EMOTION_COLORS[item] || '#8B5CF6'}`,
                display: 'inline-block'
              }}
              title={`Check-in #${idx + 1}: ${item}`}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

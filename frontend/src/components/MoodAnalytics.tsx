import React from 'react';
import { BarChart2, Clock } from 'lucide-react';
import { EmotionType } from '../types';

interface MoodAnalyticsProps {
  history: EmotionType[];
  accentColor: string;
}

const EMOTION_COLORS: Record<EmotionType, string> = {
  Happy: '#F59E0B',
  Sad: '#3B82F6',
  Neutral: '#8B5CF6',
  Angry: '#F43F5E'
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
    <div className="glass-panel" style={{ padding: '1.25rem', marginTop: '1.25rem', borderRadius: '18px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <BarChart2 size={16} color={accentColor} />
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Session Sentiment Distribution
          </h2>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 500 }}>
          <Clock size={12} />
          <span>{history.length} Live Check-Ins</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))', gap: '0.65rem', marginBottom: '1.1rem' }}>
        {emotions.map(m => {
          const cnt = counts[m];
          const pct = ((cnt / totalDetections) * 100).toFixed(0);
          const col = EMOTION_COLORS[m];

          return (
            <div
              key={m}
              style={{
                background: `${col}0E`,
                border: `1px solid ${col}30`,
                borderRadius: '12px',
                padding: '0.65rem',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: col, fontWeight: 600, marginBottom: '0.15rem' }}>
                {m}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {pct}%
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                {cnt} {cnt === 1 ? 'scan' : 'scans'}
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.45rem', fontWeight: 600 }}>
          Timeline Sequence
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', maxHeight: '45px', overflow: 'hidden' }}>
          {history.slice(-25).map((item, idx) => (
            <span
              key={idx}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: EMOTION_COLORS[item] || '#8B5CF6',
                boxShadow: `0 0 6px ${EMOTION_COLORS[item]}55`,
                display: 'inline-block'
              }}
              title={`Scan #${idx + 1}: ${item}`}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

import React from 'react';
import { Camera, Calendar, History } from 'lucide-react';
import { EmotionType } from '../types';

export interface MoodSnapshotLog {
  id: string;
  mood: EmotionType;
  timestamp: string;
  snapshotUrl: string;
  vibeTag: string;
}

interface MoodJournalProps {
  logs: MoodSnapshotLog[];
  accentColor: string;
  onOpenScanner: () => void;
}

const EMOTION_COLORS: Record<EmotionType, string> = {
  Happy: '#F59E0B',
  Sad: '#3B82F6',
  Neutral: '#8B5CF6',
  Angry: '#F43F5E'
};

export const MoodJournal: React.FC<MoodJournalProps> = ({ logs, accentColor, onOpenScanner }) => {
  if (logs.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginTop: '1.25rem', borderRadius: '18px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <History size={16} color={accentColor} />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Session Sentiment Snapshots
          </h3>
        </div>

        <button
          onClick={onOpenScanner}
          style={{
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}44`,
            color: accentColor,
            padding: '0.3rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Camera size={13} />
          <span>New Snapshot</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.65rem' }}>
        {logs.map(log => {
          const col = EMOTION_COLORS[log.mood];

          return (
            <div
              key={log.id}
              className="glass-card"
              style={{
                padding: '0.45rem',
                borderRadius: '12px',
                border: `1px solid ${col}33`,
                background: `${col}0C`
              }}
            >
              <div style={{
                width: '100%',
                height: '85px',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '0.35rem',
                border: `1px solid ${col}44`
              }}>
                <img src={log.snapshotUrl} alt={log.mood} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: col }}>
                  {log.mood}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                  {log.timestamp}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

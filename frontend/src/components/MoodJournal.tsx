import React from 'react';
import { Camera, Calendar } from 'lucide-react';
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
  Happy: '#EAB308',
  Sad: '#3B82F6',
  Neutral: '#8B5CF6',
  Angry: '#EF4444'
};

export const MoodJournal: React.FC<MoodJournalProps> = ({ logs, accentColor, onOpenScanner }) => {
  if (logs.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginTop: '1.25rem', borderRadius: '20px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={17} color={accentColor} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#FFF' }}>Session Vibe Snapshots</h3>
        </div>

        <button
          onClick={onOpenScanner}
          style={{
            background: `${accentColor}25`,
            border: `1px solid ${accentColor}66`,
            color: accentColor,
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Camera size={13} />
          <span>New Snapshot</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
        {logs.map(log => {
          const col = EMOTION_COLORS[log.mood];

          return (
            <div
              key={log.id}
              className="glass-card"
              style={{
                padding: '0.5rem',
                borderRadius: '14px',
                border: `1px solid ${col}44`,
                background: `${col}10`
              }}
            >
              <div style={{
                width: '100%',
                height: '90px',
                borderRadius: '10px',
                overflow: 'hidden',
                marginBottom: '0.4rem',
                border: `1px solid ${col}66`
              }}>
                <img src={log.snapshotUrl} alt={log.mood} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: col }}>
                  {log.mood}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>
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

import React from 'react';
import { Camera, Calendar, Sparkles } from 'lucide-react';
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
  Angry: '#EF4444',
  Surprise: '#EC4899'
};

export const MoodJournal: React.FC<MoodJournalProps> = ({ logs, accentColor, onOpenScanner }) => {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginTop: '1.25rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} color={accentColor} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Vibe Snapshot History</h3>
        </div>

        <button
          onClick={onOpenScanner}
          style={{
            background: `${accentColor}25`,
            border: `1px solid ${accentColor}66`,
            color: accentColor,
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Camera size={14} />
          Scan New Snapshot
        </button>
      </div>

      {/* Snapshots Gallery */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {logs.map(log => {
          const col = EMOTION_COLORS[log.mood];

          return (
            <div
              key={log.id}
              className="glass-card"
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${col}44`,
                background: `${col}10`
              }}
            >
              {/* Snapshot Thumbnail */}
              <div style={{
                width: '100%',
                height: '95px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                marginBottom: '0.4rem',
                border: `1px solid ${col}66`
              }}>
                <img src={log.snapshotUrl} alt={log.mood} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Meta */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: col }}>
                  {log.mood}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
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

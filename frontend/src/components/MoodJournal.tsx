import React from 'react';
import { Camera } from 'lucide-react';
import { EmotionType } from '../types';
export interface MoodSnapshotLog { id: string; mood: EmotionType; timestamp: string; snapshotUrl: string; vibeTag: string; }
interface MoodJournalProps { logs: MoodSnapshotLog[]; accentColor: string; onOpenScanner: () => void; }
const COLORS: Record<EmotionType, string> = { Happy: '#F59E0B', Sad: '#3B82F6', Neutral: '#8B5CF6', Angry: '#F43F5E' };
export const MoodJournal: React.FC<MoodJournalProps> = ({ logs, onOpenScanner }) => {
  if (!logs.length) return null;
  return <section className="journal-panel surface" aria-labelledby="journal-heading">
    <div className="section-heading"><h2 id="journal-heading">Recent moods</h2><button className="text-button" onClick={onOpenScanner}><Camera size={13} /> New check</button></div>
    <div className="journal-grid">{logs.map(log => <article className="journal-card" key={log.id}>
      <img src={log.snapshotUrl} alt={log.mood + ' mood snapshot'} />
      <div><span><i style={{ background: COLORS[log.mood], marginRight: 5 }} />{log.mood}</span><span className="muted">{log.timestamp}</span></div>
    </article>)}</div>
  </section>;
};

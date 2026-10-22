import React from 'react';
import { EmotionType } from '../types';
interface MoodAnalyticsProps { history: EmotionType[]; accentColor: string; }
const COLORS: Record<EmotionType, string> = { Happy: '#F59E0B', Sad: '#3B82F6', Neutral: '#8B5CF6', Angry: '#F43F5E' };
const emotions: EmotionType[] = ['Happy', 'Neutral', 'Sad', 'Angry'];
export const MoodAnalytics: React.FC<MoodAnalyticsProps> = ({ history }) => (
  <section className="analytics-panel surface" aria-labelledby="analytics-heading">
    <div className="section-heading"><h2 id="analytics-heading">Session moods</h2><span className="muted">{history.length} {history.length === 1 ? 'entry' : 'entries'}</span></div>
    <div className="session-bar" role="img" aria-label="Mood distribution for this session">
      {emotions.map(m => <span key={m} style={{ width: (history.filter(h => h === m).length / (history.length || 1) * 100) + '%', background: COLORS[m] }} />)}
    </div>
    <div className="session-legend">{emotions.map(m => {
      const count = history.filter(h => h === m).length;
      return <span key={m} title={count + (count === 1 ? ' entry' : ' entries')}><i style={{ background: COLORS[m] }} />{m}<strong>{Math.round(count / (history.length || 1) * 100)}%</strong></span>;
    })}</div>
    <div className="timeline"><span className="muted">Timeline</span><div>{history.slice(-25).map((m, i) => <span key={i} style={{ background: COLORS[m] }} title={'Entry ' + (Math.max(0, history.length - 25) + i + 1) + ': ' + m} />)}</div></div>
  </section>
);

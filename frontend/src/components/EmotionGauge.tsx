import React from 'react';
import { EmotionScore, EmotionType } from '../types';
interface EmotionGaugeProps { scores: EmotionScore[]; primaryMood: EmotionType; hasScanned: boolean; }
export const EmotionGauge: React.FC<EmotionGaugeProps> = ({ scores, primaryMood, hasScanned }) => (
  <section className="mood-panel surface" aria-labelledby="mood-heading">
    <div className="section-heading"><h2 id="mood-heading">Mood mix</h2>{!hasScanned && <span className="muted">Not scanned yet</span>}</div>
    <div className="mood-meters">
      {scores.filter(s => s.emotion !== ('Surprise' as any)).map(({ emotion, score, color }) => (
        <div key={emotion} className={'mood-meter ' + (primaryMood === emotion ? 'primary' : '')}>
          <div><span><i style={{ background: color }} />{emotion}</span><strong>{(score * 100).toFixed(0)}<small>%</small></strong></div>
          <div className="meter-track"><span style={{ width: (score * 100) + '%', background: color }} /></div>
        </div>
      ))}
    </div>
  </section>
);

import React from 'react';
import { ArrowLeft, Github, Linkedin, Globe, ExternalLink } from 'lucide-react';
import { EmotionType } from '../types';
interface AboutProjectProps { onBack: () => void; accentColor: string; currentMood: EmotionType; }
const links = [
  { label: 'Portfolio', href: 'https://palakharinkhede4.github.io/', Icon: Globe },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/palakharinkhede/', Icon: Linkedin },
  { label: 'GitHub', href: 'https://github.com/palakharinkhede4', Icon: Github },
  { label: 'Source code', href: 'https://github.com/palakharinkhede4/Music-Recommendation-Using-Sentiment-Analysis', Icon: ExternalLink }
];
const strategies = [
  { mood: 'Happy', color: '#F59E0B', copy: 'Upbeat pop, dance and Latin rhythms to keep the energy going.', tempo: '120–128 BPM' },
  { mood: 'Sad', color: '#3B82F6', copy: 'Motivational anthems and uplifting pop for a little lift.', tempo: '85–105 BPM' },
  { mood: 'Neutral', color: '#8B5CF6', copy: 'Lo-fi, jazzhop and ambient tracks for focus and easy listening.', tempo: '80–88 BPM' },
  { mood: 'Angry', color: '#F43F5E', copy: 'Gentle piano, acoustic and ambient music to wind down.', tempo: '58–65 BPM' }
];
export const AboutProject: React.FC<AboutProjectProps> = ({ onBack }) => (
  <div className="about-page">
    <header className="about-header"><h1>About MoodBeat.</h1></header>
    <section className="surface about-section">
      <div className="creator-row"><img src="/palak.jpg" alt="Palak Harinkhede" /><div><span className="eyebrow">CREATED BY</span><h2>Palak Harinkhede</h2><p>AI / ML engineer & full-stack developer</p></div></div>
      <div className="creator-links">{links.map(({ label, href, Icon }) => <a key={label} href={href} target="_blank" rel="noopener noreferrer"><Icon size={15} />{label}</a>)}</div>
    </section>
    <section className="surface about-section" aria-labelledby="how-heading">
      <h2 id="how-heading">From expression to playlist</h2>
      <div className="pipeline-grid">
        <div className="pipeline-step"><span>01</span><h3>Capture</h3><p>Take a webcam photo or upload a selfie.</p></div>
        <div className="pipeline-step"><span>02</span><h3>Analyze</h3><p>MediaPipe and FACS estimate four moods from facial expressions.</p></div>
        <div className="pipeline-step"><span>03</span><h3>Listen</h3><p>Auto sync matches each scan to music. Mood filters let you browse manually.</p></div>
      </div>
      <p className="about-note">The browser engine uses 468 facial landmarks, including smile, brow and frown measurements, plus 52 blendshapes. An optional research backend uses FastAPI, Haar face preprocessing and a fine-tuned EfficientNet-B5 classifier with calibrated confidence scores.</p>
    </section>
    <section className="surface about-section" aria-labelledby="strategy-heading">
      <h2 id="strategy-heading">Four moods, four directions</h2>
      <div className="strategy-grid">{strategies.map(s => <div key={s.mood}><h3><i style={{ background: s.color }} />{s.mood}<span className="muted">{s.tempo}</span></h3><p>{s.copy}</p></div>)}</div>
    </section>
    <section className="surface about-section"><h2>Built with</h2><div className="tech-list">{['React 18', 'TypeScript', 'Vite', 'MediaPipe', 'FACS', 'PyTorch', 'EfficientNet-B5', 'FastAPI', 'HTML5 Audio', 'Lucide'].map(t => <span key={t}>{t}</span>)}</div></section>
    <button className="text-button" onClick={onBack}><ArrowLeft size={14} /> Back to listening</button>
  </div>
);

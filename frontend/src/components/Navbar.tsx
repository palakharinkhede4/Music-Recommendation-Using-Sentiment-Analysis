import React from 'react';
import { Radio, Camera, Sun, Moon, Info, Disc3 } from 'lucide-react';
import { EmotionType } from '../types';

interface NavbarProps {
  currentMood: EmotionType;
  snapshotUrl: string | null;
  accentColor: string;
  theme: 'light' | 'dark';
  activeView: 'player' | 'about';
  onToggleTheme: () => void;
  onOpenScanner: () => void;
  onToggleAbout: () => void;
  onNavigatePlayer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentMood, snapshotUrl, theme, activeView,
  onToggleTheme, onOpenScanner, onToggleAbout, onNavigatePlayer }) => (
  <aside className="sidebar">
    <button className="brand" onClick={onNavigatePlayer} aria-label="MoodBeat home">
      <span className="brand-mark"><Radio size={23} /></span>
      <span>MoodBeat<span className="brand-dot">.</span></span>
    </button>
    <nav className="main-nav" aria-label="Main navigation">
      <button className={'nav-item ' + (activeView === 'player' ? 'active' : '')}
        aria-current={activeView === 'player' ? 'page' : undefined} onClick={onNavigatePlayer}>
        <Disc3 size={19} /><span>Listen</span>
      </button>
      <button className={'nav-item ' + (activeView === 'about' ? 'active' : '')}
        aria-label="About the project"
        aria-current={activeView === 'about' ? 'page' : undefined} onClick={onToggleAbout}>
        <Info size={19} /><span>About</span>
      </button>
    </nav>
    <div className="sidebar-bottom">
      <div className="mood-invite">
        <button className="primary-button" onClick={onOpenScanner}><Camera size={18} />Detect mood</button>
      </div>
      <div className="sidebar-footer">
        <button className="profile-mood" onClick={onOpenScanner} aria-label={'Current mood: ' + currentMood + '. Scan again'}>
          {snapshotUrl ? <img src={snapshotUrl} alt="Latest mood snapshot" /> : <span className="mood-avatar"><Radio size={18} /></span>}
          <span><small>Current mood</small><strong>{currentMood}</strong></span>
        </button>
        <button className="icon-button" onClick={onToggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </div>
  </aside>
);

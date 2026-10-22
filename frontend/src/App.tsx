import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EmotionGauge } from './components/EmotionGauge';
import { MusicPlayer } from './components/MusicPlayer';
import { Playlist } from './components/Playlist';
import { MoodAnalytics } from './components/MoodAnalytics';
import { MoodScannerModal } from './components/MoodScannerModal';
import { MoodJournal, MoodSnapshotLog } from './components/MoodJournal';
import { AboutProject } from './components/AboutProject';

import { Track, EmotionType, EmotionScore } from './types';
import { fetchRecommendations, logSentiment } from './services/api';

const EMOTION_COLORS: Record<EmotionType, string> = {
  Happy: '#F59E0B',
  Sad: '#3B82F6',
  Neutral: '#8B5CF6',
  Angry: '#F43F5E'
};

const DEFAULT_SCORES: EmotionScore[] = [
  { emotion: 'Happy', score: 0.15, color: EMOTION_COLORS.Happy },
  { emotion: 'Neutral', score: 0.65, color: EMOTION_COLORS.Neutral },
  { emotion: 'Sad', score: 0.12, color: EMOTION_COLORS.Sad },
  { emotion: 'Angry', score: 0.08, color: EMOTION_COLORS.Angry },
];

export const App: React.FC = () => {
  // Navigation View: 'player' (Default) or 'about' (System Architecture & Owner Info)
  const [activeView, setActiveView] = useState<'player' | 'about'>('player');

  useEffect(() => { window.scrollTo({ top: 0 }); }, [activeView]);

  // Light / Dark Theme State defaulting to System Preferences
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('moodbeat_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [currentMood, setCurrentMood] = useState<EmotionType>('Neutral');
  const [selectedFilterMood, setSelectedFilterMood] = useState<EmotionType>('Neutral');
  const [emotionScores, setEmotionScores] = useState<EmotionScore[]>(DEFAULT_SCORES);
  
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [isLibraryMode, setIsLibraryMode] = useState<boolean>(false);
  
  // Session history (fresh per browser session)
  const [moodHistory, setMoodHistory] = useState<EmotionType[]>(['Neutral']);
  const [snapshotLogs, setSnapshotLogs] = useState<MoodSnapshotLog[]>([]);
  
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [latestSnapshotUrl, setLatestSnapshotUrl] = useState<string | null>(null);

  const accentColor = EMOTION_COLORS[currentMood];

  // Apply Theme Attribute to root document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('moodbeat_theme', theme);
  }, [theme]);

  // Listen for system theme preference changes if user hasn't explicitly overridden
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('moodbeat_theme_override')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('moodbeat_theme_override', 'true');
  };

  // Load Tracks
  useEffect(() => {
    async function loadTracks() {
      const recs = await fetchRecommendations(currentMood);
      setAllTracks(recs);
      if (recs.length > 0) {
        const moodMatched = recs.filter(t => t.mood === currentMood);
        if (moodMatched.length > 0 && (!currentTrack || autoSync)) {
          setCurrentTrack(moodMatched[0]);
        }
      }
    }
    loadTracks();
  }, [currentMood, autoSync]);

  // Update Dynamic Theme Accents in CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--active-accent', accentColor);
    document.documentElement.style.setProperty('--active-accent-glow', `${accentColor}25`);
  }, [accentColor]);

  // Handle Camera Snapshot Scan Complete
  const handleScanComplete = (primary: EmotionType, scores: EmotionScore[], snapshotDataUrl: string) => {
    setEmotionScores(scores);
    setCurrentMood(primary);
    setSelectedFilterMood(primary);
    setMoodHistory(prev => [...prev, primary]);
    setLatestSnapshotUrl(snapshotDataUrl);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog: MoodSnapshotLog = {
      id: `log_${Date.now()}`,
      mood: primary,
      timestamp: nowStr,
      snapshotUrl: snapshotDataUrl,
      vibeTag: primary
    };

    setSnapshotLogs(prev => [newLog, ...prev]);
    logSentiment(primary, scores.find(s => s.emotion === primary)?.score || 0.9);
  };

  // Playlist track navigation
  const activePlaylist = isLibraryMode
    ? allTracks
    : allTracks.filter(t => t.mood === currentMood);

  const handleNextTrack = () => {
    if (activePlaylist.length === 0) return;
    const currentIndex = activePlaylist.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % activePlaylist.length;
    setCurrentTrack(activePlaylist[nextIndex]);
  };

  const handlePrevTrack = () => {
    if (activePlaylist.length === 0) return;
    const currentIndex = activePlaylist.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + activePlaylist.length) % activePlaylist.length;
    setCurrentTrack(activePlaylist[prevIndex]);
  };

  return (
    <div className="app-container">
      <Navbar currentMood={currentMood} snapshotUrl={latestSnapshotUrl} accentColor={accentColor}
        theme={theme} activeView={activeView} onToggleTheme={handleToggleTheme}
        onOpenScanner={() => setIsScannerOpen(true)}
        onToggleAbout={() => setActiveView(activeView === 'player' ? 'about' : 'player')}
        onNavigatePlayer={() => setActiveView('player')} />
      <main className="workspace" id="main-content">
        {activeView === 'about' ? (
          <AboutProject onBack={() => setActiveView('player')} accentColor={accentColor} currentMood={currentMood} />
        ) : (
          <>
            <header className="workspace-header">
              <h1>Your rotation<span>.</span></h1>
              <div className="edition-mark" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
            </header>
            <div className="listening-grid">
              <div className="collection-column">
                <EmotionGauge scores={emotionScores} primaryMood={currentMood} hasScanned={snapshotLogs.length > 0} />
                <Playlist tracks={allTracks} currentTrackId={currentTrack?.id || null} selectedMood={selectedFilterMood}
                  accentColor={accentColor} isLibraryMode={isLibraryMode} onSelectTrack={setCurrentTrack}
                  onFilterMood={(m) => { setSelectedFilterMood(m); fetchRecommendations(m).then(t => setAllTracks(t)); }}
                  onToggleLibrary={() => setIsLibraryMode(!isLibraryMode)} />
                <MoodAnalytics history={moodHistory} accentColor={accentColor} />
              </div>
              <MusicPlayer track={currentTrack} currentMood={currentMood} accentColor={accentColor}
                onNext={handleNextTrack} onPrev={handlePrevTrack} autoSync={autoSync} onToggleAutoSync={() => setAutoSync(!autoSync)} />
            </div>
            <MoodJournal logs={snapshotLogs} accentColor={accentColor} onOpenScanner={() => setIsScannerOpen(true)} />
          </>
        )}
      </main>
      <MoodScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanComplete={handleScanComplete} accentColor={accentColor} />
    </div>
  );
};
export default App;

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EmotionGauge } from './components/EmotionGauge';
import { MusicPlayer } from './components/MusicPlayer';
import { Playlist } from './components/Playlist';
import { MoodAnalytics } from './components/MoodAnalytics';
import { MoodScannerModal } from './components/MoodScannerModal';
import { MoodFusion } from './components/MoodFusion';
import { MoodJournal, MoodSnapshotLog } from './components/MoodJournal';

import { Track, EmotionType, EmotionScore } from './types';
import { fetchRecommendations, logSentiment } from './services/api';

const EMOTION_COLORS: Record<EmotionType, string> = {
  Happy: '#EAB308',
  Sad: '#3B82F6',
  Neutral: '#8B5CF6',
  Angry: '#EF4444'
};

const DEFAULT_SCORES: EmotionScore[] = [
  { emotion: 'Happy', score: 0.15, color: EMOTION_COLORS.Happy },
  { emotion: 'Neutral', score: 0.65, color: EMOTION_COLORS.Neutral },
  { emotion: 'Sad', score: 0.12, color: EMOTION_COLORS.Sad },
  { emotion: 'Angry', score: 0.08, color: EMOTION_COLORS.Angry },
];

const INITIAL_LOGS: MoodSnapshotLog[] = [
  {
    id: 'log_01',
    mood: 'Happy',
    timestamp: '6:15 PM',
    snapshotUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    vibeTag: 'Upbeat Energy & Dance Vibe ✨'
  }
];

export const App: React.FC = () => {
  const [currentMood, setCurrentMood] = useState<EmotionType>('Neutral');
  const [selectedFilterMood, setSelectedFilterMood] = useState<EmotionType>('Neutral');
  const [emotionScores, setEmotionScores] = useState<EmotionScore[]>(DEFAULT_SCORES);
  
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [isLibraryMode, setIsLibraryMode] = useState<boolean>(false);
  const [moodHistory, setMoodHistory] = useState<EmotionType[]>(['Neutral', 'Happy']);
  const [snapshotLogs, setSnapshotLogs] = useState<MoodSnapshotLog[]>(INITIAL_LOGS);
  
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [latestSnapshotUrl, setLatestSnapshotUrl] = useState<string | null>(null);

  const accentColor = EMOTION_COLORS[currentMood];

  // Load All Tracks
  useEffect(() => {
    async function loadTracks() {
      const recs = await fetchRecommendations(currentMood);
      setAllTracks(recs);
      if (recs.length > 0) {
        // Filter only the 3 tracks for the current mood
        const moodMatched = recs.filter(t => t.mood === currentMood);
        if (moodMatched.length > 0 && (!currentTrack || autoSync)) {
          setCurrentTrack(moodMatched[0]);
        }
      }
    }
    loadTracks();
  }, [currentMood, autoSync]);

  // Update Dynamic Theme Accents
  useEffect(() => {
    document.documentElement.style.setProperty('--active-accent', accentColor);
    document.documentElement.style.setProperty('--active-accent-glow', `${accentColor}35`);
  }, [accentColor]);

  // Handle Scan Completion
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
      vibeTag: `${primary} Vibe Check`
    };

    setSnapshotLogs(prev => [newLog, ...prev]);
    logSentiment(primary, scores.find(s => s.emotion === primary)?.score || 0.9);
  };

  // Next / Prev Track Navigation (respecting active filter mode)
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
    <div className="app-container" style={{ maxWidth: '1100px' }}>
      
      {/* Top Navbar with Captured Selfie Avatar */}
      <Navbar
        currentMood={currentMood}
        snapshotUrl={latestSnapshotUrl}
        accentColor={accentColor}
        onOpenScanner={() => setIsScannerOpen(true)}
        onToggleLibrary={() => setIsLibraryMode(!isLibraryMode)}
        isLibraryOpen={isLibraryMode}
      />

      {/* Compact Emotion Confidence Gauge */}
      <EmotionGauge
        scores={emotionScores}
        primaryMood={currentMood}
      />

      {/* CORE MUSIC PLAYER EXPERIENCE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
        
        {/* Sleek Hero Music Player */}
        <MusicPlayer
          track={currentTrack}
          currentMood={currentMood}
          accentColor={accentColor}
          onNext={handleNextTrack}
          onPrev={handlePrevTrack}
          autoSync={autoSync}
          onToggleAutoSync={() => setAutoSync(!autoSync)}
        />

        {/* 3-Song Mood Playlist */}
        <Playlist
          tracks={allTracks}
          currentTrackId={currentTrack?.id || null}
          selectedMood={selectedFilterMood}
          accentColor={accentColor}
          isLibraryMode={isLibraryMode}
          onSelectTrack={(t) => setCurrentTrack(t)}
          onFilterMood={(m) => {
            setSelectedFilterMood(m);
            fetchRecommendations(m).then(t => setAllTracks(t));
          }}
          onToggleLibrary={() => setIsLibraryMode(!isLibraryMode)}
        />

      </div>

      {/* Secondary Features (Mood Fusion & Analytics) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '1.25rem' }}>
        <MoodFusion
          primaryMood={currentMood}
          accentColor={accentColor}
          onBlendChange={(label, sec, ratio) => {}}
        />

        <MoodJournal
          logs={snapshotLogs}
          accentColor={accentColor}
          onOpenScanner={() => setIsScannerOpen(true)}
        />
      </div>

      <MoodAnalytics
        history={moodHistory}
        accentColor={accentColor}
      />

      {/* Camera Scan Modal */}
      <MoodScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handleScanComplete}
        accentColor={accentColor}
      />

    </div>
  );
};

export default App;

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
import { Camera, Sparkles, Sliders } from 'lucide-react';

const EMOTION_COLORS: Record<EmotionType, string> = {
  Happy: '#EAB308',
  Sad: '#3B82F6',
  Neutral: '#8B5CF6',
  Angry: '#EF4444',
  Surprise: '#EC4899'
};

const DEFAULT_SCORES: EmotionScore[] = [
  { emotion: 'Happy', score: 0.15, color: EMOTION_COLORS.Happy },
  { emotion: 'Neutral', score: 0.65, color: EMOTION_COLORS.Neutral },
  { emotion: 'Sad', score: 0.08, color: EMOTION_COLORS.Sad },
  { emotion: 'Surprise', score: 0.07, color: EMOTION_COLORS.Surprise },
  { emotion: 'Angry', score: 0.05, color: EMOTION_COLORS.Angry },
];

const INITIAL_LOGS: MoodSnapshotLog[] = [
  {
    id: 'log_01',
    mood: 'Happy',
    timestamp: '6:15 PM',
    snapshotUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    vibeTag: 'Main Character Energy ✨'
  },
  {
    id: 'log_02',
    mood: 'Neutral',
    timestamp: '2:30 PM',
    snapshotUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    vibeTag: 'Deep Focus & Zen 🎧'
  }
];

export const App: React.FC = () => {
  const [currentMood, setCurrentMood] = useState<EmotionType>('Neutral');
  const [selectedFilterMood, setSelectedFilterMood] = useState<EmotionType>('Neutral');
  const [emotionScores, setEmotionScores] = useState<EmotionScore[]>(DEFAULT_SCORES);
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [moodHistory, setMoodHistory] = useState<EmotionType[]>(['Neutral', 'Happy', 'Neutral']);
  const [snapshotLogs, setSnapshotLogs] = useState<MoodSnapshotLog[]>(INITIAL_LOGS);
  
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [latestSnapshotUrl, setLatestSnapshotUrl] = useState<string | null>(INITIAL_LOGS[0].snapshotUrl);
  const [blendedVibeName, setBlendedVibeName] = useState<string | null>(null);

  const accentColor = EMOTION_COLORS[currentMood];

  // Fetch Tracks when Mood or Filter changes
  useEffect(() => {
    async function loadTracks() {
      const recs = await fetchRecommendations(currentMood);
      setTracks(recs);
      if (recs.length > 0) {
        if (!currentTrack || autoSync) {
          setCurrentTrack(recs[0]);
        }
      }
    }
    loadTracks();
  }, [currentMood, autoSync]);

  // Update Dynamic CSS Variables
  useEffect(() => {
    document.documentElement.style.setProperty('--active-accent', accentColor);
    document.documentElement.style.setProperty('--active-accent-glow', `${accentColor}35`);
  }, [accentColor]);

  // Handle Snapshot Complete from Scanner Modal
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

  const handleNextTrack = () => {
    if (tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
  };

  const handlePrevTrack = () => {
    if (tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrack(tracks[prevIndex]);
  };

  return (
    <div className="app-container">
      
      {/* Top Navbar */}
      <Navbar
        currentMood={currentMood}
        isCamActive={false}
        accentColor={accentColor}
      />

      {/* Snapshot Hero Scanner Card */}
      <div className="glass-panel" style={{
        padding: '1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        background: `linear-gradient(135deg, rgba(17, 24, 39, 0.9), ${accentColor}18)`,
        borderColor: `${accentColor}44`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Latest Snapshot Circle */}
          <div style={{
            position: 'relative',
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: `3px solid ${accentColor}`,
            boxShadow: `0 0 20px ${accentColor}66`,
            flexShrink: 0
          }}>
            {latestSnapshotUrl ? (
              <img src={latestSnapshotUrl} alt="Check-in Face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={24} color={accentColor} />
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                CURRENT SESSION MOOD
              </span>
              {blendedVibeName && (
                <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', background: `${accentColor}33`, color: accentColor, fontWeight: 600 }}>
                  {blendedVibeName}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
              Feeling <span style={{ color: accentColor }}>{currentMood}</span> Today
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
              1-Frame Snapshot Check-in • YouTube Music Playlist Matched
            </p>
          </div>
        </div>

        {/* Scan Vibe Trigger Button */}
        <button
          onClick={() => setIsScannerOpen(true)}
          style={{
            padding: '0.85rem 1.6rem',
            borderRadius: 'var(--radius-full)',
            background: `linear-gradient(135deg, ${accentColor}, #6366F1)`,
            color: '#FFF',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: `0 0 24px ${accentColor}77`,
            transition: 'transform 0.15s ease'
          }}
        >
          <Camera size={18} />
          <span>Scan Mood Snapshot</span>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="main-grid">
        
        {/* LEFT COLUMN */}
        <div>
          <EmotionGauge
            scores={emotionScores}
            primaryMood={currentMood}
          />
          <MoodFusion
            primaryMood={currentMood}
            accentColor={accentColor}
            onBlendChange={(label, sec, ratio) => {
              setBlendedVibeName(label);
            }}
          />
        </div>

        {/* RIGHT COLUMN */}
        <div>
          <MusicPlayer
            track={currentTrack}
            currentMood={currentMood}
            accentColor={accentColor}
            onNext={handleNextTrack}
            onPrev={handlePrevTrack}
            autoSync={autoSync}
            onToggleAutoSync={() => setAutoSync(!autoSync)}
          />

          <div style={{ marginTop: '1.25rem' }}>
            <Playlist
              tracks={tracks}
              currentTrackId={currentTrack?.id || null}
              selectedMood={selectedFilterMood}
              accentColor={accentColor}
              onSelectTrack={(t) => setCurrentTrack(t)}
              onFilterMood={(m) => {
                setSelectedFilterMood(m);
                fetchRecommendations(m).then(t => setTracks(t));
              }}
            />
          </div>
        </div>

      </div>

      {/* Mood Check-in History Gallery & Analytics */}
      <MoodJournal
        logs={snapshotLogs}
        accentColor={accentColor}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      <MoodAnalytics
        history={moodHistory}
        accentColor={accentColor}
      />

      {/* Single Frame Snapshot Camera Modal */}
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

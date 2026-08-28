import React, { useState } from 'react';
import { Music, Search, Play, X, Layers } from 'lucide-react';
import { Track, EmotionType } from '../types';

interface PlaylistProps {
  tracks: Track[];
  currentTrackId: string | null;
  selectedMood: EmotionType;
  accentColor: string;
  isLibraryMode: boolean;
  onSelectTrack: (track: Track) => void;
  onFilterMood: (mood: EmotionType) => void;
  onToggleLibrary: () => void;
}

const MOODS: EmotionType[] = ['Happy', 'Sad', 'Neutral', 'Angry'];

const MOOD_COLOR_MAP: Record<EmotionType, string> = {
  Happy: '#F59E0B',
  Sad: '#3B82F6',
  Neutral: '#8B5CF6',
  Angry: '#F43F5E'
};

export const Playlist: React.FC<PlaylistProps> = ({
  tracks,
  currentTrackId,
  selectedMood,
  accentColor,
  isLibraryMode,
  onSelectTrack,
  onFilterMood,
  onToggleLibrary
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const moodFilteredTracks = isLibraryMode
    ? tracks
    : tracks.filter(t => t.mood === selectedMood);

  const finalTracks = moodFilteredTracks.filter(track => {
    const q = searchQuery.toLowerCase();
    return (
      track.title.toLowerCase().includes(q) ||
      track.artist.toLowerCase().includes(q) ||
      track.genre.toLowerCase().includes(q)
    );
  });

  return (
    <div className="glass-panel" style={{ padding: '1.4rem', borderRadius: '24px' }}>
      
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        
        {/* Mood Selector Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {MOODS.map(m => {
            const isActive = !isLibraryMode && m === selectedMood;
            const moodCol = MOOD_COLOR_MAP[m];

            return (
              <button
                key={m}
                onClick={() => {
                  if (isLibraryMode) onToggleLibrary();
                  onFilterMood(m);
                }}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  border: `1.5px solid ${isActive ? moodCol : 'var(--border-subtle)'}`,
                  background: isActive ? `${moodCol}18` : 'var(--bg-surface-hover)',
                  color: isActive ? moodCol : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {m}
              </button>
            );
          })}

          {/* All Tracks Button */}
          <button
            onClick={onToggleLibrary}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              border: `1.5px solid ${isLibraryMode ? accentColor : 'var(--border-subtle)'}`,
              background: isLibraryMode ? `${accentColor}18` : 'var(--bg-surface-hover)',
              color: isLibraryMode ? accentColor : 'var(--text-secondary)',
              fontWeight: isLibraryMode ? 700 : 500,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={13} />
            <span>All Songs</span>
          </button>
        </div>

        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-surface-hover)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '20px',
          padding: '0.35rem 0.75rem'
        }}>
          <Search size={14} color="var(--text-tertiary)" style={{ marginRight: '0.4rem' }} />
          <input
            type="text"
            placeholder="Search songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              width: '120px'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <X size={13} />
            </button>
          )}
        </div>

      </div>

      {/* Tracks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {finalTracks.length > 0 ? (
          finalTracks.map(t => {
            const isCurrent = t.id === currentTrackId;
            const trackMoodCol = MOOD_COLOR_MAP[t.mood] || accentColor;

            return (
              <div
                key={t.id}
                onClick={() => onSelectTrack(t)}
                className="glass-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '16px',
                  border: `1.5px solid ${isCurrent ? trackMoodCol : 'transparent'}`,
                  background: isCurrent ? `${trackMoodCol}12` : 'var(--bg-glass-card)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Artwork Thumbnail */}
                <div style={{
                  position: 'relative',
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1px solid var(--border-subtle)'
                }}>
                  <img src={t.coverUrl} alt={t.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {isCurrent && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{
                    fontSize: '0.9rem',
                    fontWeight: isCurrent ? 700 : 600,
                    margin: 0,
                    color: isCurrent ? trackMoodCol : 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {t.title}
                  </h4>
                  <p style={{
                    fontSize: '0.76rem',
                    color: 'var(--text-secondary)',
                    margin: '0.1rem 0 0 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {t.artist} • <span style={{ color: 'var(--text-tertiary)' }}>{t.genre}</span>
                  </p>
                </div>

                {/* Mood Tag & Duration */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '8px',
                    background: `${trackMoodCol}18`,
                    color: trackMoodCol,
                    fontWeight: 700
                  }}>
                    {t.mood}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    {Math.floor(t.duration / 60)}:{(t.duration % 60 < 10 ? '0' : '') + (t.duration % 60)}
                  </span>
                </div>

              </div>
            );
          })
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
            No songs found matching your search.
          </div>
        )}
      </div>

    </div>
  );
};

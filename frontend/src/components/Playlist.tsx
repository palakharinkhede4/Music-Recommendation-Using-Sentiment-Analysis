import React, { useState } from 'react';
import { Music, Search, Play, Layers, Sparkles, X } from 'lucide-react';
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

const MOODS: EmotionType[] = ['Happy', 'Neutral', 'Sad', 'Angry'];

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

  // Filtering: If isLibraryMode is false, show tracks matching selectedMood
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
    <div className="glass-panel" style={{ padding: '1.4rem', borderRadius: '20px' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <Music size={16} color={accentColor} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {isLibraryMode ? 'Curated Music Library' : `${selectedMood} Recommendation Queue`}
          </h3>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            padding: '0.1rem 0.45rem',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.06)',
            color: 'var(--text-tertiary)'
          }}>
            {finalTracks.length} {finalTracks.length === 1 ? 'track' : 'tracks'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          {/* Library Toggle Button */}
          <button
            onClick={onToggleLibrary}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '10px',
              border: `1px solid ${isLibraryMode ? accentColor : 'rgba(255,255,255,0.08)'}`,
              background: isLibraryMode ? `${accentColor}18` : 'rgba(255,255,255,0.03)',
              color: isLibraryMode ? accentColor : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={13} />
            <span>{isLibraryMode ? 'Show Mood Playlist' : 'Browse All Tracks'}</span>
          </button>

          {/* Search Input Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '0.3rem 0.65rem'
          }}>
            <Search size={13} color="var(--text-tertiary)" style={{ marginRight: '0.35rem' }} />
            <input
              type="text"
              placeholder="Search title, artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.78rem',
                width: '130px'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Mood Filter Tabs (Visible when in Library Mode) */}
      {isLibraryMode && (
        <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
          {MOODS.map(m => {
            const isActive = m === selectedMood;
            return (
              <button
                key={m}
                onClick={() => onFilterMood(m)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${isActive ? accentColor : 'rgba(255,255,255,0.08)'}`,
                  background: isActive ? `${accentColor}20` : 'rgba(255,255,255,0.03)',
                  color: isActive ? accentColor : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {m}
              </button>
            );
          })}
        </div>
      )}

      {/* Track List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {finalTracks.length > 0 ? (
          finalTracks.map(t => {
            const isCurrent = t.id === currentTrackId;

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
                  borderRadius: '14px',
                  border: `1px solid ${isCurrent ? accentColor : 'rgba(255, 255, 255, 0.06)'}`,
                  background: isCurrent ? `${accentColor}14` : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Track Thumbnail */}
                <div style={{
                  position: 'relative',
                  width: '40px',
                  height: '40px',
                  borderRadius: '9px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <img src={t.coverUrl} alt={t.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {isCurrent && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Play size={15} color={accentColor} fill={accentColor} />
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{
                    fontSize: '0.88rem',
                    fontWeight: isCurrent ? 700 : 500,
                    margin: 0,
                    color: isCurrent ? accentColor : 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {t.title}
                  </h4>
                  <p style={{
                    fontSize: '0.75rem',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '6px',
                    background: `${t.themeColor}1C`,
                    border: `1px solid ${t.themeColor}40`,
                    color: t.themeColor,
                    fontWeight: 600
                  }}>
                    {t.mood}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                    {Math.floor(t.duration / 60)}:{(t.duration % 60 < 10 ? '0' : '') + (t.duration % 60)}
                  </span>
                </div>

              </div>
            );
          })
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
            No tracks found matching your search.
          </div>
        )}
      </div>

    </div>
  );
};

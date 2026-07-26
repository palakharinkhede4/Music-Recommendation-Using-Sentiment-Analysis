import React, { useState } from 'react';
import { Music, Search, Play, Library } from 'lucide-react';
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

  // Filtering: If isLibraryMode is false, strictly show ONLY the 3 tracks matching current selectedMood!
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
    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Music size={18} color={accentColor} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#FFF' }}>
            {isLibraryMode ? 'Full Music Library (12 Songs)' : `${selectedMood} Playlist (3 Songs)`}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Library Toggle Button */}
          <button
            onClick={onToggleLibrary}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '16px',
              border: `1px solid ${isLibraryMode ? accentColor : 'rgba(255,255,255,0.12)'}`,
              background: isLibraryMode ? `${accentColor}20` : 'rgba(255,255,255,0.05)',
              color: isLibraryMode ? accentColor : '#9CA3AF',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Library size={12} />
            <span>{isLibraryMode ? 'Show Mood Playlist Only' : 'Browse All 12 Songs'}</span>
          </button>

          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '0.3rem 0.75rem'
          }}>
            <Search size={13} color="#9CA3AF" style={{ marginRight: '0.35rem' }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#FFF',
                fontSize: '0.8rem',
                width: '110px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Mood Tabs (Visible when in Library Mode) */}
      {isLibraryMode && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {MOODS.map(m => {
            const isActive = m === selectedMood;
            return (
              <button
                key={m}
                onClick={() => onFilterMood(m)}
                style={{
                  padding: '0.3rem 0.8rem',
                  borderRadius: '20px',
                  border: `1px solid ${isActive ? accentColor : 'rgba(255,255,255,0.1)'}`,
                  background: isActive ? `${accentColor}25` : 'rgba(255,255,255,0.04)',
                  color: isActive ? accentColor : '#9CA3AF',
                  fontWeight: isActive ? 700 : 400,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {m}
              </button>
            );
          })}
        </div>
      )}

      {/* Track List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                  borderRadius: '16px',
                  border: `1px solid ${isCurrent ? accentColor : 'rgba(255, 255, 255, 0.08)'}`,
                  background: isCurrent ? `${accentColor}18` : 'rgba(255, 255, 255, 0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Track Thumbnail */}
                <div style={{
                  position: 'relative',
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  flexShrink: 0
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
                      <Play size={16} color={accentColor} fill={accentColor} />
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{
                    fontSize: '0.9rem',
                    fontWeight: isCurrent ? 700 : 500,
                    margin: 0,
                    color: isCurrent ? accentColor : '#FFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {t.title}
                  </h4>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#9CA3AF',
                    margin: '0.1rem 0 0 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {t.artist} • <span style={{ color: '#6B7280' }}>{t.genre}</span>
                  </p>
                </div>

                {/* Mood Tag & Duration */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '8px',
                    background: `${t.themeColor}22`,
                    color: t.themeColor,
                    fontWeight: 600
                  }}>
                    {t.mood}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    {Math.floor(t.duration / 60)}:{(t.duration % 60 < 10 ? '0' : '') + (t.duration % 60)}
                  </span>
                </div>

              </div>
            );
          })
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.85rem' }}>
            No tracks found
          </div>
        )}
      </div>

    </div>
  );
};

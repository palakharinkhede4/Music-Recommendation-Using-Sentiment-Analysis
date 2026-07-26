import React, { useState } from 'react';
import { Music, Search, Play, Youtube, Sparkles } from 'lucide-react';
import { Track, EmotionType } from '../types';

interface PlaylistProps {
  tracks: Track[];
  currentTrackId: string | null;
  selectedMood: EmotionType;
  accentColor: string;
  onSelectTrack: (track: Track) => void;
  onFilterMood: (mood: EmotionType) => void;
}

const MOODS: EmotionType[] = ['Happy', 'Neutral', 'Sad', 'Angry', 'Surprise'];

export const Playlist: React.FC<PlaylistProps> = ({
  tracks,
  currentTrackId,
  selectedMood,
  accentColor,
  onSelectTrack,
  onFilterMood
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTracks = tracks.filter(track => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      
      {/* Header & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Music size={18} color={accentColor} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Recommended Playlist</h2>
        </div>

        {/* Search Bar */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-full)',
          padding: '0.35rem 0.85rem'
        }}>
          <Search size={14} color="var(--text-muted)" style={{ marginRight: '0.4rem' }} />
          <input
            type="text"
            placeholder="Search tracks, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              width: '140px'
            }}
          />
        </div>
      </div>

      {/* Mood Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {MOODS.map(m => {
          const isActive = m === selectedMood;
          return (
            <button
              key={m}
              onClick={() => onFilterMood(m)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${isActive ? accentColor : 'var(--border-glass)'}`,
                background: isActive ? `${accentColor}25` : 'var(--bg-glass-card)',
                color: isActive ? accentColor : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {m}
            </button>
          );
        })}
      </div>

      {/* Tracks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '380px', overflowY: 'auto' }}>
        {filteredTracks.length > 0 ? (
          filteredTracks.map(t => {
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
                  borderColor: isCurrent ? accentColor : 'var(--border-glass)',
                  background: isCurrent ? `${accentColor}18` : undefined,
                  cursor: 'pointer'
                }}
              >
                {/* Track Thumbnail */}
                <div style={{
                  position: 'relative',
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-sm)',
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

                {/* Track Meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <h4 style={{
                      fontSize: '0.9rem',
                      fontWeight: isCurrent ? 700 : 500,
                      margin: 0,
                      color: isCurrent ? accentColor : 'var(--text-main)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {t.title}
                    </h4>
                    {t.youtubeId && (
                      <Youtube size={12} color="#FF0000" />
                    )}
                  </div>
                  <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    margin: '0.1rem 0 0 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {t.artist} • <span style={{ color: 'var(--text-dim)' }}>{t.genre}</span>
                  </p>
                </div>

                {/* Mood Tag & Duration */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    background: `${t.themeColor}22`,
                    color: t.themeColor,
                    fontWeight: 600
                  }}>
                    {t.mood}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {Math.floor(t.duration / 60)}:{(t.duration % 60 < 10 ? '0' : '') + (t.duration % 60)}
                  </span>
                </div>

              </div>
            );
          })
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No tracks found matching "{searchQuery}"
          </div>
        )}
      </div>

    </div>
  );
};

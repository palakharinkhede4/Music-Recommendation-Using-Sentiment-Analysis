import React, { useState } from 'react';
import { Search, Play, X, Music2, Clock3 } from 'lucide-react';
import { Track, EmotionType } from '../types';
interface PlaylistProps {
  tracks: Track[]; currentTrackId: string | null; selectedMood: EmotionType; accentColor: string;
  isLibraryMode: boolean; onSelectTrack: (track: Track) => void; onFilterMood: (mood: EmotionType) => void; onToggleLibrary: () => void;
}
const MOODS: EmotionType[] = ['Happy', 'Sad', 'Neutral', 'Angry'];
const MOOD_COLOR_MAP: Record<EmotionType, string> = { Happy: '#F59E0B', Sad: '#3B82F6', Neutral: '#8B5CF6', Angry: '#F43F5E' };
export const Playlist: React.FC<PlaylistProps> = ({ tracks, currentTrackId, selectedMood,
  isLibraryMode, onSelectTrack, onFilterMood, onToggleLibrary }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const moodFilteredTracks = isLibraryMode ? tracks : tracks.filter(t => t.mood === selectedMood);
  const finalTracks = moodFilteredTracks.filter(track => {
    const q = searchQuery.toLowerCase();
    return track.title.toLowerCase().includes(q) || track.artist.toLowerCase().includes(q) || track.genre.toLowerCase().includes(q);
  });
  return (
    <section className="library-panel surface" aria-labelledby="library-heading">
      <div className="section-heading library-heading">
        <div><h2 id="library-heading">Tracks</h2><span className="muted">{finalTracks.length}</span></div>
        <div className="search-field">
          <Search size={16} />
          <input type="search" aria-label="Search songs, artists or genres" placeholder="Search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          {searchQuery && <button className="icon-button" aria-label="Clear search" onClick={() => setSearchQuery('')}><X size={14} /></button>}
        </div>
      </div>
      <div className="filter-tabs" aria-label="Filter collection">
        <button className={isLibraryMode ? 'selected' : ''} aria-pressed={isLibraryMode} onClick={onToggleLibrary}>All songs</button>
        {MOODS.map(m => <button key={m} className={!isLibraryMode && m === selectedMood ? 'selected' : ''}
          aria-pressed={!isLibraryMode && m === selectedMood} onClick={() => { if (isLibraryMode) onToggleLibrary(); onFilterMood(m); }}>
          <i style={{ background: MOOD_COLOR_MAP[m] }} />{m}
        </button>)}
      </div>
      <div className="track-columns" aria-hidden="true"><span>#</span><span>Track</span><span>Mood</span><Clock3 size={15} /></div>
      <div className="track-list">
        {finalTracks.length ? finalTracks.map((t, index) => {
          const isCurrent = t.id === currentTrackId;
          return (
            <button key={t.id} className={'track-row ' + (isCurrent ? 'current' : '')} onClick={() => onSelectTrack(t)} aria-pressed={isCurrent} aria-label={'Play ' + t.title + ' by ' + t.artist}>
              <span className="track-number">{isCurrent ? <Music2 size={15} /> : <><span>{String(index + 1).padStart(2, '0')}</span><Play className="row-play" size={14} /></>}</span>
              <span className="track-identity"><img src={t.coverUrl} alt="" onError={e => { if (!e.currentTarget.src.endsWith('/cover-fallback.svg')) e.currentTarget.src = '/cover-fallback.svg'; }} /><span className="track-copy"><strong>{t.title}</strong><span>{t.artist}</span></span></span>
              <span className="track-mood"><i style={{ background: MOOD_COLOR_MAP[t.mood] }} />{t.mood}</span>
              <span className="track-duration">{Math.floor(t.duration / 60)}:{String(t.duration % 60).padStart(2, '0')}</span>
            </button>
          );
        }) : <div className="empty-state"><Search size={25} /><h3>No tracks found</h3><p>Try another title, artist or genre.</p><button className="text-button" onClick={() => setSearchQuery('')}>Clear search</button></div>}
      </div>
    </section>
  );
};

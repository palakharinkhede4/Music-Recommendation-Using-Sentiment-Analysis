import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { Track, EmotionType } from '../types';

interface MusicPlayerProps {
  track: Track | null;
  currentMood: EmotionType;
  accentColor: string;
  onNext: () => void;
  onPrev: () => void;
  autoSync: boolean;
  onToggleAutoSync: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  track,
  currentMood,
  accentColor,
  onNext,
  onPrev,
  autoSync,
  onToggleAutoSync
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    if (audioRef.current && track) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [track]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || track?.duration || 180);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!track) {
    return <section className="player-panel surface empty-state"><p>Loading your rotation…</p></section>;
  }

  return (
    <section className="player-panel surface" aria-labelledby="player-heading">
      <audio ref={audioRef} src={track.audioUrl} onTimeUpdate={handleTimeUpdate} onEnded={onNext} />
      <div className="section-heading">
        <h2 id="player-heading">Now playing</h2>
        <button className={'sync-button ' + (autoSync ? 'enabled' : '')} onClick={onToggleAutoSync}
          aria-pressed={autoSync} title="Automatically select music after a mood scan">
          <RefreshCw size={13} /><span>Auto sync</span><i />
        </button>
      </div>
      <div className="album-art">
        <img key={track.id} src={track.coverUrl} alt={track.album + ' artwork'} onError={e => { if (!e.currentTarget.src.endsWith('/cover-fallback.svg')) e.currentTarget.src = '/cover-fallback.svg'; }} />
        <span className="art-label">{track.genre}</span>
        {isPlaying && <div className="art-playing" aria-label="Playing"><span /><span /><span /></div>}
      </div>
      <div className="player-track">
        <span className="eyebrow">{track.album}</span>
        <h3 title={track.title}>{track.title}</h3>
        <p>{track.artist}</p>
      </div>
      <div className="track-progress">
        <input aria-label="Playback position" type="range" min={0} max={duration || 100} value={currentTime} onChange={handleSeek}
          style={{ background: `linear-gradient(to right, ${accentColor} ${currentTime / (duration || 100) * 100}%, var(--slider-track) 0%)` }} />
        <div><span>{formatTime(currentTime)}</span><span>{formatTime(duration || track.duration)}</span></div>
      </div>
      <div className="playback-controls">
        <button className="icon-button skip-button" onClick={onPrev} aria-label="Previous track" title="Previous track"><SkipBack size={21} fill="currentColor" /></button>
        <button className="play-button" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} title={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <Pause size={25} fill="currentColor" /> : <Play size={25} fill="currentColor" />}
        </button>
        <button className="icon-button skip-button" onClick={onNext} aria-label="Next track" title="Next track"><SkipForward size={21} fill="currentColor" /></button>
      </div>
      <div className="player-bottom">
        <div className="volume-controls">
          <button className="icon-button" onClick={() => {
            if (audioRef.current) { audioRef.current.muted = !isMuted; setIsMuted(!isMuted); }
          }} aria-label={isMuted ? 'Unmute' : 'Mute'} title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <input aria-label="Volume" type="range" min={0} max={1} step={0.05} value={isMuted ? 0 : volume} onChange={handleVolumeChange} />
        </div>
        <span className="muted">{track.bpm} BPM</span>
      </div>
    </section>
  );
};

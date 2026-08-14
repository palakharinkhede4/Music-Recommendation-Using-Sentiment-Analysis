import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, RefreshCw, Camera, Sparkles } from 'lucide-react';
import { Track, EmotionType } from '../types';

interface MusicPlayerProps {
  track: Track | null;
  currentMood: EmotionType;
  accentColor: string;
  onNext: () => void;
  onPrev: () => void;
  autoSync: boolean;
  onToggleAutoSync: () => void;
  onOpenScanner: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  track,
  currentMood,
  accentColor,
  onNext,
  onPrev,
  autoSync,
  onToggleAutoSync,
  onOpenScanner
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
    return (
      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>No track selected</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{
      padding: '1.6rem',
      borderRadius: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      <audio
        ref={audioRef}
        src={track.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onNext}
      />

      {/* Top Meta Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            background: `${accentColor}18`,
            color: accentColor,
            border: `1px solid ${accentColor}30`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <Sparkles size={12} />
            <span>{currentMood} Mood Vibe</span>
          </span>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {track.bpm} BPM
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Auto Mood Sync Toggle */}
          <button
            onClick={onToggleAutoSync}
            style={{
              background: 'none',
              border: 'none',
              color: autoSync ? accentColor : 'var(--text-tertiary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
            title="Auto-switch songs when mood changes"
          >
            <RefreshCw size={12} style={{ animation: autoSync ? 'spin 8s linear infinite' : 'none' }} />
            <span>Auto Sync</span>
          </button>
        </div>
      </div>

      {/* Main Track Display Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.4rem' }}>
        
        {/* Album Cover Art */}
        <div style={{
          position: 'relative',
          width: '100px',
          height: '100px',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: `0 10px 25px -5px ${accentColor}40`,
          flexShrink: 0,
          border: '1px solid var(--border-subtle)'
        }}>
          <img src={track.coverUrl} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          
          {isPlaying && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(2px)'
            }}>
              <div className="equalizer-container">
                <div className={`equalizer-bar ${isPlaying ? 'playing' : ''}`} />
                <div className={`equalizer-bar ${isPlaying ? 'playing' : ''}`} />
                <div className={`equalizer-bar ${isPlaying ? 'playing' : ''}`} />
              </div>
            </div>
          )}
        </div>

        {/* Title, Artist, Genre Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            margin: 0,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '-0.02em'
          }}>
            {track.title}
          </h2>

          <p style={{
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            margin: '0.2rem 0 0 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: 500
          }}>
            {track.artist}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.45rem' }}>
            <span style={{
              fontSize: '0.72rem',
              padding: '0.15rem 0.55rem',
              borderRadius: '8px',
              background: 'var(--bg-surface-hover)',
              color: 'var(--text-secondary)',
              fontWeight: 600
            }}>
              {track.genre}
            </span>
          </div>
        </div>

      </div>

      {/* Track Progress Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          style={{
            width: '100%',
            cursor: 'pointer'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem', fontWeight: 600 }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Buttons Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Volume Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', width: '110px' }}>
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.muted = !isMuted;
                setIsMuted(!isMuted);
              }
            }}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            style={{ width: '65px' }}
          />
        </div>

        {/* Playback Controls (Previous, Play/Pause, Next) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
          <button
            onClick={onPrev}
            style={{
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.1s ease'
            }}
            title="Previous Track"
          >
            <SkipBack size={17} />
          </button>

          <button
            onClick={togglePlay}
            style={{
              background: accentColor,
              border: 'none',
              borderRadius: '50%',
              width: '52px',
              height: '52px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: `0 6px 20px ${accentColor}55`,
              transition: 'transform 0.15s ease'
            }}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: '2px' }} />}
          </button>

          <button
            onClick={onNext}
            style={{
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.1s ease'
            }}
            title="Next Track"
          >
            <SkipForward size={17} />
          </button>
        </div>

        {/* Quick Detect Button in Player */}
        <div style={{ width: '110px', textAlign: 'right' }}>
          <button
            onClick={onOpenScanner}
            style={{
              background: 'none',
              border: `1px solid ${accentColor}40`,
              padding: '0.35rem 0.65rem',
              borderRadius: '10px',
              color: accentColor,
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Camera size={13} />
            <span>Scan</span>
          </button>
        </div>

      </div>

    </div>
  );
};

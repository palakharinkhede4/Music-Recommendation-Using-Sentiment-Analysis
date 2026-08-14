import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, RefreshCw, Disc, ShieldCheck } from 'lucide-react';
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
  const [volume, setVolume] = useState<number>(0.8);
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
      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)', borderRadius: '20px' }}>
        <p>No track currently selected.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{
      padding: '1.6rem',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.09)',
      background: 'linear-gradient(180deg, rgba(18, 24, 38, 0.85), rgba(11, 15, 24, 0.95))',
      boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)'
    }}>
      
      <audio
        ref={audioRef}
        src={track.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onNext}
      />

      {/* Header Status Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '0.22rem 0.65rem',
            borderRadius: '8px',
            background: `${accentColor}1C`,
            border: `1px solid ${accentColor}44`,
            color: accentColor,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <ShieldCheck size={12} />
            <span>{currentMood} Matched Playlist</span>
          </span>
        </div>

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
            gap: '0.4rem',
            transition: 'color 0.15s ease'
          }}
          title="Auto-synchronize player with sentiment scans"
        >
          <RefreshCw size={12} style={{ animation: autoSync ? 'spin 8s linear infinite' : 'none' }} />
          <span>Auto Sentiment Sync</span>
        </button>
      </div>

      {/* Hero Track Info Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.4rem' }}>
        
        {/* Album Artwork with Ambient Shadow */}
        <div style={{
          position: 'relative',
          width: '90px',
          height: '90px',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: `0 8px 24px ${accentColor}25, 0 4px 12px rgba(0, 0, 0, 0.5)`,
          flexShrink: 0,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <img src={track.coverUrl} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          
          {isPlaying && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.45)',
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

        {/* Metadata Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{
            fontSize: '1.35rem',
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
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            margin: '0.2rem 0 0 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: 500
          }}>
            {track.artist}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.4rem', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            <span style={{
              padding: '0.12rem 0.45rem',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {track.genre}
            </span>
            <span>•</span>
            <span>{track.bpm} BPM</span>
          </div>
        </div>

      </div>

      {/* Progress & Duration Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          style={{
            width: '100%',
            accentColor: accentColor,
            cursor: 'pointer',
            height: '4px'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem', fontWeight: 500 }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Actions Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Volume Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', width: '120px' }}>
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
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            style={{ width: '70px', accentColor: accentColor }}
          />
        </div>

        {/* Playback Controls: Prev, Play/Pause, Next */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button
            onClick={onPrev}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease'
            }}
            title="Previous Track"
          >
            <SkipBack size={19} />
          </button>

          <button
            onClick={togglePlay}
            style={{
              background: accentColor,
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#090C13',
              cursor: 'pointer',
              boxShadow: `0 6px 20px ${accentColor}50`,
              transition: 'transform 0.15s ease'
            }}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
          </button>

          <button
            onClick={onNext}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease'
            }}
            title="Next Track"
          >
            <SkipForward size={19} />
          </button>
        </div>

        {/* Track Format Tag */}
        <div style={{ width: '120px', textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
          HQ Audio 320kbps
        </div>

      </div>

    </div>
  );
};

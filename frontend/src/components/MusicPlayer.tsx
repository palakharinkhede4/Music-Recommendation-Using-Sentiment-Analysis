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
      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: '#9CA3AF', borderRadius: '20px' }}>
        <p>No track selected</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{
      padding: '1.75rem',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'linear-gradient(180deg, rgba(20, 26, 40, 0.85), rgba(12, 16, 26, 0.95))',
      boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)'
    }}>
      
      <audio
        ref={audioRef}
        src={track.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onNext}
      />

      {/* Modern Compact Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '0.2rem 0.65rem',
          borderRadius: '12px',
          background: `${accentColor}20`,
          color: accentColor,
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          {currentMood} Mood Matched
        </span>

        <button
          onClick={onToggleAutoSync}
          style={{
            background: 'none',
            border: 'none',
            color: autoSync ? accentColor : '#9CA3AF',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <RefreshCw size={12} style={{ animation: autoSync ? 'spin 8s linear infinite' : 'none' }} />
          <span>Auto Mood Sync</span>
        </button>
      </div>

      {/* Hero Track Info Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{
          position: 'relative',
          width: '96px',
          height: '96px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
          flexShrink: 0
        }}>
          <img src={track.coverUrl} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {isPlaying && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px'
            }}>
              <div className="equalizer-bar" />
              <div className="equalizer-bar" />
              <div className="equalizer-bar" />
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            margin: 0,
            color: '#FFF',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {track.title}
          </h2>

          <p style={{
            fontSize: '0.95rem',
            color: '#9CA3AF',
            margin: '0.25rem 0 0 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {track.artist}
          </p>

          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.35rem' }}>
            {track.genre}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.35rem' }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Primary Control Buttons Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100px' }}>
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.muted = !isMuted;
                setIsMuted(!isMuted);
              }
            }}
            style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
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
            style={{ width: '60px', accentColor: accentColor }}
          />
        </div>

        {/* Play/Pause/Skip Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button
            onClick={onPrev}
            style={{
              background: 'none',
              border: 'none',
              color: '#E5E7EB',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <SkipBack size={20} />
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
              color: '#000',
              cursor: 'pointer',
              boxShadow: `0 8px 20px ${accentColor}55`,
              transition: 'transform 0.15s ease'
            }}
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: '2px' }} />}
          </button>

          <button
            onClick={onNext}
            style={{
              background: 'none',
              border: 'none',
              color: '#E5E7EB',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <SkipForward size={20} />
          </button>
        </div>

        <div style={{ width: '100px', textAlign: 'right', fontSize: '0.75rem', color: '#6B7280' }}>
          {track.bpm} BPM
        </div>

      </div>

    </div>
  );
};

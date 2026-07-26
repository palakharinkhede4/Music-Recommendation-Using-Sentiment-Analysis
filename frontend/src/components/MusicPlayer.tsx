import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Disc, Sparkles, RefreshCw, ExternalLink, Youtube } from 'lucide-react';
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
  const [playerMode, setPlayerMode] = useState<'youtube' | 'audio'>('youtube');

  // Play audio when track changes
  useEffect(() => {
    if (audioRef.current && track && playerMode === 'audio') {
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [track, playerMode]);

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
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Disc size={40} style={{ marginBottom: '0.5rem', animation: 'spin 4s linear infinite' }} />
        <p>No Track Selected</p>
      </div>
    );
  }

  return (
    <div className="glass-panel pulse-active" style={{
      padding: '1.5rem',
      borderColor: `${accentColor}55`,
      background: `linear-gradient(145deg, rgba(17, 24, 39, 0.8), ${accentColor}11)`
    }}>
      
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={track.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onNext}
      />

      {/* Top Header & Youtube Switch */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color={accentColor} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>YouTube Music Player</h2>
        </div>

        {/* Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setPlayerMode(playerMode === 'youtube' ? 'audio' : 'youtube')}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-main)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Youtube size={14} color="#FF0000" />
            <span>Mode: {playerMode === 'youtube' ? 'YouTube Embed' : 'Audio Stream'}</span>
          </button>

          <button
            onClick={onToggleAutoSync}
            style={{
              background: autoSync ? `${accentColor}22` : 'rgba(255,255,255,0.05)',
              border: `1px solid ${autoSync ? accentColor : 'var(--border-glass)'}`,
              color: autoSync ? accentColor : 'var(--text-muted)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <RefreshCw size={12} style={{ animation: autoSync ? 'spin 6s linear infinite' : 'none' }} />
            <span>Auto Mood: {autoSync ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Embedded YouTube Music Player View */}
      {playerMode === 'youtube' && track.youtubeId && (
        <div style={{
          width: '100%',
          height: '240px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          marginBottom: '1.25rem',
          border: `1px solid ${accentColor}44`,
          backgroundColor: '#000'
        }}>
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube-nocookie.com/embed/${track.youtubeId}?autoplay=1&enablejsapi=1`}
            title={track.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Track Art & Info Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{
          position: 'relative',
          width: '72px',
          height: '72px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          boxShadow: `0 8px 24px ${accentColor}44`,
          flexShrink: 0
        }}>
          <img src={track.coverUrl} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{
              padding: '0.15rem 0.5rem',
              backgroundColor: `${accentColor}25`,
              color: accentColor,
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.7rem',
              fontWeight: 700
            }}>
              RECOMMENDED FOR {currentMood.toUpperCase()}
            </span>

            {track.youtubeUrl && (
              <a
                href={track.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.7rem',
                  color: '#FF4E4E',
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                <ExternalLink size={12} />
                Open on YT Music
              </a>
            )}
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {track.title}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
            {track.artist} • <span style={{ color: 'var(--text-dim)' }}>{track.genre}</span>
          </p>
        </div>
      </div>

      {/* Audio Progress Slider (for Audio Mode) */}
      {playerMode === 'audio' && (
        <>
          <div style={{ marginBottom: '1.25rem' }}>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              style={{ width: '100%', accentColor: accentColor, cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '120px' }}>
              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                style={{ width: '80px', accentColor: accentColor }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={onPrev} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glass)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', cursor: 'pointer' }}>
                <SkipBack size={18} />
              </button>

              <button onClick={togglePlay} style={{ background: `linear-gradient(135deg, ${accentColor}, #6366F1)`, border: 'none', borderRadius: '50%', width: '54px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', cursor: 'pointer', boxShadow: `0 0 20px ${accentColor}88` }}>
                {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: '3px' }} />}
              </button>

              <button onClick={onNext} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glass)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', cursor: 'pointer' }}>
                <SkipForward size={18} />
              </button>
            </div>

            <div style={{ width: '120px', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span style={{ fontWeight: 600, color: accentColor }}>{track.bpm}</span> BPM
            </div>
          </div>
        </>
      )}

      {/* Footer Switch Controls when in YouTube mode */}
      {playerMode === 'youtube' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-glass)' }}>
          <button onClick={onPrev} style={{ background: 'var(--bg-glass-card)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 1rem', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <SkipBack size={16} /> Previous Track
          </button>
          
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Playing via YouTube Music
          </span>

          <button onClick={onNext} style={{ background: 'var(--bg-glass-card)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 1rem', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            Next Track <SkipForward size={16} />
          </button>
        </div>
      )}

    </div>
  );
};

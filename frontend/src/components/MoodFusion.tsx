import React, { useState } from 'react';
import { Sliders, Sparkles, Flame, Zap, Music } from 'lucide-react';
import { EmotionType } from '../types';

interface MoodFusionProps {
  primaryMood: EmotionType;
  accentColor: string;
  onBlendChange: (blendedMoodName: string, secondaryMood: EmotionType, ratio: number) => void;
}

const MOOD_PAIRS: Record<EmotionType, { secondary: EmotionType; label: string }[]> = {
  Happy: [
    { secondary: 'Neutral', label: 'Chill Sunset Vibe 🌅' },
    { secondary: 'Surprise', label: 'Euphoric Party Mode 🎉' }
  ],
  Sad: [
    { secondary: 'Neutral', label: 'Rainy Night Study ☔' },
    { secondary: 'Happy', label: 'Bittersweet Nostalgia 🍂' }
  ],
  Neutral: [
    { secondary: 'Happy', label: 'Sunny Flow State ☕' },
    { secondary: 'Sad', label: 'Deep Focus Ambient 🌌' }
  ],
  Angry: [
    { secondary: 'Surprise', label: 'Cyber Octane Phonk ⚡' },
    { secondary: 'Happy', label: 'High Energy Workout 💪' }
  ],
  Surprise: [
    { secondary: 'Happy', label: 'Electric Future Bass 🚀' },
    { secondary: 'Neutral', label: 'Cosmic Synthwave 🌌' }
  ]
};

export const MoodFusion: React.FC<MoodFusionProps> = ({
  primaryMood,
  accentColor,
  onBlendChange
}) => {
  const options = MOOD_PAIRS[primaryMood] || MOOD_PAIRS.Neutral;
  const [selectedSecondary, setSelectedSecondary] = useState<EmotionType>(options[0].secondary);
  const [ratio, setRatio] = useState<number>(70);

  const currentOption = options.find(o => o.secondary === selectedSecondary) || options[0];

  const handleRatioChange = (val: number) => {
    setRatio(val);
    onBlendChange(currentOption.label, selectedSecondary, val);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginTop: '1.25rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={18} color={accentColor} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Mood Fusion Blend</h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI Vibe Mixer</span>
      </div>

      {/* Blend Preset Cards */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
        {options.map(opt => {
          const isActive = opt.secondary === selectedSecondary;
          return (
            <button
              key={opt.secondary}
              onClick={() => {
                setSelectedSecondary(opt.secondary);
                onBlendChange(opt.label, opt.secondary, ratio);
              }}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${isActive ? accentColor : 'var(--border-glass)'}`,
                background: isActive ? `${accentColor}22` : 'var(--bg-glass-card)',
                color: isActive ? accentColor : 'var(--text-main)',
                fontSize: '0.8rem',
                fontWeight: isActive ? 700 : 400,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Fusion Ratio Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
          <span style={{ fontWeight: 600, color: accentColor }}>{primaryMood} ({ratio}%)</span>
          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{selectedSecondary} ({100 - ratio}%)</span>
        </div>
        <input
          type="range"
          min={30}
          max={90}
          value={ratio}
          onChange={(e) => handleRatioChange(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: accentColor, cursor: 'pointer' }}
        />
      </div>

    </div>
  );
};

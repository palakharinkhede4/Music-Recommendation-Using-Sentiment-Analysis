import React, { useState } from 'react';
import { Sliders } from 'lucide-react';
import { EmotionType } from '../types';

interface MoodFusionProps {
  primaryMood: EmotionType;
  accentColor: string;
  onBlendChange: (blendedMoodName: string, secondaryMood: EmotionType, ratio: number) => void;
}

const MOOD_PAIRS: Record<EmotionType, { secondary: EmotionType; label: string }[]> = {
  Happy: [
    { secondary: 'Neutral', label: 'Balanced Sunset Flow' },
    { secondary: 'Angry', label: 'High-Energy Grounding' }
  ],
  Sad: [
    { secondary: 'Neutral', label: 'Reflective Ambient' },
    { secondary: 'Happy', label: 'Resilient Uplift' }
  ],
  Neutral: [
    { secondary: 'Happy', label: 'Energized Focus' },
    { secondary: 'Sad', label: 'Deep Focus Ambient' }
  ],
  Angry: [
    { secondary: 'Neutral', label: 'Centering Downtempo' },
    { secondary: 'Happy', label: 'Positive Elevation' }
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
    <div className="glass-panel" style={{ padding: '1.25rem', marginTop: '1.25rem', borderRadius: '18px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Sliders size={16} color={accentColor} />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Mood Mixer
          </h3>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Blend two vibes</span>
      </div>

      <div style={{ display: 'flex', gap: '0.55rem', marginBottom: '0.9rem' }}>
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
                padding: '0.55rem',
                borderRadius: '10px',
                border: `1px solid ${isActive ? accentColor : 'rgba(255, 255, 255, 0.08)'}`,
                background: isActive ? `${accentColor}1A` : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? accentColor : 'var(--text-primary)',
                fontSize: '0.78rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '0.35rem' }}>
          <span style={{ fontWeight: 600, color: accentColor }}>{primaryMood} ({ratio}%)</span>
          <span style={{ fontWeight: 600, color: 'var(--text-tertiary)' }}>{selectedSecondary} ({100 - ratio}%)</span>
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

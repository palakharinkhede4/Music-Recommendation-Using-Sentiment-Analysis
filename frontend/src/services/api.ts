import { Track, EmotionType } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

const MOCK_TRACKS: Track[] = [
  // 1. HAPPY (Dance & Upbeat Music)
  {
    id: "hp_01",
    title: "Sunlight Serenade",
    artist: "Acoustic Horizon",
    album: "Summer Chill",
    mood: "Happy",
    genre: "Dance / Upbeat Pop",
    duration: 184,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
    themeColor: "#EAB308",
    bpm: 124
  },
  {
    id: "hp_02",
    title: "Electric Sunshine",
    artist: "Neon Pulse",
    album: "Vibrant Horizon",
    mood: "Happy",
    genre: "Upbeat Dance",
    duration: 210,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80",
    themeColor: "#F59E0B",
    bpm: 128
  },
  {
    id: "hp_03",
    title: "Golden Hour Party",
    artist: "Tropical Breeze",
    album: "Island Sunset",
    mood: "Happy",
    genre: "Upbeat EDM",
    duration: 195,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    coverUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80",
    themeColor: "#FBBF24",
    bpm: 120
  },

  // 2. SAD (Motivational & Uplifting Songs)
  {
    id: "sd_01",
    title: "Rise Above",
    artist: "Empowerment Anthem",
    album: "New Beginnings",
    mood: "Sad",
    genre: "Motivational Pop",
    duration: 240,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=500&auto=format&fit=crop&q=80",
    themeColor: "#3B82F6",
    bpm: 95
  },
  {
    id: "sd_02",
    title: "Unstoppable Mindset",
    artist: "Triumph Orchestra",
    album: "Inner Strength",
    mood: "Sad",
    genre: "Uplifting Cinematic",
    duration: 195,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    coverUrl: "https://images.unsplash.com/photo-1499346030926-9a72daac6ce6?w=500&auto=format&fit=crop&q=80",
    themeColor: "#60A5FA",
    bpm: 100
  },
  {
    id: "sd_03",
    title: "Dawn of Hope",
    artist: "Acoustic Courage",
    album: "Fading Shadows",
    mood: "Sad",
    genre: "Motivational Acoustic",
    duration: 218,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    coverUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=500&auto=format&fit=crop&q=80",
    themeColor: "#2563EB",
    bpm: 90
  },

  // 3. NEUTRAL (Ambient Chillout & Lo-Fi)
  {
    id: "nt_01",
    title: "Lo-Fi Coffee & Code",
    artist: "Study Beats Collective",
    album: "Focus Session Vol 1",
    mood: "Neutral",
    genre: "Lo-Fi Hip Hop",
    duration: 168,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    coverUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80",
    themeColor: "#8B5CF6",
    bpm: 85
  },
  {
    id: "nt_02",
    title: "Quiet Afternoon",
    artist: "Chillout Lab",
    album: "Calm Frequency",
    mood: "Neutral",
    genre: "Ambient Chillout",
    duration: 205,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    coverUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=500&auto=format&fit=crop&q=80",
    themeColor: "#A78BFA",
    bpm: 90
  },
  {
    id: "nt_03",
    title: "Midnight Reading",
    artist: "Cozy Lamp Beats",
    album: "Late Night Zen",
    mood: "Neutral",
    genre: "Lo-Fi Beats",
    duration: 182,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    coverUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&auto=format&fit=crop&q=80",
    themeColor: "#7C3AED",
    bpm: 82
  },

  // 4. ANGRY (Calm & Relaxing Music)
  {
    id: "ag_01",
    title: "Peaceful Horizon",
    artist: "Serenity Soundscapes",
    album: "Tranquil Mind",
    mood: "Angry",
    genre: "Calm Acoustic / Meditation",
    duration: 210,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    coverUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80",
    themeColor: "#EF4444",
    bpm: 60
  },
  {
    id: "ag_02",
    title: "Ocean De-Stress",
    artist: "Nature & Zen",
    album: "Calming Waves",
    mood: "Angry",
    genre: "Relaxing Piano",
    duration: 195,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80",
    themeColor: "#DC2626",
    bpm: 65
  },
  {
    id: "ag_03",
    title: "Soothing Breeze",
    artist: "Gentle Strings",
    album: "Inner Peace",
    mood: "Angry",
    genre: "Soft Relaxing Ambient",
    duration: 220,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
    coverUrl: "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=500&auto=format&fit=crop&q=80",
    themeColor: "#B91C1C",
    bpm: 58
  }
];

export async function fetchRecommendations(mood: EmotionType): Promise<Track[]> {
  try {
    const res = await fetch(`${API_BASE}/tracks/recommendations?mood=${mood}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend API offline; using local 12-song audio dataset.", err);
  }

  const matched = MOCK_TRACKS.filter(t => t.mood === mood);
  const rest = MOCK_TRACKS.filter(t => t.mood !== mood);
  return [...matched, ...rest];
}

export async function logSentiment(mood: EmotionType, confidence: number): Promise<void> {
  try {
    await fetch(`${API_BASE}/sentiment/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood, confidence })
    });
  } catch (e) {
    // Silent fallback
  }
}

import { Track, EmotionType } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

const MOCK_TRACKS: Track[] = [
  // HAPPY (5 Songs)
  {
    id: "hp_01",
    title: "Sunlight Serenade",
    artist: "Acoustic Horizon",
    album: "Summer Chill",
    mood: "Happy",
    genre: "Upbeat Acoustic Pop",
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
    genre: "Dance / Electronic",
    duration: 210,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80",
    themeColor: "#F59E0B",
    bpm: 128
  },
  {
    id: "hp_03",
    title: "Golden Hour Beats",
    artist: "Tropical Breeze",
    album: "Island Sunset",
    mood: "Happy",
    genre: "Tropical House",
    duration: 195,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    coverUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80",
    themeColor: "#FBBF24",
    bpm: 120
  },
  {
    id: "hp_04",
    title: "Joyful Strum",
    artist: "Ukulele Smile",
    album: "Carefree Days",
    mood: "Happy",
    genre: "Acoustic Folk",
    duration: 172,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    coverUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80",
    themeColor: "#EAB308",
    bpm: 115
  },
  {
    id: "hp_05",
    title: "Euphoria Heights",
    artist: "Synth Disco",
    album: "Retro Groove",
    mood: "Happy",
    genre: "Nu-Disco Pop",
    duration: 225,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80",
    themeColor: "#F59E0B",
    bpm: 126
  },

  // SAD (5 Songs)
  {
    id: "sd_01",
    title: "Midnight Rain & Solitude",
    artist: "Echoed Memories",
    album: "Reflections",
    mood: "Sad",
    genre: "Melancholic Piano",
    duration: 240,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=500&auto=format&fit=crop&q=80",
    themeColor: "#3B82F6",
    bpm: 72
  },
  {
    id: "sd_02",
    title: "Distant Echoes",
    artist: "Soft Strings Ensemble",
    album: "Quiet Hours",
    mood: "Sad",
    genre: "Ambient Cinematic",
    duration: 195,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    coverUrl: "https://images.unsplash.com/photo-1499346030926-9a72daac6ce6?w=500&auto=format&fit=crop&q=80",
    themeColor: "#60A5FA",
    bpm: 68
  },
  {
    id: "sd_03",
    title: "Tears in Autumn",
    artist: "Cello Solitude",
    album: "Fading Leaves",
    mood: "Sad",
    genre: "Neoclassical Cello",
    duration: 218,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    coverUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=500&auto=format&fit=crop&q=80",
    themeColor: "#2563EB",
    bpm: 65
  },
  {
    id: "sd_04",
    title: "Silent Snowfall",
    artist: "Nordic Piano",
    album: "Cold Horizon",
    mood: "Sad",
    genre: "Minimal Piano",
    duration: 230,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    coverUrl: "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=500&auto=format&fit=crop&q=80",
    themeColor: "#3B82F6",
    bpm: 60
  },
  {
    id: "sd_05",
    title: "Unspoken Memories",
    artist: "Whispering Winds",
    album: "Lost Time",
    mood: "Sad",
    genre: "Acoustic Ambient",
    duration: 205,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
    coverUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=500&auto=format&fit=crop&q=80",
    themeColor: "#1D4ED8",
    bpm: 70
  },

  // NEUTRAL (5 Songs)
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
    genre: "Chillout Ambient",
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
    genre: "Lo-Fi Chill",
    duration: 182,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    coverUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&auto=format&fit=crop&q=80",
    themeColor: "#7C3AED",
    bpm: 82
  },
  {
    id: "nt_04",
    title: "Subtle Waves",
    artist: "Ambient Flow",
    album: "Deep Concentration",
    mood: "Neutral",
    genre: "Downtempo Ambient",
    duration: 215,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80",
    themeColor: "#8B5CF6",
    bpm: 88
  },
  {
    id: "nt_05",
    title: "Urban Rain Lofi",
    artist: "City Lights Collective",
    album: "Metropolis Calm",
    mood: "Neutral",
    genre: "Chillhop",
    duration: 190,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    coverUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=80",
    themeColor: "#6D28D9",
    bpm: 84
  },

  // ANGRY (5 Songs)
  {
    id: "ag_01",
    title: "Adrenaline Surge",
    artist: "Heavy Distortion",
    album: "Unleashed Energy",
    mood: "Angry",
    genre: "Aggressive Phonk / Hard Rock",
    duration: 178,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    coverUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&auto=format&fit=crop&q=80",
    themeColor: "#EF4444",
    bpm: 140
  },
  {
    id: "ag_02",
    title: "Ignition Override",
    artist: "Cyber Overdrive",
    album: "Redline",
    mood: "Angry",
    genre: "Industrial Cyberpunk",
    duration: 192,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80",
    themeColor: "#DC2626",
    bpm: 150
  },
  {
    id: "ag_03",
    title: "Rage Unleashed",
    artist: "Metal Core Project",
    album: "Heavy Impact",
    mood: "Angry",
    genre: "Nu-Metal / Rock",
    duration: 185,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&auto=format&fit=crop&q=80",
    themeColor: "#B91C1C",
    bpm: 160
  },
  {
    id: "ag_04",
    title: "Drift Phonk Mayhem",
    artist: "Phonk Syndicate",
    album: "Night Drift",
    mood: "Angry",
    genre: "Drift Phonk",
    duration: 160,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
    themeColor: "#EF4444",
    bpm: 145
  },
  {
    id: "ag_05",
    title: "Maximum Overdrive",
    artist: "Thrash Voltage",
    album: "Full Throttle",
    mood: "Angry",
    genre: "Hard EDM Rock",
    duration: 202,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
    themeColor: "#991B1B",
    bpm: 155
  },

  // SURPRISE (5 Songs)
  {
    id: "sp_01",
    title: "Neon Miracle",
    artist: "Future Odyssey",
    album: "Wonderland",
    mood: "Surprise",
    genre: "Synthwave / Future Bass",
    duration: 215,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
    themeColor: "#EC4899",
    bpm: 132
  },
  {
    id: "sp_02",
    title: "Cosmic Wonder",
    artist: "Starlight Synthesizer",
    album: "Galactic Shift",
    mood: "Surprise",
    genre: "Hyperpop Electro",
    duration: 188,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
    themeColor: "#F472B6",
    bpm: 135
  },
  {
    id: "sp_03",
    title: "Unreal Discovery",
    artist: "Quantum Glitch",
    album: "Anomaly",
    mood: "Surprise",
    genre: "Experimental Beats",
    duration: 198,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80",
    themeColor: "#DB2777",
    bpm: 138
  },
  {
    id: "sp_04",
    title: "Starlight Twist",
    artist: "Cyber Pop X",
    album: "Future Horizons",
    mood: "Surprise",
    genre: "Electro Swing",
    duration: 175,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80",
    themeColor: "#EC4899",
    bpm: 130
  },
  {
    id: "sp_05",
    title: "Hyperspace Jump",
    artist: "Nebula Beats",
    album: "Starbound",
    mood: "Surprise",
    genre: "Synth Pop",
    duration: 210,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
    themeColor: "#BE185D",
    bpm: 140
  }
];

export async function fetchRecommendations(mood: EmotionType): Promise<Track[]> {
  try {
    const res = await fetch(`${API_BASE}/tracks/recommendations?mood=${mood}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend API offline; using local 25-song audio dataset.", err);
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

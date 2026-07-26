export type EmotionType = 'Happy' | 'Sad' | 'Neutral' | 'Angry';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  mood: EmotionType;
  genre: string;
  duration: number;
  audioUrl: string;
  coverUrl: string;
  themeColor: string;
  bpm: number;
}

export interface EmotionScore {
  emotion: EmotionType;
  score: number; // 0.0 to 1.0
  color: string;
}

export interface MoodStat {
  mood: EmotionType;
  count: number;
  percentage: number;
}

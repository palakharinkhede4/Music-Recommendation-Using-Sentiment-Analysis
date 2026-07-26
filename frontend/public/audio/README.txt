========================================================
MoodBeat AI - Local Audio Hosting Guide
========================================================

Place your 5 MP3 audio files for each emotion into the corresponding subfolder:

  - frontend/public/audio/happy/
      song1.mp3, song2.mp3, song3.mp3, song4.mp3, song5.mp3

  - frontend/public/audio/sad/
      song1.mp3, song2.mp3, song3.mp3, song4.mp3, song5.mp3

  - frontend/public/audio/neutral/
      song1.mp3, song2.mp3, song3.mp3, song4.mp3, song5.mp3

  - frontend/public/audio/angry/
      song1.mp3, song2.mp3, song3.mp3, song4.mp3, song5.mp3

  - frontend/public/audio/surprise/
      song1.mp3, song2.mp3, song3.mp3, song4.mp3, song5.mp3

Once you place your MP3 files here, commit to GitHub:
  git add .
  git commit -m "add local audio files"
  git push origin main

Vercel will automatically host and stream your local MP3 audio files for free!

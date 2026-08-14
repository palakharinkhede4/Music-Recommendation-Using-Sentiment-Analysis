# MoodBeat - Sentiment-Aware Music Recommendation System

A modern, high-performance web application that performs real-time **Computer Vision Facial Sentiment Analysis** and dynamically curates customized music tracks matching user emotions (`Happy`, `Sad`, `Neutral`, `Angry`).

---

## Deployment to Vercel (Recommended)

MoodBeat is fully optimized for **Vercel** with instant global CDN distribution, zero cold-starts, and client-side neural/geometric facial analysis.

### Option A: 1-Click Git Import (Easiest)
1. Push this repository to your **GitHub** account:
   ```bash
   git add .
   git commit -m "Deploy MoodBeat on Vercel with modern UI"
   git push origin main
   ```
2. Navigate to **[vercel.com/new](https://vercel.com/new)** and sign in with GitHub.
3. Import your **`Music-Recommendation-Using-Sentiment-Analysis`** repository.
4. Keep default settings:
   - **Framework Preset**: Other / Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`
5. Click **Deploy**. Your application will be live instantly with global HTTPS and custom domain support.

### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Deploy directly from repository root
vercel
```

---

## Architecture & Features

- **Clean Enterprise Dark Mode**: Inspired by Spotify and Linear design systems with custom typography, frosted glassmorphism, and responsive layouts.
- **Client-Side Sentiment Engine**: Deterministic facial geometry and feature contour analysis runs directly in the browser via HTML5 Canvas and WebRTC video streams with zero backend latency or server sleep timeouts.
- **Dynamic Waveform Player**: Embedded HTML5 audio player with real-time spectrum visualizer, scrub bar, BPM tag, volume mixer, and auto sentiment track sync.
- **Curated 12-Track Catalog**: 4 targeted mood strategies loaded from bundled local audio assets:
  - **Happy**: High-Energy & Upbeat Dance (*Levitating*, *Heat Waves*, *Senorita*)
  - **Sad**: Resilient & Uplifting Anthems (*Kar Har Maidaan Fateh*, *Unstoppable*, *Hall of Fame*)
  - **Neutral**: Focus, Lo-Fi & Ambient Chillout (*Cozy Retro Lofi Beat*, *Luv(sic.) pt3*, *The Last Days of Summer*)
  - **Angry**: Calm, Downtempo & Ambient Rest (*Idea 10*, *Spirit of Life*, *Time For a Coffee*)
- **Session Intelligence**: Session check-in logs, mood distribution analytics, and photo snapshot journal.

---

## Local Development Setup

### Prerequisites
- Node.js (v18 or newer)
- npm

### Run Locally
```bash
# Install dependencies
npm run build

# Start Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## Project Structure

```
├── frontend/
│   ├── public/
│   │   └── audio/         # Curated local high-bitrate MP3 tracks
│   ├── src/
│   │   ├── components/    # Modular React UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── MusicPlayer.tsx
│   │   │   ├── Playlist.tsx
│   │   │   ├── EmotionGauge.tsx
│   │   │   ├── MoodScannerModal.tsx
│   │   │   ├── MoodJournal.tsx
│   │   │   └── MoodAnalytics.tsx
│   │   ├── services/      # Recommendation and sentiment services
│   │   ├── index.css      # Design system tokens and styling
│   │   ├── App.tsx        # Main application orchestrator
│   │   └── types.ts       # TypeScript interface definitions
│   ├── index.html         # Application root entry
│   └── package.json
├── package.json           # Root Vercel build orchestrator
├── vercel.json            # Vercel deployment configuration
└── README.md
```

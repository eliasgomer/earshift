# Earshift website

**Live: https://eliasgomer.github.io/earshift/**

Landing page, support and legal pages for [Earshift](https://eliasgomer.github.io/earshift/) - switch your headphones between Quiet, Aware and Immersion from widgets, Control Center, Siri and the Mac menu bar (iPhone, iPad, Mac).

- `src/` - Vite + React + Tailwind site (DE/EN). Pages: `/`, `/support/`, `/privacy/`, `/datenschutz/`, `/impressum/`.
- `src/ui/` - the Earshift app UI rebuilt in React, shared by the site and the demo video.
- `video/` - the demo videos, made with [Remotion](https://www.remotion.dev). v2: `python3 scripts/make-audio2.py && npx remotion render src/index.ts demo2-de out/earshift-demo2-de.mp4`; narrated cut: `node scripts/make-voice.mjs` (ElevenLabs key in `~/.elevenlabs-key`), `python3 scripts/make-audio2.py --voice de`, then render `demo2-voice-de`. Audio credits: `video/AUDIO-CREDITS.md`.
- Deploys to GitHub Pages on every push to `main` (`.github/workflows/deploy.yml`).

```sh
npm install
npm run dev      # http://localhost:5173/earshift/
npm run build
```

Earshift is an independent app and is not affiliated with, endorsed or sponsored by Bose Corporation. Bose and QuietComfort are trademarks of Bose Corporation.

© 2026 Elias Gomer

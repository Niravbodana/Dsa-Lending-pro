# Technical Audit — Failed Reel Pipeline (v1)

**Date:** 2026-08-10  
**Reference failure:** `artifacts/NeerCred-Reel-mom-doesnt-ask.mp4`  
**Verdict:** FAILED BUILD — cartoon slideshow, robotic TTS, not acceptable for shipping

## Architecture (v1 — deprecated)

| Layer | Implementation | File(s) |
|-------|----------------|---------|
| Visuals | Static AI PNGs (1024×1536), illustrated style | `frontend/public/reel-cinema/mom-doesnt-ask/s01–s06-*.png` |
| Motion | CSS Ken Burns zoom/pan on stills | `frontend/src/app/promo-reel-cinema/page.tsx` |
| Capture | Playwright screen-records React film player | `scripts/generate_reel_cinema.py` |
| Voice | Microsoft Edge TTS (`edge_tts`) | `scripts/generate_reel_cinema.py` |
| Animation | None — still image + CSS transform | — |
| Video model | **NONE** — no Runway/Replicate/Fal/Kling | — |
| Lip-sync | **NONE** | — |
| Resolution | 1080×1920 (scaled Playwright capture) | Full frame but illustrated source |
| Assembly | FFmpeg mux + disclaimer burn-in | `generate_reel_cinema.py:finalize()` |

## Answers to audit questions

1. **Which model generates visuals?** No video model. Static PNG images generated externally and committed to repo.
2. **Which model generates voices?** Microsoft Edge TTS — `en-IN-NeerjaNeural`, `en-IN-PrabhatNeural`.
3. **TTS or generated speech?** TTS only. No expressive/neural performance layer.
4. **Animation system?** CSS Ken Burns (`scale` + `translate` on `background-image`).
5. **Actual video or animating stills?** Animating stills via screen capture. Not generative video.
6. **Resolution?** 1080×1920 export, source art 1024×1536 PNG.
7. **Grey borders?** Caused by cookie consent banner / aspect mismatch in some runs. Fixed with localStorage + CSS hide, but root issue is non-native 9:16 composition.
8. **Cartoon look?** Source art is illustrated/stylized PNGs, not photorealistic photography.
9. **Robotic voice?** Edge TTS lacks breathing, hesitation, emotional micro-variation.
10. **Unnatural dialogue?** Raw text → TTS with basic rate/pitch. No performance direction layer.
11. **No cinematic camera movement?** Only zoom/pan on flat images. No parallax, focus pull, or handheld observation.
12. **Character consistency fails?** Each scene PNG generated independently without locked character reference.
13. **Template look?** Web player + crossfades + subtitle overlays + grain filter = AI demo aesthetic.

## Root causes

- **Wrong tool for the job:** Slideshow engine cannot produce photorealistic human video.
- **No provider abstraction:** Hardcoded edge_tts + Playwright with no quality gate.
- **No character-first workflow:** Scenes generated without shared identity lock.
- **Silent quality degradation:** System optimizes for "can we generate a video?" not "would a viewer believe this was filmed?"

## v2 replacement

See `scripts/reel_engine/README.md`. The new engine:

- Uses provider abstraction (`VIDEO_PROVIDER`, `VOICE_PROVIDER`, etc.)
- Blocks export when photoreal providers are missing
- Character references before scene generation
- Voice performance layer with emotional direction
- Scene-based 6–8 shot workflow with FFmpeg assembly
- Automatic QC gate before export
- **Does NOT fall back to Ken Burns**

## Required configuration for photoreal output

```bash
VIDEO_PROVIDER=replicate
REPLICATE_API_TOKEN=...
VOICE_PROVIDER=elevenlabs
ELEVENLABS_API_KEY=...
IMAGE_PROVIDER=replicate
```

Without these, v2 produces storyboard + voice script + subtitles + production report — but **no final MP4**.

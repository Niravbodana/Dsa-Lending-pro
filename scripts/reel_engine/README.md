# NeerCred Cinematic Reel Engine v2

Photorealistic scene-based Instagram Reel production pipeline. Replaces the failed Ken Burns + edge TTS slideshow approach.

## Architecture

```
ReelProject
 ├── characters      → reference portraits (before scenes)
 ├── locations
 ├── storyboard      → storyboard.json
 ├── scenes          → scenes.json + per-shot video
 ├── visual_prompts  → embedded in story JSON
 ├── voice_performance → voice_script.json + synthesis
 ├── audio           → dialogue + ambience + BGM mix
 ├── music
 ├── subtitles       → subtitles.srt
 ├── branding        → end card + disclaimer
 ├── quality_control → production_report.json
 └── rendering       → FFmpeg assembly (1080×1920)
```

## Provider abstraction

| Env var | Options | Purpose |
|---------|---------|---------|
| `VIDEO_PROVIDER` | replicate, runway, fal | Photorealistic shot generation |
| `VOICE_PROVIDER` | elevenlabs, edge_performance | Expressive dialogue |
| `IMAGE_PROVIDER` | replicate, fal | Character reference sheets |
| `LIPSYNC_PROVIDER` | sync_labs | On-camera dialogue sync |
| `MUSIC_PROVIDER` | local | Licensed BGM from promo library |

**No silent fallback to cartoon/Ken Burns.** If `VIDEO_PROVIDER` is not configured, the pipeline generates all production artifacts but blocks final video export.

## Default mode — NO API keys required

The engine ships with free, local providers:

| Provider | Default | What it does |
|----------|---------|--------------|
| `VIDEO_PROVIDER=stock` | ✅ | Photoreal Mixkit stock footage (royalty-free) |
| `VOICE_PROVIDER=piper` | ✅ | Local neural TTS (offline, no API) |
| `IMAGE_PROVIDER=stock` | ✅ | Character refs from stock frame extraction |
| `MUSIC_PROVIDER=local` | ✅ | Licensed BGM from promo library |

```bash
pip install -r scripts/reel_engine/requirements.txt
python -m piper.download_voices --download-dir scripts/reel_engine/.voices en_US-lessac-medium en_GB-alan-medium
python scripts/generate_reel_v2.py
```

Output: `/output/neercred_reel_final.mp4` (1080×1920, 45s)

## Optional upgrades (paid APIs)

## Output (`/output/`)

- `storyboard.json` — shot list with cinematography and prompts
- `scenes.json` — scene manifest for regeneration
- `voice_script.json` — performance-directed dialogue
- `subtitles.srt` — English captions
- `production_report.json` — QC status and provider gaps
- `neercred_reel_final.mp4` — only when QC passes
- `neercred_reel_preview.mp4` — preview copy

## Current story

**YOU ALWAYS SAY THAT** — `stories/you_always_say_that.json`

7 scenes, ~43 seconds, Indian mother/son family drama with organic NeerCred integration.

## Quality gate

Final export requires:
- Photorealistic video provider configured and all scene clips generated
- Production voice provider (ElevenLabs) — edge TTS fails QC
- Full-frame 1080×1920, no letterboxing
- Duration 40–45 seconds
- No false financial claims

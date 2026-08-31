# Dr. Jeevah Setpal — truck support video

10-second vertical (9:16) following-car shot.

## Physics (locked)

- **0–3.5s** — only the left TATA truck. Lean grows toward its left. No right truck. No self-correction.
- **~3.9–5.5s** — right truck enters from the right and comes alongside.
- **5.5–7.2s** — contact/support. Left truck returns upright only after the right truck is there.
- **7.2–10s** — both upright, driving forward.

Camera stays behind the vehicles. No cuts.

## Branding (locked on both trucks)

- **Dr. Jeevah Setpal** / PHYSIOTHERAPY • SPORTS REHAB
- Gold JS emblem, doctor portrait, Mumbai, 75062 88788
- Teal + gold wrap, TATA chassis, chevron bumper

## Deliverables

| File | What |
|---|---|
| `frames/` | Photoreal 9:16 stills for each beat (start, peak tilt, enter, contact, both upright) |
| `DrJeevahSetpal-truck-support-9x16-1080.mp4` | 10s 1080×1920 assembled take |
| `DrJeevahSetpal-truck-support-9x16-4K.mp4` | 10s 2160×3840 upscale |
| `timeline.json` | Beat list |

The stills are the photoreal plates. The mp4 is assembled from those plates with a single-plate lean and a right-truck slide so the left truck cannot straighten before contact.

## Regenerate

```bash
python3 scripts/generate_truck_support_video.py
```

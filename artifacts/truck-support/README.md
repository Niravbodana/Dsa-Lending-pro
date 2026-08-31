# Dr. Jeevah Setpal — truck support video

Continuous 10-second vertical (9:16) dashcam shot.

## Deliverables

- `DrJeevahSetpal-truck-support-9x16-4K.mp4` — 2160×3840
- `DrJeevahSetpal-truck-support-9x16-1080.mp4` — 1080×1920

## Regenerate

```bash
python3 scripts/generate_truck_support_video.py
```

Keyframe stills in `frames/` are the locked start/end and physics beats.
The assembler morphs them into one take: left truck leans alone, right truck
enters from the right, contact supports the left truck upright, both drive on.

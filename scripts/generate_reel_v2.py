#!/usr/bin/env python3
"""Generate a NeerCred cinematic reel using the v2 reel engine."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts.reel_engine.pipeline.orchestrator import main

if __name__ == "__main__":
    story = sys.argv[1] if len(sys.argv) > 1 else None
    main(story)

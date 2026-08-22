"""CLI entry point: python -m scripts.reel_engine"""

from scripts.reel_engine.pipeline.orchestrator import main

if __name__ == "__main__":
    import sys
    main(sys.argv[1] if len(sys.argv) > 1 else None)

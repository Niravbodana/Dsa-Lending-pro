"""Main reel production orchestrator."""

from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from scripts.reel_engine.config import ProviderConfig, ensure_dirs
from scripts.reel_engine.models import ReelProject
from scripts.reel_engine.pipeline.audio import (
    build_bgm_track,
    build_dialogue_track,
    build_scene_ambients,
    mix_master,
)
from scripts.reel_engine.pipeline.characters import generate_character_refs
from scripts.reel_engine.pipeline.qc import run_qc
from scripts.reel_engine.pipeline.storyboard import write_scenes_json, write_storyboard
from scripts.reel_engine.pipeline.subtitles import write_subtitles
from scripts.reel_engine.pipeline.voice_performance import build_voice_script, synthesize_dialogue, write_voice_script
from scripts.reel_engine.providers.base import (
    get_image_provider,
    get_lipsync_provider,
    get_music_provider,
    get_video_provider,
    get_voice_provider,
)
from scripts.reel_engine.providers.rendering.ffmpeg import (
    burn_subtitles,
    concat_clips,
    mux_av,
    normalize_clip,
    overlay_phone_ui,
    probe_duration,
    render_endcard,
)
from scripts.reel_engine.config import SCREENS_DIR


def load_project(story_path: Path) -> ReelProject:
    data = json.loads(story_path.read_text())
    return ReelProject.from_story_json(data)


class ReelOrchestrator:
    def __init__(self, story_path: Path, cfg: ProviderConfig | None = None):
        self.story_path = story_path
        self.cfg = cfg or ProviderConfig()
        self.project = load_project(story_path)
        self.paths = ensure_dirs(self.project.id)

        self.video = get_video_provider(self.cfg)
        self.voice = get_voice_provider(self.cfg)
        self.image = get_image_provider(self.cfg)
        self.lipsync = get_lipsync_provider(self.cfg)
        self.music = get_music_provider(self.cfg)

    async def run(self) -> dict[str, Any]:
        print(f"\n{'='*60}")
        print(f"  NEERCRED CINEMATIC REEL ENGINE")
        print(f"  Story: {self.project.title}")
        print(f"{'='*60}\n")

        report: dict[str, Any] = {
            "project_id": self.project.id,
            "title": self.project.title,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "status": "in_progress",
            "providers": {
                "video": {"name": self.video.name, "configured": self.video.is_configured()},
                "voice": {"name": self.voice.name, "configured": self.voice.is_configured(), "production_quality": self.voice.is_production_quality()},
                "image": {"name": self.image.name, "configured": self.image.is_configured()},
                "lipsync": {"name": self.lipsync.name, "configured": self.lipsync.is_configured()},
                "music": {"name": self.music.name, "configured": self.music.is_configured()},
            },
            "missing_for_photoreal": self.cfg.missing_for_photoreal(),
            "artifacts": {},
            "scene_results": [],
            "qc": None,
            "final_output": None,
            "message": "",
        }

        # Phase 1: Storyboard + manifests
        print("  [1/7] Storyboard & scene manifests...")
        report["artifacts"]["storyboard"] = str(write_storyboard(self.project, self.paths))
        report["artifacts"]["scenes"] = str(write_scenes_json(self.project, self.paths))
        report["artifacts"]["voice_script"] = str(write_voice_script(self.project, self.paths))

        total_duration = sum(s.duration_target for s in self.project.scenes)
        print(f"        Target duration: {total_duration:.1f}s across {len(self.project.scenes)} scenes")

        # Phase 2: Character references
        print("  [2/7] Character references...")
        char_refs, char_report = generate_character_refs(self.project, self.image, self.paths)
        report["character_refs"] = char_report

        # Phase 3: Voice synthesis
        print("  [3/7] Voice performance synthesis...")
        dialogue_clips, voice_report = await synthesize_dialogue(self.project, self.voice, self.paths)
        report["voice_synthesis"] = voice_report

        dialogue_master = self.paths["audio"] / "dialogue.wav"
        build_dialogue_track(dialogue_clips, total_duration, dialogue_master)

        ambients = build_scene_ambients(self.project, self.paths)
        bgm_path = self.paths["audio"] / "bgm.wav"
        report["bgm"] = build_bgm_track(self.project, self.music, total_duration, bgm_path)

        master_audio = self.paths["audio"] / "master.wav"
        mix_master(dialogue_master, bgm_path, ambients, total_duration, master_audio)
        # Copy audio artifact to output for delivery
        output_audio = self.paths["output"] / "master_audio.wav"
        output_audio.write_bytes(master_audio.read_bytes())
        report["artifacts"]["master_audio"] = str(output_audio)

        # Phase 4: Subtitles
        print("  [4/7] Subtitles...")
        srt_path = write_subtitles(self.project, self.paths)
        report["artifacts"]["subtitles"] = str(srt_path)

        # Phase 5: Video generation (scene-by-scene)
        print("  [5/7] Scene video generation...")
        scene_videos: dict[str, Path] = {}
        for scene in self.project.scenes:
            out_vid = self.paths["video"] / f"{scene.id}.mp4"
            if scene.type == "endcard":
                logo = Path(self.project.branding.logo_path)
                if not logo.is_absolute():
                    logo = Path(__file__).resolve().parents[3] / logo
                logo_png = self.paths["work"] / "logo_endcard.png"
                if logo.exists() and logo.suffix == ".svg":
                    # Use hires PNG fallback
                    hires = Path("/opt/cursor/artifacts/neercred-promo-video/assets/logo_lockup_dark.png")
                    logo_png = hires if hires.exists() else logo
                else:
                    logo_png = logo
                render_endcard(
                    out_vid,
                    scene.duration_target,
                    logo_png,
                    "NEERCRED",
                    self.project.branding.tagline,
                    self.project.branding.cta,
                )
                scene_videos[scene.id] = out_vid
                report["scene_results"].append({"scene": scene.id, "success": True, "provider": "ffmpeg_endcard"})
                continue

            if not self.video.is_configured():
                report["scene_results"].append({
                    "scene": scene.id,
                    "success": False,
                    "message": "Video provider not configured — shot prompt preserved in storyboard.json",
                })
                continue

            result = self.video.generate_shot(scene, char_refs, out_vid, scene.duration_target)
            scene_entry = {"scene": scene.id, "success": result.success, "message": result.message}
            if result.success and result.path:
                clip = result.path
                # NeerCred UI overlay for phone scene
                if scene.type == "phone":
                    screen = SCREENS_DIR / "01-homepage.png"
                    if not screen.exists():
                        screen = Path(__file__).resolve().parents[3] / "frontend/public/promo-screens/01-homepage.png"
                    if screen.exists():
                        overlaid = self.paths["video"] / f"{scene.id}_ui.mp4"
                        overlay_phone_ui(clip, screen, overlaid, scene.duration_target)
                        clip = overlaid
                norm = self.paths["video"] / f"{scene.id}_norm.mp4"
                if clip != norm:
                    normalize_clip(clip, norm, scene.duration_target)
                else:
                    norm = clip
                scene_videos[scene.id] = norm
                scene_entry["path"] = str(norm)
            else:
                report["scene_results"].append(scene_entry)
                continue
            report["scene_results"].append(scene_entry)

        # Phase 6: Assembly
        print("  [6/7] Assembly...")
        final_video = None
        preview_video = None
        all_scenes_ready = all(
            scene.id in scene_videos
            for scene in self.project.scenes
        )

        if all_scenes_ready and self.video.is_configured():
            ordered = [scene_videos[s.id] for s in self.project.scenes]
            concat_out = self.paths["work"] / "concat.mp4"
            concat_clips(ordered, concat_out)
            muxed = self.paths["work"] / "muxed.mp4"
            mux_av(concat_out, master_audio, muxed, self.project.branding.disclaimer)
            # Burn subtitles
            subtitled = self.paths["output"] / "neercred_reel_final.mp4"
            burn_subtitles(muxed, srt_path, subtitled)
            preview_video = self.paths["output"] / "neercred_reel_preview.mp4"
            preview_video.write_bytes(subtitled.read_bytes())
            final_video = subtitled
            report["final_output"] = str(final_video)
            report["preview_output"] = str(preview_video)
        else:
            report["message"] = (
                "Final video NOT exported. Photorealistic video provider required for all scenes. "
                "Production artifacts (storyboard, voice script, subtitles) are ready. "
                "Configure VIDEO_PROVIDER and re-run."
            )

        # Phase 7: QC
        print("  [7/7] Quality gate...")
        qc = run_qc(
            self.project,
            scene_videos,
            master_audio,
            self.voice.is_production_quality(),
            self.video.is_configured(),
            total_duration,
            final_video,
            stock_mode=self.cfg.is_stock_mode(),
        )
        report["qc"] = qc.to_dict()

        if not qc.passed:
            report["status"] = "blocked"
            report["message"] = report.get("message") or (
                "Pipeline blocked by quality gate. See qc checks."
            )
        elif final_video and final_video.exists():
            report["status"] = "complete"
            report["message"] = f"Final reel exported to {final_video}"
        else:
            report["status"] = "incomplete"

        prod_report = self.paths["output"] / "production_report.json"
        prod_report.write_text(json.dumps(report, indent=2))
        report["artifacts"]["production_report"] = str(prod_report)

        self._print_summary(report)
        return report

    def _print_summary(self, report: dict[str, Any]) -> None:
        print(f"\n{'='*60}")
        print(f"  STATUS: {report['status'].upper()}")
        print(f"{'='*60}")
        if report.get("missing_for_photoreal"):
            print("\n  Missing for photoreal output:")
            for m in report["missing_for_photoreal"]:
                print(f"    • {m}")
        print(f"\n  Artifacts → {self.paths['output']}/")
        for k, v in report.get("artifacts", {}).items():
            print(f"    {k}: {v}")
        if report.get("message"):
            print(f"\n  {report['message']}")
        print()


def main(story: str | None = None) -> None:
    root = Path(__file__).resolve().parents[1]
    story_path = Path(story) if story else root / "stories" / "you_always_say_that.json"
    orch = ReelOrchestrator(story_path)
    asyncio.run(orch.run())


if __name__ == "__main__":
    import sys
    main(sys.argv[1] if len(sys.argv) > 1 else None)

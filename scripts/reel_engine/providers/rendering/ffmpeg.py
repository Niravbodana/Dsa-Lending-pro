"""FFmpeg-based final render and assembly."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

from scripts.reel_engine.config import FPS, H, W


def probe_duration(path: Path) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(path)],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(json.loads(r.stdout)["format"]["duration"])


def normalize_clip(input_path: Path, out_path: Path, duration: float | None = None) -> None:
    """Ensure 1080x1920 full-frame H.264 clip with no letterboxing."""
    vf = (
        f"scale={W}:{H}:force_original_aspect_ratio=increase,"
        f"crop={W}:{H},fps={FPS},"
        "eq=brightness=0.02:saturation=1.05:contrast=1.04"
    )
    cmd = ["ffmpeg", "-y", "-i", str(input_path), "-vf", vf, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18"]
    if duration:
        cmd += ["-t", f"{duration:.3f}"]
    cmd += ["-an", str(out_path)]
    subprocess.run(cmd, check=True)


def concat_clips(clips: list[Path], out_path: Path) -> None:
    """Concatenate clips with re-encode to ensure consistent timing."""
    lst = out_path.with_suffix(".txt")
    lst.write_text("\n".join(f"file '{c}'" for c in clips))
    subprocess.run(
        ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
         "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", str(out_path)],
        check=True,
    )


def render_endcard(out_path: Path, duration: float, logo: Path, title: str, tagline: str, cta: str) -> None:
    """Cinematic brand end card via FFmpeg."""
    font = "/opt/cursor/artifacts/neercred-promo-video/assets/Poppins-Bold.ttf"
    font_reg = "/opt/cursor/artifacts/neercred-promo-video/assets/Poppins-Regular.ttf"
    if not Path(font).exists():
        font = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        font_reg = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

    subprocess.run(
        [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", f"color=c=0x0B1220:s={W}x{H}:d={duration}",
            "-i", str(logo),
            "-filter_complex",
            f"[0:v][1:v]overlay=(W-w)/2:(H-h)/2-120:format=auto,format=yuv420p,"
            f"drawtext=fontfile={font}:text='{title}':fontsize=52:fontcolor=white:"
            f"x=(w-text_w)/2:y=h/2+80,"
            f"drawtext=fontfile={font_reg}:text='{tagline}':fontsize=28:fontcolor=0xE8C547:"
            f"x=(w-text_w)/2:y=h/2+150,"
            f"drawtext=fontfile={font_reg}:text='{cta}':fontsize=24:fontcolor=0x5EEAD4:"
            f"x=(w-text_w)/2:y=h/2+210",
            "-t", f"{duration:.3f}",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17",
            str(out_path),
        ],
        check=True,
    )


def mux_av(video: Path, audio: Path, out_path: Path, disclaimer: str = "") -> None:
    cmd = [
        "ffmpeg", "-y", "-i", str(video), "-i", str(audio),
        "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "libx264", "-profile:v", "main", "-level", "4.0",
        "-pix_fmt", "yuv420p", "-crf", "19", "-movflags", "+faststart", "-tag:v", "avc1",
        "-c:a", "aac", "-b:a", "192k",
    ]
    if disclaimer:
        font_reg = "/opt/cursor/artifacts/neercred-promo-video/assets/Poppins-Regular.ttf"
        cmd += [
            "-vf",
            f"drawtext=fontfile={font_reg}:text='{disclaimer}':"
            f"fontsize=14:fontcolor=white@0.65:x=(w-text_w)/2:y=h-40",
        ]
    cmd.append(str(out_path))
    subprocess.run(cmd, check=True)


def burn_subtitles(video: Path, srt: Path, out_path: Path) -> None:
    srt_escaped = str(srt).replace(":", "\\:")
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(video),
            "-vf", f"subtitles='{srt_escaped}':force_style='FontName=DejaVu Sans,FontSize=22,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2,MarginV=80'",
            "-c:a", "copy", "-c:v", "libx264", "-crf", "19", "-pix_fmt", "yuv420p",
            str(out_path),
        ],
        check=True,
    )


def overlay_phone_ui(
    video: Path,
    screen_img: Path,
    out_path: Path,
    duration: float,
) -> None:
    """Composite NeerCred app screenshot onto phone area in stock footage."""
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(video), "-loop", "1", "-i", str(screen_img),
            "-filter_complex",
            f"[1:v]scale=420:-1,format=rgba,colorchannelmixer=aa=0.95[ui];"
            f"[0:v][ui]overlay=(W-w)/2:(H-h)/2+120",
            "-t", f"{duration:.3f}",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-an",
            str(out_path),
        ],
        check=True,
    )

"""Data models for the cinematic reel production pipeline."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal


@dataclass
class Character:
    id: str
    name: str
    age_range: str
    description: str
    wardrobe: str
    reference_prompt: str
    negative_prompt: str = (
        "cartoon, anime, 3d render, plastic skin, doll, avatar, illustration, "
        "pixar, game engine, uncanny valley, oversaturated, beauty filter"
    )


@dataclass
class Location:
    id: str
    name: str
    description: str
    ambient: str


@dataclass
class VoicePerformance:
    speaker: str
    text: str
    emotional_state: str
    speed: Literal["slow", "natural", "slightly_fast"] = "natural"
    intensity: Literal["whisper", "quiet", "normal", "emphatic"] = "normal"
    pause_before_sec: float = 0.0
    pauses_in_text: list[tuple[str, float]] = field(default_factory=list)  # (after phrase, seconds)
    emphasis_words: list[str] = field(default_factory=list)
    direction: str = ""
    on_camera: bool = True

    def to_dict(self) -> dict[str, Any]:
        return {
            "speaker": self.speaker,
            "text": self.text,
            "emotional_state": self.emotional_state,
            "speed": self.speed,
            "intensity": self.intensity,
            "pause_before_sec": self.pause_before_sec,
            "pauses_in_text": self.pauses_in_text,
            "emphasis_words": self.emphasis_words,
            "direction": self.direction,
            "on_camera": self.on_camera,
        }


@dataclass
class Cinematography:
    lens: str  # e.g. "35mm", "50mm", "85mm"
    shot_type: str
    camera_movement: str
    framing: str
    depth_of_field: str = "shallow"
    lighting: str = "natural"

    def to_dict(self) -> dict[str, Any]:
        return {
            "lens": self.lens,
            "shot_type": self.shot_type,
            "camera_movement": self.camera_movement,
            "framing": self.framing,
            "depth_of_field": self.depth_of_field,
            "lighting": self.lighting,
        }


@dataclass
class SceneSpec:
    id: str
    title: str
    duration_target: float
    time_range: str
    location_id: str
    mood: str
    ambient: str
    cinematography: Cinematography
    visual_prompt: str
    negative_prompt: str
    characters: list[str]
    dialogue: list[VoicePerformance] = field(default_factory=list)
    sound_design: list[str] = field(default_factory=list)
    music_note: str = ""
    type: Literal["live_action", "phone", "endcard", "silent"] = "live_action"
    phone_screens: list[str] = field(default_factory=list)
    requires_lipsync: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "duration_target": self.duration_target,
            "time_range": self.time_range,
            "location_id": self.location_id,
            "mood": self.mood,
            "ambient": self.ambient,
            "cinematography": self.cinematography.to_dict(),
            "visual_prompt": self.visual_prompt,
            "negative_prompt": self.negative_prompt,
            "characters": self.characters,
            "dialogue": [d.to_dict() for d in self.dialogue],
            "sound_design": self.sound_design,
            "music_note": self.music_note,
            "type": self.type,
            "phone_screens": self.phone_screens,
            "requires_lipsync": self.requires_lipsync,
        }


@dataclass
class Branding:
    title: str
    tagline: str
    cta: str
    disclaimer: str
    logo_path: str
    logo_lockup_path: str


@dataclass
class ReelProject:
    id: str
    title: str
    target_duration: float
    characters: dict[str, Character]
    locations: dict[str, Location]
    scenes: list[SceneSpec]
    branding: Branding
    voices: dict[str, dict[str, Any]]
    bgm: dict[str, dict[str, Any]]
    speakers: dict[str, dict[str, Any]]

    @classmethod
    def from_story_json(cls, data: dict[str, Any]) -> ReelProject:
        chars = {
            k: Character(
                id=k,
                name=v["name"],
                age_range=v["age_range"],
                description=v["description"],
                wardrobe=v["wardrobe"],
                reference_prompt=v["reference_prompt"],
                negative_prompt=v.get("negative_prompt", Character.negative_prompt),
            )
            for k, v in data["characters"].items()
        }
        locs = {
            k: Location(id=k, name=v["name"], description=v["description"], ambient=v["ambient"])
            for k, v in data["locations"].items()
        }
        scenes: list[SceneSpec] = []
        for s in data["scenes"]:
            cine = Cinematography(**s["cinematography"])
            dialogue = [
                VoicePerformance(
                    speaker=d["speaker"],
                    text=d["text"],
                    emotional_state=d.get("emotional_state", "neutral"),
                    speed=d.get("speed", "natural"),
                    intensity=d.get("intensity", "normal"),
                    pause_before_sec=d.get("pause_before_sec", d.get("pauseBefore", 0)),
                    pauses_in_text=[(p["after"], p["sec"]) for p in d.get("pauses_in_text", [])],
                    emphasis_words=d.get("emphasis_words", []),
                    direction=d.get("direction", ""),
                    on_camera=d.get("on_camera", True),
                )
                for d in s.get("dialogue", [])
            ]
            scenes.append(
                SceneSpec(
                    id=s["id"],
                    title=s.get("title", s["id"]),
                    duration_target=s["duration_target"],
                    time_range=s.get("time_range", ""),
                    location_id=s["location_id"],
                    mood=s.get("mood", "quiet"),
                    ambient=s.get("ambient", "home"),
                    cinematography=cine,
                    visual_prompt=s["visual_prompt"],
                    negative_prompt=s.get("negative_prompt", ""),
                    characters=s.get("characters", []),
                    dialogue=dialogue,
                    sound_design=s.get("sound_design", []),
                    music_note=s.get("music_note", ""),
                    type=s.get("type", "live_action"),
                    phone_screens=s.get("phone_screens", []),
                    requires_lipsync=s.get("requires_lipsync", bool(dialogue)),
                )
            )
        brand = Branding(**data["branding"])
        return cls(
            id=data["id"],
            title=data["title"],
            target_duration=data.get("target_duration", 43),
            characters=chars,
            locations=locs,
            scenes=scenes,
            branding=brand,
            voices=data.get("voices", {}),
            bgm=data.get("bgm", {}),
            speakers=data.get("speakers", {}),
        )

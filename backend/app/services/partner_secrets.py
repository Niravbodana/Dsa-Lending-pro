"""Lightweight API key obfuscation at rest (use KMS in production)."""

from __future__ import annotations

import base64
from hashlib import sha256

from app.config import settings


def _key_bytes() -> bytes:
    return sha256(f"partner-keys:{settings.secret_key}".encode()).digest()


def encrypt_api_key(plain: str) -> str:
    if not plain:
        return ""
    key = _key_bytes()
    encoded = plain.encode()
    xored = bytes(b ^ key[i % len(key)] for i, b in enumerate(encoded))
    return base64.urlsafe_b64encode(xored).decode()


def decrypt_api_key(stored: str) -> str:
    if not stored:
        return ""
    key = _key_bytes()
    raw = base64.urlsafe_b64decode(stored.encode())
    plain = bytes(b ^ key[i % len(key)] for i, b in enumerate(raw))
    return plain.decode()


def mask_api_key(plain: str) -> str:
    if not plain:
        return ""
    if len(plain) <= 8:
        return "••••••••"
    return f"{plain[:4]}••••{plain[-4:]}"

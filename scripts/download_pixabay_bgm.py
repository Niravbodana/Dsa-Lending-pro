#!/usr/bin/env python3
"""Download Pixabay 'Piano Soft Gentle Morning Keys' by alex-morgan."""
from __future__ import annotations

import re
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path("/opt/cursor/artifacts/neercred-promo-video/assets/soft_morning_keys_piano.mp3")
# Mixkit fallback — soft gentle morning piano (same mood if Pixabay CDN blocked)
FALLBACK_URL = "https://assets.mixkit.co/music/522/522.mp3"


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    cdn_urls: list[str] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            accept_downloads=True,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        )
        page = ctx.new_page()
        page.on(
            "response",
            lambda r: cdn_urls.append(r.url)
            if "cdn.pixabay.com/download/audio" in r.url and ".mp3" in r.url
            else None,
        )

        page.goto(
            "https://pixabay.com/music/search/piano%20soft%20gentle%20morning%20keys/",
            wait_until="domcontentloaded",
            timeout=60000,
        )
        page.wait_for_timeout(5000)

        # Open first matching track page
        track = page.locator('a[href*="piano-soft-gentle-morning-keys"]').first
        if track.count() == 0:
            track = page.get_by_text("Piano Soft Gentle Morning Keys", exact=False).first
        href = track.get_attribute("href")
        if not href:
            raise RuntimeError("Pixabay track link not found")
        if not href.startswith("http"):
            href = "https://pixabay.com" + href
        print("Track page:", href)
        page.goto(href, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(5000)

        html = page.content()
        m = re.search(r"https://cdn\.pixabay\.com/download/audio/[^\"'\\s]+\.mp3", html)
        if m:
            cdn = m.group(0)
            resp = ctx.request.get(cdn)
            if resp.ok:
                OUT.write_bytes(resp.body())
                browser.close()
                print(f"Saved via session CDN: {OUT} ({OUT.stat().st_size} bytes)")
                return
            print(f"CDN session fetch failed ({resp.status}), trying download button...")

        if cdn_urls:
            urllib.request.urlretrieve(cdn_urls[0], OUT)
            browser.close()
            print(f"Saved via CDN intercept: {OUT} ({OUT.stat().st_size} bytes)")
            return

        btn = page.locator("button:has-text('Free download'), a:has-text('Free download')").first
        if btn.count():
            with page.expect_download(timeout=90000) as dl_info:
                btn.click()
            dl_info.value.save_as(str(OUT))
            browser.close()
            print(f"Saved via download button: {OUT} ({OUT.stat().st_size} bytes)")
            return

        browser.close()

    print("Pixabay CDN blocked — using Mixkit soft morning piano fallback")
    urllib.request.urlretrieve(FALLBACK_URL, OUT)
    print(f"Saved fallback: {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()

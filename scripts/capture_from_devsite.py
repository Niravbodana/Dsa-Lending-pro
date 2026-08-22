#!/usr/bin/env python3
"""Capture NeerCred screenshots from dev.neercred.com — full viewport, no overlays."""

from pathlib import Path
import time

OUT = Path("/opt/cursor/artifacts/neercred-promo-video/screenshots")
BASE = "https://dev.neercred.com"
# Phone viewport — exact fit
VW, VH = 390, 844


def run():
    from playwright.sync_api import sync_playwright

    OUT.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            viewport={"width": VW, "height": VH},
            device_scale_factor=2,
            is_mobile=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        )
        page = ctx.new_page()

        def dismiss():
            for sel in [
                'button:has-text("Accept all")',
                'button:has-text("Accept")',
                '[aria-label="Close"]',
                'button:has-text("Essential only")',
            ]:
                try:
                    el = page.locator(sel).first
                    if el.is_visible(timeout=800):
                        el.click()
                        page.wait_for_timeout(400)
                except Exception:
                    pass
            # Hide cookie/push overlays via CSS
            page.evaluate("""() => {
                document.querySelectorAll('[class*="cookie"], [class*="Cookie"], [id*="cookie"]').forEach(e => e.remove());
            }""")

        def shot(name, scroll_y=0):
            if scroll_y:
                page.evaluate(f"window.scrollTo(0, {scroll_y})")
            page.wait_for_timeout(1000)
            dismiss()
            page.wait_for_timeout(300)
            page.screenshot(path=str(OUT / f"{name}.png"), full_page=False)
            print(f"  ✓ {name} ({VW}x{VH})")

        # 01 Homepage hero
        page.goto(BASE, wait_until="networkidle", timeout=90000)
        dismiss()
        shot("01-homepage")

        # Scroll to how it works
        page.evaluate("window.scrollTo(0, 800)")
        page.wait_for_timeout(800)
        dismiss()
        shot("01b-how-it-works", 800)

        # 02 Apply - mobile
        page.goto(f"{BASE}/apply", wait_until="networkidle", timeout=90000)
        dismiss()
        shot("02-mobile")

        # Fill mobile for OTP screen
        try:
            page.locator('input[type="tel"]').first.fill("9876543210", timeout=5000)
            page.locator('input[type="checkbox"]').first.check()
            page.locator('button:has-text("Continue")').first.click()
            page.wait_for_timeout(2500)
            dismiss()
            shot("03-otp")
        except Exception as e:
            print(f"  ! OTP step: {e}")

        # Rates page
        page.goto(f"{BASE}/rates", wait_until="networkidle", timeout=90000)
        dismiss()
        shot("04-rates")

        # Loans page
        page.goto(f"{BASE}/loans", wait_until="networkidle", timeout=90000)
        dismiss()
        shot("05-loans")

        # Compliance / trust
        page.goto(f"{BASE}/compliance", wait_until="networkidle", timeout=90000)
        dismiss()
        shot("06-compliance")

        # Track
        page.goto(f"{BASE}/track", wait_until="networkidle", timeout=90000)
        dismiss()
        shot("07-track")

        # Login
        page.goto(f"{BASE}/login", wait_until="networkidle", timeout=90000)
        dismiss()
        shot("08-login")

        # Also capture from local if available for apply flow depth
        try:
            page.goto("http://localhost:3000/dashboard?demo=1", wait_until="networkidle", timeout=15000)
            dismiss()
            shot("09-dashboard")
            page.goto("http://localhost:3000/apply", wait_until="networkidle", timeout=15000)
            # try session from local
            dismiss()
            shot("10-apply-local")
        except Exception:
            pass

        browser.close()

    print(f"\nScreenshots saved to {OUT}")


if __name__ == "__main__":
    run()

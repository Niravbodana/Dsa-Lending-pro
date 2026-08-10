#!/usr/bin/env python3
"""Premium NeerCred UI captures — mobile homepage, email OTP, Ramprakash dashboard."""

from __future__ import annotations

import random
import sys
import time
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from capture_email_js import EMAIL_APPLY_JS, EMAIL_OTP_JS  # noqa: E402

OUT = Path("/opt/cursor/artifacts/neercred-promo-video/screenshots")
BASE = "http://localhost:3000"
API = "http://localhost:8000/api"
VW, VH = 390, 844

CLEAN_JS = """() => {
  document.querySelectorAll(
    '.loan-guide-root, [class*="cookie"], [class*="Cookie"], [aria-label*="Cookie"]'
  ).forEach(e => e.remove());
  document.querySelectorAll('p').forEach(el => {
    const t = (el.textContent || '').trim();
    if (t.startsWith('Dev mode OTP') && t.length < 80) el.style.display = 'none';
  });
}"""

INIT_JS = """
localStorage.setItem('neer_cookie_consent_v1', JSON.stringify({
  essential: true, analytics: false, savedAt: new Date().toISOString()
}));
"""


def capture() -> None:
    from playwright.sync_api import sync_playwright

    OUT.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            viewport={"width": VW, "height": VH},
            device_scale_factor=3,
            is_mobile=True,
            locale="en-IN",
        )
        ctx.add_init_script(INIT_JS)
        page = ctx.new_page()

        def ready(ms: int = 2800) -> None:
            page.wait_for_load_state("load", timeout=45000)
            page.wait_for_function("document.fonts.ready", timeout=15000)
            page.wait_for_timeout(ms)

        def clean() -> None:
            page.evaluate(CLEAN_JS)
            page.wait_for_timeout(400)

        def shot(name: str, scroll: int = 0) -> None:
            if scroll:
                page.evaluate(f"window.scrollTo({{top:{scroll},behavior:'instant'}})")
                page.wait_for_timeout(700)
            clean()
            path = OUT / f"{name}.png"
            page.screenshot(path=str(path), animations="disabled", type="png")
            print(f"  ✓ {name} ({path.stat().st_size // 1024} KB)")

        # Marketing pages — new premium mobile homepage for promo
        page.goto(f"{BASE}/promo-homepage", wait_until="domcontentloaded", timeout=60000)
        ready()
        shot("01-homepage")
        shot("01b-how-it-works", scroll=650)

        page.goto(f"{BASE}/rates", wait_until="domcontentloaded", timeout=60000)
        ready()
        shot("04-rates")

        page.goto(f"{BASE}/compliance", wait_until="domcontentloaded", timeout=60000)
        ready()
        shot("06-compliance")

        # Apply flow — email UI for promo (screenshot only, then real mobile OTP for API)
        page.goto(f"{BASE}/apply", wait_until="domcontentloaded", timeout=60000)
        ready()
        page.evaluate(EMAIL_APPLY_JS)
        page.wait_for_timeout(500)
        clean()
        shot("02-apply-email")

        page.goto(f"{BASE}/apply", wait_until="domcontentloaded", timeout=60000)
        ready()
        mob = f"9{random.randint(100000000, 999999999)}"
        page.locator('input[type="tel"]').first.fill(mob)
        page.locator('input[type="checkbox"]').first.check(force=True)
        page.wait_for_timeout(300)
        page.locator('button:has-text("Continue")').first.click()
        page.locator('h2:has-text("Enter OTP")').wait_for(state="visible", timeout=20000)
        page.wait_for_timeout(800)
        page.evaluate(EMAIL_OTP_JS)
        page.locator('input[placeholder*="•"]').first.fill("123456")
        clean()
        shot("03-otp-email")

        # API journey for profile → offers → KYC → dashboard
        try:
            time.sleep(0.5)
            mob2 = f"9{random.randint(100000000, 999999999)}"
            r = requests.post(
                f"{API}/auth/send-otp",
                json={"mobile": mob2, "sms_consent": True},
                timeout=15,
            )
            r.raise_for_status()
            otp = r.json()["dev_otp"]
            t = requests.post(
                f"{API}/auth/verify-otp",
                json={"mobile": mob2, "otp": otp},
                timeout=15,
            ).json()["session_token"]

            page.goto(BASE)
            page.evaluate(f"localStorage.setItem('session_token', '{t}')")
            page.goto(f"{BASE}/apply", wait_until="domcontentloaded", timeout=30000)
            ready(2000)
            shot("04-profile")

            prof = {
                "session_token": t,
                "pan": "ABCDE1234F",
                "full_name": "Ramprakash Sharma",
                "date_of_birth": "1990-05-15",
                "email": "ramprakash@email.com",
                "pincode": "411001",
                "gender": "male",
                "monthly_income": 85000,
                "employment_type": "salaried",
                "city": "Pune",
                "consents": {
                    "dpdp_data_processing": True,
                    "privacy_policy": True,
                    "terms_of_service": True,
                    "credit_bureau_check": True,
                },
            }
            requests.post(f"{API}/leads/details", json=prof, timeout=15)
            requests.post(
                f"{API}/leads/check-eligibility",
                json={"session_token": t, "loan_purpose": "wedding", "existing_emi": 0},
                timeout=15,
            )
            offers = requests.get(
                f"{API}/leads/offers", params={"session_token": t}, timeout=15
            ).json()

            page.goto(f"{BASE}/apply", wait_until="domcontentloaded", timeout=30000)
            ready(2000)
            page.evaluate("window.scrollTo(0, 280)")
            shot("09-offers")

            internal = [
                o for o in offers.get("offers", [])
                if o.get("workflow_mode") != "external_handoff"
            ]
            if internal:
                o = internal[0]
                sel = requests.post(
                    f"{API}/leads/select-offer",
                    json={
                        "session_token": t,
                        "offer_id": o["offer_id"],
                        "lender_name": o["lender_name"],
                        "loan_amount": o["loan_amount"],
                        "interest_rate": o["interest_rate"],
                        "tenure_months": o["tenure_months"],
                        "emi": o["emi"],
                        "lender_data_sharing_consent": True,
                    },
                    timeout=15,
                ).json()
                aid = sel.get("application_id")
                if aid:
                    page.goto(
                        f"{BASE}/application/{aid}/kyc",
                        wait_until="domcontentloaded",
                        timeout=30000,
                    )
                    ready()
                    shot("10-kyc")

            page.goto(f"{BASE}/dashboard?demo=1", wait_until="domcontentloaded", timeout=20000)
            ready()
            shot("11-dashboard")

        except Exception as e:
            print(f"  ! api flow: {e}")

        # Approved scene — always capture (no API dependency)
        try:
            page.goto(f"{BASE}/promo-approved", wait_until="domcontentloaded", timeout=20000)
            ready(2000)
            shot("12-approved")
        except Exception as e:
            print(f"  ! approved page: {e}")

        browser.close()
    print("Done")


if __name__ == "__main__":
    capture()

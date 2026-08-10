#!/usr/bin/env python3
"""Robust screenshot capture from dev.neercred.com — wait for full hydration."""

from pathlib import Path
import time

OUT = Path("/opt/cursor/artifacts/neercred-promo-video/screenshots")
BASE = "https://dev.neercred.com"
VW, VH = 390, 844


def capture():
    from playwright.sync_api import sync_playwright

    OUT.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            viewport={"width": VW, "height": VH},
            device_scale_factor=2,
            is_mobile=True,
            locale="en-IN",
            user_agent=(
                "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
                "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
            ),
        )
        page = ctx.new_page()

        def wait_ready():
            page.wait_for_load_state("networkidle", timeout=60000)
            page.wait_for_timeout(2500)

        def dismiss():
            for sel in [
                'button:has-text("Accept all")',
                'button:has-text("Accept")',
                'button:has-text("Essential only")',
            ]:
                try:
                    el = page.locator(sel).first
                    if el.is_visible(timeout=1500):
                        el.click()
                        page.wait_for_timeout(500)
                except Exception:
                    pass
            page.evaluate("""() => {
              document.querySelectorAll(
                '[class*="cookie"],[class*="Cookie"],[class*="push"],[id*="cookie"]'
              ).forEach(e => e.remove());
            }""")

        def shot(name, scroll=0):
            if scroll:
                page.evaluate(f"window.scrollTo(0, {scroll})")
                page.wait_for_timeout(800)
            dismiss()
            page.wait_for_timeout(1200)
            path = OUT / f"{name}.png"
            page.screenshot(path=str(path), full_page=False, animations="disabled")
            print(f"  ✓ {name}")
            return path

        # ── Homepage ──
        page.goto(BASE, wait_until="domcontentloaded", timeout=90000)
        wait_ready()
        page.wait_for_selector("text=NeerCred", timeout=30000)
        dismiss()
        shot("01-homepage")
        shot("01b-how-it-works", scroll=900)

        # ── Apply flow ──
        page.goto(f"{BASE}/apply", wait_until="domcontentloaded", timeout=90000)
        wait_ready()
        try:
            page.wait_for_selector("text=/verify|offer|email|mobile/i", timeout=30000)
        except Exception:
            page.wait_for_timeout(3000)
        dismiss()
        shot("02-apply")

        # Try email input
        try:
            email = page.locator(
                'input[type="email"], input[placeholder*="@" i], input[placeholder*="email" i]'
            ).first
            email.wait_for(state="visible", timeout=15000)
            email.fill("rahul.sharma@email.com")
            page.locator('button:has-text("Send OTP"), button:has-text("Continue")').first.click()
            page.wait_for_timeout(4000)
            dismiss()
            shot("03-otp-email")
        except Exception as e:
            print(f"  ! email OTP: {e}")
            shot("03-otp-email")  # fallback same as apply

        # ── Other pages ──
        for path, name in [
            ("/rates", "04-rates"),
            ("/loans", "05-loans"),
            ("/compliance", "06-compliance"),
            ("/track", "07-track"),
            ("/login", "08-login"),
        ]:
            page.goto(f"{BASE}{path}", wait_until="domcontentloaded", timeout=90000)
            wait_ready()
            try:
                page.wait_for_selector("text=NeerCred", timeout=20000)
            except Exception:
                pass
            dismiss()
            shot(name)

        # ── Local backend for offers + KYC (same UI, deeper flow) ──
        try:
            import requests
            API = "http://localhost:8000/api"
            M = "9988776622"
            time.sleep(1)
            r = requests.post(f"{API}/auth/send-otp", json={"mobile": M, "sms_consent": True}, timeout=10)
            if r.ok:
                otp = r.json().get("dev_otp", "123456")
                t = requests.post(f"{API}/auth/verify-otp", json={"mobile": M, "otp": otp}, timeout=10).json()["session_token"]
                profile = {
                    "session_token": t, "pan": "ABCDE1234F", "full_name": "Rahul Sharma",
                    "date_of_birth": "1990-05-15", "email": "r@e.com", "pincode": "411001",
                    "gender": "male", "monthly_income": 75000, "employment_type": "salaried",
                    "city": "Pune",
                    "consents": {"dpdp_data_processing": True, "privacy_policy": True,
                                 "terms_of_service": True, "credit_bureau_check": True},
                }
                requests.post(f"{API}/leads/details", json=profile, timeout=10)
                requests.post(f"{API}/leads/check-eligibility",
                              json={"session_token": t, "loan_purpose": "wedding", "existing_emi": 0}, timeout=10)
                offers = requests.get(f"{API}/leads/offers", params={"session_token": t}, timeout=10).json()
                page.goto("http://localhost:3000")
                page.evaluate(f"() => localStorage.setItem('session_token', '{t}')")
                page.goto("http://localhost:3000/apply", wait_until="networkidle", timeout=30000)
                dismiss()
                page.evaluate("window.scrollTo(0, 500)")
                page.wait_for_timeout(1000)
                shot("09-offers")
                internal = [o for o in offers.get("offers", []) if o.get("workflow_mode") != "external_handoff"]
                if internal:
                    o = internal[0]
                    sel = requests.post(f"{API}/leads/select-offer", json={
                        "session_token": t, "offer_id": o["offer_id"],
                        "lender_name": o["lender_name"], "loan_amount": o["loan_amount"],
                        "interest_rate": o["interest_rate"], "tenure_months": o["tenure_months"],
                        "emi": o["emi"], "lender_data_sharing_consent": True,
                    }, timeout=10).json()
                    app_id = sel.get("application_id")
                    if app_id:
                        page.goto(f"http://localhost:3000/application/{app_id}/kyc",
                                  wait_until="networkidle", timeout=30000)
                        dismiss()
                        shot("10-kyc")
                page.goto("http://localhost:3000/dashboard?demo=1", wait_until="networkidle", timeout=20000)
                dismiss()
                shot("11-dashboard")
        except Exception as e:
            print(f"  ! local flow: {e}")

        browser.close()
    print(f"\nDone → {OUT}")


if __name__ == "__main__":
    capture()

#!/usr/bin/env python3
"""Capture real NeerCred screenshots — minimal API calls, full workflow."""

from pathlib import Path
import time

import requests

OUT = Path("/opt/cursor/artifacts/neercred-promo-video/screenshots")
BASE = "http://localhost:3000"
API = "http://localhost:8000/api"


def api_session(mobile: str) -> str:
    time.sleep(1)
    r = requests.post(f"{API}/auth/send-otp", json={"mobile": mobile, "sms_consent": True})
    r.raise_for_status()
    otp = r.json().get("dev_otp", "123456")
    r = requests.post(f"{API}/auth/verify-otp", json={"mobile": mobile, "otp": otp})
    r.raise_for_status()
    return r.json()["session_token"]


def complete_profile(token: str) -> dict:
    profile = {
        "session_token": token,
        "pan": "ABCDE1234F",
        "full_name": "Rahul Sharma",
        "date_of_birth": "1990-05-15",
        "email": "rahul.sharma@email.com",
        "pincode": "411001",
        "gender": "male",
        "monthly_income": 75000,
        "employment_type": "salaried",
        "city": "Pune",
        "consents": {
            "dpdp_data_processing": True,
            "privacy_policy": True,
            "terms_of_service": True,
            "credit_bureau_check": True,
        },
    }
    requests.post(f"{API}/leads/details", json=profile).raise_for_status()
    requests.post(f"{API}/leads/check-eligibility", json={
        "session_token": token, "loan_purpose": "wedding", "existing_emi": 0,
    }).raise_for_status()
    return requests.get(f"{API}/leads/offers", params={"session_token": token}).json()


def select_internal_offer(token: str, offers: dict) -> int | None:
    if not offers.get("offers"):
        return None
    internal = [o for o in offers["offers"] if o.get("workflow_mode") != "external_handoff"]
    o = internal[0] if internal else offers["offers"][0]
    r = requests.post(f"{API}/leads/select-offer", json={
        "session_token": token,
        "offer_id": o["offer_id"],
        "lender_name": o["lender_name"],
        "loan_amount": o["loan_amount"],
        "interest_rate": o["interest_rate"],
        "tenure_months": o["tenure_months"],
        "emi": o["emi"],
        "lender_data_sharing_consent": True,
    })
    if r.ok:
        return r.json().get("application_id")
    print("  ! select:", r.status_code, r.text[:150])
    return None


def run_capture():
    from playwright.sync_api import sync_playwright

    OUT.mkdir(parents=True, exist_ok=True)
    app_id = None
    offers = {"offers": []}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True)
        page = ctx.new_page()

        def shot(name):
            page.wait_for_timeout(1200)
            page.screenshot(path=str(OUT / f"{name}.png"))
            print(f"  ✓ {name}")

        def dismiss():
            for sel in ['button:has-text("Accept all")', 'button:has-text("Accept")']:
                try:
                    if page.locator(sel).first.is_visible(timeout=1000):
                        page.locator(sel).first.click()
                        page.wait_for_timeout(300)
                except Exception:
                    pass

        def set_token(token: str | None):
            page.evaluate(
                f"() => {{ {'localStorage.setItem(' + repr('session_token') + ', ' + repr(token) + ')' if token else 'localStorage.removeItem(' + repr('session_token') + ')'} }}"
            )

        # 01 Homepage
        page.goto(BASE, wait_until="networkidle", timeout=60000)
        dismiss()
        shot("01-homepage")

        # 02-05 Profile flow via browser (one OTP)
        set_token(None)
        page.goto(f"{BASE}/apply", wait_until="networkidle", timeout=60000)
        dismiss()
        shot("02-mobile")

        page.locator('input[type="tel"]').first.fill("9123456789")
        page.locator('input[type="checkbox"]').first.check()
        page.locator('button:has-text("Continue")').first.click()
        page.wait_for_timeout(2000)
        shot("03-otp")

        # Read dev OTP from page
        otp = "123456"
        try:
            otp_text = page.locator("strong.font-mono").first.text_content(timeout=3000)
            if otp_text and len(otp_text.strip()) == 6:
                otp = otp_text.strip()
        except Exception:
            pass
        page.locator('input[inputmode="numeric"], input[placeholder*="•"]').first.fill(otp)
        page.locator('button:has-text("Verify")').first.click()
        page.wait_for_timeout(2500)
        shot("04-profile-pan")

        page.locator('input[maxlength="10"], input[placeholder*="ABCDE" i]').first.fill("ABCDE1234F")
        page.wait_for_timeout(2500)
        page.locator('button:has-text("Continue")').first.click()
        page.wait_for_timeout(2000)
        shot("05-profile-details")

        # 06-07 Offers + KYC via API (single session)
        token = api_session("9988776655")
        offers = complete_profile(token)
        set_token(token)
        page.goto(f"{BASE}/apply", wait_until="networkidle", timeout=60000)
        dismiss()
        try:
            page.locator('text=/Your offers|eligible/i').first.wait_for(timeout=10000)
        except Exception:
            pass
        shot("06-offers")
        page.evaluate("window.scrollTo(0, 500)")
        page.wait_for_timeout(800)
        shot("06b-offer-cards")

        app_id = select_internal_offer(token, offers)
        if app_id:
            set_token(token)
            page.goto(f"{BASE}/application/{app_id}/kyc", wait_until="networkidle", timeout=60000)
            dismiss()
            shot("07-kyc")

        page.goto(f"{BASE}/dashboard?demo=1", wait_until="networkidle", timeout=60000)
        shot("08-dashboard")
        page.goto(f"{BASE}/compliance", wait_until="networkidle", timeout=60000)
        shot("10-compliance")

        browser.close()

    print(f"\nDone. Offers: {len(offers.get('offers', []))}, KYC: {app_id}")


if __name__ == "__main__":
    run_capture()

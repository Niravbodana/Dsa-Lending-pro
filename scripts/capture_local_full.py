#!/usr/bin/env python3
"""Capture fully-loaded NeerCred UI (localhost = same as dev.neercred.com)."""

from pathlib import Path
import time, requests

OUT = Path("/opt/cursor/artifacts/neercred-promo-video/screenshots")
BASE = "http://localhost:3000"
API = "http://localhost:8000/api"
VW, VH = 390, 844


def capture():
    from playwright.sync_api import sync_playwright
    OUT.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_context(
            viewport={"width": VW, "height": VH},
            device_scale_factor=2,
            is_mobile=True,
        ).new_page()

        def ready():
            page.wait_for_load_state("load", timeout=30000)
            page.wait_for_timeout(2500)

        def dismiss():
            for sel in ['button:has-text("Accept all")', 'button:has-text("Accept")']:
                try:
                    if page.locator(sel).first.is_visible(timeout=1000):
                        page.locator(sel).first.click()
                        page.wait_for_timeout(400)
                except Exception:
                    pass

        def shot(name, scroll=0):
            if scroll:
                page.evaluate(f"window.scrollTo(0,{scroll})")
                page.wait_for_timeout(600)
            dismiss()
            page.evaluate("""() => {
                document.querySelectorAll('[class*="cookie"],[class*="Cookie"]').forEach(e=>e.remove());
                document.querySelectorAll('p, div, span').forEach(el=>{
                    const t=(el.textContent||'').trim();
                    if(t.startsWith('Dev mode OTP') && t.length < 80) el.style.display='none';
                });
            }""")
            page.wait_for_timeout(800)
            page.screenshot(path=str(OUT / f"{name}.png"), animations="disabled")
            print(f"  ✓ {name}")

        # Homepage
        page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
        ready(); dismiss(); shot("01-homepage")
        shot("01b-how-it-works", scroll=700)

        # Apply - mobile/email
        page.goto(f"{BASE}/apply", wait_until="domcontentloaded", timeout=60000)
        ready(); dismiss(); shot("02-apply")

        # Mobile → OTP step (unique mobile avoids rate limit)
        try:
            import random
            mob = f"9{random.randint(100000000, 999999999)}"
            mobile_inp = page.locator('input[type="tel"]').first
            mobile_inp.wait_for(state="visible", timeout=10000)
            mobile_inp.fill(mob)
            page.locator('input[type="checkbox"]').first.check(force=True)
            page.wait_for_timeout(400)
            page.locator('button:has-text("Continue")').first.click()
            page.locator('h2:has-text("Enter OTP")').wait_for(state="visible", timeout=20000)
            page.wait_for_timeout(1500)
            otp_inp = page.locator('input[placeholder*="•"]').first
            otp_inp.fill("123456")
            page.wait_for_timeout(800)
            dismiss()
            shot("03-otp")
        except Exception as e:
            print(f"  ! otp: {e}")

        for path, name in [("/rates","04-rates"),("/loans","05-loans"),
                           ("/compliance","06-compliance"),("/track","07-track")]:
            page.goto(f"{BASE}{path}", wait_until="domcontentloaded", timeout=60000)
            ready(); dismiss(); shot(name)

        # API flow for offers + KYC
        try:
            time.sleep(1)
            M = "9988776633"
            r = requests.post(f"{API}/auth/send-otp", json={"mobile": M, "sms_consent": True}, timeout=10)
            r.raise_for_status()
            otp = r.json()["dev_otp"]
            t = requests.post(f"{API}/auth/verify-otp", json={"mobile": M, "otp": otp}, timeout=10).json()["session_token"]
            prof = {"session_token": t, "pan": "ABCDE1234F", "full_name": "Rahul Sharma",
                    "date_of_birth": "1990-05-15", "email": "r@e.com", "pincode": "411001",
                    "gender": "male", "monthly_income": 75000, "employment_type": "salaried", "city": "Pune",
                    "consents": {"dpdp_data_processing": True, "privacy_policy": True,
                                 "terms_of_service": True, "credit_bureau_check": True}}
            requests.post(f"{API}/leads/details", json=prof, timeout=10)
            requests.post(f"{API}/leads/check-eligibility",
                          json={"session_token": t, "loan_purpose": "wedding", "existing_emi": 0}, timeout=10)
            offers = requests.get(f"{API}/leads/offers", params={"session_token": t}, timeout=10).json()
            page.goto(BASE); page.evaluate(f"localStorage.setItem('session_token','{t}')")
            page.goto(f"{BASE}/apply", wait_until="domcontentloaded", timeout=30000)
            ready(); page.evaluate("window.scrollTo(0,500)"); shot("09-offers")
            internal = [o for o in offers.get("offers", []) if o.get("workflow_mode") != "external_handoff"]
            if internal:
                o = internal[0]
                sel = requests.post(f"{API}/leads/select-offer", json={
                    "session_token": t, "offer_id": o["offer_id"], "lender_name": o["lender_name"],
                    "loan_amount": o["loan_amount"], "interest_rate": o["interest_rate"],
                    "tenure_months": o["tenure_months"], "emi": o["emi"],
                    "lender_data_sharing_consent": True}, timeout=10).json()
                aid = sel.get("application_id")
                if aid:
                    page.goto(f"{BASE}/application/{aid}/kyc", wait_until="domcontentloaded", timeout=30000)
                    ready(); shot("10-kyc")
            page.goto(f"{BASE}/dashboard?demo=1", wait_until="domcontentloaded", timeout=20000)
            ready(); shot("11-dashboard")
        except Exception as e:
            print(f"  ! api: {e}")

        browser.close()
    print("Done")


if __name__ == "__main__":
    capture()

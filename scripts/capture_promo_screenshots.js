#!/usr/bin/env node
/**
 * Capture real NeerCred mobile screenshots for promo video.
 * Run: node scripts/capture_promo_screenshots.js
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const OUT = "/opt/cursor/artifacts/neercred-promo-video/screenshots";
const BASE = "http://localhost:3000";
const MOBILE = { width: 390, height: 844 };

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log("  ✓", name);
  return file;
}

async function dismissOverlays(page) {
  try {
    const cookie = page.locator('button:has-text("Accept")');
    if (await cookie.isVisible({ timeout: 2000 })) await cookie.click();
  } catch {}
  try {
    const close = page.locator('[aria-label="Close"]');
    if (await close.isVisible({ timeout: 1000 })) await close.click();
  } catch {}
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: MOBILE,
    deviceScaleFactor: 2,
    isMobile: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  const page = await ctx.newPage();

  // 01 Homepage
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await dismissOverlays(page);
  await page.waitForTimeout(1500);
  await shot(page, "01-homepage");

  // 02 Apply - Mobile
  await page.goto(`${BASE}/apply`, { waitUntil: "networkidle", timeout: 60000 });
  await dismissOverlays(page);
  await page.waitForTimeout(1000);
  await shot(page, "02-mobile");

  // 03 OTP - fill mobile
  const mobileInput = page.locator('input[type="tel"], input[placeholder*="mobile" i], input[placeholder*="digit" i]').first();
  await mobileInput.fill("9876543210");
  try {
    const consent = page.locator('input[type="checkbox"]').first();
    if (await consent.isVisible({ timeout: 2000 })) await consent.check();
  } catch {}
  const continueBtn = page.locator('button:has-text("Continue"), button:has-text("continue")').first();
  await continueBtn.click();
  await page.waitForTimeout(2000);
  await shot(page, "03-otp");

  // 04 OTP verify - read dev OTP from page
  let otp = "123456";
  try {
    const devOtpEl = page.locator('text=/Dev mode OTP/i');
    if (await devOtpEl.isVisible({ timeout: 3000 })) {
      const text = await page.locator('strong.font-mono').first().textContent();
      if (text && text.length === 6) otp = text.trim();
    }
  } catch {}
  const otpInputs = page.locator('input[maxlength="1"], input[inputmode="numeric"]');
  const count = await otpInputs.count();
  if (count >= 6) {
    for (let i = 0; i < 6; i++) await otpInputs.nth(i).fill(otp[i]);
  } else {
    const single = page.locator('input[placeholder*="OTP" i], input[placeholder*="•" i]').first();
    if (await single.isVisible({ timeout: 2000 })) await single.fill(otp);
  }
  await page.waitForTimeout(500);
  const verifyBtn = page.locator('button:has-text("Verify"), button:has-text("verify")').first();
  await verifyBtn.click({ force: false });
  await page.waitForTimeout(3000);
  await shot(page, "04-profile-pan");

  // 05 Profile - fill and advance through all sub-steps
  async function fillCurrentField() {
    const textInput = page.locator('input[type="text"], input[type="email"], input[type="number"], input[type="date"]').first();
    if (await textInput.isVisible({ timeout: 800 }).catch(() => false)) {
      const ph = ((await textInput.getAttribute("placeholder")) || "").toLowerCase();
      if (ph.includes("pan")) await textInput.fill("ABCDE1234F");
      else if (ph.includes("name")) await textInput.fill("Rahul Sharma");
      else if (ph.includes("email")) await textInput.fill("rahul@email.com");
      else if (ph.includes("pin")) await textInput.fill("411001");
      else if (ph.includes("income")) await textInput.fill("75000");
      else if (ph.includes("city")) await textInput.fill("Pune");
      else if (ph.includes("emi")) await textInput.fill("0");
      else await textInput.fill("Test");
    }
    const radios = page.locator('input[type="radio"]');
    if (await radios.first().isVisible({ timeout: 500 }).catch(() => false)) {
      await radios.first().check().catch(() => {});
    }
    const selects = page.locator("select");
    if (await selects.first().isVisible({ timeout: 500 }).catch(() => false)) {
      await selects.first().selectOption({ index: 1 }).catch(() => {});
    }
    const checkboxes = page.locator('input[type="checkbox"]');
    const cbCount = await checkboxes.count();
    for (let j = 0; j < cbCount; j++) {
      try { await checkboxes.nth(j).check({ timeout: 300 }); } catch {}
    }
  }

  for (let step = 0; step < 14; step++) {
    const offersVisible = await page.locator('h2:has-text("offer"), text=/Your offers/i').first()
      .isVisible({ timeout: 800 }).catch(() => false);
    if (offersVisible) break;
    await fillCurrentField();
    const btn = page.locator('button:has-text("Continue"), button:has-text("See my offers")').first();
    if (!(await btn.isVisible({ timeout: 2000 }).catch(() => false))) break;
    const disabled = await btn.isDisabled().catch(() => true);
    if (disabled) {
      await fillCurrentField();
      await page.waitForTimeout(500);
    }
    if (await btn.isDisabled().catch(() => true)) break;
    await btn.click();
    await page.waitForTimeout(1200);
    if (step === 2) await shot(page, "05-profile-details");
    if (step === 6) await shot(page, "05b-consent");
  }
  await shot(page, "06-offers");

  // 07 Dashboard demo
  await page.goto(`${BASE}/dashboard?demo=1`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  await shot(page, "07-dashboard");

  // 08 Track
  await page.goto(`${BASE}/track`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1000);
  await shot(page, "08-track");

  // 09 Compliance
  await page.goto(`${BASE}/compliance`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1000);
  await shot(page, "09-compliance");

  // 10 Rates
  await page.goto(`${BASE}/rates`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1000);
  await shot(page, "10-rates");

  await browser.close();
  console.log("\nScreenshots saved to", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export type ApplyGuideStep = "mobile" | "otp" | "details" | "offers";

export type GuideField =
  | "mobile"
  | "sms_consent"
  | "otp"
  | "full_name"
  | "pan"
  | "monthly_income"
  | "employment_type"
  | "city"
  | "loan_purpose"
  | "existing_emi"
  | "consent"
  | "offers"
  | null;

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "शुभ प्रभात! Good morning 🙏";
  if (h >= 12 && h < 17) return "नमस्कार! Good afternoon 🙏";
  if (h >= 17 && h < 21) return "शुभ संध्या! Good evening 🙏";
  return "नमस्ते! Hello 🙏";
}

export function greetingLine(): string {
  return timeGreeting();
}

const STEP_INTRO: Record<ApplyGuideStep, string[]> = {
  mobile: [
    "Main Neera hoon — aapki financial guide! 📱",
    "Pehle yahan apna 10-digit mobile number daliye.",
    "Aadhaar-linked number best rehta hai — KYC easy ho jati hai.",
  ],
  otp: [
    "Bahut badhiya! Ab OTP verify karte hain. 🔐",
    "Jo 6-digit code aaya hai, wahi yahan enter kijiye.",
    "OTP kisi ke saath share mat kijiye — bilkul safe rakhein.",
  ],
  details: [
    "Ab thodi basic details — phir best offers milenge! ✨",
    "Main har field mein help karunga — tension mat lijiye.",
    "Jahan main point karoon, wahi fill kijiye — step by step.",
  ],
  offers: [
    "Wah! Aapke personalised offers aa gaye! 🎉",
    "Sabse kam rate ya EMI — jo suit kare woh chuniye.",
    "Koi doubt ho to mujhe tap karke pooch sakte hain — bas dhire se 😄",
  ],
};

const FIELD_HINTS: Record<string, string[]> = {
  mobile: [
    "Yahan mobile number daliye — 10 digits.",
    "Example: 98XXXXXXXX jaise apna number likhiye.",
    "SMS consent tick karna mat bhooliye!",
  ],
  sms_consent: ["Is box ko tick kijiye taaki OTP aa sake.", "DPDP ke hisaab se consent zaroori hai."],
  otp: ["OTP yahan type kijiye.", "6 digits complete hone par aage badhenge."],
  full_name: ["Apna poora naam PAN card jaisa likhiye.", "Spelling sahi ho to approval fast hota hai."],
  pan: [
    "Yahan PAN card number daliye — main saath hoon! 🪪",
    "Format: ABCDE1234F jaisa 10 characters.",
    "Dekhiye, main haath se fill karne jaisa dikha raha hoon — aap bhi likh dijiye!",
  ],
  monthly_income: ["Mahine ki kamai ₹ mein batayiye.", "Sahi income se better loan limit milti hai."],
  employment_type: ["Salaried, self-employed ya business — sahi option chuniye."],
  city: ["Apna sheher yahan likhiye.", "Jahan aap rehte hain woh city daliye."],
  loan_purpose: ["Loan kis liye chahiye — wedding, medical, business?", "Sahi purpose se matching offers milte hain."],
  existing_emi: ["Agar koi chal rahi EMI hai to yahan likhiye, warna 0.", "Optional hai — skip bhi kar sakte hain."],
  consent: ["Privacy aur Terms accept kijiye — mandatory hai.", "Phir 'See my offers' dabaiye!"],
  offers: ["Offer card par click karke lender select kijiye.", "Lowest rate ya EMI — compare karke chuniye."],
};

export function hintsForStep(step: ApplyGuideStep, field: GuideField): string[] {
  if (field && FIELD_HINTS[field]) return FIELD_HINTS[field];
  return STEP_INTRO[step];
}

export function pickHint(step: ApplyGuideStep, field: GuideField, index: number): string {
  const list = hintsForStep(step, field);
  return list[index % list.length];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type LoanOffer = {
  offer_id: string;
  lender_name: string;
  lender_logo: string;
  loan_amount: number;
  interest_rate: number;
  tenure_months: number;
  emi: number;
  processing_fee: string;
  approval_chance: "high" | "medium" | "low";
  features: string[];
};

export async function sendOtp(mobile: string) {
  const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed to send OTP");
  return res.json() as Promise<{ message: string; expires_in: number; dev_otp?: string }>;
}

export async function verifyOtp(mobile: string, otp: string) {
  const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile, otp }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Invalid OTP");
  return res.json() as Promise<{ session_token: string; verified: boolean }>;
}

export async function submitDetails(data: {
  session_token: string;
  full_name: string;
  pan: string;
  monthly_income: number;
  employment_type: "salaried" | "self_employed" | "business";
  city: string;
}) {
  const res = await fetch(`${API_BASE}/api/leads/details`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed to save details");
  return res.json();
}

export async function fetchOffers(sessionToken: string) {
  const res = await fetch(
    `${API_BASE}/api/leads/offers?session_token=${encodeURIComponent(sessionToken)}`
  );
  if (!res.ok) throw new Error((await res.json()).detail || "Failed to fetch offers");
  return res.json() as Promise<{ lead_id: number; offers: LoanOffer[]; message: string }>;
}

export async function selectOffer(data: {
  session_token: string;
  offer_id: string;
  lender_name: string;
}) {
  const res = await fetch(`${API_BASE}/api/leads/select-offer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed to select offer");
  return res.json();
}

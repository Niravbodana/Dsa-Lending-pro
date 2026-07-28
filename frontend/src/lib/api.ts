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
  is_best_deal?: boolean;
  lender_api_source?: string;
  response_time_ms?: number | null;
};

export type EligibilityResult = {
  eligible: boolean;
  score: number;
  max_loan_amount: number;
  recommended_tenure: number;
  debt_to_income_ratio: number;
  message: string;
  factors: string[];
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

export async function checkEligibility(data: {
  session_token: string;
  loan_purpose: string;
  existing_emi: number;
}) {
  const res = await fetch(`${API_BASE}/api/leads/check-eligibility`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Eligibility check failed");
  return res.json() as Promise<{ lead_id: number; eligibility: EligibilityResult }>;
}

export async function fetchOffers(sessionToken: string) {
  const res = await fetch(
    `${API_BASE}/api/leads/offers?session_token=${encodeURIComponent(sessionToken)}`
  );
  if (!res.ok) throw new Error((await res.json()).detail || "Failed to fetch offers");
  return res.json() as Promise<{
    lead_id: number;
    offers: LoanOffer[];
    message: string;
    eligibility_score?: number;
    partners_queried: number;
    partners_responded: number;
  }>;
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

// --- Bug Reports ---
export async function reportBug(data: {
  title: string;
  description: string;
  severity?: string;
  page_url?: string;
  reported_by?: string;
}) {
  const res = await fetch(`${API_BASE}/api/admin/bugs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed to report bug");
  return res.json();
}

// --- Admin ---
export type AdminStats = {
  total_leads: number;
  otp_verified: number;
  details_submitted: number;
  offers_fetched: number;
  offer_selected: number;
  open_bugs: number;
  fixed_bugs: number;
  total_bugs: number;
  conversion_rate: number;
};

export type Lead = {
  id: number;
  mobile: string;
  full_name: string | null;
  pan: string | null;
  monthly_income: number | null;
  employment_type: string | null;
  city: string | null;
  status: string;
  selected_lender: string | null;
  selected_offer_id: string | null;
  created_at: string;
};

export type Bug = {
  id: number;
  title: string;
  description: string;
  severity: string;
  status: string;
  page_url: string | null;
  reported_by: string | null;
  fix_notes: string | null;
  created_at: string;
  fixed_at: string | null;
};

function adminHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function adminLogin(password: string) {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error("Invalid password");
  return res.json() as Promise<{ token: string }>;
}

export async function getAdminStats(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/stats`, { headers: adminHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json() as Promise<AdminStats>;
}

export async function getAdminLeads(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/leads`, { headers: adminHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch leads");
  return res.json() as Promise<Lead[]>;
}

export async function getAdminBugs(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/bugs`, { headers: adminHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch bugs");
  return res.json() as Promise<Bug[]>;
}

export async function updateBug(
  token: string,
  bugId: number,
  data: { status?: string; severity?: string; fix_notes?: string }
) {
  const res = await fetch(`${API_BASE}/api/admin/bugs/${bugId}`, {
    method: "PATCH",
    headers: adminHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update bug");
  return res.json() as Promise<Bug>;
}

export async function deleteBug(token: string, bugId: number) {
  const res = await fetch(`${API_BASE}/api/admin/bugs/${bugId}`, {
    method: "DELETE",
    headers: adminHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete bug");
  return res.json();
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function sessionHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

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

export async function sendOtp(mobile: string, smsConsent: boolean) {
  const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile, sms_consent: smsConsent }),
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
  date_of_birth?: string;
  email?: string;
  pincode?: string;
  gender?: "male" | "female" | "other";
  consents: {
    dpdp_data_processing: boolean;
    privacy_policy: boolean;
    terms_of_service: boolean;
    credit_bureau_check: boolean;
    marketing_communications: boolean;
    privacy_version: string;
    terms_version: string;
    dpdp_version: string;
  };
  page_url?: string;
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
  const res = await fetch(`${API_BASE}/api/leads/offers`, {
    headers: sessionHeaders(sessionToken),
  });
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
  loan_amount: number;
  interest_rate: number;
  tenure_months: number;
  emi: number;
  lender_data_sharing_consent: boolean;
  page_url?: string;
}) {
  const res = await fetch(`${API_BASE}/api/leads/select-offer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed to select offer");
  return res.json() as Promise<{
    application_id: number;
    application_ref: string;
    lender_name: string;
    message: string;
  }>;
}

// --- KYC (Phase 3) ---
export async function aadhaarSendOtp(data: {
  session_token: string;
  application_id: number;
  aadhaar: string;
}) {
  const res = await fetch(`${API_BASE}/api/kyc/aadhaar/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed");
  return res.json() as Promise<{ message: string; dev_otp?: string }>;
}

export async function aadhaarVerify(data: {
  session_token: string;
  application_id: number;
  otp: string;
}) {
  const res = await fetch(`${API_BASE}/api/kyc/aadhaar/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Invalid OTP");
  return res.json();
}

export async function bankVerify(data: {
  session_token: string;
  application_id: number;
  account_number: string;
  ifsc: string;
  address: string;
}) {
  const res = await fetch(`${API_BASE}/api/kyc/bank/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Bank verification failed");
  return res.json();
}

export async function esignComplete(data: {
  session_token: string;
  application_id: number;
  agreed: boolean;
  page_url?: string;
}) {
  const res = await fetch(`${API_BASE}/api/kyc/esign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "eSign failed");
  return res.json();
}

export async function submitApplication(data: {
  session_token: string;
  application_id: number;
}) {
  const res = await fetch(`${API_BASE}/api/kyc/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Submit failed");
  return res.json();
}

// --- Dashboard (Phase 4/5) ---
export type LoanApplication = {
  id: number;
  application_ref: string;
  lender_name: string;
  loan_amount: number;
  interest_rate: number;
  tenure_months: number;
  emi: number;
  status: string;
  aadhaar_verified: boolean;
  bank_verified: boolean;
  esign_completed: boolean;
  disbursal_amount: number | null;
  created_at: string;
};

export async function getDashboardProfile(token: string) {
  const res = await fetch(`${API_BASE}/api/dashboard/profile`, {
    headers: sessionHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
}

export async function getApplications(token: string) {
  const res = await fetch(`${API_BASE}/api/dashboard/applications`, {
    headers: sessionHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to load applications");
  return res.json() as Promise<LoanApplication[]>;
}

export async function getApplicationDetail(token: string, appId: number) {
  const res = await fetch(`${API_BASE}/api/dashboard/applications/${appId}`, {
    headers: sessionHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to load application");
  return res.json();
}

export async function trackApplication(ref: string, mobile: string) {
  const res = await fetch(`${API_BASE}/api/dashboard/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ application_ref: ref, mobile }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Not found");
  return res.json();
}

export async function getEmiSchedule(token: string, appId: number) {
  const res = await fetch(`${API_BASE}/api/dashboard/applications/${appId}/emi-schedule`, {
    headers: sessionHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to load EMI schedule");
  return res.json();
}

// --- AI Chat ---
export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function sendChatMessage(data: {
  message: string;
  session_id?: string;
  page_url?: string;
  history?: ChatMessage[];
}) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Chat failed");
  return res.json() as Promise<{
    reply: string;
    session_id: string;
    suggestions: string[];
    assistant_name: string;
  }>;
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
  total_applications: number;
  disbursed_count: number;
  total_disbursed: number;
  total_commission: number;
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

export type AdminApplication = {
  id: number;
  application_ref: string;
  lead_id: number;
  lender_name: string;
  loan_amount: number;
  interest_rate: number;
  emi: number;
  status: string;
  commission_amount: number | null;
  created_at: string;
};

export async function getAdminApplications(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/applications`, { headers: adminHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch applications");
  return res.json() as Promise<AdminApplication[]>;
}

export async function updateApplicationStatus(
  token: string,
  appId: number,
  data: { status: string; message?: string }
) {
  const res = await fetch(`${API_BASE}/api/admin/applications/${appId}`, {
    method: "PATCH",
    headers: adminHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
}

export type ConsentRecord = {
  id: number;
  lead_id: number | null;
  application_id: number | null;
  mobile: string | null;
  consent_type: string;
  consent_version: string;
  accepted: boolean;
  page_url: string | null;
  ip_address: string | null;
  metadata_json: string | null;
  created_at: string;
};

export async function getAdminConsents(token: string, params?: { lead_id?: number; mobile?: string }) {
  const qs = new URLSearchParams();
  if (params?.lead_id) qs.set("lead_id", String(params.lead_id));
  if (params?.mobile) qs.set("mobile", params.mobile);
  const suffix = qs.toString() ? `?${qs}` : "";
  const res = await fetch(`${API_BASE}/api/admin/consents${suffix}`, {
    headers: adminHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch consents");
  return res.json() as Promise<ConsentRecord[]>;
}

// --- Required fields (partner-driven apply flow) ---
export type RequiredField = { key: string; label: string; step: string; type: string };

export async function getRequiredFields() {
  const res = await fetch(`${API_BASE}/api/leads/required-fields`);
  if (!res.ok) throw new Error("Failed to load required fields");
  return res.json() as Promise<{ fields: RequiredField[]; partners_count: number }>;
}

// --- Lending partners (admin) ---
export type PartnerFieldCatalogItem = RequiredField;

export type AdminPartner = {
  id: number;
  partner_id: string;
  lender_name: string;
  lender_logo: string;
  api_url: string | null;
  api_key_masked: string;
  has_api_key: boolean;
  webhook_url: string | null;
  enabled: boolean;
  sort_order: number;
  required_fields: string[];
  mock_interest_rate: number;
  mock_tenure_months: number;
  mock_processing_fee: string;
  mock_features: string[];
  mock_amount_offset: number;
  page_slug: string | null;
  page_title: string | null;
  page_description: string | null;
  offers_endpoint_path: string | null;
  auth_header_name: string | null;
  auth_type: string | null;
  timeout_seconds: number;
  created_at: string;
  updated_at: string;
};

export type PublicPartner = {
  partner_id: string;
  lender_name: string;
  lender_logo: string;
  page_slug: string;
  page_title: string | null;
  page_description: string | null;
  mock_interest_rate: number;
  mock_tenure_months: number;
  mock_processing_fee: string;
  mock_features: string[];
  required_fields: { key: string; label: string; step: string }[];
};

export async function getPartnerFieldCatalog(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/partners/field-catalog`, {
    headers: adminHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to load field catalog");
  return res.json() as Promise<PartnerFieldCatalogItem[]>;
}

export async function getAdminPartners(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/partners`, { headers: adminHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch partners");
  return res.json() as Promise<AdminPartner[]>;
}

export async function createAdminPartner(token: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/admin/partners`, {
    method: "POST",
    headers: adminHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed to create partner");
  return res.json() as Promise<AdminPartner>;
}

export async function updateAdminPartner(token: string, id: number, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/admin/partners/${id}`, {
    method: "PATCH",
    headers: adminHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed to update partner");
  return res.json() as Promise<AdminPartner>;
}

export async function deleteAdminPartner(token: string, id: number) {
  const res = await fetch(`${API_BASE}/api/admin/partners/${id}`, {
    method: "DELETE",
    headers: adminHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete partner");
  return res.json();
}

export async function getPublicPartners() {
  const res = await fetch(`${API_BASE}/api/partners`);
  if (!res.ok) throw new Error("Failed to load partners");
  return res.json() as Promise<PublicPartner[]>;
}

export async function getPublicPartner(slug: string) {
  const res = await fetch(`${API_BASE}/api/partners/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error("Partner not found");
  return res.json() as Promise<PublicPartner>;
}

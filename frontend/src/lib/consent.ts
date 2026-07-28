/** Legal consent document versions — must match backend CONSENT_VERSIONS */
export const CONSENT_VERSIONS = {
  privacy_policy: "2026.1",
  terms_of_service: "2026.1",
  dpdp_data_processing: "2026.1",
  credit_bureau_check: "2026.1",
  marketing_communications: "2026.1",
  sms_otp: "2026.1",
  lender_data_sharing: "2026.1",
  loan_agreement_esign: "2026.1",
  cookie_essential: "2026.1",
  cookie_analytics: "2026.1",
} as const;

export const COOKIE_CONSENT_KEY = "neer_cookie_consent_v1";

export type CookiePreferences = {
  essential: boolean;
  analytics: boolean;
  savedAt: string;
};

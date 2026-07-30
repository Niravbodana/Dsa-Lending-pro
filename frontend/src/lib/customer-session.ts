import { getAuthMe, getJourney, logoutCustomer, type JourneyState } from "@/lib/api";

const TOKEN_KEY = "session_token";
const DRAFT_MOBILE_KEY = "neercred_draft_mobile";

export function getStoredSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredSessionToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredSessionToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getDraftMobile(): string | null {
  if (typeof window === "undefined") return null;
  const m = sessionStorage.getItem(DRAFT_MOBILE_KEY);
  return m && /^\d{10}$/.test(m) ? m : null;
}

export function setDraftMobile(mobile: string) {
  sessionStorage.setItem(DRAFT_MOBILE_KEY, mobile);
}

export function clearDraftMobile() {
  sessionStorage.removeItem(DRAFT_MOBILE_KEY);
}

/** Route customer to the right page based on saved journey */
export function journeyRedirectPath(journey: JourneyState): string {
  if (!journey.authenticated) return "/login";

  if (journey.next_step === "kyc" && journey.application?.id) {
    return `/application/${journey.application.id}/kyc`;
  }
  if (journey.next_step === "dashboard") return "/dashboard";
  if (journey.apply_step === "offers" || journey.next_step === "offers") return "/apply";
  if (journey.apply_step === "details" || journey.next_step === "details") return "/apply";
  if (journey.next_step === "otp") return "/apply";
  return "/apply";
}

export async function loadCustomerJourney(token?: string): Promise<JourneyState | null> {
  const t = token ?? getStoredSessionToken();
  if (!t) return null;
  try {
    const me = await getAuthMe(t);
    return {
      ...me.journey,
      authenticated: true,
      mobile: me.mobile,
      lead: me.journey.lead
        ? { ...me.journey.lead, mobile: me.journey.lead.mobile || me.mobile }
        : { mobile: me.mobile },
    };
  } catch {
    try {
      const journey = await getJourney(t);
      if (journey.authenticated) return journey;
    } catch {
      /* ignore */
    }
    clearStoredSessionToken();
    return null;
  }
}

export async function customerLogout(): Promise<void> {
  const token = getStoredSessionToken();
  if (token) {
    try {
      await logoutCustomer(token);
    } catch {
      /* clear locally even if API fails */
    }
  }
  clearStoredSessionToken();
  clearDraftMobile();
}

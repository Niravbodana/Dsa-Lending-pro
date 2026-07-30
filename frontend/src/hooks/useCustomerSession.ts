"use client";

import { useCallback, useEffect, useState } from "react";
import {
  customerLogout,
  getStoredSessionToken,
  loadCustomerJourney,
} from "@/lib/customer-session";
import type { JourneyState } from "@/lib/api";

export function useCustomerSession() {
  const [loading, setLoading] = useState(true);
  const [journey, setJourney] = useState<JourneyState | null>(null);

  const refresh = useCallback(async () => {
    const token = getStoredSessionToken();
    if (!token) {
      setJourney(null);
      setLoading(false);
      return null;
    }
    const data = await loadCustomerJourney(token);
    setJourney(data);
    setLoading(false);
    return data;
  }, []);

  useEffect(() => {
    void refresh();
    const onStorage = () => void refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("neercred:session", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("neercred:session", onStorage);
    };
  }, [refresh]);

  const logout = useCallback(async () => {
    await customerLogout();
    setJourney(null);
    window.dispatchEvent(new Event("neercred:session"));
  }, []);

  return {
    loading,
    isAuthenticated: Boolean(journey?.authenticated),
    mobile: journey?.lead?.mobile ?? null,
    journey,
    refresh,
    logout,
  };
}

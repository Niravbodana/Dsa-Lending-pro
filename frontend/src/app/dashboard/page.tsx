"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import {
  getApplications,
  getApplicationDetail,
  getDashboardProfile,
  getEmiSchedule,
  LoanApplication,
  sendOtp,
  verifyOtp,
} from "@/lib/api";

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    full_name: string | null;
    total_applications: number;
    active_applications: number;
    disbursed_amount: number;
  } | null>(null);
  const [apps, setApps] = useState<LoanApplication[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [detail, setDetail] = useState<{
    application: LoanApplication;
    timeline: { status: string; message: string | null; created_at: string }[];
  } | null>(null);
  const [emi, setEmi] = useState<{ month: number; emi: number; balance: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("session_token");
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;
    loadDashboard();
  }, [token]);

  async function loadDashboard() {
    if (!token) return;
    try {
      const [p, a] = await Promise.all([getDashboardProfile(token), getApplications(token)]);
      setProfile(p);
      setApps(a);
    } catch {
      localStorage.removeItem("session_token");
      setToken(null);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await sendOtp(mobile);
      setDevOtp("sent");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyOtp(mobile, otp);
      localStorage.setItem("session_token", res.session_token);
      setToken(res.session_token);
    } finally {
      setLoading(false);
    }
  }

  async function viewApp(id: number) {
    if (!token) return;
    setSelected(id);
    const d = await getApplicationDetail(token, id);
    setDetail(d);
    const schedule = await getEmiSchedule(token, id);
    setEmi(schedule);
  }

  const statusColors: Record<string, string> = {
    submitted: "bg-blue-100 text-blue-700",
    under_review: "bg-yellow-100 text-yellow-700",
    approved: "bg-purple-100 text-purple-700",
    disbursed: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    kyc_pending: "bg-orange-100 text-orange-700",
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Header />
        <div className="mx-auto max-w-sm px-4 py-20">
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h1 className="text-2xl font-black text-center">My Dashboard</h1>
            <p className="mt-2 text-center text-sm text-slate-500">Login with mobile OTP</p>
            {devOtp !== "sent" ? (
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <input
                  placeholder="Mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full rounded-xl border px-4 py-3"
                  required
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-teal-600 py-3 font-bold text-white"
                >
                  Send OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="mt-6 space-y-4">
                <input
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full rounded-xl border px-4 py-3 text-center text-xl tracking-widest"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-teal-600 py-3 font-bold text-white"
                >
                  Login →
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">
              Hello, {profile?.full_name || "User"} 👋
            </h1>
            <p className="text-slate-500">Your loan applications</p>
          </div>
          <Link href="/apply" className="rounded-xl bg-teal-600 px-5 py-2 font-bold text-white">
            New Application +
          </Link>
        </div>

        {profile && (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { label: "Total Applications", value: profile.total_applications },
              { label: "Active", value: profile.active_applications },
              {
                label: "Disbursed",
                value: `₹${profile.disbursed_amount.toLocaleString("en-IN")}`,
              },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl bg-white p-6 shadow">
                <p className="text-sm text-slate-500">{c.label}</p>
                <p className="mt-1 text-3xl font-black text-teal-700">{c.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="font-bold text-slate-900">Applications</h2>
            {apps.length === 0 ? (
              <p className="mt-4 text-slate-400">No applications yet</p>
            ) : (
              <div className="mt-4 space-y-3">
                {apps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => viewApp(app.id)}
                    className={`w-full rounded-xl border p-4 text-left transition hover:border-teal-300 ${
                      selected === app.id ? "border-teal-500 bg-teal-50" : "border-slate-100"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="font-mono text-sm text-slate-400">{app.application_ref}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[app.status] || "bg-slate-100"}`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="mt-1 font-bold">{app.lender_name}</p>
                    <p className="text-sm text-teal-600">
                      ₹{app.loan_amount.toLocaleString("en-IN")} @ {app.interest_rate}%
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            {detail ? (
              <>
                <h2 className="font-bold">Status Timeline</h2>
                <div className="mt-4 space-y-4">
                  {detail.timeline.map((t, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm">
                        ✓
                      </div>
                      <div>
                        <p className="font-semibold capitalize">{t.status.replace(/_/g, " ")}</p>
                        <p className="text-sm text-slate-500">{t.message}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(t.created_at).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {emi.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-bold">EMI Schedule (first 6 months)</h3>
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-slate-500">
                            <th className="py-2">Month</th>
                            <th>EMI</th>
                            <th>Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {emi.slice(0, 6).map((row) => (
                            <tr key={row.month} className="border-t">
                              <td className="py-2">{row.month}</td>
                              <td>₹{row.emi.toLocaleString("en-IN")}</td>
                              <td>₹{row.balance.toLocaleString("en-IN")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-400">Select an application to view details</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

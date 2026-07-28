"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  adminLogin,
  AdminStats,
  Bug,
  deleteBug,
  getAdminApplications,
  getAdminBugs,
  getAdminConsents,
  getAdminLeads,
  getAdminStats,
  AdminApplication,
  ConsentRecord,
  updateApplicationStatus,
  Lead,
  updateBug,
} from "@/lib/api";
import { SiteBuilderChat } from "@/components/SiteBuilderChat";

type Tab = "dashboard" | "leads" | "applications" | "consents" | "sitebuilder" | "bugs";

const statusColors: Record<string, string> = {
  open: "bg-red-100 text-red-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  fixed: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-600",
  otp_verified: "bg-blue-100 text-blue-700",
  details_submitted: "bg-purple-100 text-purple-700",
  offers_fetched: "bg-amber-100 text-amber-700",
  offer_selected: "bg-green-100 text-green-700",
};

const severityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fixNotes, setFixNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem("admin_token");
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;
    void (async () => {
      setLoading(true);
      try {
        if (tab === "dashboard") setStats(await getAdminStats(token));
        if (tab === "leads") setLeads(await getAdminLeads(token));
        if (tab === "applications") setApplications(await getAdminApplications(token));
        if (tab === "consents") setConsents(await getAdminConsents(token));
        if (tab === "bugs") setBugs(await getAdminBugs(token));
      } catch {
        localStorage.removeItem("admin_token");
        setToken(null);
        setError("Session expired. Please login again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, tab]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    try {
      if (tab === "dashboard") setStats(await getAdminStats(token));
      if (tab === "leads") setLeads(await getAdminLeads(token));
      if (tab === "applications") setApplications(await getAdminApplications(token));
      if (tab === "consents") setConsents(await getAdminConsents(token));
      if (tab === "bugs") setBugs(await getAdminBugs(token));
    } catch {
      localStorage.removeItem("admin_token");
      setToken(null);
      setError("Session expired. Please login again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await adminLogin(password);
      localStorage.setItem("admin_token", res.token);
      setToken(res.token);
    } catch {
      setError("Galat password! Default dev password: admin123");
    }
  }

  async function handleFixBug(bugId: number, status: string) {
    if (!token) return;
    await updateBug(token, bugId, {
      status,
      fix_notes: fixNotes[bugId] || undefined,
    });
    setBugs(await getAdminBugs(token));
    setStats(await getAdminStats(token));
  }

  async function handleDeleteBug(bugId: number) {
    if (!token) return;
    await deleteBug(token, bugId);
    setBugs(await getAdminBugs(token));
  }

  function logout() {
    localStorage.removeItem("admin_token");
    setToken(null);
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
          <div className="text-center">
            <p className="text-4xl">🔐</p>
            <h1 className="mt-4 text-2xl font-black text-slate-900">Admin Panel</h1>
            <p className="mt-2 text-sm text-slate-500">Neer Loan Solutions — Internal Access</p>
          </div>
          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
            required
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-teal-600 py-3 font-bold text-white hover:bg-teal-700"
          >
            Login →
          </button>
          <Link href="/" className="mt-4 block text-center text-sm text-slate-400 hover:text-teal-600">
            ← Back to website
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white">
        <div className="border-b border-slate-700 p-6">
          <p className="text-lg font-black">
            Neer <span className="text-teal-400">Admin</span>
          </p>
          <p className="text-xs text-slate-400">Bug Fixer & Lead Manager</p>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {(
            [
              { id: "dashboard" as Tab, label: "📊 Dashboard" },
              { id: "leads" as Tab, label: "👥 Leads" },
              { id: "applications" as Tab, label: "Applications" },
              { id: "consents" as Tab, label: "Legal Consents" },
              { id: "sitebuilder" as Tab, label: "Site Builder AI" },
              { id: "bugs" as Tab, label: "Bug Fixer" },
            ]
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                tab === item.id ? "bg-teal-600 text-white" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-slate-700 p-4">
          <Link href="/" className="block text-sm text-slate-400 hover:text-white">
            ← Website
          </Link>
          <button onClick={logout} className="mt-2 text-sm text-red-400 hover:text-red-300">
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64 p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-900 capitalize">
            {tab === "bugs"
              ? "Bug Fixer"
              : tab === "consents"
                ? "Legal Consents"
                : tab === "sitebuilder"
                  ? "Site Builder AI"
                  : tab}
          </h1>
          <button
            onClick={loadData}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow hover:bg-slate-50"
          >
            ↻ Refresh
          </button>
        </div>

        {loading && <p className="text-slate-500">Loading...</p>}

        {/* Dashboard */}
        {tab === "dashboard" && stats && !loading && (
          <div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total Leads", value: stats.total_leads, color: "from-teal-500 to-cyan-500" },
                { label: "Offers Selected", value: stats.offer_selected, color: "from-green-500 to-emerald-500" },
                { label: "Conversion Rate", value: `${stats.conversion_rate}%`, color: "from-amber-500 to-orange-500" },
                { label: "Total Commission", value: `₹${(stats.total_commission || 0).toLocaleString("en-IN")}`, color: "from-purple-500 to-violet-500" },
              ].map((card) => (
                <div
                  key={card.label}
                  className={`rounded-2xl bg-gradient-to-br ${card.color} p-6 text-white shadow-lg`}
                >
                  <p className="text-sm font-medium opacity-80">{card.label}</p>
                  <p className="mt-2 text-4xl font-black">{card.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow">
                <h3 className="font-bold text-slate-900">Lead Funnel</h3>
                <div className="mt-4 space-y-3">
                  {[
                    { label: "OTP Verified", count: stats.otp_verified },
                    { label: "Details Submitted", count: stats.details_submitted },
                    { label: "Offers Fetched", count: stats.offers_fetched },
                    { label: "Offer Selected", count: stats.offer_selected },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{step.label}</span>
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-bold text-teal-700">
                        {step.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow">
                <h3 className="font-bold text-slate-900">Bug Status</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Total Bugs</span>
                    <span className="font-bold">{stats.total_bugs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Open / In Progress</span>
                    <span className="font-bold text-red-600">{stats.open_bugs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Fixed</span>
                    <span className="font-bold text-green-600">{stats.fixed_bugs}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leads */}
        {tab === "leads" && !loading && (
          <div className="overflow-hidden rounded-2xl bg-white shadow">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Mobile</th>
                  <th className="px-6 py-4">City</th>
                  <th className="px-6 py-4">Income</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Lender</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No leads yet. Share the website!
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-slate-400">#{lead.id}</td>
                      <td className="px-6 py-4 font-semibold">{lead.full_name || "—"}</td>
                      <td className="px-6 py-4">{lead.mobile}</td>
                      <td className="px-6 py-4">{lead.city || "—"}</td>
                      <td className="px-6 py-4">
                        {lead.monthly_income
                          ? `₹${lead.monthly_income.toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${statusColors[lead.status] || "bg-slate-100"}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-teal-600">{lead.selected_lender || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Applications */}
        {tab === "applications" && !loading && (
          <div className="overflow-hidden rounded-2xl bg-white shadow">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">Ref</th>
                  <th className="px-6 py-4">Lender</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">EMI</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Commission</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No applications yet
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-xs">{app.application_ref}</td>
                      <td className="px-6 py-4 font-semibold">{app.lender_name}</td>
                      <td className="px-6 py-4">₹{app.loan_amount.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4">₹{app.emi.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusColors[app.status] || "bg-slate-100"}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-green-600">
                        {app.commission_amount ? `₹${app.commission_amount}` : "—"}
                      </td>
                      <td className="px-6 py-4">
                        {app.status === "submitted" && token && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => updateApplicationStatus(token, app.id, { status: "approved", message: "Approved by admin" }).then(loadData)}
                              className="rounded bg-green-100 px-2 py-1 text-xs text-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(token, app.id, { status: "disbursed", message: "Loan disbursed" }).then(loadData)}
                              className="rounded bg-teal-100 px-2 py-1 text-xs text-teal-700"
                            >
                              Disburse
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Legal consents audit trail */}
        {tab === "consents" && !loading && (
          <div className="overflow-hidden rounded-2xl bg-white shadow">
            <p className="border-b border-slate-100 px-6 py-4 text-sm text-slate-500">
              DPDP / RBI consent records — timestamp, version, IP, and page URL for audit.
            </p>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Mobile</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Version</th>
                  <th className="px-6 py-4">Lead</th>
                  <th className="px-6 py-4">Page</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No consent records yet
                    </td>
                  </tr>
                ) : (
                  consents.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(row.created_at).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 font-mono">{row.mobile || "—"}</td>
                      <td className="px-6 py-4 font-medium">{row.consent_type}</td>
                      <td className="px-6 py-4">{row.consent_version}</td>
                      <td className="px-6 py-4">{row.lead_id ?? "—"}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{row.page_url || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "sitebuilder" && token && (
          <SiteBuilderChat token={token} />
        )}

        {/* Bugs */}
        {tab === "bugs" && !loading && (
          <div className="space-y-4">
            {bugs.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center shadow">
                <p className="text-4xl">🎉</p>
                <p className="mt-4 text-lg font-bold text-slate-900">No bugs reported!</p>
                <p className="text-slate-500">Users can report via the 🐛 button on the website.</p>
              </div>
            ) : (
              bugs.map((bug) => (
                <div key={bug.id} className="rounded-2xl bg-white p-6 shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">#{bug.id}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${severityColors[bug.severity]}`}
                        >
                          {bug.severity}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[bug.status]}`}
                        >
                          {bug.status}
                        </span>
                      </div>
                      <h3 className="mt-2 text-lg font-bold text-slate-900">{bug.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{bug.description}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        By: {bug.reported_by || "Anonymous"} •{" "}
                        {new Date(bug.created_at).toLocaleString("en-IN")}
                        {bug.page_url && (
                          <>
                            {" "}
                            •{" "}
                            <a href={bug.page_url} className="text-teal-600 hover:underline">
                              Page link
                            </a>
                          </>
                        )}
                      </p>
                      {bug.fix_notes && (
                        <p className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                          Fix: {bug.fix_notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {bug.status !== "fixed" && bug.status !== "closed" && (
                    <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                      <input
                        placeholder="Fix notes (what you did)..."
                        value={fixNotes[bug.id] || ""}
                        onChange={(e) =>
                          setFixNotes({ ...fixNotes, [bug.id]: e.target.value })
                        }
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-teal-500"
                      />
                      <button
                        onClick={() => handleFixBug(bug.id, "in_progress")}
                        className="rounded-xl bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-200"
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleFixBug(bug.id, "fixed")}
                        className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
                      >
                        ✅ Mark Fixed
                      </button>
                      <button
                        onClick={() => handleDeleteBug(bug.id)}
                        className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

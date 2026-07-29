"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AdminPartner,
  PartnerFieldCatalogItem,
  createAdminPartner,
  deleteAdminPartner,
  getAdminPartners,
  getPartnerFieldCatalog,
  updateAdminPartner,
} from "@/lib/api";

const emptyForm = {
  partner_id: "",
  lender_name: "",
  lender_logo: "",
  api_url: "",
  api_key: "",
  webhook_url: "",
  enabled: true,
  sort_order: 0,
  required_fields: ["mobile", "full_name", "pan", "date_of_birth", "monthly_income", "employment_type", "city"],
  mock_interest_rate: 12.99,
  mock_tenure_months: 36,
  mock_processing_fee: "2%",
  mock_features: "Digital KYC, Fast approval",
  mock_amount_offset: 0,
  page_slug: "",
  page_title: "",
  page_description: "",
  offers_endpoint_path: "/offers",
  auth_header_name: "Authorization",
  auth_type: "bearer" as "bearer" | "api_key_header",
  timeout_seconds: 8,
};

type Props = { token: string };

export function PartnerAdminPanel({ token }: Props) {
  const [partners, setPartners] = useState<AdminPartner[]>([]);
  const [catalog, setCatalog] = useState<PartnerFieldCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [rows, fields] = await Promise.all([
        getAdminPartners(token),
        getPartnerFieldCatalog(token),
      ]);
      setPartners(rows);
      setCatalog(fields);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load partners");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(partner: AdminPartner) {
    setEditingId(partner.id);
    setForm({
      partner_id: partner.partner_id,
      lender_name: partner.lender_name,
      lender_logo: partner.lender_logo,
      api_url: partner.api_url || "",
      api_key: "",
      webhook_url: partner.webhook_url || "",
      enabled: partner.enabled,
      sort_order: partner.sort_order,
      required_fields: partner.required_fields,
      mock_interest_rate: partner.mock_interest_rate,
      mock_tenure_months: partner.mock_tenure_months,
      mock_processing_fee: partner.mock_processing_fee,
      mock_features: partner.mock_features.join(", "),
      mock_amount_offset: partner.mock_amount_offset,
      page_slug: partner.page_slug || "",
      page_title: partner.page_title || "",
      page_description: partner.page_description || "",
      offers_endpoint_path: partner.offers_endpoint_path || "/offers",
      auth_header_name: partner.auth_header_name || "Authorization",
      auth_type: (partner.auth_type as "bearer" | "api_key_header") || "bearer",
      timeout_seconds: partner.timeout_seconds,
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      mock_features: form.mock_features.split(",").map((s) => s.trim()).filter(Boolean),
      api_url: form.api_url || null,
      api_key: form.api_key || undefined,
      webhook_url: form.webhook_url || null,
      page_slug: form.page_slug || form.partner_id,
      page_title: form.page_title || `${form.lender_name} Personal Loans`,
      page_description: form.page_description || null,
    };

    try {
      if (editingId) {
        const { partner_id: _pid, ...update } = payload;
        await updateAdminPartner(token, editingId, update);
      } else {
        await createAdminPartner(token, payload);
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this lending partner?")) return;
    await deleteAdminPartner(token, id);
    await load();
  }

  function toggleField(key: string) {
    setForm((prev) => ({
      ...prev,
      required_fields: prev.required_fields.includes(key)
        ? prev.required_fields.filter((f) => f !== key)
        : [...prev.required_fields, key],
    }));
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-6">
        <h2 className="text-lg font-bold text-slate-900">Lending Partner Hub</h2>
        <p className="mt-1 text-sm text-slate-600">
          Mobile, PAN, DOB ke baad partner APIs ko yahan se manage karein — naya lender add karein,
          required fields choose karein, API URL attach karein, aur partner page auto ban jayegi.
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="mt-4 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700"
        >
          + Add Lending Partner
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-slate-500">Loading partners...</p>}

      {!loading && (
        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Lender</th>
                <th className="px-4 py-3">API</th>
                <th className="px-4 py-3">Required fields</th>
                <th className="px-4 py-3">Page</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    No partners yet — seed on first server start or add manually.
                  </td>
                </tr>
              ) : (
                partners.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{p.lender_name}</p>
                      <p className="text-xs text-slate-400">{p.partner_id}</p>
                    </td>
                    <td className="px-4 py-3">
                      {p.api_url ? (
                        <span className="text-xs text-green-700">
                          Live API
                          <br />
                          <span className="text-slate-400">{p.api_key_masked}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-amber-700">Mock offers</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {p.required_fields.slice(0, 4).join(", ")}
                      {p.required_fields.length > 4 ? ` +${p.required_fields.length - 4}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/partners/${p.page_slug || p.partner_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-600 hover:underline"
                      >
                        /partners/{p.page_slug || p.partner_id}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          p.enabled ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {p.enabled ? "Active" : "Off"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSave} className="rounded-2xl bg-white p-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-900">
            {editingId ? "Edit Partner" : "New Lending Partner"}
          </h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-500">Partner ID (slug)</label>
              <input
                className={inputClass}
                value={form.partner_id}
                onChange={(e) => setForm({ ...form, partner_id: e.target.value.toLowerCase() })}
                disabled={!!editingId}
                pattern="[a-z0-9_]+"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Lender name</label>
              <input
                className={inputClass}
                value={form.lender_name}
                onChange={(e) => setForm({ ...form, lender_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Logo badge (HDFC, ICICI…)</label>
              <input
                className={inputClass}
                value={form.lender_logo}
                onChange={(e) => setForm({ ...form, lender_logo: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Sort order</label>
              <input
                type="number"
                className={inputClass}
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500">Offers API base URL</label>
              <input
                className={inputClass}
                placeholder="https://api.lender.com/v1"
                value={form.api_url}
                onChange={(e) => setForm({ ...form, api_url: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">API key</label>
              <input
                type="password"
                className={inputClass}
                placeholder={editingId ? "Leave blank to keep existing" : "Bearer / API key"}
                value={form.api_key}
                onChange={(e) => setForm({ ...form, api_key: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Offers endpoint path</label>
              <input
                className={inputClass}
                value={form.offers_endpoint_path}
                onChange={(e) => setForm({ ...form, offers_endpoint_path: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Auth type</label>
              <select
                className={inputClass}
                value={form.auth_type}
                onChange={(e) =>
                  setForm({ ...form, auth_type: e.target.value as "bearer" | "api_key_header" })
                }
              >
                <option value="bearer">Bearer token</option>
                <option value="api_key_header">Custom header</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Auth header name</label>
              <input
                className={inputClass}
                value={form.auth_header_name}
                onChange={(e) => setForm({ ...form, auth_header_name: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500">Webhook URL (status updates)</label>
              <input
                className={inputClass}
                value={form.webhook_url}
                onChange={(e) => setForm({ ...form, webhook_url: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-bold text-slate-800">Required fields for partner API</p>
            <p className="text-xs text-slate-500">Jo details partner ko chahiye — apply flow mein collect hongi</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {catalog.map((field) => (
                <button
                  key={field.key}
                  type="button"
                  onClick={() => toggleField(field.key)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    form.required_fields.includes(field.key)
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {field.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-slate-500">Mock rate % (fallback)</label>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={form.mock_interest_rate}
                onChange={(e) => setForm({ ...form, mock_interest_rate: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Mock tenure (months)</label>
              <input
                type="number"
                className={inputClass}
                value={form.mock_tenure_months}
                onChange={(e) => setForm({ ...form, mock_tenure_months: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Processing fee label</label>
              <input
                className={inputClass}
                value={form.mock_processing_fee}
                onChange={(e) => setForm({ ...form, mock_processing_fee: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-500">Partner page slug</label>
              <input
                className={inputClass}
                value={form.page_slug}
                onChange={(e) => setForm({ ...form, page_slug: e.target.value })}
                placeholder="hdfc"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Page title</label>
              <input
                className={inputClass}
                value={form.page_title}
                onChange={(e) => setForm({ ...form, page_title: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500">Page description</label>
              <textarea
                className={inputClass}
                rows={2}
                value={form.page_description}
                onChange={(e) => setForm({ ...form, page_description: e.target.value })}
              />
            </div>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            />
            Partner active (show in offers)
          </label>

          <div className="mt-6 flex gap-3">
            <button type="submit" className="rounded-xl bg-teal-600 px-6 py-2 font-bold text-white">
              Save Partner
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border px-6 py-2 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

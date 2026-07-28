"use client";

import { useState } from "react";
import { reportBug } from "@/lib/api";

export function BugReportWidget() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await reportBug({
        title,
        description,
        reported_by: name || "Anonymous",
        page_url: typeof window !== "undefined" ? window.location.href : "",
        severity: "medium",
      });
      setDone(true);
      setTitle("");
      setDescription("");
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full bg-slate-800 px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-slate-700"
        title="Report a bug"
      >
        🐛 Bug Report
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            {done ? (
              <div className="text-center">
                <p className="text-4xl">✅</p>
                <p className="mt-4 text-lg font-bold text-slate-900">Report Submitted!</p>
                <p className="mt-2 text-sm text-slate-500">
                  Our team will fix it soon. Thank you!
                </p>
                <button
                  onClick={() => { setOpen(false); setDone(false); }}
                  className="mt-6 rounded-xl bg-teal-600 px-6 py-2 font-bold text-white"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-900">🐛 Report a Bug</h3>
                <p className="mt-1 text-sm text-slate-500">Found a problem? We&apos;ll fix it!</p>
                {error && (
                  <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
                )}
                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                  <input
                    placeholder="Your name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-teal-500"
                  />
                  <input
                    placeholder="Bug title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-teal-500"
                    required
                  />
                  <textarea
                    placeholder="Describe the problem..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-teal-500"
                    required
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="flex-1 rounded-xl border border-slate-200 py-2.5 font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 rounded-xl bg-teal-600 py-2.5 font-bold text-white disabled:opacity-50"
                    >
                      {loading ? "Sending..." : "Submit"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

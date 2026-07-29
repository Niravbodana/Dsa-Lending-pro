"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  cmsAdminChat,
  cmsAdminDiscard,
  cmsAdminPublish,
  cmsAdminReset,
} from "@/lib/cms";

type Message = {
  role: "user" | "assistant";
  text: string;
  changes?: string[];
  images?: { url: string; label: string }[];
};

const SESSION_ID = "admin-builder";

export function AdvancedSiteBuilder({ token }: { token: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "🧠 **Site Builder Brain** ready!\n\nMain aapke liye website edit kar sakta hoon — photo, theme, headline, background. Pehle **preview** dikhaunga, pasand aaye to **Publish** karo.\n\nTry: `search photo wedding` | `change theme glass blue` | `set roi to 9.99%`",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "search photo wedding couple",
    "change theme to glass blue",
    "change headline to Dream Big. Borrow Smart.",
    "set roi to 9.99%",
  ]);
  const [hasDraft, setHasDraft] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const previewUrl = `/preview?token=${encodeURIComponent(token)}`;

  const refreshPreview = useCallback(() => {
    setPreviewKey((k) => k + 1);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await cmsAdminChat(token, text, SESSION_ID);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: res.reply,
          changes: res.changes,
          images: res.image_options,
        },
      ]);
      setSuggestions(res.suggestions || []);
      setHasDraft(res.has_draft_changes);
      if (res.changes.length > 0 || res.published) refreshPreview();
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "❌ Backend error. Is API running on port 8000?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    if (!confirm("Publish draft to LIVE website?")) return;
    setLoading(true);
    try {
      await cmsAdminPublish(token);
      setHasDraft(false);
      refreshPreview();
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "🚀 **Published!** Live site updated." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDiscard() {
    if (!confirm("Discard all draft changes?")) return;
    setLoading(true);
    try {
      await cmsAdminDiscard(token);
      setHasDraft(false);
      refreshPreview();
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "↩️ Draft discarded." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!confirm("Reset entire website to defaults?")) return;
    setLoading(true);
    try {
      await cmsAdminReset(token);
      setHasDraft(false);
      refreshPreview();
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "✅ Reset to defaults." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl glass-panel px-5 py-4">
        <div>
          <p className="text-lg font-black text-slate-900">🧠 Site Builder Brain</p>
          <p className="text-xs text-slate-500">Preview → Publish workflow · Canva-style edits</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasDraft && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              Unpublished changes
            </span>
          )}
          <button
            type="button"
            onClick={() => void handleDiscard()}
            disabled={loading || !hasDraft}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={() => void handlePublish()}
            disabled={loading}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            Publish to Live
          </button>
          <button
            type="button"
            onClick={() => void handleReset()}
            className="rounded-xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Chat */}
        <div className="flex flex-col overflow-hidden rounded-2xl glass-panel">
          <div className="border-b border-white/60 bg-gradient-to-r from-slate-900 to-teal-900 px-5 py-3 text-white">
            <p className="font-bold">AI Chat — bolo kya change karna hai</p>
            <p className="text-xs text-teal-200">English / Hinglish · photo search · theme · text</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ minHeight: 360, maxHeight: 480 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user" ? "bg-teal-600 text-white" : "bg-white/80 text-slate-800 ring-1 ring-slate-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text.replace(/\*\*(.*?)\*\*/g, "$1")}</p>
                  {msg.changes && msg.changes.length > 0 && (
                    <p className="mt-2 text-xs opacity-70">Draft: {msg.changes.join(", ")}</p>
                  )}
                  {msg.images && msg.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {msg.images.slice(0, 3).map((img, j) => (
                        <button
                          key={img.url}
                          type="button"
                          onClick={() => void send(`use photo ${j + 1}`)}
                          className="overflow-hidden rounded-lg ring-2 ring-transparent hover:ring-teal-500"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt={img.label} className="h-16 w-full object-cover" />
                          <p className="truncate bg-slate-900/80 px-1 py-0.5 text-[9px] text-white">
                            {j + 1}. {img.label}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && <p className="animate-pulse text-sm text-slate-400">Brain soch raha hai...</p>}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="border-t border-white/60 p-3"
          >
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='e.g. "search photo wedding" / "theme glass blue" / paste image URL'
                className="flex-1 rounded-xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm outline-none backdrop-blur focus:border-teal-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-xl bg-teal-600 px-5 py-3 font-bold text-white disabled:opacity-50"
              >
                Preview
              </button>
            </div>
          </form>
        </div>

        {/* Live preview iframe */}
        <div className="flex flex-col overflow-hidden rounded-2xl glass-panel">
          <div className="flex items-center justify-between border-b border-white/60 px-4 py-3">
            <p className="font-bold text-slate-900">👁️ Live Preview</p>
            <button
              type="button"
              onClick={refreshPreview}
              className="text-xs font-semibold text-teal-600 hover:underline"
            >
              Refresh
            </button>
          </div>
          <iframe
            key={previewKey}
            src={previewUrl}
            title="Site preview"
            className="w-full flex-1 border-0 bg-white"
            style={{ minHeight: 520 }}
          />
        </div>
      </div>

      {/* Suggestions + quick tools */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl glass-panel p-5">
          <p className="font-bold text-slate-900">💡 AI Suggestions</p>
          <p className="mt-1 text-xs text-slate-500">Brain ki recommendations — click to preview</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void send(s)}
                className="rounded-full border border-teal-200 bg-teal-50/80 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-100"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl glass-panel p-5">
          <p className="font-bold text-slate-900">🎨 Quick edits (Canva-style)</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {[
              "change theme to glass blue",
              "change photo to wedding",
              "search photo indian couple",
              "change button text to Apply Abhi",
              "show testimonials section",
              "set roi to 9.99%",
            ].map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => void send(cmd)}
                className="rounded-xl border border-slate-200 bg-white/60 px-3 py-2 text-left hover:border-teal-300"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

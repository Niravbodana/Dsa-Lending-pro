"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cmsAdminChat, cmsAdminReset } from "@/lib/cms";

type Message = { role: "user" | "assistant"; text: string; changes?: string[] };

const STARTERS = [
  "change headline to Dream Big. Live Free.",
  "set roi to 9.99%",
  "change photo to wedding",
  "show urgency bar",
  "change button text to Apply Karo Abhi",
  "help",
];

export function SiteBuilderChat({ token }: { token: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Welcome to **Site Builder**! Tell me what to change on the homepage — headline, photos, ROI, buttons, urgency bar — in English or Hinglish. Type **help** for all commands.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await cmsAdminChat(token, text);
      setMessages((m) => [
        ...m,
        { role: "assistant", text: res.reply, changes: res.changes },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Failed to apply change. Is the backend running?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!confirm("Reset entire website to default content?")) return;
    setLoading(true);
    try {
      await cmsAdminReset(token);
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "✅ Website reset to defaults. Refresh homepage to preview." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-900 to-teal-900 px-6 py-4 text-white">
          <div>
            <p className="font-black">AI Site Builder</p>
            <p className="text-xs text-teal-200">Chat to edit homepage live</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              target="_blank"
              className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/25"
            >
              Preview Site ↗
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg bg-red-500/80 px-3 py-1.5 text-xs font-semibold hover:bg-red-500"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6" style={{ minHeight: 420, maxHeight: 520 }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text.replace(/\*\*(.*?)\*\*/g, "$1")}</p>
                {msg.changes && msg.changes.length > 0 && (
                  <p className="mt-2 text-xs opacity-70">Applied: {msg.changes.join(", ")}</p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <p className="text-sm text-slate-400 animate-pulse">Updating website...</p>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="border-t border-slate-100 p-4"
        >
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='e.g. "change roi to 9.5%" or "headline ko Loan Chahiye karo"'
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl bg-teal-600 px-6 py-3 font-bold text-white disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
          <p className="font-bold text-slate-900">Quick commands</p>
          <p className="mt-1 text-xs text-slate-500">Click to try</p>
          <div className="mt-4 flex flex-col gap-2">
            {STARTERS.map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => void send(cmd)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-left text-xs text-slate-700 hover:border-teal-300 hover:bg-teal-50"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 ring-1 ring-amber-200">
          <p className="font-bold text-amber-900">How it works</p>
          <ul className="mt-3 space-y-2 text-xs text-amber-900/80">
            <li>1. Type what you want to change</li>
            <li>2. Site updates instantly in database</li>
            <li>3. Homepage refreshes within 15 sec</li>
            <li>4. Open Preview to see live site</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

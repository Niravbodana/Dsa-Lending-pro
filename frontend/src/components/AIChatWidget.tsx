"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { sendChatMessage, type ChatMessage } from "@/lib/api";
import { BRAND } from "@/lib/brand";

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Hello! I'm **Neer AI** — your personal loan assistant. I can help with loan applications, EMI, KYC, and tracking.",
};

const QUICK_START = [
  "How do I apply for a loan?",
  "How much loan can I get?",
  "Calculate my EMI",
  "What documents are needed?",
];

function renderMarkdownLite(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={j} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={j}>{part}</span>;
    });
    return (
      <span key={i}>
        {parts}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    );
  });
}

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>();
  const [suggestions, setSuggestions] = useState<string[]>(QUICK_START);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError("");
    setInput("");
    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setLoading(true);

    try {
      const res = await sendChatMessage({
        message: trimmed,
        session_id: sessionId,
        page_url: typeof window !== "undefined" ? window.location.href : "",
        history: messages.filter((m) => m !== WELCOME || trimmed),
      });
      setSessionId(res.session_id);
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
      setSuggestions(res.suggestions?.length ? res.suggestions : QUICK_START);
    } catch {
      setError("Connection failed");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, we couldn't connect right now. Call ${BRAND.phone} or apply directly at /apply.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-40 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-2xl text-white shadow-2xl shadow-violet-600/40 transition hover:scale-110"
        title="Neer AI Assistant"
        aria-label="Open Neer AI Assistant"
      >
        ✨
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label="Close chat"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex h-[min(640px,90vh)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-xl">
                ✨
              </div>
              <div className="flex-1">
                <p className="font-bold">Neer AI Assistant</p>
                <p className="text-xs text-violet-100">{BRAND.name} · Loan expert</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-xl hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-br-md bg-teal-600 text-white"
                        : "rounded-bl-md border border-slate-100 bg-white text-slate-700 shadow-sm"
                    }`}
                  >
                    {msg.role === "assistant" ? renderMarkdownLite(msg.content) : msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce [animation-delay:0.1s]">●</span>
                      <span className="animate-bounce [animation-delay:0.2s]">●</span>
                    </span>{" "}
                    Neer AI is thinking...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {suggestions.length > 0 && !loading && (
              <div className="flex gap-2 overflow-x-auto border-t border-slate-100 bg-white px-3 py-2">
                {suggestions.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="shrink-0 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <p className="bg-red-50 px-4 py-2 text-center text-xs text-red-600">{error}</p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2 border-t border-slate-100 bg-white p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                →
              </button>
            </form>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2 text-[10px] text-slate-400">
              <span>AI assistant · Not financial advice</span>
              <Link href="/apply" className="font-semibold text-teal-600 hover:underline">
                Apply Now →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

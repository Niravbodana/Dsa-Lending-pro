"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HomePage } from "@/components/HomePage";
import { CustomBlocksLayer } from "@/components/visual-editor/CustomBlocksLayer";
import { EditorPropertiesPanel } from "@/components/visual-editor/EditorPropertiesPanel";
import { VisualEditorProvider, useVisualEditor } from "@/lib/visual-editor/VisualEditorContext";
import {
  cmsAdminDiscard,
  cmsAdminPublish,
  cmsAdminSaveDraft,
  fetchPreviewConfig,
  mergeConfigFromApi,
  type SiteConfig,
} from "@/lib/cms";

function EditorCanvas({ onBackgroundClick }: { onBackgroundClick: () => void }) {
  const ctx = useVisualEditor();
  const wrapRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto max-w-[1400px] origin-top bg-white shadow-2xl"
      style={{ transform: "scale(0.85)", transformOrigin: "top center" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onBackgroundClick();
      }}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <HomePage previewConfig={ctx!.config} isPreview visualEdit />
        <CustomBlocksLayer />
      </div>
    </div>
  );
}

function EditorToolbar({
  onClose,
  onSave,
  saving,
  hasDraft,
  onPublish,
  onDiscard,
}: {
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  hasDraft: boolean;
  onPublish: () => void;
  onDiscard: () => void;
}) {
  const ctx = useVisualEditor();
  if (!ctx) return null;

  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-700 bg-slate-950 px-4 py-3 text-white">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm hover:bg-slate-800">
          ← Exit
        </button>
        <p className="text-lg font-black">
          Canva <span className="text-violet-400">Editor</span>
        </p>
        {hasDraft && (
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
            Unsaved draft
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 rounded-xl bg-slate-800 p-1">
        {(
          [
            ["select", "Select"],
            ["text", "Add text"],
            ["move", "Move"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              ctx.setTool(id);
              if (id === "text") ctx.addTextBlock();
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
              ctx.tool === id ? "bg-violet-600 text-white" : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save draft"}
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="rounded-lg border border-slate-600 px-3 py-2 text-sm"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={onPublish}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold hover:bg-emerald-500"
        >
          Publish live
        </button>
      </div>
    </header>
  );
}

export function CanvaSiteEditor({ token, onClose }: { token: string; onClose: () => void }) {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void fetchPreviewConfig(token).then(setConfig);
  }, [token]);

  const persist = useCallback(
    async (c: SiteConfig) => {
      setSaving(true);
      try {
        await cmsAdminSaveDraft(token, c);
        setHasDraft(true);
      } finally {
        setSaving(false);
      }
    },
    [token],
  );

  const onConfigChange = useCallback(
    (c: SiteConfig) => {
      setConfig(c);
      setHasDraft(true);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void persist(c), 800);
    },
    [persist],
  );

  async function handlePublish() {
    if (!config || !confirm("Publish to LIVE website?")) return;
    await persist(config);
    await cmsAdminPublish(token);
    setHasDraft(false);
    onClose();
  }

  async function handleDiscard() {
    if (!confirm("Discard all draft changes?")) return;
    const fresh = await cmsAdminDiscard(token);
    setConfig(mergeConfigFromApi(fresh.config));
    setHasDraft(false);
  }

  if (!config) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 text-white">
        <p className="animate-pulse">Loading visual editor…</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950">
      <VisualEditorProvider config={config} onConfigChange={onConfigChange}>
        <EditorInner
          onClose={onClose}
          onSave={() => void persist(config)}
          saving={saving}
          hasDraft={hasDraft}
          onPublish={() => void handlePublish()}
          onDiscard={() => void handleDiscard()}
        />
      </VisualEditorProvider>
    </div>
  );
}

function EditorInner({
  onClose,
  onSave,
  saving,
  hasDraft,
  onPublish,
  onDiscard,
}: {
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  hasDraft: boolean;
  onPublish: () => void;
  onDiscard: () => void;
}) {
  const ctx = useVisualEditor();

  return (
    <>
      <EditorToolbar
        onClose={onClose}
        onSave={onSave}
        saving={saving}
        hasDraft={hasDraft}
        onPublish={onPublish}
        onDiscard={onDiscard}
      />
      <div className="flex min-h-0 flex-1">
        <main
          className="flex-1 overflow-auto bg-slate-800/80 p-6"
          onClick={() => ctx?.select(null)}
        >
          <p className="mb-4 text-center text-xs text-slate-400">
            Click any text to edit · Drag with Move tool · Colors & size in right panel
          </p>
          <EditorCanvas onBackgroundClick={() => ctx?.select(null)} />
        </main>
        <EditorPropertiesPanel />
      </div>
    </>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HomePage } from "@/components/HomePage";
import { CustomBlocksLayer } from "@/components/visual-editor/CustomBlocksLayer";
import { CmsDomEnhancer } from "@/components/cms/CmsDomEnhancer";
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
        <CmsDomEnhancer />
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
  error,
  onAddText,
}: {
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  hasDraft: boolean;
  onPublish: () => void;
  onDiscard: () => void;
  error: string | null;
  onAddText: () => void;
}) {
  const ctx = useVisualEditor();
  if (!ctx) return null;

  return (
    <header className="flex shrink-0 flex-col border-b border-slate-700 bg-slate-950 text-white">
      {error && (
        <div className="bg-red-600/90 px-4 py-2 text-center text-xs font-semibold text-white">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between gap-4 px-4 py-3">
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddText}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold hover:bg-violet-500"
          >
            + Add text
          </button>
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
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold hover:bg-emerald-500 disabled:opacity-50"
          >
            Publish live
          </button>
        </div>
      </div>
    </header>
  );
}

export function CanvaSiteEditor({
  token,
  onClose,
  onPublished,
}: {
  token: string;
  onClose: () => void;
  onPublished?: () => void;
}) {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void fetchPreviewConfig(token)
      .then(setConfig)
      .catch(() => setError("Failed to load draft — check backend is running on port 8000"));
  }, [token]);

  const persist = useCallback(
    async (c: SiteConfig) => {
      setSaving(true);
      setError(null);
      try {
        await cmsAdminSaveDraft(token, c);
        setHasDraft(true);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Save failed";
        setError(msg);
        throw e;
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
      saveTimer.current = setTimeout(() => {
        void persist(c).catch(() => {
          /* error shown via setError */
        });
      }, 800);
    },
    [persist],
  );

  async function handlePublish() {
    if (!config || !confirm("Publish to LIVE website?")) return;
    try {
      await persist(config);
      await cmsAdminPublish(token);
      setHasDraft(false);
      onPublished?.();
      onClose();
    } catch {
      /* error already set by persist or publish */
    }
  }

  async function handleDiscard() {
    if (!confirm("Discard all draft changes?")) return;
    try {
      const fresh = await cmsAdminDiscard(token);
      setConfig(mergeConfigFromApi(fresh.config));
      setHasDraft(false);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Discard failed");
    }
  }

  if (!config) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-white">
        {error ? (
          <>
            <p className="mb-4 text-red-400">{error}</p>
            <button type="button" onClick={onClose} className="rounded-lg bg-slate-700 px-4 py-2 text-sm">
              Close
            </button>
          </>
        ) : (
          <p className="animate-pulse">Loading visual editor…</p>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950">
      <VisualEditorProvider config={config} onConfigChange={onConfigChange}>
        <EditorInner
          onClose={onClose}
          onSave={() => void persist(config).catch(() => {})}
          saving={saving}
          hasDraft={hasDraft}
          onPublish={() => void handlePublish()}
          onDiscard={() => void handleDiscard()}
          error={error}
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
  error,
}: {
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  hasDraft: boolean;
  onPublish: () => void;
  onDiscard: () => void;
  error: string | null;
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
        error={error}
        onAddText={() => ctx?.addTextBlock()}
      />
      <div className="flex min-h-0 flex-1">
        <main
          className="flex-1 overflow-auto bg-slate-800/80 p-6"
          onClick={() => ctx?.select(null)}
        >
          <p className="mb-4 text-center text-xs text-slate-400">
            Click any text to edit · Drag selected elements to move · Colors & size in right panel
          </p>
          <EditorCanvas onBackgroundClick={() => ctx?.select(null)} />
        </main>
        <EditorPropertiesPanel />
      </div>
    </>
  );
}

"use client";

import { mergeFieldLayers } from "@/lib/visual-editor/discoverPaths";
import { getRegisteredFields } from "@/lib/visual-editor/cms-registry";
import { readField, useVisualEditor } from "@/lib/visual-editor/VisualEditorContext";

const COLORS = ["#0f172a", "#0f766e", "#0891b2", "#d97706", "#dc2626", "#7c3aed", "#ffffff"];

export function EditorPropertiesPanel() {
  const ctx = useVisualEditor();
  if (!ctx) return null;

  const path = ctx.selectedPath;
  const isBlock = path?.startsWith("block:");
  const blockId = isBlock ? path!.slice(6) : null;
  const block = blockId ? ctx.config.custom_blocks?.find((b) => b.id === blockId) : null;

  const stylePath = isBlock ? null : path;
  const style = stylePath ? ctx.getStyle(stylePath) : null;
  const fieldValue = stylePath ? readField(ctx.config, stylePath) : block?.text ?? "";
  const fieldType =
    stylePath && (stylePath.includes("image") || fieldValue.startsWith("/") || fieldValue.startsWith("http"))
      ? "image"
      : "text";

  const allLayers = mergeFieldLayers(ctx.config, getRegisteredFields());
  const grouped = allLayers.reduce<Record<string, typeof allLayers>>((acc, layer) => {
    const g = layer.group || "Other";
    if (!acc[g]) acc[g] = [];
    acc[g].push(layer);
    return acc;
  }, {});

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-slate-700 bg-slate-900 text-white">
      <div className="border-b border-slate-700 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-300">Properties</p>
        <p className="mt-1 truncate text-sm text-slate-300">
          {path ? (isBlock ? "Custom text box" : path) : "Click any element — auto-discovered fields"}
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {!path && (
          <p className="text-xs text-slate-400">
            <strong>{allLayers.length}</strong> editable fields on page. New features with{" "}
            <code className="text-violet-300">CmsField</code> or <code className="text-violet-300">data-cms-path</code>{" "}
            appear here automatically.
          </p>
        )}

        {path && !isBlock && stylePath && (
          <>
            <label className="block text-xs font-semibold text-slate-400">
              {fieldType === "image" ? "Image URL" : "Text"}
              <textarea
                value={fieldValue}
                onChange={(e) => ctx.updateField(stylePath, e.target.value)}
                rows={fieldType === "image" ? 2 : 3}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white"
              />
            </label>
            {fieldType === "text" && (
              <>
                <label className="block text-xs font-semibold text-slate-400">
                  Font size
                  <input
                    type="range"
                    min={12}
                    max={72}
                    value={parseInt(String(style?.fontSize || "16").replace("px", ""), 10) || 16}
                    onChange={(e) => ctx.updateStyle(stylePath, { fontSize: `${e.target.value}px` })}
                    className="mt-2 w-full"
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-400">
                  Color
                  <div className="mt-2 flex flex-wrap gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className="h-7 w-7 rounded-full border-2 border-white/30"
                        style={{ backgroundColor: c }}
                        onClick={() => ctx.updateStyle(stylePath, { color: c })}
                      />
                    ))}
                    <input
                      type="color"
                      value={style?.color || "#0f172a"}
                      onChange={(e) => ctx.updateStyle(stylePath, { color: e.target.value })}
                      className="h-7 w-10 cursor-pointer rounded border-0"
                    />
                  </div>
                </label>
                <label className="block text-xs font-semibold text-slate-400">
                  Weight
                  <select
                    value={style?.fontWeight || "600"}
                    onChange={(e) => ctx.updateStyle(stylePath, { fontWeight: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-2 py-2 text-sm"
                  >
                    <option value="400">Normal</option>
                    <option value="600">Semi-bold</option>
                    <option value="700">Bold</option>
                    <option value="800">Extra bold</option>
                  </select>
                </label>
              </>
            )}
          </>
        )}

        {block && blockId && (
          <>
            <label className="block text-xs font-semibold text-slate-400">
              Text
              <textarea
                value={block.text}
                onChange={(e) => ctx.updateBlock(blockId, { text: e.target.value })}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-400">
              Size
              <input
                type="range"
                min={14}
                max={64}
                value={parseInt(block.fontSize, 10) || 24}
                onChange={(e) => ctx.updateBlock(blockId, { fontSize: `${e.target.value}px` })}
                className="mt-2 w-full"
              />
            </label>
            <input
              type="color"
              value={block.color}
              onChange={(e) => ctx.updateBlock(blockId, { color: e.target.value })}
              className="h-8 w-full cursor-pointer rounded"
            />
            <button
              type="button"
              onClick={() => ctx.removeBlock(blockId)}
              className="w-full rounded-lg bg-red-600/80 py-2 text-xs font-bold"
            >
              Delete text box
            </button>
          </>
        )}

        <div className="border-t border-slate-700 pt-4">
          <p className="text-xs font-bold text-slate-400">
            All layers <span className="text-violet-400">({allLayers.length})</span>
          </p>
          <div className="mt-2 max-h-64 space-y-3 overflow-y-auto">
            {Object.entries(grouped).map(([group, layers]) => (
              <div key={group}>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{group}</p>
                <ul className="mt-1 space-y-0.5">
                  {layers.map((layer) => (
                    <li key={layer.path}>
                      <button
                        type="button"
                        onClick={() => ctx.select(layer.path)}
                        className={`w-full truncate rounded px-2 py-1 text-left text-xs hover:bg-slate-800 ${
                          ctx.selectedPath === layer.path ? "bg-violet-900/50 text-violet-200" : "text-slate-300"
                        }`}
                      >
                        {layer.label || layer.path}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {(ctx.config.custom_blocks || []).map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => ctx.select(`block:${b.id}`)}
                className={`mt-1 w-full truncate rounded px-2 py-1 text-left text-xs hover:bg-slate-800 ${
                  ctx.selectedPath === `block:${b.id}` ? "bg-violet-900/50" : "text-slate-300"
                }`}
              >
                + {b.text.slice(0, 28)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

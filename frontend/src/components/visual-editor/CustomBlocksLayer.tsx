"use client";

import { useVisualEditor } from "@/lib/visual-editor/VisualEditorContext";

export function CustomBlocksLayer() {
  const ctx = useVisualEditor();
  if (!ctx?.active || !ctx.config.custom_blocks?.length) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[45] overflow-hidden">
      {ctx.config.custom_blocks.map((block) => {
        const selected = ctx.selectedPath === `block:${block.id}`;
        return (
          <div
            key={block.id}
            className={`pointer-events-auto absolute max-w-xs rounded-lg px-3 py-2 shadow-lg ${
              selected ? "ring-2 ring-violet-500" : "hover:ring-2 hover:ring-violet-300"
            }`}
            style={{
              left: block.left,
              top: block.top,
              color: block.color,
              fontSize: block.fontSize,
              fontWeight: block.fontWeight,
              backgroundColor: block.backgroundColor || "rgba(255,255,255,0.92)",
              cursor: ctx.tool === "move" ? "move" : "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              ctx.select(`block:${block.id}`);
            }}
            onMouseDown={(e) => {
              if (ctx.tool !== "move") return;
              e.preventDefault();
              const start = { x: e.clientX, y: e.clientY, left: block.left, top: block.top };
              const onMove = (ev: MouseEvent) => {
                ctx.updateBlock(block.id, {
                  left: start.left + (ev.clientX - start.x),
                  top: start.top + (ev.clientY - start.y),
                });
              };
              const onUp = () => {
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
              };
              window.addEventListener("mousemove", onMove);
              window.addEventListener("mouseup", onUp);
            }}
            contentEditable={selected}
            suppressContentEditableWarning
            onBlur={(e) => {
              const text = e.currentTarget.textContent?.trim() ?? "";
              if (text !== block.text) ctx.updateBlock(block.id, { text });
            }}
          >
            {block.text}
          </div>
        );
      })}
    </div>
  );
}

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
              cursor: selected ? "move" : "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              ctx.select(`block:${block.id}`);
            }}
            onMouseDown={(e) => {
              if (!selected) return;
              const startX = e.clientX;
              const startY = e.clientY;
              const origin = { left: block.left, top: block.top };
              let dragging = false;

              const onMove = (ev: MouseEvent) => {
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;
                if (!dragging && Math.hypot(dx, dy) < 4) return;
                if (!dragging) {
                  dragging = true;
                  e.preventDefault();
                }
                ctx.updateBlock(block.id, {
                  left: origin.left + dx,
                  top: origin.top + dy,
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

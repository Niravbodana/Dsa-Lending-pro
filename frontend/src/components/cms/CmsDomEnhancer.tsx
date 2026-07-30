"use client";

/**
 * Auto-discovers [data-cms-path] in the DOM (without CmsField wrapper).
 * Future components only need data-cms-path + cms_defaults entry — no extra wiring.
 */

import { useEffect, useRef } from "react";
import { registerCmsField } from "@/lib/visual-editor/cms-registry";
import { readField, useVisualEditor } from "@/lib/visual-editor/VisualEditorContext";

const ENHANCED = "data-cms-enhanced";

export function CmsDomEnhancer() {
  const ctx = useVisualEditor();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ctx?.active) return;
    const editor = ctx;

    function enhance(root: ParentNode) {
      const nodes = root.querySelectorAll<HTMLElement>(`[data-cms-path]:not([${ENHANCED}])`);
      nodes.forEach((el) => {
        const path = el.getAttribute("data-cms-path");
        if (!path) return;
        el.setAttribute(ENHANCED, "1");

        const label = el.getAttribute("data-cms-label") || undefined;
        const group = el.getAttribute("data-cms-group") || undefined;
        const type = (el.getAttribute("data-cms-type") as "text" | "image" | "url") || "text";
        registerCmsField({ path, label, group, type });

        const configVal = readField(editor.config, path);
        if (configVal && type === "text" && !el.getAttribute("contenteditable")) {
          if (el.tagName === "IMG") {
            (el as HTMLImageElement).src = configVal;
          } else if (!el.textContent?.trim()) {
            el.textContent = configVal;
          }
        }

        const style = editor.getStyle(path);
        if (style.left != null || style.top != null) {
          el.style.position = "relative";
          if (style.left != null) el.style.left = `${style.left}px`;
          if (style.top != null) el.style.top = `${style.top}px`;
          if (style.zIndex != null) el.style.zIndex = String(style.zIndex);
        }
        if (style.color) el.style.color = style.color;
        if (style.fontSize) el.style.fontSize = style.fontSize;
        if (style.fontWeight) el.style.fontWeight = style.fontWeight;
        if (style.backgroundColor) el.style.backgroundColor = style.backgroundColor;
        if (style.textAlign) el.style.textAlign = style.textAlign;

        el.classList.add("cms-auto-field");
        if (editor.selectedPath === path) {
          el.classList.add("ring-2", "ring-violet-500", "ring-offset-2");
          el.style.cursor = "move";
        } else {
          el.classList.remove("ring-2", "ring-violet-500", "ring-offset-2");
          el.style.cursor = "pointer";
        }

        el.onclick = (e) => {
          e.stopPropagation();
          editor.select(path);
        };

        if (type === "text" && editor.selectedPath === path) {
          el.setAttribute("contenteditable", "true");
          el.onblur = () => {
            const text = el.textContent?.trim() ?? "";
            if (text !== configVal) editor.updateField(path, text);
          };
        } else {
          el.removeAttribute("contenteditable");
        }

        el.onmousedown = (e) => {
          if (editor.selectedPath !== path || type === "image") return;
          const startX = e.clientX;
          const startY = e.clientY;
          const origin = { left: style.left ?? 0, top: style.top ?? 0 };
          let dragging = false;

          const onMove = (ev: MouseEvent) => {
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;
            if (!dragging && Math.hypot(dx, dy) < 4) return;
            if (!dragging) {
              dragging = true;
              e.preventDefault();
            }
            editor.updateStyle(path, { left: origin.left + dx, top: origin.top + dy });
          };
          const onUp = () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
          };
          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
        };
      });
    }

    const host = rootRef.current?.parentElement;
    if (!host) return;

    enhance(host);
    const observer = new MutationObserver(() => enhance(host));
    observer.observe(host, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [ctx, ctx?.active, ctx?.config, ctx?.selectedPath]);

  return <div ref={rootRef} className="hidden" aria-hidden />;
}

"use client";

import { useRef, type CSSProperties, type ReactNode, useEffect } from "react";
import { readField, useVisualEditor } from "@/lib/visual-editor/VisualEditorContext";
import { publishedStyle, useSiteConfigContext } from "@/lib/visual-editor/SiteConfigContext";

type EditableTextProps = {
  path: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
  draggable?: boolean;
};

function EditableTextActive({
  path,
  className = "",
  style,
  children,
  as: Tag = "span",
  draggable = false,
}: EditableTextProps) {
  const ctx = useVisualEditor()!;
  const ref = useRef<HTMLElement>(null);
  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  const value = readField(ctx.config, path) || (typeof children === "string" ? children : "");
  const custom = ctx.getStyle(path);
  const selected = ctx.selectedPath === path;

  const merged: CSSProperties = {
    ...style,
    color: custom.color ?? style?.color,
    fontSize: custom.fontSize ?? style?.fontSize,
    fontWeight: custom.fontWeight ?? style?.fontWeight,
    backgroundColor: custom.backgroundColor ?? style?.backgroundColor,
    textAlign: custom.textAlign ?? style?.textAlign,
    ...(custom.left != null || custom.top != null
      ? {
          position: "relative" as const,
          left: custom.left ?? 0,
          top: custom.top ?? 0,
          zIndex: custom.zIndex ?? 20,
        }
      : {}),
  };

  useEffect(() => {
    if (!selected || !ref.current) return;
    ref.current.focus();
  }, [selected]);

  function onMouseDown(e: React.MouseEvent) {
    if (!draggable || ctx.tool !== "move" || !selected) return;
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      left: custom.left ?? 0,
      top: custom.top ?? 0,
    };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.x;
      const dy = ev.clientY - dragRef.current.y;
      ctx.updateStyle(path, {
        left: dragRef.current.left + dx,
        top: dragRef.current.top + dy,
      });
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <Tag
      ref={ref as never}
      className={`${className} outline-none transition-shadow ${
        selected
          ? "ring-2 ring-violet-500 ring-offset-2"
          : "hover:ring-2 hover:ring-violet-300 hover:ring-offset-1"
      } ${draggable && selected && ctx.tool === "move" ? "cursor-move" : "cursor-pointer"}`}
      style={merged}
      onClick={(e) => {
        e.stopPropagation();
        ctx.select(path);
      }}
      onMouseDown={onMouseDown}
      contentEditable={selected}
      suppressContentEditableWarning
      onBlur={(e) => {
        const text = e.currentTarget.textContent?.trim() ?? "";
        if (text !== value) ctx.updateField(path, text);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && Tag !== "p" && Tag !== "div") {
          e.preventDefault();
          (e.target as HTMLElement).blur();
        }
      }}
    >
      {value || children}
    </Tag>
  );
}

export function EditableText(props: EditableTextProps) {
  const ctx = useVisualEditor();
  const siteConfig = useSiteConfigContext();
  if (!ctx?.active) {
    const Tag = props.as || "span";
    const published = publishedStyle(siteConfig, props.path);
    return (
      <Tag className={props.className} style={{ ...props.style, ...published }}>
        {props.children}
      </Tag>
    );
  }
  return <EditableTextActive {...props} />;
}

export function EditableImage({
  path,
  src,
  alt,
  className,
  fill,
}: {
  path: string;
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
}) {
  const ctx = useVisualEditor();
  if (!ctx?.active) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  }
  const selected = ctx.selectedPath === path;
  return (
    <button
      type="button"
      className={`relative block p-0 ${className || ""} ${
        selected ? "ring-4 ring-violet-500" : "hover:ring-2 hover:ring-violet-300"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        ctx.select(path);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={fill ? "h-full w-full object-cover" : className} />
      {selected && (
        <span className="absolute bottom-2 left-2 rounded bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white">
          Image · change in panel
        </span>
      )}
    </button>
  );
}

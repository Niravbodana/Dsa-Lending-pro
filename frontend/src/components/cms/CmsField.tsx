"use client";

/**
 * Universal CMS field — wrap ANY site content with this and it becomes
 * auto-editable in Visual Editor. Future features: just add CmsField or data-cms-path.
 *
 * @example
 * <CmsField path="hero.headline_line1" as="h1" label="Main headline" group="Hero" />
 */

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { resolveCmsImageUrl } from "@/lib/resolve-image";
import {
  pathToGroup,
  pathToLabel,
  registerCmsField,
  unregisterCmsField,
  type CmsFieldType,
} from "@/lib/visual-editor/cms-registry";
import { readField, useVisualEditor } from "@/lib/visual-editor/VisualEditorContext";
import { publishedStyle, useSiteConfigContext } from "@/lib/visual-editor/SiteConfigContext";

export type CmsFieldProps = {
  path: string;
  label?: string;
  group?: string;
  type?: CmsFieldType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  as?: ElementType;
  draggable?: boolean;
};

const CMS_DATA_ATTR = "data-cms-path";
const CMS_ENHANCED_ATTR = "data-cms-enhanced";

function CmsFieldActive({
  path,
  className = "",
  style,
  children,
  as: Tag = "span",
  draggable = true,
  type = "text",
}: CmsFieldProps) {
  const ctx = useVisualEditor()!;
  const ref = useRef<HTMLElement>(null);

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
    if (!selected || !ref.current || type === "image") return;
    ref.current.focus();
  }, [selected, type]);

  function onMouseDown(e: React.MouseEvent) {
    if (!draggable || !selected) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const origin = { left: custom.left ?? 0, top: custom.top ?? 0 };
    let dragging = false;

    const onMove = (ev: globalThis.MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!dragging && Math.hypot(dx, dy) < 4) return;
      if (!dragging) {
        dragging = true;
        e.preventDefault();
      }
      ctx.updateStyle(path, { left: origin.left + dx, top: origin.top + dy });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  if (type === "image" || type === "url") {
    const src = resolveCmsImageUrl(value || (typeof children === "string" ? children : ""));
    return (
      <button
        type="button"
        {...{ [CMS_DATA_ATTR]: path, [CMS_ENHANCED_ATTR]: "1" }}
        data-cms-type={type}
        className={`relative block p-0 ${className} ${
          selected ? "ring-4 ring-violet-500" : "hover:ring-2 hover:ring-violet-300"
        }`}
        onClick={(e: ReactMouseEvent<HTMLElement>) => {
          e.stopPropagation();
          ctx.select(path);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className={className} />
        {selected && (
          <span className="absolute bottom-2 left-2 rounded bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white">
            {type === "image" ? "Image" : "URL"} · edit in panel
          </span>
        )}
      </button>
    );
  }

  return (
    <Tag
      ref={ref as never}
      {...{ [CMS_DATA_ATTR]: path, [CMS_ENHANCED_ATTR]: "1" }}
      data-cms-type="text"
      className={`${className} outline-none transition-shadow ${
        selected
          ? "ring-2 ring-violet-500 ring-offset-2"
          : "hover:ring-2 hover:ring-violet-300 hover:ring-offset-1"
      } ${draggable && selected ? "cursor-move" : "cursor-pointer"}`}
      style={merged}
      onClick={(e: ReactMouseEvent<HTMLElement>) => {
        e.stopPropagation();
        ctx.select(path);
      }}
      onMouseDown={onMouseDown}
      contentEditable={selected}
      suppressContentEditableWarning
      onBlur={(e: FocusEvent<HTMLElement>) => {
        const text = e.currentTarget.textContent?.trim() ?? "";
        if (text !== value) ctx.updateField(path, text);
      }}
      onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
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

export function CmsField({
  path,
  label,
  group,
  type = "text",
  ...rest
}: CmsFieldProps) {
  const ctx = useVisualEditor();
  const siteConfig = useSiteConfigContext();

  useEffect(() => {
    registerCmsField({
      path,
      label: label || pathToLabel(path),
      group: group || pathToGroup(path),
      type,
    });
    return () => unregisterCmsField(path);
  }, [path, label, group, type]);

  if (ctx?.active) {
    return <CmsFieldActive path={path} type={type} {...rest} />;
  }

  const config = siteConfig;
  const published = publishedStyle(config, path);
  const display =
    (config ? readField(config, path) : "") ||
    (typeof rest.children === "string" ? rest.children : "");

  if (type === "image" || type === "url") {
    const src = resolveCmsImageUrl(display || "");
    if (!src) return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...{ [CMS_DATA_ATTR]: path }}
        data-cms-type={type}
        src={src}
        alt=""
        className={rest.className}
        style={{ ...rest.style, ...published }}
      />
    );
  }

  const Tag = rest.as || "span";
  return (
    <Tag
      {...{ [CMS_DATA_ATTR]: path }}
      data-cms-type="text"
      className={rest.className}
      style={{ ...rest.style, ...published }}
    >
      {display || rest.children}
    </Tag>
  );
}

/** Shorthand for image fields */
export function CmsImage(props: Omit<CmsFieldProps, "type">) {
  return <CmsField type="image" {...props} />;
}

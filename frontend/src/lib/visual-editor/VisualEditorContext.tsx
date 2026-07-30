"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SiteConfig } from "@/lib/cms";
import { getByPath, setByPath } from "@/lib/visual-editor/paths";
import type { CustomBlock, ElementStyle } from "@/lib/visual-editor/types";

type VisualEditorContextValue = {
  active: boolean;
  config: SiteConfig;
  selectedPath: string | null;
  select: (path: string | null) => void;
  updateField: (path: string, value: string) => void;
  updateStyle: (path: string, style: Partial<ElementStyle>) => void;
  getStyle: (path: string) => ElementStyle;
  addTextBlock: () => void;
  updateBlock: (id: string, patch: Partial<CustomBlock>) => void;
  removeBlock: (id: string) => void;
  tool: "select" | "text";
  setTool: (t: "select" | "text") => void;
};

const VisualEditorContext = createContext<VisualEditorContextValue | null>(null);

export function useVisualEditor() {
  return useContext(VisualEditorContext);
}

export function VisualEditorProvider({
  config,
  onConfigChange,
  children,
}: {
  config: SiteConfig;
  onConfigChange: (c: SiteConfig) => void;
  children: ReactNode;
}) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [tool, setTool] = useState<"select" | "text">("select");

  const updateConfig = useCallback(
    (next: SiteConfig) => {
      onConfigChange(next);
    },
    [onConfigChange],
  );

  const select = useCallback((path: string | null) => {
    setSelectedPath(path);
  }, []);

  const updateField = useCallback(
    (path: string, value: string) => {
      const next = setByPath(config as unknown as Record<string, unknown>, path, value) as unknown as SiteConfig;
      updateConfig(next);
    },
    [config, updateConfig],
  );

  const updateStyle = useCallback(
    (path: string, style: Partial<ElementStyle>) => {
      const prev = config.element_styles?.[path] || {};
      const nextStyles = { ...(config.element_styles || {}), [path]: { ...prev, ...style } };
      updateConfig({ ...config, element_styles: nextStyles });
    },
    [config, updateConfig],
  );

  const getStyle = useCallback(
    (path: string) => config.element_styles?.[path] || {},
    [config.element_styles],
  );

  const addTextBlock = useCallback(() => {
    const id = `block-${Date.now()}`;
    const block: CustomBlock = {
      id,
      text: "Click to edit text",
      left: 120,
      top: 200,
      fontSize: "24px",
      color: "#0f172a",
      fontWeight: "700",
    };
    updateConfig({
      ...config,
      custom_blocks: [...(config.custom_blocks || []), block],
    });
    setSelectedPath(`block:${id}`);
  }, [config, updateConfig]);

  const updateBlock = useCallback(
    (id: string, patch: Partial<CustomBlock>) => {
      const blocks = (config.custom_blocks || []).map((b) => (b.id === id ? { ...b, ...patch } : b));
      updateConfig({ ...config, custom_blocks: blocks });
    },
    [config, updateConfig],
  );

  const removeBlock = useCallback(
    (id: string) => {
      updateConfig({
        ...config,
        custom_blocks: (config.custom_blocks || []).filter((b) => b.id !== id),
      });
      setSelectedPath(null);
    },
    [config, updateConfig],
  );

  const value = useMemo(
    () => ({
      active: true,
      config,
      selectedPath,
      select,
      updateField,
      updateStyle,
      getStyle,
      addTextBlock,
      updateBlock,
      removeBlock,
      tool,
      setTool,
    }),
    [
      config,
      selectedPath,
      select,
      updateField,
      updateStyle,
      getStyle,
      addTextBlock,
      updateBlock,
      removeBlock,
      tool,
    ],
  );

  return <VisualEditorContext.Provider value={value}>{children}</VisualEditorContext.Provider>;
}

export function readField(config: SiteConfig, path: string): string {
  const v = getByPath(config, path);
  return v == null ? "" : String(v);
}

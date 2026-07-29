import type { SiteConfig } from "@/lib/cms";
import type { CmsFieldMeta } from "@/lib/visual-editor/cms-registry";
import { pathToGroup, pathToLabel } from "@/lib/visual-editor/cms-registry";

const SKIP_KEYS = new Set(["element_styles", "custom_blocks", "sections"]);

function fieldType(path: string, value: unknown): CmsFieldMeta["type"] {
  if (typeof value !== "string") return "text";
  if (path.includes("image") || path.endsWith(".image")) return "image";
  if (value.startsWith("http") || value.startsWith("/images/") || value.startsWith("/hero")) return "url";
  return "text";
}

function walk(value: unknown, path: string, out: CmsFieldMeta[]) {
  if (value === null || value === undefined) return;

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    if (typeof value === "boolean") return;
    out.push({
      path,
      label: pathToLabel(path),
      group: pathToGroup(path),
      type: fieldType(path, value),
    });
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, i) => walk(item, `${path}.${i}`, out));
    return;
  }

  if (typeof value === "object") {
    const top = path.split(".")[0];
    if (SKIP_KEYS.has(top) || SKIP_KEYS.has(path)) return;
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      walk(child, path ? `${path}.${key}` : key, out);
    }
  }
}

export function discoverPathsFromConfig(config: SiteConfig | Record<string, unknown>): CmsFieldMeta[] {
  const out: CmsFieldMeta[] = [];
  walk(config, "", out);
  return out;
}

export function mergeFieldLayers(
  config: SiteConfig,
  registered: CmsFieldMeta[],
): CmsFieldMeta[] {
  const map = new Map<string, CmsFieldMeta>();
  for (const d of discoverPathsFromConfig(config)) {
    map.set(d.path, d);
  }
  for (const r of registered) {
    map.set(r.path, { ...map.get(r.path), ...r });
  }
  return Array.from(map.values()).sort((a, b) => a.path.localeCompare(b.path));
}

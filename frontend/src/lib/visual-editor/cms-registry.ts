export type CmsFieldType = "text" | "image" | "url";

export type CmsFieldMeta = {
  path: string;
  label?: string;
  group?: string;
  type?: CmsFieldType;
};

const registry = new Map<string, CmsFieldMeta>();

export function registerCmsField(meta: CmsFieldMeta) {
  registry.set(meta.path, { ...registry.get(meta.path), ...meta });
}

export function unregisterCmsField(path: string) {
  registry.delete(path);
}

export function getRegisteredFields(): CmsFieldMeta[] {
  return Array.from(registry.values());
}

export function pathToLabel(path: string): string {
  const last = path.split(".").pop() || path;
  return last.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function pathToGroup(path: string): string {
  return path.split(".")[0].replace(/_/g, " ");
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export function getByPath(obj: any, path: string): any {
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    const key: string | number = /^\d+$/.test(p) ? Number(p) : p;
    cur = cur[key];
  }
  return cur;
}

export function setByPath<T extends Record<string, unknown>>(obj: T, path: string, value: unknown): T {
  const clone = structuredClone(obj) as any;
  const parts = path.split(".");
  let cur = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const key: string | number = /^\d+$/.test(p) ? Number(p) : p;
    if (cur[key] == null || typeof cur[key] !== "object") {
      cur[key] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    }
    cur = cur[key];
  }
  const last = parts[parts.length - 1];
  const lastKey: string | number = /^\d+$/.test(last) ? Number(last) : last;
  cur[lastKey] = value;
  return clone as T;
}

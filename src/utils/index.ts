export function clamp(x: number, min: number, max: number) {
  return Math.max(Math.min(x, max), min);
}

export function normalizeStr(str: String) {
  return str.normalize("NFD").replace(/[\u0300-\u036F]/g, "");
}

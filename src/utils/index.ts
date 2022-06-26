export function clamp(x: number, min: number, max: number) {
  return Math.max(Math.min(x, max), min);
}

export function normalizeStr(str: String) {
  return str.normalize("NFD").replace(/[\u0300-\u036F]/g, "");
}

export function ellipsis(text:string, limit=2000) {
  if (text.length > limit)
      return text.slice(0, limit-3) + "...";
  return text;
}
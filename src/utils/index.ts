export function clamp(x: number, min: number, max: number) {
  return Math.max(Math.min(x, max), min);
}

export function normalizeStr(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036F]/g, "");
}
export function randomInt(min: number, max: number) {
  min = Math.floor(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
export function randomColorHex(): `#${string}` {
  return `#${(0x1000000 + randomInt(0, 0xffffff)).toString(16).slice(1)}`;
}

export function ellipsis(text: string, limit = 2000) {
  if (text.length > limit) return text.slice(0, limit - 3) + "...";
  return text;
}

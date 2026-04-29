/** Bbox GeoJSON order: minLng, minLat, maxLng, maxLat (WGS84). */

export type BBox = readonly [minLng: number, minLat: number, maxLng: number, maxLat: number];

export function parseBBox(raw: string | undefined): BBox | null {
  if (raw === undefined || raw.trim() === "") return null;
  const parts = raw.split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return null;
  const [minLng, minLat, maxLng, maxLat] = parts;
  if (minLng < -180 || maxLng > 180 || minLat < -90 || maxLat > 90) return null;
  if (minLng > maxLng || minLat > maxLat) return null;
  return [minLng, minLat, maxLng, maxLat];
}

export function clampLimit(raw: string | undefined, fallback: number, maxCap: number): number {
  const trimmed = raw?.trim();
  if (trimmed === undefined || trimmed === "") {
    return Math.min(Math.max(fallback, 1), maxCap);
  }
  const n = Number(trimmed);
  const v = Number.isFinite(n) ? Math.floor(n) : fallback;
  return Math.min(Math.max(v, 1), maxCap);
}

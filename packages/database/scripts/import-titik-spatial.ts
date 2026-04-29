/**
 * Mengisi kolom latitude/longitude pada `Customer` dari layer shapefile Titik (.shp + .dbf + .prj).
 * Gabung menggunakan nomor langganan (default: cari kolom NOLG / pola serupa pada .dbf).
 *
 * Jalankan setelah Anda melihat keys yang benar: `pnpm spatial:inspect`
 * Lalu dari akar repo: `pnpm spatial:import-titik`
 *
 * Sesuaikan jika nama kolom khusus:
 *   SPATIAL_ID_PROP=NOL_PELANGGAN pnpm spatial:import-titik
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";

import { discoverTitikPelangganFiles } from "./lib/spatial-fs.js";

const prisma = new PrismaClient();

const workspaceRoot = path.resolve(fileURLToPath(new URL(import.meta.url)), "..", "..", "..");

function lngLatFromGeometry(g: GeoJSON.Geometry): [number, number] | null {
  switch (g.type) {
    case "Point":
      return [g.coordinates[0], g.coordinates[1]];
    case "MultiPoint":
      return g.coordinates[0]
        ? [g.coordinates[0][0], g.coordinates[0][1]]
        : null;
    case "Polygon": {
      const ring = g.coordinates[0];
      if (!ring?.length) return null;
      let sx = 0;
      let sy = 0;
      for (const [x, y] of ring) {
        sx += x;
        sy += y;
      }
      return [sx / ring.length, sy / ring.length];
    }
    default:
      return null;
  }
}

/** Nama kolom .dbf dari export Anda sering bermacam-macam; SPATIAL_ID_PROP bisa men-overrides. */
const FALLBACK_KEYS = ["NOLG", "nolg", "NO_LANGGANAN", "nosamb", "NOSAMB", "nprs", "NPRS"];

function propsToNomorPelanggan(
  props: Record<string, unknown> | undefined,
  explicitEnv: string | undefined,
): string | null {
  if (!props) return null;

  const exp = explicitEnv?.trim();
  if (exp && props[exp] != null && String(props[exp]).trim() !== "") {
    return String(props[exp]).trim();
  }

  for (const k of FALLBACK_KEYS) {
    if (props[k] != null && String(props[k]).trim() !== "") {
      return String(props[k]).trim();
    }
  }

  for (const [k, v] of Object.entries(props)) {
    if (v == null || String(v).trim() === "") continue;
    const ku = k.toUpperCase();
    if (/NOL|LANGGAN|PELANGGAN|SAMB/.test(ku) && /[\d]/.test(String(v))) return String(v).trim();
  }

  return null;
}

/** Kecocokan seperti CSV Anda: angka sama dengan/lebih tanpa nol depan yang sama pentingnya. */
function variantsNomor(raw: string): string[] {
  const t = raw.trim();
  if (!t) return [];
  const stripped = t.replace(/^0+(?=.)/g, "");
  const s = new Set<string>([t]);
  if (stripped && stripped !== t) s.add(stripped);
  return [...s];
}

async function upsertLonLat(rawId: string, lng: number, lat: number): Promise<boolean> {
  const variants = variantsNomor(rawId);
  for (const nl of variants) {
    const found = await prisma.customer.findUnique({ where: { nomorLangganan: nl } });
    if (found) {
      await prisma.customer.update({
        where: { id: found.id },
        data: {
          longitude: lng,
          latitude: lat,
          geoSource: `import-shapefile:Titik-Pelanggan`,
          geoCapturedAt: new Date(),
        },
      });
      return true;
    }
  }
  return false;
}

async function importShapefile(): Promise<{ ok: boolean; imported: number; skipped: number; missing: number }> {
  const disco = discoverTitikPelangganFiles(workspaceRoot);
  let imported = 0;
  let skipped = 0;
  let missing = 0;

  if (!disco?.shpPaths.shp || !disco.shpPaths.dbf) {
    console.error("Pasangan .shp + .dbf untuk Titik tidak ditemukan di Data/.");
    return { ok: false, imported: 0, skipped: 0, missing: 0 };
  }

  const limitRaw = process.env.SPATIAL_IMPORT_LIMIT?.trim();
  const LIMIT =
    !limitRaw || limitRaw.toLowerCase() === "all"
      ? Infinity
      : Number.parseInt(limitRaw, 10) || Number.POSITIVE_INFINITY;

  const explicitProp = process.env.SPATIAL_ID_PROP;

  const payload: {
    shp: Buffer;
    dbf: Buffer;
    prj?: Buffer;
    cpg?: Buffer;
  } = {
    shp: await fs.readFile(disco.shpPaths.shp),
    dbf: await fs.readFile(disco.shpPaths.dbf),
  };
  if (disco.shpPaths.prj) payload.prj = await fs.readFile(disco.shpPaths.prj);
  if (disco.shpPaths.cpg) payload.cpg = await fs.readFile(disco.shpPaths.cpg);

  const load = (await import("shpjs")).default as (p: typeof payload) => Promise<GeoJSON.FeatureCollection>;
  const fc = await load(payload);

  let n = 0;
  for (const f of fc.features) {
    if (Number.isFinite(LIMIT) && n >= LIMIT) break;
    n++;

    const props = (f.properties ?? {}) as Record<string, unknown>;
    const id = propsToNomorPelanggan(props, explicitProp);

    const ll = f.geometry ? lngLatFromGeometry(f.geometry) : null;

    if (!id) {
      skipped++;
      continue;
    }
    if (!ll) {
      skipped++;
      continue;
    }

    const matched = await upsertLonLat(id, ll[0], ll[1]);
    if (matched) imported++;
    else missing++;
  }

  console.log(`Shapefile diproses. Cocok/update: ${imported}, geometri/id tidak jelas dilewat: ~${skipped}, tidak ada pelanggan di DB: ${missing}`);
  return { ok: true, imported, skipped, missing };
}

async function main(): Promise<void> {
  console.log(`Workspace root: ${workspaceRoot}`);
  const r = await importShapefile();
  if (!r.ok) process.exitCode = 1;

  console.log(`
Catatan SQLite (.sqlite):
- File ini bisa berisi geometry SpatiaLite/geopackage; struktur tidak seragam.
- Jalankan \`pnpm spatial:inspect\` untuk melihat tabel/kolom, lalu (bila diperlukan) impor bisa diperkaya di skrip terpisah.
`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

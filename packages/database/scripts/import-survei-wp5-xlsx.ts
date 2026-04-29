/**
 * Impor Excel survei pelanggan + koordinat (WP5) ke tabel `Customer` — sesuai isi berkas (bukan data seed demo).
 *
 * Mendukung export **mWater** (kolom `Titik Koordinat (latitude/longitude)`, `Nomor Pelanggan`, dll.).
 *
 * Taruh `.xlsx` di `Data/` (nama default sama berkas Anda) atau atur IMPORT_XLSX_PATH.
 *
 *   pnpm db:import-survei
 */

import fs from "node:fs";

import path from "node:path";
import { fileURLToPath } from "node:url";

import * as XLSX from "xlsx";

import { config } from "dotenv";

import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const prismaPkgDir = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(prismaPkgDir, "../.env"), override: true });

const prisma = new PrismaClient();

/** Normalisasi nama header sel Excel. */
function normalizeHeader(raw: unknown): string {
  return String(raw ?? "")
    .replace(/^\ufeff/, "")
    .replace(/\u00a0/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function findColumnIndex(headers: readonly string[], synonyms: readonly string[]): number | undefined {
  const normHeaders = headers.map((h, i) => ({ i, n: normalizeHeader(h) }));
  for (const syn of synonyms) {
    const s = normalizeHeader(syn);
    for (const { i, n } of normHeaders) {
      if (n === s) return i;
      if (s.length >= 5 && (n.includes(s) || s.includes(n))) return i;
    }
  }
  return undefined;
}

type ColKey =
  | "nolg"
  | "nama"
  | "alamat"
  | "nosamb"
  | "telp"
  | "wilDist"
  | "wilAdm"
  | "namaKec"
  | "namaKel"
  | "lat"
  | "lng"
  | "tanggalSurvey";

/** Override: nama kolom persis seperti di baris judul Excel. Contoh IMPORT_COL_LAT=Latitude */
const FORCE: Record<ColKey, string | undefined> = {
  nolg: process.env.IMPORT_COL_NOLG,
  nama: process.env.IMPORT_COL_NAMA,
  alamat: process.env.IMPORT_COL_ALAMAT,
  nosamb: process.env.IMPORT_COL_NOSAMB,
  telp: process.env.IMPORT_COL_TELP,
  wilDist: process.env.IMPORT_COL_WILDIST,
  wilAdm: process.env.IMPORT_COL_WILADM,
  namaKec: process.env.IMPORT_COL_KECAMATAN,
  namaKel: process.env.IMPORT_COL_KELURAHAN,
  lat: process.env.IMPORT_COL_LAT,
  lng: process.env.IMPORT_COL_LNG,
  tanggalSurvey: process.env.IMPORT_COL_TGL_SURVEI,
};

function readForcedColumns(headers: readonly string[]): Partial<Record<ColKey, number>> {
  const out: Partial<Record<ColKey, number>> = {};
  for (const [key, title] of Object.entries(FORCE) as Array<[ColKey, string | undefined]>) {
    if (!title?.trim()) continue;
    const idx = headers.findIndex((h) => normalizeHeader(h) === normalizeHeader(title));
    if (idx >= 0) out[key] = idx;
    else console.warn(`IMPORT_COL: tidak ada kolom persis seperti "${title}" (${key}).`);
  }
  return out;
}

function synonymsFor(key: ColKey): readonly string[] {
  switch (key) {
    case "nolg":
      return ["nomor pelanggan", "nolg", "nomor langganan", "nom_langganan", "no langganan", "no pelanggan"];
    case "nama":
      return ["nama pelanggan", "nama langsung", "nama", "pemilik", "kategori pelanggan"];
    case "alamat":
      return ["alamat database", "alamat terpasang", "alamat lokasi", "alamat"];
    case "nosamb":
      return ["nosamb", "nosmb", "nomor nosamb"];
    case "telp":
      return ["notelp", "no telpon", "telepon", "nomor telpon"];
    case "wilDist":
      return ["pelayanan wilayah", "wilayah distribusi", "wilayah dist"];
    case "wilAdm":
      return ["wilayah administrasi", "wil administrasi"];
    case "namaKec":
      return ["kecamatan", "nama kec"];
    case "namaKel":
      return ["kelurahan", "nama kel", "desa"];
    case "lat":
      return ["titik koordinat (latitude)", "lintang", "latitude", "lat"];
    case "lng":
      return ["titik koordinat (longitude)", "bujur", "longitude", "lng", "longitude (bt)", "titik bujur"];
    case "tanggalSurvey":
      return ["tanggal survei", "tgl survei", "tanggal kunjungan"];
    default:
      return [];
  }
}

function resolveColumns(headerRowCells: unknown[]): Partial<Record<ColKey, number>> {
  const headers = headerRowCells.map((c, i) => String(c ?? "").trim() || `col_${i}`);
  const cols: Partial<Record<ColKey, number>> = { ...readForcedColumns(headers) };
  const optional: ColKey[] = ["nama", "alamat", "nosamb", "telp", "wilDist", "wilAdm", "namaKec", "namaKel", "lat", "lng", "tanggalSurvey"];

  cols.nolg ??= findColumnIndex(headers, synonymsFor("nolg"));
  for (const key of optional) {
    if (cols[key] !== undefined) continue;
    const ix = findColumnIndex(headers, synonymsFor(key));
    if (ix !== undefined) cols[key] = ix;
  }

  cols.nama ??= findColumnIndex(headers, synonymsFor("nama"));
  return cols;
}

function cellToNumber(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  let s = String(v).trim().replace(/\u2212/g, "-").replace(/\s+/g, " ");
  const commaDots = [...s.matchAll(/[,.]/gu)].length;
  if (commaDots > 1) s = s.replace(/,/g, "");
  else s = s.replace(/,/g, ".");
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function cellToString(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v.trim() || null;
  if (typeof v === "number") return String(v);
  return String(v).trim() || null;
}

function cellToNomorLangganan(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v))
    return v % 1 === 0 ? String(Math.round(v)) : String(v).trim();
  const s = String(v).trim();
  return s === "" ? null : s;
}

/** mWater sering tanpa kolom "Nama"; pakai nama/kategori lalu alamat, lalu fallback. */
function pickNamaDisplay(
  row: unknown[],
  cols: Partial<Record<ColKey, number>>,
  nlg: string,
): string {
  if (cols.nama !== undefined) {
    const t = cellToString(row[cols.nama]);
    if (t) return t.length > 200 ? `${t.slice(0, 197)}…` : t;
  }
  if (cols.alamat !== undefined) {
    const a = cellToString(row[cols.alamat]);
    if (a) return a.length > 160 ? `${a.slice(0, 157)}…` : a;
  }
  return `Pelanggan ${nlg}`;
}

function cellToMaybeDate(v: unknown): Date | null {
  if (v instanceof Date && !Number.isNaN(+v)) return v;
  if (typeof v === "number" && v > 20000 && v < 75000 && typeof XLSX.SSF?.parse_date_code === "function") {
    try {
      const d = XLSX.SSF.parse_date_code(v);
      if (d?.y != null) return new Date(Date.UTC(d.y, d.m - 1, d.d));
    } catch {
      /* ignore */
    }
  }
  const s = cellToString(v);
  if (!s) return null;
  const parsed = new Date(s);
  return Number.isNaN(+parsed) ? null : parsed;
}

function isLikelyLat(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/** Bandung sekitar: lat negatif, lng ~107. Jika baris tertukar X↔Y, perbaiki. */
function normalizeLatLngPair(lat: number, lng: number): [number, number] | null {
  if (isLikelyLat(lat, lng) && lng >= 95 && lng <= 115 && lat <= 0) return [lat, lng];
  if (isLikelyLat(lng, lat) && lat >= 95 && lat <= 115 && lng <= 0) return [lng, lat];
  if (isLikelyLat(lat, lng)) return [lat, lng];
  return null;
}

async function ensureServiceAreaWp5(): Promise<{ id: string }> {
  return prisma.serviceArea.upsert({
    where: { code: "WP5" },
    update: {},
    create: {
      code: "WP5",
      name: "Wilayah Pelayanan 5 — Kota Bandung",
    },
    select: { id: true },
  });
}

function defaultXlsxPath(workspaceRoot: string): string {
  const fromEnv = process.env.IMPORT_XLSX_PATH?.trim();
  if (fromEnv) return path.isAbsolute(fromEnv) ? fromEnv : path.resolve(process.cwd(), fromEnv);

  const nameDefault =
    process.env.IMPORT_XLSX_NAME ?? "Survei Pelanggan dan Potensi Pelayanan Wilayah 5 2025-11-10.xlsx";
  return path.join(workspaceRoot, "Data", nameDefault);
}

async function main(): Promise<void> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const workspaceRoot = path.resolve(__dirname, "..", "..", "..");
  const filePath = defaultXlsxPath(workspaceRoot);

  if (!fs.existsSync(filePath)) {
    console.error(
      `Berkas tidak ditemukan: ${filePath}\nTaruh .xlsx di folder Data/ atau set IMPORT_XLSX_PATH.`,
    );
    process.exitCode = 1;
    return;
  }

  const sheetIndex = Number.parseInt(process.env.IMPORT_SHEET_INDEX ?? "0", 10);
  const wb = XLSX.readFile(filePath, { cellDates: true });

  let sheetName = process.env.IMPORT_SHEET_NAME?.trim();
  if (!sheetName && Number.isFinite(sheetIndex) && sheetIndex >= 0 && sheetIndex < wb.SheetNames.length) {
    sheetName = wb.SheetNames[sheetIndex];
  }
  if (!sheetName) sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName!];
  if (!sheet) {
    console.error(`Sheet tidak ada: "${sheetName}".`);
    process.exitCode = 1;
    return;
  }

  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true }) as unknown[][];

  const headerRow1Based = Number.parseInt(process.env.IMPORT_HEADER_ROW ?? "1", 10);
  const headerIdx = Math.max(0, headerRow1Based - 1);

  const headerRow = matrix[headerIdx];
  if (!headerRow?.length) {
    console.error("Baris header kosong atau IMPORT_HEADER_ROW di luar rentang.");
    process.exitCode = 1;
    return;
  }

  const cols = resolveColumns(headerRow);

  if (cols.nolg === undefined) {
    console.error(
      "Tidak menemukan kolom penghubung pelanggan (mis. `Nomor Pelanggan`, `nolg`). Set IMPORT_COL_NOLG=JudulTepatPadaExcel.",
      cols,
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Berkas: ${filePath}`);
  console.log(`Sheet: "${sheetName}" — baris header: ${headerRow1Based}`);
  console.log("Kolom:", cols);

  const wp = await ensureServiceAreaWp5();
  let upsert = 0;
  let geoSet = 0;
  let skippedEmpty = 0;
  const GEO_SOURCE_TAG = path.basename(filePath).replace(/\s+/g, "_");

  for (let r = headerIdx + 1; r < matrix.length; r++) {
    const row = matrix[r];
    if (!row?.some((x) => x !== "" && x != null)) continue;

    const nlg = cellToNomorLangganan(row[cols.nolg!]);
    if (!nlg) {
      skippedEmpty++;
      continue;
    }

    const nama = pickNamaDisplay(row, cols, nlg);

    const latRaw = cols.lat !== undefined ? cellToNumber(row[cols.lat]) : null;
    const lngRaw = cols.lng !== undefined ? cellToNumber(row[cols.lng]) : null;

    let pair: [number, number] | null =
      latRaw != null && lngRaw != null ? normalizeLatLngPair(latRaw, lngRaw) : null;

    const hasGeo = pair !== null;
    if (hasGeo) geoSet++;

    const geoCaptured = cols.tanggalSurvey !== undefined ? cellToMaybeDate(row[cols.tanggalSurvey]) : null;

    const alamat = cols.alamat !== undefined ? cellToString(row[cols.alamat]) : null;
    const nosamb = cols.nosamb !== undefined ? cellToString(row[cols.nosamb]) : null;
    const nomorTelpon = cols.telp !== undefined ? cellToString(row[cols.telp]) : null;
    const wilayahDistNama = cols.wilDist !== undefined ? cellToString(row[cols.wilDist]) : null;
    const wilayahAdmNama = cols.wilAdm !== undefined ? cellToString(row[cols.wilAdm]) : null;
    const namaKec = cols.namaKec !== undefined ? cellToString(row[cols.namaKec]) : null;
    const namaKel = cols.namaKel !== undefined ? cellToString(row[cols.namaKel]) : null;

    const updatePayload: Parameters<typeof prisma.customer.upsert>[0]["update"] = {
      nama,
      alamat,
      nosamb,
      nomorTelpon,
      wilayahAdmNama: wilayahAdmNama ?? undefined,
      wilayahDistNama: wilayahDistNama ?? undefined,
      namaKec: namaKec ?? undefined,
      namaKel: namaKel ?? undefined,
    };

    const createPayload: Parameters<typeof prisma.customer.upsert>[0]["create"] = {
      serviceAreaId: wp.id,
      nomorLangganan: nlg,
      nama,
      alamat,
      nosamb,
      nomorTelpon,
      wilayahAdmNama: wilayahAdmNama ?? undefined,
      wilayahDistNama: wilayahDistNama ?? undefined,
      namaKec: namaKec ?? undefined,
      namaKel: namaKel ?? undefined,
    };

    if (hasGeo && pair) {
      const [la, ln] = pair;
      const latDec = new Prisma.Decimal(la.toFixed(8));
      const lngDec = new Prisma.Decimal(ln.toFixed(8));
      updatePayload.latitude = latDec;
      updatePayload.longitude = lngDec;
      updatePayload.geoSource = `survei-xlsx:${GEO_SOURCE_TAG}`;
      updatePayload.geoCapturedAt = geoCaptured;
      createPayload.latitude = latDec;
      createPayload.longitude = lngDec;
      createPayload.geoSource = `survei-xlsx:${GEO_SOURCE_TAG}`;
      createPayload.geoCapturedAt = geoCaptured;
    }

    await prisma.customer.upsert({
      where: { nomorLangganan: nlg },
      update: updatePayload,
      create: createPayload,
    });
    upsert++;
  }

  console.log(
    `Selesai. Baris di-upsert: ${upsert}. Dengan koordinat plausibel: ${geoSet}. Baris tanpa NL: ~${skippedEmpty}.`,
  );
  console.log("Popup & peta memakai data DB; geoSource menunjuk sumber impor (audit).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

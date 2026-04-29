/**
 * Mengimpor `Data/ProgresCater-PW5.csv` (separator `;`) ke `Customer` + `BillingPeriod` + `BillingPeriodMeterReading`.
 *
 * Catatan GIS:
 * - CSV menyimpan administrasi wilayah & bacameter — **tidak** menyimpan lat/lng; peta butuh gabung layer `.shp` atau geokoding alamat.
 * - Di folder `Data/` baru ada pemakai `.prj`/`.cpg` bentuk Titik Pelanggan; tanpa `.shp/.dbf/.shx` titik geografis tidak bisa dibaca langsung oleh skrip ini.
 *
 * Pemakaian (dari folder repo):
 *   pnpm db:import-catering
 *
 * Untuk lebih dari default (2500 baris pertama), atau seluruh file (~22k):
 *   IMPORT_LIMIT=all pnpm db:import-catering
 *
 * Lintasan berkas lain:
 *   IMPORT_CSV_PATH=Data/lain.csv pnpm db:import-catering
 */

import * as fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const prismaPkgDir = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(prismaPkgDir, "../.env"), override: true });

const prisma = new PrismaClient();

function stripBom(line: string): string {
  if (line.startsWith("\ufeff")) return line.slice(1);
  return line;
}

/** Nama kolom header CSV (trim + hapus BOM per sel — export menyisipkan U+FEFF di sel pertama). */
function headerCellKey(raw: string): string {
  return raw.replace(/\ufeff/gu, "").trim();
}

function parseYearMonth(cell: string | undefined): number | null {
  if (!cell) return null;
  const n = Number.parseInt(cell.trim(), 10);
  return Number.isFinite(n) ? n : null;
}

function decOrNull(cell: string | undefined): Prisma.Decimal | null {
  if (cell == null || cell.trim() === "") return null;
  const n = Number.parseFloat(cell.replace(",", "."));
  return Number.isFinite(n) ? new Prisma.Decimal(n.toFixed(8)) : null;
}

function intOrNull(cell: string | undefined): number | null {
  if (!cell?.trim()) return null;
  const n = Number.parseInt(cell.trim(), 10);
  return Number.isFinite(n) ? n : null;
}

function parseCsvDate(cell: string | undefined): Date | null {
  if (!cell?.trim()) return null;
  const d = new Date(cell.trim());
  return Number.isNaN(+d) ? null : d;
}

async function ensureServiceAreaWp5(): Promise<{ id: string }> {
  return prisma.serviceArea.upsert({
    where: { code: "WP5" },
    update: {},
    create: { code: "WP5", name: "Wilayah Pelayanan 5 — Kota Bandung" },
    select: { id: true },
  });
}

async function main(): Promise<void> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const workspaceRoot = path.resolve(__dirname, "..", "..", "..");
  const csvPath = process.env.IMPORT_CSV_PATH?.trim()
    ? path.resolve(process.cwd(), process.env.IMPORT_CSV_PATH!.trim())
    : path.join(workspaceRoot, "Data", "ProgresCater-PW5.csv");

  const limitEnv = process.env.IMPORT_LIMIT?.trim();
  let maxRows: number | null;
  if (!limitEnv) {
    maxRows = 2500;
  } else if (limitEnv.toLowerCase() === "all" || limitEnv.toLowerCase() === "full") {
    maxRows = null;
  } else {
    const n = Number.parseInt(limitEnv, 10);
    maxRows = Number.isFinite(n) ? n : 2500;
  }

  if (!fs.existsSync(csvPath)) {
    console.error(`Berkas tidak ada: ${csvPath}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Membaca: ${csvPath}`);
  if (maxRows == null) console.warn("Tanpa IMPORT_LIMIT — seluruh baris data (bisa beberapa menit).");

  /** Baca satu kali UTF-8 (file ~puluh MB masih aman dev). `readline` stream di Windows beberapa kasus baris pertama tidak tepat untuk header. */
  const fullText = stripBom(fs.readFileSync(csvPath, "utf8"));
  const allLines = fullText.split(/\r?\n/);
  let headerIdx = allLines.findIndex((l) => l.trim().length > 0);
  if (headerIdx < 0) {
    console.error("Berisi kosong.");
    process.exitCode = 1;
    return;
  }

  const indices: Record<string, number> = {};
  allLines[headerIdx].split(";").forEach((h, i) => {
    const key = headerCellKey(h);
    if (!(key in indices)) indices[key] = i;
  });
  console.log(`Header baris ke-${headerIdx + 1}; kolom unik (${Object.keys(indices).length}).`);

  if (indices.thbl === undefined || indices.nolg === undefined) {
    console.error("Judul kolom tidak punya `thbl` atau `nolg`. Sesuaikan file CSV Anda.");
    process.exitCode = 1;
    return;
  }

  const wp = await ensureServiceAreaWp5();

  let processed = 0;
  let skipped = 0;

  for (let li = headerIdx + 1; li < allLines.length; li++) {
    const line = allLines[li];
    if (!line.trim()) continue;

    const parts = line.split(";");
    const nolg = parts[indices.nolg!]?.trim();
    const namaCell = indices.nama !== undefined ? parts[indices.nama]?.trim() : undefined;

    const nama = namaCell ?? "?";
    if (!nolg) {
      skipped++;
      continue;
    }

    const ym = parseYearMonth(parts[indices.thbl!]);
    if (!ym) {
      skipped++;
      continue;
    }

    const periodRow = await prisma.billingPeriod.upsert({
      where: { yearMonth: ym },
      create: { yearMonth: ym },
      update: {},
    });

    const customer = await prisma.customer.upsert({
      where: { nomorLangganan: nolg },
      update: {
        nama,
        nosamb: parts[indices.nprs!]?.trim() || null,
        alamat: parts[indices.almt!]?.trim() || null,
        wilayahAdmCode: parts[indices.wiladmkode!]?.trim() || null,
        wilayahAdmNama: parts[indices.wiladmnama!]?.trim() || null,
        kdKec: parts[indices.kdkec!]?.trim() || null,
        namaKec: parts[indices.namakec!]?.trim() || null,
        kdKel: parts[indices.kdkel!]?.trim() || null,
        namaKel: parts[indices.namakel!]?.trim() || null,
        caterSectorCode: parts[indices.caterseksikode!]?.trim() || null,
        caterSectorNama: parts[indices.caterseksinama!]?.trim() || null,
        wilayahDistCode: parts[indices.wildistkode!]?.trim() || null,
        wilayahDistNama: parts[indices.wildistnama!]?.trim() || null,
        ruteCode: parts[indices.rute_kode!]?.trim() || null,
        zonaCode: parts[indices.zonakode!]?.trim() || null,
        nomorTelpon: parts[indices.notelp!]?.trim() || null,
        geoSource: "import-ProgresCater-PW5.csv",
      },
      create: {
        serviceAreaId: wp.id,
        nomorLangganan: nolg,
        nama,
        nosamb: parts[indices.nprs!]?.trim() || null,
        alamat: parts[indices.almt!]?.trim() || null,
        wilayahAdmCode: parts[indices.wiladmkode!]?.trim() || null,
        wilayahAdmNama: parts[indices.wiladmnama!]?.trim() || null,
        kdKec: parts[indices.kdkec!]?.trim() || null,
        namaKec: parts[indices.namakec!]?.trim() || null,
        kdKel: parts[indices.kdkel!]?.trim() || null,
        namaKel: parts[indices.namakel!]?.trim() || null,
        caterSectorCode: parts[indices.caterseksikode!]?.trim() || null,
        caterSectorNama: parts[indices.caterseksinama!]?.trim() || null,
        wilayahDistCode: parts[indices.wildistkode!]?.trim() || null,
        wilayahDistNama: parts[indices.wildistnama!]?.trim() || null,
        ruteCode: parts[indices.rute_kode!]?.trim() || null,
        zonaCode: parts[indices.zonakode!]?.trim() || null,
        nomorTelpon: parts[indices.notelp!]?.trim() || null,
        geoSource: "import-ProgresCater-PW5.csv",
      },
    });

    await prisma.billingPeriodMeterReading.upsert({
      where: {
        customerId_periodId: { customerId: customer.id, periodId: periodRow.id },
      },
      update: {
        standLalu: decOrNull(parts[indices.stml!]),
        standBaru: decOrNull(parts[indices.stma!]),
        pemakaianM3: decOrNull(parts[indices.pakai_drd!]),
        blokTarif: intOrNull(parts[indices.blok_m3!]),
        catatStatus: indices.ketcatat !== undefined ? parts[indices.ketcatat]?.trim() || null : null,
        pencatat: indices.pencatat !== undefined ? parts[indices.pencatat]?.trim() || null : null,
        tglCatat: parseCsvDate(indices.tglcatat !== undefined ? parts[indices.tglcatat] : undefined),
      },
      create: {
        customerId: customer.id,
        periodId: periodRow.id,
        standLalu: decOrNull(parts[indices.stml!]),
        standBaru: decOrNull(parts[indices.stma!]),
        pemakaianM3: decOrNull(parts[indices.pakai_drd!]),
        blokTarif: intOrNull(parts[indices.blok_m3!]),
        catatStatus: indices.ketcatat !== undefined ? parts[indices.ketcatat]?.trim() || null : null,
        pencatat: indices.pencatat !== undefined ? parts[indices.pencatat]?.trim() || null : null,
        tglCatat: parseCsvDate(indices.tglcatat !== undefined ? parts[indices.tglcatat] : undefined),
      },
    });

    processed++;
    if (processed % 2000 === 0) console.log(`… ${processed} baris`);

    if (maxRows != null && Number.isFinite(maxRows) && processed >= maxRows) {
      console.log(`Berhenti di IMPORT_LIMIT=${maxRows}`);
      break;
    }
  }

  console.log(`Selesai. Baris diproses: ${processed}. Dilewat kosong/err: ~${skipped}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * Mengisi kolom latitude/longitude untuk pelanggan WP5 **tanpa GPS** agar titik bisa tampil di /peta.
 *
 * Hanya penempatan pola spiral dari satu pusat Kota Bandung (**bukan** survei real). `geoSource` = scatter-auto untuk audit.
 * Untuk titik sah: pakai Excel survei / shapefile + skrip import resmi Anda.
 *
 *   pnpm db:auto-map-points
 *
 * Pisahkan ulang SEMUA WP5 yang sudah punya titik (+ timpa demo spiral):
 *   SCATTER_REPLACE=1 pnpm db:auto-map-points
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";
import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const prismaDir = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(prismaDir, "../.env"), override: true });

const prisma = new PrismaClient();

/** Sekitar Kota Bandung (WGS84). */
const CITY = { lat: -6.917_433, lng: 107.619_083 };

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function stable01(seed: string, salt: string): number {
  const s = `${seed}\0${salt}`;
  let h = 2_166_136_261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16_763_097);
  return Math.abs(h % 1_000_417) / 1_000_417;
}

function spiralLatLng(slot: number): { lat: number; lng: number } {
  let maxKm = Number.parseFloat(process.env.SCATTER_RADIUS_KM ?? "18");
  if (!Number.isFinite(maxKm) || maxKm <= 0) maxKm = 18;
  const rawDenom = Number.parseFloat((process.env.SCATTER_DENSITY ?? "23000").replace(/_/gu, ""));
  const denom = Number.isFinite(rawDenom) && rawDenom > 0 ? rawDenom : 23000;
  const rNorm = slot === 1 ? 0 : Math.min(1.0, Math.sqrt((slot + 99) / (denom + 99)));
  const theta = GOLDEN_ANGLE * slot;
  const rKm = rNorm * maxKm;
  const northKm = rKm * Math.cos(theta);
  const eastKm = rKm * Math.sin(theta);
  const phi = (CITY.lat * Math.PI) / 180;
  const lat = CITY.lat + northKm / 111.132;
  const lng = CITY.lng + eastKm / (111.132 * Math.max(0.3, Math.cos(phi)));
  return { lat, lng };
}

async function main(): Promise<void> {
  const replaceExisting = process.env.SCATTER_REPLACE === "1" || process.env.SCATTER_REPLACE === "true";

  const rows = await prisma.customer.findMany({
    where: replaceExisting
      ? { serviceArea: { code: "WP5" } }
      : {
          serviceArea: { code: "WP5" },
          AND: [{ latitude: null }, { longitude: null }],
        },
    select: { id: true, nomorLangganan: true },
    orderBy: { nomorLangganan: "asc" },
  });

  if (rows.length === 0) {
    console.log(
      replaceExisting ? "Tidak ada pelanggan WP5." : "Semua WP5 sudah punya lintang‑bujur — tidak ada yang kosong.",
    );
    return;
  }

  console.log(`Scatter ${rows.length} baris WP5 (replaceExisting=${replaceExisting}).`);

  const BATCH = 100;
  let done = 0;

  for (let b = 0; b < rows.length; b += BATCH) {
    const chunk = rows.slice(b, b + BATCH);

    await prisma.$transaction([
      ...chunk.map((row, k) => {
        const slot = b + k + 1;
        const { lat, lng } = spiralLatLng(slot);
        const micro =
          (stable01(row.nomorLangganan, "μ") - 0.5) * 0.000_45 + (stable01(row.nomorLangganan, "ν") - 0.5) * 0.000_45;
        const latF = lat + micro;
        const lngF = lng + micro * 0.95;

        return prisma.customer.update({
          where: { id: row.id },
          data: {
            latitude: new Prisma.Decimal(latF.toFixed(8)),
            longitude: new Prisma.Decimal(lngF.toFixed(8)),
            geoSource: "scatter-auto:spiral-bandung",
            geoCapturedAt: new Date(),
          },
        });
      }),
    ]);

    done += chunk.length;
    if (done % 2000 === 0 || done === rows.length) console.log(`… ${done}/${rows.length}`);
  }

  console.log("Selesai. Muat ulang /peta; geser-zoom ke kawasan Bandung bila tidak terlihat sekaligus.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

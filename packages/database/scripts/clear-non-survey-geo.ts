/**
 * Hapus titik palsu dari skrip spiral (`scatter-auto`) dan data demo (`seed-demo`).
 * Koordinat dari impor survei (`geoSource` berisi `survei-xlsx`) TIDAK dihapus — dipakai di /peta.
 *
 *   pnpm db:clear-non-survey-geo
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

const prismaDir = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(prismaDir, "../.env"), override: true });

const prisma = new PrismaClient();

async function main(): Promise<void> {
  /** PostgreSQL: ILIKE. Hanya scatter-auto & demo; titik survei (`survei-xlsx`) tidak tersentuh. */
  const n = await prisma.$executeRaw`
    UPDATE "Customer"
    SET "latitude" = NULL,
        "longitude" = NULL,
        "geoCapturedAt" = NULL,
        "geoSource" = NULL,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE "geoSource" ILIKE '%scatter-auto%' OR "geoSource" ILIKE '%seed-demo%';`;

  const count = typeof n === "bigint" ? Number(n) : typeof n === "number" ? n : 0;
  console.log(`Baris yang dikosongkan koordinat (scatter / seed demo): ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

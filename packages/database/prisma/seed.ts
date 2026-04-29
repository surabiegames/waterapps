/**
 * Data contoh lokasi Bandung untuk uji GIS (bukan produksi real).
 * Jalankan dari akar repo: `pnpm db:seed` (setelah `DATABASE_URL` + migrate).
 */

import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prismaDir = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(prismaDir, "../.env"), override: true });

const prisma = new PrismaClient();

/** Koordinat sekitar pusat Kota Bandung (WGS84) — titik berjauhan beberapa ratus meter. */
const DEMO_POINTS: ReadonlyArray<{
  nomorLangganan: string;
  nama: string;
  alamat: string;
  latitude: number;
  longitude: number;
}> = [
  { nomorLangganan: "DEMO-WP5-001", nama: "Contoh Pelanggan — Braga", alamat: "Jl. Braga (demo)", latitude: -6.917_08, longitude: 107.610_35 },
  { nomorLangganan: "DEMO-WP5-002", nama: "Contoh Pelanggan — Asia Afrika", alamat: "Jl. Asia Afrika (demo)", latitude: -6.921_02, longitude: 107.607_71 },
  { nomorLangganan: "DEMO-WP5-003", nama: "Contoh Pelanggan — Dalem Kaum", alamat: "Kaum (demo)", latitude: -6.922_71, longitude: 107.613_94 },
  { nomorLangganan: "DEMO-WP5-004", nama: "Contoh Pelanggan — Merdeka", alamat: "Jl. Merdeka (demo)", latitude: -6.912_94, longitude: 107.617_82 },
  { nomorLangganan: "DEMO-WP5-005", nama: "Contoh Pelanggan — Cihampelas", alamat: "Jl. Cihampelas (demo)", latitude: -6.894_71, longitude: 107.605_82 },
];

async function main(): Promise<void> {
  const serviceArea = await prisma.serviceArea.upsert({
    where: { code: "WP5" },
    update: {},
    create: {
      code: "WP5",
      name: "Wilayah Pelayanan 5 — Kota Bandung",
    },
  });

  for (const p of DEMO_POINTS) {
    await prisma.customer.upsert({
      where: { nomorLangganan: p.nomorLangganan },
      update: {
        nama: p.nama,
        alamat: p.alamat,
        latitude: p.latitude,
        longitude: p.longitude,
        geoSource: "seed-demo",
        serviceAreaId: serviceArea.id,
      },
      create: {
        serviceAreaId: serviceArea.id,
        nomorLangganan: p.nomorLangganan,
        nama: p.nama,
        alamat: p.alamat,
        latitude: p.latitude,
        longitude: p.longitude,
        nomorTelpon: "02200000001",
        geoSource: "seed-demo",
        wilayahAdmNama: "Kota Bandung",
        wilayahDistNama: "Barat 2",
        caterSectorCode: "C",
        zonaCode: "T04",
        namaKec: "Sumur Bandung",
        namaKel: "(demo)",
      },
    });
  }

  console.log(`Seed selesai: ${DEMO_POINTS.length} titik demo untuk ${serviceArea.code} (hapus atau ganti untuk data asli operasional).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

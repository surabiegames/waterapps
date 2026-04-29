/** Cetak semua judul kolom baris pertama (untuk mapping survei mWater). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as XLSX from "xlsx";

const fp = path.resolve(
  process.argv[2] ??
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../../Data/Survei Pelanggan dan Potensi Pelayanan Wilayah 5 2025-11-10.xlsx",
    ),
);

if (!fs.existsSync(fp)) {
  console.error("Tidak ada:", fp);
  process.exit(1);
}

const wb = XLSX.readFile(fp, { cellDates: true });
const sh = wb.Sheets[wb.SheetNames[0]];
const m = XLSX.utils.sheet_to_json(sh, { header: 1, defval: "" }) as unknown[][];
const h = (m[0] ?? []).map((c) => String(c ?? "").trim());

h.forEach((title, i) => {
  console.log(String(i).padStart(3), "|", title);
});

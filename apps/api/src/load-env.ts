import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Harus di-import sebelum `./db.js`: Prisma membaca `DATABASE_URL` saat modul client dimuat. */
if (process.env.NODE_ENV !== "production") {
  const srcDir = dirname(fileURLToPath(import.meta.url));
  config({ path: resolve(srcDir, "../../../packages/database/.env"), override: true });
}

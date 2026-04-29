/**
 * Membaca struktur SQLite (.sqlite) + me-parse shapefile menjadi GeoJSON sampel.
 * Jalankan: pnpm spatial:inspect
 */

import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { discoverTitikPelangganFiles } from "./lib/spatial-fs.js";

const workspaceRoot = path.resolve(fileURLToPath(new URL(import.meta.url)), "..", "..", "..");

async function sniffSqlite(sqlitePath: string): Promise<void> {
  const require = createRequire(import.meta.url);
  const wasmPath = require.resolve("sql.js/dist/sql-wasm.wasm");
  const wasmBinary = new Uint8Array(await fs.readFile(wasmPath));

  const initSqlJsMod = await import("sql.js");
  const initSqlJs = initSqlJsMod.default;
  type Database = import("sql.js").Database;

  const SQL = await initSqlJs({ wasmBinary });
  const filebuffer = await fs.readFile(sqlitePath);
  const db = new SQL.Database(filebuffer) as Database;

  console.log("\n—— SQLite:", sqlitePath);

  try {
    const res = db.exec(
      "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    );
    if (!res[0]?.values?.length) {
      console.log("(Tidak ada tabel atau file tidak valid.)");
      db.close();
      return;
    }

    const tables = res[0].values.map((r) => String(r[0]));
    console.log(`Jumlah tabel: ${tables.length}`);
    console.log(tables.slice(0, 30).join(", "));

    for (const t of tables.slice(0, 3)) {
      const escaped = t.replace(/"/g, '""');
      const sam = db.exec(`SELECT * FROM "${escaped}" LIMIT 2`);
      console.log(`\nSampel tabel "${t}":`);
      console.log(JSON.stringify(sam, null, 2).slice(0, 4000));
    }
  } finally {
    db.close();
  }
}

async function sniffShapefile(
  shpPaths: ReturnType<typeof discoverTitikPelangganFiles> extends infer T
    ? T extends { shpPaths: infer P }
      ? P
      : never
    : never,
): Promise<void> {
  const shp = shpPaths.shp;
  const dbf = shpPaths.dbf;
  if (!shp || !dbf) return;

  console.log("\n—— Shapefile (.shp+.dbf):");
  console.log("SHP:", shp);
  console.log("DBF:", dbf);

  const shpMod = await import("shpjs");
  const load = shpMod.default as (opts: {
    shp: Buffer;
    dbf: Buffer;
    prj?: Buffer;
    cpg?: Buffer;
  }) => Promise<GeoJSON.FeatureCollection>;

  const payload: Parameters<typeof load>[0] = {
    shp: await fs.readFile(shp),
    dbf: await fs.readFile(dbf),
  };
  if (shpPaths.prj) payload.prj = await fs.readFile(shpPaths.prj);
  if (shpPaths.cpg) payload.cpg = await fs.readFile(shpPaths.cpg);

  try {
    const fc = await load(payload);
    console.log(`Fitur: ${fc.features.length}, tipe: ${fc.type}`);
    const f0 = fc.features[0];
    console.log("\nFitur pertama — properties keys:", f0?.properties ? Object.keys(f0.properties) : []);
    console.log("Geometry:", f0?.geometry?.type, JSON.stringify(f0?.geometry).slice(0, 300));
  } catch (e) {
    console.error("Parse shapefile gagal:", e);
  }
}

async function main(): Promise<void> {
  const disco = discoverTitikPelangganFiles(workspaceRoot);
  if (!disco) {
    console.error("Folder Data/ tidak ditemukan di:", workspaceRoot);
    return;
  }

  console.log("Data dir:", disco.dataDir);
  console.log("SQLite:", disco.sqlitePaths.length ? disco.sqlitePaths.join(" | ") : "(tidak ditemukan berkas Titik *.sqlite)");

  if (disco.sqlitePaths[0]) {
    await sniffSqlite(disco.sqlitePaths[0]);
  }

  if (disco.shpPaths.shp && disco.shpPaths.dbf) {
    await sniffShapefile(disco.shpPaths);
  } else {
    console.log("\n(Belum ada sepasang Titik *.shp + *.dbf di Data/ atau nama tidak cocok pola.)");
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

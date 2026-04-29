/** Menemukan berkas titik di folder `Data/` (nama mengandung Titik, dll.). */

import fs from "node:fs";
import path from "node:path";

function findDataDir(workspaceRoot: string): string | null {
  for (const seg of ["Data", "data"]) {
    const d = path.join(workspaceRoot, seg);
    if (fs.existsSync(d) && fs.statSync(d).isDirectory()) return d;
  }
  return null;
}

export type SpatialCandidates = {
  dataDir: string;
  sqlitePaths: string[];
  shapefileStem: string | null;
  shpPaths: Partial<Record<"shp" | "dbf" | "prj" | "cpg" | "shx", string>>;
};

export function discoverTitikPelangganFiles(workspaceRoot: string): SpatialCandidates | null {
  const dataDir = findDataDir(workspaceRoot);
  if (!dataDir) return null;

  const entries = fs.readdirSync(dataDir);
  const sqlitePaths = entries
    .filter((e) => /\.(sqlite|db)$/i.test(e) && /titik/i.test(e))
    .map((e) => path.join(dataDir, e));

  const shpFile = entries.find((e) => /\.shp$/i.test(e) && /titik/i.test(e));
  const shpPaths: SpatialCandidates["shpPaths"] = {};
  let shapefileStem: string | null = null;

  if (shpFile) {
    shapefileStem = path.basename(shpFile, path.extname(shpFile));
    const lowerStem = shapefileStem.toLowerCase();
    for (const raw of entries) {
      const bn = path.basename(raw, path.extname(raw));
      if (bn.toLowerCase() !== lowerStem) continue;
      const ext = path.extname(raw).slice(1).toLowerCase();
      if (ext === "shp" || ext === "dbf" || ext === "prj" || ext === "cpg" || ext === "shx") {
        shpPaths[ext] = path.join(dataDir, raw);
      }
    }
  }

  return { dataDir, sqlitePaths, shapefileStem, shpPaths };
}

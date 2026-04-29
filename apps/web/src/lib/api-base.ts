/** Basis URL REST API — selalu lengkap dengan host + port untuk menghindari fetch relatif yang mengenai Next (404/500). */

function stripTrailingSlashes(raw: string): string {
  return raw.replace(/\/+$/, "");
}

/** Default dev: langsung ke Hono (:4000). Atur `NEXT_PUBLIC_API_URL` bila hostname/port lain. */
export function getPublicApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  const trimmed = typeof fromEnv === "string" ? fromEnv.trim() : "";
  // Baris seperti NEXT_PUBLIC_API_URL= (kosong) jangan sampai menghasilkan "" → fetch relatif mengenai port 3000.
  if (trimmed !== "") return stripTrailingSlashes(trimmed);

  return "http://127.0.0.1:4000";
}

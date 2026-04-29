import { SiteHeader } from "@/components/SiteHeader";

import { PetaMapLoader } from "./PetaMapLoader";

export default function PetaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <PetaMapLoader />
        <footer className="border-t border-slate-200 pt-4 text-xs text-slate-500">
          Titik peta butuh <code className="text-sky-800">latitude</code>/<code className="text-sky-800">longitude</code>{" "}
          atau gunakan <code className="rounded bg-slate-100 px-1 py-px">pnpm db:seed</code> (demo). Data operasional CSV
          di folder <code className="rounded bg-slate-100 px-1 py-px">Data/</code> bisa diimpor dengan{" "}
          <code className="rounded bg-slate-100 px-1 py-px">pnpm db:import-catering</code> (wilayah &amp; bacameter; lat/lng dari
          layer GIS lain).
        </footer>
      </div>
    </div>
  );
}

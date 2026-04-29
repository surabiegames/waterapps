import { SiteHeader } from "@/components/SiteHeader";

export default function DistribusiPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900">Modul Distribusi</h1>
        <p className="mt-2 text-slate-600">
          Siap dikembangkan untuk peta wilayah layanan (`wilayahDist`), zona hidran, KPI tekanan, dan SLA distribusi WP5.
        </p>
      </main>
    </div>
  );
}

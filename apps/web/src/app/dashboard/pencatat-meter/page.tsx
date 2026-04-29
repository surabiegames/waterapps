import { SiteHeader } from "@/components/SiteHeader";

export default function PencatatMeterPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900">Modul Pencatat Meter</h1>
        <p className="mt-2 text-slate-600">
          Selaras kolom ekspor seperti `stml`, `stma`, `pakai_drd`, rute catering, ketcatat, dan pemetaan wilayah cater.
        </p>
      </main>
    </div>
  );
}

import Link from "next/link";

import { SiteHeader } from "@/components/SiteHeader";

const tiles = [
  {
    href: "/dashboard/distribusi",
    title: "Distribusi",
    subtitle: "Peta layanan, zona, tekanan",
    accent: "from-cyan-500 to-sky-600",
  },
  {
    href: "/dashboard/pencatat-meter",
    title: "Pencatat Meter",
    subtitle: "Rute, catering, rekonsiliasi",
    accent: "from-sky-500 to-blue-600",
  },
  {
    href: "/dashboard/langganan",
    title: "Langganan",
    subtitle: "Master pelanggan & mutasi",
    accent: "from-blue-500 to-indigo-600",
  },
  {
    href: "/dashboard/rpm",
    title: "RPM",
    subtitle: "Rehab penjaringan & meter",
    accent: "from-teal-500 to-cyan-600",
  },
] as const;

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-10">
          <p className="text-sm font-medium text-sky-600">Wilayah Pelayanan 5</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Dashboard operasional</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Pilih modul untuk pengembangan fitur analitik dan inspeksi data. Backend API dan skema Prisma sudah
            diselaraskan dengan pembagian bagian ini.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {tiles.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 transition hover:ring-sky-300"
            >
              <div
                className={`absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-br ${t.accent} opacity-90 transition group-hover:opacity-100`}
                aria-hidden
              />
              <div className="relative">
                <h2 className="text-xl font-bold text-slate-900">{t.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{t.subtitle}</p>
                <span className="mt-4 inline-flex text-sm font-semibold text-sky-700 group-hover:underline">
                  Buka modul →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

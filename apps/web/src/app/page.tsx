import Link from "next/link";

import { SiteHeader } from "@/components/SiteHeader";

const modules = [
  {
    title: "Distribusi",
    desc: "Jaringan distribusi air, wilayah layanan & tekanan wilayah.",
    code: "distribusi",
  },
  {
    title: "Pencatat Meter",
    desc: "Jadwal bacameter, rute catering, rekonsiliasi stand & blok tarif.",
    code: "pencatat-meter",
  },
  {
    title: "Langganan",
    desc: "Data pelanggan, mutasi nosamb & administrasi wilayah pelayanan.",
    code: "langganan",
  },
  {
    title: "RPM",
    desc: "Rehab penjaringan & meter — work order & progress pekerjaan.",
    code: "rpm",
  },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50/40">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <section className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">Wilayah Pelayanan 5</p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Aplikasi layanan & analitik internal
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Monorepo terpadu: landing publik, dashboard operasional, API, dan skema database yang bisa diaudit dan
            berkembang sesuai kebutuhan tiap bagian.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-700"
            >
              Masuk dashboard
            </Link>
            <a
              href="#modul"
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-sky-300 hover:text-sky-800"
            >
              Lihat modul WP5
            </a>
          </div>
        </section>

        <section id="modul" className="grid gap-6 sm:grid-cols-2">
          {modules.map((m) => (
            <article
              key={m.code}
              className="rounded-2xl border border-sky-100 bg-white/90 p-6 shadow-sm ring-1 ring-sky-100/50"
            >
              <h2 className="mb-2 text-xl font-bold text-slate-900">{m.title}</h2>
              <p className="text-slate-600">{m.desc}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

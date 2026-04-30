import Link from "next/link";

import { SiteHeader } from "@/components/SiteHeader";
import { publicServices } from "@/lib/public-services";

export default function LayananPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Layanan Publik</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">Informasi Layanan PERUMDA TIRTAWENING</h1>
        <p className="mt-4 max-w-3xl text-slate-600">
          Pilih kategori layanan untuk melihat informasi detail, alur tindak lanjut, dan kanal komunikasi resmi.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {publicServices.map((item) => (
            <Link
              key={item.slug}
              href={`/layanan/${item.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-sky-300 hover:shadow-md"
            >
              <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              <span className="mt-4 inline-flex text-sm font-semibold text-sky-700">Lihat detail layanan →</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

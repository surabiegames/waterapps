import Link from "next/link";
import { AlertTriangle, CircleHelp, FilePlus2, MapPinned } from "lucide-react";

import { FaqAccordion } from "@/components/FaqAccordion";
import { SiteHeader } from "@/components/SiteHeader";
import { BentoGrid, BentoGridItem } from "@/components/ui/aceternity/bento-grid";
import { HoverBorderGradient } from "@/components/ui/aceternity/hover-border-gradient";
import { Spotlight } from "@/components/ui/aceternity/spotlight";
import { publicServices } from "@/lib/public-services";

const stats = [
  { label: "Jejak Layanan Digital", value: "Wilayah Pelayanan 5" },
  { label: "Fondasi Data Spasial", value: "PostGIS + GIS" },
  { label: "Unit KPI Operasional", value: "4 Unit Strategis" },
] as const;

const faq = [
  {
    q: "Apa fungsi utama platform ini?",
    a: "Platform ini digunakan untuk monitoring cakupan pelayanan air, titik sambungan pelanggan, dan KPI operasional lintas unit secara terintegrasi.",
  },
  {
    q: "Apakah informasi publik dan dashboard internal dipisahkan?",
    a: "Ya. Landing page ditujukan untuk informasi publik, sedangkan dashboard internal memiliki kontrol akses berbasis role dan unit kerja.",
  },
  {
    q: "Apakah sistem siap untuk pengembangan skala besar?",
    a: "Arsitektur dibangun modular agar mudah dikembangkan ke lebih banyak unit, wilayah, dan kebutuhan analitik operasional berikutnya.",
  },
] as const;

const roadmap = [
  {
    phase: "Phase 1",
    title: "Landing Page Publik",
    desc: "Informasi layanan, transparansi ringkas, FAQ, dan kanal kontak resmi.",
  },
  {
    phase: "Phase 2",
    title: "Dashboard Pencatat Meter",
    desc: "Monitoring progres bacameter, anomali, serta pekerjaan outstanding.",
  },
  {
    phase: "Phase 3",
    title: "Distribusi dan Integrasi Lintas Unit",
    desc: "KPI Distribusi, peta area prioritas, dan sinkronisasi data operasional.",
  },
] as const;

const contactChannels = [
  { label: "Call Center", value: "(022) 8600-8600", note: "Layanan jam kerja" },
  { label: "Email Resmi", value: "layanan@tirtawening.co.id", note: "Respon administrasi dan informasi layanan" },
  { label: "Alamat Kantor", value: "PERUMDA TIRTAWENING, Kota Bandung", note: "Jawa Barat, Indonesia" },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50/40 text-slate-900">
      <SiteHeader />
      <main>
        <section className="relative mx-auto max-w-6xl overflow-hidden px-4 pb-16 pt-14 sm:px-6">
          <Spotlight className="-top-16 left-0 md:left-48" fill="#0ea5e9" />
          <p className="mb-4 inline-flex rounded-full bg-sky-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
            Platform Digital Pelayanan Air Minum Kota Bandung
          </p>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
            Wajah Digital PERUMDA TIRTAWENING yang Powerful, Elegan, dan Berkelas
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-slate-600">
            Platform ini menegaskan komitmen transformasi layanan air minum Kota Bandung melalui informasi publik yang
            profesional dan infrastruktur data yang siap berkembang pada skala enterprise.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="#layanan"
              className="rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-700"
            >
              Jelajahi Layanan
            </Link>
            <a
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-sky-300 hover:text-sky-800"
              href="#kontak"
            >
              Hubungi Kami
            </a>
          </div>
        </section>

        <section className="border-y border-sky-100 bg-white/80">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6">
            {stats.map((s) => (
              <article key={s.label} className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{s.value}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="layanan" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Layanan Publik</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Halaman layanan terpisah untuk informasi yang lebih lengkap</h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              Setiap layanan memiliki halaman detail tersendiri agar pelanggan mendapatkan panduan yang jelas, terarah,
              dan mudah ditindaklanjuti.
            </p>
          </div>
          <BentoGrid>
            {publicServices.map((m) => (
              <Link key={m.slug} href={`/layanan/${m.slug}`} className="block">
                <BentoGridItem
                  title={m.title}
                  description={m.description}
                  className="scroll-mt-24"
                  icon={
                    m.slug === "cakupan-pelayanan" ? (
                      <MapPinned className="h-5 w-5" />
                    ) : m.slug === "sambungan-baru" ? (
                      <FilePlus2 className="h-5 w-5" />
                    ) : m.slug === "keluhan-gangguan" ? (
                      <AlertTriangle className="h-5 w-5" />
                    ) : (
                      <CircleHelp className="h-5 w-5" />
                    )
                  }
                />
              </Link>
            ))}
          </BentoGrid>
        </section>

        <section id="kpi" className="bg-slate-900 py-16 text-slate-100">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 sm:px-6">
            <article>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Fokus KPI Operasional</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Data operasional yang siap dipakai untuk keputusan cepat</h2>
              <p className="mt-3 text-slate-300">
                Dashboard mendukung pemantauan indikator utama secara konsisten, termasuk progres pekerjaan, cakupan
                data pelanggan, performa unit, dan status tindak lanjut operasional.
              </p>
            </article>
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">Distribusi: status gangguan dan cakupan layanan per wilayah.</div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">Pencatat Meter: progres bacameter, deviasi, dan pekerjaan outstanding.</div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">Langganan & RPM: kualitas data pelanggan dan pengendalian SLA lapangan.</div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Roadmap Digital</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Tahapan pengembangan platform</h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              Prioritas implementasi berfokus pada kebutuhan paling mendesak agar dampak langsung terasa pada layanan
              publik dan operasional internal.
            </p>
          </div>
          <div className="space-y-4">
            {roadmap.map((item) => (
              <article key={item.phase} className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">{item.phase}</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-slate-600">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">FAQ</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Pertanyaan yang sering ditanyakan</h2>
          </div>
          <FaqAccordion items={faq} />
        </section>

        <section id="kontak" className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Kontak Resmi</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Kanal komunikasi layanan PERUMDA TIRTAWENING</h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              Untuk informasi layanan, koordinasi operasional, dan kebutuhan komunikasi resmi, silakan gunakan kanal
              institusi berikut.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {contactChannels.map((item) => (
              <article key={item.label} className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">{item.label}</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{item.value}</p>
                <p className="mt-2 text-sm text-slate-600">{item.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="rounded-2xl bg-sky-700 p-8 text-white sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-100">Aksi Selanjutnya</p>
              <h2 className="mt-2 text-2xl font-bold">Akses dashboard unit untuk pemantauan operasional harian</h2>
            </div>
            <div className="mt-5 sm:mt-0">
              <HoverBorderGradient href="/dashboard">Buka Dashboard WP5</HoverBorderGradient>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-medium text-slate-700">© {new Date().getFullYear()} PERUMDA TIRTAWENING Kota Bandung.</p>
          <p>Platform Monitoring Layanan Air Minum - Wilayah Pelayanan 5</p>
        </div>
      </footer>
    </div>
  );
}

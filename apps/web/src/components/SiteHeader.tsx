import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-sky-200/80 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link href="/" className="flex flex-col gap-0.5 leading-tight">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">PERUMDA Tirtawening</span>
          <span className="text-lg font-bold text-slate-900">Kota Bandung</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <Link href="/" className="text-slate-600 transition hover:text-sky-700">
            Beranda
          </Link>
          <Link href="/peta" className="text-slate-600 transition hover:text-sky-700">
            Peta
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-sky-600 px-4 py-2 text-white shadow-sm transition hover:bg-sky-700"
          >
            Dashboard WP5
          </Link>
        </nav>
      </div>
    </header>
  );
}

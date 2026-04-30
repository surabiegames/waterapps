"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { publicServices } from "@/lib/public-services";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopServiceOpen, setDesktopServiceOpen] = useState(false);
  const [mobileServiceOpen, setMobileServiceOpen] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent): void {
      if (!desktopMenuRef.current) return;
      if (!desktopMenuRef.current.contains(event.target as Node)) {
        setDesktopServiceOpen(false);
      }
    }

    if (desktopServiceOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [desktopServiceOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-sky-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 leading-tight">
          <Image
            src="/tirtawening-logo-header.png"
            alt="Logo PERUMDA TIRTAWENING Kota Bandung"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
            priority
          />
          <span className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">PERUMDA Tirtawening</span>
            <span className="text-base font-bold text-slate-900">Kota Bandung</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-700 lg:flex">
          <div className="relative" ref={desktopMenuRef}>
            <button
              type="button"
              className="inline-flex items-center gap-1 transition hover:text-sky-700"
              onClick={() => setDesktopServiceOpen((v) => !v)}
              aria-expanded={desktopServiceOpen}
              aria-haspopup="menu"
            >
              Layanan
              <ChevronDown className={`h-4 w-4 transition ${desktopServiceOpen ? "rotate-180" : ""}`} />
            </button>
            {desktopServiceOpen ? (
              <div className="absolute left-0 top-full z-50 mt-2 max-h-80 w-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                {publicServices.map((item) => (
                  <Link
                    key={item.slug}
                    className="block rounded-xl p-3 hover:bg-sky-50"
                    href={`/layanan/${item.slug}`}
                    onClick={() => setDesktopServiceOpen(false)}
                  >
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-600">{item.description}</p>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <a href="#kpi" className="transition hover:text-sky-700">
            KPI
          </a>
          <a href="#faq" className="transition hover:text-sky-700">
            FAQ
          </a>
          <a href="#kontak" className="transition hover:text-sky-700">
            Kontak
          </a>
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 transition hover:bg-slate-100 lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-900/35"
            aria-label="Tutup menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-xs bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Menu Navigasi</span>
              <button
                type="button"
                className="rounded-md p-2 text-slate-700 transition hover:bg-slate-100"
                onClick={() => setMobileOpen(false)}
                aria-label="Tutup menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-2">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
                onClick={() => setMobileServiceOpen((v) => !v)}
              >
                Layanan
                <ChevronDown className={`h-4 w-4 transition ${mobileServiceOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileServiceOpen ? (
                <div className="space-y-1 border-l border-slate-200 pl-3">
                  {publicServices.map((item) => (
                    <Link
                      key={item.slug}
                      className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      href={`/layanan/${item.slug}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              ) : null}

              <a className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50" href="#faq" onClick={() => setMobileOpen(false)}>
                FAQ
              </a>
              <a className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50" href="#kontak" onClick={() => setMobileOpen(false)}>
                Kontak
              </a>
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}

# Aceternity UI Setup (Next.js + Tailwind)

Panduan ini untuk project `apps/web` di repository ini.

## 1) Prasyarat

- Next.js sudah aktif
- Tailwind CSS sudah aktif (project ini memakai Tailwind v4)

## 2) Install dependency Aceternity dasar

Jalankan dari `apps/web`:

```bash
pnpm add framer-motion clsx tailwind-merge lucide-react
```

Dependency di atas dipakai untuk:

- `framer-motion`: animasi komponen Aceternity
- `clsx` + `tailwind-merge`: helper `cn(...)` untuk className
- `lucide-react`: icon modern untuk section landing/dashboard

## 3) Tambahkan utility `cn`

Buat file `apps/web/src/lib/utils.ts`:

- export function `cn(...inputs)` memakai `clsx` + `tailwind-merge`

## 4) Tambahkan komponen Aceternity yang relevan

Untuk landing page PERUMDA, komponen awal paling relevan:

- `Spotlight` untuk hero section
- `BentoGrid` untuk section layanan 4 unit

File implementasi:

- `apps/web/src/components/ui/aceternity/spotlight.tsx`
- `apps/web/src/components/ui/aceternity/bento-grid.tsx`

## 5) Integrasikan ke landing page

File utama:

- `apps/web/src/app/page.tsx`

Pemakaian:

- Hero memakai `Spotlight`
- Section layanan memakai `BentoGrid` + `BentoGridItem`

## 6) Verifikasi

```bash
pnpm --filter web lint
pnpm --filter web dev
```

Lalu buka:

- `http://localhost:3000`

## 7) Rekomendasi komponen Aceternity berikutnya (untuk fase final landing)

- `TextGenerateEffect` untuk headline animasi halus
- `HoverBorderGradient` untuk CTA utama
- `TracingBeam` untuk section roadmap fase produk
- `InfiniteMovingCards` untuk testimoni/benefit list

Gunakan secukupnya agar UI tetap profesional, ringan, dan cepat.

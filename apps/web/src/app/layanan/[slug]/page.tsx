import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/SiteHeader";
import { publicServices } from "@/lib/public-services";

const serviceDetails: Record<
  string,
  {
    intro: string;
    bullets: string[];
    contactNote: string;
  }
> = {
  "cakupan-pelayanan": {
    intro:
      "Halaman ini menyajikan gambaran cakupan pelayanan aktif dan arah pengembangan wilayah layanan air minum secara ringkas.",
    bullets: [
      "Informasi area pelayanan aktif di wilayah operasional.",
      "Wilayah prioritas pengembangan dan peningkatan layanan.",
      "Arah penguatan data spasial untuk transparansi publik.",
    ],
    contactNote: "Untuk validasi wilayah layanan, silakan hubungi kanal resmi di halaman kontak.",
  },
  "sambungan-baru": {
    intro:
      "Halaman ini membantu pelanggan memahami proses pengajuan sambungan baru secara bertahap dan terstruktur.",
    bullets: [
      "Alur pendaftaran sambungan baru dari awal hingga verifikasi.",
      "Dokumen persyaratan yang perlu disiapkan pelanggan.",
      "Estimasi proses layanan sesuai standar operasional.",
    ],
    contactNote: "Tim layanan akan memberikan panduan lanjutan sesuai kondisi lokasi pelanggan.",
  },
  "keluhan-gangguan": {
    intro:
      "Halaman ini menjadi referensi utama pelanggan untuk pelaporan gangguan layanan dan pemantauan tindak lanjut.",
    bullets: [
      "Kanal pelaporan gangguan resmi yang dapat diakses pelanggan.",
      "Informasi status tindak lanjut secara bertahap.",
      "Komitmen standar waktu respons layanan.",
    ],
    contactNote: "Sertakan data lokasi dan nomor pelanggan agar penanganan lebih cepat.",
  },
  "faq-layanan": {
    intro: "Halaman ini merangkum pertanyaan umum pelanggan agar informasi layanan dapat diakses lebih cepat.",
    bullets: [
      "Pertanyaan umum seputar layanan air minum.",
      "Penjelasan ringkas terkait proses layanan pelanggan.",
      "Rujukan kontak resmi untuk kebutuhan lanjutan.",
    ],
    contactNote: "Jika pertanyaan belum terjawab, pelanggan dapat menghubungi call center resmi.",
  },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function LayananDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = publicServices.find((item) => item.slug === slug);
  const detail = serviceDetails[slug];

  if (!service || !detail) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <Link href="/layanan" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
          ← Kembali ke daftar layanan
        </Link>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">{service.title}</h1>
        <p className="mt-4 text-lg text-slate-600">{detail.intro}</p>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">Informasi Utama</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            {detail.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-2xl bg-sky-700 p-6 text-white">
          <h2 className="text-xl font-semibold">Catatan Layanan</h2>
          <p className="mt-2 text-sky-50">{detail.contactNote}</p>
          <Link
            href="/#kontak"
            className="mt-4 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
          >
            Lihat kontak resmi
          </Link>
        </section>
      </main>
    </div>
  );
}

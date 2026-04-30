import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "PERUMDA TIRTAWENING - Platform Monitoring Layanan Air Minum",
    template: "%s | PERUMDA TIRTAWENING",
  },
  description:
    "Platform digital PERUMDA TIRTAWENING untuk monitoring cakupan pelayanan air, titik sambungan pelanggan berbasis GIS, pengendalian NRW, dan KPI operasional lintas unit.",
  keywords: [
    "PERUMDA TIRTAWENING",
    "PDAM Kota Bandung",
    "monitoring layanan air minum",
    "GIS pelanggan",
    "dashboard operasional air minum",
    "pengendalian NRW",
    "wilayah pelayanan 5",
  ],
  openGraph: {
    title: "PERUMDA TIRTAWENING - Platform Monitoring Layanan Air Minum",
    description:
      "Landing page dan dashboard operasional untuk monitoring cakupan pelayanan air, titik sambungan GIS, dan KPI unit Distribusi, Pencatat Meter, Langganan, serta RPM.",
    url: "/",
    siteName: "PERUMDA TIRTAWENING",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PERUMDA TIRTAWENING - Platform Monitoring Layanan Air Minum",
    description:
      "Platform digital untuk monitoring layanan air minum Kota Bandung berbasis GIS dan KPI operasional lintas unit.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}

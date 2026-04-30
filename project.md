# Project PRD - PERUMDA TIRTAWENING Water Service Platform

## 1. Ringkasan Produk

Dokumen ini menjelaskan konsep, tujuan, ruang lingkup, serta tahapan implementasi aplikasi digital PERUMDA TIRTAWENING untuk monitoring layanan air minum Kota Bandung.

Platform dibangun untuk dua kebutuhan utama:

1. **Landing Page Publik** untuk informasi layanan pelanggan, transparansi data ringkas, dan kanal komunikasi resmi.
2. **Dashboard Internal Operasional** untuk monitoring cakupan pelayanan, titik sambungan pelanggan berbasis GIS, pengendalian NRW, serta pemantauan KPI per unit kerja:
   - Distribusi
   - Pencatat Meter
   - Langganan
   - RPM (Rehab Penjaringan Meter)

---

## 2. Latar Belakang

PERUMDA TIRTAWENING membutuhkan sistem terintegrasi yang dapat:

- Menyatukan data titik pelanggan dengan peta (GIS).
- Memberikan visibilitas kinerja tiap unit secara cepat.
- Mendukung pengambilan keputusan berbasis data operasional aktual.
- Meningkatkan kualitas informasi publik kepada pelanggan.

Saat ini data operasional cenderung tersebar dan belum seluruhnya tervisualisasi dalam satu dashboard terpadu. Hal ini berdampak pada kecepatan respon, monitoring lintas unit, dan konsistensi pelaporan KPI.

---

## 3. Visi, Misi, dan Nilai Produk

### Visi

Menjadi platform digital terpadu layanan air minum yang transparan, berbasis data, dan siap skala besar.

### Misi

- Menyediakan dashboard operasional GIS yang andal untuk seluruh unit.
- Meningkatkan efisiensi proses monitoring dan evaluasi KPI.
- Menyajikan informasi layanan publik yang profesional dan mudah diakses.

### Nilai Utama

- **Data-driven**
- **Transparan**
- **Cepat**
- **Akurat**
- **Scalable**

---

## 4. Tujuan Bisnis

1. Memantau cakupan layanan air secara berkala dan terukur.
2. Mengintegrasikan titik sambungan pelanggan dengan data GIS.
3. Mengendalikan indikator NRW melalui pemantauan area dan anomali.
4. Menstandarkan KPI operasional tiap unit agar evaluasi kinerja lebih objektif.
5. Meningkatkan kualitas layanan informasi publik melalui landing page profesional.

---

## 5. Sasaran Pengguna (User Roles)

### 5.1 Pengguna Internal

- **Super Admin**  
  Akses penuh lintas modul, pengaturan pengguna, konfigurasi sistem.

- **Admin Unit**  
  Akses penuh pada unit masing-masing untuk monitoring dan pengelolaan data operasional.

- **Staff Unit**  
  Akses terbatas berdasarkan tugas operasional harian unit.

- **Manajemen**  
  Akses monitoring lintas unit (read-only) untuk evaluasi kinerja dan keputusan strategis.

### 5.2 Pengguna Eksternal

- **Pelanggan/Publik**  
  Mengakses informasi layanan, edukasi, pembaruan ringkas, dan kanal kontak resmi.

---

## 6. Ruang Lingkup Produk

### 6.1 In-Scope

- Landing page publik profesional.
- Dashboard internal berbasis role dan unit.
- Integrasi data pelanggan dengan koordinat GIS.
- KPI per unit (Distribusi, Pencatat Meter, Langganan, RPM).
- Filter data berdasarkan waktu dan wilayah.
- Audit dasar aktivitas pengguna (phase lanjutan).

### 6.2 Out-of-Scope (Tahap Awal)

- Aplikasi mobile native.
- Integrasi billing payment gateway.
- Integrasi IoT/SCADA real-time penuh (kecuali data tersedia pada fase berikutnya).

---

## 7. Problem Statements

1. Informasi operasional belum terpusat dalam satu tampilan terpadu.
2. Sulit memantau capaian KPI per unit secara periodik.
3. Visualisasi titik pelanggan belum optimal untuk analisis spasial.
4. Informasi publik belum dikemas sebagai portal profesional yang konsisten.

---

## 8. Solusi Produk yang Diusulkan

### 8.1 Landing Page Publik

- Company profile digital PERUMDA TIRTAWENING.
- Informasi layanan, cakupan, dan kanal pengaduan/kontak.
- Seksi statistik ringkas dan update layanan.
- SEO-ready, responsif, dan performa cepat.

### 8.2 Dashboard Internal

- Sidebar dinamis berdasarkan role dan unit.
- Halaman KPI unit dengan kartu metrik, tren, dan status.
- Visualisasi peta titik pelanggan dengan filter area.
- Data table operasional dengan pencarian/filter.
- Endpoint agregasi KPI agar dashboard cepat dan stabil.

---

## 9. Kebutuhan Fungsional

### 9.1 Umum

- Login dan otorisasi berbasis role.
- Navigasi sidebar sesuai hak akses.
- Filter global (periode, wilayah, status).
- Export data dasar (CSV/Excel) untuk laporan unit.

### 9.2 Landing Page

- Hero section dengan value proposition.
- Fitur layanan utama.
- Statistik ringkas layanan.
- FAQ dan kontak resmi.
- Form CTA (mis. Hubungi Kami / Minta Informasi).

### 9.3 Modul Pencatat Meter

- KPI progres pencatatan meter.
- Daftar pelanggan belum tercatat.
- Monitoring anomali hasil catat meter.
- Status pekerjaan per petugas/periode.

### 9.4 Modul Distribusi

- KPI gangguan distribusi dan status tindak lanjut.
- Peta area layanan dan area prioritas.
- Ringkasan performa distribusi berdasarkan wilayah.

### 9.5 Modul Langganan

- Statistik pelanggan aktif/nonaktif.
- Pertumbuhan sambungan per periode.
- Kualitas data pelanggan (kelengkapan atribut/geo).

### 9.6 Modul RPM

- KPI work order (open/in-progress/closed).
- Monitoring SLA penyelesaian.
- Peta sebaran pekerjaan RPM.

---

## 10. Kebutuhan Non-Fungsional

- **Performa:** halaman utama dashboard dan landing page cepat dibuka.
- **Skalabilitas:** arsitektur modular untuk penambahan unit/fungsi.
- **Keamanan:** RBAC, validasi input, dan kontrol akses API.
- **Reliability:** monitoring service, logging error, backup DB.
- **Maintainability:** struktur kode modular dan dokumentasi standar.

---

## 11. Arsitektur Konseptual (Tingkat Tinggi)

- **Frontend:** Next.js (landing + dashboard web app).
- **API:** service modular per domain unit.
- **Database:** PostgreSQL + PostGIS.
- **Auth:** role-based access control (RBAC).
- **Infra lokal dev:** Docker untuk database.

---

## 12. KPI Produk dan Indikator Keberhasilan

### 12.1 KPI Produk

- Persentase data pelanggan dengan koordinat valid.
- Kecepatan akses dashboard (time-to-interactive).
- Tingkat adopsi pengguna internal per unit.
- Waktu respon monitoring issue per unit.

### 12.2 KPI Operasional Unit (Contoh Awal)

- **Pencatat Meter:** coverage pencatatan meter per periode.
- **Distribusi:** jumlah gangguan aktif vs selesai.
- **Langganan:** penambahan sambungan baru dan data tervalidasi.
- **RPM:** lead time penyelesaian WO.

---

## 13. Prioritas Pengerjaan (Sesuai Arahan)

Urutan prioritas awal:

1. **Landing Page Publik** (fokus pertama)
2. **Modul Pencatat Meter** (fokus kedua)
3. **Modul Distribusi**
4. **Modul lainnya** (Langganan, RPM, dan penguatan lintas unit)

---

## 14. Roadmap Implementasi Bertahap

## Phase 0 - Discovery dan Fondasi (Minggu 1)

**Tujuan:** menyamakan kebutuhan bisnis dan setup fondasi teknis.

Langkah:

1. Validasi KPI prioritas per unit bersama stakeholder.
2. Definisikan role dan permission matrix.
3. Finalisasi struktur data inti (pelanggan, lokasi, unit, aktivitas).
4. Setup baseline coding standard, environment, dan checklist quality.

Deliverable:

- Dokumen requirement final.
- Matrix role-access.
- Baseline schema data dan API contract awal.

---

## Phase 1 - Landing Page Profesional (Minggu 2-3) [PRIORITAS UTAMA]

**Tujuan:** menghadirkan wajah publik perusahaan yang modern, jelas, dan terpercaya.

Langkah:

1. Desain informasi arsitektur halaman (Home, Layanan, FAQ, Kontak).
2. Bangun section utama:
   - Hero + CTA
   - Statistik ringkas
   - Fitur layanan
   - FAQ
   - Kontak resmi
3. Implementasi komponen UI konsisten (berbasis shadcn/ui).
4. Optimasi SEO (metadata, OG tags, semantic structure).
5. Uji responsif desktop/tablet/mobile.

Deliverable:

- Landing page v1 production-ready.
- Konten publik terstruktur.
- Performance baseline (Lighthouse) terdokumentasi.

Acceptance Criteria:

- Halaman publik dapat diakses baik di mobile/desktop.
- Informasi inti layanan mudah dipahami.
- CTA dan kontak berfungsi dengan baik.

---

## Phase 2 - Dashboard Core dan Modul Pencatat Meter (Minggu 4-6) [PRIORITAS KEDUA]

**Tujuan:** menghadirkan dashboard internal pertama yang langsung dipakai operasional.

Langkah:

1. Implementasi autentikasi dasar + role-based sidebar.
2. Bangun dashboard shell:
   - Top KPI cards
   - Filter global
   - Tabel operasional
3. Implementasi modul Pencatat Meter:
   - KPI progres
   - Daftar outstanding
   - Anomali bacaan
4. Integrasi endpoint API agregasi metrik.
5. Uji fungsional dan validasi dengan user unit terkait.

Deliverable:

- Dashboard v1 internal.
- Modul Pencatat Meter aktif.
- Hak akses menu sesuai role.

Acceptance Criteria:

- User unit Pencatat Meter dapat login dan melihat data unit sendiri.
- KPI utama tampil akurat sesuai data sumber.
- Filter periode/wilayah berfungsi.

---

## Phase 3 - Modul Distribusi (Minggu 7-8)

**Tujuan:** menambahkan visibilitas kinerja Distribusi dan analisis area layanan.

Langkah:

1. Definisikan KPI Distribusi yang disepakati.
2. Bangun halaman Distribusi (cards + tabel + peta).
3. Implementasi status issue dan progres penyelesaian.
4. Integrasi data area prioritas untuk monitoring.

Deliverable:

- Modul Distribusi v1.
- Peta Distribusi dengan filter wilayah.

Acceptance Criteria:

- User Distribusi melihat KPI real-time periodik.
- Daftar issue dan progres dapat ditelusuri.

---

## Phase 4 - Modul Langganan dan RPM (Minggu 9-11)

**Tujuan:** melengkapi ekosistem dashboard lintas unit.

Langkah:

1. Implementasi dashboard Langganan:
   - Statistik pelanggan
   - Pertumbuhan sambungan
   - Kualitas data pelanggan
2. Implementasi dashboard RPM:
   - KPI work order
   - SLA dan backlog
   - Distribusi pekerjaan di peta
3. Sinkronisasi standar UI/UX antarmodul.

Deliverable:

- Modul Langganan v1.
- Modul RPM v1.

Acceptance Criteria:

- Manajemen bisa memantau ringkasan lintas unit.
- Tiap unit memiliki dashboard KPI minimal.

---

## Phase 5 - Hardening, Governance, dan Scale-Up (Minggu 12+)

**Tujuan:** memastikan sistem siap skala organisasi.

Langkah:

1. Implementasi audit trail terstruktur.
2. Optimasi query dan caching endpoint KPI.
3. Setup observability (error tracking, uptime, alerting).
4. Backup strategy dan SOP recovery.
5. Penguatan security review dan permission policy.

Deliverable:

- Platform siap perluasan pengguna/unit.
- Dokumen operasional produksi.

Acceptance Criteria:

- Stabil pada beban penggunaan yang meningkat.
- Monitoring dan tata kelola operasional berjalan.

---

## 15. Risiko dan Mitigasi

- **Kualitas data sumber belum konsisten**  
  Mitigasi: validasi data import, quality checks otomatis, dashboard data quality.

- **Perbedaan kebutuhan antar unit**  
  Mitigasi: workshop requirement per unit sebelum implementasi phase.

- **Scope creep saat implementasi**  
  Mitigasi: backlog terprioritas, change request gate per phase.

- **Adopsi pengguna rendah**  
  Mitigasi: libatkan user sejak awal, training ringkas, iterasi UX berdasarkan feedback.

---

## 16. Definisi Selesai per Phase (Definition of Done)

Satu phase dianggap selesai jika:

1. Fitur utama phase sudah sesuai acceptance criteria.
2. QA fungsional dasar lulus.
3. Tidak ada bug blocker.
4. Dokumentasi penggunaan ringkas tersedia.
5. Stakeholder unit terkait menyetujui hasil demo.

---

## 17. Backlog Awal (Actionable Next Steps)

### Sprint Berikutnya (langsung dikerjakan)

1. Finalisasi konten landing page (copywriting + data statistik publik).
2. Implementasi landing page v1 dengan komponen UI profesional.
3. Buat permission matrix detail role -> menu -> endpoint.
4. Bangun dashboard shell sebagai fondasi modul Pencatat Meter.

---

## 18. Penutup

PRD ini menjadi acuan utama pengembangan aplikasi PERUMDA TIRTAWENING tahap awal hingga siap skala besar. Fokus implementasi dimulai dari landing page publik yang profesional, kemudian berlanjut ke modul internal prioritas: Pencatat Meter, Distribusi, lalu unit lainnya.


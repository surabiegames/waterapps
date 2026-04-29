-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "DepartmentCode" AS ENUM ('DISTRIBUSI', 'PENCATAT_METER', 'LANGGANAN', 'RPM');

-- CreateTable
CREATE TABLE "ServiceArea" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "serviceAreaId" TEXT NOT NULL,
    "code" "DepartmentCode" NOT NULL,
    "displayName" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "serviceAreaId" TEXT NOT NULL,
    "nomorLangganan" TEXT NOT NULL,
    "nosamb" TEXT,
    "nama" TEXT NOT NULL,
    "alamat" TEXT,
    "wilayahAdmCode" TEXT,
    "wilayahAdmNama" TEXT,
    "wilayahDistCode" TEXT,
    "wilayahDistNama" TEXT,
    "caterSectorCode" TEXT,
    "caterSectorNama" TEXT,
    "ruteCode" TEXT,
    "zonaCode" TEXT,
    "kdKec" TEXT,
    "namaKec" TEXT,
    "kdKel" TEXT,
    "namaKel" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "nomorTelpon" TEXT,
    "geoSource" TEXT,
    "geoCapturedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingPeriod" (
    "id" SERIAL NOT NULL,
    "yearMonth" INTEGER NOT NULL,

    CONSTRAINT "BillingPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingPeriodMeterReading" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "periodId" INTEGER NOT NULL,
    "standLalu" DECIMAL(12,2),
    "standBaru" DECIMAL(12,2),
    "pemakaianM3" DECIMAL(12,4),
    "blokTarif" INTEGER,
    "catatStatus" TEXT,
    "pencatat" TEXT,
    "tglCatat" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "BillingPeriodMeterReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeterRehabilitationWork" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeterRehabilitationWork_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceArea_code_key" ON "ServiceArea"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Department_serviceAreaId_code_key" ON "Department"("serviceAreaId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_nomorLangganan_key" ON "Customer"("nomorLangganan");

-- CreateIndex
CREATE INDEX "Customer_longitude_latitude_idx" ON "Customer"("longitude", "latitude");

-- CreateIndex
CREATE INDEX "Customer_serviceAreaId_idx" ON "Customer"("serviceAreaId");

-- CreateIndex
CREATE UNIQUE INDEX "BillingPeriod_yearMonth_key" ON "BillingPeriod"("yearMonth");

-- CreateIndex
CREATE UNIQUE INDEX "BillingPeriodMeterReading_customerId_periodId_key" ON "BillingPeriodMeterReading"("customerId", "periodId");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingPeriodMeterReading" ADD CONSTRAINT "BillingPeriodMeterReading_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingPeriodMeterReading" ADD CONSTRAINT "BillingPeriodMeterReading_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "BillingPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeterRehabilitationWork" ADD CONSTRAINT "MeterRehabilitationWork_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

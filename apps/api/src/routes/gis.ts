import { Hono } from "hono";

import { prisma } from "../db.js";

import { clampLimit, parseBBox } from "../lib/bbox.js";
import { asNumber } from "../lib/serialize.js";

/** GeoJSON Point + properti minimal untuk layer peta & lookup detail. */
export const gisRoutes = new Hono();

gisRoutes.get("/customers/geojson", async (c) => {
  const bbox = parseBBox(c.req.query("bbox"));
  const serviceAreaCode = c.req.query("serviceAreaCode")?.trim() || undefined;
  const limit = clampLimit(c.req.query("limit"), 5_000, 20_000);

  if (!bbox) {
    return c.json(
      {
        error: "bbox_required",
        message:
          'Sertakan query bbox=minLng,minLat,maxLng,maxLat (EPSG:4326). Contoh wilayah Bandung: bbox=107.53,-7.04,107.71,-6.82',
      },
      400,
    );
  }

  const [minLng, minLat, maxLng, maxLat] = bbox;

  try {
    const serviceAreaWhere = serviceAreaCode
      ? { serviceArea: { is: { code: serviceAreaCode } } }
      : {};

    const rows = await prisma.customer.findMany({
      where: {
        ...serviceAreaWhere,
        latitude: { not: null },
        longitude: { not: null },
        AND: [
          { latitude: { gte: minLat, lte: maxLat } },
          { longitude: { gte: minLng, lte: maxLng } },
        ],
      },
      take: limit,
      select: {
        id: true,
        nomorLangganan: true,
        nama: true,
        alamat: true,
        wilayahDistNama: true,
        caterSectorCode: true,
        ruteCode: true,
        latitude: true,
        longitude: true,
      },
      orderBy: { nomorLangganan: "asc" },
    });

    return c.json({
      type: "FeatureCollection" as const,
      features: rows.map((r) => {
        const lat = asNumber(r.latitude)!;
        const lng = asNumber(r.longitude)!;
        return {
          type: "Feature" as const,
          id: r.id,
          geometry: {
            type: "Point" as const,
            coordinates: [lng, lat],
          },
          properties: {
            customerId: r.id,
            nomorLangganan: r.nomorLangganan,
            nama: r.nama,
            alamat: r.alamat,
            wilayahDistribusi: r.wilayahDistNama,
            caterSectorCode: r.caterSectorCode,
            ruteCode: r.ruteCode,
            detailHref: `/v1/gis/customers/${r.id}/detail`,
          },
        };
      }),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "database_unavailable";
    return c.json({ error: message }, 503);
  }
});

gisRoutes.get("/customers/:id/detail", async (c) => {
  const id = c.req.param("id");
  try {
    const [row, openRpmCount] = await Promise.all([
      prisma.customer.findUnique({
        where: { id },
        include: {
          serviceArea: { select: { code: true, name: true } },
          readings: {
            orderBy: { period: { yearMonth: "desc" } },
            take: 1,
            include: {
              period: { select: { id: true, yearMonth: true } },
            },
          },
        },
      }),
      prisma.meterRehabilitationWork.count({
        where: { customerId: id, status: "OPEN" },
      }),
    ]);

    if (!row) {
      return c.json({ error: "not_found" }, 404);
    }

    const last = row.readings[0];

    return c.json({
      id: row.id,
      nomorLangganan: row.nomorLangganan,
      nosamb: row.nosamb,
      nama: row.nama,
      alamat: row.alamat,
      nomorTelpon: row.nomorTelpon,
      wilayahAdministrasi: { code: row.wilayahAdmCode, nama: row.wilayahAdmNama },
      wilayahDistribusi: { code: row.wilayahDistCode, nama: row.wilayahDistNama },
      cater: { code: row.caterSectorCode, nama: row.caterSectorNama },
      zona: row.zonaCode,
      rute: row.ruteCode,
      wilayahKecKel: {
        kdKec: row.kdKec,
        namaKec: row.namaKec,
        kdKel: row.kdKel,
        namaKel: row.namaKel,
      },
      geo: {
        latitude: asNumber(row.latitude),
        longitude: asNumber(row.longitude),
        source: row.geoSource,
        capturedAt: row.geoCapturedAt?.toISOString() ?? null,
      },
      serviceArea: row.serviceArea,
      lastBillingPeriodMeterReading: last
        ? {
            yearMonth: last.period.yearMonth,
            standLalu: asNumber(last.standLalu),
            standBaru: asNumber(last.standBaru),
            pemakaianM3: asNumber(last.pemakaianM3),
            blokTarif: last.blokTarif,
            catatStatus: last.catatStatus,
            pencatat: last.pencatat,
            tglCatat: last.tglCatat?.toISOString() ?? null,
          }
        : null,
      rpm: { openWorkOrderCount: openRpmCount },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "database_unavailable";
    return c.json({ error: message }, 503);
  }
});

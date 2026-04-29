import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { prisma } from "./db.js";

import { gisRoutes } from "./routes/gis.js";

const app = new Hono();

app.use("/*", cors({ origin: "*" }));

app.get("/health", (c) =>
  c.json({ ok: true, service: "tirtawening-wp5-api", timestamp: new Date().toISOString() }),
);

app.get("/v1/modules", (c) =>
  c.json({
    wilayahPelayanan: "WP5",
    modules: [
      { code: "DISTRIBUSI", path: "/v1/distribusi" },
      { code: "PENCATAT_METER", path: "/v1/pencatat-meter" },
      { code: "LANGGANAN", path: "/v1/langganan" },
      { code: "RPM", path: "/v1/rpm" },
      { code: "GIS", path: "/v1/gis" },
    ],
  }),
);

app.route("/v1/gis", gisRoutes);

app.get("/v1/langganan/stats", async (c) => {
  try {
    const [customerCount, rpmOpen, withGeo] = await Promise.all([
      prisma.customer.count(),
      prisma.meterRehabilitationWork.count({ where: { status: "OPEN" } }),
      prisma.customer.count({
        where: {
          AND: [{ latitude: { not: null } }, { longitude: { not: null } }],
        },
      }),
    ]);
    return c.json({ customerCount, rpmWorkOrdersOpen: rpmOpen, customersWithGeoPoint: withGeo });
  } catch (e) {
    const message = e instanceof Error ? e.message : "database_unavailable";
    return c.json({ error: message, hint: "Set DATABASE_URL and run prisma migrate" }, 503);
  }
});

const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});

import { Hono } from "hono";
import { describe, expect, it } from "vitest";

import { gisRoutes } from "./gis.js";

const app = new Hono();
app.route("/v1/gis", gisRoutes);

describe("GIS GeoJSON", () => {
  it("requires bbox", async () => {
    const res = await app.request("http://localhost/v1/gis/customers/geojson");
    expect(res.status).toBe(400);
    const j = (await res.json()) as { error?: string };
    expect(j.error).toBe("bbox_required");
  });

  it("returns FeatureCollection for Bandung viewport", async () => {
    const res = await app.request(
      "http://localhost/v1/gis/customers/geojson?bbox=107.53,-7.04,107.71,-6.82&limit=100",
    );
    expect(res.status).toBe(200);
    const j = (await res.json()) as {
      type: string;
      features: Array<{ type?: string; geometry?: { type?: string; coordinates?: unknown } }>;
    };
    expect(j.type).toBe("FeatureCollection");
    expect(Array.isArray(j.features)).toBe(true);
    expect(j.features.length).toBeGreaterThanOrEqual(1);
    for (const f of j.features) {
      expect(f.type).toBe("Feature");
      expect(f.geometry).toEqual(
        expect.objectContaining({ type: "Point", coordinates: expect.any(Array) }),
      );
    }
  });
});

"use client";

import maplibregl from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

import { getPublicApiBase } from "@/lib/api-base";

import { useCallback, useEffect, useRef, useState } from "react";

const LAYER_POINTS = "peta-pelanggan-points";

type DetailResponse =
  | { error: string }
  | {
      id: string;
      nama: string;
      nomorLangganan: string;
      nosamb: string | null;
      alamat: string | null;
      nomorTelpon: string | null;
      wilayahAdministrasi: { code: string | null; nama: string | null };
      wilayahDistribusi: { code: string | null; nama: string | null };
      cater: { code: string | null; nama: string | null };
      zona: string | null;
      rute: string | null;
      wilayahKecKel: Record<string, string | null>;
      geo: {
        latitude: number | null;
        longitude: number | null;
        source: string | null;
        capturedAt: string | null;
      };
      serviceArea: { code: string; name: string };
      lastBillingPeriodMeterReading: {
        yearMonth: number;
        standLalu: number | null;
        standBaru: number | null;
        pemakaianM3: number | null;
        blokTarif: number | null;
        catatStatus: string | null;
      } | null;
      rpm: { openWorkOrderCount: number };
    };

function escHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => {
    const m: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return m[ch] ?? ch;
  });
}

async function fetchDetail(customerId: string, signal?: AbortSignal): Promise<DetailResponse> {
  const base = getPublicApiBase();
  const res = await fetch(`${base}/v1/gis/customers/${encodeURIComponent(customerId)}/detail`, {
    signal,
    cache: "no-store",
  });
  if (!res.ok) {
    return { error: `${res.status} ${res.statusText}` };
  }
  return res.json() as Promise<DetailResponse>;
}

function formatDetailPopup(d: Extract<DetailResponse, { nama: string }>): string {
  const last = d.lastBillingPeriodMeterReading;
  const pemakaian = last?.pemakaianM3 ?? null;
  const wa = [d.wilayahAdministrasi?.nama, d.wilayahAdministrasi?.code].filter(Boolean).join(" — ");
  const dist = [d.wilayahDistribusi?.nama, d.wilayahDistribusi?.code].filter(Boolean).join(" ");
  const kecKel = [
    d.wilayahKecKel.namaKec,
    d.wilayahKecKel.namaKel ? `Kel. ${d.wilayahKecKel.namaKel}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return `
    <div class="wm-popup">
      <p class="wm-popup-title">${escHtml(d.nama)}</p>
      <p class="wm-muted">${escHtml(d.nomorLangganan)} · nosamb ${escHtml(d.nosamb ?? "—")}</p>
      <p>${escHtml(d.alamat ?? "—")}</p>
      <p>${d.nomorTelpon ? `📞 ${escHtml(d.nomorTelpon)} · ` : ""}RPM WO open: ${d.rpm.openWorkOrderCount}</p>
      <p class="wm-muted">Administrasi: ${escHtml(wa || "—")}</p>
      <p class="wm-muted">Distribusi: ${escHtml(dist || "—")} · Cater: ${escHtml(d.cater.nama ?? d.cater.code ?? "—")} · ${escHtml(d.rute ?? "—")}</p>
      <p class="wm-muted">Kec/Kel: ${escHtml(kecKel || "—")}</p>
      <p class="wm-muted">WP: ${escHtml(d.serviceArea.code)} — ${escHtml(d.serviceArea.name)}</p>
      <p class="wm-muted">Koordinat: ${d.geo.latitude ?? "—"}, ${d.geo.longitude ?? "—"}</p>
      <p>Pemakaian terakhir (m³): ${pemakaian != null ? escHtml(String(pemakaian)) : "—"}</p>
    </div>
  `;
}

function formatPropsBlock(props: Record<string, unknown>): string {
  const nama = typeof props.nama === "string" ? props.nama : "?";
  const nl = typeof props.nomorLangganan === "string" ? props.nomorLangganan : "";
  const addr = props.alamat != null ? String(props.alamat) : "";
  return `
      <p class="wm-popup-title">${escHtml(nama)}</p>
      <p class="wm-muted">${escHtml(nl)}</p>
      ${addr ? `<p>${escHtml(addr)}</p>` : ""}`;
}

function formatPreviewLoading(props: Record<string, unknown>): string {
  return `
    <div class="wm-popup">
      ${formatPropsBlock(props)}
      <p class="wm-muted">Memuat detail …</p>
    </div>
  `;
}

function formatPreviewError(props: Record<string, unknown>, msg: string): string {
  return `
    <div class="wm-popup">
      ${formatPropsBlock(props)}
      <p class="wm-muted">${escHtml(msg)}</p>
    </div>
  `;
}

export default function PetaMap() {
  const rootRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const detailAbortRef = useRef<AbortController | null>(null);

  const [status, setStatus] = useState<string>("Inisialisasi peta …");
  const [featCount, setFeatCount] = useState<number | null>(null);
  const [apiBaseShown, setApiBaseShown] = useState<string>("");

  useEffect(() => {
    setApiBaseShown(getPublicApiBase());
  }, []);

  const loadFeatures = useCallback((map: maplibregl.Map, quiet = false) => {
    if (!quiet) setStatus("Mengambil titik dalam bbox …");
    const bounds = map.getBounds();
    const qs = new URLSearchParams({
      bbox: `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`,
      limit: "20000",
    });
    fetch(`${getPublicApiBase()}/v1/gis/customers/geojson?${qs.toString()}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { message?: string };
          const hint = j.message ? ` — ${j.message}` : "";
          throw new Error(`${res.status} ${res.statusText}${hint}`);
        }
        return res.json() as Promise<GeoJSON.FeatureCollection>;
      })
      .then((fc) => {
        const src = map.getSource("pelanggan") as maplibregl.GeoJSONSource | undefined;
        if (src) src.setData(fc as GeoJSON.GeoJSON);
        const n = Array.isArray(fc.features) ? fc.features.length : 0;
        setFeatCount(n);
        setStatus(
          n === 0
            ? "Tiada titik dengan koordinat dalam layar (isi lat/lng di DB untuk uji)."
            : `Tampil ${n} titik`,
        );
      })
      .catch((e: Error) => {
        setFeatCount(null);
        setStatus(`Gagal memuat GeoJSON: ${e.message}`);
      });
  }, []);

  useEffect(() => {
    if (!rootRef.current || mapRef.current) return undefined;

    const map = new maplibregl.Map({
      container: rootRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [107.62, -6.9175],
      zoom: 13,
      maxPitch: 0,
    });

    popupRef.current = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: "340px",
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.once("load", () => {
      map.addSource("pelanggan", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: LAYER_POINTS,
        type: "circle",
        source: "pelanggan",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 3, 16, 9],
          "circle-color": "#0284c7",
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.92,
        },
      });

      loadFeatures(map, true);

      debounceRef.current = undefined;
      map.on("moveend", () => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => loadFeatures(map), 400);
      });

      map.on("mouseenter", LAYER_POINTS, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", LAYER_POINTS, () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", LAYER_POINTS, (e) => {
        const f = e.features?.[0];
        const lngLat = e.lngLat;
        if (!f || !lngLat) return;
        const props = (f.properties ?? {}) as Record<string, unknown>;
        const cid = typeof props.customerId === "string" ? props.customerId : null;

        const popup = popupRef.current!;
        detailAbortRef.current?.abort();

        popup.setLngLat(lngLat)
          .setHTML(
            cid
              ? formatPreviewLoading(props)
              : `<div class="wm-popup"><p class="wm-muted">${escHtml("Tanpa customerId pada fitur GeoJSON.")}</p></div>`,
          )
          .addTo(map);

        if (!cid) return;

        const ac = new AbortController();
        detailAbortRef.current = ac;

        void fetchDetail(cid, ac.signal)
          .then((d) => {
            if ("error" in d) {
              popup.setHTML(formatPreviewError(props, d.error));
              return;
            }
            popup.setHTML(formatDetailPopup(d));
          })
          .catch((err: Error) => {
            if (err.name === "AbortError") return;
            popup.setHTML(formatPreviewError(props, err.message));
          });
      });
    });

    mapRef.current = map;

    const onResize = (): void => {
      map.resize();
    };
    window.addEventListener("resize", onResize);

    return () => {
      detailAbortRef.current?.abort();
      window.removeEventListener("resize", onResize);
      clearTimeout(debounceRef.current);
      popupRef.current?.remove();
      popupRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [loadFeatures]);

  return (
    <div className="flex min-h-[min(560px,calc(100vh-8rem))] flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-end justify-between gap-2 px-4 text-sm sm:px-0">
        <div>
          <p className="font-medium text-slate-900">Bukti konsep MapLibre</p>
          <p className="max-w-xl text-xs text-slate-600">
            Saat Anda menggeser atau mem-zoom, kotak pandang menjadi query{" "}
            <code className="rounded bg-slate-100 px-1">{`bbox`}</code> ke GeoJSON dari API backend.
          </p>
          {apiBaseShown !== "" ? (
            <p className="mt-2 max-w-xl break-all font-mono text-[11px] text-sky-700">
              {apiBaseShown}
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">{status}</p>
          {featCount != null ? <p className="font-mono text-xs text-slate-700">{featCount} fitur</p> : null}
        </div>
      </div>
      <div
        ref={rootRef}
        className="relative min-h-[440px] w-full flex-1 overflow-hidden rounded-xl border border-slate-200 bg-sky-50 shadow-inner"
      />
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";

export const PetaMapLoader = dynamic(() => import("@/components/maps/PetaMap"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[480px] flex-1 flex-col justify-center rounded-xl border border-dashed border-slate-300 bg-white/60 px-8 text-center text-sm text-slate-600">
      Memuat kontrol peta…
    </div>
  ),
});

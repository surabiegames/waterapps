"use client";

import { ChevronDown } from "lucide-react";

type Item = {
  q: string;
  a: string;
};

type FaqAccordionProps = {
  items: readonly Item[];
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <details key={item.q} className="group rounded-xl border border-slate-200 bg-white p-5 open:border-sky-300">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
            <span>{item.q}</span>
            <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180 group-open:text-sky-600" />
          </summary>
          <p className="mt-3 text-slate-600">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

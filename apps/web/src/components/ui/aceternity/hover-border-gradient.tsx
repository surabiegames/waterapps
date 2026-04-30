"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type HoverBorderGradientProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function HoverBorderGradient({ href, children, className }: HoverBorderGradientProps) {
  return (
    <Link href={href} className={cn("group relative inline-flex items-center justify-center rounded-xl p-[1px]", className)}>
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 opacity-70 blur-[2px] transition group-hover:opacity-100"
        initial={{ opacity: 0.7 }}
        whileHover={{ opacity: 1 }}
      />
      <span className="relative rounded-[11px] bg-white px-5 py-3 text-sm font-semibold text-sky-700 transition group-hover:bg-sky-50">
        {children}
      </span>
    </Link>
  );
}

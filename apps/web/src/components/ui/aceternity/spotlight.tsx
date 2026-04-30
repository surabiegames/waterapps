"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type SpotlightProps = {
  className?: string;
  fill?: string;
};

export function Spotlight({ className, fill = "white" }: SpotlightProps) {
  return (
    <motion.svg
      className={cn(
        "pointer-events-none absolute z-[1] h-[169%] w-[138%] opacity-0 mix-blend-soft-light",
        className,
      )}
      fill="none"
      initial={{ opacity: 0, x: -72, y: -56 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 1.4, ease: "easeInOut" }}
      viewBox="0 0 3787 2842"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          fill={fill}
          fillOpacity="0.22"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.8 -0.59 -0.59 0.8 3722.62 2646.32)"
        />
      </g>
      <defs>
        <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="2841.3" id="filter" width="3786.16" x="0.860352" y="0.838989">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
          <feGaussianBlur result="effect1_foregroundBlur_1065_8" stdDeviation="151" />
        </filter>
      </defs>
    </motion.svg>
  );
}

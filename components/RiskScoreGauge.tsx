"use client";

import { useMemo } from "react";

type RiskScoreGaugeProps = {
  score: number; // 0–100
};

export function RiskScoreGauge({ score }: RiskScoreGaugeProps) {
  const clamped = Math.min(100, Math.max(0, score));

  const { color, label } = useMemo(() => {
    if (clamped >= 75) return { color: "#ef4444", label: "CRITICAL" }; // red-500
    if (clamped >= 50) return { color: "#f59e0b", label: "HIGH" };     // amber-500
    if (clamped >= 25) return { color: "#22d3ee", label: "MEDIUM" };   // cyan-400
    return { color: "#4ade80", label: "LOW" };                          // green-400
  }, [clamped]);

  // SVG arc math
  const radius = 52;
  const circumference = Math.PI * radius; // half-circle arc length
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative w-[140px] h-[80px] overflow-hidden">
        <svg
          viewBox="0 0 120 70"
          width="140"
          height="80"
          className="overflow-visible"
        >
          {/* Background track */}
          <path
            d="M 10 60 A 52 52 0 0 1 110 60"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Animated score arc */}
          <path
            d="M 10 60 A 52 52 0 0 1 110 60"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              filter: `drop-shadow(0 0 6px ${color})`,
              transition: "stroke-dashoffset 0.8s ease-out, stroke 0.5s ease",
            }}
          />
          {/* Score text */}
          <text
            x="60"
            y="58"
            textAnchor="middle"
            fill="white"
            fontSize="18"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {clamped}%
          </text>
        </svg>
      </div>
      <span
        className="text-xs font-mono font-bold tracking-widest uppercase"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}

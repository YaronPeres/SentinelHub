"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ThreatTrendChartProps = {
  data: { date: string; count: number }[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-cyan-500/30 rounded-md px-3 py-2 font-mono text-xs">
        <p className="text-cyan-400 font-bold">{label}</p>
        <p className="text-white">{payload[0].value} threats</p>
      </div>
    );
  }
  return null;
}

export function ThreatTrendChart({ data }: ThreatTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.04)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#22d3ee"
          strokeWidth={2}
          fill="url(#threatGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "#22d3ee", stroke: "#000", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

"use client";

import dynamic from "next/dynamic";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Target, ShieldAlert, Activity, Globe, TrendingUp } from "lucide-react";
import { RiskScoreGauge } from "@/components/RiskScoreGauge";
import type { LiveMarker } from "@/components/GeoHeatmap";

// Dynamically load heavy chart components — performance-optimizer
const ThreatTrendChart = dynamic(
  () => import("@/components/ThreatTrendChart").then((m) => m.ThreatTrendChart),
  { ssr: false }
);
const GeoHeatmap = dynamic(
  () => import("@/components/GeoHeatmap").then((m) => m.GeoHeatmap),
  { ssr: false }
);

const PIE_COLORS = ["#22d3ee", "#a855f7", "#fbbf24", "#f87171"]; // cyan-400, purple-400, amber-400, red-400

type ChartProps = {
  data: {
    humanErrorCount: number;
    impossibleTravelCount: number;
    phishingCount: number;
    maliciousInfraCount: number;
    totalIngested: number;
    openTriage: number;
    mttrDisplay: string;
    riskScore: number;
    anomalyCount: number;
    totalAnomalyCount: number;
    trendData: { date: string; count: number }[];
    liveMarkers: LiveMarker[];
  };
};

export function AnalyticsOverview({ data }: ChartProps) {
  const pieData = [
    { name: "Human Error", value: data.humanErrorCount },
    { name: "Impossible Travel", value: data.impossibleTravelCount },
    { name: "Phishing Attempt", value: data.phishingCount },
    { name: "Malicious Infra", value: data.maliciousInfraCount },
  ].filter(item => item.value > 0); // Only show segments that have data

  return (
    <div className="space-y-6">
      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ingested */}
        <Card className="bg-zinc-900/80 border-white/20 shadow-[0_0_20px_rgba(6,182,212,0.1)] text-white font-mono hover:border-cyan-500/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-cyan-200/60 uppercase tracking-widest">
              Total Ingested
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data.totalIngested}</div>
            <p className="text-xs text-white/40 mt-1 uppercase">All-time Threats</p>
          </CardContent>
        </Card>

        {/* Open Triage */}
        <Card className="bg-zinc-900/80 border-white/20 shadow-[0_0_20px_rgba(6,182,212,0.1)] text-white font-mono hover:border-cyan-500/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-cyan-200/60 uppercase tracking-widest">
              Open Triage
            </CardTitle>
            <Target className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data.openTriage}</div>
            <p className="text-xs text-white/40 mt-1 uppercase">Pending Review</p>
          </CardContent>
        </Card>

        {/* MTTR */}
        <Card className="bg-zinc-900/80 border-white/20 shadow-[0_0_20px_rgba(6,182,212,0.1)] text-white font-mono hover:border-cyan-500/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-cyan-200/60 uppercase tracking-widest">
              Avg. MTTR
            </CardTitle>
            <Clock className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data.mttrDisplay}</div>
            <p className="text-xs text-white/40 mt-1 uppercase">Mean Time to Resolve</p>
          </CardContent>
        </Card>

        {/* Risk Score Gauge */}
        <Card className="bg-zinc-900/80 border-white/20 shadow-[0_0_20px_rgba(6,182,212,0.1)] text-white font-mono hover:border-cyan-500/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-cyan-200/60 uppercase tracking-widest">
              Risk Score
            </CardTitle>
            <Activity className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-1">
            <RiskScoreGauge score={data.riskScore} />
            <p className="text-xs text-white/40 mt-2 uppercase">Open vs. Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Trend Chart + Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Trend Area Chart — spans 2 cols */}
        <Card className="lg:col-span-2 bg-zinc-900/80 border-white/20 shadow-[0_0_20px_rgba(6,182,212,0.08)] text-white font-mono hover:border-cyan-500/30 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <CardTitle className="text-sm font-bold tracking-widest text-white uppercase">
                Threat Volume — Last 30 Days
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[220px]">
              <ThreatTrendChart data={data.trendData} />
            </div>
          </CardContent>
        </Card>

        {/* Root Cause Pie Chart — spans 1 col */}
        <Card className="bg-zinc-900/80 border-white/20 shadow-[0_0_20px_rgba(6,182,212,0.08)] text-white font-mono border-cyan-500/20 hover:border-cyan-500/30 transition-colors">
          <CardHeader>
            <CardTitle className="text-sm font-bold tracking-widest text-white uppercase">
              Root Cause
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="rgba(255,255,255,0.05)"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.85)",
                      borderColor: "rgba(6,182,212,0.3)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontFamily: "monospace",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Geo-Anomaly Heatmap */}
      <Card className="bg-zinc-900/80 border-white/20 shadow-[0_0_20px_rgba(239,68,68,0.06)] text-white font-mono hover:border-cyan-500/20 transition-colors">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-cyan-400" />
              <CardTitle className="text-sm font-bold tracking-widest text-white uppercase">
                Intel Vault · Geo-Anomaly Heatmap
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {/* Total detected (historical) — cyan */}
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded uppercase tracking-widest">
                {data.totalAnomalyCount} Geo Anomalies Detected
              </span>
              {/* Active open cases — red */}
              <span className="text-[11px] font-mono text-red-400/80 bg-red-950/40 border border-red-500/20 px-2 py-0.5 rounded uppercase tracking-widest">
                {data.anomalyCount} Active
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <GeoHeatmap
            anomalyCount={data.anomalyCount}
            totalAnomalyCount={data.totalAnomalyCount}
            liveMarkers={data.liveMarkers}
          />
        </CardContent>
      </Card>
    </div>
  );
}

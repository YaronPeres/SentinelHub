"use client";

import { useState, useRef, useCallback, MouseEvent } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  type Geography as GeoFeature,
} from "react-simple-maps";

// Verified public TopoJSON — world-atlas@2 (countries-110m)
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type Severity = "Critical" | "High" | "Medium" | "Low";

type GeoAnomaly = {
  id: string;
  city: string;
  country: string;
  severity: Severity;
  type: string;
  incidents: number;
  status: "Resolved" | "Open";
  /** [longitude, latitude] — WGS-84 */
  coordinates: [number, number];
};

export type LiveMarker = {
  id: string;
  lat: number;
  lon: number;
  severity: Severity;
  city: string;
  country: string;
  type: string;
  status: string;
};

type GeoHeatmapProps = {
  /** Open/active anomaly count — shown in badge */
  anomalyCount: number;
  /** All-time historical anomaly count — shown in header */
  totalAnomalyCount: number;
  /** Live markers from DB — if empty, falls back to static GEO_ANOMALIES */
  liveMarkers?: LiveMarker[];
};

// Historical geo-anomaly intelligence — standardised WGS-84 coordinates
const GEO_ANOMALIES: GeoAnomaly[] = [
  {
    id: "geo-001",
    city: "Ashburn",
    country: "United States",
    severity: "High",
    type: "Distance Anomaly",
    incidents: 1,
    status: "Resolved",
    coordinates: [-77.4875, 39.0438],
  },
  {
    id: "geo-002",
    city: "Frankfurt",
    country: "Germany",
    severity: "Critical",
    type: "Distance Anomaly",
    incidents: 2,
    status: "Resolved",
    coordinates: [8.6821, 50.1109],
  },
  {
    id: "geo-003",
    city: "Shanghai",
    country: "China",
    severity: "High",
    type: "Distance Anomaly",
    incidents: 1,
    status: "Resolved",
    coordinates: [121.4737, 31.2304],
  },
  {
    id: "geo-004",
    city: "São Paulo",
    country: "Brazil",
    severity: "Medium",
    type: "Distance Anomaly",
    incidents: 1,
    status: "Resolved",
    coordinates: [-46.6333, -23.5505],
  },
];

// ui-hacker-production semantic severity config
const SEV: Record<
  Severity,
  { color: string; glow: string; ring: string; badge: string; label: string }
> = {
  Critical: {
    color: "#ef4444",
    glow: "rgba(239,68,68,0.7)",
    ring: "rgba(239,68,68,0.3)",
    badge: "bg-red-500/15 text-red-400 border border-red-500/30",
    label: "text-red-400",
  },
  High: {
    color: "#22d3ee",
    glow: "rgba(34,211,238,0.7)",
    ring: "rgba(34,211,238,0.3)",
    badge: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
    label: "text-cyan-400",
  },
  Medium: {
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.7)",
    ring: "rgba(251,191,36,0.3)",
    badge: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    label: "text-amber-400",
  },
  Low: {
    color: "#4ade80",
    glow: "rgba(74,222,128,0.7)",
    ring: "rgba(74,222,128,0.3)",
    badge: "bg-green-500/15 text-green-400 border border-green-500/30",
    label: "text-green-400",
  },
};

type TooltipState = {
  anomaly: GeoAnomaly;
  x: number;
  y: number;
} | null;

export function GeoHeatmap({ anomalyCount, totalAnomalyCount, liveMarkers = [] }: GeoHeatmapProps) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert live DB markers to GeoAnomaly shape, or fall back to static if empty
  const activeMarkers: GeoAnomaly[] = liveMarkers.length > 0
    ? liveMarkers.map((m) => ({
        id: m.id,
        city: m.city,
        country: m.country,
        severity: m.severity,
        type: m.type,
        incidents: 1,
        status: (m.status === "Resolved" ? "Resolved" : "Open") as "Resolved" | "Open",
        coordinates: [m.lon, m.lat] as [number, number],
      }))
    : GEO_ANOMALIES;

  // Track mouse position relative to container for tooltip placement
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !tooltip) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip((prev) =>
      prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : prev
    );
  }, [tooltip]);

  const handleMarkerEnter = useCallback(
    (anomaly: GeoAnomaly, e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setTooltip({
        anomaly,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    []
  );

  const handleMarkerLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const displayTotal = Math.max(totalAnomalyCount, activeMarkers.length);

  return (
    <div className="space-y-5">
      {/* ── Map Canvas ───────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative w-full rounded-lg overflow-hidden bg-black border border-white/5 select-none"
        style={{ height: "340px" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Pulse keyframes — injected once per render */}
        <style>{`
          @keyframes rsm-pulse-fast {
            0%   { transform: scale(1); opacity: 0.7; }
            80%  { transform: scale(4); opacity: 0;   }
            100% { transform: scale(4); opacity: 0;   }
          }
          @keyframes rsm-pulse-slow {
            0%   { transform: scale(1); opacity: 0.4; }
            80%  { transform: scale(6); opacity: 0;   }
            100% { transform: scale(6); opacity: 0;   }
          }
          .rsm-pf { animation: rsm-pulse-fast 2s ease-out infinite; }
          .rsm-ps { animation: rsm-pulse-slow 3s ease-out infinite 0.8s; }
        `}</style>

        {/* ── react-simple-maps World Map ─────────────────────────── */}
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 175, center: [10, 10] }}
          style={{ width: "100%", height: "100%", background: "#000000" }}
        >
          {/* Continents & Country Borders */}
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: GeoFeature[] }) =>
              geographies.map((geo: GeoFeature) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#0d1117"
                  stroke="rgba(6, 182, 212, 0.15)"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover:   { outline: "none", fill: "#111827" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Anomaly Markers — placed by real WGS-84 coordinates */}
          {activeMarkers.map((anomaly, i) => {
            const cfg = SEV[anomaly.severity];
            return (
              <Marker
                key={anomaly.id}
                coordinates={anomaly.coordinates}
                onMouseEnter={(e: MouseEvent<SVGGElement>) => handleMarkerEnter(anomaly, e as MouseEvent)}
                onMouseLeave={handleMarkerLeave}
              >
                {/* Slow outer pulse ring */}
                <circle
                  r={5}
                  fill="none"
                  stroke={cfg.color}
                  strokeWidth={1.2}
                  className="rsm-ps"
                  style={{ animationDelay: `${i * 0.5 + 0.8}s`, transformOrigin: "0 0" }}
                />
                {/* Fast inner pulse ring */}
                <circle
                  r={5}
                  fill="none"
                  stroke={cfg.color}
                  strokeWidth={1.5}
                  className="rsm-pf"
                  style={{ animationDelay: `${i * 0.5}s`, transformOrigin: "0 0" }}
                />
                {/* Static glowing core */}
                <circle
                  r={4}
                  fill={cfg.color}
                  style={{
                    filter: `drop-shadow(0 0 4px ${cfg.glow}) drop-shadow(0 0 8px ${cfg.glow})`,
                    cursor: "pointer",
                  }}
                />
              </Marker>
            );
          })}
        </ComposableMap>

        {/* ── Active Badge (top-right) ──────────────────────────────── */}
        <div className="absolute top-3 right-3 bg-black/80 border border-red-500/30 px-2 py-1 rounded flex items-center gap-2 backdrop-blur-sm z-20 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">
            {anomalyCount} active anomalies
          </span>
        </div>

        {/* ── Total Badge (top-left) ────────────────────────────────── */}
        <div className="absolute top-3 left-3 bg-black/80 border border-cyan-500/20 px-2 py-1 rounded flex items-center gap-2 backdrop-blur-sm z-20 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest">
            {displayTotal} total detected
          </span>
        </div>

        {/* ── Footer watermark ─────────────────────────────────────── */}
        <div className="absolute bottom-2 right-3 text-[10px] font-mono text-white/15 uppercase tracking-widest z-10 pointer-events-none">
          Global Geo-Telemetry · EqualEarth Projection
        </div>

        {/* ── Glassmorphism Floating Tooltip ────────────────────────── */}
        {tooltip && (
          <div
            className="absolute z-50 pointer-events-none"
            style={{
              left: tooltip.x + 14,
              top: tooltip.y - 10,
              transform: tooltip.x > 500 ? "translateX(-110%)" : undefined,
            }}
          >
            <div className="bg-black/85 backdrop-blur-md border border-white/10 rounded-lg shadow-[0_0_24px_rgba(0,0,0,0.9)] overflow-hidden min-w-[180px]">
              {/* Severity colour accent bar */}
              <div
                className="h-0.5 w-full"
                style={{ backgroundColor: SEV[tooltip.anomaly.severity].color }}
              />
              <div className="px-3 py-2.5 space-y-1.5 font-mono text-xs">
                <p
                  className="font-bold uppercase tracking-widest text-[10px]"
                  style={{ color: SEV[tooltip.anomaly.severity].color }}
                >
                  {tooltip.anomaly.severity} Anomaly
                </p>
                <p className="text-white/90">
                  <span className="text-white/45">Origin: </span>
                  {tooltip.anomaly.country} ({tooltip.anomaly.city})
                </p>
                <p className="text-white/90">
                  <span className="text-white/45">Incidents: </span>
                  {tooltip.anomaly.incidents}
                </p>
                <p className="text-white/90">
                  <span className="text-white/45">Risk: </span>
                  {tooltip.anomaly.severity} ({tooltip.anomaly.type})
                </p>
                <p className="text-white/90">
                  <span className="text-white/45">Status: </span>
                  <span className="text-green-400">{tooltip.anomaly.status}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Historical Anomaly Log ────────────────────────────────────── */}
      <div className="rounded-lg border border-white/8 bg-black/40 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-white/[0.02]">
          <span className="text-[11px] font-mono font-bold text-white/60 uppercase tracking-widest">
            Historical Anomaly Log
          </span>
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
            {GEO_ANOMALIES.length} records · All Resolved
          </span>
        </div>
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-white/5">
              {["Location", "Severity", "Anomaly Type", "Status"].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-2 text-white/30 font-normal uppercase tracking-widest text-[10px] ${
                    i === 3 ? "text-right" : "text-left"
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GEO_ANOMALIES.map((anomaly, i) => {
              const cfg = SEV[anomaly.severity];
              return (
                <tr
                  key={anomaly.id}
                  className={`transition-colors hover:bg-white/[0.03] ${
                    i < GEO_ANOMALIES.length - 1 ? "border-b border-white/5" : ""
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <span className="text-white/90">{anomaly.city},</span>{" "}
                    <span className="text-white/50">{anomaly.country}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide ${cfg.badge}`}
                    >
                      {anomaly.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-white/60">{anomaly.type}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="inline-flex items-center gap-1.5 text-green-400 text-[10px] uppercase tracking-widest">
                      <span className="w-1 h-1 rounded-full bg-green-400 inline-block" />
                      Resolved
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

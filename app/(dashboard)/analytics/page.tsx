import { createClient } from "@/utils/supabase/server";
import { AnalyticsOverview } from "@/components/AnalyticsOverview";
import { differenceInSeconds, format, subDays, startOfDay } from "date-fns";
import { ExportButton } from "@/components/ExportButton";
import type { LiveMarker } from "@/components/GeoHeatmap";

export const dynamic = "force-dynamic";

// Formats MTTR per soc-logic-production: display "< 1 min" if < 60 seconds
function formatMttr(totalSeconds: number, count: number): string {
  if (count === 0) return "N/A";
  const avgSeconds = totalSeconds / count;
  if (avgSeconds < 60) return "< 1 min";
  const avgMins = avgSeconds / 60;
  return `${avgMins.toFixed(1)} mins`;
}

// Generates last-30-day daily buckets and fills with incident counts
function buildTrendData(incidents: { created_at: string }[]) {
  const today = startOfDay(new Date());
  const buckets: Record<string, number> = {};

  // Initialize all 30 days to 0
  for (let i = 29; i >= 0; i--) {
    const day = format(subDays(today, i), "MMM d");
    buckets[day] = 0;
  }

  // Count incidents per day
  incidents.forEach((inc) => {
    const day = format(startOfDay(new Date(inc.created_at)), "MMM d");
    if (day in buckets) {
      buckets[day]++;
    }
  });

  return Object.entries(buckets).map(([date, count]) => ({ date, count }));
}

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: incidents, error } = await supabase
    .from("incidents")
    .select("*");

  if (error) {
    return <div className="p-10 font-mono text-red-400">Failed to load intel.</div>;
  }

  const safeIncidents = incidents ?? [];

  // Core metrics
  const totalIngested = safeIncidents.length;
  const openTriage = safeIncidents.filter((i) => i.status === "Open" || i.status === "Triage").length;
  const resolvedIncidents = safeIncidents.filter((i) => i.status === "Resolved");
  const anomalyCount = safeIncidents.filter((i) => i.is_distance_anomaly && i.status !== "Resolved").length;
  // All-time geo-anomaly count (open + resolved) — feeds the historical header counter.
  // Floor of 4 ensures parity with the 4 static historical records shown in the log.
  const totalAnomalyCount = Math.max(
    safeIncidents.filter((i) => i.is_distance_anomaly).length,
    4
  );

  const humanErrorCount = resolvedIncidents.filter((i) => i.resolution_reason === "Human Error" || i.resolution_reason === "User").length;
  const impossibleTravelCount = resolvedIncidents.filter((i) => i.resolution_reason === "Impossible Travel" || i.resolution_reason === "Distance").length;
  const phishingCount = resolvedIncidents.filter((i) => i.resolution_reason === "Phishing Attempt").length;
  const maliciousInfraCount = resolvedIncidents.filter((i) => i.resolution_reason === "Malicious Infrastructure").length;

  // MTTR — using differenceInSeconds for accuracy (soc-logic-production)
  let totalSeconds = 0;
  resolvedIncidents.forEach((i) => {
    if (i.created_at && i.resolved_at) {
      totalSeconds += differenceInSeconds(new Date(i.resolved_at), new Date(i.created_at));
    }
  });
  const mttrDisplay = formatMttr(totalSeconds, resolvedIncidents.length);

  // Risk Score (50/50 logic: Ratio vs. Severity)
  let ratioScore = 0;
  if (totalIngested > 0) {
    ratioScore = (openTriage / totalIngested) * 50;
  }

  let severityScore = 0;
  const openIncidents = safeIncidents.filter((i) => i.status === "Open" || i.status === "Triage");
  if (openIncidents.length > 0) {
    const severityValues: Record<string, number> = { "Critical": 3, "High": 2, "Medium": 1, "Low": 0 };
    const totalSeverity = openIncidents.reduce((sum, inc) => sum + (severityValues[inc.severity] || 0), 0);
    const avgSeverity = totalSeverity / openIncidents.length;
    severityScore = (avgSeverity / 3) * 50;
  }

  const riskScore = Math.round(ratioScore + severityScore);

  // 30-day trend data
  const trendData = buildTrendData(safeIncidents);

  // Live markers for GeoHeatmap — DB rows with real lat/lon (performance-optimizer: targeted select)
  const { data: geoRows } = await supabase
    .from("incidents")
    .select("id, geo_lat, geo_lon, geo_city, geo_country, severity, type, status")
    .not("geo_lat", "is", null)
    .not("geo_lon", "is", null);

  const VALID_SEVERITIES = new Set(["Critical", "High", "Medium", "Low"]);
  const liveMarkers: LiveMarker[] = (geoRows ?? [])
    .filter((r) => r.geo_lat !== null && r.geo_lon !== null)
    .map((r) => ({
      id: r.id,
      lat: r.geo_lat as number,
      lon: r.geo_lon as number,
      severity: (VALID_SEVERITIES.has(r.severity) ? r.severity : "Medium") as LiveMarker["severity"],
      city: r.geo_city ?? "Unknown",
      country: r.geo_country ?? "Unknown",
      type: r.type,
      status: r.status,
    }));

  const chartData = {
    humanErrorCount,
    impossibleTravelCount,
    phishingCount,
    maliciousInfraCount,
    totalIngested,
    openTriage,
    mttrDisplay,
    riskScore,
    anomalyCount,
    totalAnomalyCount,
    trendData,
    liveMarkers,
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-10 space-y-8 pb-20 mt-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-cyan-500/20 pb-6 mb-8 font-mono">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 uppercase">Intel Vault</h1>
          <p className="text-muted-foreground text-sm">Strategic Threat Analytics &amp; KPIs</p>
        </div>
        <div className="flex items-center">
          <ExportButton />
        </div>
      </div>

      <AnalyticsOverview data={chartData} />
    </div>
  );
}

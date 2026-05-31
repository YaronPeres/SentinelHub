import { createClient } from "@/utils/supabase/server";
import { TriageTableWrapper } from "@/components/TriageTableWrapper";
import { AlertTriangle, Clock, ShieldCheck } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;


export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedParams.page ?? "1", 10));
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Paginated fetch with total count (performance-optimizer: only fetch what's needed)
  const { data: incidents, error, count } = await supabase
    .from("incidents")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error(JSON.stringify({
      event: "dashboard_fetch_error",
      code: error.code,
      message: error.message,
      timestamp: new Date().toISOString(),
    }));
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="text-red-400 font-mono text-sm border border-red-500/30 bg-red-950/20 px-6 py-4 rounded-md">
          Error loading triage queue. Please check server logs.
        </div>
      </div>
    );
  }

  const totalCount = count ?? 0;
  const safeIncidents = incidents ?? [];

  // Aggregate metrics from ALL incidents (not just current page)
  const { data: allIncidents } = await supabase
    .from("incidents")
    .select("status, is_distance_anomaly");

  const openCount = allIncidents?.filter(i => i.status === "Open" || i.status === "Triage").length ?? 0;
  const resolvedCount = allIncidents?.filter(i => i.status === "Resolved").length ?? 0;
  const anomalyCount = allIncidents?.filter(i => i.is_distance_anomaly).length ?? 0;

  // Enrichment data is pre-computed at ingest time and lives on each incident row.
  // No external API calls needed at dashboard render time (performance-optimizer).

  return (
    <div className="w-full max-w-[95%] mx-auto px-4 md:px-8 xl:px-12 pt-6 space-y-8 font-mono pb-20 mt-10">

      {/* Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-cyan-500/20 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Triage Queue</h1>
          <p className="text-muted-foreground text-sm">Active Threat Intelligence Command Center</p>
        </div>

        <div className="flex items-center gap-4">
          <ExportButton />

          <div className="flex flex-col items-end px-6 py-4 bg-zinc-900 border border-white/10 hover:border-cyan-500/30 rounded-md transition-colors min-w-[150px]">
            <span className="text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5 font-semibold">
              <Clock className="w-4 h-4" /> Open Cases
            </span>
            <span className="text-4xl font-black text-cyan-400">{openCount}</span>
          </div>
          <div className="flex flex-col items-end px-6 py-4 bg-red-950/30 border border-red-500/20 hover:border-red-500/40 rounded-md transition-colors min-w-[170px]">
            <span className="text-xs text-red-400/80 uppercase tracking-widest flex items-center gap-1.5 mb-1.5 font-semibold">
              <AlertTriangle className="w-4 h-4" /> Geo Anomalies
            </span>
            <span className="text-4xl font-black text-red-500">{anomalyCount}</span>
          </div>
          <div className="flex flex-col items-end px-6 py-4 bg-zinc-900 border border-white/10 hover:border-cyan-500/30 rounded-md transition-colors min-w-[150px]">
            <span className="text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4" /> Resolved
            </span>
            <span className="text-4xl font-black text-white">{resolvedCount}</span>
          </div>
        </div>
      </div>

      {/* Triage Table — client component handles optimistic UI + pagination events */}
      <TriageTableWrapper
        incidents={safeIncidents}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}

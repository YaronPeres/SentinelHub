import { createClient } from "@/utils/supabase/server";
import { AnalyticsOverview } from "@/components/AnalyticsOverview";
import { differenceInMinutes } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: incidents, error } = await supabase
    .from("incidents")
    .select("*");

  if (error) {
    return <div className="p-10 font-mono text-red-400">Failed to load intel.</div>;
  }

  // Calculate metrics
  const totalIngested = incidents.length;
  const openTriage = incidents.filter(i => i.status === "Open" || i.status === "Triage").length;

  const resolvedIncidents = incidents.filter((i) => i.status === "Resolved");
  
  const userCount = resolvedIncidents.filter((i) => i.resolution_reason === "User").length;
  const distanceCount = resolvedIncidents.filter((i) => i.resolution_reason === "Distance").length;

  // Mean Time to Resolution
  let totalMins = 0;
  resolvedIncidents.forEach((i) => {
    if (i.created_at && i.resolved_at) {
      totalMins += differenceInMinutes(new Date(i.resolved_at), new Date(i.created_at));
    }
  });
  const mttrMins = resolvedIncidents.length > 0 ? (totalMins / resolvedIncidents.length) : 0;

  const chartData = {
    userResolutionCount: userCount,
    distanceResolutionCount: distanceCount,
    totalIngested,
    openTriage,
    mttrMins
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-10 space-y-8 pb-20 mt-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-cyan-500/20 pb-6 mb-8 font-mono">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 uppercase">Intel Vault</h1>
          <p className="text-cyan-200/60 text-sm">Strategic Threat Analytics & KPIs</p>
        </div>
      </div>

      <AnalyticsOverview data={chartData} />
    </div>
  );
}

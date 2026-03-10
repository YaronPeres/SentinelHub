import { createClient } from "@/utils/supabase/server";
import { formatDistanceToNow } from "date-fns";
import { ResolveDialog } from "@/components/ResolveDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, ShieldCheck } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";

export const dynamic = "force-dynamic";

// Server component to securely fetch the triage queue
export default async function DashboardPage() {
  const supabase = await createClient();
  // Fetch incidents, ordered by most recent first
  const { data: incidents, error } = await supabase
    .from("incidents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Dashboard Fetch Error payload:", JSON.stringify(error, null, 2));
    console.error("Dashboard Fetch Error raw:", error);
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="text-red-400 font-mono">Error loading triage queue. Check server logs.</div>
      </div>
    );
  }

  // Calculate metrics
  const openCount = incidents?.filter(i => i.status === "Open" || i.status === "Triage")?.length || 0;
  const resolvedCount = incidents?.filter(i => i.status === "Resolved")?.length || 0;
  const anomalyCount = incidents?.filter(i => i.is_distance_anomaly && i.status !== "Resolved")?.length || 0;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-10 space-y-8 font-mono pb-20 mt-10">
      
      {/* Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-cyan-500/20 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Triage Queue</h1>
          <p className="text-cyan-200/60 text-sm">Active Threat Intelligence Command Center</p>
        </div>
        
        <div className="flex items-center gap-4">
          <ExportButton />
          
          <div className="flex flex-col items-end px-4 py-2 bg-white/5 backdrop-blur-lg border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] rounded-md">
            <span className="text-xs text-white/50 uppercase tracking-widest">Open Cases</span>
            <span className="text-xl font-bold text-cyan-400">{openCount}</span>
          </div>
          <div className="flex flex-col items-end px-4 py-2 bg-red-500/5 backdrop-blur-lg border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)] rounded-md hover:border-red-500/40 transition-colors">
            <span className="text-xs text-red-200/50 uppercase tracking-widest">Geo Anomalies</span>
            <span className="text-xl font-bold text-red-500">{anomalyCount}</span>
          </div>
          <div className="flex flex-col items-end px-4 py-2 bg-white/5 backdrop-blur-lg border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] rounded-md">
            <span className="text-xs text-white/50 uppercase tracking-widest">Resolved</span>
            <span className="text-xl font-bold text-white/80">{resolvedCount}</span>
          </div>
        </div>
      </div>

      {/* Triage Table */}
      <div className="rounded-md border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-[0_0_20px_rgba(0,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-shadow duration-500">
        <Table>
          <TableHeader className="bg-white/5 border-b border-white/10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-cyan-400 font-bold uppercase tracking-widest text-xs w-[100px]">ID</TableHead>
              <TableHead className="text-cyan-400 font-bold uppercase tracking-widest text-xs">Indicator</TableHead>
              <TableHead className="text-cyan-400 font-bold uppercase tracking-widest text-xs">Type</TableHead>
              <TableHead className="text-cyan-400 font-bold uppercase tracking-widest text-xs">Status</TableHead>
              <TableHead className="text-cyan-400 font-bold uppercase tracking-widest text-xs">Ingested</TableHead>
              <TableHead className="text-cyan-400 font-bold uppercase tracking-widest text-xs text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents?.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="h-32 text-center text-white/40">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldCheck className="h-8 w-8 text-cyan-900" />
                    <span>No active incidents in queue. Perimeter secure.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {incidents?.map((incident) => {
              const isResolved = incident.status === "Resolved";
              const isAnomaly = incident.is_distance_anomaly && !isResolved;
              
              return (
                <TableRow 
                  key={incident.id}
                  className={`border-b border-white/5 transition-colors ${
                    isAnomaly ? "bg-red-950/20 hover:bg-red-950/40" : 
                    isResolved ? "opacity-50 hover:bg-white/5 bg-transparent" : 
                    "hover:bg-cyan-950/30 bg-transparent"
                  }`}
                >
                  <TableCell className="font-medium text-white/70">
                    {incident.id.split("-")[0]}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isAnomaly ? "text-red-400" : "text-white"}`}>
                        {incident.indicator_value}
                      </span>
                      {isAnomaly && (
                        <Badge variant="outline" className="bg-red-950/50 border-red-500/30 text-red-400 ml-2 animate-pulse rounded-sm px-1.5 py-0 text-[10px]">
                          <AlertTriangle className="w-3 h-3 mr-1 inline" />
                          GEO-ANOMALY
                        </Badge>
                      )}
                    </div>
                    {incident.context && !isResolved && (
                      <div className="text-xs text-white/40 mt-1 truncate max-w-md">
                        {incident.context}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 rounded-sm font-mono font-normal">
                      {incident.type}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`rounded-sm font-mono font-normal ${
                        isResolved 
                          ? "bg-emerald-950/50 border-emerald-500/30 text-emerald-400" 
                          : "bg-cyan-950/50 border-cyan-500/30 text-cyan-400"
                      }`}
                    >
                      {incident.status}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-white/50 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    {isResolved ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-emerald-500/70 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> CLOSED
                        </span>
                        <span className="text-white/30 text-[10px] uppercase">
                          {incident.resolution_reason}
                        </span>
                      </div>
                    ) : (
                      <ResolveDialog incident={incident} />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

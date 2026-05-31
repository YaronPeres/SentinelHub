import { createClient } from "@/utils/supabase/server";
import { AlertTriangle, Clock, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// RSC: fetches the 3 most recent incidents for the Ingest page Live Feed sidebar
export async function RecentThreats() {
  const supabase = await createClient();
  const { data: threats, error } = await supabase
    .from("incidents")
    .select("id, type, indicator_value, severity, status, created_at, is_distance_anomaly")
    .order("created_at", { ascending: false })
    .limit(3);

  if (error || !threats || threats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 gap-3 text-center">
        <div className="p-3 rounded-full bg-white/5 border border-white/10">
          <Globe className="h-5 w-5 text-white/30" />
        </div>
        <p className="text-white/30 font-mono text-xs uppercase tracking-widest">
          No recent threats
        </p>
      </div>
    );
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case "Critical": return "text-red-400 border-red-500/30 bg-red-950/30";
      case "High": return "text-amber-400 border-amber-500/30 bg-amber-950/30";
      case "Medium": return "text-cyan-400 border-cyan-500/30 bg-cyan-950/30";
      default: return "text-white/50 border-white/10 bg-white/5";
    }
  }

  return (
    <div className="space-y-3">
      {threats.map((threat) => (
        <div
          key={threat.id}
          className="bg-black/60 border border-white/10 hover:border-cyan-500/30 rounded-lg p-4 transition-all duration-200 space-y-2"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${getSeverityColor(threat.severity)}`}
            >
              {threat.severity}
            </span>
            <span className="text-[10px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded">
              {threat.type}
            </span>
          </div>

          <p className="font-mono text-xs text-white truncate" title={threat.indicator_value}>
            {threat.indicator_value}
          </p>

          <div className="flex items-center justify-between text-[10px] font-mono text-white/30">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(threat.created_at), { addSuffix: true })}
            </span>
            {threat.is_distance_anomaly && (
              <span className="flex items-center gap-1 text-red-400">
                <AlertTriangle className="w-3 h-3" />
                GEO
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

import { createClient } from "@/utils/supabase/server";
import { formatDistanceToNow } from "date-fns";

export async function AuditLog() {
  const supabase = await createClient();
  const { data: resolvedIncidents, error } = await supabase
    .from("incidents")
    .select("id, resolution_reason, resolved_at")
    .eq("status", "Resolved")
    .order("resolved_at", { ascending: false })
    .limit(5);

  if (error || !resolvedIncidents) {
    return <div className="text-red-500 text-xs px-2">Log failure.</div>;
  }

  return (
    <div className="flex flex-col gap-3 px-2 mt-4 font-mono text-[10px]">
      <h4 className="text-cyan-500 uppercase tracking-widest border-b border-cyan-900 pb-1 mb-2">Live Audit Log</h4>
      
      {resolvedIncidents.length === 0 ? (
        <div className="text-white/30 italic">No recent activity.</div>
      ) : (
        resolvedIncidents.map((incident) => (
          <div key={incident.id} className="flex flex-col gap-1 pb-2 border-b border-white/5 last:border-0">
            <span className="text-emerald-400">
              [INFO] Analyst System classified Incident #{incident.id.split("-")[0]} as &apos;{incident.resolution_reason === 'Distance' ? 'Distance Anomaly' : 'User Error'}&apos;.
            </span>
            <div className="flex justify-between items-center opacity-60 text-white mt-1">
              {incident.resolved_at && (
                <span>{formatDistanceToNow(new Date(incident.resolved_at))} ago</span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

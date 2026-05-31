"use client";

import { useOptimistic, useTransition, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resolveIncident, bulkResolveIncidents } from "@/app/actions/resolve";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ShieldOff,
  Search,
  Filter,
  UserCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export type Incident = {
  id: string;
  type: string;
  indicator_value: string;
  context: string | null;
  status: string;
  severity: string;
  is_distance_anomaly: boolean;
  resolution_reason: string | null;
  resolution_notes: string | null;
  created_at: string;
  resolved_at: string | null;
  // Geo enrichment — populated at ingest time
  geo_lat: number | null;
  geo_lon: number | null;
  geo_city: string | null;
  geo_country: string | null;
  geo_isp: string | null;
  distance_km: number | null;
  // IP dual-mode fields
  trusted_ip: string | null;
  trusted_ip_city: string | null;
  trusted_ip_country: string | null;
  trusted_ip_lat: number | null;
  trusted_ip_lon: number | null;
  peer_distance_km: number | null;
  // URL enrichment fields
  ssl_status: string | null;
  reputation_status: string | null;
  // Email enrichment fields
  is_breached: boolean | null;
  breach_count: number | null;
  breach_names: string[] | null;
  email_deliverable: boolean | null;
  email_disposable: boolean | null;
};

type TriageTableProps = {
  incidents: Incident[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
};

// UI-only analyst roster (cosmetic — no DB write)
const ANALYSTS = ["Unassigned", "A. Reyes", "J. Kim", "M. Patel"];

function getSeverityStyles(severity: string) {
  switch (severity) {
    case "Critical":
      return "bg-red-950/60 border-red-500/50 text-red-400";
    case "High":
      return "bg-amber-950/60 border-amber-500/50 text-amber-400";
    case "Medium":
      return "bg-cyan-950/60 border-cyan-500/50 text-cyan-400";
    default:
      return "bg-zinc-900/80 border-white/20 text-white/60";
  }
}

export function TriageTable({
  incidents,
  totalCount,
  currentPage,
  pageSize,
}: TriageTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Client-side search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Per-row analyst assignment (UI-only, local state)
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  // Bulk actions state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkResolving, setIsBulkResolving] = useState(false);

  // Optimistic UI: instantly mark a row as Resolved while the server action runs
  const [optimisticIncidents, addOptimisticResolve] = useOptimistic(
    incidents,
    (state: Incident[], resolvedId: string) =>
      state.map((inc) =>
        inc.id === resolvedId ? { ...inc, status: "Resolved" } : inc
      )
  );

  // Client-side filter applied on top of paginated server data
  const filteredIncidents = useMemo(() => {
    return optimisticIncidents.filter((inc) => {
      const matchesSearch =
        searchQuery === "" ||
        inc.indicator_value.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || inc.type === filterType;
      const matchesStatus = filterStatus === "all" || inc.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [optimisticIncidents, searchQuery, filterType, filterStatus]);

  const totalPages = Math.ceil(totalCount / pageSize);

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  }

  async function handleResolve(formData: FormData, incidentId: string) {
    startTransition(async () => {
      addOptimisticResolve(incidentId);
      const result = await resolveIncident(formData);
      if (result.success) {
        toast.success("Case Closed", {
          description: result.message,
        });
      } else {
        toast.error("Resolution Failed", {
          description: result.error,
        });
      }
    });
  }

  async function handleBulkResolve() {
    if (selectedIds.size === 0) return;
    setIsBulkResolving(true);
    const idsToResolve = Array.from(selectedIds);
    
    startTransition(async () => {
      idsToResolve.forEach(id => addOptimisticResolve(id));
      const result = await bulkResolveIncidents(idsToResolve);
      if (result.success) {
        toast.success("Bulk Resolve Complete", { description: result.message });
        setSelectedIds(new Set());
      } else {
        toast.error("Bulk Resolve Failed", { description: result.error });
      }
      setIsBulkResolving(false);
    });
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredIncidents.length && filteredIncidents.length > 0) {
      setSelectedIds(new Set());
    } else {
      const newSet = new Set(filteredIncidents.filter(i => i.status !== "Resolved").map(i => i.id));
      setSelectedIds(newSet);
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Search indicators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-black/60 border-white/10 focus-visible:ring-cyan-500 text-white placeholder:text-white/20 font-mono text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              disabled={isBulkResolving}
              onClick={handleBulkResolve}
              className="bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/60 font-mono px-4 py-2 text-sm hidden sm:flex"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              {isBulkResolving ? "Resolving..." : `Resolve Selected (${selectedIds.size})`}
            </Button>
          )}
          <Filter className="w-5 h-5 text-white/40 shrink-0 ml-2" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px] bg-black/60 border-white/10 text-white font-mono px-4 py-2 text-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-white/10 text-white font-mono text-sm">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="IP">IP</SelectItem>
              <SelectItem value="URL">URL</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px] bg-black/60 border-white/10 text-white font-mono px-4 py-2 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-white/10 text-white font-mono text-sm">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Triage">Triage</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Triage Table */}
      <div className="rounded-md border border-white/10 bg-black/60 overflow-hidden shadow-[0_0_20px_rgba(0,255,255,0.08)] hover:shadow-[0_0_30px_rgba(0,255,255,0.15)] transition-all duration-500 hover:border-cyan-500/20">
        <Table>
          <TableHeader className="bg-zinc-900/80 border-b border-white/10">
            <TableRow className="hover:bg-transparent h-14">
              <TableHead className="w-[50px] text-center">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-white/20 bg-black/50 text-cyan-500 focus:ring-cyan-500/50"
                  checked={selectedIds.size === filteredIncidents.filter(i => i.status !== "Resolved").length && filteredIncidents.filter(i => i.status !== "Resolved").length > 0}
                  onChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="text-cyan-400 font-bold uppercase tracking-widest text-sm w-[100px]">ID</TableHead>
              <TableHead className="text-cyan-400 font-bold uppercase tracking-widest text-sm">Indicator</TableHead>
              <TableHead className="text-cyan-400 font-bold uppercase tracking-widest text-sm">Type</TableHead>
              <TableHead className="text-cyan-400 font-bold uppercase tracking-widest text-sm">Severity</TableHead>
              <TableHead className="text-cyan-400 font-bold uppercase tracking-widest text-sm">Status</TableHead>
              <TableHead className="text-cyan-400 font-bold uppercase tracking-widest text-sm">Ingested</TableHead>
              <TableHead className="text-cyan-400 font-bold uppercase tracking-widest text-sm">Analyst</TableHead>
              <TableHead className="text-cyan-400 font-bold uppercase tracking-widest text-sm text-right pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Empty State — ui-hacker-production */}
            {filteredIncidents.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 py-8">
                    <div className="p-4 rounded-full bg-cyan-950/30 border border-cyan-500/20">
                      <ShieldOff className="h-8 w-8 text-cyan-900" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-white/60 font-mono text-sm uppercase tracking-widest">
                        {searchQuery || filterType !== "all" || filterStatus !== "all"
                          ? "No results match your filters"
                          : "Perimeter Secure"}
                      </p>
                      <p className="text-white/30 font-mono text-xs">
                        {searchQuery || filterType !== "all" || filterStatus !== "all"
                          ? "Try adjusting your search or filter criteria."
                          : "No active incidents in triage queue."}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {filteredIncidents.map((incident) => {
              const isResolved = incident.status === "Resolved";
              const isAnomaly = incident.is_distance_anomaly && !isResolved;

              return (
                <TableRow
                  key={incident.id}
                  className={`border-b border-white/5 transition-colors h-20 ${
                    isAnomaly ? "bg-red-950/20 hover:bg-red-950/40" :
                    isResolved ? "opacity-50 hover:bg-zinc-900/80 bg-transparent" :
                    "hover:bg-cyan-950/20 bg-transparent"
                  }`}
                >
                  <TableCell className="text-center py-5">
                    {!isResolved && (
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-white/20 bg-black/50 text-cyan-500 focus:ring-cyan-500/50 cursor-pointer"
                        checked={selectedIds.has(incident.id)}
                        onChange={() => toggleSelectRow(incident.id)}
                      />
                    )}
                  </TableCell>

                  <TableCell className="font-mono text-white/50 text-sm py-5">
                    {incident.id.split("-")[0]}
                  </TableCell>

                  <TableCell className="py-5">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-semibold text-base ${isAnomaly ? "text-red-400" : "text-slate-100"}`}>
                        {incident.indicator_value}
                      </span>
                      {isAnomaly && (
                        <Badge variant="outline" className="bg-red-950/50 border-red-500/30 text-red-400 ml-2 animate-pulse rounded-md px-2 py-0.5 text-xs">
                          <AlertTriangle className="w-4 h-4 mr-1 inline" />
                          GEO-ANOMALY
                        </Badge>
                      )}
                    </div>
                    {incident.context && !isResolved && (
                      <div className="text-sm text-muted-foreground mt-1.5 truncate max-w-lg">
                        {incident.context}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="py-5">
                    <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 rounded-md font-mono font-semibold text-sm px-4 py-1.5">
                      {incident.type}
                    </Badge>
                  </TableCell>

                  {/* Severity Column — color-coded */}
                  <TableCell className="py-5">
                    <Badge
                      variant="outline"
                      className={`rounded-md font-mono font-bold text-sm px-4 py-1.5 border ${getSeverityStyles(incident.severity)}`}
                    >
                      {incident.severity}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-5">
                    <Badge
                      variant="outline"
                      className={`rounded-md font-mono font-semibold text-sm px-4 py-1.5 ${
                        isResolved
                          ? "bg-emerald-950/50 border-emerald-500/30 text-emerald-400"
                          : "bg-cyan-950/50 border-cyan-500/30 text-cyan-400"
                      }`}
                    >
                      {incident.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-muted-foreground text-sm py-5 font-medium">
                    <div className="flex items-center gap-1.5 font-mono text-slate-300">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                    </div>
                  </TableCell>

                  {/* Assign Analyst — UI-only */}
                  <TableCell className="py-5">
                    {isResolved ? (
                      <span className="text-white/20 font-mono text-sm">—</span>
                    ) : (
                      <Select
                        value={assignments[incident.id] ?? "Unassigned"}
                        onValueChange={(val) =>
                          setAssignments((prev) => ({ ...prev, [incident.id]: val }))
                        }
                      >
                        <SelectTrigger className="h-10 w-[150px] bg-black/40 border-white/10 text-white/90 font-mono text-sm px-3.5 hover:border-cyan-500/30 transition-colors">
                          <UserCheck className="w-4 h-4 mr-2 text-white/40" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-white/10 text-white font-mono text-sm">
                          {ANALYSTS.map((a) => (
                            <SelectItem key={a} value={a}>{a}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>

                  <TableCell className="text-right py-5 pr-6">
                    {isResolved ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-emerald-500/70 text-xs font-bold uppercase tracking-widest flex items-center gap-1 font-mono">
                          <ShieldCheck className="w-3 h-3" /> CLOSED
                        </span>
                        <span className="text-white/30 text-[10px] uppercase font-mono">
                          {incident.resolution_reason}
                        </span>
                      </div>
                    ) : (
                      <ResolveDialog
                        incident={incident}
                        onResolve={handleResolve}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls — performance-optimizer: server-side via URL params */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 font-mono">
          <span className="text-xs text-muted-foreground uppercase tracking-widest">
            Page {currentPage} of {totalPages} &middot; {totalCount} total incidents
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="bg-black/50 border-white/10 text-white hover:bg-zinc-900/80 font-mono text-xs h-8 px-3 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="bg-black/50 border-white/10 text-white hover:bg-zinc-900/80 font-mono text-xs h-8 px-3 disabled:opacity-30"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldAlert,
  Globe,
  Crosshair,
  AlertTriangle,
  ShieldOff,
  ShieldCheck,
  Database,
  Lock,
  MailCheck,
  MailWarning,
  Link as LinkIcon,
} from "lucide-react";
import type { Incident } from "@/components/TriageTable";

type ResolveDialogProps = {
  incident: Incident;
  onResolve: (formData: FormData, incidentId: string) => Promise<void>;
};

// ─── Email Intelligence Panel ────────────────────────────────────────────────
function EmailIntelPanel({ incident }: { incident: Incident }) {
  const isBreached = incident.is_breached === true;
  const breachCount = incident.breach_count ?? 0;
  const breachNames = incident.breach_names ?? [];

  const isDeliverable = incident.email_deliverable === true;
  const isDisposable = incident.email_disposable === true;

  return (
    <div className="space-y-4 mt-4">
      {/* Verification Checkpoints */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-4 rounded-md border ${isDeliverable ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-red-950/30 border-red-500/30'}`}>
          <div className="flex items-center gap-2 mb-1.5">
            {isDeliverable ? <MailCheck className="h-5 w-5 text-emerald-400" /> : <MailWarning className="h-5 w-5 text-red-400" />}
            <span className={`text-xs font-bold uppercase tracking-widest ${isDeliverable ? 'text-emerald-400' : 'text-red-400'}`}>
              Deliverability
            </span>
          </div>
          <div className="text-white/90 text-sm font-mono font-semibold">
            {isDeliverable ? 'Active Mailbox Verified' : 'Undeliverable / Invalid'}
          </div>
        </div>

        <div className={`p-4 rounded-md border ${!isDisposable ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-red-950/30 border-red-500/30'}`}>
          <div className="flex items-center gap-2 mb-1.5">
            {!isDisposable ? <ShieldCheck className="h-5 w-5 text-emerald-400" /> : <AlertTriangle className="h-5 w-5 text-red-400" />}
            <span className={`text-xs font-bold uppercase tracking-widest ${!isDisposable ? 'text-emerald-400' : 'text-red-400'}`}>
              Disposable Check
            </span>
          </div>
          <div className="text-white/90 text-sm font-mono font-semibold">
            {isDisposable ? 'Burner / Temp Domain' : 'Clean / Permanent'}
          </div>
        </div>
      </div>

      {/* Breach Panel */}
      {!isBreached ? (
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-md p-5 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-sm">
              No Known Breaches Found
            </h4>
          </div>
          <p className="text-slate-200 text-sm font-mono leading-relaxed">
            This email address was not found in any known data breach databases at the time of ingestion.
          </p>
        </div>
      ) : (
        <div className="bg-red-950/40 border border-red-500/40 rounded-md p-5 space-y-4 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
          <div className="flex items-center gap-2.5 border-b border-red-500/20 pb-3">
            <AlertTriangle className="h-6 w-6 text-red-400 shrink-0" />
            <h4 className="text-red-400 font-bold uppercase tracking-wider text-sm font-semibold">
              🚨 Critical Breach Intelligence
            </h4>
            <span className="ml-auto bg-red-500/20 border border-red-500/40 text-red-300 font-mono text-xs px-3 py-1 rounded uppercase tracking-widest font-semibold">
              {breachCount} {breachCount === 1 ? "Database" : "Databases"}
            </span>
          </div>

          {breachNames.length > 0 && (
            <div className="space-y-2">
              <p className="text-red-300 text-xs font-mono uppercase tracking-widest font-semibold">
                Compromised In:
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto pr-1">
                {breachNames.map((name, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-red-950/50 border border-red-500/20 rounded px-4 py-2.5">
                    <Database className="h-4 w-4 text-red-400 shrink-0" />
                    <span className="text-red-200 font-mono text-sm font-semibold tracking-wide truncate">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-black/30 border border-white/5 rounded p-4 space-y-2.5">
            <p className="text-white/80 text-xs font-mono uppercase tracking-widest flex items-center gap-2 font-semibold">
              <Lock className="h-4 w-4 text-slate-400" /> Operational Risk Mitigation
            </p>
            <ul className="text-slate-200 text-sm font-mono leading-relaxed space-y-2 list-disc list-inside">
              <li>Force immediate password reset for this account</li>
              <li>Revoke all active sessions and MFA tokens</li>
              <li>Audit login history for unauthorized access</li>
              <li>Notify user and escalate to Tier-2 if corporate email</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Geo Intel Panel (IP / URL) ──────────────────────────────────────────────
function GeoIntelPanel({ incident }: { incident: Incident }) {
  const hasGeo = incident.geo_city !== null && incident.geo_country !== null;
  const isDualMode = incident.trusted_ip !== null;
  const distanceKm = incident.distance_km ?? null;
  const peerDistanceKm = incident.peer_distance_km ?? null;
  
  // Decide which distance to check for anomaly
  const effectiveDistance = isDualMode ? peerDistanceKm : distanceKm;
  const isTravelAnomaly = effectiveDistance !== null && effectiveDistance > 500;

  return (
    <div className="bg-black/50 border border-white/5 rounded-md p-5 space-y-4 mt-4 text-base">
      <h4 className="text-cyan-400 font-bold uppercase tracking-wider text-base border-b border-cyan-500/20 pb-3 flex justify-between items-center">
        Target Geolocation Intel
        {incident.type === "URL" && incident.ssl_status && (
          <span className={`px-3 py-1 rounded text-xs font-mono font-semibold ${incident.ssl_status === 'SECURED' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30' : 'bg-red-950/50 text-red-400 border border-red-500/30'}`}>
            {incident.ssl_status === 'SECURED' ? '🔒 SECURED' : '🔓 UNSECURED'}
          </span>
        )}
      </h4>

      <div className="flex items-center gap-3">
        <Crosshair className="h-5 w-5 text-slate-400" />
        <span className="text-slate-400 text-base font-semibold">Indicator:</span>
        <span className="text-cyan-400 font-bold font-mono text-xl">{incident.indicator_value}</span>
      </div>

      {incident.type === "URL" && incident.reputation_status && (
        <div className="flex items-center gap-3">
          <LinkIcon className="h-5 w-5 text-slate-400" />
          <span className="text-slate-400 text-base font-semibold">Reputation:</span>
          <span className={`font-semibold font-mono text-sm px-3 py-1 rounded ${incident.reputation_status === 'Phishing' ? 'bg-red-950/50 text-red-400 border border-red-500/30' : 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30'}`}>
            {incident.reputation_status === 'Phishing' ? '🚨 Phishing' : '✅ Clean'}
          </span>
        </div>
      )}

      {isDualMode ? (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-cyan-950/20 p-4 rounded border border-cyan-500/10 font-mono text-sm space-y-2.5">
            <span className="text-sm text-cyan-400 font-semibold uppercase tracking-wider block mb-2">Target IP</span>
            <div><span className="text-cyan-300/50">City:</span> {incident.geo_city || 'Unknown'}</div>
            <div><span className="text-cyan-300/50">Country:</span> {incident.geo_country || 'Unknown'}</div>
          </div>
          <div className="bg-emerald-950/20 p-4 rounded border border-emerald-500/10 font-mono text-sm space-y-2.5">
            <span className="text-sm text-emerald-400 font-semibold uppercase tracking-wider block mb-2">Trusted IP ({incident.trusted_ip})</span>
            <div><span className="text-emerald-300/50">City:</span> {incident.trusted_ip_city || 'Unknown'}</div>
            <div><span className="text-emerald-300/50">Country:</span> {incident.trusted_ip_country || 'Unknown'}</div>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 mt-2">
          <Globe className="h-5 w-5 text-slate-400 mt-0.5" />
          <div className="flex-1">
            <span className="text-slate-400 block mb-2.5 text-base font-semibold">Enrichment Data:</span>
            {hasGeo ? (
              <div className="bg-cyan-950/30 p-4 rounded border border-cyan-500/20 font-mono text-sm space-y-2">
                <div>Country: <span className="text-cyan-300 font-medium">{incident.geo_country}</span></div>
                <div>City: <span className="text-cyan-300 font-medium">{incident.geo_city}</span></div>
                {incident.geo_isp && (
                  <div>ISP: <span className="text-cyan-300 font-medium">{incident.geo_isp}</span></div>
                )}
              </div>
            ) : (
              <span className="text-white/40 italic text-sm">Location Unknown — enrichment unavailable.</span>
            )}
          </div>
        </div>
      )}

      {/* Impossible Travel Alert */}
      {isTravelAnomaly && (
        <div className="bg-red-950/60 border border-red-500/50 rounded-md p-5 shadow-[0_0_15px_rgba(239,68,68,0.2)] mt-4">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-red-400 mt-0.5 shrink-0" />
            <div>
              <h5 className="text-red-400 font-bold uppercase tracking-wider text-base mb-1.5">
                🚨 Impossible Travel Detected
              </h5>
              <p className="text-red-200/80 text-base font-mono leading-relaxed">
                {isDualMode ? (
                  <>Distance between target IP and trusted user IP is <span className="text-red-300 font-bold">{effectiveDistance?.toLocaleString()} km</span>. Exceeds 500 km anomaly threshold.</>
                ) : (
                  <>Host located in <span className="text-red-300 font-bold">{incident.geo_city}, {incident.geo_country}</span> — <span className="text-red-300 font-bold">{effectiveDistance?.toLocaleString()} km</span> from corporate HQ (Tel Aviv). Exceeds 500 km threshold.</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {incident.is_distance_anomaly && !isTravelAnomaly && (
        <div className="mt-3 bg-red-950/40 border border-red-500/30 text-red-200 p-3 text-base font-semibold rounded uppercase tracking-wider">
          [!] System Alert: Geographic Mismatch Detected during ingestion.
        </div>
      )}
    </div>
  );
}

// ─── Main Dialog Component ────────────────────────────────────────────────────
export function ResolveDialog({ incident, onResolve }: ResolveDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmail = incident.type === "Email";
  const isGeoType = incident.type === "IP" || incident.type === "URL";

  // Smart default classification
  let defaultClassification = "";
  if (incident.is_distance_anomaly || (incident.peer_distance_km ?? 0) > 500 || (incident.distance_km ?? 0) > 500) {
    defaultClassification = "Impossible Travel";
  } else if (incident.reputation_status === "Phishing" || incident.type === "Email" && (incident.is_breached || incident.email_disposable)) {
    defaultClassification = "Phishing Attempt";
  } else if (incident.ssl_status === "UNSECURED") {
    defaultClassification = "Malicious Infrastructure";
  }

  const [classification, setClassification] = useState(defaultClassification);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);
    formData.append("incident_id", incident.id);
    // Explicitly set the dropdown value if not already in formData
    if (!formData.has("resolution_reason")) {
      formData.append("resolution_reason", classification);
    }
    await onResolve(formData, incident.id);
    setIsSubmitting(false);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-black/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-500/60 font-mono text-xs transition-all duration-200"
        >
          Resolve
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-black/90 border border-white/10 hover:border-cyan-500/30 text-white font-mono sm:max-w-[1100px] w-[95vw] shadow-[0_0_50px_rgba(6,182,212,0.15)] transition-all duration-200">
        <DialogHeader className="border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-4">
            {isEmail ? (
              <ShieldOff className="h-8 w-8 text-red-400" />
            ) : (
              <ShieldAlert className="h-8 w-8 text-cyan-400" />
            )}
            <div>
              <DialogTitle className="text-2xl tracking-tight">Resolve Incident</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm mt-1">
                ID: <span className="font-mono text-cyan-400/70">{incident.id}</span>
                {" · "}
                <span className="font-mono text-white/40">{incident.type}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* ── Left Column: Enrichment Panel ── */}
          <div className="h-[550px] overflow-y-auto pr-4 custom-scrollbar space-y-4">
            {isEmail && <EmailIntelPanel incident={incident} />}
            {isGeoType && <GeoIntelPanel incident={incident} />}
          </div>

          {/* ── Right Column: Resolution Form ── */}
          <form action={handleSubmit} className="flex flex-col justify-between h-[550px]">
            <div className="bg-zinc-900/30 border border-white/5 rounded-lg p-5 space-y-6 flex-1 flex flex-col justify-center">
              <div className="space-y-3">
                <label
                  htmlFor="resolution_reason"
                  className="text-sm font-semibold text-cyan-100/80 uppercase tracking-widest block"
                >
                  Classification <span className="text-red-400">*</span>
                </label>
                <Select name="resolution_reason" required value={classification} onValueChange={setClassification}>
                  <SelectTrigger
                    id="resolution_reason"
                    className="w-full bg-black/50 border-white/10 focus:ring-cyan-500 text-white data-[placeholder]:text-white/40 font-mono h-12 text-base px-4"
                  >
                    <SelectValue placeholder="Select Root Cause" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/10 text-white font-mono text-base">
                    <SelectItem value="Human Error">
                      <span className="text-cyan-400">Human Error</span>&nbsp;— False Positive / Accidental
                    </SelectItem>
                    <SelectItem value="Impossible Travel">
                      <span className="text-purple-400">Impossible Travel</span>&nbsp;— Geo-Anomaly Confirmed
                    </SelectItem>
                    <SelectItem value="Phishing Attempt">
                      <span className="text-amber-400">Phishing Attempt</span>&nbsp;— Social Engineering
                    </SelectItem>
                    <SelectItem value="Malicious Infrastructure">
                      <span className="text-red-400">Malicious Infrastructure</span>&nbsp;— C2 / Malware Host
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 flex-1 flex flex-col">
                <label
                  htmlFor="resolution_notes"
                  className="text-sm font-semibold text-cyan-100/80 uppercase tracking-widest block"
                >
                  Analyst Notes
                </label>
                <Textarea
                  id="resolution_notes"
                  name="resolution_notes"
                  placeholder="Justify classification based on Intel..."
                  className="bg-black/50 border-white/10 focus-visible:ring-cyan-500 text-white placeholder:text-white/20 resize-none font-mono flex-1 p-4 text-base min-h-[200px]"
                />
              </div>

              {error && (
                <div className="p-4 rounded-md bg-red-950/50 border border-red-500/50 text-red-200 text-base font-mono">
                  {error}
                </div>
              )}
            </div>

            <div className="pt-6 flex justify-end gap-4 border-t border-white/10 mt-6 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setIsOpen(false)}
                className="bg-transparent border-white/10 text-white hover:bg-white/5 font-mono px-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || !classification}
                className="bg-cyan-600/80 text-white hover:bg-cyan-500 font-mono transition-colors duration-200 px-8"
              >
                {isSubmitting ? "UPDATING..." : "CLOSE CASE"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { ingestIndicator } from "@/app/actions/ingest";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, Command, AlertCircle, UserCheck } from "lucide-react";

type IndicatorType = "IP" | "URL" | "Email";

// Inline regex validators per indicator type
const VALIDATORS: Record<IndicatorType, { pattern: RegExp; hint: string }> = {
  IP: {
    pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
    hint: "e.g. 192.168.1.100",
  },
  URL: {
    pattern: /^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+([/?#].*)?$/i,
    hint: "e.g. suspicious-domain.com or https://malicious.site/path",
  },
  Email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    hint: "e.g. phishing@malicious.com",
  },
};

export function IngestForm({ onSuccess }: { onSuccess?: () => void }) {
  const [indicatorType, setIndicatorType] = useState<IndicatorType>("IP");
  const [indicatorValue, setIndicatorValue] = useState("");
  const [trustedIp, setTrustedIp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Real-time validation
  const validator = VALIDATORS[indicatorType];
  const isValueDirty = indicatorValue.length > 0;
  const isValueValid = !isValueDirty || validator.pattern.test(indicatorValue);
  const isTrustedIpDirty = trustedIp.length > 0;
  const isTrustedIpValid = !isTrustedIpDirty || VALIDATORS.IP.pattern.test(trustedIp);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValueValid) return;

    setIsSubmitting(true);
    setScanProgress(10);
    setError(null);

    const scanInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) { clearInterval(scanInterval); return 90; }
        return prev + 15;
      });
    }, 400);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      type: indicatorType,
      indicator_value: indicatorValue.trim(),
      context: (formData.get("context") as string)?.trim() ?? "",
      ...(indicatorType === "IP" && trustedIp.trim() ? { trusted_ip: trustedIp.trim() } : {}),
    };

    const result = await ingestIndicator(data);
    setScanProgress(100);
    clearInterval(scanInterval);

    setTimeout(() => {
      if (result.success) {
        setSuccessMessage(result.message!);
        toast.success("IoC Ingested", { description: "Indicator added to Triage Queue." });
        if (onSuccess) onSuccess();
      } else {
        setError(result.error!);
        toast.error("Ingestion Failed", { description: result.error });
      }
      setIsSubmitting(false);
      setScanProgress(0);
      setTrustedIp("");
    }, 500);
  }

  // Terminal Success State
  if (successMessage) {
    return (
      <div className="w-full p-8 rounded-xl border border-cyan-500/50 bg-black/80 shadow-[0_0_50px_rgba(6,182,212,0.15)] font-mono text-cyan-400">
        <div className="flex items-center gap-4 mb-6">
          <ShieldCheck className="h-8 w-8 text-cyan-300" />
          <h2 className="text-xl font-bold tracking-widest uppercase">System Response</h2>
        </div>
        <div className="space-y-4 text-sm leading-relaxed border-l-2 border-cyan-500/30 pl-4">
          <p className="opacity-70">&gt; Executing ingestion protocol...</p>
          <p className="opacity-70">&gt; Verifying indicator signatures...</p>
          <p className="opacity-70">&gt; Appending to Threat Intelligence Vault...</p>
          <p className="text-white font-bold tracking-wide mt-4">{successMessage}</p>
        </div>
        <Button
          variant="outline"
          className="mt-8 bg-transparent border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/50 hover:text-cyan-300 w-full"
          onClick={() => { setSuccessMessage(null); setIndicatorValue(""); }}
        >
          Report Another Indicator
        </Button>
      </div>
    );
  }

  return (
    <Card className="bg-zinc-900/80 border-white/20 shadow-[0_0_30px_rgba(6,182,212,0.1)] text-white">
      <CardHeader className="space-y-2 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-cyan-950/50 ring-1 ring-cyan-500/30">
            <Command className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-mono tracking-tight">Threat Ingestion</CardTitle>
            <CardDescription className="text-cyan-200/60 font-mono text-xs uppercase tracking-wider mt-1 block">
              Anonymous Indicator Submission
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Indicator Type Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyan-100/80 font-mono">Indicator Type</label>
            <Select
              name="type"
              value={indicatorType}
              onValueChange={(v) => {
                setIndicatorType(v as IndicatorType);
                setIndicatorValue("");
                setTrustedIp("");
              }}
            >
              <SelectTrigger className="w-full bg-black/50 border-white/10 focus:ring-cyan-500 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-white">
                <SelectItem value="IP">IP Address</SelectItem>
                <SelectItem value="URL">URL / Domain</SelectItem>
                <SelectItem value="Email">Email Address</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payload Input with live regex validation */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyan-100/80 font-mono">
              Payload <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Input
                name="indicator_value"
                value={indicatorValue}
                onChange={(e) => setIndicatorValue(e.target.value)}
                placeholder={validator.hint}
                required
                className={`bg-black/50 border-white/10 focus-visible:ring-cyan-500 text-white placeholder:text-white/20 font-mono pr-8 ${
                  isValueDirty && !isValueValid
                    ? "border-red-500/60 focus-visible:ring-red-500"
                    : isValueDirty && isValueValid
                    ? "border-emerald-500/50"
                    : ""
                }`}
              />
              {isValueDirty && !isValueValid && (
                <AlertCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
              )}
              {isValueDirty && isValueValid && (
                <ShieldCheck className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
              )}
            </div>
            {isValueDirty && !isValueValid && (
              <p className="text-red-400 text-xs font-mono animate-in fade-in">
                Invalid {indicatorType} format. Expected: {validator.hint}
              </p>
            )}
          </div>

          {/* Optional Trusted IP — only shown for IP type */}
          {indicatorType === "IP" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-100/60 font-mono flex items-center gap-2">
                <UserCheck className="h-3.5 w-3.5 text-cyan-500/60" />
                Last Known / Trusted User IP
                <span className="text-white/30 text-[10px] uppercase tracking-widest">(Optional)</span>
              </label>
              <div className="relative">
                <Input
                  name="trusted_ip"
                  value={trustedIp}
                  onChange={(e) => setTrustedIp(e.target.value)}
                  placeholder="e.g. 203.0.113.10 — user's last verified location"
                  className={`bg-black/30 border-dashed border-white/10 focus-visible:ring-cyan-500/50 text-white placeholder:text-white/15 font-mono pr-8 text-sm ${
                    isTrustedIpDirty && !isTrustedIpValid
                      ? "border-red-500/60"
                      : isTrustedIpDirty && isTrustedIpValid
                      ? "border-emerald-500/40"
                      : ""
                  }`}
                />
                {isTrustedIpDirty && isTrustedIpValid && (
                  <ShieldCheck className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/60" />
                )}
                {isTrustedIpDirty && !isTrustedIpValid && (
                  <AlertCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                )}
              </div>
              {isTrustedIpDirty && !isTrustedIpValid && (
                <p className="text-red-400 text-xs font-mono animate-in fade-in">
                  Invalid IP format. Expected: 192.168.1.100
                </p>
              )}
              <p className="text-white/20 text-[10px] font-mono">
                When provided, the system performs a live dual-IP evaluation (Haversine distance between both IPs) instead of the HQ baseline check.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-cyan-100/80 font-mono">Context &amp; Behavior</label>
            <Textarea
              name="context"
              placeholder="Describe the anomalous behavior observed..."
              className="min-h-[100px] bg-black/50 border-white/10 focus-visible:ring-cyan-500 text-white placeholder:text-white/20 resize-none font-mono"
            />
          </div>

          {error && (
            <div className="p-3 rounded bg-red-950/50 border border-red-500/50 text-red-200 text-sm font-mono">
              {error}
            </div>
          )}

          {isSubmitting && (
            <div className="space-y-2 py-2">
              <div className="flex justify-between text-xs font-mono text-cyan-400">
                <span className="animate-pulse">DEEP SCAN IN PROGRESS...</span>
                <span>{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="h-1 bg-cyan-950/50" />
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || (isValueDirty && !isValueValid)}
            className="w-full bg-cyan-600/20 text-cyan-100 border border-cyan-500/50 hover:bg-cyan-600/40 hover:text-white font-mono tracking-widest disabled:opacity-40"
          >
            {isSubmitting ? "TRANSMITTING..." : "INGEST INDICATOR"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

import { Button } from "@/components/ui/button";
import { ShieldAlert, LogIn, Activity, Globe, Zap, Crosshair } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[90vh] w-full max-w-6xl mx-auto space-y-20 px-4 md:px-0 scroll-smooth">
      {/* Radial Gradient Overlay to darken background Text */}
      <div className="absolute inset-0 z-[-1] bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.4)_0%,transparent_100%)] pointer-events-none" />

      {/* Hero Section */}
      <div className="text-center space-y-8 pt-20 relative z-10 w-full max-w-4xl">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-cyan-950/20 border border-cyan-500/20 mb-2 shadow-[0_0_30px_rgba(6,182,212,0.1)] backdrop-blur-md">
          <Activity className="h-6 w-6 text-cyan-400 mr-2" />
          <span className="text-cyan-200 text-sm font-mono tracking-widest uppercase">SentinelHub Command Center</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_20px_rgba(6,182,212,0.3)] pb-2">
          Next-Gen Threat Intelligence
        </h1>

        <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto font-light tracking-wide leading-relaxed">
          Secure your perimeter with military-grade SOC analytics.????
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto h-14 px-8 bg-cyan-600/30 text-cyan-100 border border-cyan-500/50 hover:bg-cyan-600/50 hover:text-white font-mono tracking-widest text-sm uppercase shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all duration-300"
          >
            <Link href="/login">SOC Login <LogIn className="ml-2 h-4 w-4" /></Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-14 px-8 bg-black/40 text-red-100 border-red-500/30 hover:bg-red-950/40 hover:text-white font-mono tracking-widest text-sm uppercase transition-all duration-300"
          >
            <Link href="/report"><ShieldAlert className="mr-2 h-4 w-4 text-red-400" /> Report Threat</Link>
          </Button>
        </div>
      </div>

      {/* Value Proposition: Three Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24 relative z-10">
        <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 flex flex-col items-start gap-4 hover:border-cyan-500/30 transition-colors">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Automated Ingest</h3>
          <p className="text-slate-400 leading-relaxed font-light">
            Instantly log Indicators of Compromise (IoC) via our public portal to trigger automated SOC triage workflows.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 flex flex-col items-start gap-4 hover:border-cyan-500/30 transition-colors">
          <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
            <Globe className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Geo-Enrichment</h3>
          <p className="text-slate-400 leading-relaxed font-light">
            Every IP submission is mapped and cross-referenced against the reporter&apos;s origin to detect impossible travel.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 flex flex-col items-start gap-4 hover:border-cyan-500/30 transition-colors">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
            <Crosshair className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Analyst Resolution</h3>
          <p className="text-slate-400 leading-relaxed font-light">
            Force explicit tactical classifications. Enforce decisions between &apos;User Error&apos; and &apos;Distance Anomaly&apos;.
          </p>
        </div>
      </div>

    </div>
  );
}

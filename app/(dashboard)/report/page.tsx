import { Suspense } from "react";
import { IngestForm } from "@/components/IngestForm";
import { RecentThreats } from "@/components/RecentThreats";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Radio } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ReportPage() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-10 mt-4 pb-20">
      {/* Page Header */}
      <div className="mb-8 border-b border-cyan-500/20 pb-6 font-mono">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 uppercase">Threat Ingest</h1>
        <p className="text-muted-foreground text-sm">Submit anonymous IoCs directly to the Triage Queue</p>
      </div>

      {/* Split Layout: Form + Live Feed */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left: Ingest Form */}
        <div className="w-full lg:w-[58%]">
          <IngestForm />
        </div>

        {/* Right: Live Feed Sidebar */}
        <div className="w-full lg:w-[42%] space-y-4">
          <div className="flex items-center gap-2 font-mono mb-3">
            <div className="relative">
              <Radio className="h-4 w-4 text-red-400" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
            </div>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Live Feed</h2>
            <span className="text-xs text-white/30">— Recent Threats</span>
          </div>

          <Suspense
            fallback={
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-[88px] w-full rounded-lg bg-white/5 border border-white/10"
                  />
                ))}
              </div>
            }
          >
            <RecentThreats />
          </Suspense>

          {/* Privacy notice */}
          <div className="mt-4 p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/15 font-mono text-[11px] text-cyan-400/60 space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3" />
              <span className="uppercase tracking-widest font-bold">Privacy Notice</span>
            </div>
            <p>All submissions are anonymous. No account required. Payloads are never stored in plain-text beyond the indicator value.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

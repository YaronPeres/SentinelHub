"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// ssr:false prevents Radix UI from generating aria-controls IDs during SSR
// that would differ from the client hydration IDs (hydration mismatch fix).
// We do this in a separate Client Component file because Next.js App Router
// does not allow `ssr: false` inside Server Components.
export const TriageTableWrapper = dynamic(
  () => import("@/components/TriageTable").then((m) => m.TriageTable),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-md bg-white/5 border border-white/10" />
        ))}
      </div>
    ),
  }
);

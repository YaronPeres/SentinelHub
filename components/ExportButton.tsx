"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="bg-black/40 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950 hover:text-cyan-300 font-mono text-xs hidden sm:flex"
      onClick={() => window.print()}
    >
      <Download className="mr-2 h-4 w-4" />
      Generate Shift Report
    </Button>
  );
}

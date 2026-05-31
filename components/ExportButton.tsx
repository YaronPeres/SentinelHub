"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportCsv } from "@/app/actions/resolve";
import { toast } from "sonner";

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    const result = await exportCsv();
    if (result.success && result.csv) {
      const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `SentinelZone_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Export Complete", { description: "CSV report downloaded." });
    } else {
      toast.error("Export Failed", { description: result.error });
    }
    setIsExporting(false);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isExporting}
      className="bg-black/40 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950 hover:text-cyan-300 font-mono text-xs hidden sm:flex"
      onClick={handleExport}
    >
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? "Exporting..." : "Generate Shift Report"}
    </Button>
  );
}

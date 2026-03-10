"use client";

import { useState, useEffect } from "react";
import { resolveIncident } from "@/app/actions/resolve";
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
import { ShieldAlert, Globe, Crosshair } from "lucide-react";

type ResolveDialogProps = {
  incident: {
    id: string;
    type: string;
    indicator_value: string;
    is_distance_anomaly: boolean;
    [key: string]: unknown;
  };
};

export function ResolveDialog({ incident }: ResolveDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geoData, setGeoData] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Client-side enrichment fetch for the dialog
  useEffect(() => {
    if (isOpen && incident.type === "IP" && !geoData) {
      fetch(`http://ip-api.com/json/${incident.indicator_value}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            setGeoData(data);
          }
        })
        .catch((err) => console.error("Geo fetch failed", err));
    }
  }, [isOpen, incident.type, incident.indicator_value, geoData]);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);
    
    // Append the incident ID to the form data safely
    formData.append("incident_id", incident.id);

    const result = await resolveIncident(formData);

    setIsSubmitting(false);

    if (result.success) {
      setIsOpen(false);
    } else {
      setError(result.error || "An unknown error occurred.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-black/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950 hover:text-cyan-300 font-mono text-xs"
        >
          Resolve
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-black/80 backdrop-blur-xl border-cyan-500/20 text-white font-mono sm:max-w-[500px] shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
             <ShieldAlert className="h-6 w-6 text-cyan-400" />
            <div>
              <DialogTitle className="text-xl tracking-tight">Resolve Incident</DialogTitle>
              <DialogDescription className="text-cyan-200/60 text-xs mt-1">
                ID: {incident.id.split("-")[0]}...
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Enrichment Context UI */}
        <div className="bg-black/50 border border-white/5 rounded-md p-4 space-y-3 mt-4 text-sm">
          <h4 className="text-cyan-400 font-bold uppercase tracking-wider text-xs border-b border-cyan-500/20 pb-2">Target Geolocation Intel</h4>
          
          <div className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-white/50" />
            <span className="text-white/70">Indicator:</span>
            <span className="text-white font-bold">{incident.indicator_value}</span>
          </div>

          <div className="flex items-start gap-2 pt-2">
            <Globe className="h-4 w-4 text-white/50 mt-0.5" />
            <div className="flex-1">
              <span className="text-white/70 block mb-1">Enrichment Data:</span>
              {incident.type === "IP" ? (
                geoData ? (
                  <div className="bg-cyan-950/30 p-2 rounded border border-cyan-500/20">
                    <div>Country: <span className="text-cyan-300">{geoData.country}</span></div>
                    <div>City: <span className="text-cyan-300">{geoData.city}</span></div>
                    <div>ISP: <span className="text-cyan-300">{geoData.isp}</span></div>
                  </div>
                ) : (
                  <span className="text-cyan-400/50 italic animate-pulse">Querying global intelligence...</span>
                )
              ) : (
                <span className="text-white/40 italic">N/A (Not an IP Address)</span>
              )}
            </div>
          </div>
          
          {incident.is_distance_anomaly && (
            <div className="mt-3 bg-red-950/40 border border-red-500/30 text-red-400 p-2 text-xs rounded uppercase tracking-wider">
              [!] System Alert: Geographic Mismatch Detected during ingestion.
            </div>
          )}
        </div>

        <form action={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <label htmlFor="resolution_reason" className="text-sm font-medium text-cyan-100/80 uppercase tracking-widest text-xs">
              Classification <span className="text-red-400">*</span>
            </label>
            <Select name="resolution_reason" required>
              <SelectTrigger className="w-full bg-black/50 border-white/10 focus:ring-cyan-500 text-white data-[placeholder]:text-white/40 font-mono">
                <SelectValue placeholder="Select Root Cause" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-white font-mono">
                <SelectItem value="User">User (Human Error/Phishing)</SelectItem>
                <SelectItem value="Distance">Distance (Impossible Travel Geo-Anomaly)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="resolution_notes" className="text-sm font-medium text-cyan-100/80 uppercase tracking-widest text-xs">
              Analyst Notes
            </label>
            <Textarea 
              id="resolution_notes" 
              name="resolution_notes" 
              placeholder="Justify classification based on Intel..." 
              className="bg-black/50 border-white/10 focus-visible:ring-cyan-500 text-white placeholder:text-white/20 resize-none font-mono min-h-[80px]"
            />
          </div>

          {error && (
            <div className="p-3 rounded bg-red-950/50 border border-red-500/50 text-red-200 text-sm font-mono">
              {error}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="bg-transparent border-white/10 text-white hover:bg-white/5 font-mono"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-cyan-600/80 text-white hover:bg-cyan-500 font-mono"
            >
              {isSubmitting ? "UPDATING..." : "CLOSE CASE"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

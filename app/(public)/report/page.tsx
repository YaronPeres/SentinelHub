"use client";

import { useState } from "react";
import { ingestIndicator } from "@/app/actions/ingest";
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
import { ShieldCheck, Command } from "lucide-react";

export default function IngestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setScanProgress(10);
    setError(null);
    
    // Simulate deep scanning delay for the UX polish
    const scanInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(scanInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 400);

    // Ensure accurate types match our server action and DB schema
    const data = {
      type: formData.get("type") as "IP" | "URL" | "Email",
      indicator_value: formData.get("indicator_value") as string,
      context: formData.get("context") as string,
    };

    const result = await ingestIndicator(data);

    setScanProgress(100);
    clearInterval(scanInterval);

    // Small delay to let the 100% progress render briefly
    setTimeout(() => {
      if (result.success) {
        setSuccessMessage(result.message!);
      } else {
        setError(result.error!);
      }
      setIsSubmitting(false);
      setScanProgress(0);
    }, 500);
  }

  // Terminal Success State (@ux-copywriter)
  if (successMessage) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-20 p-8 rounded-xl border border-cyan-500/50 bg-black/80 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.15)] font-mono text-cyan-400">
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
          onClick={() => setSuccessMessage(null)}
        >
          Report Another Indicator
        </Button>
      </div>
    );
  }

  // Submission Form State
  return (
    <div className="w-full max-w-xl mx-auto mt-12 relative z-10">
      <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-[0_0_30px_rgba(6,182,212,0.1)] text-white">
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
          <form action={handleSubmit} className="space-y-6">
            
            {/* Indicator Type Select */}
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium text-cyan-100/80 font-mono">
                Indicator Type
              </label>
              <Select name="type" required defaultValue="IP Address">
                <SelectTrigger className="w-full bg-black/50 border-white/10 focus:ring-cyan-500 text-white data-[placeholder]:text-white/40">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10 text-white">
                  <SelectItem value="IP Address">IP Address</SelectItem>
                  <SelectItem value="URL">URL/Domain</SelectItem>
                  <SelectItem value="Email">Email Address</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payload Input */}
            <div className="space-y-2">
              <label htmlFor="indicator_value" className="text-sm font-medium text-cyan-100/80 font-mono">
                Payload <span className="text-red-400">*</span>
              </label>
              <Input 
                id="indicator_value" 
                name="indicator_value" 
                placeholder="e.g., 192.168.1.100 or suspicious-domain.com" 
                required 
                className="bg-black/50 border-white/10 focus-visible:ring-cyan-500 text-white placeholder:text-white/20 font-mono"
              />
            </div>

            {/* Context Textarea */}
            <div className="space-y-2">
              <label htmlFor="context" className="text-sm font-medium text-cyan-100/80 font-mono">
                Context & Behavior
              </label>
              <Textarea 
                id="context" 
                name="context" 
                placeholder="Describe the anomalous behavior observed..." 
                className="min-h-[120px] bg-black/50 border-white/10 focus-visible:ring-cyan-500 text-white placeholder:text-white/20 resize-none font-mono"
              />
            </div>

            {error && (
              <div className="p-3 rounded bg-red-950/50 border border-red-500/50 text-red-200 text-sm font-mono">
                {error}
              </div>
            )}

            {isSubmitting && (
              <div className="space-y-2 py-4">
                <div className="flex justify-between text-xs font-mono text-cyan-400">
                  <span className="animate-pulse">DEEP SCAN IN PROGRESS...</span>
                  <span>{scanProgress}%</span>
                </div>
                <Progress value={scanProgress} className="h-1 bg-cyan-950/50" />
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-cyan-600/20 text-cyan-100 border border-cyan-500/50 hover:bg-cyan-600/40 hover:text-white font-mono tracking-widest"
            >
              {isSubmitting ? "TRANSMITTING..." : "INGEST INDICATOR"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

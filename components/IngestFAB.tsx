"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IngestForm } from "@/components/IngestForm";

export function IngestFAB() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-600/80 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-transform hover:scale-110 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black"
          aria-label="Ingest Threat"
        >
          <Plus className="h-6 w-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl border-none bg-transparent p-0 shadow-none">
        <DialogTitle className="sr-only">Ingest Threat</DialogTitle>
        <IngestForm onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

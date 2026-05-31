"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function LogoutButton({ variant = "button" }: { variant?: "button" | "link" }) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (variant === "link") {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex items-center gap-2 text-white/70 hover:text-cyan-400 transition-colors bg-transparent border-0 cursor-pointer p-0 font-sans text-sm focus:outline-none"
      >
        <LogOut className="h-4 w-4" />
        <span>{isLoggingOut ? "Disconnecting..." : "Log Out"}</span>
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="inline-flex items-center justify-center gap-2 px-4 h-10 
                 bg-white/5 backdrop-blur-md border border-white/20 
                 text-cyan-100 font-mono text-sm tracking-widest uppercase
                 hover:bg-cyan-900/40 hover:text-white hover:border-cyan-500/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]
                 transition-all duration-300"
    >
      <LogOut className="h-4 w-4" />
      {isLoggingOut ? "DISCONNECTING..." : "LOG OUT"}
    </Button>
  );
}

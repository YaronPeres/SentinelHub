"use client";

import { useState } from "react";
import { Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PasswordHealth() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "safe" | "breached">("idle");
  const [breachCount, setBreachCount] = useState<number>(0);

  const checkPassword = async () => {
    if (!password) return;
    setStatus("loading");

    try {
      // Create SHA-1 hash for K-Anonymity
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-1", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();

      const prefix = hashHex.slice(0, 5);
      const suffix = hashHex.slice(5);

      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      if (!response.ok) throw new Error("API request failed");
      
      const text = await response.text();
      const hashes = text.split("\n");

      let foundCount = 0;
      for (const line of hashes) {
        const [hashSuffix, count] = line.split(":");
        if (hashSuffix === suffix) {
          foundCount = parseInt(count.trim(), 10);
          break;
        }
      }

      if (foundCount > 0) {
        setBreachCount(foundCount);
        setStatus("breached");
      } else {
        setStatus("safe");
      }
    } catch (error) {
      console.error("Error checking password health:", error);
      setStatus("idle");
    }
  };

  return (
    <div 
      className={`mx-auto w-full max-w-lg mt-12 p-8 rounded-2xl bg-black/40 backdrop-blur-xl border transition-colors duration-500
        ${status === "safe" ? "border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.15)]" : 
          status === "breached" ? "border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]" : 
          "border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]"}`}
    >
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        
        <div className={`p-4 rounded-full border ${status === "safe" ? "border-green-500/30 bg-green-500/10" : status === "breached" ? "border-red-500/30 bg-red-500/10" : "border-white/10 bg-white/5"}`}>
          <Key className={`h-8 w-8 ${status === "safe" ? "text-green-400" : status === "breached" ? "text-red-400" : "text-green-500"}`} />
        </div>

        <div>
           <h2 className="text-2xl font-bold text-white tracking-tight">Password Health</h2>
           <p className="text-slate-400 font-light mt-2">Verify if your password has been compromised</p>
        </div>

        <div className="flex w-full gap-2">
          <Input 
            type="password"
            placeholder="Enter password to check"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-black/50 border-white/10 text-white font-mono placeholder:text-white/20 focus-visible:ring-green-500"
            onKeyDown={(e) => e.key === "Enter" && checkPassword()}
          />
          <Button 
            onClick={checkPassword}
            disabled={status === "loading" || !password}
            className="bg-green-600/30 text-green-100 border border-green-500/50 hover:bg-green-600/50 hover:text-white font-mono min-w-[100px]"
          >
            {status === "loading" ? "SCANNING" : "SCAN"}
          </Button>
        </div>

        {status === "safe" && (
          <div className="p-4 rounded-lg bg-green-950/30 border border-green-500/30 font-mono text-sm text-green-400 w-full text-left">
            {">"} [RESULT]: 0 MATCHES FOUND.
            <br />
            {">"} This password has not appeared in any known data breaches.
          </div>
        )}

        {status === "breached" && (
          <div className="p-4 rounded-lg bg-red-950/30 border border-red-500/30 font-mono text-sm text-red-400 w-full text-left">
            {">"} [ALERT]: PASSWORD COMPROMISED
            <br />
            {">"} Matches found: {breachCount.toLocaleString()} times.
            <br />
            {">"} Immediate rotation recommended.
          </div>
        )}

        <p className="text-xs text-slate-500 font-mono mt-4 opacity-70">
          Powered by HaveIBeenPwned API.<br/>
          (K-Anonymity SHA-1 hash sequence utilized. No plaintext leaves your browser.)
        </p>
      </div>
    </div>
  );
}

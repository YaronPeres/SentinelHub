"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Command } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="w-full max-w-md mx-auto relative z-10 font-mono">
      <div className="flex justify-center mb-8">
        <div className="p-4 bg-cyan-950/50 rounded-full border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
          <ShieldCheck className="h-10 w-10 text-cyan-400" />
        </div>
      </div>

      <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <CardHeader className="space-y-1 text-center border-b border-white/5 pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight text-white uppercase">Analyst Authentication</CardTitle>
          <CardDescription className="text-cyan-200/60 text-xs tracking-widest uppercase">
            Restricted SOC Clearance Required
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-100/80 uppercase tracking-widest text-xs">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-black/50 border-white/10 focus-visible:ring-cyan-500 text-white placeholder:text-white/20"
                placeholder="analyst@SentinelZone.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-100/80 uppercase tracking-widest text-xs">
                Passphrase
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-black/50 border-white/10 focus-visible:ring-cyan-500 text-white placeholder:text-white/20"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-500/30 text-red-400 p-3 text-xs rounded uppercase tracking-wider text-center">
                [!] {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-600/20 text-cyan-100 border border-cyan-500/50 hover:bg-cyan-600/40 hover:text-white font-mono tracking-widest mt-6"
            >
              {isLoading ? (
                "AUTHENTICATING..."
              ) : (
                <div className="flex items-center gap-2">
                  <Command className="h-4 w-4" /> AUTHORIZE
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

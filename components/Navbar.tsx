import Link from "next/link";
import { Activity, LogIn, LayoutDashboard } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { LogoutButton } from "@/components/LogoutButton";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-6 px-6 py-3 rounded-full bg-black/20 backdrop-blur-lg border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">

        {/* Logo/Home */}
        <Link href="/" className="flex items-center gap-2 group">
          <Activity className="h-5 w-5 text-cyan-400 group-hover:animate-pulse" />
          <span className="font-mono font-bold tracking-tight text-white">
            Sentinel<span className="text-cyan-400">Zone</span>
          </span>
        </Link>

        <div className="h-4 w-px bg-white/20 mx-2"></div>

        {user ? (
          <>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-white/70 hover:text-cyan-400 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-white/20 mx-2"></div>
            <LogoutButton variant="link" />
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 text-white/70 hover:text-cyan-400 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            <span>Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

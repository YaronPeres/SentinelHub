import { Button } from "@/components/ui/button";
import {
  Activity,
  Layers,
  LineChart,
  ShieldCheck,
  AlertTriangle,
  Eye,
  Zap,
  TrendingUp,
  Lock,
  Users,
  BadgeCheck,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { PasswordHealth } from "@/components/PasswordHealth";

// ─── Trust Bar Logos (text-based mock logos) ───────────────────────────────
const TRUST_ORGS = [
  "AcmeCorp",
  "NovaBanking",
  "HealthShield",
  "DefenseNet",
  "GovCyber",
];

// ─── FAQ Items ─────────────────────────────────────────────────────────────
const FAQ = [
  {
    q: "How does the password health check protect my privacy?",
    a: "We use the K-Anonymity model via the HaveIBeenPwned API. Only the first 5 characters of your password's SHA-1 hash are ever transmitted. Your actual password or full hash never leaves your device.",
  },
  {
    q: "Is my submitted threat report anonymous?",
    a: "Yes. The Threat Ingest pipeline accepts indicators without requiring authentication. No personal identifiers are attached to anonymous submissions — only the indicator value, type, and timestamp are stored.",
  },
  {
    q: "Who can view the triage queue?",
    a: "The Triage Queue is gated behind Supabase Row Level Security (RLS). Only authenticated SOC Analysts with a confirmed account can SELECT or UPDATE incidents. Anonymous users can only INSERT (report).",
  },
  {
    q: "Does SentinelZone store or share my data with third parties?",
    a: "Threat indicators are stored only in your organization's Supabase instance. Geographic enrichment uses the public ip-api.com endpoint — only the IP under investigation is queried, never reporter metadata.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative flex flex-col items-center justify-start w-full max-w-6xl mx-auto px-4 md:px-0 scroll-smooth">
      {/* Radial gradient to darken glitch behind text */}
      <div className="absolute inset-0 z-[-1] bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.5)_0%,transparent_100%)] pointer-events-none" />

      {/* ─── HERO ──────────────────────────────────────────────────────── */}
      <section className="text-center space-y-8 pt-20 pb-24 relative z-10 w-full max-w-4xl">
        <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-cyan-950/30 border border-cyan-500/25 shadow-[0_0_30px_rgba(6,182,212,0.1)] backdrop-blur-md">
          <Activity className="h-4 w-4 text-cyan-400 mr-2" />
          <span className="text-cyan-200 text-xs font-mono tracking-widest uppercase">
            Next-Gen Threat Intelligence Platform
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.3)] pb-2 leading-tight">
          EDRs generate noise.<br />
          <span className="text-4xl md:text-6xl text-white/90">SentinelZone extracts signal.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light tracking-wide leading-relaxed">
          While traditional Endpoint Detection and Response (EDR) tools drown you in raw logs, SentinelZone gives <strong className="text-white">SOC teams</strong> a centralized command center to ingest, automatically enrich, and triage real threats.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto h-14 px-10 bg-cyan-600 text-white hover:bg-cyan-500 font-mono tracking-widest text-sm uppercase shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all duration-300"
          >
            <Link href="/login">Start Triage →</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-14 px-8 border-cyan-500/40 text-cyan-400 hover:bg-cyan-950/30 hover:text-cyan-300 font-mono tracking-widest text-sm uppercase transition-all duration-300"
          >
            <Link href="#password-health">Check Password Health</Link>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-white/30 text-xs font-mono animate-bounce pt-4">
          <ChevronDown className="w-4 h-4" />
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* ─── TRUST BAR ─────────────────────────────────────────────────── */}
      <section className="w-full py-8 border-y border-white/5 bg-black/30 relative z-10 -mx-4 px-4 md:-mx-0 md:px-0">
        <p className="text-center text-white/30 font-mono text-xs uppercase tracking-widest mb-6">
          Trusted by organizations across Finance, Healthcare &amp; Defense
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {TRUST_ORGS.map((org) => (
            <span
              key={org}
              className="text-white/25 font-mono font-bold text-lg tracking-widest hover:text-white/50 transition-colors duration-300"
            >
              {org}
            </span>
          ))}
          {/* Compliance badges */}
          <div className="flex items-center gap-3 ml-4 border-l border-white/10 pl-6">
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400/70 bg-emerald-950/30 border border-emerald-500/20 px-2 py-1 rounded-sm">
              <BadgeCheck className="w-3 h-3" /> SOC 2 Type II
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-blue-400/70 bg-blue-950/30 border border-blue-500/20 px-2 py-1 rounded-sm">
              <Lock className="w-3 h-3" /> GDPR Compliant
            </span>
          </div>
        </div>
      </section>

      {/* ─── THE PROBLEM ───────────────────────────────────────────────── */}
      <section className="w-full py-20 relative z-10" id="the-problem">
        <div className="text-center mb-14">
          <span className="text-xs font-mono text-red-400/80 uppercase tracking-widest bg-red-950/30 border border-red-500/20 px-3 py-1 rounded-sm">
            The EDR Problem
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-4 mb-3">
            Legacy tools lack actionable context.
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Standard EDR deployments face two critical failures that cost millions in incident response time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Problem 1 */}
          <div className="bg-black/60 border border-red-500/15 p-8 rounded-xl hover:border-red-500/30 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-red-950/50 rounded-lg border border-red-500/20 group-hover:border-red-500/40 transition-colors">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Alert Fatigue</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              EDR platforms dump an average of <strong className="text-red-300">1,000+ unverified alerts per day</strong>. Without automated enrichment and structured triage workflows, analysts spend 70% of their time chasing false positives.
            </p>
            <div className="bg-red-950/20 border border-red-500/15 rounded-md p-3 font-mono text-xs text-red-300/80">
              [!] Mean Time to Detect (MTTD) increases by 4.3× without automated triage queues.
            </div>
          </div>

          {/* Problem 2 */}
          <div className="bg-black/60 border border-purple-500/15 p-8 rounded-xl hover:border-purple-500/30 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-purple-950/50 rounded-lg border border-purple-500/20 group-hover:border-purple-500/40 transition-colors">
                <Eye className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Operational Blind Spots</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Geo-anomalies and impossible travel patterns — a user logging in from Tokyo and New York within minutes — go undetected without real-time <strong className="text-purple-300">distance-delta analysis</strong> against submitted indicators.
            </p>
            <div className="bg-purple-950/20 border border-purple-500/15 rounded-md p-3 font-mono text-xs text-purple-300/80">
              [!] 63% of insider threats exploit unmonitored geographic access patterns.
            </div>
          </div>
        </div>
      </section>

      {/* ─── AUDIENCE ──────────────────────────────────────────────────── */}
      <section className="w-full py-20 relative z-10" id="audience">
        <div className="text-center mb-14">
          <span className="text-xs font-mono text-cyan-400/80 uppercase tracking-widest bg-cyan-950/30 border border-cyan-500/20 px-3 py-1 rounded-sm">
            Built For Your Role
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-4 mb-3">
            One platform. Every stakeholder.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SOC Analyst */}
          <div className="bg-black/60 border border-cyan-500/15 p-8 rounded-xl hover:border-cyan-500/35 transition-all duration-300 flex flex-col group">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-cyan-950/50 rounded-lg border border-cyan-500/20">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs font-mono text-cyan-400/70 uppercase tracking-widest">For</p>
                <h3 className="text-lg font-semibold text-white">SOC Analysts</h3>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-slate-400 flex-1">
              <li className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" /> Structured triage queue with pagination and optimistic UI</li>
              <li className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" /> Server-side geo-enrichment for IP indicators</li>
              <li className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" /> One-click root cause classification (User / Distance)</li>
            </ul>
            <div className="mt-6 pt-4 border-t border-white/5 font-mono text-xs text-cyan-400/70">
              ↳ <strong className="text-cyan-300">Speed:</strong> Resolve incidents 3× faster with structured workflows
            </div>
          </div>

          {/* CISO */}
          <div className="bg-black/60 border border-purple-500/15 p-8 rounded-xl hover:border-purple-500/35 transition-all duration-300 flex flex-col group">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-purple-950/50 rounded-lg border border-purple-500/20">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-mono text-purple-400/70 uppercase tracking-widest">For</p>
                <h3 className="text-lg font-semibold text-white">CISOs</h3>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-slate-400 flex-1">
              <li className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" /> Real-time KPIs: MTTR, Risk Score, open triage count</li>
              <li className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" /> 30-day threat volume trend visualization</li>
              <li className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" /> Root cause distribution for board reporting</li>
            </ul>
            <div className="mt-6 pt-4 border-t border-white/5 font-mono text-xs text-purple-400/70">
              ↳ <strong className="text-purple-300">ROI:</strong> Justify security budget with measurable incident metrics
            </div>
          </div>

          {/* Employee */}
          <div className="bg-black/60 border border-emerald-500/15 p-8 rounded-xl hover:border-emerald-500/35 transition-all duration-300 flex flex-col group">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-emerald-950/50 rounded-lg border border-emerald-500/20">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-mono text-emerald-400/70 uppercase tracking-widest">For</p>
                <h3 className="text-lg font-semibold text-white">Employees</h3>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-slate-400 flex-1">
              <li className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> K-Anonymity password health checks — no account required</li>
              <li className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> Anonymous threat reporting of suspicious IPs or URLs</li>
              <li className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> Zero sensitive data stored or shared externally</li>
            </ul>
            <div className="mt-6 pt-4 border-t border-white/5 font-mono text-xs text-emerald-400/70">
              ↳ <strong className="text-emerald-300">Privacy-First:</strong> Your password never leaves your browser
            </div>
          </div>
        </div>
      </section>

      {/* ─── PASSWORD HEALTH ───────────────────────────────────────────── */}
      <div id="password-health" className="w-full scroll-mt-24 pb-20 relative z-10">
        <PasswordHealth />
      </div>

      {/* ─── CORE CAPABILITIES ─────────────────────────────────────────── */}
      <section id="core-capabilities" className="w-full py-20 scroll-mt-24 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">Core Capabilities</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="bg-black/60 border border-white/10 p-8 rounded-xl hover:border-cyan-500/30 transition-all duration-300 flex flex-col items-center text-center group">
            <div className="p-4 bg-white/5 rounded-full mb-6 group-hover:bg-cyan-500/10 transition-colors">
              <Layers className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 tracking-wide">Context Over Volume</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Unlike EDRs that provide raw logs, SentinelZone automatically enriches indicators with geographic data and identifies impossible travel anomalies before triage.
            </p>
          </div>
          <div className="bg-black/60 border border-white/10 p-8 rounded-xl hover:border-cyan-500/30 transition-all duration-300 flex flex-col items-center text-center group">
            <div className="p-4 bg-white/5 rounded-full mb-6 group-hover:bg-cyan-500/10 transition-colors">
              <LineChart className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 tracking-wide">Intel Vault Analytics</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Real-time KPIs, MTTR tracking, 30-day threat trends, and root cause distribution dashboards.
            </p>
          </div>
          <div className="bg-black/60 border border-white/10 p-8 rounded-xl hover:border-cyan-500/30 transition-all duration-300 flex flex-col items-center text-center group">
            <div className="p-4 bg-white/5 rounded-full mb-6 group-hover:bg-cyan-500/10 transition-colors">
              <ShieldCheck className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 tracking-wide">Privacy-First Verification</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Zero-knowledge password health checks using the secure K-Anonymity model via HIBP.
            </p>
          </div>
        </div>
      </section>

      {/* ─── THREAT LIFECYCLE ──────────────────────────────────────────── */}
      <section className="w-full py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Threat Lifecycle</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent -z-10" />
          {[
            { num: "01", color: "cyan", label: "Detect & Ingest", desc: "Securely submit anomalous IPs, domains, or behaviors anonymously via the Threat Ingest pipeline." },
            { num: "02", color: "blue", label: "Investigate", desc: "Analysts review indicators and geographic context in the Command Center Triage Queue." },
            { num: "03", color: "purple", label: "Resolve", desc: "Classify root causes, log actions, and automatically update organizational security KPIs." },
          ].map(({ num, color, label, desc }) => (
            <div key={num} className="flex-1 flex flex-col items-center text-center">
              <div className={`w-24 h-24 rounded-full bg-black/80 border border-${color}-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.12)]`}>
                <span className={`text-2xl font-bold text-${color}-400 font-mono`}>{num}</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{label}</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-[280px]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FAQ ───────────────────────────────────────────────────────── */}
      <section className="w-full py-20 relative z-10" id="faq">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-white/40 uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-sm">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-4 mb-3">
            Security & Privacy Questions
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Everything you need to know about how SentinelZone protects your data.
          </p>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          {FAQ.map(({ q, a }) => (
            <div
              key={q}
              className="bg-black/60 border border-white/10 rounded-xl p-6 hover:border-cyan-500/25 transition-all duration-300"
            >
              <h4 className="text-white font-semibold mb-3 flex items-start gap-3">
                <span className="text-cyan-400 font-mono text-lg leading-none shrink-0">?</span>
                {q}
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed pl-7">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="w-full mt-10 py-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground text-sm font-mono">
            © 2026 SentinelZone. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400/60 bg-emerald-950/20 border border-emerald-500/15 px-2 py-0.5 rounded-sm">
              <BadgeCheck className="w-3 h-3" /> SOC 2
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-blue-400/60 bg-blue-950/20 border border-blue-500/15 px-2 py-0.5 rounded-sm">
              <Lock className="w-3 h-3" /> GDPR
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link href="#" className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors">Privacy Policy</Link>
          <Link href="#faq" className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors">FAQ</Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors">Analyst Login</Link>
        </div>
      </footer>
    </div>
  );
}

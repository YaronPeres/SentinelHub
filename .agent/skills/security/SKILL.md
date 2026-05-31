---
name: security-production
description: Production-grade implementation of Supabase Auth, Row Level Security (RLS), Data Protection, and API secrecy.
---

# Security Skill (Production-Ready)

## Supabase Connection & RLS Logic
- **Client/Frontend:** Initialize Supabase purely with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. 
- **Server/Backend:** When bypassing RLS for system tasks (e.g., automated metric calculations), use the Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`) STRICTLY on the server side (never expose to client).
- **Data Protection:** Enforce Row Level Security (RLS) on all Supabase tables. Ensure anonymous users can INSERT alerts, but ONLY authenticated Analysts can SELECT, UPDATE (Resolve), or view the Triage Queue.

## API Execution & Secrecy
- **Execution Context:** All external API calls (e.g., AbuseIPDB, IP-API, HIBP) MUST be executed exclusively within **Next.js Server Actions** or protected API Route Handlers to prevent client-side exposure of Secret API Keys.
- **Privacy Standard:** Implement HIBP password checks strictly using the K-Anonymity model (sending only the first 5 characters of the SHA-1 hash). The full password or full hash MUST NOT leave the server context.
- **Rate Limiting:** Implement basic server-side rate limiting or abuse prevention logic for public endpoints (like the Password Checker or Threat Ingestion) to prevent DDoS or API quota exhaustion.
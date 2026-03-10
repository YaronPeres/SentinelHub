---
name: security
description: Implementation of Supabase Auth and secure API fetch logic.
---

# Security Skill

## Supabase Connection Logic
- **Priority:** Use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to initialize the Supabase client.
- **Fallback:** Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` only if the publishable key fails on legacy auth endpoints.
- **Privacy:** Implement HIBP password checks using the k-anonymity (SHA-1 prefix) model. Never send full hashes.

## API Execution
- All external API calls (AbuseIPDB, HIBP) must be performed in **Next.js Server Actions** or **Route Handlers** to protect secret keys.
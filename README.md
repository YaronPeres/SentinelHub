# 🛡️ SentinelZone
**Next-Gen Autonomous SOC: The Future of Threat Ingestion and Geographic Triage.**

> *"EDRs generate noise. SentinelZone extracts signal."*

![Landing Page](./public/screenshots/landing-page.png)

SentinelZone is a high-performance Security Operations Center (SOC) platform built to automate the ingestion, enrichment, and classification of global threat indicators. It solves the "Context Gap" in modern security by mandating a User vs. Distance resolution logic, ensuring every incident is backed by geographic telemetry.

---

## 🚀 The Technical "Edge"

This project is built on the **2026 Bleeding-Edge Stack**, utilizing the latest major releases for maximum performance and security:

- **Framework**: Next.js 16.1.6 (App Router & Proxy Architecture)
- **Core Engine**: React 19.2.4 (Advanced Server Actions & Transitions)
- **Styling**: Tailwind CSS 4.1.18 (CSS-First Engine) & Shadcn UI
- **Database/Auth**: Supabase (PostgreSQL with strict Row Level Security)
- **Testing**: Playwright 1.58.2 (Full E2E Security Suites)

---

## ✨ Key Features & Showcase

### 1. Premium SaaS Experience
**Glassmorphism 2.0:** A custom-engineered UI using high-blur backdrops (`backdrop-blur-xl`), semi-transparent surfaces (`bg-white/5`), and radial-gradient overlays to ensure legibility over a live terminal background.

**Context-Aware Navigation:** Dual-route architecture using Next.js Route Groups to separate public ingestion from secure analyst operations.

### 2. Autonomous Ingest Engine
Instantly log Indicators of Compromise (IoC) via a public portal to trigger automated SOC triage workflows.

![Threat Ingestion](./public/screenshots/threat-ingestion.png)

- **In-Transit Enrichment:** Automatically extracts reporter metadata and performs real-time geolocation lookups via IP-API.
- **The Distance Delta:** Automatically flags **"Distance Anomalies"** if the reporter's origin mismatches the indicator's location.

### 3. Analyst Command Center
A specialized data table designed for rapid review, featuring glowing threat badges, status-coded rows, and real-time metrics.

![Triage Queue](./public/screenshots/triage-queue.png)

- **High-Density Triage:** See exactly what's Open, in Triage, or Resolved. Geo-Anomalies pulse in red to immediately draw the analyst's attention.
- **Mandatory Resolution:** A "Justified Closure" workflow that requires analysts to classify threats as either *User Error* or *Distance Anomaly*. You cannot simply "delete" an alert.

### 4. Intel Vault Analytics
The Analytics Command Center provides real-time tracking of operational KPIs.

![Analytics Dashboard](./public/screenshots/analytics-dashboard.png)

- **Operational KPIs:** Track Mean Time to Resolution (MTTR), Total Ingested volume, and overall Risk Scores.
- **Root Cause Distribution:** Visual breakdowns of threat types to identify systemic vulnerabilities.
- **Geo-Anomaly Heatmap:** A global view of active and detected distance anomalies plotted in real-time.

---

## 🛠️ Architecture & Workflow

1. **Ingest:** A public user or sensor reports an IoC (IP/URL/Email) through the portal.
2. **Enrich:** A React 19 Server Action captures the reporter's IP and performs a geolocation lookup.
3. **Flag:** If the distance between the reporter and the target exceeds the threshold (e.g. impossible travel), the `is_distance_anomaly` flag is set to `true`.
4. **Triage:** Analysts view the "Glowing" threat in the Command Center queue.
5. **Resolve:** The analyst reviews the side-by-side geographic data and securely resolves the case with a specific, justified reason.

---

## 🔒 Security Model

- **Row Level Security (RLS):** Built into PostgreSQL (Supabase) at the schema level.
- **Anonymous Reporting:** The `incidents` table allows `INSERT` operations from the public, enabling frictionless threat reporting.
- **Authenticated Triage:** `SELECT` and `UPDATE` operations are strictly locked down to authenticated analyst sessions. No unauthorized user can view the triage queue or modify case statuses.

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Supabase Project

### Installation
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Add your Supabase URL and Anon Key to .env.local

# Run the development server (with Turbopack)
npm run dev
```

### Seeding Mock Data
To populate the database with realistic threat data for testing:
```bash
npx tsx seed.ts
```
🛡️ SentinelHub: Next-Gen Autonomous SOC
The Future of Threat Ingestion and Geographic Triage.

SentinelHub is a high-performance Security Operations Center (SOC) platform built to automate the ingestion, enrichment, and classification of global threat indicators. It solves the "Context Gap" in modern security by mandating a User vs. Distance resolution logic, ensuring every incident is backed by geographic telemetry.

🚀 The Technical "Edge"
This project is built on the 2026 Bleeding-Edge Stack, utilizing the latest major releases for maximum performance and security:

Framework: Next.js 16.1.6 (App Router & Proxy Architecture)

Core Engine: React 19.2.4 (Advanced Server Actions & Transitions)

Styling: Tailwind CSS 4.1.18 (CSS-First Engine)

Database/Auth: Supabase (PostgreSQL with Row Level Security)

Testing: Playwright 1.58.2 (Full E2E Security Suites)

✨ Key Features
1. Premium SaaS Experience
Glassmorphism 2.0: A custom-engineered UI using high-blur backdrops (backdrop-blur-xl), semi-transparent surfaces (bg-white/5), and radial-gradient overlays to ensure legibility over a live terminal background.

Context-Aware Navigation: Dual-route architecture using Next.js Route Groups to separate public ingestion from secure analyst operations.

2. Autonomous Ingest Engine
In-Transit Enrichment: Automatically extracts reporter metadata and performs real-time geolocation lookups via IP-API.

The Distance Delta: Automatically flags "Distance Anomalies" if the reporter's origin mismatches the indicator's location.

3. Analyst Command Center
High-Density Triage: A specialized data table designed for rapid review, featuring glowing threat badges and status-coded rows.

Mandatory Resolution: A "Justified Closure" workflow that requires analysts to classify threats as either User Error or Distance Anomaly.

4. Intel Vault Analytics
Operational KPIs: Real-time tracking of Mean Time to Resolution (MTTR) and ingestion volume.

Root Cause Distribution: Visual breakdowns of threat types to identify systemic vulnerabilities.

🛠️ Architecture & Workflow
Ingest: A public user or sensor reports an IoC (IP/URL/Email).

Enrich: A React 19 Server Action captures the reporter's IP and performs a geo-lookup.

Flag: If the distance exceeds the threshold, the is_distance_anomaly flag is set to true.

Triage: Analysts view the "Glowing" threat in the Command Center.

Resolve: The analyst reviews side-by-side geo-data and resolves the case with a specific reason.
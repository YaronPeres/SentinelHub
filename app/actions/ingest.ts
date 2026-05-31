"use server";

import dns from "node:dns";
import https from "node:https";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Zod Schema ────────────────────────────────────────────────────────────────
const IngestSchema = z.object({
  type: z.enum(["IP", "URL", "Email"]),
  indicator_value: z.string().trim().min(1, "Indicator value cannot be empty").max(500),
  context: z.string().trim().max(1000).optional().default(""),
  // Optional second IP for dual-evaluation mode (IP type only)
  trusted_ip: z
    .string()
    .trim()
    .regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Invalid IP format")
    .optional(),
}).strict();

// ─── Constants ─────────────────────────────────────────────────────────────────
const HQ = { lat: 32.0853, lon: 34.7818 }; // Tel Aviv, Israel
const EARTH_RADIUS_KM = 6371;
const ANOMALY_DISTANCE_KM = 500;

// ─── Haversine Formula ─────────────────────────────────────────────────────────
// d = 2R * arcsin(sqrt(sin²(Δφ/2) + cos(φ1)cos(φ2)sin²(Δλ/2)))
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a));
}

// ─── Types ─────────────────────────────────────────────────────────────────────
type GeoResult = {
  status: string;
  country: string;
  city: string;
  isp: string;
  countryCode: string;
  lat: number;
  lon: number;
};

// ─── IP Geolocation Helper ─────────────────────────────────────────────────────
async function fetchGeoFull(ip: string): Promise<GeoResult | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,city,lat,lon,isp,countryCode`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = (await res.json()) as GeoResult;
    return data.status === "success" ? data : null;
  } catch {
    return null;
  }
}

// ─── DNS Resolution Helper ─────────────────────────────────────────────────────
function extractHostname(rawUrl: string): string {
  return rawUrl
    .replace(/^https?:\/\//i, "")
    .split("/")[0]
    .split("?")[0]
    .split(":")[0]
    .toLowerCase()
    .trim();
}

async function resolveHostname(rawUrl: string): Promise<string | null> {
  try {
    const hostname = extractHostname(rawUrl);
    if (!hostname) return null;
    const addresses = await dns.promises.resolve4(hostname);
    return addresses[0] ?? null;
  } catch {
    return null;
  }
}

// ─── SSL/TLS Probe Helper ──────────────────────────────────────────────────────
// Connects to port 443 with strict cert verification.
// SECURED → valid TLS handshake. UNSECURED → TLS/cert error. UNKNOWN → no HTTPS server.
function checkSsl(rawUrl: string): Promise<"SECURED" | "UNSECURED" | "UNKNOWN"> {
  return new Promise((resolve) => {
    const hostname = extractHostname(rawUrl);
    if (!hostname) { resolve("UNKNOWN"); return; }

    const req = https.request(
      { hostname, port: 443, method: "HEAD", path: "/", timeout: 5000, rejectUnauthorized: true },
      () => { resolve("SECURED"); req.destroy(); }
    );

    req.on("error", (err: NodeJS.ErrnoException) => {
      const isTlsError = err.code
        ? /CERT|TLS|HANDSHAKE|DEPTH|UNABLE_TO_VERIFY|SELF_SIGNED/.test(err.code)
        : false;
      resolve(isTlsError ? "UNSECURED" : "UNKNOWN");
      req.destroy();
    });

    req.on("timeout", () => { resolve("UNKNOWN"); req.destroy(); });
    req.end();
  });
}

// ─── URL Reputation via OpenPhish Community Feed ───────────────────────────────
// Public feed, no API key. Updated every 12h by OpenPhish.
async function checkUrlReputation(rawUrl: string): Promise<"Phishing" | "Clean" | "Unknown"> {
  try {
    const hostname = extractHostname(rawUrl);
    if (!hostname) return "Unknown";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch("https://openphish.com/feed.txt", {
      signal: controller.signal,
      headers: { "User-Agent": "SentinelZone-SOC/1.0" },
    });
    clearTimeout(timeoutId);
    if (!res.ok) return "Unknown";

    const text = await res.text();
    const isPhishing = text
      .split("\n")
      .some((line) => line.toLowerCase().includes(hostname));

    return isPhishing ? "Phishing" : "Clean";
  } catch {
    return "Unknown";
  }
}

// ─── Email Breach Check (LeakCheck free API) ──────────────────────────────────
async function checkEmailBreach(email: string): Promise<{
  is_breached: boolean;
  breach_count: number;
  breach_names: string[];
}> {
  const FALLBACK = { is_breached: false, breach_count: 0, breach_names: [] };
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(
      `https://leakcheck.io/api/public?check=${encodeURIComponent(email)}`,
      { signal: controller.signal, headers: { "User-Agent": "SentinelZone-SOC/1.0" } }
    );
    clearTimeout(timeoutId);
    if (!res.ok) return FALLBACK;

    const data = (await res.json()) as {
      success: boolean;
      found: number;
      sources?: { name: string }[];
    };
    if (!data.success || !data.found) return FALLBACK;

    return {
      is_breached: data.found > 0,
      breach_count: data.found,
      breach_names: (data.sources ?? []).map((s) => s.name).filter(Boolean),
    };
  } catch {
    console.warn(JSON.stringify({
      event: "leakcheck_api_failure",
      message: "LeakCheck unavailable. Continuing with is_breached=false.",
      timestamp: new Date().toISOString(),
    }));
    return FALLBACK;
  }
}

// ─── Email Deliverability & Disposable Check (Disify free API) ─────────────────
// disify.com/api/email/{email} — no API key, free tier.
// Returns: { format, domain, disposable, dns }
async function checkEmailDisify(email: string): Promise<{
  email_deliverable: boolean;
  email_disposable: boolean;
}> {
  const FALLBACK = { email_deliverable: false, email_disposable: false };
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(
      `https://disify.com/api/email/${encodeURIComponent(email)}`,
      { signal: controller.signal, headers: { "User-Agent": "SentinelZone-SOC/1.0" } }
    );
    clearTimeout(timeoutId);
    if (!res.ok) return FALLBACK;

    const data = (await res.json()) as {
      format?: boolean;
      domain?: boolean;
      disposable?: boolean;
      dns?: boolean;
    };

    return {
      email_deliverable: !!(data.dns && data.domain && data.format),
      email_disposable: !!data.disposable,
    };
  } catch {
    console.warn(JSON.stringify({
      event: "disify_api_failure",
      message: "Disify unavailable. Continuing with defaults.",
      timestamp: new Date().toISOString(),
    }));
    return FALLBACK;
  }
}

// ─── Main Server Action ────────────────────────────────────────────────────────
export async function ingestIndicator(rawData: unknown) {
  const parsed = IngestSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { success: false, error: `Validation Error: ${firstError?.message ?? "Invalid input."}` };
  }
  const data = parsed.data;

  try {
    let is_distance_anomaly = false;
    let severity = "Medium";
    const enrichmentFields: Record<string, unknown> = {};

    // ── IP ──────────────────────────────────────────────────────────────────
    if (data.type === "IP") {
      const isDualMode = !!data.trusted_ip;

      if (isDualMode && data.trusted_ip) {
        // Dual-IP mode: fetch both geo records in parallel, Haversine between them
        const [investigatedGeo, trustedGeo] = await Promise.all([
          fetchGeoFull(data.indicator_value),
          fetchGeoFull(data.trusted_ip),
        ]);

        if (investigatedGeo) {
          enrichmentFields.geo_lat = investigatedGeo.lat;
          enrichmentFields.geo_lon = investigatedGeo.lon;
          enrichmentFields.geo_city = investigatedGeo.city;
          enrichmentFields.geo_country = investigatedGeo.country;
          enrichmentFields.geo_isp = investigatedGeo.isp;
          // Baseline distance from HQ for map plotting
          enrichmentFields.distance_km = Math.round(
            haversineKm(HQ.lat, HQ.lon, investigatedGeo.lat, investigatedGeo.lon)
          );
        }

        if (trustedGeo) {
          enrichmentFields.trusted_ip = data.trusted_ip;
          enrichmentFields.trusted_ip_city = trustedGeo.city;
          enrichmentFields.trusted_ip_country = trustedGeo.country;
          enrichmentFields.trusted_ip_lat = trustedGeo.lat;
          enrichmentFields.trusted_ip_lon = trustedGeo.lon;
        }

        if (investigatedGeo && trustedGeo) {
          const peerDist = Math.round(
            haversineKm(trustedGeo.lat, trustedGeo.lon, investigatedGeo.lat, investigatedGeo.lon)
          );
          enrichmentFields.peer_distance_km = peerDist;
          is_distance_anomaly = peerDist > ANOMALY_DISTANCE_KM;
          if (is_distance_anomaly) severity = "Critical";
          console.log(JSON.stringify({
            event: "dual_ip_evaluation",
            peer_distance_km: peerDist,
            is_anomaly: is_distance_anomaly,
            timestamp: new Date().toISOString(),
          }));
        }
      } else {
        // Single-IP mode: Haversine vs Tel Aviv HQ
        const geo = await fetchGeoFull(data.indicator_value);
        if (geo) {
          const distance_km = Math.round(haversineKm(HQ.lat, HQ.lon, geo.lat, geo.lon));
          is_distance_anomaly = distance_km > ANOMALY_DISTANCE_KM;
          enrichmentFields.geo_lat = geo.lat;
          enrichmentFields.geo_lon = geo.lon;
          enrichmentFields.geo_city = geo.city;
          enrichmentFields.geo_country = geo.country;
          enrichmentFields.geo_isp = geo.isp;
          enrichmentFields.distance_km = distance_km;
          if (is_distance_anomaly) {
            severity = "Critical";
            console.log(JSON.stringify({
              event: "distance_anomaly_detected",
              distance_km,
              city: geo.city,
              country: geo.country,
              timestamp: new Date().toISOString(),
            }));
          }
        }
      }
    }

    // ── URL ─────────────────────────────────────────────────────────────────
    if (data.type === "URL") {
      // Run DNS resolution, SSL probe, and reputation check in parallel
      const [resolvedIp, sslStatus, reputationStatus] = await Promise.all([
        resolveHostname(data.indicator_value),
        checkSsl(data.indicator_value),
        checkUrlReputation(data.indicator_value),
      ]);

      enrichmentFields.ssl_status = sslStatus;
      enrichmentFields.reputation_status = reputationStatus;

      if (resolvedIp) {
        const geo = await fetchGeoFull(resolvedIp);
        if (geo) {
          const distance_km = Math.round(haversineKm(HQ.lat, HQ.lon, geo.lat, geo.lon));
          is_distance_anomaly = distance_km > ANOMALY_DISTANCE_KM;
          enrichmentFields.geo_lat = geo.lat;
          enrichmentFields.geo_lon = geo.lon;
          enrichmentFields.geo_city = geo.city;
          enrichmentFields.geo_country = geo.country;
          enrichmentFields.geo_isp = geo.isp;
          enrichmentFields.distance_km = distance_km;
        }
      }

      // Elevate severity for confirmed threats
      if (reputationStatus === "Phishing" || sslStatus === "UNSECURED") {
        severity = "Critical";
      } else if (is_distance_anomaly) {
        severity = "High";
      }

      console.log(JSON.stringify({
        event: "url_enrichment_complete",
        ssl: sslStatus,
        reputation: reputationStatus,
        resolvedIp: resolvedIp ?? "unresolved",
        timestamp: new Date().toISOString(),
      }));
    }

    // ── Email ────────────────────────────────────────────────────────────────
    if (data.type === "Email") {
      // Run LeakCheck and Disify in parallel
      const [breachData, disifyData] = await Promise.all([
        checkEmailBreach(data.indicator_value),
        checkEmailDisify(data.indicator_value),
      ]);

      enrichmentFields.is_breached = breachData.is_breached;
      enrichmentFields.breach_count = breachData.breach_count;
      enrichmentFields.breach_names = breachData.breach_names;
      enrichmentFields.email_deliverable = disifyData.email_deliverable;
      enrichmentFields.email_disposable = disifyData.email_disposable;

      if (breachData.is_breached || disifyData.email_disposable) severity = "Critical";
      else if (!disifyData.email_deliverable) severity = "High";
    }

    // ── Insert into Supabase ─────────────────────────────────────────────────
    const { error: insertError } = await supabase.from("incidents").insert({
      type: data.type,
      indicator_value: data.indicator_value,
      context: data.context,
      severity,
      status: "Open",
      is_distance_anomaly,
      ...enrichmentFields,
    });

    if (insertError) {
      console.error(JSON.stringify({
        event: "supabase_insert_error",
        code: insertError.code,
        message: insertError.message,
        timestamp: new Date().toISOString(),
      }));
      return { success: false, error: "Database ingestion failed. Please try again." };
    }

    revalidatePath("/dashboard");
    revalidatePath("/analytics");

    return { success: true, message: "[SUCCESS] IoC INGESTED. STATUS: TRIAGE_PENDING." };
  } catch (error) {
    console.error(JSON.stringify({
      event: "ingest_action_unhandled_error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }));
    return { success: false, error: "Internal server error during ingestion." };
  }
}

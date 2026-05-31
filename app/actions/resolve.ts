"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- Zod Schema (safety-and-guardrails-production + soc-logic-production) ---
// Enforces strict root-cause classification — 4 production SOC categories.
const ResolveSchema = z.object({
  incident_id: z.string().uuid("Invalid incident ID format."),
  resolution_reason: z.enum(
    ["Human Error", "Impossible Travel", "Phishing Attempt", "Malicious Infrastructure"],
    { error: "Root Cause classification is mandatory." }
  ),
  resolution_notes: z.string().trim().max(500).optional().default(""),
}).strict();

export async function resolveIncident(formData: FormData) {
  try {
    const supabase = await createClient();
    // Authenticate the explicit user session (security-production)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized: Active analyst session required." };
    }

    // --- Strict Zod validation on raw FormData ---
    const rawPayload = {
      incident_id: formData.get("incident_id"),
      resolution_reason: formData.get("resolution_reason"),
      resolution_notes: formData.get("resolution_notes") ?? "",
    };

    const parsed = ResolveSchema.safeParse(rawPayload);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return { success: false, error: firstError?.message ?? "Validation failed." };
    }
    const { incident_id, resolution_reason, resolution_notes } = parsed.data;

    // Attempt the update in Supabase
    const { error: updateError } = await supabase
      .from("incidents")
      .update({
        status: "Resolved",
        resolution_reason,
        resolution_notes: resolution_notes || null,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", incident_id);

    if (updateError) {
      // Structured log — redact from client (safety-and-guardrails-production)
      console.error(JSON.stringify({
        event: "supabase_update_error",
        code: updateError.code,
        incident_id,
        analyst_id: user.id,
        timestamp: new Date().toISOString(),
      }));
      return { success: false, error: "Failed to update incident status." };
    }

    // Structured observability log (devops-deployer)
    console.log(JSON.stringify({
      event: "incident_resolved",
      incident_id,
      resolution_reason,
      analyst_id: user.id,
      timestamp: new Date().toISOString(),
    }));

    // Revalidate both dashboard and analytics so Intel Vault KPIs refresh (performance-optimizer)
    revalidatePath("/dashboard");
    revalidatePath("/analytics");

    return {
      success: true,
      message: `[SUCCESS] INCIDENT ${incident_id.split("-")[0]} CLOSED.`,
    };
  } catch (error) {
    console.error(JSON.stringify({
      event: "resolve_action_unhandled_error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }));
    return { success: false, error: "Internal server error during resolution." };
  }
}

export async function bulkResolveIncidents(incidentIds: string[]) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized: Active analyst session required." };
    }

    if (incidentIds.length === 0) return { success: true, message: "No incidents selected." };

    const { error: updateError } = await supabase
      .from("incidents")
      .update({
        status: "Resolved",
        resolution_reason: "User", // default for bulk
        resolution_notes: "Bulk resolved by analyst.",
        resolved_at: new Date().toISOString(),
      })
      .in("id", incidentIds);

    if (updateError) {
      return { success: false, error: "Failed to bulk update incidents." };
    }

    // Single audit log entry per instructions
    console.log(JSON.stringify({
      event: "bulk_incident_resolved",
      count: incidentIds.length,
      message: `Analyst performed bulk resolution on ${incidentIds.length} incidents.`,
      analyst_id: user.id,
      timestamp: new Date().toISOString(),
    }));

    revalidatePath("/dashboard");
    revalidatePath("/analytics");

    return {
      success: true,
      message: `[SUCCESS] ${incidentIds.length} INCIDENTS CLOSED.`,
    };
  } catch (error) {
    return { success: false, error: "Internal server error during bulk resolution." };
  }
}

export async function exportCsv() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("incidents")
    .select("id, type, indicator_value, severity, status, resolution_reason, created_at, resolved_at")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { success: false, error: "Failed to fetch incidents" };
  }

  const header = ["ID", "Type", "Indicator", "Severity", "Status", "Resolution Reason", "Created At", "Resolved At"];
  const rows = data.map(i => [
    i.id,
    i.type,
    i.indicator_value,
    i.severity,
    i.status,
    i.resolution_reason || "",
    i.created_at,
    i.resolved_at || ""
  ]);

  const csvContent = [header, ...rows]
    .map(e => e.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return { success: true, csv: csvContent };
}

// checkImpossibleTravel — reads the precomputed distance_km stored at ingest time.
// No live API calls: zero network latency, instant render in the ResolveDialog.
export async function checkImpossibleTravel(incidentId: string) {
  try {
    const supabase = await createClient();

    const { data: incident } = await supabase
      .from("incidents")
      .select("type, distance_km, geo_city, geo_country")
      .eq("id", incidentId)
      .single();

    if (!incident || (incident.type !== "IP" && incident.type !== "URL")) {
      return { success: true, warning: null };
    }

    const distanceKm: number | null = incident.distance_km ?? null;
    // Flag if hosted more than 500 km from Tel Aviv HQ
    if (distanceKm !== null && distanceKm > 500) {
      return {
        success: true,
        warning: {
          distance: distanceKm,
          city: incident.geo_city ?? "Unknown",
          country: incident.geo_country ?? "Unknown",
        },
      };
    }

    return { success: true, warning: null };
  } catch (error) {
    console.error(JSON.stringify({
      event: "check_impossible_travel_error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }));
    return { success: false, warning: null };
  }
}


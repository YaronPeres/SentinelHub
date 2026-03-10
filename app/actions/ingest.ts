"use server";

import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";

type IngestData = {
  type: "IP" | "URL" | "Email";
  indicator_value: string;
  context: string;
};

export async function ingestIndicator(data: IngestData) {
  try {
    const headersList = await headers();
    // Vercel and most proxies use x-forwarded-for. Fallback to a localhost IP for testing.
    const reporterIp = headersList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    
    let is_distance_anomaly = false;

    // The 'Distance Delta' Logic (@soc-logic)
    if (data.type === "IP" || (data.type as string) === "IP Address") {
      try {
        // Fetch geography for the reported IP
        const reportedIpRes = await fetch(`http://ip-api.com/json/${data.indicator_value}`);
        const reportedIpGeo = await reportedIpRes.json();

        // Fetch geography for the reporter's IP
        // Note: 127.0.0.1 won't return a country on ip-api, but for production this logic holds.
        const reporterIpRes = await fetch(`http://ip-api.com/json/${reporterIp}`);
        const reporterIpGeo = await reporterIpRes.json();

        if (
          reportedIpGeo.status === "success" && 
          reporterIpGeo.status === "success" &&
          reportedIpGeo.countryCode !== reporterIpGeo.countryCode
        ) {
          is_distance_anomaly = true;
          console.log(`[DISTANCE ANOMALY] Reporter (${reporterIpGeo.countryCode}) reported IP in (${reportedIpGeo.countryCode})`);
        }
      } catch (error) {
        console.error("IP-API Enrichment Failed:", error);
      }
    }

    // Insert into Supabase
    // Using the anon key implicitly configured in lib/supabase.ts (per @data-integrity RLS policy: allow anon INSERT)
    const { error: insertError } = await supabase
      .from("incidents")
      .insert({
        type: (data.type as string) === "IP Address" ? "IP" : data.type,
        indicator_value: data.indicator_value,
        context: data.context,
        severity: "Medium", // Default severity for raw ingest
        status: "Open", // Default status
        is_distance_anomaly: is_distance_anomaly
      });

    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      return { success: false, error: "Database ingestion failed." };
    }

    return { 
      success: true, 
      message: "[SUCCESS] IoC INGESTED. STATUS: TRIAGE_PENDING." 
    };

  } catch (error) {
    console.error("Ingest Action Error:", error);
    return { success: false, error: "Internal server error during ingestion." };
  }
}

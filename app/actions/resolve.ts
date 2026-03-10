"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function resolveIncident(formData: FormData) {
  try {
    const supabase = await createClient();
    // Authenticate the explicit user session
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized: Active session required." };
    }

    const incidentId = formData.get("incident_id") as string;
    const resolutionReason = formData.get("resolution_reason") as string;
    const resolutionNotes = formData.get("resolution_notes") as string;

    if (!incidentId || !resolutionReason) {
      return { success: false, error: "Resolution reason is mandatory." };
    }

    // Attempt the update in Supabase
    const { error: updateError } = await supabase
      .from("incidents")
      .update({
        status: "Resolved",
        resolution_reason: resolutionReason,
        resolution_notes: resolutionNotes || null,
        resolved_at: new Date().toISOString()
      })
      .eq("id", incidentId);

    if (updateError) {
      console.error("Supabase Update Error:", updateError);
      return { success: false, error: "Failed to update incident status." };
    }

    // Refresh the dashboard queue
    revalidatePath("/dashboard");

    return { 
      success: true, 
      message: `[SUCCESS] INCIDENT ${incidentId} CLOSED.` 
    };

  } catch (error) {
    console.error("Resolve Action Error:", error);
    return { success: false, error: "Internal server error during resolution." };
  }
}

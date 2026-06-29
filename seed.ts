import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

const mockIncidents = [
  {
    type: "IP",
    indicator_value: "192.168.1.100",
    severity: "Medium",
    status: "Open",
    context: "Multiple failed login attempts from an internal IP address within 5 minutes.",
    is_distance_anomaly: false,
  },
  {
    type: "IP",
    indicator_value: "45.33.32.156",
    severity: "High",
    status: "Triage",
    context: "Detected scanning activities targeting SSH port 22.",
    is_distance_anomaly: true,
  },
  {
    type: "URL",
    indicator_value: "http://malicious-login-update.com/login",
    severity: "Critical",
    status: "Open",
    context: "Phishing link distributed via company email. Looks like a credential harvester.",
    is_distance_anomaly: false,
  },
  {
    type: "Email",
    indicator_value: "admin-update@support-microsoft.net",
    severity: "High",
    status: "Resolved",
    context: "Spear-phishing email targeting HR department.",
    is_distance_anomaly: false,
    resolution_reason: "User",
    resolution_notes: "Confirmed phishing attempt. Blocked sender domain on email gateway.",
    resolved_at: new Date().toISOString(),
  },
  {
    type: "IP",
    indicator_value: "103.14.52.19",
    severity: "Medium",
    status: "Open",
    context: "Unusual outbound traffic to an unknown geographic region.",
    is_distance_anomaly: true,
  },
  {
    type: "URL",
    indicator_value: "https://secure-billing.update.com",
    severity: "Low",
    status: "Resolved",
    context: "User reported suspicious URL in text message.",
    is_distance_anomaly: false,
    resolution_reason: "User",
    resolution_notes: "Investigated and found it to be a false positive. Valid billing site for new vendor.",
    resolved_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    type: "Email",
    indicator_value: "ceo.urgent.request@gmail.com",
    severity: "Critical",
    status: "Triage",
    context: "CEO fraud attempt requesting urgent wire transfer.",
    is_distance_anomaly: false,
  },
  {
    type: "IP",
    indicator_value: "201.55.90.12",
    severity: "High",
    status: "Open",
    context: "IP address associated with known botnet C2 servers.",
    is_distance_anomaly: true,
  }
];

async function seed() {
  console.log("Seeding mock data to Supabase...");
  
  const { error } = await supabase
    .from("incidents")
    .insert(mockIncidents);

  if (error) {
    console.error("Error inserting mock data:", error);
  } else {
    console.log(`Successfully inserted mock incidents!`);
  }
}

seed();

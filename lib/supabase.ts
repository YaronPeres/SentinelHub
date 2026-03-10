import { createClient } from '@supabase/supabase-js';

// We prioritize the NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as per the security skill.
// We fallback to NEXT_PUBLIC_SUPABASE_ANON_KEY only if the publishable key fails on legacy endpoints.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const supabase = createClient(supabaseUrl, supabaseKey);

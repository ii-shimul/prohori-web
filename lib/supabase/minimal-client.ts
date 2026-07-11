import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();
export const supabase = createClient(supabaseUrl, supabasePublishableKey);

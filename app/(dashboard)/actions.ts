"use server";

import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  await requireAuth();
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

"use server";

import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error: string | null;
};

export const initialLoginState: LoginState = { error: null };

export async function signIn(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return { error: "Authentication is not configured. Add Supabase environment values first." };
  }

  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Enter your email and password." };
  }

  const normalizedEmail = email.trim();

  if (!normalizedEmail || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    return { error: "Email or password is incorrect. Check both values and try again." };
  }

  redirect("/dashboard");
}

import { LoginForm } from "@/components/auth/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const isConfigured = isSupabaseConfigured();

  return (
    <main id="main-content" className="flex flex-1 items-center justify-center bg-[var(--surface-1)] p-6">
      <section aria-labelledby="login-title" className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.14em] text-primary uppercase">Prohori</p>
        <h1 id="login-title" className="mt-3 text-balance text-3xl font-semibold tracking-tight">Sign In</h1>
        <p className="mt-4 text-pretty leading-7 text-muted-foreground">
          Use seeded Supabase credentials. Authentication protects session routes; NestJS protects all domain data.
        </p>
        {!isConfigured ? (
          <p className="mt-6 rounded-lg border border-cta-gold/60 bg-cta-gold/20 p-3 text-sm text-primary" role="alert">
            Authentication is not configured. Add Supabase environment values to `.env.local`.
          </p>
        ) : null}
        <LoginForm disabled={!isConfigured} />
      </section>
    </main>
  );
}

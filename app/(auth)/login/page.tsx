"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/minimal-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (err) {
        setError(err.message || "Email or password is incorrect. Check both values and try again.");
        setLoading(false);
      } else {
        // Direct browser redirect
        window.location.href = "/dashboard";
      }
    } catch (ex) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main id="main-content" className="flex flex-1 items-center justify-center bg-[var(--surface-1)] p-6">
      <section aria-labelledby="login-title" className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.14em] text-primary uppercase">Prohori</p>
        <h1 id="login-title" className="mt-3 text-balance text-3xl font-semibold tracking-tight">Sign In</h1>
        <p className="mt-4 text-pretty leading-7 text-muted-foreground">
          Password for all accounts: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">prohori-demo-2026</code>
        </p>
        <details className="mt-3 text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">Available accounts</summary>
          <ul className="mt-2 space-y-1">
            <li><code className="bg-muted px-1 rounded">operations_a@prohori.com</code> — Provider Operations A</li>
            <li><code className="bg-muted px-1 rounded">demo.admin@prohori.com</code> — Demo Administrator</li>
            <li><code className="bg-muted px-1 rounded">agent_a@prohori.com</code> — Agent A</li>
            <li><code className="bg-muted px-1 rounded">admin@prohori.com</code> — Admin</li>
          </ul>
        </details>

        <form onSubmit={handleLogin} className="mt-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input
              autoComplete="email"
              id="email"
              name="email"
              placeholder="name@example.com"
              required
              spellCheck={false}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <Input
              autoComplete="current-password"
              id="password"
              name="password"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <Button className="w-full cursor-pointer" disabled={loading} type="submit">
            {loading ? "Signing In…" : "Sign In"}
          </Button>
        </form>
      </section>
    </main>
  );
}

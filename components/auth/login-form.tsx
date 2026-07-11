"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { signIn } from "@/app/(auth)/login/actions";
import { initialLoginState } from "@/app/(auth)/login/state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? "Signing In…" : "Sign In"}
    </Button>
  );
}

export function LoginForm({ disabled }: { disabled: boolean }) {
  const [state, formAction] = useActionState(signIn, initialLoginState);

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Input
          autoComplete="email"
          disabled={disabled}
          id="email"
          name="email"
          placeholder="name@example.com…"
          required
          spellCheck={false}
          type="email"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <Input
          autoComplete="current-password"
          disabled={disabled}
          id="password"
          name="password"
          required
          type="password"
        />
      </div>
      <div aria-live="polite">
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      </div>
      <SubmitButton />
    </form>
  );
}

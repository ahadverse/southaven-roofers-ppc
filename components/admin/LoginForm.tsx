"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";

export function LoginForm({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Username</span>
        <input
          name="username"
          autoComplete="username"
          required
          disabled={disabled}
          className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100 disabled:bg-slate-100"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={disabled}
          className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100 disabled:bg-slate-100"
        />
      </label>
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || disabled}
        className="w-full rounded-xl bg-brand-900 px-4 py-3 font-bold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

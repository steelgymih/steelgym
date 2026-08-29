import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { loginHtml } from "@/lib/html-pages";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  server: {
    handlers: {
      GET: async ({ request }) => {
        const e = new URL(request.url).searchParams.get("e") || "";
        return new Response(loginHtml(e), {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});

function LoginPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/member-login", {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      });
      const j = (await r.json()) as { token?: string; error?: string; role?: string };
      if (!r.ok || !j.token) {
        setError(j.error || "No se pudo entrar");
        setBusy(false);
        return;
      }
      try {
        sessionStorage.setItem("grok-auth.bearer-token", j.token);
      } catch {
        /* ignore */
      }
      window.location.replace(j.role === "admin" ? "/admin" : "/socios");
    } catch {
      setError("No se pudo entrar");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-svh bg-bg px-4 py-10">
      <div className="mx-auto max-w-md">
        <a href="/" className="font-display text-sm tracking-[0.2em] text-muted">
          STEEL GYM
        </a>
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.28em] text-red">
          Socios
        </p>
        <h1 className="mt-2 text-3xl font-bold">Entra a tu plan</h1>
        <p className="mt-2 text-sm text-muted">
          Usa el correo y la clave que te dieron al darte de alta.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted">
              Correo
            </span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              inputMode="email"
              required
              className="h-11 w-full rounded-md border border-border bg-elevated px-3.5 text-base"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted">
              Contraseña
            </span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              className="h-11 w-full rounded-md border border-border bg-elevated px-3.5 text-base"
            />
          </label>
          {error ? <p className="text-sm text-red">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-fg text-sm font-semibold text-bg disabled:opacity-40"
          >
            {busy ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <p className="mt-6 text-sm text-muted">
          ¿No puedes entrar? En sucursal te desanclan o te dan clave nueva.{" "}
          <a
            className="text-steel underline"
            href="https://wa.me/526563532967?text=Hola%2C%20no%20puedo%20entrar%20a%20la%20app%20STEEL%20GYM."
          >
            WhatsApp
          </a>
        </p>
        <p className="mt-16 text-[11px] text-subtle">
          <a href="/admin">Staff</a>
        </p>
      </div>
    </div>
  );
}

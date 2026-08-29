import { createFileRoute } from "@tanstack/react-router";
import { performMemberLogin } from "@/lib/member-login.server";
import { enteringHtml } from "@/lib/html-pages";
import { SESSION_TOKEN_COOKIE } from "@/lib/auth/server";

function cookieHeader(token: string, request: Request) {
  const https = new URL(request.url).protocol === "https:";
  if (https) {
    return `${SESSION_TOKEN_COOKIE}=${token}; Path=/; SameSite=Lax; Max-Age=2592000; HttpOnly; Secure`;
  }
  return `grok-auth.session_token=${token}; Path=/; SameSite=Lax; Max-Age=2592000`;
}

async function handlePost(request: Request) {
  let email = "";
  let password = "";
  const wantsJson = (request.headers.get("accept") || "").includes("application/json");
  try {
    const form = await request.formData();
    email = String(form.get("email") ?? "");
    password = String(form.get("password") ?? "");
  } catch {
    /* empty */
  }
  try {
    const { token, role } = await performMemberLogin(email, password);
    const next = role === "admin" ? "/admin" : "/socios";
    if (wantsJson) {
      return new Response(JSON.stringify({ token, role, next }), {
        status: 200,
        headers: {
          "content-type": "application/json",
          "set-cookie": cookieHeader(token, request),
          "cache-control": "no-store",
        },
      });
    }
    return new Response(enteringHtml(token), {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "set-cookie": cookieHeader(token, request),
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "No se pudo entrar";
    if (wantsJson) {
      return new Response(JSON.stringify({ error: msg }), {
        status: 401,
        headers: { "content-type": "application/json", "cache-control": "no-store" },
      });
    }
    return new Response(null, {
      status: 303,
      headers: { location: `/login?e=${encodeURIComponent(msg)}` },
    });
  }
}

export const Route = createFileRoute("/api/member-login")({
  server: {
    handlers: {
      GET: () =>
        new Response(null, {
          status: 303,
          headers: { location: "/login" },
        }),
      POST: ({ request }) => handlePost(request),
    },
  },
});

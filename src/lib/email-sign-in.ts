import { authClient } from "@/lib/auth/client";
import { loginWithPassword } from "@/lib/member-fns";

const BEARER_KEY = "grok-auth.bearer-token";

function saveToken(token: string | null) {
  if (!token || typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(BEARER_KEY, token);
  } catch {
    /* ignore */
  }
}

/** Email/password sign-in that keeps the live-preview session token. */
export async function signInWithEmail(email: string, password: string) {
  const res = await loginWithPassword({
    data: { email: email.trim().toLowerCase(), password },
  });
  saveToken(res.token);
  try {
    await authClient.getSession({
      fetchOptions: {
        headers: { Authorization: `Bearer ${res.token}` },
      },
    });
  } catch {
    /* page reload will pick it up */
  }
}

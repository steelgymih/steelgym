import { getSql } from "@/lib/db";

export async function performMemberLogin(emailRaw: string, passwordRaw: string) {
  const email = String(emailRaw || "").trim().toLowerCase();
  const password = String(passwordRaw || "").normalize("NFKC").trim();
  if (!email || !password) throw new Error("Correo y contraseña");
  const sql = await getSql();
  const rows = await sql<{
    user_id: string;
    email: string;
    name: string;
    pass_hash: string | null;
    role: string;
  }>`
    select user_id, email, name, pass_hash, role from members where email = ${email} limit 1
  `;
  const row = rows[0];
  if (!row) throw new Error("No hay cuenta con ese correo.");
  if (password.length < 8) throw new Error("La contraseña tiene 8 caracteres o más.");

  const { hashPass, verifyPass } = await import("@/lib/pass.server");
  let ok = row.pass_hash ? verifyPass(password, row.pass_hash) : false;
  if (!ok) {
    const { auth } = await import("@/lib/auth/server");
    const ctx = await auth.$context;
    const found = await ctx.internalAdapter.findUserByEmail(email);
    const uid = found?.user?.id as string | undefined;
    if (uid) {
      const accounts = await ctx.internalAdapter.findAccounts(uid);
      const cred = (accounts ?? []).find((a) => a.providerId === "credential" && a.password);
      if (cred?.password) {
        try {
          ok = await ctx.password.verify({ hash: cred.password, password });
        } catch {
          ok = false;
        }
      }
    }
  }
  if (!ok) throw new Error("Contraseña incorrecta.");
  if (!row.pass_hash && ok) {
    await sql`
      update members set pass_hash = ${hashPass(password)} where user_id = ${row.user_id}
    `;
  }

  const { auth } = await import("@/lib/auth/server");
  const ctx = await auth.$context;
  const session = await ctx.internalAdapter.createSession(row.user_id);
  if (!session?.token) throw new Error("No se pudo iniciar sesión");
  const { serializeSignedCookie } = await import("better-call");
  const cookie = await serializeSignedCookie("", session.token as string, ctx.secret);
  const token = cookie.replace(/^[^=]*=/, "").split(";")[0];
  return { token, email: row.email, name: row.name || "", role: row.role };
}

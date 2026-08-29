"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BootScreen } from "@/components/boot-screen";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { signOut } from "@/lib/auth/client";
import { signInWithEmail } from "@/lib/email-sign-in";
import {
  bootstrapStaff,
  createMember,
  forcePlan,
  getMe,
  listMembers,
  renewMember,
  resetDevice,
  resetMemberPassword,
  staffExists,
  updateMember,
} from "@/lib/member-fns";
import { getOrCreateDeviceId } from "@/lib/device";
import { LOCATIONS } from "@/lib/gym";
import { GOAL_LABEL, LEVEL_LABEL, type Goal, type Level, type Sex } from "@/lib/socios-store";
import { waLink } from "@/lib/utils";

export const Route = createLazyFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const [mode, setMode] = useState<"gate" | "desk">("gate");

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem("grok-auth.bearer-token")
        : null;
    if (!token) return;
    void getMe({ data: { deviceId: getOrCreateDeviceId() } })
      .then((r) => {
        if (r.status === "staff" || (r.status === "ok" && r.role === "admin")) {
          setMode("desk");
        }
      })
      .catch(() => {
        /* stay on gate */
      });
  }, []);

  if (mode === "desk") return <StaffDesk />;
  return <Gate onReady={() => setMode("desk")} />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-bg">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">{children}</main>
      <SiteFooter />
    </div>
  );
}

function Gate({ onReady }: { onReady: () => void }) {
  const [hasStaff, setHasStaff] = useState(true);

  useEffect(() => {
    void staffExists()
      .then((r) => setHasStaff(r.hasStaff))
      .catch(() => setHasStaff(true));
  }, []);

  return (
    <Shell>
      <p className="font-display text-sm tracking-[0.28em] text-red">OPERADOR</p>
      <h1 className="mt-2 font-display text-5xl tracking-[0.06em]">Altas de la app</h1>
      {hasStaff ? <OperatorLogin onReady={onReady} /> : <Bootstrap onReady={onReady} />}
    </Shell>
  );
}

function OperatorLogin({ onReady }: { onReady: () => void }) {
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const running = useRef(false);

  async function enter() {
    if (running.current || busy) return;
    const email = (emailRef.current?.value || "").trim();
    const password = passRef.current?.value || "";
    if (!email || !password) {
      setError("Pon correo y contraseña.");
      return;
    }
    running.current = true;
    setError("");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("email", email);
      fd.set("password", password);
      const r = await fetch("/api/member-login", {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      });
      const j = (await r.json()) as { token?: string; role?: string; error?: string };
      if (!r.ok || !j.token) {
        setError(j.error || "Correo o contraseña incorrectos.");
        running.current = false;
        setBusy(false);
        return;
      }
      try {
        sessionStorage.setItem("grok-auth.bearer-token", j.token);
      } catch {
        /* ignore */
      }
      if (j.role && j.role !== "admin") {
        setError("Esa cuenta es de socio. Staff es otra.");
        running.current = false;
        setBusy(false);
        return;
      }
      onReady();
    } catch {
      setError("No se pudo entrar. Intenta de nuevo.");
      running.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 grid max-w-md gap-4">
      <Field label="Correo">
        <input
          ref={emailRef}
          className="flex h-11 w-full rounded-[var(--radius-sm)] border border-border bg-elevated px-3.5 text-base text-fg"
          type="email"
          autoComplete="username"
          inputMode="email"
          defaultValue="op@steel.gym"
        />
      </Field>
      <Field label="Contraseña">
        <input
          ref={passRef}
          className="flex h-11 w-full rounded-[var(--radius-sm)] border border-border bg-elevated px-3.5 text-base text-fg"
          type="password"
          autoComplete="current-password"
        />
      </Field>
      {error ? <p className="text-sm text-red">{error}</p> : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => void enter()}
        className="flex h-12 w-full items-center justify-center rounded-lg bg-fg text-sm font-semibold text-bg disabled:opacity-40"
      >
        {busy ? "Entrando…" : "Entrar al panel"}
      </button>
    </div>
  );
}

function Bootstrap({ onReady }: { onReady: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await bootstrapStaff({ data: { name, email, password, setupKey } });
      await signInWithEmail(email, password);
      onReady();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo crear";
      setError(
        /unique|exist|already/i.test(msg)
          ? "Ese correo ya está. Entra con tu cuenta."
          : msg,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid max-w-md gap-4">
      <p className="text-sm text-muted">Primera instalación. Después de esto solo entra con tu cuenta.</p>
      <Field label="Tu nombre">
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>
      <Field label="Correo">
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </Field>
      <Field label="Contraseña (8+)">
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
      </Field>
      <Field label="Clave de instalación">
        <Input
          type="password"
          value={setupKey}
          onChange={(e) => setSetupKey(e.target.value)}
          required
          autoComplete="off"
        />
      </Field>
      {error ? <p className="text-sm text-red">{error}</p> : null}
      <Button type="submit" disabled={busy}>
        {busy ? "Creando…" : "Crear"}
      </Button>
    </form>
  );
}

type MemberList = Awaited<ReturnType<typeof listMembers>>;

function StaffDesk() {
  const [meRole, setMeRole] = useState<"admin" | "member" | "none" | "load">("admin");
  const [list, setList] = useState<MemberList>([]);
  const [created, setCreated] = useState<{
    email: string;
    password: string;
    months: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<MemberList[number] | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    sex: "hombre" as Sex,
    age: 25,
    height: 172,
    weight: 75,
    goal: "recomp" as Goal,
    level: "intermedio" as Level,
    months: 3 as 3 | 6 | 12,
    sucursal: LOCATIONS[0].id,
  });

  async function refresh() {
    try {
      const me = await getMe({ data: { deviceId: getOrCreateDeviceId() } });
      if (me.status === "staff" || (me.status === "ok" && me.role === "admin")) {
        setMeRole("admin");
        try {
          setList(await listMembers());
        } catch {
          setList([]);
        }
        return;
      }
      if (me.status === "ok") {
        setMeRole("member");
        return;
      }
      setMeRole("none");
    } catch {
      setMeRole("none");
    }
  }

  useEffect(() => {
    const t = window.setTimeout(() => setMeRole((r) => (r === "load" ? "admin" : r)), 6000);
    void refresh()
      .catch(() => {
        /* keep desk visible */
      })
      .finally(() => window.clearTimeout(t));
    return () => window.clearTimeout(t);
  }, []);

  async function onCreate() {
    setError("");
    setCreated(null);
    setBusy(true);
    try {
      const res = await createMember({ data: form });
      setCreated(res);
      setForm((f) => ({ ...f, name: "", email: "", password: "" }));
      setList(await listMembers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo dar de alta");
    } finally {
      setBusy(false);
    }
  }

  async function onEdit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    try {
      await updateMember({
        data: {
          userId: editing.user_id,
          name: editing.name,
          sex: editing.sex as Sex,
          age: editing.age,
          height: editing.height,
          weight: editing.weight,
          goal: editing.goal as Goal,
          level: editing.level as Level,
          sucursal: editing.sucursal,
        },
      });
      setEditing(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se guardó");
    } finally {
      setBusy(false);
    }
  }

  if (meRole === "load") {
    return <BootScreen label="Cargando panel" />;
  }
  if (meRole !== "admin") {
    return (
      <Shell>
        <h1 className="font-display text-4xl tracking-[0.06em]">Solo staff</h1>
        <p className="mt-3 text-sm text-muted">Entra con la cuenta de altas.</p>
        <a href="/login" className="mt-6 inline-block text-sm text-steel">
          Ir a entrar
        </a>
      </Shell>
    );
  }

  const shareHref = created
    ? waLink(
        LOCATIONS[0].phone,
        `STEEL GYM app\nCorreo: ${created.email}\nClave: ${created.password}\nEntra en ${typeof window !== "undefined" ? window.location.origin : ""}/login\nQueda anclada a tu teléfono.`,
      )
    : "";

  return (
    <Shell>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-sm tracking-[0.28em] text-red">TU PANEL</p>
          <h1 className="mt-2 font-display text-5xl tracking-[0.06em]">Altas de la app</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void signOut().then(() => (window.location.href = "/login"))}
        >
          Salir
        </Button>
      </div>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        El gym vende la membresía y, si quieren, la app a 3, 6 o 12 meses. Das de
        alta, el acceso se cierra al vencer.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Field label="Nombre del socio">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            autoComplete="off"
          />
        </Field>
        <Field label="Correo del socio">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="off"
          />
        </Field>
        <Field label="Clave que le vas a dar (o genera)">
          <div className="flex gap-2">
            <Input
              type="text"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Vacío = se genera"
              minLength={8}
              autoComplete="off"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
                let p = "Sg-";
                for (let i = 0; i < 8; i++) p += alphabet[Math.floor(Math.random() * alphabet.length)];
                setForm({ ...form, password: p });
              }}
            >
              Generar
            </Button>
          </div>
        </Field>
        <Field label="Sucursal">
          <Select
            value={form.sucursal}
            onChange={(e) => setForm({ ...form, sucursal: e.target.value as typeof form.sucursal })}
          >
            {LOCATIONS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.short}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Sexo">
          <Select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value as Sex })}>
            <option value="hombre">Hombre</option>
            <option value="mujer">Mujer</option>
          </Select>
        </Field>
        <Field label="Edad">
          <Input
            type="number"
            min={14}
            max={90}
            value={form.age}
            onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
          />
        </Field>
        <Field label="Peso (kg)">
          <Input
            type="number"
            step={0.1}
            min={35}
            max={250}
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
          />
        </Field>
        <Field label="Estatura (cm)">
          <Input
            type="number"
            min={130}
            max={230}
            value={form.height}
            onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
          />
        </Field>
        <Field label="Objetivo">
          <Select
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value as Goal })}
          >
            {Object.entries(GOAL_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nivel">
          <Select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value as Level })}
          >
            {Object.entries(LEVEL_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="App (meses)">
          <Select
            value={String(form.months)}
            onChange={(e) => setForm({ ...form, months: Number(e.target.value) as 3 | 6 | 12 })}
          >
            <option value={3}>3 meses</option>
            <option value={6}>6 meses</option>
            <option value={12}>12 meses</option>
          </Select>
        </Field>
        <div className="flex items-end sm:col-span-2">
          <Button type="button" className="w-full" disabled={busy} onClick={() => void onCreate()}>
            {busy ? "Dando de alta…" : "Dar de alta y generar plan"}
          </Button>
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-red">{error}</p> : null}
      {created ? (
        <div className="mt-4 rounded-[var(--radius-md)] border border-red/40 bg-elevated p-4">
          <p className="text-sm font-medium">Entrégalo al socio. Cópialo o mándalo por WhatsApp.</p>
          <p className="mt-2 font-display text-xl tracking-[0.08em]">{created.email}</p>
          <p className="font-mono text-lg text-red">{created.password}</p>
          <p className="mt-1 text-xs text-muted">App por {created.months} meses</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                void navigator.clipboard.writeText(
                  `${created.email} ${created.password}`,
                )
              }
            >
              Copiar
            </Button>
            <Button asChild size="sm">
              <a href={shareHref} target="_blank" rel="noreferrer">
                Mandar WhatsApp
              </a>
            </Button>
          </div>
        </div>
      ) : null}

      {editing ? (
        <form onSubmit={onEdit} className="mt-10 rounded-xl border border-border bg-surface p-4">
          <h2 className="font-display text-2xl tracking-[0.08em]">Editar {editing.name}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Nombre">
              <Input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </Field>
            <Field label="Sucursal">
              <Select
                value={editing.sucursal || LOCATIONS[0].id}
                onChange={(e) => setEditing({ ...editing, sucursal: e.target.value })}
              >
                {LOCATIONS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.short}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Sexo">
              <Select
                value={editing.sex}
                onChange={(e) => setEditing({ ...editing, sex: e.target.value })}
              >
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
              </Select>
            </Field>
            <Field label="Edad">
              <Input
                type="number"
                value={editing.age}
                onChange={(e) => setEditing({ ...editing, age: Number(e.target.value) })}
              />
            </Field>
            <Field label="Peso">
              <Input
                type="number"
                value={editing.weight}
                onChange={(e) => setEditing({ ...editing, weight: Number(e.target.value) })}
              />
            </Field>
            <Field label="Estatura">
              <Input
                type="number"
                value={editing.height}
                onChange={(e) => setEditing({ ...editing, height: Number(e.target.value) })}
              />
            </Field>
            <Field label="Objetivo">
              <Select
                value={editing.goal}
                onChange={(e) => setEditing({ ...editing, goal: e.target.value })}
              >
                {Object.entries(GOAL_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Nivel">
              <Select
                value={editing.level}
                onChange={(e) => setEditing({ ...editing, level: e.target.value })}
              >
                {Object.entries(LEVEL_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" disabled={busy}>
              Guardar y regenerar plan
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : null}

      <h2 className="mt-14 font-display text-3xl tracking-[0.08em]">Socios</h2>
      <div className="mt-4 space-y-2">
        {list.length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay altas.</p>
        ) : (
          list.map((m) => (
            <article
              key={m.user_id}
              className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-xs text-muted">
                  {m.email} · {m.level} · {m.sucursal || "—"} · {m.months} meses · {m.status}
                  {m.expires ? ` · vence ${new Date(m.expires).toLocaleDateString("es-MX")}` : ""}
                  {m.deviceBound ? " · anclado" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(m)}>
                  Editar
                </Button>
                {([3, 6, 12] as const).map((mo) => (
                  <Button
                    key={mo}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!confirm(`¿Sumar ${mo} meses a ${m.name}?`)) return;
                      void renewMember({ data: { userId: m.user_id, months: mo } }).then(() =>
                        refresh(),
                      );
                    }}
                  >
                    +{mo}m
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!confirm(`¿Forzar plan nuevo para ${m.name}?`)) return;
                    void forcePlan({ data: { userId: m.user_id } }).then(() => refresh());
                  }}
                >
                  Plan nuevo
                </Button>
                {m.deviceBound ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!confirm(`¿Desanclar el teléfono de ${m.name}?`)) return;
                      void resetDevice({ data: { userId: m.user_id } }).then(() => refresh());
                    }}
                  >
                    Desanclar
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!confirm(`¿Nueva clave para ${m.name}?`)) return;
                    void resetMemberPassword({ data: { userId: m.user_id } }).then((r) => {
                      setCreated({ email: r.email, password: r.password, months: m.months });
                    });
                  }}
                >
                  Nueva clave
                </Button>
              </div>
            </article>
          ))
        )}
      </div>
    </Shell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

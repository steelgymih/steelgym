"use client";

import { FormEvent, useEffect, useState } from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { ProtectedView } from "@/components/protected-view";
import { BootScreen } from "@/components/boot-screen";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { signOut } from "@/lib/auth/client";
import { getOrCreateDeviceId } from "@/lib/device";
import {
  getMe,
  logStrength,
  logTape,
  logWeight,
  regeneratePlan,
  savePrefs,
  setAvatar,
  type MeOk,
} from "@/lib/member-fns";
import { compressAvatar } from "@/lib/avatar";
import { GOAL_LABEL, LEVEL_LABEL, LIFT_LABEL, type Lift } from "@/lib/socios-store";
import {
  CARB_OPTS,
  FAT_OPTS,
  PROTEIN_OPTS,
  SCHEDULE_OPTS,
  SUPP_OPTS,
  supplementHints,
  type FoodPrefs,
} from "@/lib/food-prefs";
import { preCompProtocol } from "@/lib/precomp";
import { cn } from "@/lib/utils";
import type { Session } from "@/lib/routines";

export const Route = createLazyFileRoute("/socios")({
  component: SociosPage,
  pendingComponent: BootScreen,
});

const TABS = [
  { id: "inicio", label: "Inicio" },
  { id: "perfil", label: "Perfil" },
  { id: "progreso", label: "Progreso" },
  { id: "nutricion", label: "Nutrición" },
  { id: "rutinas", label: "Rutinas" },
  { id: "precomp", label: "Pre Comp" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function SociosPage() {
  const [me, setMe] = useState<MeOk | null>(null);
  const [status, setStatus] = useState<
    "load" | "ok" | "none" | "device_locked" | "expired" | "out" | "fail"
  >("load");
  const [tab, setTab] = useState<TabId>("inicio");
  const [kg, setKg] = useState("");
  const [lift, setLift] = useState<Lift>("press_banca");
  const [liftKg, setLiftKg] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [prefs, setPrefs] = useState<FoodPrefs | null>(null);
  const [tape, setTape] = useState({
    cintura: "",
    cadera: "",
    pecho: "",
    brazo: "",
    pierna: "",
  });

  async function load() {
    const deviceId = getOrCreateDeviceId();
    const res = await Promise.race([
      getMe({ data: { deviceId } }),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 5000)),
    ]);
    if (res.status === "ok") {
      setMe(res);
      setPrefs(res.profile.prefs);
      setKg(String(res.profile.weight));
      setStatus("ok");
      return;
    }
    if (res.status === "staff") {
      window.location.replace("/admin");
      return;
    }
    setStatus(res.status);
  }

  useEffect(() => {
    void load().catch((err) => {
      const msg = String(err?.message || err || "");
      if (/unauth|session|sign|login/i.test(msg)) setStatus("out");
      else setStatus("fail");
    });
  }, []);

  async function leave() {
    await signOut();
    window.location.href = "/login";
  }

  if (status === "load") {
    return <BootScreen label="Cargando tu plan" />;
  }
  if (status === "fail") {
    return (
      <Frame onLeave={leave}>
        <h1 className="text-2xl font-bold">No se abrió el plan</h1>
        <p className="mt-3 text-sm text-muted">Toca reintentar. Si sigue, entra otra vez.</p>
        <Button
          className="mt-6"
          onClick={() => {
            setStatus("load");
            void load().catch(() => setStatus("fail"));
          }}
        >
          Reintentar
        </Button>
        <Button className="mt-3 w-full" variant="outline" onClick={() => void leave()}>
          Ir a entrar
        </Button>
      </Frame>
    );
  }
  if (status === "out") return <RedirectToSignIn />;
  if (status === "none") {
    return (
      <Frame onLeave={leave}>
        <h1 className="text-2xl font-bold">Sin alta</h1>
        <p className="mt-3 text-sm text-muted">Pregunta en sucursal.</p>
        <a href="/" className="mt-6 inline-block text-sm text-steel">
          Volver
        </a>
      </Frame>
    );
  }
  if (status === "expired") {
    return (
      <Frame onLeave={leave}>
        <h1 className="text-2xl font-bold">App vencida</h1>
        <p className="mt-3 text-sm text-muted">En sucursal pueden renovarla 3, 6 o 12 meses.</p>
      </Frame>
    );
  }
  if (status === "device_locked") {
    return (
      <Frame onLeave={leave}>
        <h1 className="text-2xl font-bold">Anclado a otro teléfono</h1>
        <p className="mt-3 text-sm text-muted">Si cambiaste de celular, el gym te desancla.</p>
      </Frame>
    );
  }
  if (!me || !prefs) return null;

  async function run(fn: () => Promise<void>, ok = "Listo") {
    setBusy(true);
    setNote("");
    try {
      await fn();
      await load();
      setNote(ok);
    } catch (err) {
      setNote(err instanceof Error ? err.message : "No se guardó");
    } finally {
      setBusy(false);
    }
  }

  async function onAvatar(file: File | null) {
    if (!file) return;
    await run(async () => {
      const image = await compressAvatar(file);
      await setAvatar({ data: { image, deviceId: getOrCreateDeviceId() } });
    }, "Foto guardada");
  }

  async function onWeight(e: FormEvent) {
    e.preventDefault();
    const n = Number(kg);
    if (!n) return;
    await run(async () => {
      await logWeight({ data: { kg: n, deviceId: getOrCreateDeviceId() } });
    }, "Peso guardado. Dieta actualizada.");
  }

  async function onPlan() {
    const n = Number(kg) || me!.profile.weight;
    await run(async () => {
      await logWeight({ data: { kg: n, deviceId: getOrCreateDeviceId() } });
      await regeneratePlan({ data: { deviceId: getOrCreateDeviceId() } });
    }, "Plan del mes actualizado");
  }

  async function onPrefs() {
    if (!prefs) return;
    await run(async () => {
      await savePrefs({ data: { prefs, deviceId: getOrCreateDeviceId() } });
    }, "Preferencias guardadas");
  }

  async function onLift(e: FormEvent) {
    e.preventDefault();
    const n = Number(liftKg);
    if (!n) return;
    await run(async () => {
      await logStrength({ data: { lift, kg: n, deviceId: getOrCreateDeviceId() } });
      setLiftKg("");
    }, "Fuerza guardada");
  }

  async function onTape(e: FormEvent) {
    e.preventDefault();
    const row = {
      cintura: Number(tape.cintura),
      cadera: Number(tape.cadera),
      pecho: Number(tape.pecho),
      brazo: Number(tape.brazo),
      pierna: Number(tape.pierna),
    };
    if (Object.values(row).some((v) => !v || v < 20 || v > 200)) {
      setNote("Pon las 5 medidas en cm");
      return;
    }
    await run(async () => {
      await logTape({ data: { ...row, deviceId: getOrCreateDeviceId() } });
      setTape({ cintura: "", cadera: "", pecho: "", brazo: "", pierna: "" });
    }, "Medidas guardadas");
  }

  const hints = supplementHints(prefs.supplements, prefs.schedule);
  const pre = preCompProtocol(me.profile.weight);
  const lastBench = [...me.strength].reverse().find((s) => s.lift === "press_banca");
  const weightSeries =
    me.weights.length > 0
      ? me.weights.map((w) => ({ id: String(w.id), t: w.logged_at, v: w.kg }))
      : [];
  const firstW = weightSeries[0]?.v;
  const lastW = weightSeries[weightSeries.length - 1]?.v;
  const delta =
    firstW != null && lastW != null && weightSeries.length > 1
      ? Math.round((lastW - firstW) * 10) / 10
      : null;
  const STRENGTH_COLORS: Record<string, string> = {
    press_banca: "#e10613",
    sentadilla: "#f5f5f5",
    peso_muerto: "#f59e0b",
  };
  const strengthSeries = (["press_banca", "sentadilla", "peso_muerto"] as Lift[])
    .map((k) => ({
      key: k,
      label: LIFT_LABEL[k],
      color: STRENGTH_COLORS[k],
      points: me.strength.filter((s) => s.lift === k).map((s) => ({ t: s.logged_at, v: s.kg })),
    }))
    .filter((s) => s.points.length > 0);
  const today = todaySession(me.routine);
  const regenLabel = me.nextRegenAt
    ? new Date(me.nextRegenAt).toLocaleDateString("es-MX", { day: "numeric", month: "long" })
    : null;

  return (
    <Frame onLeave={leave} name={me.profile.name}>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "min-h-10 shrink-0 rounded-full px-4 text-sm font-medium",
              tab === t.id ? "bg-red text-white" : "bg-elevated text-muted",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "inicio" ? (
        <div className="mt-6 space-y-4">
          <h2 className="text-center text-xl font-bold">Hola, {me.profile.name.split(" ")[0]}</h2>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Peso" value={`${me.profile.weight}`} />
            <Stat label="Nivel" value={LEVEL_LABEL[me.profile.level]} />
            <Stat
              label="App"
              value={me.daysLeft == null ? "—" : me.daysLeft <= 0 ? "Vence" : `${me.daysLeft}d`}
            />
          </div>
          <Card title="Próximo entrenamiento">
            {today ? (
              <>
                <p className="font-semibold">{today.day}</p>
                <p className="text-sm text-muted">{today.title}</p>
                <p className="mt-2 text-sm text-muted">
                  {today.items.length} ejercicios · {LEVEL_LABEL[me.profile.level]}
                </p>
                <Button className="mt-3 w-full" onClick={() => setTab("rutinas")}>
                  Abrir rutina
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted">Hoy descanso. Movilidad y agua.</p>
            )}
          </Card>
          <Card title="Comidas de hoy">
            <ul className="space-y-2 text-sm">
              {me.nutrition.slice(0, 3).map((m) => (
                <li key={m.name}>
                  <span className="text-red">{m.name.split("—")[0]}</span> {m.food}
                </li>
              ))}
            </ul>
            <Button className="mt-3 w-full" variant="outline" onClick={() => setTab("nutricion")}>
              Ver dieta completa
            </Button>
          </Card>
          {hints.length ? (
            <Card title="Suplementos">
              <ul className="space-y-2 text-sm text-muted">
                {hints.map((h) => (
                  <li key={h.name}>
                    <span className="font-medium text-fg">{h.name}:</span> {h.text}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
          <Card title="Plan del mes">
            <p className="text-sm text-muted">
              {me.canRegen
                ? "Ya puedes pedir la variante nueva de dieta y rutina."
                : regenLabel
                  ? `Siguiente cambio: ${regenLabel}.`
                  : "Tu plan está activo."}
            </p>
            <Button className="mt-3 w-full" disabled={busy || !me.canRegen} onClick={() => void onPlan()}>
              Pedir plan nuevo del mes
            </Button>
          </Card>
          <p className="text-center text-xs text-subtle">
            En el iPhone: Compartir → Agregar a pantalla de inicio. Se siente como app.
          </p>
        </div>
      ) : null}

      {tab === "perfil" ? (
        <div className="mt-6 space-y-4">
          <h2 className="text-center text-xl font-bold">Perfil del usuario</h2>
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <label className="relative shrink-0 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={busy}
                  onChange={(e) => void onAvatar(e.target.files?.[0] ?? null)}
                />
                {me.profile.avatar ? (
                  <img src={me.profile.avatar} alt="" className="size-16 rounded-full object-cover" />
                ) : (
                  <span className="grid size-16 place-items-center rounded-full bg-red/80 text-lg font-bold">
                    {me.profile.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </label>
              <div className="min-w-0">
                <p className="truncate font-semibold">{me.profile.name}</p>
                <p className="truncate text-sm text-muted">{me.profile.email}</p>
                {me.daysLeft != null ? (
                  <p className="text-xs text-steel">
                    {me.daysLeft} días de app
                    {me.expiresAt
                      ? ` · vence ${new Date(me.expiresAt).toLocaleDateString("es-MX")}`
                      : ""}
                  </p>
                ) : null}
              </div>
            </div>
            <label className="mt-4 flex h-11 cursor-pointer items-center justify-center rounded-lg border border-border text-sm font-medium">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={busy}
                onChange={(e) => void onAvatar(e.target.files?.[0] ?? null)}
              />
              Subir foto de perfil
            </label>
          </div>

          <Card title="Datos personales">
            <div className="grid grid-cols-2 gap-3">
              <Lock label="Nivel" value={LEVEL_LABEL[me.profile.level]} />
              <Lock label="Sexo" value={me.profile.sex === "mujer" ? "Mujer" : "Hombre"} />
              <Lock label="Edad" value={String(me.profile.age)} />
              <Lock label="Estatura (cm)" value={String(me.profile.height)} />
            </div>
            <Lock label="Objetivo" value={GOAL_LABEL[me.profile.goal]} className="mt-3" />
            <form onSubmit={onWeight} className="mt-4">
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted">
                Peso actual (kg)
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step={0.1}
                  min={35}
                  value={kg}
                  onChange={(e) => setKg(e.target.value)}
                />
                <Button type="submit" disabled={busy}>
                  Guardar
                </Button>
              </div>
            </form>
            <p className="mt-3 text-xs text-muted">
              Nivel, sexo, edad, estatura y objetivo los fija el gym. Tú solo cambias el peso.
            </p>
          </Card>

          <Card title="Plan nutricional del mes">
            <p className="text-sm text-muted">
              {me.canRegen
                ? "Ya toca variante nueva."
                : regenLabel
                  ? `Próxima dieta: ${regenLabel}.`
                  : "Activo."}{" "}
              Preferencias de comida, suplementos y horario: se pueden cambiar siempre.
            </p>
          </Card>
          <Card title="Proteínas preferidas">
            <Chips
              opts={PROTEIN_OPTS}
              selected={prefs.proteins}
              onChange={(proteins) => setPrefs({ ...prefs, proteins })}
            />
          </Card>
          <Card title="Carbohidratos preferidos">
            <Chips
              opts={CARB_OPTS}
              selected={prefs.carbs}
              onChange={(carbs) => setPrefs({ ...prefs, carbs })}
            />
          </Card>
          <Card title="Grasas preferidas">
            <Chips
              opts={FAT_OPTS}
              selected={prefs.fats}
              onChange={(fats) => setPrefs({ ...prefs, fats })}
            />
          </Card>
          <Card title="Suplementación actual">
            <Chips
              opts={SUPP_OPTS}
              selected={prefs.supplements}
              onChange={(supplements) => setPrefs({ ...prefs, supplements })}
              allowEmpty
            />
          </Card>
          <Card title="Horario de entrenamiento">
            <Select
              value={prefs.schedule}
              onChange={(e) => setPrefs({ ...prefs, schedule: e.target.value })}
            >
              {SCHEDULE_OPTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Button className="mt-3 w-full" disabled={busy} onClick={() => void onPrefs()}>
              Guardar preferencias
            </Button>
          </Card>
          {hints.length ? (
            <Card title="Horarios sugeridos de suplementos">
              <ul className="space-y-2 text-sm text-muted">
                {hints.map((h) => (
                  <li key={h.name}>
                    <span className="font-medium text-fg">{h.name}:</span> {h.text}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      ) : null}

      {tab === "progreso" ? (
        <div className="mt-6 space-y-4">
          <h2 className="text-center text-xl font-bold">Progreso</h2>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Cambio peso" value={delta == null ? "—" : `${delta > 0 ? "+" : ""}${delta}`} />
            <Stat label="Press banca" value={lastBench ? String(lastBench.kg) : "—"} />
            <Stat label="Registros" value={String(weightSeries.length)} />
          </div>
          <Card title="Registrar peso">
            <form onSubmit={onWeight} className="flex gap-2">
              <Input
                type="number"
                step={0.1}
                min={35}
                placeholder="Peso (kg)"
                value={kg}
                onChange={(e) => setKg(e.target.value)}
              />
              <Button type="submit" disabled={busy}>
                Guardar
              </Button>
            </form>
          </Card>
          <Card title="Medidas (cm)">
            <form onSubmit={onTape} className="grid grid-cols-2 gap-2">
              {(
                [
                  ["cintura", "Cintura"],
                  ["cadera", "Cadera"],
                  ["pecho", "Pecho"],
                  ["brazo", "Brazo"],
                  ["pierna", "Pierna"],
                ] as const
              ).map(([k, lab]) => (
                <Input
                  key={k}
                  type="number"
                  step={0.5}
                  min={20}
                  placeholder={lab}
                  value={tape[k]}
                  onChange={(e) => setTape({ ...tape, [k]: e.target.value })}
                />
              ))}
              <Button type="submit" className="col-span-2" disabled={busy}>
                Guardar medidas
              </Button>
            </form>
            {me.tape.length ? (
              <div className="mt-3 space-y-1">
                {me.tape.slice(-4).reverse().map((t) => (
                  <p key={t.logged_at} className="text-xs text-muted">
                    {new Date(t.logged_at).toLocaleDateString("es-MX")} · cintura {t.cintura} · cadera{" "}
                    {t.cadera} · pecho {t.pecho} · brazo {t.brazo} · pierna {t.pierna}
                  </p>
                ))}
              </div>
            ) : null}
          </Card>
          <Card title="Registrar fuerza">
            <form onSubmit={onLift} className="grid gap-2 sm:grid-cols-3">
              <Select value={lift} onChange={(e) => setLift(e.target.value as Lift)}>
                {Object.entries(LIFT_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                step={0.5}
                min={5}
                placeholder="Peso (kg)"
                value={liftKg}
                onChange={(e) => setLiftKg(e.target.value)}
              />
              <Button type="submit" disabled={busy}>
                Guardar fuerza
              </Button>
            </form>
          </Card>
          <Card title="Evolución de peso">
            {weightSeries.length ? (
              <LineChart points={weightSeries} unit="kg" color="#e10613" />
            ) : (
              <EmptyChart label="Registra tu peso para ver la gráfica" />
            )}
            <div className="mt-3 space-y-1">
              {weightSeries.slice(-8).map((w) => (
                <p key={w.id} className="flex justify-between text-sm">
                  <span className="text-muted">
                    {new Date(w.t).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                  </span>
                  <span className="tabular-nums">{w.v} kg</span>
                </p>
              ))}
            </div>
          </Card>
          <Card title="Progreso de fuerza">
            <p className="mb-3 text-xs text-muted">Press · Sentadilla · Peso muerto</p>
            {strengthSeries.length ? (
              <StrengthChart series={strengthSeries} />
            ) : (
              <EmptyChart label="Registra un lift para ver la gráfica" />
            )}
            <div className="mt-3 space-y-1">
              {me.strength.length ? (
                me.strength
                  .slice(-10)
                  .reverse()
                  .map((s) => (
                    <p key={s.id} className="flex justify-between text-sm">
                      <span className="text-muted">
                        {LIFT_LABEL[s.lift as Lift] ?? s.lift} ·{" "}
                        {new Date(s.logged_at).toLocaleDateString("es-MX")}
                      </span>
                      <span className="tabular-nums">{s.kg} kg</span>
                    </p>
                  ))
              ) : (
                <p className="text-sm text-muted">Sin registros de fuerza aún.</p>
              )}
            </div>
          </Card>
        </div>
      ) : null}

      {tab === "nutricion" ? (
        <div className="mt-6">
          <h2 className="text-center text-xl font-bold">Plan nutricional</h2>
          <ProtectedView watermark={`${me.profile.name} · ${me.profile.email}`}>
            <div className="mt-4 grid grid-cols-4 gap-2">
              <Stat label="Kcal" value={String(me.targets.kcal)} />
              <Stat label="Proteína" value={`${me.targets.protein}g`} />
              <Stat label="Carbos" value={`${me.targets.carbs}g`} />
              <Stat label="Grasas" value={`${me.targets.fat}g`} />
            </div>
            <p className="mt-3 text-xs text-muted">
              4 comidas + 2 snacks. Porciones en gramos según tu peso ({me.profile.weight} kg). Este
              menú es diario; ajusta el snack al horario de entreno.
            </p>
            <div className="mt-4 space-y-3">
              {me.nutrition.map((m) => (
                <article key={m.name} className="rounded-xl border border-border bg-surface p-4">
                  <h3 className="text-sm font-semibold text-red">{m.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed">{m.food}</p>
                  <p className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="text-amber">~{m.kcal} kcal</span>
                    <span className="text-steel">P {m.protein}g</span>
                    <span className="text-green-400">C {m.carbs}g</span>
                    <span className="text-pink-400">G {m.fat}g</span>
                  </p>
                  {m.swap ? <p className="mt-2 text-xs text-subtle">{m.swap}</p> : null}
                </article>
              ))}
            </div>
          </ProtectedView>
        </div>
      ) : null}

      {tab === "rutinas" ? (
        <div className="mt-6">
          <h2 className="text-center text-xl font-bold">Rutinas</h2>
          <p className="mt-2 text-center text-sm text-muted">
            Nivel bloqueado: {LEVEL_LABEL[me.profile.level]}. No ves los otros niveles.
          </p>
          <ProtectedView watermark={`${me.profile.name} · ${LEVEL_LABEL[me.profile.level]}`}>
            <div className="mt-4 rounded-xl border border-border bg-surface p-4">
              <p className="text-sm leading-relaxed">{me.routineMeta.summary}</p>
              <p className="mt-2 text-sm text-muted">{me.routineMeta.method}</p>
              <p className="mt-2 text-sm text-red">
                Nivel {LEVEL_LABEL[me.profile.level]} · Variante {me.routineMeta.variant}
                {regenLabel && !me.canRegen ? ` · siguiente ${regenLabel}` : ""}
              </p>
              <Button
                className="mt-3 w-full"
                variant="outline"
                disabled={busy || !me.canRegen}
                onClick={() => void onPlan()}
              >
                Pedir rutina nueva del mes
              </Button>
            </div>
            <div className="mt-4 space-y-4">
              {me.routine.map((s) => (
                <SessionCard key={s.day} session={s} stamp={`${me.profile.email}-${me.routineMeta.variant}`} />
              ))}
            </div>
          </ProtectedView>
        </div>
      ) : null}

      {tab === "precomp" ? (
        <div className="mt-6 space-y-4">
          <h2 className="text-center text-xl font-bold">Pre competencia</h2>
          <ProtectedView watermark={`${me.profile.name} · pre-comp`}>
            <Card title="Protocolo depleción y puesta a punto">
              <p className="text-sm text-muted">
                Última semana. Ajusta con tu coach. Los gramos se calculan con tu peso actual.
              </p>
            </Card>
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Peso" value={`${pre.weight}`} />
              <Stat label="Proteína/día" value={`${pre.protein}g`} />
              <Stat label="Agua" value={pre.water} />
            </div>
            {pre.phases.map((ph) => (
              <div key={ph.title} className="rounded-xl border-l-4 border-red bg-surface p-4">
                <h3 className="text-sm font-semibold text-red">{ph.title}</h3>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted">
                  {ph.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
            <Card title="Control de comidas">
              <p className="text-sm text-muted">{pre.food}</p>
            </Card>
            <Card title="Suplementos orientativos">
              {pre.supplements.map((s) => (
                <p key={s.name} className="text-sm">
                  <span className="font-medium text-red">{s.name}:</span>{" "}
                  <span className="text-muted">{s.text}</span>
                </p>
              ))}
              <p className="mt-3 text-xs text-subtle">{pre.warning}</p>
            </Card>
          </ProtectedView>
        </div>
      ) : null}

      {note ? <p className="mt-4 text-center text-sm text-steel">{note}</p> : null}
    </Frame>
  );
}

function todaySession(routine: Session[]): Session | null {
  const names = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const name = names[new Date().getDay()] ?? "Lunes";
  if (name === "Domingo") return null;
  return routine.find((s) => s.day.includes(name)) ?? null;
}

function restSeconds(rest?: string) {
  if (!rest) return 90;
  const m = rest.match(/(\d+(?:[.,]\d+)?)\s*min/i);
  if (m) return Math.round(Number(m[1].replace(",", ".")) * 60);
  const s = rest.match(/(\d+)\s*seg/i);
  if (s) return Number(s[1]);
  return 90;
}

function SessionCard({ session, stamp }: { session: Session; stamp: string }) {
  const key = `steel-done-${stamp}-${session.day}`;
  const [done, setDone] = useState<Record<number, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || "{}") as Record<number, boolean>;
    } catch {
      return {};
    }
  });
  const [timerFor, setTimerFor] = useState<number | null>(null);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (timerFor == null || left <= 0) return;
    const t = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [timerFor, left]);

  function toggle(i: number, rest?: string) {
    const next = { ...done, [i]: !done[i] };
    setDone(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    if (!done[i]) {
      setTimerFor(i);
      setLeft(restSeconds(rest));
    }
  }

  const complete = session.items.every((_, i) => done[i]);

  return (
    <article className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-red">{session.day}</p>
      <h3 className="mt-1 font-semibold">{session.title}</h3>
      {complete ? <p className="mt-1 text-xs text-steel">Sesión marcada</p> : null}
      <ol className="mt-3 space-y-3">
        {session.items.map((it, i) => (
          <li key={`${it.name}-${i}`} className="border-b border-border pb-3 last:border-0">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={Boolean(done[i])}
                onChange={() => toggle(i, it.rest)}
                className="mt-1 size-4 accent-[#e10613]"
              />
              <span>
                <p className={cn("text-sm font-medium", done[i] && "text-muted line-through")}>
                  {i + 1}. {it.name}
                </p>
                <p className="text-sm text-muted">{it.sets}</p>
                {it.rest ? <p className="text-xs text-subtle">{it.rest}</p> : null}
                {it.tag ? (
                  <span className="mt-1 inline-block rounded bg-elevated px-2 py-0.5 text-xs text-steel">
                    {it.tag}
                  </span>
                ) : null}
              </span>
            </label>
            {it.alts?.length ? (
              <p className="mt-1 pl-6 text-xs text-subtle">Sustitutos: {it.alts.join(" · ")}</p>
            ) : null}
            {timerFor === i && left > 0 ? (
              <p className="mt-1 pl-6 text-sm font-semibold text-red">Descanso {left}s</p>
            ) : null}
            {timerFor === i && left === 0 ? (
              <p className="mt-1 pl-6 text-xs text-steel">Siguiente serie</p>
            ) : null}
          </li>
        ))}
      </ol>
    </article>
  );
}

function Frame({
  children,
  onLeave,
  name,
}: {
  children: React.ReactNode;
  onLeave?: () => void;
  name?: string;
}) {
  return (
    <div className="min-h-svh bg-bg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <a href="/" className="font-display text-sm tracking-[0.18em]">
            STEEL GYM
          </a>
          {onLeave ? (
            <button type="button" onClick={() => void onLeave()} className="text-sm text-muted">
              {name ? "Salir" : "Salir"}
            </button>
          ) : null}
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-5">{children}</main>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
      {children}
    </section>
  );
}

function Lock({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-1 text-xs uppercase tracking-wider text-muted">{label}</p>
      <div className="flex h-11 items-center rounded-md border border-border bg-elevated px-3.5 text-sm opacity-80">
        {value}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}

function Chips({
  opts,
  selected,
  onChange,
  allowEmpty,
}: {
  opts: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  allowEmpty?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => {
              const next = on ? selected.filter((x) => x !== o) : [...selected, o];
              if (!allowEmpty && next.length === 0) return;
              onChange(next);
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              on ? "border-red bg-red/15 text-fg" : "border-border text-muted",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function LineChart({
  points,
  unit,
  color,
}: {
  points: { t: string; v: number }[];
  unit: string;
  color: string;
}) {
  const w = 360;
  const h = 180;
  const padL = 36;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const vals = points.map((p) => p.v);
  const min = Math.min(...vals) - 1.5;
  const max = Math.max(...vals) + 1.5;
  const span = Math.max(1, max - min);
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const coords = points.map((p, i) => {
    const x = padL + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
    const y = padT + innerH - ((p.v - min) / span) * innerH;
    return { x, y };
  });
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1].x.toFixed(1)},${(padT + innerH).toFixed(1)} L${coords[0].x.toFixed(1)},${(padT + innerH).toFixed(1)} Z`;
  const ticks = [max, (max + min) / 2, min];
  const firstDate = new Date(points[0].t).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
  const lastDate = new Date(points[points.length - 1].t).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
  return (
    <div className="rounded-lg bg-[#0d0d0d] p-1">
      <svg viewBox={`0 0 ${w} ${h}`} className="block h-44 w-full" role="img">
        {ticks.map((t, i) => {
          const y = padT + (i / 2) * innerH;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#2a2a2a" strokeWidth="1" />
              <text x={padL - 6} y={y + 4} textAnchor="end" fill="#888" fontSize="10">
                {t.toFixed(1)}
              </text>
            </g>
          );
        })}
        <path d={area} fill={color} opacity="0.18" />
        <path d={line} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="4.5" fill={color} stroke="#0d0d0d" strokeWidth="2" />
        ))}
        <text x={padL} y={h - 8} fill="#888" fontSize="10">
          {firstDate}
        </text>
        <text x={w - padR} y={h - 8} textAnchor="end" fill="#888" fontSize="10">
          {lastDate} · {points[points.length - 1].v} {unit}
        </text>
      </svg>
    </div>
  );
}

function StrengthChart({
  series,
}: {
  series: { key: string; label: string; color: string; points: { t: string; v: number }[] }[];
}) {
  const all = series.flatMap((s) => s.points.map((p) => p.v));
  const min = Math.min(...all) - 5;
  const max = Math.max(...all) + 5;
  const w = 360;
  const h = 180;
  const padL = 36;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const span = Math.max(1, max - min);
  const ticks = [max, (max + min) / 2, min];
  return (
    <div className="rounded-lg bg-[#0d0d0d] p-1">
      <svg viewBox={`0 0 ${w} ${h}`} className="block h-44 w-full" role="img">
        {ticks.map((t, i) => {
          const y = padT + (i / 2) * innerH;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#2a2a2a" strokeWidth="1" />
              <text x={padL - 6} y={y + 4} textAnchor="end" fill="#888" fontSize="10">
                {Math.round(t)}
              </text>
            </g>
          );
        })}
        {series.map((s) => {
          const n = s.points.length;
          const coords = s.points.map((p, i) => {
            const x = padL + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
            const y = padT + innerH - ((p.v - min) / span) * innerH;
            return { x, y };
          });
          const d = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
          return (
            <g key={s.key}>
              <path d={d} fill="none" stroke={s.color} strokeWidth="3" strokeLinejoin="round" />
              {coords.map((c, i) => (
                <circle key={i} cx={c.x} cy={c.y} r="4" fill={s.color} stroke="#0d0d0d" strokeWidth="2" />
              ))}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-3 px-3 pb-2">
        {series.map((s) => (
          <p key={s.key} className="flex items-center gap-1.5 text-xs text-muted">
            <span className="inline-block size-2 rounded-full" style={{ background: s.color }} />
            {s.label} {s.points[s.points.length - 1].v} kg
          </p>
        ))}
      </div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="grid h-44 place-items-center rounded-lg bg-[#0d0d0d] text-center text-sm text-muted">
      {label}
    </div>
  );
}

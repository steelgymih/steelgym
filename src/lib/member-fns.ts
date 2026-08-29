import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { generateMeals, type Meal } from "@/lib/nutrition";
import { getRoutine, routineMeta, type RoutineMeta, type Session } from "@/lib/routines";
import { dailyTargets, type Goal, type Level, type Profile, type Sex } from "@/lib/socios-store";
import { DEFAULT_PREFS, normalizePrefs, type FoodPrefs } from "@/lib/food-prefs";

const REGEN_DAYS = 28;

export type MemberRole = "admin" | "member";

export type MemberRow = {
  user_id: string;
  name: string;
  email: string;
  role: MemberRole;
  sex: Sex;
  age: number;
  height: number;
  weight: number;
  goal: Goal;
  level: Level;
  device_id: string | null;
  plan_cycle: number;
  last_plan_at: string | null;
  nutrition: Meal[] | null;
  routine: Session[] | null;
  app_months: number;
  app_expires_at: string | null;
  avatar: string | null;
  prefs: FoodPrefs;
  strength: StrengthRow[];
  sucursal: string | null;
  tape: TapeRow[];
  created_at: string;
};

export type WeightRow = { id: number; kg: number; logged_at: string };
export type StrengthRow = { id: number; lift: string; kg: number; logged_at: string };
export type TapeRow = {
  cintura: number;
  cadera: number;
  pecho: number;
  brazo: number;
  pierna: number;
  logged_at: string;
};

export type MeOk = {
  status: "ok";
  role: MemberRole;
  profile: {
    name: string;
    email: string;
    sex: Sex;
    age: number;
    height: number;
    weight: number;
    goal: Goal;
    level: Level;
    avatar: string | null;
    prefs: FoodPrefs;
  };
  targets: ReturnType<typeof dailyTargets>;
  nutrition: Meal[];
  routine: Session[];
  routineMeta: RoutineMeta;
  canRegen: boolean;
  nextRegenAt: string | null;
  weights: WeightRow[];
  strength: StrengthRow[];
  tape: TapeRow[];
  deviceBound: boolean;
  expiresAt: string | null;
  daysLeft: number | null;
};

export type MeResult =
  | MeOk
  | { status: "none" }
  | { status: "device_locked" }
  | { status: "expired"; until: string | null }
  | { status: "staff" };

function asNum(v: unknown) {
  return typeof v === "number" ? v : Number(v);
}

function parseJson<T>(v: unknown, fallback: T): T {
  if (v == null) return fallback;
  if (typeof v === "string") {
    try {
      return JSON.parse(v) as T;
    } catch {
      return fallback;
    }
  }
  return v as T;
}

function mapMember(r: Record<string, unknown>): MemberRow {
  return {
    user_id: String(r.user_id),
    name: String(r.name),
    email: String(r.email),
    role: r.role === "admin" ? "admin" : "member",
    sex: r.sex === "mujer" ? "mujer" : "hombre",
    age: asNum(r.age),
    height: asNum(r.height),
    weight: asNum(r.weight),
    goal: (r.goal as Goal) || "recomp",
    level: (r.level as Level) || "intermedio",
    device_id: r.device_id ? String(r.device_id) : null,
    plan_cycle: asNum(r.plan_cycle),
    last_plan_at: r.last_plan_at ? String(r.last_plan_at) : null,
    nutrition: parseJson<Meal[] | null>(r.nutrition, null),
    routine: parseJson<Session[] | null>(r.routine, null),
    app_months: asNum(r.app_months) || 3,
    app_expires_at: r.app_expires_at ? String(r.app_expires_at) : null,
    avatar: r.avatar ? String(r.avatar) : null,
    prefs: normalizePrefs(parseJson(r.prefs, DEFAULT_PREFS)),
    strength: parseJson<StrengthRow[]>(r.strength, []) || [],
    sucursal: r.sucursal ? String(r.sucursal) : null,
    tape: parseJson<TapeRow[]>(r.tape, []) || [],
    created_at: String(r.created_at),
  };
}

function profileFrom(m: MemberRow): Profile {
  return {
    name: m.name,
    sex: m.sex,
    age: m.age,
    weight: m.weight,
    height: m.height,
    goal: m.goal,
    level: m.level,
  };
}

function buildPlan(p: Profile, cycle: number, prefs: FoodPrefs = DEFAULT_PREFS) {
  return {
    nutrition: generateMeals(p, cycle, prefs),
    routine: getRoutine(p.sex, p.level, cycle),
  };
}

function canRegenAt(last: string | null) {
  if (!last) return { ok: true, next: null as string | null };
  const t = new Date(last).getTime();
  const next = t + REGEN_DAYS * 24 * 60 * 60 * 1000;
  return { ok: Date.now() >= next, next: new Date(next).toISOString() };
}

function isExpired(expiresAt: string | null) {
  if (!expiresAt) return false;
  return Date.now() > new Date(expiresAt).getTime();
}

function plusMonths(from: Date, months: number) {
  const d = new Date(from);
  d.setMonth(d.getMonth() + months);
  return d;
}

function genPassword() {
  // fallback if dynamic import not ready; real generator in pass.server
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "Sg-";
  for (let i = 0; i < 8; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

async function createCredentialUser(email: string, password: string, name: string) {
  const { auth } = await import("@/lib/auth/server");
  const ctx = await auth.$context;
  const hash = await ctx.password.hash(password);
  const found = await ctx.internalAdapter.findUserByEmail(email);
  const userId = found?.user?.id as string | undefined;
  if (userId) {
    const accounts = await ctx.internalAdapter.findAccounts(userId);
    for (const acc of accounts ?? []) {
      if (acc.providerId === "credential" && acc.id) {
        await ctx.internalAdapter.deleteAccount(acc.id);
      }
    }
    await ctx.internalAdapter.linkAccount({
      userId,
      providerId: "credential",
      accountId: userId,
      password: hash,
    });
    if (name) await ctx.internalAdapter.updateUser(userId, { name });
    return userId;
  }
  const created = await ctx.internalAdapter.createUser({
    email,
    name,
    emailVerified: true,
  });
  if (!created?.id) throw new Error("No se pudo crear la cuenta");
  await ctx.internalAdapter.linkAccount({
    userId: created.id,
    providerId: "credential",
    accountId: created.id,
    password: hash,
  });
  return created.id as string;
}

async function loadMember(userId: string) {
  const sql = await getSql();
  const q = sql<Record<string, unknown>>`
    select user_id, name, email, role, sex, age, height, weight, goal, level,
           device_id, plan_cycle, last_plan_at, nutrition, routine,
           app_months, app_expires_at, prefs, strength, sucursal, tape, created_at,
           case when avatar is null or length(avatar) < 180000 then avatar else null end as avatar
    from members where user_id = ${userId} limit 1
  `;
  try {
    const rows = await q;
    return rows[0] ? mapMember(rows[0]) : null;
  } catch {
    await ensureMemberColumns(sql);
    const rows = await sql<Record<string, unknown>>`
      select * from members where user_id = ${userId} limit 1
    `;
    return rows[0] ? mapMember(rows[0]) : null;
  }
}

let memberColsReady = false;
let memberColsJob: Promise<void> | null = null;

async function ensureMemberColumns(sql: Awaited<ReturnType<typeof getSql>>) {
  if (memberColsReady) return;
  if (memberColsJob) return memberColsJob;
  memberColsJob = (async () => {
    const run = async (p: Promise<unknown>) => {
      try {
        await Promise.race([
          p,
          new Promise((_, rej) => setTimeout(() => rej(new Error("col")), 2000)),
        ]);
      } catch {
        /* already there or slow */
      }
    };
    await run(sql`alter table members add column if not exists app_months integer default 3`);
    await run(sql`alter table members add column if not exists app_expires_at timestamptz`);
    await run(sql`alter table members add column if not exists avatar text`);
    await run(sql`alter table members add column if not exists pass_hash text`);
    await run(sql`alter table members add column if not exists pass_v integer default 0`);
    await run(sql`alter table members add column if not exists prefs jsonb`);
    await run(sql`alter table members add column if not exists strength jsonb`);
    await run(sql`alter table members add column if not exists sucursal text`);
    await run(sql`alter table members add column if not exists tape jsonb`);
    memberColsReady = true;
  })();
  return memberColsJob;
}

async function requireAdmin(userId: string) {
  const m = await loadMember(userId);
  if (!m || m.role !== "admin") {
    throw new Error("Solo staff");
  }
  return m;
}

export const staffExists = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{ n: number }>`
    select count(*)::int as n from members where role = 'admin'
  `;
  return { hasStaff: Number(rows[0]?.n ?? 0) > 0 };
});

export const bootstrapStaff = createServerFn({ method: "POST" })
  .validator((d: { name: string; email: string; password: string; setupKey: string }) => ({
    name: d.name.trim(),
    email: d.email.trim().toLowerCase(),
    password: d.password,
    setupKey: d.setupKey.trim(),
  }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{ n: number }>`
      select count(*)::int as n from members where role = 'admin'
    `;
    if (Number(rows[0]?.n ?? 0) > 0) {
      throw new Error("Ya hay operador. Entra con tu cuenta.");
    }
    if (data.setupKey !== "STEEL-ALTAS") {
      throw new Error("Clave de instalación incorrecta");
    }
    if (!data.name || !data.email || data.password.length < 8) {
      throw new Error("Nombre, correo y contraseña de 8+ caracteres");
    }
    const { hashPass } = await import("@/lib/pass.server");
    const userId = await createCredentialUser(data.email, data.password, data.name);
    await sql`
      insert into members (user_id, name, email, role, pass_hash)
      values (${userId}, ${data.name}, ${data.email}, 'admin', ${hashPass(data.password)})
    `;
    return { ok: true, email: data.email };
  });

export const loginWithPassword = createServerFn({ method: "POST" })
  .validator((d: { email: string; password: string }) => ({
    email: String(d.email || "").trim().toLowerCase(),
    password: String(d.password || ""),
  }))
  .handler(async ({ data }) => {
    const { performMemberLogin } = await import("@/lib/member-login.server");
    return performMemberLogin(data.email, data.password);
  });

export const getMe = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { deviceId: string }) => ({ deviceId: String(d.deviceId || "") }))
  .handler(async ({ context, data }): Promise<MeResult> => {
    const member = await loadMember(context.userId);
    if (!member) return { status: "none" };
    if (member.role === "admin") return { status: "staff" };

    if (member.role === "member") {
      if (isExpired(member.app_expires_at)) {
        return { status: "expired", until: member.app_expires_at };
      }
      if (member.device_id && member.device_id !== data.deviceId) {
        return { status: "device_locked" };
      }
      if (!member.device_id && data.deviceId) {
        const sql = await getSql();
        await sql`
          update members set device_id = ${data.deviceId}
          where user_id = ${context.userId}
        `;
        member.device_id = data.deviceId;
      }
    }

    const p = profileFrom(member);
    let nutrition = member.nutrition;
    let routine = member.routine;
    if (!nutrition?.length || nutrition.length < 6 || !routine?.length) {
      try {
        const plan = buildPlan(p, member.plan_cycle, member.prefs);
        nutrition = plan.nutrition;
        routine = plan.routine;
        const sql = await getSql();
        await sql`
          update members
          set nutrition = ${JSON.stringify(nutrition)}::jsonb,
              routine = ${JSON.stringify(routine)}::jsonb,
              last_plan_at = coalesce(last_plan_at, now())
          where user_id = ${context.userId}
        `;
      } catch {
        nutrition = nutrition?.length ? nutrition : [];
        routine = routine?.length ? routine : [];
      }
    }

    const sql = await getSql();
    let weights: WeightRow[] = [];
    try {
      weights = await sql<WeightRow>`
        select id, kg, logged_at from weight_logs
        where user_id = ${context.userId}
        order by logged_at asc
      `;
    } catch {
      weights = [];
    }
    const regen = canRegenAt(member.last_plan_at);

    return {
      status: "ok",
      role: member.role,
      profile: {
        name: member.name,
        email: member.email,
        sex: member.sex,
        age: member.age,
        height: member.height,
        weight: member.weight,
        goal: member.goal,
        level: member.level,
        avatar: member.avatar,
        prefs: member.prefs,
      },
      targets: dailyTargets(p),
      nutrition,
      routine,
      routineMeta: routineMeta(member.level, member.plan_cycle),
      canRegen: regen.ok,
      nextRegenAt: regen.next,
      weights: weights.map((w) => ({
        id: asNum(w.id),
        kg: asNum(w.kg),
        logged_at: String(w.logged_at),
      })),
      strength: (member.strength || []).map((s, i) => ({
        id: asNum(s.id) || i + 1,
        lift: String(s.lift),
        kg: asNum(s.kg),
        logged_at: String(s.logged_at),
      })),
      tape: member.tape || [],
      deviceBound: Boolean(member.device_id),
      expiresAt: member.app_expires_at,
      daysLeft: member.app_expires_at
        ? Math.max(
            0,
            Math.ceil(
              (new Date(member.app_expires_at).getTime() - Date.now()) / 86400000,
            ),
          )
        : null,
    };
  });

export const logWeight = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { kg: number; deviceId: string }) => ({
    kg: Number(d.kg),
    deviceId: String(d.deviceId || ""),
  }))
  .handler(async ({ context, data }) => {
    if (!data.kg || data.kg < 35 || data.kg > 250) throw new Error("Peso inválido");
    const member = await loadMember(context.userId);
    if (!member || member.role !== "member") throw new Error("No autorizado");
    if (isExpired(member.app_expires_at)) throw new Error("La app está vencida");
    if (member.device_id && member.device_id !== data.deviceId) {
      throw new Error("Este plan está anclado a otro teléfono");
    }
    const sql = await getSql();
    await sql`
      insert into weight_logs (user_id, kg) values (${context.userId}, ${data.kg})
    `;
    const p = { ...profileFrom(member), weight: data.kg };
    const meals = generateMeals(p, member.plan_cycle, member.prefs);
    await sql`
      update members
      set weight = ${data.kg},
          nutrition = ${JSON.stringify(meals)}::jsonb
      where user_id = ${context.userId}
    `;
    return { ok: true };
  });

export const savePrefs = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { prefs: FoodPrefs; deviceId: string }) => ({
    prefs: normalizePrefs(d.prefs),
    deviceId: String(d.deviceId || ""),
  }))
  .handler(async ({ context, data }) => {
    const member = await loadMember(context.userId);
    if (!member || member.role !== "member") throw new Error("No autorizado");
    if (isExpired(member.app_expires_at)) throw new Error("La app está vencida");
    if (member.device_id && member.device_id !== data.deviceId) {
      throw new Error("Este plan está anclado a otro teléfono");
    }
    const p = profileFrom(member);
    const meals = generateMeals(p, member.plan_cycle, data.prefs);
    const sql = await getSql();
    await sql`
      update members
      set prefs = ${JSON.stringify(data.prefs)}::jsonb,
          nutrition = ${JSON.stringify(meals)}::jsonb
      where user_id = ${context.userId}
    `;
    return { ok: true };
  });

export const logStrength = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { lift: string; kg: number; deviceId: string }) => ({
    lift: String(d.lift || ""),
    kg: Number(d.kg),
    deviceId: String(d.deviceId || ""),
  }))
  .handler(async ({ context, data }) => {
    if (!data.kg || data.kg < 5 || data.kg > 500) throw new Error("Kilos inválidos");
    const lift = ["press_banca", "sentadilla", "peso_muerto"].includes(data.lift)
      ? data.lift
      : "press_banca";
    const member = await loadMember(context.userId);
    if (!member || member.role !== "member") throw new Error("No autorizado");
    if (isExpired(member.app_expires_at)) throw new Error("La app está vencida");
    if (member.device_id && member.device_id !== data.deviceId) {
      throw new Error("Este plan está anclado a otro teléfono");
    }
    const sql = await getSql();
    const next: StrengthRow[] = [
      ...(member.strength || []),
      {
        id: Date.now(),
        lift,
        kg: data.kg,
        logged_at: new Date().toISOString(),
      },
    ].slice(-40);
    await sql`
      update members set strength = ${JSON.stringify(next)}::jsonb
      where user_id = ${context.userId}
    `;
    return { ok: true };
  });

export const setAvatar = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { image: string; deviceId: string }) => ({
    image: String(d.image || ""),
    deviceId: String(d.deviceId || ""),
  }))
  .handler(async ({ context, data }) => {
    if (!data.image.startsWith("data:image/jpeg;base64,")) {
      throw new Error("Usa una foto JPG");
    }
    if (data.image.length > 220_000) throw new Error("Foto muy pesada");
    const member = await loadMember(context.userId);
    if (!member || member.role !== "member") throw new Error("No autorizado");
    if (isExpired(member.app_expires_at)) throw new Error("La app está vencida");
    if (member.device_id && member.device_id !== data.deviceId) {
      throw new Error("Este plan está anclado a otro teléfono");
    }
    const sql = await getSql();
    await sql`
      update members set avatar = ${data.image} where user_id = ${context.userId}
    `;
    return { ok: true };
  });

export const regeneratePlan = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { deviceId: string }) => ({ deviceId: String(d.deviceId || "") }))
  .handler(async ({ context, data }) => {
    const member = await loadMember(context.userId);
    if (!member || member.role !== "member") throw new Error("No autorizado");
    if (isExpired(member.app_expires_at)) throw new Error("La app está vencida");
    if (member.device_id && member.device_id !== data.deviceId) {
      throw new Error("Este plan está anclado a otro teléfono");
    }
    const regen = canRegenAt(member.last_plan_at);
    if (!regen.ok) throw new Error("El siguiente plan se abre al mes");
    const cycle = member.plan_cycle + 1;
    const p = { ...profileFrom(member), weight: member.weight };
    const plan = buildPlan(p, cycle, member.prefs);
    const sql = await getSql();
    await sql`
      update members
      set plan_cycle = ${cycle},
          last_plan_at = now(),
          nutrition = ${JSON.stringify(plan.nutrition)}::jsonb,
          routine = ${JSON.stringify(plan.routine)}::jsonb
      where user_id = ${context.userId}
    `;
    return { ok: true };
  });

export type NewMemberInput = {
  name: string;
  email: string;
  password?: string;
  sex: Sex;
  age: number;
  height: number;
  weight: number;
  goal: Goal;
  level: Level;
  months: 3 | 6 | 12;
  sucursal?: string;
};

export const createMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: NewMemberInput) => ({
    name: d.name.trim(),
    email: d.email.trim().toLowerCase(),
    password: (d.password || "").trim(),
    sex: d.sex,
    age: Number(d.age),
    height: Number(d.height),
    weight: Number(d.weight),
    goal: d.goal,
    level: d.level,
    months: d.months === 12 || d.months === 6 ? d.months : 3,
    sucursal: String(d.sucursal || "").trim() || null,
  }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    if (!data.name || !data.email) throw new Error("Nombre y correo");
    if (data.age < 14 || data.age > 90) throw new Error("Edad inválida");
    if (data.height < 130 || data.height > 230) throw new Error("Estatura inválida");
    if (data.weight < 35 || data.weight > 250) throw new Error("Peso inválido");
    const { hashPass, genMemberPass } = await import("@/lib/pass.server");
    const password = data.password.length >= 8 ? data.password : genMemberPass();
    const userId = await createCredentialUser(data.email, password, data.name);
    const p: Profile = {
      name: data.name,
      sex: data.sex,
      age: data.age,
      height: data.height,
      weight: data.weight,
      goal: data.goal,
      level: data.level,
    };
    const plan = buildPlan(p, 0, DEFAULT_PREFS);
    const expires = plusMonths(new Date(), data.months).toISOString();
    const passHash = hashPass(password);
    const sql = await getSql();
    await ensureMemberColumns(sql);
    await sql`
      delete from members where email = ${data.email} and user_id <> ${userId}
    `;
    await sql`delete from weight_logs where user_id = ${userId}`;
    await sql`
      insert into members (
        user_id, name, email, role, sex, age, height, weight, goal, level,
        plan_cycle, last_plan_at, nutrition, routine, app_months, app_expires_at, pass_hash,
        sucursal, strength, prefs, avatar, tape, device_id
      ) values (
        ${userId}, ${data.name}, ${data.email}, 'member',
        ${data.sex}, ${data.age}, ${data.height}, ${data.weight},
        ${data.goal}, ${data.level}, 0, now(),
        ${JSON.stringify(plan.nutrition)}::jsonb,
        ${JSON.stringify(plan.routine)}::jsonb,
        ${data.months}, ${expires}, ${passHash},
        ${data.sucursal}, '[]'::jsonb, ${JSON.stringify(DEFAULT_PREFS)}::jsonb, null, '[]'::jsonb, null
      )
      on conflict (user_id) do update set
        name = excluded.name,
        email = excluded.email,
        role = 'member',
        sex = excluded.sex,
        age = excluded.age,
        height = excluded.height,
        weight = excluded.weight,
        goal = excluded.goal,
        level = excluded.level,
        plan_cycle = 0,
        last_plan_at = now(),
        nutrition = excluded.nutrition,
        routine = excluded.routine,
        app_months = excluded.app_months,
        app_expires_at = excluded.app_expires_at,
        device_id = null,
        pass_hash = excluded.pass_hash,
        sucursal = excluded.sucursal,
        strength = '[]'::jsonb,
        prefs = excluded.prefs,
        avatar = null,
        tape = '[]'::jsonb
    `;
    return { email: data.email, password, months: data.months, expires };
  });

export const listMembers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await ensureMemberColumns(sql);
    const rows = await sql<Record<string, unknown>>`
      select user_id, name, email, sex, age, weight, height, goal, level,
             device_id, last_plan_at, app_months, app_expires_at, sucursal
      from members
      where role = 'member'
      order by created_at desc
    `;
    return rows.map((r) => {
      const expires = r.app_expires_at ? String(r.app_expires_at) : null;
      const expired = isExpired(expires);
      const soon =
        !expired &&
        expires &&
        new Date(expires).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
      return {
        user_id: String(r.user_id),
        name: String(r.name),
        email: String(r.email),
        sex: r.sex === "mujer" ? "mujer" : "hombre",
        age: asNum(r.age),
        weight: asNum(r.weight),
        height: asNum(r.height),
        goal: String(r.goal),
        level: String(r.level),
        sucursal: r.sucursal ? String(r.sucursal) : "",
        deviceBound: Boolean(r.device_id),
        last_plan_at: r.last_plan_at ? String(r.last_plan_at) : null,
        months: asNum(r.app_months) || 3,
        expires,
        status: expired ? "vencido" : soon ? "por vencer" : "vigente",
      };
    });
  });

export const resetMemberPassword = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { userId: string }) => ({ userId: String(d.userId) }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const member = await loadMember(data.userId);
    if (!member || member.role !== "member") throw new Error("No existe");
    const { hashPass, genMemberPass } = await import("@/lib/pass.server");
    const password = genMemberPass();
    await createCredentialUser(member.email, password, member.name);
    const sql = await getSql();
    await ensureMemberColumns(sql);
    await sql`
      update members set pass_hash = ${hashPass(password)} where user_id = ${data.userId}
    `;
    return { email: member.email, password };
  });

export const resetDevice = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { userId: string }) => ({ userId: String(d.userId) }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`
      update members set device_id = null where user_id = ${data.userId} and role = 'member'
    `;
    return { ok: true };
  });

export const renewMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { userId: string; months: 3 | 6 | 12 }) => ({
    userId: String(d.userId),
    months: d.months === 12 || d.months === 6 ? d.months : 3,
  }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const member = await loadMember(data.userId);
    if (!member || member.role !== "member") throw new Error("No existe");
    const base =
      member.app_expires_at && new Date(member.app_expires_at).getTime() > Date.now()
        ? new Date(member.app_expires_at)
        : new Date();
    const expires = plusMonths(base, data.months).toISOString();
    const sql = await getSql();
    await sql`
      update members
      set app_months = ${data.months}, app_expires_at = ${expires}
      where user_id = ${data.userId} and role = 'member'
    `;
    return { ok: true, expires };
  });

export const updateMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: {
    userId: string;
    name: string;
    sex: Sex;
    age: number;
    height: number;
    weight: number;
    goal: Goal;
    level: Level;
    sucursal?: string;
  }) => ({
    userId: String(d.userId),
    name: String(d.name || "").trim(),
    sex: d.sex,
    age: Number(d.age),
    height: Number(d.height),
    weight: Number(d.weight),
    goal: d.goal,
    level: d.level,
    sucursal: String(d.sucursal || "").trim() || null,
  }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const member = await loadMember(data.userId);
    if (!member || member.role !== "member") throw new Error("No existe");
    if (!data.name) throw new Error("Nombre");
    if (data.age < 14 || data.age > 90) throw new Error("Edad inválida");
    if (data.height < 130 || data.height > 230) throw new Error("Estatura inválida");
    if (data.weight < 35 || data.weight > 250) throw new Error("Peso inválido");
    const p: Profile = {
      name: data.name,
      sex: data.sex,
      age: data.age,
      height: data.height,
      weight: data.weight,
      goal: data.goal,
      level: data.level,
    };
    const plan = buildPlan(p, member.plan_cycle, member.prefs);
    const sql = await getSql();
    await sql`
      update members set
        name = ${data.name},
        sex = ${data.sex},
        age = ${data.age},
        height = ${data.height},
        weight = ${data.weight},
        goal = ${data.goal},
        level = ${data.level},
        sucursal = ${data.sucursal},
        nutrition = ${JSON.stringify(plan.nutrition)}::jsonb,
        routine = ${JSON.stringify(plan.routine)}::jsonb
      where user_id = ${data.userId}
    `;
    return { ok: true };
  });

export const forcePlan = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { userId: string }) => ({ userId: String(d.userId) }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const member = await loadMember(data.userId);
    if (!member || member.role !== "member") throw new Error("No existe");
    const cycle = member.plan_cycle + 1;
    const plan = buildPlan(profileFrom(member), cycle, member.prefs);
    const sql = await getSql();
    await sql`
      update members
      set plan_cycle = ${cycle},
          last_plan_at = now(),
          nutrition = ${JSON.stringify(plan.nutrition)}::jsonb,
          routine = ${JSON.stringify(plan.routine)}::jsonb
      where user_id = ${data.userId}
    `;
    return { ok: true };
  });

export const logTape = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: {
    cintura: number;
    cadera: number;
    pecho: number;
    brazo: number;
    pierna: number;
    deviceId: string;
  }) => ({
    cintura: Number(d.cintura),
    cadera: Number(d.cadera),
    pecho: Number(d.pecho),
    brazo: Number(d.brazo),
    pierna: Number(d.pierna),
    deviceId: String(d.deviceId || ""),
  }))
  .handler(async ({ context, data }) => {
    const member = await loadMember(context.userId);
    if (!member || member.role !== "member") throw new Error("No autorizado");
    if (isExpired(member.app_expires_at)) throw new Error("La app está vencida");
    if (member.device_id && member.device_id !== data.deviceId) {
      throw new Error("Este plan está anclado a otro teléfono");
    }
    const next: TapeRow[] = [
      ...(member.tape || []),
      {
        cintura: data.cintura,
        cadera: data.cadera,
        pecho: data.pecho,
        brazo: data.brazo,
        pierna: data.pierna,
        logged_at: new Date().toISOString(),
      },
    ].slice(-24);
    const sql = await getSql();
    await sql`
      update members set tape = ${JSON.stringify(next)}::jsonb
      where user_id = ${context.userId}
    `;
    return { ok: true };
  });


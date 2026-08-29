import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Sex = "hombre" | "mujer";
export type Goal = "definir" | "volumen" | "recomp" | "fuerza";
export type Level = "principiante" | "intermedio" | "avanzado";
export type Lift = "press_banca" | "sentadilla" | "peso_muerto";

export type Profile = {
  name: string;
  sex: Sex;
  age: number;
  weight: number;
  height: number;
  goal: Goal;
  level: Level;
};

export type WeightLog = { id: string; date: string; kg: number };
export type StrengthLog = { id: string; date: string; lift: Lift; kg: number };

export type Client = {
  id: string;
  profile: Profile;
  weights: WeightLog[];
  strength: StrengthLog[];
};

type State = {
  clients: Client[];
  activeId: string | null;
  addClient: (name?: string) => string;
  removeClient: (id: string) => void;
  setActive: (id: string) => void;
  setProfile: (p: Partial<Profile>) => void;
  addWeight: (kg: number) => void;
  addStrength: (lift: Lift, kg: number) => void;
};

export const GOAL_LABEL: Record<Goal, string> = {
  definir: "Definir",
  volumen: "Hipertrofia",
  recomp: "Recomposición",
  fuerza: "Fuerza",
};

export const LEVEL_LABEL: Record<Level, string> = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

export const LIFT_LABEL: Record<Lift, string> = {
  press_banca: "Press banca",
  sentadilla: "Sentadilla",
  peso_muerto: "Peso muerto",
};

export const defaultProfile: Profile = {
  name: "",
  sex: "hombre",
  age: 25,
  weight: 75,
  height: 172,
  goal: "recomp",
  level: "intermedio",
};

function newClient(name = ""): Client {
  return {
    id: crypto.randomUUID(),
    profile: { ...defaultProfile, name },
    weights: [],
    strength: [],
  };
}

function mapActive(s: State, fn: (c: Client) => Client): State {
  if (!s.activeId) return s;
  return {
    ...s,
    clients: s.clients.map((c) => (c.id === s.activeId ? fn(c) : c)),
  };
}

export const useSocios = create<State>()(
  persist(
    (set) => ({
      clients: [],
      activeId: null,
      addClient: (name = "") => {
        const c = newClient(name);
        set((s) => ({
          clients: [...s.clients, c],
          activeId: c.id,
        }));
        return c.id;
      },
      removeClient: (id) =>
        set((s) => {
          const clients = s.clients.filter((c) => c.id !== id);
          const activeId =
            s.activeId === id ? (clients[0]?.id ?? null) : s.activeId;
          return { clients, activeId };
        }),
      setActive: (id) => set({ activeId: id }),
      setProfile: (p) =>
        set((s) =>
          mapActive(s, (c) => ({ ...c, profile: { ...c.profile, ...p } })),
        ),
      addWeight: (kg) =>
        set((s) =>
          mapActive(s, (c) => ({
            ...c,
            weights: [
              ...c.weights,
              { id: crypto.randomUUID(), date: new Date().toISOString(), kg },
            ],
          })),
        ),
      addStrength: (lift, kg) =>
        set((s) =>
          mapActive(s, (c) => ({
            ...c,
            strength: [
              ...c.strength,
              {
                id: crypto.randomUUID(),
                date: new Date().toISOString(),
                lift,
                kg,
              },
            ],
          })),
        ),
    }),
    {
      name: "steel-gym-socios",
      version: 2,
      migrate: (persisted, version) => {
        const p = persisted as Record<string, unknown>;
        if (version < 2 && p && p.profile) {
          const id = "legacy";
          return {
            clients: [
              {
                id,
                profile: p.profile as Profile,
                weights: (p.weights as WeightLog[]) ?? [],
                strength: (p.strength as StrengthLog[]) ?? [],
              },
            ],
            activeId: id,
          };
        }
        return p as State;
      },
    },
  ),
);

export function useActiveClient() {
  return useSocios((s) => s.clients.find((c) => c.id === s.activeId) ?? null);
}

export function mifflinBmr(p: Profile) {
  const base = 10 * p.weight + 6.25 * p.height - 5 * p.age;
  return p.sex === "hombre" ? base + 5 : base - 161;
}

export function dailyTargets(p: Profile) {
  const bmr = mifflinBmr(p);
  const tdee = bmr * 1.55;
  const delta =
    p.goal === "definir"
      ? -400
      : p.goal === "volumen"
        ? 300
        : p.goal === "fuerza"
          ? 200
          : 0;
  const kcal = Math.round(tdee + delta);
  const protein = Math.round(p.weight * 2.0);
  const fat = Math.round(p.weight * 0.8);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal, protein, fat, carbs, bmr: Math.round(bmr) };
}

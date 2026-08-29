export const PROTEIN_OPTS = [
  "Pollo",
  "Carne de res",
  "Huevo",
  "Mariscos / pescado",
  "Pavo",
  "Atún",
  "Queso cottage / fresco",
] as const;

export const CARB_OPTS = [
  "Arroz blanco",
  "Arroz integral",
  "Papa",
  "Camote",
  "Tortilla de maíz",
  "Tostadas horneadas",
  "Avena",
  "Plátano",
  "Pan integral",
] as const;

export const FAT_OPTS = [
  "Aguacate",
  "Aceite de oliva",
  "Nueces / almendras",
  "Crema de cacahuate",
  "Yema de huevo",
  "Salmón / pescado graso",
  "Semillas (chía, linaza)",
] as const;

export const SUPP_OPTS = [
  "Proteína en polvo",
  "Creatina",
  "Pre-entreno",
  "Glutamina",
  "Aminoácidos (EAA)",
  "BCAAs",
  "Omega-3",
  "Multivitamínico",
] as const;

export const SCHEDULE_OPTS = [
  "Mañana (06:00 – 09:00)",
  "Mediodía (12:00 – 15:00)",
  "Tarde (15:00 – 18:00)",
  "Noche (18:00 – 21:00)",
] as const;

export type FoodPrefs = {
  proteins: string[];
  carbs: string[];
  fats: string[];
  supplements: string[];
  schedule: string;
};

export const DEFAULT_PREFS: FoodPrefs = {
  proteins: ["Pollo", "Huevo", "Atún"],
  carbs: ["Arroz blanco", "Avena", "Camote"],
  fats: ["Aceite de oliva", "Aguacate"],
  supplements: [],
  schedule: "Tarde (15:00 – 18:00)",
};

export function normalizePrefs(raw: unknown): FoodPrefs {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const list = (v: unknown, fallback: string[]) =>
    Array.isArray(v) && v.length ? v.map(String) : fallback;
  return {
    proteins: list(o.proteins, DEFAULT_PREFS.proteins),
    carbs: list(o.carbs, DEFAULT_PREFS.carbs),
    fats: list(o.fats, DEFAULT_PREFS.fats),
    supplements: Array.isArray(o.supplements) ? o.supplements.map(String) : [],
    schedule: typeof o.schedule === "string" && o.schedule ? o.schedule : DEFAULT_PREFS.schedule,
  };
}

export function supplementHints(supps: string[], schedule: string): { name: string; text: string }[] {
  const map: Record<string, string> = {
    "Proteína en polvo": "1 scoop post-entreno o entre comidas si no llegas a proteína.",
    Creatina: "5 g diario, todos los días. Cualquier hora, con comida.",
    "Pre-entreno": `20–30 min antes de entrenar (${schedule}).`,
    Glutamina: "5–10 g post-entreno o antes de dormir.",
    "Aminoácidos (EAA)": "Intra-entreno o al despertar si el ayuno es largo.",
    BCAAs: "Intra-entreno. Si ya usas EAA o whey, no es obligatorio.",
    "Omega-3": "1–2 g con una comida que lleve grasa.",
    Multivitamínico: "Con el desayuno.",
  };
  return supps.filter((s) => map[s]).map((s) => ({ name: s, text: map[s] }));
}

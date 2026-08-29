import { dailyTargets, type Profile } from "./socios-store";
import { DEFAULT_PREFS, type FoodPrefs } from "./food-prefs";

export type Meal = {
  name: string;
  food: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  swap?: string;
};

const NAMES = [
  "Comida 1 — Desayuno",
  "Snack 1 — Media mañana",
  "Comida 2 — Almuerzo",
  "Snack 2 — Pre / post entreno",
  "Comida 3 — Cena temprana",
  "Comida 4 — Antes de dormir",
];

const PARTS = [0.22, 0.08, 0.25, 0.1, 0.2, 0.15];

function pick(list: string[], i: number, fallback: string) {
  if (!list.length) return fallback;
  return list[i % list.length] ?? fallback;
}

function proteinLine(g: number, choice: string, meal: number) {
  const grams = Math.max(40, Math.round(g / 0.27 / 5) * 5);
  if (choice === "Huevo") {
    const n = Math.max(2, Math.round(g / 6.5));
    return meal === 5 ? `${Math.max(2, n - 1)} claras + 1 yema` : `${n} huevos`;
  }
  if (choice.includes("cottage")) return `${Math.max(80, Math.round(g / 0.12 / 10) * 10)}g queso cottage`;
  if (choice === "Atún") return `${Math.max(80, grams)}g atún en agua`;
  if (choice.includes("Marisco")) return `${grams}g pescado o camarón`;
  if (choice === "Pavo") return `${grams}g pavo`;
  if (choice.includes("res")) return `${grams}g carne de res magra`;
  return `${grams}g ${choice.toLowerCase()}`;
}

function carbLine(g: number, choice: string, meal: number) {
  if (choice === "Plátano" || meal === 1) {
    const n = Math.max(1, Math.round(g / 25));
    return n <= 1 ? "1 fruta (manzana o plátano, ~120 g)" : `${n} frutas (~${n * 120} g)`;
  }
  if (choice.includes("Tortilla")) {
    const n = Math.max(2, Math.round(g / 15));
    return `${n} tortillas de maíz (~${n * 30} g)`;
  }
  if (choice.includes("Tostadas")) {
    const n = Math.max(2, Math.round(g / 12));
    return `${n} tostadas horneadas`;
  }
  if (choice.includes("Pan")) {
    const n = Math.max(1, Math.round(g / 25));
    return `${n} rebanada(s) de pan integral (~${n * 30} g)`;
  }
  const dry = choice.includes("Avena");
  const factor = dry ? 0.6 : 0.28;
  const grams = Math.max(40, Math.round(g / factor / 10) * 10);
  return dry ? `${grams}g avena (peso en seco)` : `${grams}g ${choice.toLowerCase()} cocido`;
}

function fatLine(g: number, choice: string) {
  if (choice.includes("Aceite")) {
    const n = Math.max(1, Math.round(g / 4));
    return `${n} cdita${n > 1 ? "s" : ""} de aceite de oliva (~${n * 5} ml)`;
  }
  if (choice.includes("Aguacate")) return g >= 12 ? "1/2 aguacate (~70 g)" : "1/4 aguacate (~35 g)";
  if (choice.includes("Crema")) return `${Math.max(10, Math.round(g / 0.5 / 5) * 5)}g crema de cacahuate`;
  if (choice.includes("Yema")) return "1 yema extra";
  if (choice.includes("Salmón")) return `${Math.max(50, Math.round(g / 0.13 / 10) * 10)}g salmón`;
  if (choice.includes("Nuez") || choice.includes("Semilla")) {
    return `${Math.max(10, Math.round(g / 0.5 / 5) * 5)}g nueces o semillas`;
  }
  return `${Math.max(10, Math.round(g / 0.5 / 5) * 5)}g ${choice.toLowerCase()}`;
}

function veg(meal: number) {
  if (meal === 2 || meal === 4) return " + 150g verduras al vapor o ensalada";
  return "";
}

function swapHint(pro: string, carb: string) {
  return `Si no hay ${pro.toLowerCase()}, usa otra proteína de tu lista. Si no hay ${carb.toLowerCase()}, cambia por otro carbo de tu lista (misma cantidad).`;
}

export function generateMeals(profile: Profile, cycle = 0, prefs: FoodPrefs = DEFAULT_PREFS): Meal[] {
  const t = dailyTargets(profile);
  const shift = Math.abs(cycle) % 3;
  return NAMES.map((name, i) => {
    const p = PARTS[i] ?? 0.16;
    const protein = Math.round(t.protein * p);
    const carbs = Math.round(t.carbs * p);
    const fat = Math.round(t.fat * p);
    const kcal = Math.round(t.kcal * p);
    const pro = pick(prefs.proteins, i + shift, "Pollo");
    const carb = pick(prefs.carbs, i + shift + 1, "Arroz blanco");
    const fatC = pick(prefs.fats, i + shift, "Aceite de oliva");

    let food: string;
    if (i === 1) {
      food = `${proteinLine(protein, pro.includes("Huevo") ? "Huevo" : pro, i)} + ${carbLine(Math.max(20, carbs), "Plátano", 1)}`;
    } else if (i === 3) {
      const dairy = prefs.proteins.find((x) => x.includes("cottage")) || "yogurt griego";
      const dairyG = Math.max(100, Math.round(protein / 0.12 / 10) * 10);
      food = `${dairyG}g ${dairy.toLowerCase()} + 1 plátano (~120 g) + ${fatLine(Math.max(4, fat), fatC)}`;
    } else if (i === 5) {
      food = `${proteinLine(protein, "Huevo", 5)} + ${carbLine(Math.max(20, carbs * 0.7), "Avena", i)} + ${fatLine(Math.max(4, fat), fatC)}`;
    } else {
      food = [proteinLine(protein, pro, i), carbLine(carbs, carb, i), fatLine(Math.max(4, fat), fatC)].join(" + ");
      food += veg(i);
    }

    return { name, food, kcal, protein, carbs, fat, swap: swapHint(pro, carb) };
  });
}

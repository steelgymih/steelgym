export type PreComp = {
  weight: number;
  protein: number;
  water: string;
  phases: { title: string; items: string[] }[];
  food: string;
  supplements: { name: string; text: string }[];
  warning: string;
};

export function preCompProtocol(weight: number): PreComp {
  const kg = weight > 30 ? weight : 75;
  return {
    weight: kg,
    protein: Math.round(kg * 2.2),
    water: kg >= 90 ? "5 L" : "4–5 L",
    phases: [
      {
        title: "Días –7 a –4 · Depleción de carbohidratos",
        items: [
          "Carbos bajos ~50–80 g/día (verduras + mínimo almidón).",
          `Proteína alta (~${Math.round(kg * 2.2)} g). Grasas moderadas.`,
          "Entreno: intensidad alta, volumen –20–30%.",
          "Cardio LISS 30–40 min diario.",
          "Agua 4–5 L. Sodio normal (aún no restringir).",
        ],
      },
      {
        title: "Días –3 a –2 · Carga de carbohidratos",
        items: [
          "Subir carbos escalonado (ej. 4–7 g/kg según tolerancia).",
          "Arroz, camote, papa, avena. Grasas bajas en esas comidas.",
          "Entrenos cortos / bomb pumps o solo movilidad.",
          "Agua alta; sodio normal o ligera baja el –2.",
        ],
      },
      {
        title: "Día –1 · Ajuste fino",
        items: [
          "Carbos según cómo te veas (no sobrecargar).",
          "Bajar sodio añadido (evitar embutidos y salsas).",
          "Agua: alta hasta tarde; reducir solo si el protocolo lo indica.",
          "Sin pesado: poses y caminata.",
        ],
      },
      {
        title: "Día del evento",
        items: [
          "Comidas pequeñas ya probadas (arroz, plátano, miel).",
          "Sodio/agua según plan individual.",
          "No probar alimentos nuevos.",
        ],
      },
    ],
    food: "Alimentos que ya toleras. Menos fibra 48 h antes del escenario. Cocina simple: plancha, horno, hervido.",
    supplements: [
      { name: "Creatina", text: "mantener hasta –2; cortar 1–2 días es opcional." },
      { name: "Proteína en polvo", text: "útil en depleción para llegar a proteína sin volumen." },
      { name: "Cafeína / pre", text: "solo en días de entreno; el show, dosis conocida y temprana." },
      { name: "Electrolitos", text: "con mucha agua en depleción; equilibra con tu coach." },
    ],
    warning:
      "Deshidratación agresiva y corte extremo de sodio tienen riesgos. Solo con supervisión profesional.",
  };
}

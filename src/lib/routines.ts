import type { Level, Sex } from "./socios-store";

export type Exercise = {
  name: string;
  sets: string;
  rest?: string;
  note?: string;
  tag?: string;
  alts?: string[];
};

export type Session = {
  day: string;
  title: string;
  items: Exercise[];
};

export type RoutineMeta = {
  variant: "A" | "B" | "C";
  summary: string;
  method: string;
};

function ex(name: string, series: string, rest: string, tag?: string): Exercise {
  return {
    name,
    sets: series.includes("×") ? series : `${series}`,
    rest: rest ? `Descanso ${rest}` : undefined,
    tag,
  };
}

const P_H: Session[] = [
  {
    day: "Lunes · Full body A",
    title: "Empuje y pierna",
    items: [
      ex("Sentadilla goblet o smith", "3 series × 8–10 repeticiones", "2 minutos"),
      ex("Press banca mancuernas", "3 series × 8–10 repeticiones", "90 segundos"),
      ex("Prensa", "3 series × 10 repeticiones", "90 segundos"),
      ex("Press de hombro mancuerna", "3 series × 10 repeticiones", "75 segundos"),
      ex("Remo en máquina", "3 series × 10 repeticiones", "75 segundos"),
      ex("Plancha", "3 series × 30 segundos", "45 segundos"),
    ],
  },
  {
    day: "Miércoles · Full body B",
    title: "Jalón y posterior",
    items: [
      ex("Peso muerto rumano", "3 series × 8 repeticiones", "2 minutos"),
      ex("Jalón al pecho", "3 series × 10 repeticiones", "90 segundos"),
      ex("Zancadas", "3 series × 8 c/u", "90 segundos"),
      ex("Press inclinado", "3 series × 10 repeticiones", "75 segundos"),
      ex("Extensión de tríceps cuerda", "2 series × 12 repeticiones", "60 segundos"),
      ex("Face pull", "2 series × 15 repeticiones", "45 segundos"),
    ],
  },
  {
    day: "Viernes · Full body C",
    title: "Mixto",
    items: [
      ex("Hack o prensa", "3 series × 10 repeticiones", "2 minutos"),
      ex("Remo con barra o smith", "3 series × 8 repeticiones", "90 segundos"),
      ex("Press militar", "3 series × 8 repeticiones", "90 segundos"),
      ex("Hip thrust", "3 series × 10 repeticiones", "75 segundos"),
      ex("Elevaciones laterales", "3 series × 15 repeticiones", "45 segundos"),
      ex("Abdominal en máquina", "3 series × 12 repeticiones", "45 segundos"),
    ],
  },
];

const I_H: Session[] = [
  {
    day: "Lunes · Hombro y bíceps",
    title: "Deltoides + brazo",
    items: [
      ex("Press militar mancuernas", "4 series × 6–10 repeticiones", "2 minutos", "Sarcomérica"),
      ex("Elevaciones laterales en cable", "4 series × 12–15 repeticiones", "60 segundos", "Rest-pause"),
      ex("Pájaros mancuernas", "3 series × 12–15 repeticiones", "60 segundos"),
      ex("Encogimientos mancuernas", "3 series × 10–12 repeticiones", "60–90 segundos"),
      ex("Curl barra o predicador", "3 series × 8–12 repeticiones", "75 segundos", "Sarcomérica"),
      ex("Curl martillo", "3 series × 12 repeticiones", "60 segundos"),
    ],
  },
  {
    day: "Martes · Pierna",
    title: "Cuádriceps / glúteo",
    items: [
      ex("Sentadilla o smith", "4 series × 6–10 repeticiones", "2–3 minutos", "Sarcomérica"),
      ex("Prensa", "4 series × 10–12 repeticiones", "90 segundos"),
      ex("Hack squat o goblet", "3 series × 10 repeticiones", "90 segundos"),
      ex("Extensión de cuádriceps", "3 series × 12–15 repeticiones", "60 segundos", "Rest-pause"),
      ex("Zancada caminando", "3 series × 10 c/u", "75 segundos"),
      ex("Pantorrilla de pie", "4 series × 12 repeticiones", "45 segundos"),
    ],
  },
  {
    day: "Miércoles · Espalda y tríceps",
    title: "Ancho + brazo",
    items: [
      ex("Jalón al pecho o dominadas", "4 series × 6–10 repeticiones", "2 minutos", "Sarcomérica"),
      ex("Remo sentado", "4 series × 8–10 repeticiones", "90 segundos"),
      ex("Remo mancuerna a una mano", "3 series × 10 repeticiones", "75 segundos"),
      ex("Pull-over o face pull", "3 series × 12–15 repeticiones", "60 segundos"),
      ex("Press cerrado o fondos", "3 series × 8–10 repeticiones", "75 segundos", "Sarcomérica"),
      ex("Cuerda tríceps", "3 series × 12–15 repeticiones", "45 segundos", "Rest-pause"),
    ],
  },
  {
    day: "Jueves · Pierna posterior",
    title: "Femoral / glúteo",
    items: [
      ex("Peso muerto rumano", "4 series × 6–8 repeticiones", "2 minutos", "Sarcomérica"),
      ex("Hip thrust", "4 series × 8–10 repeticiones", "90 segundos"),
      ex("Curl femoral sentado", "3 series × 10–12 repeticiones", "60 segundos"),
      ex("Buenos días o hiperextensión", "3 series × 10 repeticiones", "75 segundos"),
      ex("Patada de glúteo", "3 series × 12 c/u", "45 segundos"),
      ex("Pantorrilla sentado", "4 series × 12–15 repeticiones", "45 segundos"),
    ],
  },
  {
    day: "Viernes · Pecho",
    title: "Empuje horizontal",
    items: [
      ex("Press banca barra o smith", "4 series × 6–8 repeticiones", "2–3 minutos", "Sarcomérica"),
      ex("Press inclinado mancuernas", "3 series × 8–10 repeticiones", "90 segundos"),
      ex("Aperturas en máquina o polea", "3 series × 12–15 repeticiones", "60 segundos"),
      ex("Press declinado o fondos", "3 series × 8–10 repeticiones", "75 segundos"),
      ex("Cruce de poleas", "3 series × 12–15 repeticiones", "45 segundos", "Rest-pause"),
      ex("Fondos de pecho o flexiones lastradas", "3 series × 8–12 repeticiones", "75 segundos"),
    ],
  },
  {
    day: "Sábado · Pierna volumen",
    title: "Densificación",
    items: [
      ex("Prensa pies medios", "4 series × 12–15 repeticiones", "75 segundos", "Sarcoplasmática"),
      ex("Sentadilla búlgaro", "3 series × 8 c/u", "75 segundos"),
      ex("Extensión de cuádriceps", "3 series × 15 repeticiones", "45 segundos", "Rest-pause"),
      ex("Curl femoral", "3 series × 15 repeticiones", "45 segundos"),
      ex("Abducción / aducción", "3 series × 15 repeticiones", "45 segundos"),
      ex("Pantorrilla + core", "3 rondas", "60 segundos"),
    ],
  },
];

const A_H: Session[] = [
  {
    day: "Lunes · Pecho pesado",
    title: "Fuerza de empuje",
    items: [
      ex("Press banca", "5 series × 4–6 repeticiones", "3 minutos", "Sarcomérica"),
      ex("Press inclinado barra", "4 series × 6–8 repeticiones", "2 minutos"),
      ex("Press declinado o smith", "3 series × 8 repeticiones", "90 segundos"),
      ex("Cruce de poleas", "3 series × 12–15 repeticiones", "45 segundos", "Rest-pause"),
      ex("Fondos lastrados", "3 series × 6–8 repeticiones", "90 segundos"),
      ex("Aperturas mancuerna tempo 3-1-1", "3 series × 10 repeticiones", "60 segundos"),
    ],
  },
  {
    day: "Martes · Espalda ancha",
    title: "Jalón pesado",
    items: [
      ex("Peso muerto", "4 series × 3–5 repeticiones", "3 minutos", "Sarcomérica"),
      ex("Dominadas o jalón lastrado", "4 series × 6–8 repeticiones", "2 minutos"),
      ex("Remo Pendlay / smith", "4 series × 6–8 repeticiones", "2 minutos"),
      ex("Remo a una mano", "3 series × 10 repeticiones", "75 segundos"),
      ex("Pull-over + face pull", "3 series × 12–15 repeticiones", "60 segundos"),
      ex("Hiperextensión lastre", "3 series × 10 repeticiones", "60 segundos"),
    ],
  },
  {
    day: "Miércoles · Hombro / brazo",
    title: "Detalle",
    items: [
      ex("Press militar", "4 series × 5–8 repeticiones", "2 minutos", "Sarcomérica"),
      ex("Laterales 3 ángulos", "4 series × 12–15 repeticiones", "45 segundos", "Rest-pause"),
      ex("Pájaros / reverse fly", "3 series × 15 repeticiones", "45 segundos"),
      ex("Curl predicador", "3 series × 8–12 repeticiones", "75 segundos"),
      ex("Press cerrado + cuerda", "3 series × 8–12 repeticiones", "75 segundos"),
      ex("Core lastre", "3 rondas", "60 segundos"),
    ],
  },
  {
    day: "Jueves · Piernas fuerza",
    title: "Sentadilla / prensa",
    items: [
      ex("Sentadilla", "5 series × 4–6 repeticiones", "3 minutos", "Sarcomérica"),
      ex("Prensa pies altos", "4 series × 8 repeticiones", "2 minutos"),
      ex("Hack squat", "3 series × 8 repeticiones", "90 segundos"),
      ex("Peso muerto rumano", "4 series × 6–8 repeticiones", "2 minutos"),
      ex("Walking lunges", "3 series × 10 c/u", "75 segundos"),
      ex("Pantorrilla de pie", "5 series × 10 repeticiones", "45 segundos"),
    ],
  },
  {
    day: "Viernes · Torso volumen",
    title: "Densificación",
    items: [
      ex("Press inclinado mancuernas", "4 series × 8–12 repeticiones", "90 segundos", "Sarcoplasmática"),
      ex("Jalón agarre neutro", "4 series × 10–12 repeticiones", "75 segundos"),
      ex("Remo sentado agarre cerrado", "3 series × 12 repeticiones", "60 segundos"),
      ex("Laterales cable", "4 series × 15 repeticiones", "45 segundos", "Rest-pause"),
      ex("Súper serie bíceps + tríceps", "3 series × 12", "75 segundos"),
      ex("Abs rueda o máquina", "3 series × 12", "45 segundos"),
    ],
  },
  {
    day: "Sábado · Posterior",
    title: "Glúteo / femoral",
    items: [
      ex("Hip thrust pausa", "4 series × 6–8 repeticiones", "2 minutos", "Sarcomérica"),
      ex("Peso muerto rumano deficit", "4 series × 6–8 repeticiones", "2 minutos"),
      ex("Curl femoral", "4 series × 10 repeticiones", "60 segundos"),
      ex("Step-up", "3 series × 8 c/u", "75 segundos"),
      ex("Abducción pesada", "3 series × 12 repeticiones", "45 segundos"),
      ex("Core lastre", "4 rondas", "60 segundos"),
    ],
  },
];

function fem(sessions: Session[]): Session[] {
  return sessions.map((s) => ({
    ...s,
    items: s.items.map((it) => {
      let name = it.name;
      if (/press banca/i.test(name) && /barra/.test(name)) name = "Press banca smith o mancuernas";
      if (/peso muerto$/i.test(name)) name = "Peso muerto rumano o trap bar";
      if (/dominadas/i.test(name)) name = "Dominadas asistidas / jalón";
      if (/sentadilla$/i.test(name)) name = "Sentadilla smith o prensa alta";
      return { ...it, name };
    }),
  }));
}

const P_M: Session[] = [
  {
    day: "Lunes · Pierna / glúteo",
    title: "Base",
    items: [
      ex("Prensa", "3 series × 10 repeticiones", "2 minutos"),
      ex("Hip thrust", "3 series × 10 repeticiones", "90 segundos"),
      ex("Zancadas estáticas", "3 series × 8 c/u", "75 segundos"),
      ex("Abducción en máquina", "3 series × 15 repeticiones", "45 segundos"),
      ex("Jalón al pecho", "3 series × 10 repeticiones", "75 segundos"),
      ex("Plancha", "3 series × 25 segundos", "45 segundos"),
    ],
  },
  {
    day: "Miércoles · Tren superior",
    title: "Empuje / jalón",
    items: [
      ex("Press mancuernas", "3 series × 10 repeticiones", "90 segundos"),
      ex("Remo en máquina", "3 series × 10 repeticiones", "75 segundos"),
      ex("Press de hombro", "3 series × 10 repeticiones", "75 segundos"),
      ex("Curl + tríceps cuerda", "2 series × 12 repeticiones", "60 segundos"),
      ex("Laterales", "3 series × 15 repeticiones", "45 segundos"),
      ex("Face pull", "2 series × 15 repeticiones", "45 segundos"),
    ],
  },
  {
    day: "Viernes · Glúteo / core",
    title: "Posterior",
    items: [
      ex("Hip thrust", "4 series × 10 repeticiones", "90 segundos"),
      ex("Peso muerto rumano", "3 series × 10 repeticiones", "90 segundos"),
      ex("Patada de glúteo", "3 series × 12 c/u", "45 segundos"),
      ex("Extensión lumbar", "3 series × 12 repeticiones", "45 segundos"),
      ex("Abducción", "3 series × 15 repeticiones", "45 segundos"),
      ex("Abs en máquina", "3 series × 15 repeticiones", "45 segundos"),
    ],
  },
];

const TABLE: Record<Sex, Record<Level, Session[]>> = {
  hombre: { principiante: P_H, intermedio: I_H, avanzado: A_H },
  mujer: { principiante: P_M, intermedio: fem(I_H), avanzado: fem(A_H) },
};

const METHOD: Record<Level, string> = {
  principiante:
    "3 días full body. Técnica primero, cargas que puedas controlar. 6 ejercicios por sesión.",
  intermedio:
    "Método híbrido: cargas altas y tempo controlado (sarcomérica) + volumen y densificación (sarcoplasmática). 6 días, 6 ejercicios por sesión.",
  avanzado:
    "Fuerza en compuestos (3–6 reps) y densificación en accesorios. 6 días. Técnicas: rest-pause y tempo.",
};

const SUMMARY: Record<Level, string> = {
  principiante: "Lun full A · Mié full B · Vie full C",
  intermedio:
    "Lun hombro/bíceps · Mar pierna · Mié espalda/tríceps · Jue pierna · Vie pecho · Sáb pierna",
  avanzado: "Lun pecho · Mar espalda · Mié hombro/brazo · Jue pierna · Vie torso · Sáb posterior",
};

export function routineMeta(level: Level, cycle = 0): RoutineMeta {
  const variant = (["A", "B", "C"] as const)[Math.abs(cycle) % 3] ?? "A";
  return {
    variant,
    summary: SUMMARY[level],
    method: METHOD[level],
  };
}

export function getRoutine(sex: Sex, level: Level, cycle = 0): Session[] {
  const base = TABLE[sex][level];
  const n = Math.abs(cycle) % 3;
  return base.map((session) => {
    const items = session.items.map((it, j) => {
      const alts = altsFor(it.name);
      const swapped = n === 1 && alts[0] ? alts[0] : it.name;
      return {
        ...it,
        name: swapped,
        alts: alts.filter((a) => a !== swapped),
        tag: n === 2 && j === 0 ? "Sarcomérica" : n === 1 && j === 1 ? "Rest-pause" : it.tag,
        sets: n === 2 && j === 0 ? bump(it.sets) : it.sets,
        rest: n === 2 && j === 0 ? "Descanso 3 minutos" : it.rest,
      };
    });
    return {
      ...session,
      title: n === 0 ? session.title : `${session.title} · variante ${n === 1 ? "B" : "C"}`,
      items,
    };
  });
}

function altsFor(name: string): string[] {
  const key = Object.keys(ALTS).find((k) => name.toLowerCase().includes(k.toLowerCase()));
  if (key) return ALTS[key] ?? [];
  return ["Misma patrón en máquina", "Misma patrón con mancuernas", "Smith o cable"];
}

const ALTS: Record<string, string[]> = {
  "press banca": ["Press banca con barra", "Press en máquina", "Smith press"],
  "press militar": ["Press militar barra", "Press hombro máquina", "Arnold press"],
  "press de hombro": ["Press militar mancuerna", "Press hombro máquina", "Arnold press"],
  "press mancuernas": ["Press barra", "Press máquina", "Fondos asistidos"],
  "press inclinado": ["Press inclinado barra", "Press inclinado máquina", "Aperturas"],
  sentadilla: ["Sentadilla smith", "Prensa", "Hack squat"],
  goblet: ["Sentadilla smith", "Prensa", "Zancadas"],
  prensa: ["Hack squat", "Sentadilla smith", "Zancadas"],
  hack: ["Prensa", "Sentadilla smith", "Zancadas"],
  "peso muerto": ["Peso muerto rumano", "Hip thrust", "Buenos días"],
  rumano: ["Peso muerto convencional", "Hip thrust", "Extensión lumbar"],
  "hip thrust": ["Puente de glúteo", "Patada de glúteo", "Peso muerto rumano"],
  jalón: ["Dominadas asistidas", "Pullover", "Remo alto"],
  remo: ["Remo mancuerna", "Remo cable", "Remo smith"],
  zancadas: ["Búlgaras", "Prensa unipodal", "Step-up"],
  laterales: ["Laterales mancuerna", "Laterales máquina", "Laterales inclinado"],
  curl: ["Curl mancuerna", "Curl predicador", "Curl martillo"],
  tríceps: ["Fondos", "Press cerrado", "Patada de tríceps"],
  "face pull": ["Pájaros", "Aperturas invertidas", "Remo al mentón ancho"],
  plancha: ["Dead bug", "Abs máquina", "Rueda abdominal"],
  abdominal: ["Crunch máquina", "Elevación de piernas", "Plancha"],
};

function bump(sets: string) {
  return sets.replace(/4 series/, "5 series").replace(/3 series/, "4 series");
}

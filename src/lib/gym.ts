import { waLink } from "./utils";

export const BRAND = {
  name: "STEEL GYM",
  city: "Ciudad Juárez",
  state: "Chihuahua",
  tagline: "Tu disciplina no tiene horario.",
  instagram: "https://www.instagram.com/steel_gymft/",
  instagramHandle: "@steel_gymft",
  facebook:
    "https://www.facebook.com/p/STEEL-GYM-Santiago-Troncoso-100088265341704/",
  email: "steelpraderasdelsol@gmail.com",
} as const;

export type LocationId = "troncoso" | "praderas" | "tierra";

export type GymLocation = {
  id: LocationId;
  name: string;
  short: string;
  address: string;
  colonia: string;
  zip: string;
  maps: string;
  phone: string;
  phoneLabel: string;
};

export const LOCATIONS: GymLocation[] = [
  {
    id: "troncoso",
    name: "Santiago Troncoso",
    short: "Troncoso",
    address: "Av. Santiago Troncoso #280",
    colonia: "Horizontes del Sur",
    zip: "32575",
    maps: "https://maps.google.com/?q=Av+Santiago+Troncoso+280+Horizontes+del+Sur+Ciudad+Juarez",
    phone: "6563532967",
    phoneLabel: "656 353 2967",
  },
  {
    id: "praderas",
    name: "Praderas del Sol",
    short: "Praderas",
    address: "Calle Sol del Río 4551",
    colonia: "Praderas del Sol",
    zip: "32576",
    maps: "https://maps.google.com/?q=Calle+Sol+del+Rio+4551+Praderas+del+Sol+Ciudad+Juarez",
    phone: "6568346208",
    phoneLabel: "656 834 6208",
  },
  {
    id: "tierra",
    name: "Tierra Nueva",
    short: "Tierra Nueva",
    address: "Calle Puerto Huelva",
    colonia: "Tierra Nueva",
    zip: "32599",
    maps: "https://maps.google.com/?q=Calle+Puerto+Huelva+32599+Ciudad+Juarez",
    phone: "6568494120",
    phoneLabel: "656 849 4120",
  },
];

export const HOURS = {
  weekdays: "24 horas",
  saturday: "8:00 – 16:30",
  sunday: "Cerrado",
  label: "24/5",
} as const;

export type Plan = {
  id: string;
  name: string;
  price: number;
  period: string;
  perMonth?: number;
  featured?: boolean;
  badge?: string;
  note?: string;
};

export const PLANS: Plan[] = [
  {
    id: "semanal",
    name: "Semanal",
    price: 300,
    period: "7 días",
  },
  {
    id: "mensual",
    name: "Mensual",
    price: 785,
    period: "1 mes",
    perMonth: 785,
  },
  {
    id: "bimestral",
    name: "Bimestral",
    price: 1599,
    period: "2 meses",
    perMonth: 800,
  },
  {
    id: "trimestral",
    name: "Trimestral",
    price: 2099,
    period: "3 meses",
    perMonth: 700,
  },
  {
    id: "promo4",
    name: "4 meses",
    price: 2599,
    period: "resto del año",
    perMonth: 650,
    featured: true,
    badge: "Promo",
    note: "Entrena lo que queda del año.",
  },
  {
    id: "semestral",
    name: "Semestral",
    price: 3299,
    period: "6 meses",
    perMonth: 550,
  },
];

export const PERKS = [
  "Sin inscripción",
  "Sin mantenimiento",
  "Acceso a 3 sucursales",
  "App de dieta y rutina (se contrata aparte)",
] as const;

export const AMENITIES = [
  {
    title: "Peso libre y racks",
    body: "Smith, bancos, jaulas y discos olímpicos. El piso de hule y el acero están para usarse.",
  },
  {
    title: "Máquinas de alto rendimiento",
    body: "Líneas plate-loaded y selectorizadas para trabajar con precisión, no con improvisación.",
  },
  {
    title: "Área cardiovascular",
    body: "Espacio para calentar, quemar y cerrar la sesión sin pelear por un aparato.",
  },
  {
    title: "App del gym",
    body: "Servicio extra que se contrata aparte de la membresía. Dieta, rutina y seguimiento en el celular por 3, 6 o 12 meses.",
  },
  {
    title: "Horario 24/5",
    body: "Lunes a viernes, las 24 horas. Sábado 8:00 a 16:30. El domingo descansa el acero.",
  },
  {
    title: "Tres sucursales",
    body: "Troncoso, Praderas del Sol y Tierra Nueva. Una membresía, tres pisos.",
  },
] as const;

export const FAQ = [
  {
    q: "¿Qué significa 24/5?",
    a: "Abierto las 24 horas de lunes a viernes. Sábado de 8:00 a 16:30. Domingo cerrado.",
  },
  {
    q: "¿Puedo entrenar en las tres sucursales?",
    a: "Sí. La membresía da acceso a Santiago Troncoso, Praderas del Sol y Tierra Nueva.",
  },
  {
    q: "¿Hay inscripción o mantenimiento?",
    a: "No. Entras al plan que elijas, sin inscripción ni cuota de mantenimiento.",
  },
  {
    q: "¿Cómo obtengo mi dieta y rutina?",
    a: "Es un servicio extra que se contrata aparte de la membresía, a 3, 6 o 12 meses. En sucursal te dan de alta y entras en Soy socio con tu correo y clave.",
  },
  {
    q: "¿Necesito experiencia para inscribirme?",
    a: "No. Hay piso y máquinas para quien empieza y para quien ya carga pesado. El plan se genera según el nivel que elijas.",
  },
  {
    q: "¿Cómo me inscribo?",
    a: "Preséntate en sucursal o manda WhatsApp. Te armamos el plan el mismo día.",
  },
] as const;

export function defaultWaText(location?: GymLocation) {
  const where = location
    ? ` en la sucursal ${location.name}`
    : " en STEEL GYM";
  return `Hola, quiero información de membresías${where}.`;
}

export function locationWa(location: GymLocation) {
  return waLink(location.phone, defaultWaText(location));
}

export function generalWa() {
  return waLink(LOCATIONS[0].phone, defaultWaText());
}

export const NAV = [
  { href: "/#sucursales", label: "Sucursales" },
  { href: "/#planes", label: "Planes" },
  { href: "/#galeria", label: "Galería" },
  { href: "/#faq", label: "FAQ" },
  { href: "/login", label: "Soy socio" },
] as const;

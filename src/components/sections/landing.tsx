"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OpenStatus } from "@/components/open-status";
import { SteelMark } from "@/components/steel-logo";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import {
  AMENITIES,
  FAQ,
  HOURS,
  LOCATIONS,
  PERKS,
  PLANS,
  type GymLocation,
  locationWa,
} from "@/lib/gym";
import { formatMxn, waLink } from "@/lib/utils";

const MARQUEE = [
  "24/5",
  "SIN INSCRIPCIÓN",
  "SIN MANTENIMIENTO",
  "3 SUCURSALES",
  "PESO LIBRE",
  "DIETA Y RUTINA",
  "CIUDAD JUÁREZ",
];

const GALLERY = [
  { src: "/images/floor.webp", alt: "Piso de STEEL GYM con smith y luces hexagonales" },
  { src: "/images/aisle.webp", alt: "Pasillo de máquinas en STEEL GYM" },
  { src: "/images/ceiling.webp", alt: "Techo de hexágonos LED en rojo" },
  { src: "/images/plates.webp", alt: "Discos olímpicos en rack de acero" },
  { src: "/images/sign.webp", alt: "Letrero STEEL GYM 24/5" },
];

export function LandingPage() {
  const [sucursal, setSucursal] = useState(LOCATIONS[0].id);
  const [plan, setPlan] = useState(PLANS.find((p) => p.featured)?.id ?? PLANS[0].id);
  const [name, setName] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const loc = LOCATIONS.find((l) => l.id === sucursal) ?? LOCATIONS[0];
  const selectedPlan = PLANS.find((p) => p.id === plan) ?? PLANS[0];

  const waHref = useMemo(() => {
    const who = name.trim() ? `Soy ${name.trim()}. ` : "";
    const text = `${who}Quiero el plan ${selectedPlan.name} (${formatMxn(selectedPlan.price)}) en la sucursal ${loc.name}.`;
    return waLink(loc.phone, text);
  }, [name, selectedPlan, loc]);

  function onLead(e: FormEvent) {
    e.preventDefault();
    window.open(waHref, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-svh bg-bg pb-20 md:pb-0">
      <SiteHeader />
      <Hero />
      <Marquee />
      <About />
      <Amenities />
      <Locations />
      <Plans />
      <Gallery images={GALLERY} onOpen={setLightbox} />
      <Faq />
      <Lead
        sucursal={sucursal}
        setSucursal={setSucursal}
        plan={plan}
        setPlan={setPlan}
        name={name}
        setName={setName}
        loc={loc}
        waHref={waHref}
        onLead={onLead}
      />
      <SiteFooter />

      <a
        href={locationWa(loc)}
        target="_blank"
        rel="noreferrer"
        className="fixed inset-x-4 bottom-4 z-30 flex h-12 items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-fg text-sm font-semibold text-bg shadow-lg md:hidden"
      >
        <MessageCircle className="size-4" />
        Quiero inscribirme
      </a>

      {lightbox ? (
        <button
          type="button"
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/92 p-4"
          onClick={() => setLightbox(null)}
          aria-label="Cerrar imagen"
        >
          <img
            src={lightbox}
            alt=""
            className="max-h-[90svh] max-w-full rounded-[var(--radius-lg)] object-contain"
          />
        </button>
      ) : null}
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden">
      <img
        src="/images/floor.webp"
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-bg/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/50" />
      <div className="hex-overlay pointer-events-none absolute inset-0 opacity-40 mix-blend-screen" />

      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-16 sm:px-6 sm:pb-20">
        <div className="led-bar mb-8 w-full max-w-xl" />
        <div className="mb-5 flex flex-wrap items-center gap-4">
          <OpenStatus />
          <span className="rounded-full border border-border-strong px-3 py-1 font-display text-sm tracking-[0.2em] text-steel">
            24/5
          </span>
        </div>
        <p className="mb-3 flex items-center gap-3 font-display text-2xl tracking-[0.18em] text-steel sm:text-3xl">
          <SteelMark className="h-10 w-6 text-fg" />
          STEEL GYM
        </p>
        <h1 className="max-w-3xl font-display text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.9] tracking-[0.04em] text-fg neon-white">
          Tu disciplina no tiene horario
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
          Tres sucursales en Ciudad Juárez. Máquinas de alto rendimiento, peso
          libre y un piso abierto 24 horas de lunes a viernes.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="xl">
            <a href="#inscribirme">Quiero inscribirme</a>
          </Button>
          <Button asChild size="xl" variant="outline">
            <a href="/login">Soy socio</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [...MARQUEE, ...MARQUEE];
  return (
    <div className="overflow-hidden border-y border-border bg-surface">
      <div className="marquee-track flex w-max gap-10 py-3 pr-10">
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="font-display text-sm tracking-[0.28em] text-muted"
          >
            {item}
            <span className="ml-10 text-red">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function About() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16">
      <div className="relative">
        <div className="absolute -inset-3 rounded-[calc(var(--radius-xl)+12px)] border border-border" />
        <img
          src="/images/sign.webp"
          alt="Letrero luminoso STEEL GYM 24/5"
          className="relative w-full rounded-[var(--radius-xl)] object-cover"
        />
      </div>
      <div>
        <p className="font-display text-sm tracking-[0.28em] text-red">EL GIMNASIO</p>
        <h2 className="mt-3 font-display text-4xl tracking-[0.06em] text-fg sm:text-5xl lg:text-6xl">
          Acero, luz y repeticiones
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted">
          No importa si entrenas de madrugada, al amanecer o después de un largo
          día. STEEL GYM está abierto 24/5 para que tu disciplina no dependa del
          reloj. Equipo de calidad, ambiente serio y tres sucursales en Juárez.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-2.5 text-sm text-fg">
              <Check className="size-4 text-red" />
              {perk}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Amenities() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="font-display text-sm tracking-[0.28em] text-red">EL PISO</p>
        <h2 className="mt-3 max-w-xl font-display text-4xl tracking-[0.06em] sm:text-5xl lg:text-6xl">
          Hecho para cargar, no para posar
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AMENITIES.map((item) => (
            <article
              key={item.title}
              className="rounded-[var(--radius-lg)] border border-border bg-elevated p-6"
            >
              <h3 className="font-display text-2xl tracking-[0.08em] text-fg">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Locations() {
  return (
    <section id="sucursales" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
      <p className="font-display text-sm tracking-[0.28em] text-red">SUCURSALES</p>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-display text-4xl tracking-[0.06em] sm:text-5xl lg:text-6xl">
          Tres pisos.
          <br />
          Una membresía.
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          Lun–vie 24 h · Sáb {HOURS.saturday} · Dom {HOURS.sunday}
        </p>
      </div>
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {LOCATIONS.map((loc) => (
          <article
            key={loc.id}
            className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-surface p-6"
          >
            <div className="led-bar mb-5" />
            <h3 className="font-display text-3xl tracking-[0.1em]">{loc.name}</h3>
            <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-muted">
              <MapPin className="mt-0.5 size-4 shrink-0 text-red" />
              {loc.address}
              <br />
              {loc.colonia}, C.P. {loc.zip}
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm text-steel">
              <Phone className="size-4 text-red" />
              {loc.phoneLabel}
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted">
              <Clock className="size-4 text-red" />
              {HOURS.label}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button asChild size="sm" className="flex-1">
                <a href={locationWa(loc)} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" />
                  WhatsApp
                </a>
              </Button>
              <Button asChild size="sm" variant="outline" className="flex-1">
                <a href={loc.maps} target="_blank" rel="noreferrer">
                  Cómo llegar
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Plans() {
  return (
    <section id="planes" className="border-y border-border bg-surface scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="font-display text-sm tracking-[0.28em] text-red">MEMBRESÍAS</p>
        <h2 className="mt-3 font-display text-4xl tracking-[0.06em] sm:text-5xl lg:text-6xl">
          Entras. Entrenas. Sin letra chica.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
          Precios en sucursal. Sin inscripción y sin mantenimiento. El plan te da
          acceso a las tres ubicaciones. La app de dieta y rutina se contrata
          aparte, como servicio extra.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((p) => (
            <article
              key={p.id}
              className={
                p.featured
                  ? "relative flex flex-col rounded-[var(--radius-xl)] border border-red/50 bg-elevated p-6"
                  : "flex flex-col rounded-[var(--radius-xl)] border border-border bg-bg p-6"
              }
            >
              {p.badge ? (
                <span className="absolute right-4 top-4 rounded-full bg-red px-2.5 py-1 font-display text-xs tracking-[0.18em] text-fg">
                  {p.badge}
                </span>
              ) : null}
              <h3 className="font-display text-2xl tracking-[0.12em] text-muted">
                {p.name}
              </h3>
              <p className="mt-4 font-display text-5xl tracking-[0.04em] text-fg">
                {formatMxn(p.price)}
              </p>
              <p className="mt-1 text-sm text-subtle">{p.period}</p>
              {p.perMonth ? (
                <p className="mt-2 text-sm text-steel">
                  {formatMxn(p.perMonth)} / mes
                </p>
              ) : null}
              {p.note ? (
                <p className="mt-3 text-sm text-muted">{p.note}</p>
              ) : null}
              <Button asChild className="mt-6" variant={p.featured ? "red" : "outline"}>
                <a href="#inscribirme">Elegir plan</a>
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery({
  images,
  onOpen,
}: {
  images: { src: string; alt: string }[];
  onOpen: (src: string) => void;
}) {
  return (
    <section id="galeria" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
      <p className="font-display text-sm tracking-[0.28em] text-red">GALERÍA</p>
      <h2 className="mt-3 font-display text-4xl tracking-[0.06em] sm:text-5xl lg:text-6xl">
        El piso, de noche
      </h2>
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => onOpen(img.src)}
            className={
              i === 0
                ? "col-span-2 row-span-2 overflow-hidden rounded-[var(--radius-lg)]"
                : "overflow-hidden rounded-[var(--radius-md)]"
            }
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-[var(--motion-slow)] ease-[var(--ease-out)] hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="border-y border-border bg-surface scroll-mt-24">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="font-display text-sm tracking-[0.28em] text-red">PREGUNTAS</p>
        <h2 className="mt-3 font-display text-4xl tracking-[0.06em] sm:text-5xl lg:text-6xl">
          FAQ
        </h2>
        <div className="mt-10 divide-y divide-border">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium text-fg">
                {item.q}
                <span className="text-subtle group-open:hidden">+</span>
                <span className="hidden text-subtle group-open:inline">–</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Lead({
  sucursal,
  setSucursal,
  plan,
  setPlan,
  name,
  setName,
  loc,
  waHref,
  onLead,
}: {
  sucursal: string;
  setSucursal: (id: GymLocation["id"]) => void;
  plan: string;
  setPlan: (id: string) => void;
  name: string;
  setName: (v: string) => void;
  loc: GymLocation;
  waHref: string;
  onLead: (e: FormEvent) => void;
}) {
  return (
    <section id="inscribirme" className="relative isolate overflow-hidden scroll-mt-24">
      <img src="/images/aisle.webp" alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg/85 to-bg" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="font-display text-sm tracking-[0.28em] text-red">INSCRÍBETE</p>
          <h2 className="mt-3 font-display text-4xl tracking-[0.06em] sm:text-5xl lg:text-6xl">
            Te estamos esperando
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            Elige sucursal y plan. Te abrimos WhatsApp con el mensaje listo.
            También puedes llegar directo al piso.
          </p>
        </div>
        <form
          onSubmit={onLead}
          className="rounded-[var(--radius-xl)] border border-border bg-surface p-6"
        >
          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
              Nombre
            </span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </label>
          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
              Sucursal
            </span>
            <Select
              value={sucursal}
              onChange={(e) => setSucursal(e.target.value as GymLocation["id"])}
            >
              {LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="mb-6 block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
              Plan
            </span>
            <Select value={plan} onChange={(e) => setPlan(e.target.value)}>
              {PLANS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {formatMxn(p.price)}
                </option>
              ))}
            </Select>
          </label>
          <Button type="submit" size="lg" className="w-full">
            <MessageCircle className="size-4" />
            Continuar en WhatsApp · {loc.short}
          </Button>
          <p className="mt-3 text-center text-xs text-subtle">
            {loc.address}, {loc.colonia}
          </p>
        </form>
      </div>
    </section>
  );
}

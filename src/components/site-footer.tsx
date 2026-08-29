import { SteelWordmark } from "@/components/steel-logo";
import { BRAND, HOURS, LOCATIONS } from "@/lib/gym";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <SteelWordmark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            {BRAND.tagline} Tres sucursales en {BRAND.city}. Horario {HOURS.label}.
          </p>
        </div>
        {LOCATIONS.map((loc) => (
          <div key={loc.id}>
            <p className="font-display text-lg tracking-[0.14em] text-fg">
              {loc.short}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {loc.address}
              <br />
              {loc.colonia}, {loc.zip}
            </p>
            <a
              href={`tel:+52${loc.phone}`}
              className="mt-2 inline-block text-sm text-steel hover:text-fg"
            >
              {loc.phoneLabel}
            </a>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {BRAND.name}® · {BRAND.city}, {BRAND.state}
          </p>
          <div className="flex flex-wrap gap-4">
            <a href={BRAND.instagram} target="_blank" rel="noreferrer" className="hover:text-fg">
              Instagram
            </a>
            <a href={BRAND.facebook} target="_blank" rel="noreferrer" className="hover:text-fg">
              Facebook
            </a>
            <a href="/login" className="hover:text-fg">
              Soy socio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { SteelWordmark } from "@/components/steel-logo";
import { OpenStatus } from "@/components/open-status";
import { NAV, generalWa } from "@/lib/gym";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6">
        <a href="/" className="shrink-0">
          <SteelWordmark markClassName="h-9 w-[22px]" />
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted hover:text-fg"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <OpenStatus compact />
          <a
            href={generalWa()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-fg px-3.5 text-sm font-medium text-bg"
          >
            WhatsApp
          </a>
        </div>

        <details className="relative lg:hidden">
          <summary
            className="flex size-11 list-none items-center justify-center rounded-md border border-border-strong text-lg [&::-webkit-details-marker]:hidden"
            aria-label="Menú"
          >
            ☰
          </summary>
          <nav className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-border bg-surface p-2 shadow-lg">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center px-3 text-base font-medium text-fg"
              >
                {item.label}
              </a>
            ))}
            <a
              href={generalWa()}
              target="_blank"
              rel="noreferrer"
              className="mt-1 flex min-h-11 items-center justify-center rounded-md bg-fg text-sm font-semibold text-bg"
            >
              WhatsApp
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}

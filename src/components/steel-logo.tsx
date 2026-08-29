import { cn } from "@/lib/utils";

/** Three-piece geometric mark from the STEEL GYM sign. */
export function SteelMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 118"
      className={cn("overflow-visible", className)}
      fill="none"
      aria-hidden
    >
      <path
        d="M10 46 V16 h50 v22"
        stroke="currentColor"
        strokeWidth="7.5"
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
      <path
        d="M10 56 h50 v16 H22 v16 h38"
        stroke="currentColor"
        strokeWidth="7.5"
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
      <path
        d="M10 98 v16 h18 L62 98"
        stroke="currentColor"
        strokeWidth="7.5"
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function SteelWordmark({
  className,
  markClassName,
  stacked = true,
}: {
  className?: string;
  markClassName?: string;
  stacked?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-fg", className)}>
      <SteelMark className={cn("h-10 w-6 shrink-0", markClassName)} />
      <span
        className={cn(
          "font-display leading-[0.85] tracking-[0.08em]",
          stacked ? "text-[1.55rem]" : "text-xl tracking-[0.18em]",
        )}
      >
        {stacked ? (
          <>
            STEEL
            <br />
            GYM
          </>
        ) : (
          "STEEL GYM"
        )}
      </span>
    </span>
  );
}

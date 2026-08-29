"use client";

import { useEffect, useState } from "react";
import { getOpenState, type OpenState } from "@/lib/hours";
import { cn } from "@/lib/utils";

export function OpenStatus({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<OpenState>(() => getOpenState());

  useEffect(() => {
    setState(getOpenState());
    const id = window.setInterval(() => setState(getOpenState()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2",
        compact ? "text-xs" : "text-sm",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          state.open ? "bg-amber shadow-[0_0_10px_var(--color-amber)]" : "bg-subtle",
        )}
      />
      <span
        className={cn(
          "font-display tracking-[0.22em]",
          state.open ? "neon-amber" : "text-muted",
          compact ? "text-sm" : "text-lg",
        )}
      >
        {state.open ? "OPEN" : "CLOSED"}
      </span>
      {!compact ? (
        <span className="hidden text-subtle sm:inline">{state.detail}</span>
      ) : null}
    </span>
  );
}

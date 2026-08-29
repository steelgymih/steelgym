"use client";

import { useEffect, useState, type ReactNode } from "react";

export function ProtectedView({
  watermark,
  children,
}: {
  watermark: string;
  children: ReactNode;
}) {
  const [veiled, setVeiled] = useState(false);

  useEffect(() => {
    const veil = () => setVeiled(document.hidden);
    const block = (e: Event) => e.preventDefault();
    const keys = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ["c", "s", "p", "u", "a"].includes(k)) {
        e.preventDefault();
      }
      if (e.key === "PrintScreen" || e.key === "F12") e.preventDefault();
    };
    document.addEventListener("visibilitychange", veil);
    document.addEventListener("contextmenu", block);
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("dragstart", block);
    document.addEventListener("keydown", keys);
    return () => {
      document.removeEventListener("visibilitychange", veil);
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("dragstart", block);
      document.removeEventListener("keydown", keys);
    };
  }, []);

  const marks = Array.from({ length: 48 }, (_, i) => (
    <span key={i} className="px-8 py-6 text-[10px] uppercase tracking-[0.28em]">
      {watermark}
    </span>
  ));

  return (
    <div className="relative select-none" style={{ WebkitTouchCallout: "none" }}>
      {veiled ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-bg">
          <p className="font-display text-3xl tracking-[0.12em] text-muted">STEEL GYM</p>
        </div>
      ) : null}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      >
        <div className="absolute -left-1/3 top-0 flex h-[220%] w-[180%] rotate-[-22deg] flex-wrap content-start text-fg opacity-[0.07]">
          {marks}
        </div>
      </div>
      <div className="relative z-0">{children}</div>
    </div>
  );
}

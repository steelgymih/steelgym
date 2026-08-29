import type { ErrorComponentProps } from "@tanstack/react-router";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg"
    >
      <h1 className="font-display text-3xl tracking-[0.08em]">STEEL GYM</h1>
      <p className="max-w-md text-sm text-muted">
        {error.message || "No se pudo cargar. Cierra y abre de nuevo."}
      </p>
    </main>
  );
}

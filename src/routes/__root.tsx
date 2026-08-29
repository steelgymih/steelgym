import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { BootScreen } from "@/components/boot-screen";
import appCss from "../styles.css?url";

const APP_NAME = "STEEL GYM";

function RootError() {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#09090b",
          color: "#f4f4f5",
          fontFamily: "sans-serif",
          padding: 32,
        }}
      >
        <p style={{ fontSize: 18, margin: 0 }}>No se pudo cargar STEEL GYM.</p>
        <p style={{ color: "#a1a1aa", marginTop: 8 }}>
          Cierra esta vista y ábrela de nuevo.
        </p>
        <a
          href="/"
          style={{
            display: "inline-block",
            marginTop: 20,
            color: "#e10613",
            fontWeight: 700,
          }}
        >
          Volver al inicio
        </a>
      </body>
    </html>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "STEEL GYM · 24/5 · Ciudad Juárez" },
      {
        name: "description",
        content:
          "STEEL GYM en Ciudad Juárez. Tres sucursales, equipo de alto rendimiento y horario 24/5. Sin inscripción ni mantenimiento.",
      },
      { name: "theme-color", content: "#09090b" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: RootDocument,
  errorComponent: RootError,
  pendingComponent: BootScreen,
});

function RootDocument() {
  return (
    <html lang="es" className="antialiased" style={{ background: "#09090b" }} suppressHydrationWarning>
      <head>
        <HeadContent />
        <style
          dangerouslySetInnerHTML={{
            __html: `
html,body{background:#09090b;color:#f4f4f5;margin:0;min-height:100%}
@keyframes steelPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.38;transform:scale(.97)}}
`,
          }}
        />
      </head>
      <body className="bg-bg text-fg font-sans" style={{ background: "#09090b", color: "#f4f4f5" }}>
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            display: "grid",
            placeItems: "center",
            background: "#09090b",
            pointerEvents: "none",
          }}
        >
          <div style={{ textAlign: "center", animation: "steelPulse 1.15s ease-in-out infinite" }}>
            <p
              style={{
                margin: 0,
                fontFamily: "Arial Narrow, Impact, sans-serif",
                letterSpacing: "0.28em",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              STEEL GYM
            </p>
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", background: "#09090b" }}>
          <PreviewHostBridge />
          <AuthProvider>
            <Outlet />
          </AuthProvider>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

export { APP_NAME };

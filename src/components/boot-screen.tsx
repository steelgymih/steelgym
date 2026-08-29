const BOOT_CSS = `
html,body{background:#09090b;color:#f4f4f5;margin:0;min-height:100%}
@keyframes steelPulse{
  0%,100%{opacity:1;transform:scale(1)}
  50%{opacity:.38;transform:scale(.97)}
}
.steel-boot{
  min-height:100vh;min-height:100dvh;background:#09090b;color:#f4f4f5;
  display:grid;place-items:center;margin:0
}
.steel-boot-mark{text-align:center;animation:steelPulse 1.15s ease-in-out infinite}
.steel-boot-word{
  margin:14px 0 0;font-family:"Arial Narrow",Impact,sans-serif;
  letter-spacing:.28em;font-size:22px;font-weight:700
}
.steel-boot-sub{
  margin:10px 0 0;font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:#71717a
}
`;

const BOOT_MARK = `
  <div class="steel-boot-mark">
    <svg width="88" height="88" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#121214"/>
      <g fill="none" stroke="#f4f4f5" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="square">
        <path d="M23 7.5H9.5V14"/>
        <path d="M9.5 16.5h13.5"/>
        <path d="M23 18.5V24.5H9.5"/>
      </g>
      <polygon fill="#e10613" points="26,22.4 27.8,23.45 27.8,25.55 26,26.6 24.2,25.55 24.2,23.45"/>
    </svg>
    <p class="steel-boot-word">STEEL GYM</p>
    <p class="steel-boot-sub">Cargando</p>
  </div>
`;

export function bootHtml(title = "STEEL GYM") {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="theme-color" content="#09090b"/>
<title>${title}</title>
<style>${BOOT_CSS}</style>
</head>
<body>
<div class="steel-boot">${BOOT_MARK}</div>
</body>
</html>`;
}

export function BootScreen({ label = "Cargando" }: { label?: string }) {
  return (
    <div className="steel-boot" style={{ minHeight: "100vh", background: "#09090b" }}>
      <style>{BOOT_CSS}</style>
      <div
        className="steel-boot-mark"
        style={{ textAlign: "center", animation: "steelPulse 1.15s ease-in-out infinite" }}
      >
        <svg width="88" height="88" viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" rx="7" fill="#121214" />
          <g
            fill="none"
            stroke="#f4f4f5"
            strokeWidth="2.4"
            strokeLinejoin="round"
            strokeLinecap="square"
          >
            <path d="M23 7.5H9.5V14" />
            <path d="M9.5 16.5h13.5" />
            <path d="M23 18.5V24.5H9.5" />
          </g>
          <polygon fill="#e10613" points="26,22.4 27.8,23.45 27.8,25.55 26,26.6 24.2,25.55 24.2,23.45" />
        </svg>
        <p
          style={{
            margin: "14px 0 0",
            fontFamily: "Arial Narrow, Impact, sans-serif",
            letterSpacing: "0.28em",
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          STEEL GYM
        </p>
        <p
          style={{
            margin: "10px 0 0",
            fontSize: 11,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#71717a",
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

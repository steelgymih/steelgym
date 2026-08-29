const CSS = `
html,body{margin:0;background:#09090b;color:#f4f4f5;font-family:ui-sans-serif,system-ui,sans-serif}
@keyframes steelPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.38;transform:scale(.97)}}
a{color:inherit;text-decoration:none}
header{position:sticky;top:0;z-index:20;background:#09090b;border-bottom:1px solid #232326;display:flex;align-items:center;justify-content:space-between;padding:12px 16px}
.brand{font-weight:800;letter-spacing:.18em}
.wrap{max-width:720px;margin:0 auto;padding:24px 16px 80px}
h1{font-size:32px;margin:12px 0}
.muted{color:#a1a1aa;line-height:1.5}
.red{color:#e10613;font-size:12px;font-weight:700;letter-spacing:.28em;text-transform:uppercase}
.btn{display:flex;align-items:center;justify-content:center;height:48px;border-radius:10px;background:#fff;color:#09090b;font-weight:600;border:0;width:100%;font-size:15px}
input{width:100%;height:44px;border-radius:8px;border:1px solid #232326;background:#1a1a1e;color:#f4f4f5;padding:0 12px;box-sizing:border-box;font-size:16px}
label{display:block;margin:14px 0 6px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#a1a1aa}
details.menu{position:relative}
details.menu summary{list-style:none;width:44px;height:44px;border:1px solid #3f3f46;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:22px}
details.menu summary::-webkit-details-marker{display:none}
details.menu nav{position:absolute;right:0;top:50px;width:220px;background:#121214;border:1px solid #232326;border-radius:10px;padding:8px}
details.menu nav a{display:flex;min-height:44px;align-items:center;padding:0 12px}
.err{color:#e10613;margin-top:10px}
`;

function esc(s: string) {
  return s
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;")
    .replace(/'/g, "\u0026#39;");
}

function shell(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="theme-color" content="#09090b"/>
<title>${title}</title>
<style>${CSS}</style>
</head>
<body>
<header>
  <a class="brand" href="/">STEEL GYM</a>
  <details class="menu">
    <summary aria-label="Menú">☰</summary>
    <nav>
      <a href="/#sucursales">Sucursales</a>
      <a href="/#planes">Planes</a>
      <a href="/login">Soy socio</a>
      <a href="https://wa.me/526563532967">WhatsApp</a>
    </nav>
  </details>
</header>
${body}
</body>
</html>`;
}

export function loginHtml(error = "") {
  const err = error ? `<p class="err">${esc(error)}</p>` : "";
  return shell(
    "Entrar · STEEL GYM",
    `<main class="wrap">
      <p class="red">Socios</p>
      <h1>Entra a tu plan</h1>
      <p class="muted">Usa el correo y la clave que te dieron al darte de alta.</p>
      <form id="login-form" method="post" action="/api/member-login">
        <label>Correo</label>
        <input type="email" name="email" autocomplete="username" inputmode="email" required/>
        <label>Contraseña</label>
        <input type="password" name="password" autocomplete="current-password" required/>
        ${err}
        <p style="margin-top:18px"><button class="btn" type="submit">Entrar</button></p>
      </form>
      <p class="muted" style="margin-top:24px">¿No puedes entrar? En sucursal te desanclan o te dan clave nueva.
        <a href="https://wa.me/526563532967?text=${encodeURIComponent("Hola, no puedo entrar a la app STEEL GYM.")}">Escríbenos por WhatsApp</a>.
      </p>
      <p style="margin-top:48px;font-size:11px;color:#3f3f46"><a href="/admin">Staff</a></p>
      <script>
      document.getElementById("login-form").addEventListener("submit", async function (e) {
        e.preventDefault();
        var fd = new FormData(e.target);
        try {
          var r = await fetch("/api/member-login", {
            method: "POST",
            body: fd,
            headers: { Accept: "application/json" },
          });
          var j = await r.json();
          if (!r.ok || !j.token) {
            location.href = "/login?e=" + encodeURIComponent(j.error || "No se pudo entrar");
            return;
          }
          try { sessionStorage.setItem("grok-auth.bearer-token", j.token); } catch (x) {}
          document.documentElement.style.background = "#09090b";
          document.body.style.background = "#09090b";
          document.body.innerHTML = '<div class="steel-boot" style="min-height:100vh;display:grid;place-items:center;background:#09090b;color:#f4f4f5"><div style="text-align:center;animation:steelPulse 1.15s ease-in-out infinite"><p style="font-family:Arial Narrow,Impact,sans-serif;letter-spacing:.28em;font-size:22px;font-weight:700">STEEL GYM</p><p style="margin-top:10px;font-size:11px;letter-spacing:.32em;color:#71717a">CARGANDO</p></div></div>';
          location.replace(j.role === "admin" ? "/admin" : "/socios");
        } catch (x) {
          e.target.submit();
        }
      });
      </script>
    </main>`,
  );
}

export function enteringHtml(token: string) {
  return `<!DOCTYPE html>
<html lang="es"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="theme-color" content="#09090b"/>
<title>STEEL GYM</title>
<style>
html,body{background:#09090b;color:#f4f4f5;margin:0;min-height:100vh;display:grid;place-items:center}
@keyframes steelPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.38;transform:scale(.97)}}
.mark{text-align:center;animation:steelPulse 1.15s ease-in-out infinite}
</style>
<script>
try{sessionStorage.setItem("grok-auth.bearer-token",${JSON.stringify(token)});}catch(e){}
location.replace("/socios");
</script>
</head>
<body>
  <div class="mark">
    <svg width="88" height="88" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#121214"/>
      <g fill="none" stroke="#f4f4f5" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="square">
        <path d="M23 7.5H9.5V14"/>
        <path d="M9.5 16.5h13.5"/>
        <path d="M23 18.5V24.5H9.5"/>
      </g>
      <polygon fill="#e10613" points="26,22.4 27.8,23.45 27.8,25.55 26,26.6 24.2,25.55 24.2,23.45"/>
    </svg>
    <p style="margin:14px 0 0;font-family:Arial Narrow,Impact,sans-serif;letter-spacing:.28em;font-size:22px;font-weight:700">STEEL GYM</p>
    <p style="margin:10px 0 0;font-size:11px;letter-spacing:.32em;color:#71717a">CARGANDO</p>
  </div>
</body></html>`;
}

# STEEL GYM — instrucciones para dejarla igual en internet

No subas el código a Cloudflare Pages (como MuscleUp).
Esta app tiene login y base de datos. El camino que deja TODO igual es:

Supabase (datos) → GitHub → Vercel (la app) → Cloudflare (el dominio)

---

## PASO 1 — Descargas

1. Baja `steel-gym-cloudflare.tar.gz` (el código).
2. Baja `supabase-setup.sql` (las tablas).
3. En la computadora, descomprime el .tar.gz. Te queda una carpeta con la app.

---

## PASO 2 — Supabase (los socios se guardan aquí)

1. Entra a https://supabase.com y crea cuenta (GitHub o correo).
2. New project.
   - Name: `steel-gym`
   - Database password: inventa una fuerte y **guárdala**.
   - Region: West US (Oregon) o la más cercana.
3. Create project. Espera a que ponga verde.
4. Izquierda: **SQL Editor** → New query.
5. Abre `supabase-setup.sql`, copia TODO, pégalo, **Run**.
   Debe decir success.
6. Izquierda: **Project Settings** (engranaje) → **Database**.
7. Connection string → **URI**.
8. Copia la URI. Se ve así:
   `postgresql://postgres.xxxx:TU-PASSWORD@...supabase.com:6543/postgres`
9. Donde dice `[YOUR-PASSWORD]` pega la contraseña del paso 2.
   Guarda esa URI completa. Es el `DATABASE_URL`.

---

## PASO 3 — GitHub (para que Vercel tome el código)

1. Entra a https://github.com y crea cuenta si no tienes.
2. New repository → nombre `steel-gym` → Create (vacío, sin README).
3. En la computadora, dentro de la carpeta descomprimida:

```bash
git init
git add .
git commit -m "STEEL GYM"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/steel-gym.git
git push -u origin main
```

Cambia `TU-USUARIO` por tu usuario de GitHub.
Si te pide login, entra con el navegador.

Si no quieres usar comandos: GitHub Desktop → Add local repository → Publish.

---

## PASO 4 — Vercel (aquí corre la app igual)

1. Entra a https://vercel.com con la misma cuenta de GitHub.
2. Add New… → Project.
3. Importa `steel-gym`.
4. Environment Variables. Agrega estas 4 (Production y Preview):

| Name | Value |
|---|---|
| `DATABASE_URL` | la URI de Supabase (paso 2) |
| `VITE_AUTH_ENABLED` | `true` |
| `BETTER_AUTH_SECRET` | inventa 32+ caracteres (ejemplo: `SteelGymJuarez2026ClaveSecreta!`) |
| `BETTER_AUTH_URL` | déjala por ahora `https://placeholder.vercel.app` — la cambias en el paso 5 |

5. Deploy.
6. Cuando termine, Vercel te da un link tipo `https://steel-gym-xxxx.vercel.app`.
7. Settings → Environment Variables → edita `BETTER_AUTH_URL` y pon **ese** link (con https, sin barra al final).
8. Deployments → los 3 puntitos del último → **Redeploy**.

Abre el link. Debe salir Steel Gym, **sin** “Continue with Grok”.

---

## PASO 5 — Cloudflare (el nombre bonito)

Cloudflare aquí es el **dominio**, no donde se sube el código.

1. Entra a https://dash.cloudflare.com
2. Add a site → tu dominio (ej. `steelgymjrz.com`).
   Si no tienes dominio, cómpralo en Cloudflare o en Namecheap y apunta a Cloudflare.
3. En Vercel: el proyecto → Settings → **Domains** → Add `steelgymjrz.com` y `www.steelgymjrz.com`.
4. Vercel te muestra registros DNS (A o CNAME).
5. En Cloudflare → DNS → Records → pega esos registros.
6. El cloudito naranja (Proxied) puede quedar encendido.
7. En Vercel, cambia `BETTER_AUTH_URL` a `https://steelgymjrz.com` y **Redeploy**.

Cuando el candado HTTPS ya esté verde, ese es el link del gym.

---

## PASO 6 — Primera vez (operador y un socio demo)

En el link de Vercel o de tu dominio (NO en grok.me):

1. Abre `/admin` (ejemplo: `https://steelgymjrz.com/admin`).
2. Primera vez: crear operador.
   - Tu nombre
   - Tu correo
   - Una clave de 8+
   - Clave de instalación: `STEEL-ALTAS`
3. Crear.
4. Ya dentro: da de alta un socio de prueba (3 meses).
5. Salir. Entra por **Soy socio** con el correo y la clave que le diste.

Eso es lo que le enseñas al gym.

---

## Recuerda

- Los socios de Grok / preview **no existen** aquí. Se dan de alta de nuevo.
- No le des `STEEL-ALTAS` al gym si tú vas a cobrar el mantenimiento.
- No subas la carpeta a **Cloudflare Pages → Deploy**. Eso rompe el login.
- Si el login dice “Invalid origin”, `BETTER_AUTH_URL` no coincide con el link que estás abriendo. Ajústalo y Redeploy.

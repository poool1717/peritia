# PERIT.IA — CLAUDE.md
> Instrucciones permanentes para Claude Code. Leer siempre al iniciar una nueva sesión.

---

## Qué es PERIT.IA

SaaS de generación automática de informes periciales de seguros con IA. El perito sube el PDF del encargo y la póliza, la IA extrae los datos y genera el informe completo (secciones 1–4) listo para exportar en PDF y Word. Ahorra 2–4h por informe.

**Usuario:** Pol (no programador). Explicar siempre en lenguaje claro, sin jerga técnica. Las analogías de construcción y archivos físicos funcionan bien.

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 · Next.js 14 · Lucide React |
| Hosting | Vercel (hobby plan) · auto-deploy desde GitHub |
| Base de datos | Supabase PostgreSQL · RLS por user_id |
| Auth | Supabase Auth (email+password, sin confirmación de email) |
| IA | Anthropic API · modelo `claude-sonnet-4-6` |
| Proxy API | `pages/api/claude.js` (Next.js serverless) |
| Repositorio | `github.com/poool1717/peritia` (rama `main` = producción, rama `test` = entorno paralelo) |
| Tests | `node --test` (motor incluido en Node ≥18) · `npm test` |
| CI | GitHub Actions · `.github/workflows/ci.yml` |

---

## Estructura del repositorio

```
peritia/
├── components/
│   └── Peritia.jsx          ← COMPONENTE PRINCIPAL (4.114 líneas, solo interfaz)
├── core/                    ← NÚCLEO PURO: baremo, valoración, reglas, indemnización
│   ├── formato.mjs          ← números, euros, normalización de texto (parseCap)
│   ├── baremo.mjs           ← BAREMO + matchBaremo
│   ├── valoracion.mjs       ← PROVINCIAS + TABLAS_ARQ + calcVPreexCont
│   ├── calculo.mjs          ← calcPartida, calcReglas, calcIndemnizacion…
│   ├── catalogos.mjs        ← COMPANIAS, normCompania, TIPOS_USO, TIPOS_GARANTIA
│   ├── ia.mjs               ← parseJSON, iaError (lectura de respuestas de la IA)
│   ├── meteo.mjs            ← reglas XEMA (atmosférico, umbrales de la póliza)
│   ├── progreso.mjs         ← semáforo y bloques pendientes por sección
│   ├── index.mjs            ← única puerta de entrada (Peritia.jsx importa de aquí)
│   └── README.md            ← qué es core/ y sus reglas
├── tests/                   ← 100 tests del núcleo (`npm test`, sin dependencias)
├── .github/workflows/ci.yml ← CI: tests + balance de llaves + build en cada PR
├── pages/
│   ├── _app.js              ← <meta name="viewport"> global (Next.js Head)
│   ├── index.js             ← página raíz (carga Peritia dinámicamente)
│   └── api/
│       ├── claude.js        ← proxy seguro Anthropic API
│       ├── meteocat.js      ← proxy datos abiertos XEMA/Meteocat (Sec2) + captura de mapa
│       └── catastro.js      ← proxy Sede Electrónica del Catastro (Sec1) + captura WMS
├── supabase/
│   └── migrations/          ← migraciones SQL (esquema base, bucket Storage, RLS, etc.)
├── package.json
├── next.config.js
├── vercel.json
├── .env.example             ← variables de entorno de referencia (no se lee, solo documentación)
├── CLAUDE.md                ← este archivo
├── CONTEXT.md               ← estado actual del proyecto
└── RESUMEN_PERITIA.md       ← resumen técnico completo
```

**Archivo principal:** `components/Peritia.jsx` — es el único componente React de la app.

---

## URLs importantes

- **App producción:** `https://peritia-git-main-pol-myprojects.vercel.app`
- **GitHub:** `https://github.com/poool1717/peritia`
- **Vercel dashboard:** `https://vercel.com/pol-myprojects/peritia`
- **Supabase proyecto (producción):** `https://supabase.com/dashboard/project/yrulaaxdusvmzohugmnc`
- **Supabase proyecto (test, sesión 22):** `https://supabase.com/dashboard/project/yvconlqtetxvyzxkhxib`

---

## Credenciales de infraestructura

Las credenciales sensibles (API keys, tokens) están guardadas como variables de entorno en Vercel.
NO están en el código fuente — desde la sesión 22, ni siquiera la URL/key de Supabase están escritas en `Peritia.jsx`, se leen de `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` (ver `.env.example`). Consultar Vercel dashboard si es necesario.

| Servicio | Variable de entorno |
|---|---|
| Anthropic API key | `ANTHROPIC_API_KEY` (Vercel env, compartida entre producción y test) |
| Supabase URL (producción) | `https://yrulaaxdusvmzohugmnc.supabase.co` |
| Supabase project ID (producción) | `yrulaaxdusvmzohugmnc` |
| Supabase URL (test) | `https://yvconlqtetxvyzxkhxib.supabase.co` |
| Supabase project ID (test) | `yvconlqtetxvyzxkhxib` |
| Vercel project ID | `prj_FlGP4bJXDO8w52vUE2ahNzLcseoz` |
| Gmail cuenta | `poool.1717@gmail.com` |

---

## Proxy API — reglas importantes

El archivo `pages/api/claude.js` es el proxy entre el frontend y Anthropic:
- Inyecta `ANTHROPIC_API_KEY` (nunca en el cliente)
- Usa modelo `claude-sonnet-4-6`
- Añade `anthropic-beta: pdfs-2024-09-25` automáticamente si el body contiene `application/pdf`
- Garantiza `max_tokens` (default 1500 si el cliente no lo envía)
- `maxDuration: 60` · `bodyParser: 20mb`

---

## Supabase — esquema BD

```sql
public.informes (
  id UUID PK, user_id UUID FK → auth.users,
  num_referencia TEXT, compania TEXT, asegurado TEXT,
  estado TEXT,  -- borrador | completado | exportado
  encargo JSONB, s1 JSONB, s2 JSONB, s3 JSONB, s4 JSONB, anexos JSONB,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
)

public.perfiles (
  id UUID PK → auth.users,
  email TEXT, nombre TEXT, dni TEXT, telefono TEXT,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
)
```
RLS activo en ambas tablas. Trigger `handle_updated_at` automático. Trigger `handle_new_user` crea perfil al registrarse.

Esquema versionado en `supabase/migrations/20260604120000_esquema_base.sql` (más `20260719120000_anexos_storage_bucket.sql` para el bucket). Es idempotente: aplicarlo de nuevo sobre el proyecto de producción no cambia nada.

---

## Entorno de test (sesión 22)

Existe un segundo proyecto Supabase, `PeritIA-test` (`yvconlqtetxvyzxkhxib`), con el mismo esquema que producción pero **vacío**, para poder trabajar en una versión paralela de la app sin tocar los datos reales.

- **Rama de trabajo:** `test` (permanente, no se borra al fusionar como las ramas `claude/*` normales)
- **Qué la diferencia de producción:** `Peritia.jsx` lee `SB_URL`/`SB_KEY` de `process.env.NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`. Sin esas variables definidas, cae a producción — así que **si un despliegue no tiene las variables del proyecto de test puestas en Vercel, escribe en la base de datos real** aunque venga de la rama `test`. Comprobarlo si algo no cuadra.
- **Aviso visual:** cuando la app apunta a una base distinta de la de producción, se muestra un badge fijo "ENTORNO DE PRUEBAS" en las 4 pantallas (componente `TestBadge`). Si no aparece, la app está contra producción.
- **Anthropic API key:** compartida con producción (decisión explícita de Pol) — las pruebas consumen créditos reales.
- **Para pasar algo de `test` a `main`:** PR normal de `test` → `main`. Antes de fusionar, comprobar con `git log origin/main..origin/test` (y al revés) que no hay divergencia inesperada — mismo cuidado que con cualquier rama de larga duración (regla 5c).
- **Si se necesita ampliar el esquema de test** (nueva columna, nueva tabla): aplicar la migración correspondiente en `supabase/migrations/` a los **dos** proyectos, producción y test, no solo a uno.

---

## Reglas de desarrollo

1. **Nunca romper lo que funciona.** Antes de aplicar cambios, leer el archivo afectado e identificar las partes involucradas.
2. **Balance de llaves = 0 siempre.** Verificar tras cada modificación a `Peritia.jsx` con:
   ```bash
   node -e "const fs=require('fs');const c=fs.readFileSync('components/Peritia.jsx','utf8');let o=0,b=0;for(const x of c){if(x==='{')o++;if(x==='}')b++;}console.log('diff:',o-b);"
   ```
3. **Archivo principal:** `components/Peritia.jsx`. Todos los cambios de UI y lógica van aquí.
4. **No instalar dependencias externas** salvo las ya en `package.json`. Las librerías de `lucide-react` ya están disponibles.
5. **Preguntar antes de cambios grandes.** Para refactorizaciones que afecten >5 componentes, proponer y esperar confirmación.
5b. **Antes de empezar un trabajo grande (rediseño, refactor), verificar el estado real de las ramas en GitHub** (`git log`, PRs abiertos, `git branch -a`) — no asumir que el estado de partida sigue siendo el mismo que al principio de la sesión, ni que las ramas que se mencionan en este archivo o en CONTEXT.md siguen existiendo. Pol suele lanzar varias sesiones de Claude Code en paralelo sobre el mismo repo; dos sesiones distintas ya construyeron de forma independiente el mismo fix de sidebar/responsive porque una partía de una `staging` desactualizada sin saber que la otra ya lo había resuelto en `main` (ver CONTEXT.md, sesión 12). Si el PR no se puede fusionar limpiamente (`mergeable_state` distinto de `clean`) o la rama base ha avanzado desde que se creó la rama de trabajo, avisar a Pol antes de forzar nada.
5c. **Ramas del repositorio (actualizado sesión 22):** `main` es producción. La rama `staging` que existía hasta la sesión 11 ya no existe (se fusionó a `main` y se borró) — no asumir que sigue ahí. Desde la sesión 22 existe `test`, rama permanente para el entorno de pruebas (BD propia, ver más abajo). Antes de basar una rama nueva en `test` o en cualquier otra rama de larga duración, comprobar con `git log` que no está por detrás de `main`.
6. **Después de cada cambio:** crear una Pull Request con descripción clara de qué se modificó y por qué.
7. **Actualizar documentación antes de cada Pull Request.** Es un paso obligatorio, no opcional. Hacerlo siempre antes de crear la PR, aunque el cambio parezca pequeño.

   **CONTEXT.md — actualizar siempre:**
   - En "Lo que está completado y funcionando": marcar con ✅ cualquier item completado en esta sesión
   - En "Problemas resueltos": añadir fila a la tabla con formato `| Problema | Causa | Solución |` para cada bug corregido
   - En "Próximos pasos pendientes": eliminar los items completados y añadir los nuevos que hayan surgido
   - En "Estado actual": actualizar el párrafo de estado general si ha cambiado algo relevante
   - Al inicio del archivo: actualizar la fecha de "Última actualización"

   **RESUMEN_PERITIA.md — actualizar solo si aplica:**
   - Si se añade una nueva llamada a la IA: añadir fila a la tabla "Llamadas a la IA"
   - Si cambia una fórmula de cálculo: actualizar la sección "Lógica de negocio"
   - Si se añade un componente nuevo: actualizar la sección "Componentes base"
   - Si cambia el número de líneas de Peritia.jsx: actualizar el dato en "Arquitectura"
   - Si cambia el estado de un módulo: actualizar la tabla "Estado actual"

   **CLAUDE.md — actualizar solo si aplica:**
   - Si se añade una dependencia nueva a package.json: actualizar la tabla de stack técnico
   - Si cambia la estructura de archivos del repo: actualizar el árbol de archivos
   - Si se acuerda una nueva regla de desarrollo: añadirla a esta sección

8. **Toda lógica de negocio nueva va a `core/`, no a `Peritia.jsx`.** Si un cálculo no necesita React, ni red, ni base de datos, su sitio es `core/` y tiene que llegar con test. `Peritia.jsx` es solo la interfaz.
9. **`npm test` tiene que estar en verde antes de crear una Pull Request.** Es más rápido y más fiable que abrir la app y mirar los números a ojo. Si un test se pone en rojo, la pregunta no es "¿cómo arreglo el test?" sino "¿qué expediente acabo de cambiar sin querer?".
10. **No cambiar una fórmula ni un precio del baremo sin decirlo explícitamente en la Pull Request.** Son dinero real en informes ya emitidos.

---

## Workflow de deploy (Claude Code)

```
1. Leer CONTEXT.md para entender el estado actual
2. Leer el archivo afectado antes de modificarlo
3. Aplicar cambios en components/Peritia.jsx (y/o pages/api/claude.js si toca el proxy)
4. Verificar balance de llaves con el script de arriba
4b. Ejecutar `npm test` — tiene que salir todo en verde (OBLIGATORIO)
5. Actualizar documentación según regla 7 (OBLIGATORIO)
6. Crear Pull Request con descripción del cambio
7. Vercel auto-despliega al hacer merge a main (2-3 min)
```

---

## MCPs disponibles (en Claude Web)

- **Supabase MCP** — gestión BD, migraciones SQL, consultas
- **Vercel MCP** — deploy, logs, gestión del proyecto

Ambos conectados con la cuenta `poool.1717@gmail.com`.

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
| Repositorio | `github.com/poool1717/peritia` (rama `main`) |

---

## Estructura del repositorio

```
peritia/
├── components/
│   └── Peritia.jsx          ← COMPONENTE PRINCIPAL (~3.674 líneas)
├── pages/
│   ├── _app.js              ← <meta name="viewport"> global (Next.js Head)
│   ├── index.js             ← página raíz (carga Peritia dinámicamente)
│   └── api/
│       ├── claude.js        ← proxy seguro Anthropic API
│       ├── meteocat.js      ← proxy datos abiertos XEMA/Meteocat (Sec2) + captura de mapa
│       └── catastro.js      ← proxy Sede Electrónica del Catastro (Sec1) + captura WMS
├── supabase/
│   └── migrations/          ← migraciones SQL (bucket Storage, RLS, etc.)
├── package.json
├── next.config.js
├── vercel.json
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
- **Supabase proyecto:** `https://supabase.com/dashboard/project/yrulaaxdusvmzohugmnc`

---

## Credenciales de infraestructura

Las credenciales sensibles (API keys, tokens) están guardadas como variables de entorno en Vercel.
NO están en el código fuente. Consultar Vercel dashboard si es necesario.

| Servicio | Variable de entorno |
|---|---|
| Anthropic API key | `ANTHROPIC_API_KEY` (Vercel env) |
| Supabase URL | `https://yrulaaxdusvmzohugmnc.supabase.co` |
| Supabase project ID | `yrulaaxdusvmzohugmnc` |
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
5b. **Antes de empezar un trabajo grande (rediseño, refactor), verificar el estado real de `main` y `staging` en GitHub** (`git log`, PRs abiertos) — no asumir que el estado de partida sigue siendo el mismo que al principio de la sesión. Pol suele lanzar varias sesiones de Claude Code en paralelo sobre el mismo repo; dos sesiones distintas ya construyeron de forma independiente el mismo fix de sidebar/responsive porque una partía de una `staging` desactualizada sin saber que la otra ya lo había resuelto en `main` (ver CONTEXT.md, sesión 12). Si el PR no se puede fusionar limpiamente (`mergeable_state` distinto de `clean`) o `staging`/`main` han avanzado desde que se creó la rama, avisar a Pol antes de forzar nada.
5c. **`staging` puede estar por detrás de `main`.** No asumir que `staging` contiene todo lo que ya está en producción — comprobarlo (`git log origin/main..origin/staging` y al revés) antes de basar una rama nueva en `staging`.
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

---

## Workflow de deploy (Claude Code)

```
1. Leer CONTEXT.md para entender el estado actual
2. Leer el archivo afectado antes de modificarlo
3. Aplicar cambios en components/Peritia.jsx (y/o pages/api/claude.js si toca el proxy)
4. Verificar balance de llaves con el script de arriba
5. Actualizar documentación según regla 7 (OBLIGATORIO)
6. Crear Pull Request con descripción del cambio
7. Vercel auto-despliega al hacer merge a main (2-3 min)
```

---

## MCPs disponibles (en Claude Web)

- **Supabase MCP** — gestión BD, migraciones SQL, consultas
- **Vercel MCP** — deploy, logs, gestión del proyecto

Ambos conectados con la cuenta `poool.1717@gmail.com`.

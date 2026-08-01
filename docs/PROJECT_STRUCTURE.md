# PROJECT_STRUCTURE.md

> Explicación de todas las carpetas del repositorio: qué contienen hoy, qué
> deben contener, y qué reglas rigen su crecimiento.
>
> **Fecha:** 1 de agosto de 2026

---

## 1. Árbol completo

```
peritia/
├── components/              ← Interfaz y lógica de la aplicación (React)
│   └── Peritia.jsx
├── pages/                   ← Rutas de Next.js (Pages Router)
│   ├── _app.js
│   ├── index.js
│   └── api/                 ← Funciones serverless (backend)
│       ├── claude.js
│       ├── meteocat.js
│       └── catastro.js
├── supabase/
│   └── migrations/          ← Esquema de base de datos versionado (SQL)
│       ├── 20260604120000_esquema_base.sql
│       └── 20260719120000_anexos_storage_bucket.sql
├── docs/                    ← ◆ NUEVO · Documentación oficial del proyecto
│   ├── architecture/
│   ├── domain/
│   ├── ai/
│   ├── api/
│   ├── security/
│   ├── ux/
│   ├── roadmap/
│   ├── adr/
│   ├── diagrams/
│   ├── specifications/
│   ├── proposals/
│   └── *.md                 ← Los 10 documentos de auditoría
├── knowledge/               ← ◆ NUEVO · Base de conocimiento del dominio
│   ├── hogar/
│   ├── empresa/
│   ├── automovil/
│   ├── garantias/
│   ├── causas/
│   ├── objetos/
│   ├── materiales/
│   ├── clausulas/
│   ├── glosario/
│   ├── sinonimos/
│   └── procedimientos/
├── schemas/                 ← ◆ NUEVO · Esquemas de datos formales
├── prompts/                 ← ◆ NUEVO · Prompts versionados
├── tests/                   ← ◆ NUEVO · Pruebas automatizadas
├── CLAUDE.md                ← Instrucciones permanentes de trabajo
├── CONTEXT.md               ← Estado acumulado del proyecto por sesiones
├── RESUMEN_PERITIA.md       ← Resumen técnico funcional
├── package.json
├── package-lock.json
├── next.config.js
├── vercel.json
├── .env.example
└── .gitignore
```

`◆ NUEVO` marca lo creado en este sprint. **Nada de lo anterior se ha movido,
renombrado ni modificado.**

---

## 2. Carpetas de código (existentes)

### `components/`
Componentes de React. Hoy contiene **un solo archivo**, `Peritia.jsx` (4.413
líneas), que concentra el 88 % del código del proyecto: datos maestros, motor de
cálculo, cliente de base de datos, unos 40 componentes de interfaz y las
plantillas de exportación a PDF y Word.

La analogía útil: es un edificio entero construido como una sola habitación. Todo
funciona, pero cualquier obra obliga a entrar en la misma habitación.

### `pages/`
Rutas de Next.js con el enrutador clásico (*Pages Router*, no *App Router*).

- `_app.js` — envoltorio global de la aplicación. Solo declara la etiqueta
  `viewport` para móviles.
- `index.js` — única página de la aplicación. Carga `Peritia.jsx` de forma
  dinámica con `ssr:false`, es decir, **la aplicación se renderiza únicamente en
  el navegador**, nunca en el servidor.

### `pages/api/`
Funciones serverless de Vercel. Es todo el backend propio que existe.
Su papel actual es exclusivamente el de **proxy**: reciben una petición del
navegador, llaman a un servicio externo y devuelven el resultado. No hay lógica
de negocio, ni autenticación, ni acceso a la base de datos.

Detalle completo en `docs/API_INVENTORY.md`.

### `supabase/migrations/`
Esquema de la base de datos como archivos SQL versionados, con nombre
`AAAAMMDDHHMMSS_descripcion.sql`. Ambas migraciones son idempotentes: aplicarlas
de nuevo sobre un proyecto ya migrado no cambia nada.

**Regla del proyecto:** cualquier ampliación del esquema debe aplicarse a los
**dos** proyectos Supabase — producción y test — no solo a uno.

---

## 3. Carpetas nuevas

### `docs/`
Documentación oficial. Es la autoridad del proyecto: cuando documentación y
código se contradicen, la documentación es la correcta.

En su raíz viven los diez documentos de auditoría de este sprint:

| Documento | Contenido |
|---|---|
| `CURRENT_IMPLEMENTATION.md` | Auditoría del estado real del proyecto |
| `PROJECT_STRUCTURE.md` | Este documento |
| `DEPENDENCIES.md` | Inventario de dependencias de código y de servicio |
| `MODULES.md` | Módulos, responsabilidades y grafo de dependencias |
| `API_INVENTORY.md` | Todos los endpoints, propios y externos |
| `AI_INVENTORY.md` | Prompts, modelos, OCR, servicios y flujo de IA |
| `DB_MODEL.md` | Modelo de datos actual |
| `TECHNICAL_DEBT.md` | Deuda técnica detectada, con impacto y prioridad |
| `OPEN_QUESTIONS.md` | Preguntas que el código no permite responder |
| `REFACTOR_BACKLOG.md` | Refactorizaciones propuestas (documentadas, no ejecutadas) |

Y las siguientes subcarpetas:

| Subcarpeta | Qué va dentro |
|---|---|
| `architecture/` | Visión de capas, límites de módulos, flujos de datos, decisiones estructurales |
| `domain/` | Entidades del dominio pericial, ciclo de vida del expediente, reglas de negocio |
| `ai/` | Catálogo de servicios de IA, contratos, versionado de prompts, política de trazabilidad |
| `api/` | Contratos de las APIs internas y de las integraciones externas |
| `security/` | Modelo de amenazas, datos personales, control de accesos, gestión de secretos, retención |
| `ux/` | Flujos de usuario, patrones de interacción, criterios de diseño |
| `roadmap/` | Planificación por fases |
| `adr/` | *Architecture Decision Records*: una decisión por archivo, inmutables una vez aceptadas |
| `diagrams/` | Diagramas del sistema, preferentemente en Mermaid (texto versionable) |
| `specifications/` | Especificaciones funcionales previas a implementar |
| `proposals/` | Propuestas de cambio de arquitectura, a la espera de aprobación |

### `knowledge/`
Base de conocimiento del dominio, en formato legible por personas y por máquinas.
Es lo que alimenta a los servicios de IA sin escribirlo dentro del código.

Se divide en dos familias:

**Por ramo** — `hogar/`, `empresa/`, `automovil/`: conocimiento específico de cada
ramo asegurador.

**Transversal** — `garantias/`, `causas/`, `objetos/`, `materiales/`,
`clausulas/`, `glosario/`, `sinonimos/`, `procedimientos/`: catálogos que
atraviesan todos los ramos.

**Principio que justifica esta carpeta:** la plataforma debe ser independiente de
la aseguradora. Cada compañía se representa mediante configuración, catálogos,
plantillas, mapeo y metadatos — nunca mediante código a medida. Hoy ese principio
no se cumple: el conocimiento vive dentro de `Peritia.jsx` (ver `TECHNICAL_DEBT.md`,
DT-05 y DT-06).

### `schemas/`
Esquemas de datos formales (JSON Schema) de todo lo que entra y sale del sistema.
Su función es que ninguna respuesta de IA se dé por buena sin validar, y que el
formato del expediente esté definido en un único lugar.

Hoy vacía: no existe validación de esquema en ninguna parte del código.

### `prompts/`
Prompts de los servicios de IA como archivos independientes, identificables por
nombre y versión. Es requisito de la trazabilidad: cada párrafo generado debe
poder decir con qué versión exacta de qué prompt se produjo.

Hoy vacía: los nueve prompts están escritos en línea dentro de `Peritia.jsx`.

### `tests/`
Pruebas automatizadas. Reglas del proyecto: toda regla de negocio importante debe
tener prueba, y todo error corregido debe generar una prueba de regresión.

Hoy vacía y **sin infraestructura**: `package.json` no declara script `test` ni
dependencias de desarrollo. Instalar un ejecutor requiere modificar
`package.json`, lo que exige aprobación previa (ver `REFACTOR_BACKLOG.md`, R-01).

---

## 4. Archivos de la raíz

| Archivo | Papel |
|---|---|
| `CLAUDE.md` | Instrucciones permanentes de trabajo. Se lee al iniciar cada sesión |
| `CONTEXT.md` | Estado acumulado del proyecto, sesión a sesión. Es la memoria del proyecto |
| `RESUMEN_PERITIA.md` | Resumen técnico funcional de la aplicación |
| `package.json` | Dependencias y scripts (`dev`, `build`, `start`) |
| `package-lock.json` | Versiones exactas del árbol de dependencias |
| `next.config.js` | Configuración de Next.js. Única opción activa: `reactStrictMode: false` |
| `vercel.json` | Declara el framework como `nextjs` |
| `.env.example` | Referencia de las variables de entorno. **No se lee nunca**, es documentación |
| `.gitignore` | Excluye `node_modules`, `.next`, `out`, logs y `.env*.local` |

---

## 5. Reglas de crecimiento

Reglas vigentes que afectan a dónde va cada cosa:

1. **Todo cambio de interfaz y de lógica va a `components/Peritia.jsx`** mientras
   no se apruebe la división en módulos (diferida explícitamente por Pol).
2. **No se instalan dependencias externas** salvo las ya presentes en
   `package.json`.
3. **Toda ampliación del esquema de base de datos** se escribe como migración en
   `supabase/migrations/` y se aplica a los dos proyectos Supabase.
4. **La documentación se actualiza antes de cada Pull Request**, no después.
5. **Un ADR no se edita una vez aceptado.** Si la decisión cambia, se escribe uno
   nuevo que sustituye al anterior.
6. **La arquitectura no se modifica desde la implementación.** Si parece
   incorrecta, se escribe una propuesta en `docs/proposals/` y se espera
   aprobación.

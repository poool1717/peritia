# MODULES.md

> Qué módulos existen hoy, qué hace cada uno y qué depende de qué.
>
> **Fecha:** 1 de agosto de 2026
>
> **Advertencia de lectura:** este documento describe la organización **real** del
> código, no una arquitectura modular. El proyecto tiene hoy un único módulo de
> aplicación. Lo que aquí se llama "módulo lógico" son bloques identificables
> dentro de ese archivo, no unidades separadas ni desplegables por separado.

---

## 1. Mapa general

```
┌──────────────────────── NAVEGADOR ────────────────────────┐
│                                                            │
│   pages/index.js  ──(dynamic, ssr:false)──▶ Peritia.jsx    │
│   pages/_app.js   ──(viewport)                             │
│                                                            │
│   Peritia.jsx                                              │
│     ├── Datos maestros    (baremo, módulos, catálogos)     │
│     ├── Motor de cálculo  (partidas, reglas, indemniz.)    │
│     ├── Cliente Supabase  (auth, datos, storage)           │
│     ├── Cliente de IA     (callClaude)                     │
│     ├── Interfaz          (~40 componentes)                │
│     └── Exportación       (Word, PDF)                      │
└────────────┬───────────────────────────────┬───────────────┘
             │                               │
             │ (directo, sin backend propio) │ (vía proxy)
             ▼                               ▼
     ┌───────────────┐            ┌────────────────────────┐
     │   SUPABASE    │            │     pages/api/*        │
     │  auth · rest  │            │  claude · meteocat ·   │
     │   · storage   │            │       catastro         │
     └───────────────┘            └───────────┬────────────┘
                                              │
                                              ▼
                             Anthropic · Socrata/XEMA · Nominatim
                             Photon · Catastro · staticmap OSM
```

Dos observaciones que definen la arquitectura actual:

1. **No hay backend propio entre el navegador y la base de datos.** El cliente
   habla directamente con Supabase. La única protección de los datos es la
   política RLS de PostgreSQL.
2. **Los tres endpoints propios son proxys puros.** No contienen lógica de
   negocio ni tocan la base de datos. Existen porque el navegador no puede
   guardar la clave de Anthropic ni saltarse las restricciones de origen cruzado
   de los servicios públicos.

---

## 2. Módulos físicos

### 2.1. `pages/_app.js`
**Responsabilidad:** envoltorio global. Declara la etiqueta `viewport`.
**Depende de:** `next/head`.
**Depende de él:** todas las páginas.
**Líneas:** 12.

### 2.2. `pages/index.js`
**Responsabilidad:** única ruta de la aplicación. Carga `Peritia.jsx` de forma
dinámica con `ssr:false`.
**Depende de:** `next/dynamic`, `components/Peritia`.
**Consecuencia arquitectónica:** la aplicación **nunca se renderiza en el
servidor**. Es una SPA servida por Next.js. Esto explica que el código pueda usar
`window` libremente en el cuerpo de los componentes (por ejemplo
`Peritia.jsx:785`, detección de reconocimiento de voz).
**Líneas:** 7.

### 2.3. `pages/api/claude.js`
**Responsabilidad:** proxy hacia la API de Anthropic. Inyecta la clave, garantiza
modelo y `max_tokens`, y añade la cabecera de PDFs cuando detecta un documento.
**Depende de:** `ANTHROPIC_API_KEY`, `api.anthropic.com`.
**Depende de él:** `callClaude` en `Peritia.jsx`.
**No depende de:** base de datos, sesión de usuario, ningún otro módulo.
**Líneas:** 57. Detalle en `API_INVENTORY.md`.

### 2.4. `pages/api/meteocat.js`
**Responsabilidad:** dado un lugar y una fecha, devolver el resumen meteorológico
del día en la estación automática XEMA más cercana, más una captura de mapa.
**Depende de:** Socrata (2 conjuntos de datos), Nominatim, Photon,
staticmap.openstreetmap.de.
**Depende de él:** `fetchMeteoXEMA` en `Peritia.jsx:344`.
**Ámbito:** solo Catalunya (comprobación explícita por código postal o provincia,
`meteocat.js:78-83`).
**Líneas:** 239.

### 2.5. `pages/api/catastro.js`
**Responsabilidad:** dada una dirección, devolver referencia catastral, superficie
construida, año y uso, más una captura de la cartografía.
**Depende de:** Nominatim, Photon, tres servicios de la Sede Electrónica del
Catastro.
**Depende de él:** Sección 1 en `Peritia.jsx:1936`.
**Ámbito:** España, excepto País Vasco y Navarra (catastro foral propio),
documentado en el encabezado del archivo.
**Líneas:** 143.

### 2.6. `supabase/migrations/`
**Responsabilidad:** definición versionada del esquema.
- `20260604120000_esquema_base.sql` — tablas, índices, RLS, funciones y triggers.
- `20260719120000_anexos_storage_bucket.sql` — bucket `anexos` y sus 3 políticas.

**Depende de:** nada del código; se aplica manualmente sobre cada proyecto Supabase.
**Depende de él:** todo el acceso a datos de la aplicación.
**Detalle:** `DB_MODEL.md`.

### 2.7. `components/Peritia.jsx`
**Responsabilidad:** todo lo demás.
**Líneas:** 4.413.
Se desglosa en la sección 3.

---

## 3. Módulos lógicos dentro de `Peritia.jsx`

Los siguientes bloques son identificables y tienen responsabilidad propia, pero
**comparten un mismo ámbito de archivo**: cualquiera puede leer cualquier
constante o función de cualquier otro, sin barrera.

### M1 · Datos maestros — líneas 10–156
Constantes con el conocimiento del dominio incrustado.

| Constante | Contenido |
|---|---|
| `C` | Paleta de 20 colores |
| `BAREMO` | 47 partidas de reparación con oficio, unidad, precio, rendimiento, tipo de daño y condición |
| `PCT_INDIRECTO` | 8 (% de costes indirectos) |
| `TABLAS_ARQ` | Módulos €/m² para 6 códigos de provincia × 65 tipologías × 3 calidades |
| `ARQ_N2`, `ARQ_N3` | Jerarquía de tipologías para los selectores |
| `PROVINCIAS` | 13 entradas (12 provincias + "Otras") |
| `COMPANIAS` | 14 aseguradoras |
| `TIPOS_USO`, `TIPOS_GARANTIA` | Listas cerradas |
| `SECCIONES` | Las 7 pantallas del editor |

**Depende de:** solo de `lucide-react` (iconos en `SECCIONES`).
**Depende de él:** M3, M6, M7, M8.
**Nota:** `TABLAS_ARQ` solo cubre 6 códigos de provincia (`07`, `08`, `17`, `25`,
`43`, `00`), mientras que `PROVINCIAS` ofrece 13. Las siete provincias sin tabla
propia caen a `"00"` mediante `getModuloArq` (`121-125`).

### M2 · Utilidades — líneas 158–195
`fmt`, `fmtE`, `fmtSmart` (formateo de importes), `norm` (normalización de texto),
`parseCap` (interpretación de importes en formato español o anglosajón),
`callClaude` (cliente de IA).

**Depende de:** `/api/claude`.
**Depende de él:** prácticamente todo.

### M3 · Motor de cálculo — líneas 241–304
El núcleo del negocio. **Es el módulo con mayor densidad de reglas y el único que
tiene casos oráculo validados.**

| Función | Qué calcula |
|---|---|
| `calcPartida(p)` | `{vRepos, ivaAmt, vReal}` de una partida |
| `resolvePartidas(rows)` | Resuelve el importe de la partida de costes indirectos (8 % del subtotal) |
| `getPartidas(s3)` | Partidas con cobertura, con indirectos ya calculados. **Fuente única de verdad** |
| `sumRepos` / `sumIVA` / `sumReal` | Sumatorios |
| `calcReglas(enc, s1)` | Reglas proporcionales de continente y contenido, capitales, valores preexistentes y porcentajes de infraseguro |
| `calcRegla(enc, s1)` | Envoltorio de compatibilidad sobre el anterior |
| `reglaPartida(p, reglas, s3)` | Regla efectiva de una partida según su garantía y si el bloque la tiene activada |
| `sumAjustado(enc, s1, s3)` | Σ (V.Real × regla) |
| `calcIndemnizacion(enc, s1, s3)` | `max(0, ajustado − franquicia)` |
| `fraseIndemn(s3, indemn)` | Redacción de la propuesta según modo de valoración y perceptor |

**Depende de:** M1 (`PROVINCIAS`, `TABLAS_ARQ`, `PCT_INDIRECTO`), M2 (`parseCap`).
**Depende de él:** M6 (Sec1, Sec3, Sec4), M7 (vista previa), M8 (exportación).

⚠ **Este módulo es la fuente única de verdad en teoría, pero no en la práctica:**
la vista previa (`SecInforme`) y la Sección 1 recalculan el infraseguro por su
cuenta con reglas distintas. Ver `TECHNICAL_DEBT.md`, DT-08.

### M4 · Cliente de Supabase — líneas 198–239
`SB_URL_PROD`/`SB_KEY_PROD` (credenciales de producción incrustadas), `SB_URL`/
`SB_KEY` (resueltas del entorno), `ES_TEST`, `sbAuth`, `sbDb`.

**Depende de:** variables de entorno, API REST de Supabase.
**Depende de él:** M9 (raíz), M6 (anexos), `TestBadge`.
**Nota positiva:** `sbDb` rechaza cualquier operación sin token de sesión
(`227`), en lugar de caer al `anon key`, lo que evitaría escribir con identidad
anónima.

### M5 · Interpretación de IA — líneas 306–324
`parseJSON` (extrae JSON de la respuesta, tolerando bloques de markdown) e
`iaError` (traduce un fallo de API o de interpretación a un mensaje para el
usuario).

**Depende de:** nada.
**Depende de él:** todos los puntos que llaman a la IA.
**Nota positiva:** `parseJSON` devuelve `{_parseError:true}` en vez de `{}` en
silencio, precisamente para que quien llama pueda avisar. Es una decisión
deliberada y correcta.

### M6 · Meteorología y baremo — líneas 326–449
`esSiniestroAtmosferico`, `causasMeteo`, `fetchMeteoXEMA`, `meteoSupera`,
`MeteoTabla`, `meteoHTML`, `getRiesgoIA`, `matchBaremo`.

**Depende de:** `/api/meteocat`, M1, M2, M5.
**Depende de él:** Sección 2, vista previa, exportación.
**Nota:** `meteoHTML` es el único punto donde se comparte una plantilla entre
Word y PDF (con un parámetro `cls` para distinguirlos). Es la excepción a la
triple duplicación descrita en DT-07.

### M7 · Componentes de interfaz — líneas 451–3311, 3874–4270
Unos 40 componentes. Agrupados por función:

| Grupo | Componentes | Líneas |
|---|---|---|
| Base | `Spin`, `Lbl`, `Inp`, `EuroInput`, `Sel`, `Txt`, `Btn`, `Card`, `SecTitle`, `SectionLabel`, `InfoRow`, `AutoTextarea` | 491–613 |
| Zonas | `ZoneLabel`, `ContextBar`, `ResultZone`, `Formula`, `ResultTable`, `AutoBadge` | 615–685 |
| Acordeón y semáforo | `Block`, las 6 funciones `*BlockStates`, `semaforoFromStates` | 686–779 |
| Voz | `VoiceBox` | 781–829 |
| Navegación | `NavBottom`, `Logo` | 830–861 |
| Acceso | `LoginScreen` | 862–954 |
| Listado | `Dashboard` | 956–1290 |
| Alta | `DropZone`, `UploadEncargo` | 1291–1616 |
| Vista previa | `SecInforme` | 1617–1920 |
| Secciones | `Sec1`, `Sec2`, `Sec3` (+`InpCell`), `Sec4`, `SecAnexos` | 1921–3311 |
| Encargo | `SecEncargo` | 3874–3989 |
| Editor | `ReportEditor` | 3990–4270 |

**Nota:** todos los estilos son en línea, sobre la paleta `C`. No hay hoja de
estilos por componente ni sistema de diseño separado; la única cadena CSS global
está en `Peritia.jsx:453-489`.

### M8 · Exportación — líneas 3312–3873
`fmtPDF`, `esPdfItem`, `allFacturasOf`, `buildWordHTML`, `wordImgCache`,
`urlToDataURI`, `resolveAnexosImgs`, `exportWord`, `exportPDF`, `ExportModal`.

**Depende de:** M3 (cálculos), M6 (`meteoHTML`), M1.
**Depende de él:** `ReportEditor`.
**Mecanismos:** Word se genera como HTML entregado con tipo `application/msword`;
PDF se genera escribiendo HTML en un `iframe` oculto e invocando la impresión del
navegador.

### M9 · Raíz de la aplicación — líneas 4271–4413
`TestBadge` y `App`. Concentra el estado global: usuario, token, vista activa,
lista de expedientes, expediente abierto, estado de guardado.

Responsabilidades:
- Carga de expedientes al autenticar (`loadCases`).
- Alta de expediente con guardado optimista: abre el editor de inmediato con un
  identificador local y guarda en segundo plano (`handleDone`).
- Guardado automático con retardo de 5 s y un reintento (`updateCase`, `saveToSb`).
- Guardado inmediato desde el botón (`flushSave`).
- Marcado como exportado (`markExported`).
- Borrado (`deleteCase`).
- Aviso del navegador al cerrar con cambios sin guardar (`beforeunload`).

**Depende de:** M4, M7.
⚠ **El estado de sesión vive solo en memoria de React.** No hay
`localStorage` ni refresco de token: recargar la página devuelve al login. Ver
DT-03.

---

## 4. Grafo de dependencias

```
M1 Datos maestros ──────┬──▶ M3 Motor de cálculo ──┬──▶ M7 Interfaz
                        │                          ├──▶ M8 Exportación
                        ├──▶ M6 Meteo/Baremo ──────┤
                        └──▶ M7                    │
                                                   │
M2 Utilidades ──────────┬──▶ M3                    │
                        ├──▶ M6                    │
                        └──▶ M7, M8                │
                                                   │
M5 Interpretación IA ───────▶ M6, M7               │
                                                   │
M4 Cliente Supabase ────┬──▶ M7 (anexos)           │
                        └──▶ M9 Raíz ──────────────┘
```

**Sin ciclos.** La dirección de dependencia es coherente: los datos y las
utilidades están abajo, la interfaz y la exportación arriba.

**El problema no es el grafo, es que no está respaldado por ninguna barrera.**
Al vivir todo en un archivo, nada impide que mañana una función de interfaz
modifique una constante de datos maestros, o que el motor de cálculo llame a un
componente. La separación existe por disciplina, no por estructura.

---

## 5. Módulos que el proyecto necesita y **no existen**

Registrado sin proponer implementación:

| Módulo ausente | Consecuencia hoy |
|---|---|
| **Servicios de IA separados** (OCR, clasificación, extracción, normalización, análisis de cobertura, análisis de daños, validación, redacción, revisión de calidad) | Las 9 llamadas están dispersas por la interfaz, cada una con su prompt en línea |
| **OCR** | No existe. La lectura de PDF depende enteramente de la API de Anthropic |
| **Registro de ejecuciones de IA** | No se registra ninguna ejecución; el contador de tokens ni siquiera se persiste |
| **Trazabilidad de párrafos** | Ningún texto generado guarda origen, página, entidades, confianza, versión de prompt ni de modelo |
| **Capa de configuración por aseguradora** | AXA está incrustada en código y en prompts |
| **Capa de acceso a datos (repositorio)** | El componente llama a `sbDb` con rutas REST escritas a mano |
| **Validación de esquema** | Ninguna respuesta de IA se valida |
| **Gestión de sesión** | No hay persistencia ni refresco de token |
| **Registro de auditoría del expediente** | No se sabe quién cambió qué ni cuándo, más allá de `updated_at` |
| **Motor de plantillas de informe** | Tres implementaciones paralelas del mismo informe |

Estos huecos alimentan `REFACTOR_BACKLOG.md` y `TECHNICAL_DEBT.md`.

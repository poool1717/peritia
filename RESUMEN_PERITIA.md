# PERIT.IA — Resumen del Proyecto

**Archivo principal:** `components/Peritia.jsx` · 4.114 líneas · React 18
**Núcleo puro:** `core/` · 10 módulos sin React, cubiertos por 123 tests (`npm test`)
**Versión desplegada:** Next.js 14 en Vercel · https://peritia-git-main-pol-myprojects.vercel.app

---

## Arquitectura

```
App (Root) — auth state (user, token, sidebarOpen)
├── LoginScreen            — Registro / inicio de sesión (Supabase Auth)
├── Dashboard              — Lista de encargos + sidebar colapsable
├── UploadEncargo          — Subida PDF encargo + póliza + extracción IA
└── ReportEditor           — Editor principal
    ├── TopBar             — Info encargo + toggle sidebar + tokens + Exportar
    ├── Sidebar            — Navegación colapsable (toggle ‹/›)
    ├── [Sec 0]            — Datos del Encargo (editable)
    ├── [Informe]          — Preview live del informe completo (con Anexos)
    ├── [Sec 1]            — Verificación del riesgo y póliza
    ├── [Sec 2]            — Causas y circunstancias
    ├── [Sec 3]            — Valoración de daños
    ├── [Sec 4]            — Cobertura e indemnización
    └── [Anexos]           — Fotos, catastro, Meteosim, facturas
```

**Núcleo puro (desde la sesión 23)** — la lógica de negocio ya no vive en la interfaz:

```
core/
├── formato.mjs     — fmt · fmtE · fmtSmart · norm · parseCap
├── baremo.mjs      — BAREMO (47 partidas) · PCT_INDIRECTO · matchBaremo
├── valoracion.mjs  — PROVINCIAS · findProvincia · TABLAS_ARQ · getModuloArq
│                     getFactorArq · calcVPreexCont
├── calculo.mjs     — calcPartida · resolvePartidas · getPartidas · sumRepos/sumIVA/sumReal
│                     calcReglas · calcRegla · reglaPartida · sumAjustado
│                     calcIndemnizacion · fraseIndemn
├── catalogos.mjs   — COMPANIAS · normCompania · TIPOS_USO · TIPOS_GARANTIA
├── ia.mjs          — parseJSON · iaError
├── meteo.mjs       — esSiniestroAtmosferico · causasMeteo · meteoSupera
├── alertas.mjs     — UMBRAL_INFRASEGURO_SOSPECHOSO · avisoInfraseguro · avisosDelRiesgo
├── progreso.mjs    — encargoBlockStates · s1..s4BlockStates · anexosBlockStates
│                     semaforoFromStates
└── index.mjs       — única puerta de entrada; Peritia.jsx importa siempre desde aquí

tests/              — 123 tests con `node --test`; caso-real-01 contrasta la app
                      contra un informe pericial real ya cerrado
.github/workflows/  — CI: tests + balance de llaves + build en cada PR
```

Regla: en `core/` no entra React, ni `fetch`, ni Supabase, ni `window`. Todo lo
que se exporta desde ahí tiene que tener test.

---

## Infraestructura

| Servicio | Proyecto | Región | Estado |
|---|---|---|---|
| **Vercel** | `peritia` · `prj_FlGP4bJXDO8w52vUE2ahNzLcseoz` | US East | ✅ Activo |
| **Supabase** | `PeritIA` · `yrulaaxdusvmzohugmnc` | EU West 1 (Irlanda) | ✅ Activo (producción) |
| **Supabase (test)** | `PeritIA-test` · `yvconlqtetxvyzxkhxib` | EU West 1 (Irlanda) | ✅ Activo (sesión 22, plan gratuito, vacío) |
| **Anthropic API** | `sk-ant-api03-uSjEaVJD...` | — | ✅ Configurada en Vercel env, compartida entre producción y test |
| **GitHub** | `poool1717/peritia` | — | ✅ Auto-deploy en push a main · rama `test` para el entorno paralelo |

`SB_URL`/`SB_KEY` (cliente de Supabase en `Peritia.jsx`) ya no van escritos en el código: se leen de `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`, con los valores de producción como respaldo si esas variables no están definidas. Así se decide desde Vercel (por ámbito Production/Preview) a qué base de datos apunta cada despliegue, en vez de en el código.

**Proxy seguro:** `pages/api/claude.js` — inyecta `ANTHROPIC_API_KEY`, añade `anthropic-beta: pdfs-2024-09-25` automáticamente si la petición contiene un PDF, garantiza `max_tokens` y modelo `claude-sonnet-4-6`.

**Proxy meteo:** `pages/api/meteocat.js` — consulta datos abiertos XEMA (Socrata: estaciones `yqwd-vj5e`, medidos `nzvn-apee`) + geocodificación Nominatim. Recibe dirección + fecha, devuelve estación más cercana y resumen del día (racha máx, viento medio, lluvia máx/h y total) + una captura del mapa (estación + lugar del siniestro, vía `staticmap.openstreetmap.de`, sin clave de pago) que se adjunta automáticamente en Anexos → Info Meteosim. Solo Catalunya.

**Proxy catastro:** `pages/api/catastro.js` — geocodifica la dirección del encargo (Nominatim/Photon) y consulta los servicios web oficiales de la Sede Electrónica del Catastro: `Consulta_RCCOOR` (coordenadas → referencia catastral) y `Consulta_DNPRC` (referencia → superficie construida, año de construcción, uso). También descarga una captura de la cartografía catastral vía WMS (`Cartografia/WMS/ServidorWMS.aspx`). Botón "Consultar Catastro" en Sec1: rellena los campos y adjunta la captura en Anexos → Info Catastral automáticamente. Sin clave de pago, ámbito España (no cubre País Vasco/Navarra, que tienen catastro foral propio). Validado en producción por Pol.

---

## Componentes base

`Spin` · `Inp` · `EuroInput` · `Sel` · `Txt` · `AutoTextarea` · `Btn` · `Card` · `SecTitle` · `SectionLabel` · `InfoRow` · `VoiceBox` · `NavBottom` · `Logo` · `DropZone` · `ExportModal` · `LoginScreen` · `SecEncargo` · `MeteoTabla` · `ZoneLabel` · `ContextBar` · `ResultTable` · `AutoBadge` · `Formula` · `TestBadge`

> **`TestBadge`** (sesión 22) — aviso fijo "ENTORNO DE PRUEBAS" en las 4 pantallas de la app. Se muestra solo cuando `SB_URL` no coincide con la de producción (`ES_TEST`), así que no depende de acordarse de activar ni desactivar nada a mano.

(El rail de navegación por bloques de la sesión 16 — `BlockRail`/`useBlockRail`/`WorkGrid`/`RailStats` — se retiró en la sesión 17.)

> **`AutoTextarea`** (con el hook `useAutoGrow`) es la caja de texto estándar: se ajusta sola al volumen de texto —al escribir, al rellenarla la IA y al cambiar el ancho de la ventana— en vez de tener scroll interno. `Txt` y `VoiceBox` la usan por dentro. La interfaz no usa emojis: los iconos son de `lucide-react`.
>
> **Sistema de 3 zonas** (`ZoneLabel`/`ContextBar`/`ResultTable`) — cada sección del editor se organiza en hasta tres bloques: **Contexto** (`ContextBar`, tira compacta con lo que la sección solo consulta — capitales, garantía, franquicia…), **Tu trabajo** (los campos que el perito rellena, bajo un `ZoneLabel`) y **Resultado** (lo que calcula la app, con `ResultTable` — misma cabecera oscura que la tabla del dashboard). No todas las secciones tienen las tres: Datos del Encargo y Anexos no calculan nada, así que no tienen zona de resultado. `ContextBar` admite un `onEdit` opcional (usado en Sec3) que despliega el formulario completo debajo sin ocultar ningún campo — es un `useState` local del componente, no toca los datos guardados.
>
> **Editor a 1180px con rail de navegación** — el panel de contenido del editor pasó de 760px a 1180px de ancho. Dentro de la zona "Tu trabajo", `WorkGrid` reparte el espacio en dos columnas (formulario + `BlockRail`, que se oculta por debajo de 900px); `BlockRail`/`useBlockRail` muestran una barra lateral fija ("En esta sección") que resalta el bloque visible mientras se hace scroll (`IntersectionObserver`) y permite saltar directamente a uno; `RailStats` añade ahí mismo el resultado clave de la sección (valor preexistente, total de partidas, propuesta de indemnización) sin tener que bajar hasta el final. `Formula` muestra, en la zona de Resultado de Sec1/Sec3/Sec4, la fórmula genérica del cálculo junto a un ejemplo resuelto con los números reales de ese informe.

---

## Llamadas a la IA (8 en total)

| # | Dónde | Qué hace | max_tokens |
|---|---|---|---|
| 1 | UploadEncargo | Extrae 24 campos del encargo PDF | 4000 |
| 2 | UploadEncargo | Extrae capitales, umbrales y coberturas de la póliza PDF (incluye texto de cobertura de las 7 garantías: INCEN/DAGUA/RGEXT/ROBO/DELEC/RCEXP/RCLOC) | 8000 |
| 3 | Sec1 (Instant Payment) | Mejora el texto documental | 1500 |
| 4 | Sec2 | Mejora texto de causas y circunstancias | 1500 |
| 5 | Sec2 | Redacta párrafo pericial meteorológico desde datos XEMA | 1500 |
| 6 | Sec3 | Mejora texto de descripción de daños | 1500 |
| 7 | Sec3 | Genera tabla de daños desde descripción + Baremo por oficio (tipo de daño / condición) — reparte cada partida a Continente o Contenido según la garantía | 4000 |
| 8 | Sec3 | Extrae partidas desde facturas/presupuestos PDF | 2000 |

> **Sec4 ya no usa IA.** Los textos (valoración, descripción de cobertura, propuesta de indemnización) se generan de forma determinista a partir del modo de valoración, el perceptor, la cobertura y los datos de la póliza. Todos editables.
> **El bloque "Redacción IA — Sección 1" se ha eliminado.** Ya no hay generación de texto por IA en Sec1 (fuera del flujo Instant Payment); el resto de textos generados por IA (viñetas, ✨, "con IA") se han retirado de los textos visibles de la interfaz — la funcionalidad de fondo se mantiene donde sigue siendo necesaria (extracción de PDFs, mejora de texto, generación de tabla).
> **La IA ya no aplica depreciación automáticamente.** Las partidas generadas por IA (Baremo o facturas) siempre nacen con `depr:false, pctDepr:0`; es el perito quien marca el checkbox de depreciación y escribe el % manualmente en la tabla.

---

## Lógica de negocio

**Extracción automática del encargo:** compañía, referencia, póliza, ramo, garantía, fechas, dirección, asegurado, perito, causas, capitales, tipo de encargo, modalidad de visita, cobertura inferida.

**Extracción automática de la póliza:** capitales por cobertura, franquicia, primer riesgo, umbrales meteorológicos, texto completo de coberturas, capitales del continente desglosados.

**Tipos de encargo:** `PERITACION` · `INSTANT_PAYMENT`
**Tipos de ramo:** `HOGAR` · `EMPRESA/PYME`

**Inferencia de cobertura vacía:**
```
Viento / Lluvia / Pedrisco / Nieve  →  RGEXT
Agua / Filtración                   →  DAGUA
Incendio                            →  INCEN
Robo                                →  ROBO
Eléctrico                           →  DELEC
```

**Cálculo del continente:**
```
Continente a primer riesgo CONTRATADO EN PÓLIZA (enc.primerRiesgo === true,
detectado explícitamente por la IA al leer la póliza — "capitales a asegurar")
  → Preexistente = Capital asegurado, infraseguro = 0%
  → Frase informativa (ℹ): "Continente a primer riesgo contratado en póliza."
    Solo se muestra cuando primerRiesgo es realmente true.

En cualquier otro caso (incluidos TODOS los casos de Hogar sin primer riesgo
explícito en póliza — antes se forzaba primerRiesgo=true solo por ser Hogar,
bug corregido)
  → Preexistente = calcVPreexCont(m², provCode, arqKey, calidad)
                 = m² × getModuloArq(provCode, arqKey, calidad) × getFactorArq(arqKey)
  → getModuloArq: TABLAS_ARQ[prov][tipo][calidadIdx] (€/m² CYPE 2025)
  → getFactorArq: 1.486 residencial · 1.618 no residencial · 1.366 urbanización
  → Infraseguro = (Preexistente − Asegurado) / Preexistente × 100
  → Regla proporcional = Asegurado / Preexistente
```
> **Fix de esta sesión:** `primerRiesgo = pol.primerRiesgo||esHogarEnc||false` forzaba primer riesgo (preexistente = asegurado, sin infraseguro) en TODOS los siniestros de Hogar, aunque la póliza no lo dijera. Ahora `primerRiesgo = !!pol.primerRiesgo` — solo es true si la IA detectó explícitamente "Edificio primer riesgo" en la póliza. Afecta a `calcReglas`, Sec1 y a la extracción. **Validado por Pol contra los casos oráculo (463,59 € / 1.291,47 €)** — ninguno dependía del comportamiento anterior.

**Fórmula de valoración de daños (auditada y corregida):**
```
V.Repos  = Uds × V.Unitario
IVA €    = V.Repos × (IVA% por partida)   — solo si el checkbox de IVA de la fila está marcado
V.Real   = V.Repos × (1 − Depr%) + IVA €  — Depr% solo si el checkbox de depreciación de la fila está marcado
Subtotal = Σ V.Real (solo items con cobertura = Sí)
```
> Columna "Valor propuesto" eliminada (era idéntica a V.Real). Columna "Garantía" eliminada de la tabla: cada partida se edita ya dentro de su tabla (Continente o Contenido), que determina el valor de `garantia` internamente.

**Checkbox de IVA por partida (columna nueva, a la izquierda de %IVA):** desmarcado por defecto. Al marcarlo aplica 21% (editable con desplegable 10%/21%); al desmarcarlo, IVA = 0%. En modo Presupuesto la columna de IVA no se muestra (como antes).

**Checkbox de depreciación por partida:** desmarcado por defecto, incluso en las partidas generadas por IA. Al marcarlo aparece el campo %Depr para que el perito escriba el porcentaje manualmente. La IA nunca marca este checkbox ni escribe un %.

**Lógica de IVA por modo:**
- **A modo informativo (Baremo)** → IVA = 0% en todas las partidas (checkbox oculto solo en Presupuesto; en Baremo/Factura se muestra pero empieza desmarcado)
- **Factura** → la IA extrae el IVA de cada línea del documento y marca el checkbox si el IVA extraído es > 0%
- **Presupuesto** → columna de IVA oculta

**Funciones de cálculo globales (fuente única de verdad):**
```javascript
calcPartida(p)                        → {vRepos, ivaAmt, vReal}  // p.iva??0
getPartidas(s3)                       → s3.partidas con cobertura (fuente única)
calcReglas(enc,s1)                    → {continente, contenido, capCont, vPreexCont, capCont2, vPreexContenido, infraCont, infraContenido}
calcRegla(enc,s1)                     → regla del continente (compat)
reglaPartida(p,reglas,s3)             → regla efectiva de la partida (según garantía y toggle del bloque)
sumAjustado(enc,s1,s3)                → Σ V.Real × regla por partida
calcIndemnizacion(enc,s1,s3)          → MAX(0, ajustado − franquicia)
fraseIndemn(s3,indemn)                → frase de propuesta según modo y perceptor
sumReal/sumRepos/sumIVA(rows)
getModuloArq(provCode, arqKey, cal)   → €/m² de TABLAS_ARQ
getFactorArq(arqKey)                  → 1.486 | 1.618 | 1.366
calcVPreexCont(m2, prov, arqKey, cal) → valor preexistente continente completo
sec4IntroAuto(modo)                   → texto de valoración fijo según modo (Sec4)
sec4IndemnAuto(s3, indemn)            → propuesta de indemnización estructurada (Sec4)
```

**Modos de valoración Sec3 (orden):**
- **A modo informativo** (antes "Por Baremo") — IA selecciona partidas del baremo por oficio según tipo de daño y condición de activación (botón "Generar tabla", sin depreciación automática); IVA = 0%; columna "Oficio"; "Costos indirectos" = 8% del subtotal
- **Por Presupuesto** — adjuntar PDFs; columna IVA oculta; frase "a la espera de aportación de la factura…"
- **Por Factura** — adjuntar PDFs; la IA extrae líneas con IVA del documento; frase "…(IVA incl.)"

**Tablas de valoración (rediseño de esta sesión):** la tabla única se ha dividido en tres bloques, cada uno con su propio botón "Fila":
```
Tabla Continente   — partidas con garantia="continente", con su propio subtotal
Tabla Contenido    — partidas con garantia="contenido", con su propio subtotal
Tabla Resumen de Daños — Total Continente / Total Contenido / Total estimación de daños
                          columnas: Valor a nuevo (= V.Repos) · Valor real (= V.Real)
```
El botón "Generar tabla" reparte automáticamente cada partida generada por la IA a su tabla según el campo `garantia` que ya devolvía la IA (sin lógica nueva).

**Perceptor (presupuesto / factura):** checkbox exclusivo Asegurado / Perjudicado / Reparador (sesión 17, antes solo Particular/Reparador). Con Reparador no hay depreciación (columna oculta) y la frase usa el nombre del perceptor elegido ("Asegurado:" / "Perjudicado:" / "Reparador:").

**Regla proporcional por bloque (continente / contenido):**
```
Cada partida lleva garantia = "continente" | "contenido" (determina en qué tabla se edita: Continente o Contenido).
regla del bloque = capital asegurado del bloque / valor preexistente del bloque
                   (solo si hay infraseguro y el toggle del bloque está activo)
primerRiesgo (real, contratado en póliza) → continente sin infraseguro → regla = 1
```

**Fórmula de indemnización:**
```
Valor ajustado = Σ por partida ( V.Real × regla del bloque de la partida )
Indemnización  = MAX(0, Valor ajustado − Franquicia)
```

**Sec4 — Estudio de Cobertura-Indemnización (textos automáticos editables):**
```
Texto de valoración (sec4IntroAuto, según modo Sec3):
  Presupuesto → "Procedemos a realizar valoración… en base al presupuesto aportado…"
  Factura     → "Procedemos a realizar valoración… en base a la factura aportada…"
  A modo informativo → "A la espera de aportación de presupuestos o facturas… valoración unilateral a modo informativo." + propuesta de indemnización (Asegurado)

Descripción de la cobertura:
  Extraída de la póliza (enc.descripciones) cruzando garantía afectada / causa.
  Sesión 17: el texto es literal (continente y contenido por separado, incluida
  la cláusula de exclusión/"no cubre" si esa garantía no tiene cobertura).

Propuesta de indemnización (sec4IndemnAuto):
  Sin cobertura (todas las filas "No")     → "NO se propone indemnización."
  Presupuesto                              → "A la espera de aportación de la factura… {perceptor}: € (valor real sin IVA)"
  Factura + Reparador                      → "Se propone indemnización… Reparador: €"
  Factura + Asegurado/Perjudicado          → "Se propone indemnización… {perceptor}: € (IVA incl.)"
```

**Verificado contra informes reales:**
| Caso | Resultado esperado | App |
|---|---|---|
| Case 1 — Empresa, obras reforma | 463,59 € | ✅ 463,59 € |
| Case 2 — Hogar, primer riesgo, IVA mixto | 1.291,47 € | ✅ 1.291,47 € |

---

## Exportación de documentos

**Modal "Exportar"** — accesible desde TopBar. DNI del perito se guarda en el perfil.

| Formato | Tecnología | Notas |
|---|---|---|
| **PDF** | iframe oculto + `window.print()` nativo (sesión 17, antes `window.open` con URL blob) | CSP-safe. Ya no abre ninguna pestaña/ventana — el diálogo de impresión sale sobre la propia app. Numeración de página real vía CSS (`@page{@bottom-center{content:counter(page)}}`), sin librería nueva |
| **Word (.doc)** | HTML-to-DOC via Blob | Editable en Word/LibreOffice, descarga directa. Numeración de página real con campos nativos de Word (`PAGE`/`NUMPAGES`) desde la sesión 17 |

Ambos incluyen: portada con grid de campos (cabecera "expediente" = Nº de Referencia, ya no `numExpInterno`), Sec0–4 completas, las tablas de valoración de la Sección 3 (Daños en Continente / Daños en Contenido / Resumen de Daños, títulos alineados a la izquierda desde la sesión 17), Sección 4 "Estudio de Cobertura-Indemnización" con sub-apartados 4.1 Cobertura y 4.2 Resumen por garantías. Propuesta de indemnización, cierre con espacio para firma, Anexos siempre en página propia (facturas/presupuestos como hoja adicional del informe, reportaje fotográfico en una columna de fotos numeradas "Foto 1"/"Foto 2"… con pie de foto opcional) — las Secciones 1 a 4 en cambio fluyen sin salto de página forzado entre ellas, solo con más separación visual. Colores de tablas/bordes en gris (antes granate) desde la sesión 17.

---

## Autenticación y persistencia (Supabase)

**Auth:** email + contraseña · confirmación de email desactivada · perfil creado automáticamente al registrarse.

**BD — tablas:**
```sql
public.informes (
  id UUID PK, user_id UUID FK,
  num_referencia, compania, asegurado, estado,
  encargo JSONB, s1 JSONB, s2 JSONB, s3 JSONB, s4 JSONB, anexos JSONB,
  created_at, updated_at
)
public.perfiles (
  id UUID PK, email, nombre, dni, telefono,
  created_at, updated_at
)
```

RLS activo (policy `informes_own`, `ALL`, `user_id = auth.uid()`). `handleDone` resiliente — abre el editor inmediatamente con datos extraídos; guardado Supabase en segundo plano.

**`informes.estado`:** `borrador` (por defecto) → `exportado` automáticamente al generar PDF o Word desde el editor (`markExported`, reutiliza el mismo `saveToSb` del autoguardado — no hay un mecanismo de escritura separado). El Dashboard deriva un cuarto estado visual "Pendiente revisión" cuando `estado!=='exportado'` pero las 4 secciones están completas (`done===4/4`); no existe como valor en BD, solo como etiqueta calculada en el frontend.

**Storage — bucket `anexos`:** los archivos de Anexos (fotos, catastro, meteosim, facturas) se suben a Supabase Storage en vez de guardarse como base64 en `informes.anexos`; el JSONB solo guarda `{id,name,url,type,caption,cat}` con `url` apuntando a la URL pública del objeto. Bucket público en lectura; INSERT/DELETE restringidos por RLS al propio usuario (ruta `{user_id}/{informe_id}/{tab}/{timestamp}-{nombre}`). Migración: `supabase/migrations/20260719120000_anexos_storage_bucket.sql`.

---

## Datos de referencia integrados

**Baremo por oficio** (sesión 7) — 47 partidas (IVA = 0%): Albañilería, Pintura, Lampistería, Electricidad, Carpintería, Cerrajería, Limpieza, Auxiliares. Cada partida lleva precio base, tipo de daño y condición de activación. "Costos indirectos" = 8% del subtotal (automático).

**TABLAS_ARQ 2025** — 63 tipos de arquitectura × 6 provincias (Baleares, Barcelona, Girona, Lleida, Tarragona, Otras) × 3 calidades (Básica/Media/Alta). Fuente: Excel tablas_calculo_2025. "Otras" = media de las 5 provincias. Reemplaza el antiguo MOD_ARQ.

**Compañías aseguradoras** — 14 compatibles: AXA, Mapfre, Allianz, Generali, Zurich, Helvetia, Mutua Madrileña, Caser, Reale, Santalucía, Pelayo, BBVA Seguros, Catalana Occidente, Línea Directa.

---

## UX y navegación

- **Sidebar global** — estado `sidebarOpen` al nivel App, persiste entre Dashboard y Editor. En desktop empuja el contenido (ancho fijo); en <1024px es un overlay `position:fixed` con backdrop semitransparente que lo cierra al hacer clic fuera (clases `.app-sidebar`/`.sb-open`/`.sidebar-backdrop`), con su propio botón de cierre dentro del panel.
- **Editor a pantalla completa** — el contenedor del editor (`.editor-shell`) mide exactamente el alto de la ventana (`100vh`/`100dvh`, `overflow:hidden`), así que el único elemento que hace scroll es el panel de contenido: la barra lateral de secciones y la cabecera quedan fijas. Al cambiar de sección ese panel vuelve al principio automáticamente.
- **Rail de navegación del editor** — folios numerados (`00`–`06`, `IBM Plex Mono`) con subtítulo en vez de iconos; check verde sobre el número cuando la sección está completa.
- **Sistema de 3 zonas** — las 6 secciones del editor (Sec0-4 + Anexos) se organizan en Contexto (`ContextBar`) · Tu trabajo (`ZoneLabel`) · Resultado (`ResultTable`). Cambios notables por sección: en Sec1, Catastro y Tipo de Arquitectura viven en una sola tarjeta "Superficie y Arquitectura", y Continente/Contenido se resumen en una tabla de 2 filas en vez de dos cajas de color; en Sec3, "Parámetros de Garantía" se pliega tras la tira de contexto (enlace "Editar parámetros"), el modo de valoración y su acción (Generar tabla, o Perceptor+Facturas) viven en una sola tarjeta "Cómo se valora", y "¿Hay perjudicados?" se pliega a una línea cuando no hay ninguno.
- **Sec 0 "Datos del Encargo"** — primera sección del editor, todos los campos extraídos son editables.
- **Tick verde en sidebar** — S1: superficieConstruida o textoInstant · S2: textoAI/textoRaw · S3: partidas o pLibres · S4: aiText · Anexos: cualquier archivo.
- **Botón "Aplicar al informe"** — S1, S2 y S3 sincronizan texto IA con el preview.
- **Informe live** — usa `getPartidas(s3)` para mostrar tabla según modo activo, con estilo "ledger" (cabecera oscura, zebra striping, importes en `IBM Plex Mono`).
- **Dashboard — vista de tabla** (por defecto en desktop) y **vista de tarjetas** (única en móvil, con drawer de filtros propio) — toggle en el sidebar. Tabla con 9 columnas filtrables/ordenables sobre los expedientes ya cargados (filtrado en memoria).
- **Error handling** — errores de API visibles en alertas con mensaje exacto de Anthropic.

---

## Estado actual

| Módulo | Estado |
|---|---|
| Dashboard + sidebar toggle global | ✅ |
| Extracción IA encargo + póliza (24 campos) | ✅ |
| Sec 0 — Datos del Encargo (editable) | ✅ |
| Sec 1 — Riesgo + auto-fill póliza + arquitectura 3 niveles | ✅ |
| Sec 2–4 + Anexos | ✅ |
| Sec 3 — Regla proporcional por bloque (continente/contenido) | ✅ |
| Sec 3 — Modos Baremo / Presupuesto / Factura + perceptor | ✅ |
| Sec 3 — Frase de indemnización automática + drag & drop de filas | ✅ |
| Sec 3 — Auto-relleno concepto de garantía + franquicia | ✅ |
| Sec 4 — Textos automáticos (valoración, cobertura, indemnización) editables | ✅ |
| Núcleo de cálculo separado en `core/` | ✅ |
| Tests automáticos del núcleo (123, uno de caso real) | ✅ |
| Aviso de infraseguro absurdo (>90 %) con bloque en "Revisar" | ✅ |
| CI en GitHub Actions (tests + build por PR) | ✅ |
| Protección contra escribir en la BD real desde un preview | ✅ |
| Valor preexistente CYPE 2025 (TABLAS_ARQ) | ✅ |
| Fórmula de cálculo auditada y verificada | ✅ |
| Preview live del informe | ✅ |
| Exportación PDF + Word | ✅ |
| Login multiusuario (Supabase Auth) | ✅ |
| Base de datos persistente (Supabase) | ✅ |
| Despliegue en Vercel (Next.js) | ✅ |
| Proxy seguro API Anthropic | ✅ |
| Error handling con mensaje real de API | ✅ |
| Anexos en Supabase Storage (sin base64 en JSONB) | ✅ |
| Rediseño visual (paleta, tipografía, Dashboard en tabla, ledger Sec3) | ✅ |
| Expediente marcado como "exportado" al generar PDF/Word | ✅ |
| Cabecera del informe = Nº de Referencia (antes usaba Nº de Encargo si existía) | ✅ |
| Consulta Catastral automática vía API (referencia, superficie, año + captura de cartografía en Anexos) | ✅ validado en producción |
| Captura automática del mapa XEMA en Anexos → Info Meteosim | ✅ validado en producción |
| Sec3 — tabla de valoración dividida en Continente / Contenido / Resumen de Daños | ✅ |
| Sec3 — checkbox de IVA por partida (10%/21%, desmarcado por defecto) | ✅ |
| Sec3 — depreciación 100% manual (la IA nunca la marca ni la calcula) | ✅ |
| Sec3 — fix de foco: los campos numéricos (Uds/V.Unit/%IVA/%Depr) ya no saltan al escribir | ✅ |
| Fix: `primerRiesgo` ya no se fuerza a `true` en todos los casos de Hogar | ✅ (validar oráculo) |
| Frases y etiquetas "IA"/✨ retiradas de la interfaz visible | ✅ |

---

## Coste estimado

| Concepto | Coste |
|---|---|
| Por informe completo (IA) | ~0,30–0,55 € |
| Vercel (hobby plan) | 0 €/mes |
| Supabase (free tier) | 0 €/mes |

---

## URLs del proyecto

| Recurso | URL |
|---|---|
| App producción | `https://peritia-git-main-pol-myprojects.vercel.app` |
| GitHub | `https://github.com/poool1717/peritia` |
| Vercel dashboard | `https://vercel.com/pol-myprojects/peritia` |
| Supabase | `https://supabase.com/dashboard/project/yrulaaxdusvmzohugmnc` |
| Artefacto referencia | `https://claude.ai/public/artifacts/ced45450-ed81-4101-8c46-39f79cf17ce7` |

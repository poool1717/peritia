# CURRENT_IMPLEMENTATION.md

> **Auditoría del estado real del proyecto.** Describe lo que hay hoy en el
> código, no lo que debería haber. **No propone cambios**: las propuestas viven
> en `TECHNICAL_DEBT.md` y `REFACTOR_BACKLOG.md`.
>
> **Fecha:** 1 de agosto de 2026
> **Rama auditada:** `claude/app-test-environment-mllwga` (descendiente de `test`)
> **Commit base:** `b3e1a87`
> **Alcance:** los 17 archivos versionados del repositorio, leídos en su totalidad.

---

## 1. Resumen

PERIT.IA es una aplicación web de generación de informes periciales de seguros.
Un perito sube el PDF del encargo y, opcionalmente, el de la póliza; una IA
extrae los datos; el perito completa cuatro secciones en un editor; la aplicación
genera el informe y lo exporta a PDF y a Word.

Técnicamente es una aplicación **Next.js 14 (Pages Router) desplegada en Vercel**,
con **un único componente React** que contiene prácticamente toda la aplicación
(`components/Peritia.jsx`, 4.413 líneas) y **tres funciones serverless** que
actúan de proxy hacia servicios externos. La persistencia es **Supabase**
(PostgreSQL + Auth + Storage), y el navegador habla **directamente** con la API
REST de Supabase: no hay capa de backend propia entre el cliente y la base de
datos.

Cifras verificadas:

| Métrica | Valor |
|---|---|
| Archivos versionados (sin `.git`) | 17 |
| Líneas de código de aplicación | 5.010 |
| Líneas de `components/Peritia.jsx` | 4.413 (88 % del total) |
| Dependencias de producción | 4 |
| Dependencias de desarrollo | 0 |
| Endpoints propios | 3 |
| Llamadas a la IA (puntos de invocación) | 9 |
| Tablas de base de datos | 2 (+ 1 bucket de Storage) |
| Migraciones versionadas | 2 |
| Pruebas automatizadas | 0 |
| Configuración de integración continua | ninguna |

Estado funcional: **la aplicación está desplegada y funcionando en producción**.
El flujo completo (login → subida de PDFs → extracción → editor → guardado →
exportación) opera con casos reales, y las fórmulas de cálculo están validadas
contra dos casos oráculo (463,59 € y 1.291,47 €) registrados en `CONTEXT.md`.

---

## 2. Tecnologías

### 2.1. Declaradas en `package.json`

| Tecnología | Versión | Papel |
|---|---|---|
| `next` | 14.2.3 | Framework web y runtime serverless (Pages Router) |
| `react` | 18.3.1 | Biblioteca de interfaz |
| `react-dom` | 18.3.1 | Renderizado de React en navegador |
| `lucide-react` | 0.383.0 | Iconografía |

No hay `devDependencies`. No hay TypeScript, ni linter, ni formateador, ni
ejecutor de pruebas, ni gestor de estado, ni cliente HTTP, ni biblioteca de
formularios, ni biblioteca de PDF, ni SDK de Supabase, ni SDK de Anthropic.

### 2.2. Servicios externos consumidos

| Servicio | Uso | Autenticación |
|---|---|---|
| **Anthropic Messages API** | Extracción y redacción (modelo `claude-sonnet-4-6`) | `ANTHROPIC_API_KEY` (servidor) |
| **Supabase Auth** | Registro y login por email/contraseña | `anon key` (navegador) |
| **Supabase PostgREST** | Lectura y escritura de expedientes | JWT de sesión (navegador) |
| **Supabase Storage** | Anexos: fotos y documentos | JWT de sesión (navegador) |
| **Socrata / Dades Obertes Catalunya** | Estaciones y lecturas meteorológicas XEMA | ninguna (datos abiertos) |
| **Nominatim (OpenStreetMap)** | Geocodificación de direcciones | ninguna |
| **Photon (Komoot)** | Geocodificación de respaldo | ninguna |
| **staticmap.openstreetmap.de** | Captura de mapa de situación | ninguna |
| **Sede Electrónica del Catastro** | Referencia catastral, datos del inmueble y cartografía WMS | ninguna |
| **Google Fonts** | Tipografía DM Sans | ninguna |

### 2.3. Infraestructura

- **Hosting:** Vercel (plan hobby), despliegue automático desde GitHub.
- **Ramas:** `main` = producción · `test` = entorno paralelo con base de datos propia.
- **Base de datos:** dos proyectos Supabase independientes (producción y test).
- **Configuración por entorno:** tres variables (`NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`), documentadas en `.env.example`.

---

## 3. Módulos

Descripción resumida. El detalle de responsabilidades y dependencias está en
`MODULES.md`.

| Módulo | Ubicación | Líneas | Qué es |
|---|---|---|---|
| Aplicación completa | `components/Peritia.jsx` | 4.413 | Datos maestros, motor de cálculo, cliente de Supabase, ~40 componentes de interfaz, plantillas de exportación |
| Envoltorio de páginas | `pages/_app.js` | 12 | Etiqueta `viewport` global |
| Página raíz | `pages/index.js` | 7 | Carga dinámica del componente con `ssr:false` |
| Proxy de IA | `pages/api/claude.js` | 57 | Intermediario hacia la API de Anthropic |
| Proxy meteorológico | `pages/api/meteocat.js` | 239 | Datos XEMA + captura de mapa |
| Proxy catastral | `pages/api/catastro.js` | 143 | Catastro + captura de cartografía |
| Esquema de base de datos | `supabase/migrations/` | 139 | Dos migraciones SQL idempotentes |

### 3.1. Composición interna de `components/Peritia.jsx`

| Bloque | Líneas | Contenido |
|---|---|---|
| Paleta de color | 10–21 | Constante `C` con 20 colores |
| Datos maestros | 23–156 | `BAREMO` (47 partidas), `TABLAS_ARQ` (6 provincias × 65 tipologías × 3 calidades), `ARQ_N2`/`ARQ_N3`, `PROVINCIAS`, `COMPANIAS`, `TIPOS_USO`, `TIPOS_GARANTIA`, `SECCIONES` |
| Utilidades | 158–195 | Formateo de números, `callClaude`, normalización de texto y de importes |
| Cliente Supabase | 198–239 | `SB_URL`/`SB_KEY`, `ES_TEST`, `sbAuth`, `sbDb` |
| Motor de cálculo | 241–304 | `calcPartida`, `getPartidas`, `calcReglas`, `sumAjustado`, `calcIndemnizacion`, `fraseIndemn` |
| Interpretación de IA | 306–324 | `parseJSON`, `iaError` |
| Meteorología | 326–404 | Detección de siniestro atmosférico, umbrales, tabla React y bloque HTML |
| Emparejado de baremo | 406–449 | `getRiesgoIA`, `matchBaremo` |
| Estilos globales | 451–489 | Cadena CSS y `@media` |
| Componentes base | 491–684 | `Inp`, `Sel`, `Txt`, `Btn`, `Card`, `ContextBar`, `ResultTable`… |
| Acordeón y semáforo | 686–779 | `Block` y las 6 funciones de estado por sección |
| Entrada por voz | 781–829 | `VoiceBox` (Web Speech API) |
| Login | 862–954 | `LoginScreen` |
| Dashboard | 956–1290 | Tabla filtrable, tarjetas móviles, filtros |
| Alta de expediente | 1291–1616 | `DropZone`, `UploadEncargo` (extracción de encargo y póliza) |
| Vista previa del informe | 1617–1920 | `SecInforme` |
| Secciones del editor | 1921–3311 | Sec1, Sec2, Sec3, Sec4, Anexos |
| Exportación | 3312–3873 | `buildWordHTML`, `exportPDF`, `ExportModal` |
| Datos del encargo | 3874–3989 | `SecEncargo` |
| Editor | 3990–4270 | `ReportEditor`: navegación, semáforo, panel de pendientes |
| Raíz | 4271–4413 | `TestBadge` y `App`: sesión, carga, guardado, borrado |

---

## 4. Estado

| Área | Estado | Observación |
|---|---|---|
| Autenticación | Funcional | Sin persistencia de sesión ni refresco de token (ver DT-03) |
| Alta de expediente por PDF | Funcional | Validado con casos reales |
| Extracción de encargo | Funcional | |
| Extracción de póliza | Funcional | Orientada a pólizas AXA (ver DT-05) |
| Sección 1 — Verificación del riesgo | Funcional | Consulta catastral automática |
| Sección 2 — Causas | Funcional | Verificación meteorológica solo en Catalunya |
| Sección 3 — Valoración | Funcional | Cálculos validados contra casos oráculo |
| Sección 4 — Cobertura e indemnización | Funcional | 7 garantías |
| Anexos | Funcional | Storage con bucket público (ver DT-11) |
| Vista previa del informe | Funcional con discrepancia | Calcula el infraseguro distinto que el motor (ver DT-08) |
| Exportación a PDF | Funcional | Impresión del navegador desde un `iframe` oculto |
| Exportación a Word | Funcional | HTML servido como `application/msword` |
| Guardado automático | Funcional | Debounce de 5 s, un reintento |
| Entorno de test | Funcional en código | Depende de variables aún no configuradas en Vercel (ver DT-02) |
| Trazabilidad de la IA | **No existe** | Ver sección 8 |
| Pruebas automatizadas | **No existen** | |
| Integración continua | **No existe** | |
| OCR | **No existe como módulo** | Ver sección 6 |

---

## 5. Ubicación

Rutas exactas de las piezas que más se buscan:

| Qué | Dónde |
|---|---|
| Baremo de partidas (47) | `components/Peritia.jsx:28-84` |
| Porcentaje de costes indirectos (8 %) | `components/Peritia.jsx:86` |
| Módulos de arquitectura por provincia | `components/Peritia.jsx:89-96` |
| Factores de arquitectura (1,486 / 1,618 / 1,366) | `components/Peritia.jsx:126-131` |
| Lista de provincias | `components/Peritia.jsx:135-140` |
| Lista de compañías (14) | `components/Peritia.jsx:141` |
| Normalización de "AXA" | `components/Peritia.jsx:144` |
| Credenciales de producción incrustadas | `components/Peritia.jsx:205-206` |
| Selección de base de datos por entorno | `components/Peritia.jsx:208-214` |
| Motor de cálculo | `components/Peritia.jsx:241-304` |
| Prompt de extracción de encargo | `components/Peritia.jsx:1336-1363` |
| Prompt de extracción de póliza | `components/Peritia.jsx:1389` |
| Prompt de generación de tabla desde baremo | `components/Peritia.jsx:2486-2496` |
| Plantilla de Word | `components/Peritia.jsx:3330-3541` |
| Plantilla de PDF | `components/Peritia.jsx:3580-3801` |
| Guardado en Supabase | `components/Peritia.jsx:4343-4362` |

---

## 6. Dependencias

Detalle completo en `DEPENDENCIES.md`. Resumen de lo relevante para la
arquitectura:

- **Dependencias de código: cuatro.** El proyecto es deliberadamente austero. No
  usa el SDK oficial de Supabase ni el de Anthropic: habla con ambos por `fetch`
  contra sus APIs REST.
- **Dependencias de servicio: diez**, de las cuales **siete son servicios
  públicos gratuitos sin contrato ni clave** (Nominatim, Photon, Socrata,
  staticmap.openstreetmap.de, Catastro, Google Fonts). No hay acuerdo de nivel de
  servicio con ninguno, ni control de límites de uso, ni almacenamiento en caché
  persistente de sus respuestas.
- **Dependencia funcional de Anthropic:** las nueve capacidades de IA usan el
  mismo modelo (`claude-sonnet-4-6`) a través del mismo proxy. No hay alternativa
  ni degradación si el servicio no responde.
- **Ausencia de OCR:** no hay ningún módulo de reconocimiento óptico. Los PDFs se
  envían en base64 a la API de Anthropic, que los interpreta de forma nativa
  (cabecera `anthropic-beta: pdfs-2024-09-25`). El comportamiento con un PDF
  escaneado depende enteramente del proveedor de IA y no está controlado ni
  medido por la aplicación.

---

## 7. Problemas detectados

Cada problema tiene ficha completa en `TECHNICAL_DEBT.md`. Aquí solo el
enunciado y la referencia.

| Ref. | Problema | Gravedad |
|---|---|---|
| DT-01 | Toda la aplicación en un único archivo de 4.413 líneas | Alta |
| DT-02 | URL y clave de producción incrustadas como respaldo: un despliegue mal configurado escribe en la base de datos real | Alta |
| DT-03 | La sesión no persiste y el token no se refresca: recargar la página cierra la sesión y un token caducado provoca fallos de guardado silenciosos | Alta |
| DT-04 | El endpoint `/api/claude` no exige autenticación ni limita el uso | Alta |
| DT-05 | Lógica específica de AXA incrustada en el código y en los prompts | Alta |
| DT-06 | Conocimiento del dominio incrustado como constantes de código | Alta |
| DT-07 | El informe se genera tres veces con tres implementaciones distintas | Alta |
| DT-08 | La vista previa calcula el infraseguro con reglas distintas al motor | Alta |
| DT-09 | Ninguna respuesta de IA se valida contra un esquema | Media |
| DT-10 | Cero pruebas automatizadas y cero integración continua | Alta |
| DT-11 | El bucket de anexos es público: fotos y documentos personales legibles por cualquiera con la URL | Alta |
| DT-12 | La IA no deja rastro: ni versión de prompt, ni versión de modelo, ni origen, ni confianza | Alta |
| DT-13 | Las facturas adjuntadas en Sección 3 nunca se suben: se pierden al recargar | Media |
| DT-14 | Los errores de negocio de los proxys se devuelven como HTTP 200 | Media |
| DT-15 | El contador de tokens y coste no se persiste | Baja |
| DT-16 | Precios del modelo y conversión de divisa incrustados en la interfaz | Baja |
| DT-17 | Código duplicado entre los dos proxys y dentro del componente | Media |
| DT-18 | Errores mostrados con `alert()` del navegador | Baja |
| DT-19 | Dos formas distintas de interpretar importes (`parseCap` y `parseFloat`) | Media |
| DT-20 | `reactStrictMode` desactivado | Baja |
| DT-21 | La documentación del repositorio contradice al código | Media |
| DT-22 | Sin límite de tamaño en los PDFs de encargo y póliza | Baja |
| DT-23 | Sin política documentada de tratamiento y retención de datos personales | Alta |

---

## 8. Código provisional

Elementos que funcionan pero que están escritos como solución temporal, con la
evidencia que lo indica:

1. **Respaldo a producción en la selección de base de datos**
   (`components/Peritia.jsx:208-209`). El propio comentario del código lo explica:
   *"Si no hay variables definidas se cae a producción, que es el comportamiento
   que había antes de separarlas."* Es un puente deliberado de la sesión 22 para
   no romper `main`, no un diseño final.

2. **`calcRegla`, marcada como compatibilidad**
   (`components/Peritia.jsx:281-282`). El comentario dice literalmente
   *"Compat: regla del continente (callers antiguos)"*. Es un envoltorio de
   `calcReglas` que sobrevive por compatibilidad.

3. **Bucket de Storage público por conveniencia de exportación**
   (`supabase/migrations/20260719120000_anexos_storage_bucket.sql:23-24`). El
   comentario justifica la lectura pública: *"necesaria para que los exports a PDF
   y Word puedan cargar las imágenes sin sesión"*. Es una decisión de
   implementación que resuelve un problema técnico creando uno de privacidad.

4. **Límites de tokens ajustados a mano tras fallos observados**
   (`components/Peritia.jsx:1390-1393` y `2497-2498`). Los comentarios documentan
   que 8.000 y 4.000 se eligieron porque *"con el límite anterior una tabla larga
   se cortaba a medias y el JSON quedaba inválido"*. Son números empíricos, sin
   control de truncamiento ni reintento.

5. **Estado "error" del semáforo previsto pero nunca producido**
   (`components/Peritia.jsx:768-771`). El comentario lo reconoce: *"'error' no lo
   produce hoy ningún bloque real — no hay validación de campos inválidos en la
   app"*. Es un hueco preparado para una validación que no existe.

6. **Retardo artificial al adjuntar la póliza**
   (`components/Peritia.jsx:1329`): `await new Promise(r=>setTimeout(r,300))`
   antes de fijar el archivo. Es un retardo cosmético para que se vea el
   indicador de carga.

7. **`TODO` explícito en el código**
   (`components/Peritia.jsx:1266`): *"TODO: definir texto eyebrow (drawer de
   filtros móvil, sin contexto de página claro para el eyebrow)"*. Es el único
   marcador `TODO` real del repositorio.

8. **Corrección del modelo por número de versión**
   (`pages/api/claude.js:20`): `if (!body.model || body.model.includes('20250514'))`.
   Reescribe el modelo si detecta una fecha concreta de una versión antigua. Es un
   parche de migración que quedó fijo.

---

## 9. Duplicaciones

| # | Qué está duplicado | Dónde | Tamaño aproximado |
|---|---|---|---|
| 1 | **Generación del informe completo**: tres implementaciones independientes de la misma estructura (cabecera, secciones 1–4, tablas de valoración, anexos) | `SecInforme` (`1617-1920`), `buildWordHTML` (`3330-3541`), `exportPDF` (`3580-3801`) | ~730 líneas |
| 2 | Frase legal de cierre ("La valoración económica sugerida… queda supeditada en todo caso a criterio de la Compañía…") | `3463` y `3701` | 2 copias literales |
| 3 | Función `geocodificar` (Nominatim + respaldo Photon) | `pages/api/meteocat.js:85-101` y `pages/api/catastro.js:43-56` | 2 copias casi idénticas |
| 4 | Función `fetchJSON` con `AbortController` y tiempo de espera | `pages/api/meteocat.js:27-35` y `pages/api/catastro.js:27-35` | 2 copias |
| 5 | Función `toB64` (archivo → base64) | `components/Peritia.jsx:1327` y `2537` | 2 copias |
| 6 | Captura de imagen externa a `data:` URI (`AbortController`, comprobación de `content-type`, `Buffer.from`) | `meteocat.js:47-64` (`capturaMapa`) y `catastro.js:85-100` (`capturaWMS`) | 2 copias estructurales |
| 7 | Formateo de importes: `fmt` (componente) y `fmtPDF` (exportación) son la misma implementación | `components/Peritia.jsx:159` y `3314` | 2 copias |
| 8 | Cálculo del infraseguro y de la regla proporcional | `calcReglas` (`263-280`), `Sec1` (`2000-2003`) y `SecInforme` (`1621-1624`) | 3 implementaciones, **no equivalentes** (ver DT-08) |
| 9 | Comprobación de "el adjunto es un PDF" | `esPdfItem` (`3315`), `isPDF` en `SecAnexos` (`3183`) y la expresión en `buildWordHTML` (`3332`) | 3 copias |
| 10 | Bloque de "todos los capitales en póliza" en la interfaz | `1595-1596` y `3954-3955` | 2 copias |

---

## 10. TODOs encontrados

Búsqueda exhaustiva de marcadores (`TODO`, `FIXME`, `HACK`, `XXX`, `WORKAROUND`)
sobre los 6 archivos de código:

| Archivo | Línea | Marcador | Texto |
|---|---|---|---|
| `components/Peritia.jsx` | 1266 | `TODO` | *"definir texto eyebrow (drawer de filtros móvil, sin contexto de página claro para el eyebrow)"* |

**Es el único marcador del repositorio.** No hay ningún `FIXME`, `HACK`, `XXX` ni
`WORKAROUND` en todo el código.

Esto no significa que no haya trabajo pendiente: significa que el trabajo
pendiente **no está marcado en el código**, sino narrado en `CONTEXT.md`. De su
sección "Próximos pasos pendientes" salen los siguientes puntos abiertos:

| Origen | Punto abierto |
|---|---|
| `CONTEXT.md` (auditoría sesión 6, punto 5) | Dividir `Peritia.jsx` en módulos por sección — **diferido explícitamente por Pol** en la sesión 21 |
| `CONTEXT.md` (auditoría sesión 6) | Validar respuestas de IA con esquema — diferido junto al anterior |
| `CONTEXT.md` (sesión 22) | Configurar en Vercel las variables del proyecto de test en el ámbito *Preview* — **paso manual pendiente de Pol** |
| `CONTEXT.md` (sesión 12) | Decidir el papel de la rama `staging` — obsoleto: la rama ya no existe |
| `CONTEXT.md` (opcional) | Integrar AEMET para cobertura meteorológica fuera de Catalunya |
| `CONTEXT.md` (opcional) | Obtener token de aplicación de Socrata si se alcanzan límites de peticiones |
| `CONTEXT.md` (opcional) | Segundo proyecto Vercel con URL fija para el entorno de test |
| `CONTEXT.md` (Fase 2) | Multi-compañía: baremos propios por aseguradora |
| `CONTEXT.md` (Fase 2) | Refinamiento de prompts con casos reales; panel de administración; métricas de uso |
| `CONTEXT.md` (Fase 3–4) | Facturación, multi-usuario por gabinete, integración con plataformas de encargos, API para aseguradoras, valoración automática de fotos |

---

## 11. Observaciones sobre la relación entre documentación y código

La regla del proyecto es que **la documentación tiene prioridad sobre el código**.
Durante esta auditoría se han detectado tres puntos en los que ambos se
contradicen. Se dejan registrados sin corregir ninguno de los dos lados, porque
resolverlos exige modificar archivos existentes.

1. **`CLAUDE.md` afirma que las credenciales de Supabase ya no están en el
   código**: *"desde la sesión 22, ni siquiera la URL/key de Supabase están
   escritas en `Peritia.jsx`"*. El código sí las contiene, como constantes de
   respaldo (`components/Peritia.jsx:205-206`). Lo que cambió en la sesión 22 es
   que dejaron de ser el **único** valor posible, no que desaparecieran.

2. **`CONTEXT.md` declara 4.230 líneas** en `Peritia.jsx`; el archivo tiene
   **4.413**.

3. **`CONTEXT.md` declara las constantes** `SB_URL`/`SB_KEY` con el valor
   literal de producción; hoy son variables derivadas del entorno
   (`SB_URL_PROD`/`SB_KEY_PROD` son los nombres reales de las constantes).

Registrado como DT-21.

---

## 12. Lo que esta auditoría NO ha podido determinar

Preguntas cuya respuesta no está en el código ni en la documentación del
repositorio. Se enumeran aquí y se desarrollan en `OPEN_QUESTIONS.md`:
el origen y la cadencia de actualización del baremo y de los módulos de
arquitectura, el criterio de negocio detrás de varias constantes numéricas, la
política de retención de datos personales, el alcance real multi-compañía en
producción, y si la publicidad del bucket de anexos es una decisión consciente.

# DEPENDENCIES.md

> Inventario completo de dependencias del proyecto: de código, de servicio y de
> infraestructura.
>
> **Fecha:** 1 de agosto de 2026
> **Fuentes:** `package.json`, `package-lock.json` (v3), y las llamadas de red
> verificadas en el código.

---

## 1. Resumen

| Categoría | Cantidad |
|---|---|
| Dependencias directas de producción | 4 |
| Dependencias de desarrollo | 0 |
| Paquetes totales en el árbol resuelto | 30 |
| Servicios externos consumidos en tiempo de ejecución | 10 |
| Servicios de los que se depende **sin contrato ni clave** | 7 |

El proyecto es deliberadamente austero en dependencias de código y, en cambio,
**muy dependiente de servicios externos gratuitos**. Ese desequilibrio es el
hallazgo principal de este inventario.

---

## 2. Dependencias directas de producción

Declaradas en `package.json`:

| Paquete | Versión fijada | Para qué se usa | Criticidad |
|---|---|---|---|
| `next` | `14.2.3` | Framework web, enrutado y runtime serverless de los 3 endpoints | Crítica |
| `react` | `18.3.1` | Biblioteca de interfaz | Crítica |
| `react-dom` | `18.3.1` | Renderizado en navegador | Crítica |
| `lucide-react` | `0.383.0` | Iconos de la interfaz (~25 iconos importados) | Media |

Las cuatro versiones están **fijadas exactamente** (sin `^` ni `~`): una
instalación nueva reproduce siempre las mismas versiones.

### 2.1. Dependencias de desarrollo

**Ninguna.** `package.json` no declara bloque `devDependencies`.

Consecuencia directa: no hay ejecutor de pruebas, ni linter, ni formateador, ni
comprobación de tipos. Los tres únicos scripts disponibles son `dev`, `build` y
`start`. **No existe `npm test`.**

---

## 3. Árbol resuelto completo

Los 30 paquetes del `package-lock.json`, con su origen:

### 3.1. Núcleo de React

| Paquete | Versión | Origen |
|---|---|---|
| `react` | 18.3.1 | directa |
| `react-dom` | 18.3.1 | directa |
| `scheduler` | 0.23.2 | de `react-dom` |
| `loose-envify` | 1.4.0 | de `react` |
| `js-tokens` | 4.0.0 | de `loose-envify` |

### 3.2. Next.js y su cadena

| Paquete | Versión | Origen |
|---|---|---|
| `next` | 14.2.3 | directa |
| `@next/env` | 14.2.3 | de `next` |
| `@swc/helpers` | 0.5.5 | de `next` |
| `@swc/counter` | 0.1.3 | de `@swc/helpers` |
| `tslib` | 2.8.1 | de `@swc/helpers` |
| `styled-jsx` | 5.1.1 | de `next` |
| `postcss` | 8.4.31 | de `next` |
| `nanoid` | 3.3.12 | de `postcss` |
| `picocolors` | 1.1.1 | de `postcss` |
| `source-map-js` | 1.2.1 | de `postcss` |
| `caniuse-lite` | 1.0.30001799 | de `next` |
| `busboy` | 1.6.0 | de `next` |
| `streamsearch` | 1.1.0 | de `busboy` |
| `graceful-fs` | 4.2.11 | de `next` |
| `client-only` | 0.0.1 | de `next` |

### 3.3. Binarios del compilador SWC (10 paquetes)

`@next/swc-darwin-arm64`, `@next/swc-darwin-x64`, `@next/swc-linux-arm64-gnu`,
`@next/swc-linux-arm64-musl`, `@next/swc-linux-x64-gnu`, `@next/swc-linux-x64-musl`,
`@next/swc-win32-arm64-msvc`, `@next/swc-win32-ia32-msvc`, `@next/swc-win32-x64-msvc`
— todos en `14.2.3`.

Son variantes por sistema operativo y arquitectura del compilador de Next.js. En
cada instalación solo se descarga la que corresponde a la máquina.

### 3.4. Iconografía

| Paquete | Versión | Origen |
|---|---|---|
| `lucide-react` | 0.383.0 | directa |

---

## 4. Servicios externos (dependencias de ejecución)

Lo que la aplicación necesita que esté vivo para funcionar. Ninguno de estos
aparece en `package.json`, pero todos son dependencias reales.

### 4.1. Con contrato y credenciales

| Servicio | Punto de entrada | Credencial | Dónde se usa | Si falla |
|---|---|---|---|---|
| **Anthropic Messages API** | `api.anthropic.com/v1/messages` | `ANTHROPIC_API_KEY` (solo servidor) | `pages/api/claude.js:36` | Se pierden las 9 capacidades de IA. El resto de la aplicación sigue funcionando en modo manual |
| **Supabase Auth** | `{SB_URL}/auth/v1/` | `anon key` (navegador) | `Peritia.jsx:217` | Nadie puede entrar |
| **Supabase PostgREST** | `{SB_URL}/rest/v1/` | JWT de sesión | `Peritia.jsx:228` | No se cargan ni se guardan expedientes |
| **Supabase Storage** | `{SB_URL}/storage/v1/` | JWT de sesión | `Peritia.jsx:3155, 3202, 3223` | No se pueden subir ni borrar anexos |

### 4.2. Sin contrato, sin clave, sin acuerdo de servicio

**Estos siete servicios se consumen de forma anónima y gratuita.** No hay
límite contratado, ni soporte, ni garantía de disponibilidad, ni caché
persistente de sus respuestas.

| Servicio | Punto de entrada | Para qué | Si falla |
|---|---|---|---|
| **Socrata — Dades Obertes Catalunya** | `analisi.transparenciacatalunya.cat/resource/yqwd-vj5e` (estaciones) y `.../nzvn-apee` (lecturas) | Datos meteorológicos XEMA | La verificación meteorológica de Sección 2 deja de funcionar |
| **Nominatim (OpenStreetMap)** | `nominatim.openstreetmap.org/search` | Geocodificación de direcciones | Se pasa a Photon |
| **Photon (Komoot)** | `photon.komoot.io/api/` | Geocodificación de respaldo | Sin geocodificación: fallan Catastro y meteorología |
| **staticmap.openstreetmap.de** | `/staticmap.php` | Mapa de situación (estación + riesgo) | La consulta meteorológica sigue funcionando; solo se pierde la imagen |
| **Catastro — OVCCoordenadas** | `ovc.catastro.meh.es/.../Consulta_RCCOOR` | Coordenadas → referencia catastral | Sección 1 sin referencia catastral automática |
| **Catastro — OVCCallejero** | `ovc.catastro.meh.es/.../Consulta_DNPRC` | Referencia → superficie, año, uso | Sección 1 sin datos del inmueble |
| **Catastro — WMS Cartografía** | `ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx` | Imagen de la parcela | Sin captura de cartografía |
| **Google Fonts** | `fonts.googleapis.com/css2?family=DM+Sans` | Tipografía DM Sans | La interfaz cae a la tipografía del sistema |

*(Google Fonts se cuenta aparte por ser puramente estético; los siete críticos
son los anteriores.)*

**Nota registrada en `CONTEXT.md`:** existe un punto abierto sobre obtener un
*app token* gratuito de Socrata si se alcanzan los límites de peticiones
anónimas. Hoy no se ha solicitado.

### 4.3. Mitigaciones existentes

El código no ignora la fragilidad de estos servicios. Lo que ya hay:

- **Tiempos de espera explícitos** en todas las llamadas externas de los proxys:
  12 s para datos, 15 s para capturas de imagen (`AbortController`).
- **Respaldo de geocodificación**: si Nominatim no responde, se prueba Photon
  (`meteocat.js:85-101`, `catastro.js:43-56`).
- **Caché en memoria de estaciones XEMA**, 6 horas (`meteocat.js:103-119`).
  Vive dentro de la instancia de la función serverless: se pierde cuando Vercel
  la recicla, y no se comparte entre instancias.
- **Degradación sin bloqueo**: si falla la captura del mapa o de la cartografía,
  la consulta principal continúa y devuelve `imagen: null`.
- **Prueba de varias estaciones**: se consultan las 6 más cercanas hasta
  encontrar una con lecturas ese día (`meteocat.js:212-215`).
- **Un reintento en el guardado** contra Supabase, con 2 s de espera
  (`Peritia.jsx:4353-4356`).

---

## 5. Dependencias de infraestructura

| Elemento | Proveedor | Plan | Observación |
|---|---|---|---|
| Hosting y funciones serverless | Vercel | Hobby | Despliegue automático desde GitHub |
| Base de datos de producción | Supabase | — | Proyecto `yrulaaxdusvmzohugmnc` |
| Base de datos de test | Supabase | Gratuito | Proyecto `yvconlqtetxvyzxkhxib` |
| Repositorio | GitHub | — | `poool1717/peritia` |

### 5.1. Límites de plataforma relevantes

Configurados explícitamente en el código:

| Límite | Valor | Dónde |
|---|---|---|
| Duración máxima de `/api/claude` | 60 s | `pages/api/claude.js:6` |
| Duración máxima de `/api/meteocat` y `/api/catastro` | 30 s | ambos, línea 10-11 |
| Tamaño de cuerpo de `/api/claude` | 20 MB | `pages/api/claude.js:3` |
| Tamaño de cuerpo de los otros dos | 1 MB | ambos |
| Tamaño máximo por anexo | 10 MB | `Peritia.jsx:3147` |
| Tokens de salida por defecto | 1.500 | `pages/api/claude.js:21` |

---

## 6. Variables de entorno

Documentadas en `.env.example`:

| Variable | Ámbito | Uso | Si falta |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Servidor | Autenticación con Anthropic | `/api/claude` responde 500 con mensaje explícito |
| `NEXT_PUBLIC_SUPABASE_URL` | Navegador | Dirección de la base de datos | **Cae a la de producción** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Navegador | Clave pública de Supabase | **Cae a la de producción** |

⚠ El respaldo a producción de las dos últimas es el riesgo DT-02 de
`TECHNICAL_DEBT.md`: un despliegue sin variables configuradas escribe en la base
de datos real sin avisar de nada. Sigue habiendo un punto abierto en `CONTEXT.md`
para configurarlas en Vercel en el ámbito *Preview*.

⚠ Las variables con prefijo `NEXT_PUBLIC_` se resuelven **en tiempo de
compilación**, no de ejecución: cambiarlas en Vercel exige volver a desplegar
para que surtan efecto. El código lo documenta en `Peritia.jsx:203-204`.

---

## 7. Observaciones de arquitectura

Registradas sin proponer cambio:

1. **No se usa el SDK oficial de Supabase** (`@supabase/supabase-js`). El código
   habla con la API REST por `fetch` (`sbAuth`, `sbDb`, y llamadas directas a
   Storage). Consecuencia: no hay refresco automático de token ni persistencia de
   sesión, que el SDK aportaría de serie (ver `TECHNICAL_DEBT.md`, DT-03).

2. **No se usa el SDK oficial de Anthropic**. El proxy construye la petición HTTP
   a mano. Consecuencia: no hay reintentos, ni control de límite de peticiones, ni
   respuesta en flujo (*streaming*), ni cálculo de tokens previo al envío.

3. **No hay biblioteca de generación de PDF.** La exportación se apoya en la
   impresión del navegador desde un `iframe` oculto (`Peritia.jsx:3774-3796`).
   La numeración de páginas se logra con CSS puro (`@page`), decisión ya
   registrada en `CONTEXT.md` (sesión 17).

4. **La exportación a Word no usa ninguna biblioteca**: se genera HTML y se
   entrega con tipo `application/msword` (`Peritia.jsx:3572`).

5. **Cuatro dependencias de código es poco riesgo de cadena de suministro**, y es
   una virtud del proyecto. El riesgo se ha desplazado a los servicios externos
   anónimos, que no aparecen en ningún inventario de dependencias convencional.

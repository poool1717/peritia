# API_INVENTORY.md

> Inventario de todos los endpoints del sistema: los tres propios y todos los
> externos que se consumen.
>
> **Fecha:** 1 de agosto de 2026
> **Método:** lectura directa de `pages/api/*.js` y de todas las llamadas `fetch`
> de `components/Peritia.jsx`.

---

## 1. Resumen

| Tipo | Cantidad |
|---|---|
| Endpoints propios (`pages/api/`) | 3 |
| Endpoints externos llamados desde el servidor | 7 |
| Endpoints externos llamados **directamente desde el navegador** | 5 |

**Observación estructural:** el navegador habla directamente con Supabase (Auth,
datos y Storage) sin pasar por ningún endpoint propio. Los tres endpoints
existentes son proxys hacia servicios de terceros, no una API de aplicación.

---

## 2. Endpoints propios

### 2.1. `POST /api/claude`

**Archivo:** `pages/api/claude.js`
**Propósito:** proxy hacia la API de mensajes de Anthropic, para que la clave
nunca llegue al navegador.

| Configuración | Valor |
|---|---|
| Método permitido | `POST` (cualquier otro → `405`) |
| Tamaño máximo de cuerpo | 20 MB |
| Límite de respuesta | desactivado |
| Duración máxima | 60 s |

**Entrada:** cuerpo compatible con la API de Anthropic
(`{model, max_tokens, system, messages}`).

**Transformaciones que aplica:**

| Regla | Línea |
|---|---|
| Si falta `model`, o contiene `20250514`, lo fuerza a `claude-sonnet-4-6` | 20 |
| Si falta `max_tokens`, lo fija en `1500` | 21 |
| Si falta `messages` o está vacío → `400` | 22-24 |
| Si el cuerpo serializado contiene `"application/pdf"`, añade `anthropic-beta: pdfs-2024-09-25` | 26, 34 |
| Añade `x-api-key` y `anthropic-version: 2023-06-01` | 30-32 |

**Salidas:**

| Código | Cuándo | Cuerpo |
|---|---|---|
| `200` | Éxito | Respuesta íntegra de Anthropic |
| `400` | Falta `messages` | `{error:{message}}` |
| `405` | Método distinto de POST | `{error}` |
| `500` | Falta `ANTHROPIC_API_KEY` | `{error:{type:'config_error'}}` |
| `500` | Excepción no controlada | `{error:{type:'proxy_error', message}}` |
| *(propagado)* | Error de Anthropic | Código y cuerpo originales |

**Registro:** una línea por petición con modelo, `max_tokens` y si lleva PDF; y
otra al terminar con los tokens consumidos. No registra contenido.

⚠ **No exige autenticación ni limita el número de peticiones.** Cualquiera que
conozca la URL puede consumir la clave de Anthropic del proyecto. Ver
`TECHNICAL_DEBT.md`, DT-04.

⚠ La detección de PDF se hace serializando **todo el cuerpo** a texto y buscando
una cadena (`JSON.stringify(body).includes(...)`). Con adjuntos de varios MB esto
duplica el uso de memoria en cada petición.

---

### 2.2. `POST /api/meteocat`

**Archivo:** `pages/api/meteocat.js`
**Propósito:** dado un lugar y una fecha, devolver el resumen meteorológico
oficial de ese día en la estación automática XEMA más cercana, más una captura de
mapa de situación.

| Configuración | Valor |
|---|---|
| Método permitido | `POST` (otro → `405`) |
| Tamaño máximo de cuerpo | 1 MB |
| Duración máxima | 30 s |

**Entrada:** `{direccion, municipio, provincia, cp, fecha}` — `fecha` en formato
`dd/mm/aaaa`.

**Flujo interno:**

1. Interpreta la fecha (`parseFecha`) → si no es válida, responde con `ok:false`.
2. Comprueba que la ubicación esté en Catalunya (`esCatalunya`: códigos postales
   `08`, `17`, `25`, `43`, o nombre de provincia catalana). Fuera de ese ámbito,
   responde con `ok:false` y un mensaje que pide adjuntar el informe manualmente.
3. Geocodifica la dirección con hasta tres consultas de precisión decreciente,
   contra Nominatim y, si falla, Photon.
4. Si no logra geocodificar, intenta centrar en una estación del mismo municipio.
5. Descarga la lista de estaciones (caché en memoria, 6 h) y las ordena por
   distancia con la fórmula del semiverseno.
6. Prueba las **6 estaciones más cercanas** hasta encontrar una con lecturas ese
   día (`resumirDia`).
7. Captura un mapa estático con dos marcadores (estación y riesgo), con zoom
   calculado según la distancia.

**Variables XEMA que interpreta:**

| Código | Magnitud | Unidad de origen |
|---|---|---|
| `30` | Velocidad media del viento a 10 m | m/s → km/h |
| `35` | Precipitación | mm (= l/m²) |
| `50` | Racha máxima del viento a 10 m | m/s → km/h |
| `32` | Temperatura | ºC |
| `33` | Humedad relativa | % |

**Salida en caso de éxito:**
`{ok:true, estacio, codiEstacio, municipiEstacio, comarca, distanciaKm, fecha,
rachaMax, rachaHora, vientoMedioMax, precipTotal, precipMaxHoraria, tempMax,
tempMin, humitatMax, tieneVent, tienePrecip, imagen, fuente, consultadoEl}`.

⚠ **Todos los errores de negocio se devuelven con código HTTP `200`** y
`ok:false`. Solo el método incorrecto produce un `405`. Ver DT-14.

⚠ La caché de estaciones vive en una variable de módulo
(`_estacionsCache`): en un entorno serverless es **por instancia**, se pierde al
reciclarse la función y no se comparte entre instancias concurrentes.

---

### 2.3. `POST /api/catastro`

**Archivo:** `pages/api/catastro.js`
**Propósito:** dada una dirección, obtener referencia catastral, datos del
inmueble y una captura de la cartografía catastral.

| Configuración | Valor |
|---|---|
| Método permitido | `POST` (otro → `405`) |
| Tamaño máximo de cuerpo | 1 MB |
| Duración máxima | 30 s |

**Entrada:** `{direccion, municipio, provincia, cp}`. Si faltan `direccion` y
`municipio`, responde con `ok:false`.

**Flujo interno:**

1. Geocodifica (Nominatim → Photon), con dos consultas de precisión decreciente.
2. `Consulta_RCCOOR`: coordenadas (EPSG:4326) → referencia catastral. La respuesta
   es XML y se interpreta con expresiones regulares (`xmlTag`), sin biblioteca.
3. `Consulta_DNPRC`: referencia catastral → superficie construida (`sfc`), año
   (`ant`) y uso (`luso`).
4. `capturaWMS`: imagen PNG de la parcela, recuadro de ±0,0012 grados (~130 m),
   900×650 px, devuelta como `data:` URI en base64.

**Salida en caso de éxito:**
`{ok:true, refCatastral, superficie, anoConstruccion, uso, imagen, fuente}`.

**Comportamiento degradado:** si no hay referencia catastral, intenta devolver al
menos la captura de la cartografía por coordenadas.

**Ámbito:** España peninsular e insular, **excepto País Vasco y Navarra**, que
tienen catastro foral propio y no responden a este servicio. Documentado en el
encabezado del archivo.

⚠ Mismo patrón que `meteocat`: errores de negocio con HTTP `200`.
⚠ El XML se interpreta con expresiones regulares. Funciona con la respuesta
actual del Catastro, pero es frágil ante cualquier cambio de formato.

---

## 3. Endpoints externos llamados desde el servidor

| Servicio | Endpoint | Método | Desde | Autenticación |
|---|---|---|---|---|
| Anthropic | `https://api.anthropic.com/v1/messages` | POST | `claude.js:36` | `x-api-key` |
| Socrata — estaciones | `https://analisi.transparenciacatalunya.cat/resource/yqwd-vj5e.json` | GET | `meteocat.js:106` | ninguna |
| Socrata — lecturas | `https://analisi.transparenciacatalunya.cat/resource/nzvn-apee.json` | GET | `meteocat.js:125` | ninguna |
| Nominatim | `https://nominatim.openstreetmap.org/search` | GET | `meteocat.js:88`, `catastro.js:45` | ninguna |
| Photon | `https://photon.komoot.io/api/` | GET | `meteocat.js:96`, `catastro.js:51` | ninguna |
| Mapa estático OSM | `https://staticmap.openstreetmap.de/staticmap.php` | GET | `meteocat.js:51` | ninguna |
| Catastro — coordenadas | `https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCoordenadas.asmx/Consulta_RCCOOR` | GET | `catastro.js:60` | ninguna |
| Catastro — callejero | `https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.asmx/Consulta_DNPRC` | GET | `catastro.js:73` | ninguna |
| Catastro — WMS | `https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx` | GET | `catastro.js:88` | ninguna |

Nominatim recibe una cabecera `User-Agent: PeritIA/1.0 (informes periciales)`,
como exige su política de uso. En `catastro.js` se envía también en `fetchJSON`.

---

## 4. Endpoints externos llamados **directamente desde el navegador**

Estos no pasan por ningún endpoint propio. Es la parte de la arquitectura sin
backend intermedio.

### 4.1. Supabase Auth

| Operación | Ruta | Desde | Cuerpo |
|---|---|---|---|
| Login | `POST {SB_URL}/auth/v1/token?grant_type=password` | `Peritia.jsx:878` | `{email, password}` |
| Registro | `POST {SB_URL}/auth/v1/signup` | `Peritia.jsx:879` | `{email, password}` |

Ambas a través de `sbAuth` (`Peritia.jsx:216-222`), con cabecera `apikey`.

⚠ La respuesta incluye `access_token` y `refresh_token`; **el código solo usa el
primero y descarta el segundo**. No hay renovación de sesión. Ver DT-03.

### 4.2. Supabase PostgREST

Todas a través de `sbDb` (`Peritia.jsx:224-239`), que exige token de sesión y
añade `Prefer: return=representation`.

| Operación | Ruta | Desde |
|---|---|---|
| Listar expedientes | `GET informes?select=*&order=created_at.desc` | `4312` |
| Crear expediente | `POST informes` | `4327` |
| Actualizar expediente | `PATCH informes?id=eq.{id}` | `4352`, `4355` |
| Borrar expediente | `DELETE informes?id=eq.{id}` | `4399` |

⚠ `sbDb` devuelve `null` tanto si la petición falla como si la respuesta no es
JSON interpretable. Quien llama no puede distinguir "error de red" de "sin
resultados". En `loadCases` (`4313`) un fallo deja la lista vacía sin mensaje de
error.

**Tabla `perfiles`:** existe en el esquema y tiene su política RLS, pero **no se
consulta desde `Peritia.jsx`**. Se rellena sola mediante el trigger
`handle_new_user`. El único dato de perfil que la aplicación maneja es el DNI del
perito, gestionado en `ExportModal` con `onSaveDni`.

### 4.3. Supabase Storage

| Operación | Ruta | Desde |
|---|---|---|
| Subir anexo manual | `POST {SB_URL}/storage/v1/object/anexos/{ruta}` | `3202` |
| Subir captura automática | `POST {SB_URL}/storage/v1/object/anexos/{ruta}` | `3155` |
| Borrar anexo | `DELETE {SB_URL}/storage/v1/object/anexos/{ruta}` | `3223` |
| Leer anexo | `GET {SB_URL}/storage/v1/object/public/anexos/{ruta}` | por URL pública |

**Formato de ruta:**
`{user_id}/{informe_id}/{pestaña}/{timestamp}-{aleatorio}-{nombre_saneado}`

El primer segmento debe coincidir con `auth.uid()` para que las políticas de
inserción y borrado lo permitan.

⚠ **La lectura es pública**: la política `anexos_select_public` concede `SELECT`
al rol `public`. Cualquiera con la URL puede ver fotos del domicilio, facturas y
documentos con datos personales, sin sesión. Ver DT-11.

### 4.4. Google Fonts

`GET https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700`
desde `Peritia.jsx:452`, insertado como `<link rel="stylesheet">` en las cuatro
pantallas raíz.

---

## 5. Lo que no existe

Registrado sin proponer implementación:

| Ausencia | Consecuencia |
|---|---|
| **Versionado de la API** (`/api/v1/…`) | Cualquier cambio de contrato rompe a todos los clientes a la vez |
| **Autenticación en los endpoints propios** | Los tres son abiertos; `/api/claude` gasta dinero real |
| **Limitación de peticiones** | Sin defensa ante abuso ni ante un bucle accidental del cliente |
| **Contratos formales** (OpenAPI o similar) | El contrato solo existe en el código |
| **Códigos de estado coherentes** | `meteocat` y `catastro` devuelven `200` para errores de negocio |
| **Identificador de correlación** | Imposible seguir una operación a través de los registros |
| **Endpoint de salud** | Sin comprobación automática de disponibilidad |
| **API de expedientes propia** | El navegador construye rutas de PostgREST a mano |

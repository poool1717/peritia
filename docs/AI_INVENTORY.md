# AI_INVENTORY.md

> Inventario completo de las capacidades de inteligencia artificial del sistema:
> prompts, modelos, OCR, servicios y flujo.
>
> **Fecha:** 1 de agosto de 2026
> **Método:** localización de las 9 invocaciones de `callClaude` en
> `components/Peritia.jsx` y lectura del proxy `pages/api/claude.js`.

---

## 1. Resumen

| Concepto | Estado actual |
|---|---|
| Proveedor | Anthropic (único) |
| Modelo | `claude-sonnet-4-6` (único, para las 9 capacidades) |
| Puntos de invocación | 9 |
| Prompts versionados | 0 — todos están en línea en el código |
| Servicios de IA separados | 0 — no hay capa de servicios |
| Módulo de OCR | **No existe** |
| Validación de respuestas contra esquema | Ninguna |
| Registro de ejecuciones | Ninguno (solo dos líneas de consola en el proxy) |
| Trazabilidad de párrafos generados | Ninguna |
| Contabilidad de tokens | Agregada por expediente, **no persistida** |

**El sistema no tiene una arquitectura de IA modular.** Tiene un único cliente
genérico (`callClaude`) invocado desde nueve puntos distintos de la interfaz,
cada uno con su prompt escrito allí mismo.

---

## 2. El cliente único

**`callClaude(system, userContent, onTokens, maxTok = 1500)`**
`components/Peritia.jsx:165-179`

```
callClaude → POST /api/claude → api.anthropic.com/v1/messages
```

Qué hace:
1. Envía `{model:'claude-sonnet-4-6', max_tokens, system, messages:[{role:'user', content}]}`.
2. Si la respuesta no es correcta, **no lanza excepción**: devuelve una cadena
   JSON con `{_apiError:true, _status, _msg}`, para que quien llama lo detecte con
   `iaError()`.
3. Si hay éxito, notifica los tokens consumidos por `onTokens` y devuelve la
   concatenación de los bloques de texto.

Qué **no** hace: no reintenta, no aplica límite de peticiones, no valida la
respuesta, no registra la ejecución, no aplica tiempo de espera propio, no
distingue entre tipos de fallo.

---

## 3. Las 9 capacidades de IA

Ordenadas por el momento en que aparecen en el recorrido del perito.

### IA-1 · Extracción de la hoja de encargo
| | |
|---|---|
| **Ubicación** | `Peritia.jsx:1336-1368` (prompt en `1336-1363`) |
| **Cuándo** | Al subir el PDF del encargo, en el alta del expediente |
| **Entrada** | PDF completo en base64 + prompt de instrucciones |
| **Salida esperada** | JSON con 21 campos: compañía, referencia, póliza, ramo, garantía, fechas, lugar, asegurado, NIF, causa, descripción, perito, capitales, franquicia, tipo de encargo, modalidad de visita, cobertura inferida |
| **`max_tokens`** | 4.000 |
| **System prompt** | *"Eres un extractor experto de documentos periciales y de seguros espanoles. Responde SOLO con JSON valido sin markdown."* |
| **Control de error** | Sí: si no hay referencia, asegurado ni compañía, avisa con `alert()` y vuelve a la pantalla de subida |

⚠ El prompt incluye una instrucción específica de AXA: *"En encargos AXA aparece
como Fecha de efecto en la seccion Poliza al final del documento"* (`1359`).

### IA-2 · Extracción de la póliza
| | |
|---|---|
| **Ubicación** | `Peritia.jsx:1389-1398` (prompt en `1389`, una sola línea de ~4.500 caracteres) |
| **Cuándo** | Al subir el PDF de la póliza, si se aporta |
| **Entrada** | PDF completo en base64 + prompt + la cobertura afectada detectada en IA-1 |
| **Salida esperada** | JSON con capitales, tipo de continente, franquicias por garantía (7 códigos), valor a nuevo, depreciación, garantías activas, condiciones especiales, primer riesgo, fecha de efecto, producto, umbrales de viento y lluvia, tipo/uso/ubicación de vivienda, calidad, y el **texto literal** de cada cobertura para continente y contenido |
| **`max_tokens`** | 8.000 |
| **System prompt** | *"Eres un perito de seguros experto en polizas AXA y similares…"* |

⚠ **Es el prompt más complejo y más frágil del sistema.** Está escrito
explícitamente para AXA. El límite de 8.000 tokens se fijó tras observar que
respuestas más largas se cortaban a medias, invalidaban el JSON y hacían que se
descartara la póliza entera en silencio (documentado en `1390-1393`).

⚠ Contiene reglas de negocio de alto impacto redactadas en lenguaje natural
dentro del prompt, no en el código ni en la documentación. Por ejemplo:
*"Para DAGUA, RGEXT, INCEN: usa EDIFICIO PRIMER RIESGO si existe con valor>0. Si
no, usa OBRAS DE REFORMA"* y *"NUNCA sumes los valores, elige UNO solo el mas
relevante"*. Ver `OPEN_QUESTIONS.md`, P-08.

### IA-3 · Estimación de características del inmueble
| | |
|---|---|
| **Ubicación** | `Peritia.jsx:406-425` (`getRiesgoIA`) |
| **Cuándo** | Sección 1, para prerrellenar los datos del riesgo |
| **Entrada** | Texto: asegurado, dirección, municipio, provincia, causa, ramo, descripción y lo extraído de la póliza |
| **Salida esperada** | JSON: tipo de riesgo, tipo y uso de vivienda, ubicación, año de construcción, superficie, referencia catastral, calidad (Básica/Media/Alta) y una frase de justificación |
| **`max_tokens`** | 1.500 (por defecto) |

⚠ **Es la única capacidad que pide a la IA que *estime* datos**, no que los
extraiga. La calidad estimada (`Básica`/`Media`/`Alta`) alimenta directamente el
módulo €/m² y, por tanto, el valor preexistente y la regla proporcional. Un
resultado erróneo se propaga al importe de la indemnización.

### IA-4 · Redacción del texto de Instant Payment (Sección 1)
| | |
|---|---|
| **Ubicación** | `Peritia.jsx:2018-2024` |
| **Cuándo** | Botón "Mejorar" en Sección 1, solo en expedientes Instant Payment |
| **Entrada** | Texto actual + dirección del encargo |
| **Salida** | Texto libre (no JSON) |
| **`max_tokens`** | 1.500 |
| **System prompt** | *"Perito de seguros. Redacta en tercera persona, estilo pericial, conciso. Sin título de apartado."* |

### IA-5 · Redacción del párrafo meteorológico (Sección 2)
| | |
|---|---|
| **Ubicación** | `Peritia.jsx:2252-2265` |
| **Cuándo** | Tras una consulta meteorológica correcta |
| **Entrada** | Los datos medidos por la estación + los umbrales de la póliza + la conclusión ya calculada por el código (`meteoSupera`) |
| **Salida** | Un párrafo de texto |
| **`max_tokens`** | 1.500 |

**Nota positiva de diseño:** la conclusión de si se superan los umbrales **la
calcula el código**, no la IA. A la IA solo se le pide redactarla. Es el único
punto del sistema donde la separación entre decisión y redacción está bien hecha.

### IA-6 · Mejora del texto de causas (Sección 2)
| | |
|---|---|
| **Ubicación** | `Peritia.jsx:2278-2284` |
| **Cuándo** | Botón "Mejorar" sobre lo dictado o escrito por el perito |
| **Entrada** | Texto en bruto + causa y lugar |
| **Salida** | Texto libre |
| **`max_tokens`** | 1.500 |

El resultado se guarda en `textoAI` **sin sobrescribir** `textoRaw`, y con
`aiApplied:false` hasta que el perito lo acepta. El original se conserva.

### IA-7 · Mejora del texto de daños (Sección 3)
| | |
|---|---|
| **Ubicación** | `Peritia.jsx:2469-2475` |
| **Cuándo** | Botón "Mejorar" en la descripción de daños |
| **Entrada** | Texto en bruto + causa y garantía |
| **Salida** | Texto libre |
| **`max_tokens`** | 1.500 |

### IA-8 · Generación de la tabla de valoración desde el baremo
| | |
|---|---|
| **Ubicación** | `Peritia.jsx:2486-2499` |
| **Cuándo** | Botón "Generar tabla" en Sección 3, modo baremo |
| **Entrada** | Descripción de los daños + causa + lugar + **el baremo completo serializado** (47 partidas, ~4.000 caracteres) inyectado en el prompt |
| **Salida esperada** | `{"partidas":[{oficio, desc, uds, garantia, cobertura}]}` |
| **`max_tokens`** | 4.000 |

Post-proceso (`2504-2526`): cada partida devuelta se **vuelve a emparejar** con el
baremo mediante `matchBaremo` (coincidencia exacta sin tildes → contención →
mayoría de palabras significativas). El precio real **siempre sale del baremo del
código**, nunca de la IA. Si una partida no se encuentra, entra a 0 € y se avisa
en pantalla con el número exacto de partidas afectadas.

**Nota positiva:** es la capacidad mejor blindada del sistema. La IA elige *qué*
partidas aplican y *cuántas* unidades; el *precio* nunca es responsabilidad suya.

⚠ La IA sí decide las **unidades** (`uds`), que multiplican directamente al
precio. Esa parte no está blindada.

### IA-9 · Extracción de líneas de facturas y presupuestos
| | |
|---|---|
| **Ubicación** | `Peritia.jsx:2543-2548` |
| **Cuándo** | Botón de extracción en Sección 3, modos factura y presupuesto |
| **Entrada** | Cada PDF adjunto en base64, **uno por llamada, en bucle secuencial** |
| **Salida esperada** | `{"partidas":[{oficio, desc, uds, p, iva, perceptor, cobertura}]}` |
| **`max_tokens`** | 2.000 |

Aquí **el precio sí lo pone la IA**, leído del documento. La depreciación nunca
se aplica automáticamente: la marca el perito a mano (documentado en `2552`).

⚠ El bucle es secuencial y sin límite: cinco facturas son cinco llamadas
encadenadas, cada una con un PDF completo. Con la duración máxima de 60 s del
proxy, un lote grande puede agotar el tiempo.

---

## 4. Tabla comparativa

| # | Capacidad | Tipo | Entrada | Salida | Tokens | Blindada |
|---|---|---|---|---|---|---|
| IA-1 | Extracción de encargo | Extracción | PDF | JSON (21 campos) | 4.000 | Parcial |
| IA-2 | Extracción de póliza | Extracción | PDF | JSON (~20 campos + textos) | 8.000 | No |
| IA-3 | Estimación del riesgo | **Estimación** | Texto | JSON (9 campos) | 1.500 | No |
| IA-4 | Texto Instant Payment | Redacción | Texto | Texto | 1.500 | n/a |
| IA-5 | Párrafo meteorológico | Redacción | Datos medidos | Texto | 1.500 | Sí |
| IA-6 | Mejora de causas | Redacción | Texto | Texto | 1.500 | n/a |
| IA-7 | Mejora de daños | Redacción | Texto | Texto | 1.500 | n/a |
| IA-8 | Tabla desde baremo | Selección | Texto + baremo | JSON | 4.000 | Sí (precio) |
| IA-9 | Líneas de factura | Extracción | PDF | JSON | 2.000 | No |

---

## 5. OCR

**No existe ningún módulo de OCR en el proyecto.**

No hay Tesseract, ni servicio de reconocimiento óptico, ni preprocesado de
imagen, ni extracción de texto de PDF por biblioteca. El repositorio no contiene
ninguna dependencia relacionada.

Lo que hay en su lugar: los PDFs se convierten a base64 en el navegador (`toB64`)
y se envían **enteros** a la API de Anthropic como bloques de tipo `document`. El
proxy detecta la presencia de un PDF y añade la cabecera
`anthropic-beta: pdfs-2024-09-25` (`pages/api/claude.js:26,34`), delegando toda la
lectura del documento en el proveedor de IA.

Consecuencias registradas:

| Consecuencia | Detalle |
|---|---|
| Comportamiento con PDF escaneado | Desconocido y no medido. Depende enteramente de Anthropic |
| Sin control de calidad de lectura | No se sabe si un documento se ha leído bien o mal |
| Sin número de página | No se puede decir de qué página salió un dato |
| Coste | Cada página de PDF consume tokens de entrada en cada llamada |
| Sin caché | Volver a procesar el mismo documento repite todo el coste |
| Sin límite de tamaño en cliente | Solo el límite de 20 MB del proxy (los anexos sí tienen 10 MB) |

---

## 6. Flujo de la IA en un expediente completo

```
1. ALTA
   ├─ PDF encargo  ──▶ IA-1 (extracción)  ──▶ encargo{}
   └─ PDF póliza   ──▶ IA-2 (extracción)  ──▶ encargo{} ampliado
                                                  │
2. SECCIÓN 1 · Verificación del riesgo             ▼
   ├─ /api/catastro (sin IA)  ──▶ ref. catastral, superficie, año, uso
   ├─ IA-3 (estimación)       ──▶ tipo, calidad, superficie estimadas
   └─ IA-4 (redacción, solo Instant Payment)
                                                  │
3. SECCIÓN 2 · Causas                              ▼
   ├─ dictado por voz (Web Speech API, sin IA)
   ├─ IA-6 (mejora del texto)
   └─ /api/meteocat ──▶ datos medidos ──▶ IA-5 (redacción del párrafo)
                                                  │
4. SECCIÓN 3 · Valoración                          ▼
   ├─ IA-7 (mejora del texto de daños)
   ├─ modo baremo    ──▶ IA-8 ──▶ matchBaremo ──▶ partidas con precio del baremo
   └─ modo factura   ──▶ IA-9 ──▶ partidas con precio del documento
                                                  │
5. SECCIÓN 4 · Cobertura                           ▼
   └─ sin IA: se rellena desde lo extraído en IA-2 y de textos fijos
                                                  │
6. INFORME                                         ▼
   └─ sin IA: composición determinista de todo lo anterior
```

**Observación:** las secciones 4 y el informe final no usan IA. Toda la
generación del documento es determinista a partir de los datos ya almacenados.

---

## 7. Trazabilidad

El proyecto exige que **todo párrafo generado sea trazable**, guardando documento
de origen, página, entidades extraídas, confianza, versión del prompt, versión
del modelo y marca temporal.

**Estado actual: no se cumple ninguno de los siete requisitos.**

| Requisito | Estado | Detalle |
|---|---|---|
| Documento de origen | ❌ | Los PDFs del encargo y la póliza **ni siquiera se guardan**: se convierten a base64, se envían y se descartan |
| Página de origen | ❌ | No se pide ni se registra |
| Entidades extraídas | ⚠ Parcial | Los campos extraídos se guardan en `encargo` (JSONB), pero mezclados con los editados a mano, sin distinguir el origen |
| Confianza | ❌ | Ni se pide a la IA ni se registra |
| Versión del prompt | ❌ | Los prompts no tienen versión ni identificador |
| Versión del modelo | ❌ | La respuesta de Anthropic la incluye, pero se descarta |
| Marca temporal | ⚠ Parcial | Solo `informes.updated_at`, a nivel de expediente |

**Consecuencia práctica:** dado un informe exportado, hoy es imposible responder
a "¿de dónde salió esta frase?", "¿qué la generó?" o "¿este dato lo puso la IA o
el perito?".

### 7.1. Registro de ejecuciones

**No existe.** Lo único que se registra son dos líneas de consola en el proxy
(`pages/api/claude.js:27, 50`):

```
[proxy] model=... max_tokens=... hasPDF=...
[proxy] OK tokens=.../...
```

Son registros de Vercel, efímeros, sin correlación con el expediente ni con el
usuario, e imposibles de consultar como datos.

### 7.2. Contabilidad de tokens

`ReportEditor` acumula tokens por expediente en `cData.tokenStats` y estima el
coste (`Peritia.jsx:3997`):

```js
const costEur = ((tokens.i||0)/1e6*3 + (tokens.o||0)/1e6*15) * 1.08;
```

⚠ Los precios (3 y 15 por millón de tokens) y el factor `1.08` están incrustados
en la interfaz, sin explicación del origen del factor (ver `OPEN_QUESTIONS.md`,
P-06).

⚠ **`tokenStats` no se persiste.** El objeto que se guarda en Supabase
(`Peritia.jsx:4345-4350`) incluye `encargo`, `s1`–`s4`, `anexos`, `estado` y tres
campos de cabecera, pero **no** `tokenStats`. Al recargar, `loadCases`
(`4313`) lo reinicia a `{i:0, o:0}`. El coste acumulado real de un expediente es
irrecuperable.

---

## 8. Distancia respecto a los principios del proyecto

| Principio | Estado |
|---|---|
| *La IA es modular* | ❌ Un único cliente genérico, sin capa de servicios |
| *Nunca crear un prompt monolítico* | ❌ IA-2 es un prompt de ~4.500 caracteres en una sola línea |
| *Cada capacidad debe ser su propio servicio* | ❌ Las 9 están incrustadas en componentes de interfaz |
| *Toda ejecución de IA debe registrarse* | ❌ Sin registro |
| *Ningún texto generado sin procedencia* | ❌ Sin procedencia |
| *La plataforma es independiente de la aseguradora* | ❌ AXA aparece en dos prompts y en `normCompania` |

Cerrar estas distancias exige refactorización. Está documentado, sin ejecutar, en
`REFACTOR_BACKLOG.md` (R-04, R-05, R-06).

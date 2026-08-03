# TECHNICAL_DEBT.md

> Deuda técnica detectada en la auditoría del 1 de agosto de 2026.
>
> **Este documento no corrige nada.** Cada ficha describe el problema, dónde
> está, qué impacto tiene y qué prioridad se le asigna. Las acciones propuestas
> viven en `REFACTOR_BACKLOG.md`; las dudas que impiden decidir, en
> `OPEN_QUESTIONS.md`.

**Escala de prioridad**

| Nivel | Significado |
|---|---|
| **Crítica** | Puede causar pérdida de datos, fuga de datos personales o coste económico no controlado |
| **Alta** | Bloquea la evolución del producto o produce resultados incorrectos en el informe |
| **Media** | Degrada la calidad o la experiencia sin comprometer la corrección |
| **Baja** | Mejora deseable, sin urgencia |

---

## Índice

| Ref. | Título | Prioridad |
|---|---|---|
| DT-01 | Aplicación completa en un único archivo | Alta |
| DT-02 | Credenciales de producción como respaldo silencioso | **Crítica** |
| DT-03 | Sesión sin persistencia ni refresco de token | **Crítica** |
| DT-04 | `/api/claude` abierto y sin límite de uso | **Crítica** |
| DT-05 | Lógica específica de AXA incrustada | Alta |
| DT-06 | Conocimiento del dominio incrustado como código | Alta |
| DT-07 | El informe se genera tres veces | Alta |
| DT-08 | La vista previa calcula el infraseguro distinto que el motor | Alta |
| DT-09 | Respuestas de IA sin validación de esquema | Media |
| DT-10 | Sin pruebas ni integración continua | Alta |
| DT-11 | Bucket de anexos público | **Crítica** |
| DT-12 | La IA no deja rastro | Alta |
| DT-13 | Facturas de Sección 3 no se suben nunca | Media |
| DT-14 | Errores de negocio devueltos como HTTP 200 | Media |
| DT-15 | Contador de tokens y coste no persistido | Baja |
| DT-16 | Precios del modelo incrustados en la interfaz | Baja |
| DT-17 | Código duplicado en proxys y componente | Media |
| DT-18 | Errores mostrados con `alert()` | Baja |
| DT-19 | Dos formas de interpretar importes | Media |
| DT-20 | `reactStrictMode` desactivado | Baja |
| DT-21 | La documentación contradice al código | Media |
| DT-22 | Sin límite de tamaño en los PDFs de entrada | Baja |
| DT-23 | Sin política de tratamiento y retención de datos | Alta |
| DT-24 | `parseCap` da un resultado incorrecto con símbolo de euro y espacio final | Media |

---

## DT-01 · Aplicación completa en un único archivo

**Problema.** `components/Peritia.jsx` tiene 4.413 líneas y contiene el 88 % del
código del proyecto: datos maestros, motor de cálculo, cliente de base de datos,
cliente de IA, unos 40 componentes de interfaz y las tres plantillas de informe.

**Ubicación.** `components/Peritia.jsx` completo.

**Impacto.**
- Cualquier cambio, por pequeño que sea, obliga a leer y modificar el mismo
  archivo: dos trabajos en paralelo colisionan siempre.
- No hay barrera entre capas: nada impide que la interfaz toque los datos
  maestros o que el cálculo dependa de un componente.
- Imposible probar el motor de cálculo por separado: no se puede importar sin
  arrastrar React y toda la interfaz.
- El archivo supera lo que cabe en una lectura completa de una sola vez, lo que
  ralentiza y encarece cada sesión de trabajo.

**Prioridad.** Alta.

**Nota importante.** Este punto está en `CONTEXT.md` desde la auditoría de la
sesión 6 y fue **diferido explícitamente por Pol** en la sesión 21 ("lo dejamos
para más adelante, no abordar sin que lo pida"). Se registra aquí por
completitud; **no debe abordarse sin petición expresa.**

---

## DT-02 · Credenciales de producción como respaldo silencioso

**Problema.** La URL y la clave anónima del proyecto Supabase de producción están
escritas en el código como valor de respaldo. Si un despliegue no tiene definidas
las variables de entorno, la aplicación escribe en la base de datos **real** sin
avisar de nada.

**Ubicación.** `components/Peritia.jsx:205-209`

```js
const SB_URL_PROD = "https://yrulaaxdusvmzohugmnc.supabase.co";
const SB_KEY_PROD = "eyJhbGciOi…";
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL      || SB_URL_PROD;
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SB_KEY_PROD;
```

**Impacto.**
- Una rama de pruebas mal configurada contamina los datos de clientes reales.
- El aviso visual `ENTORNO DE PRUEBAS` **no aparece** en ese caso, porque se
  deduce de la propia URL (`ES_TEST = SB_URL !== SB_URL_PROD`): precisamente
  cuando el fallo ocurre, el aviso que debería alertar guarda silencio.
- El propio `CONTEXT.md` documenta que este escenario **ya se produjo** en el
  pasado: todas las previsualizaciones de las 20 ramas anteriores escribían en
  producción.
- Sigue habiendo un punto abierto en `CONTEXT.md`: las variables del proyecto de
  test aún **no están configuradas en Vercel** en el ámbito *Preview*. Hasta que
  lo estén, el entorno de test escribe en producción.

**Matiz.** La clave `anon` de Supabase es pública por diseño y su exposición no
es en sí una fuga: la protección real es RLS. El problema no es que la clave sea
visible, sino que el respaldo **dirige la escritura a la base equivocada sin
señal alguna**.

**Prioridad.** Crítica.

---

## DT-03 · Sesión sin persistencia ni refresco de token

**Problema.** El token de sesión vive únicamente en el estado de React. No se
guarda en ningún sitio y no se renueva nunca.

**Ubicación.** `components/Peritia.jsx:4289-4290` (estado), `893-896` (login),
`216-222` (`sbAuth`). Verificado: **cero** apariciones de `localStorage`,
`sessionStorage` y `refresh_token` en todo el archivo.

**Impacto.**
- **Recargar la página cierra la sesión.** El perito vuelve al login y pierde el
  expediente abierto.
- El `access_token` de Supabase caduca (una hora por defecto). **El
  `refresh_token` llega en la respuesta del login y se descarta.** Pasada la
  hora, todas las llamadas a la base de datos empiezan a fallar.
- El fallo es **silencioso**: `sbDb` devuelve `null` ante un 401, y `saveToSb`
  solo pone `saveState` en `"error"`. En una sesión larga —redactar un informe
  lleva horas— el perito puede seguir trabajando creyendo que se guarda.
- La única red de seguridad es el aviso del navegador al cerrar la pestaña
  (`beforeunload`, `4303-4307`), que avisa pero no salva nada.
- Las subidas a Storage fallan igual, con el mensaje "sesión no disponible".

**Prioridad.** Crítica.

---

## DT-04 · `/api/claude` abierto y sin límite de uso

**Problema.** El proxy hacia Anthropic no comprueba quién llama ni cuántas veces.

**Ubicación.** `pages/api/claude.js:9-24`. La única validación es que el método
sea `POST` y que exista `messages`.

**Impacto.**
- Cualquiera que descubra la URL puede consumir la clave de Anthropic del
  proyecto, con coste económico directo y sin límite.
- La clave es **compartida entre producción y test** (decisión explícita
  registrada en `CLAUDE.md`), así que el consumo abusivo afecta a ambos.
- Sin límite de peticiones, un bucle accidental en el cliente agota el crédito.
- Sin identificación, es imposible saber qué usuario generó qué gasto.

**Prioridad.** Crítica.

---

## DT-05 · Lógica específica de AXA incrustada

**Problema.** La plataforma debe ser independiente de la aseguradora, y cada
compañía representarse mediante configuración, catálogos, plantillas y metadatos.
Hoy AXA está escrita en el código y en los prompts.

**Ubicación.**

| Dónde | Qué |
|---|---|
| `Peritia.jsx:144` | `normCompania` fuerza cualquier variante de "AXA" a "AXA Seguros". Ninguna otra compañía se normaliza |
| `Peritia.jsx:1389` | El *system prompt* de la póliza dice *"experto en polizas AXA y similares"* |
| `Peritia.jsx:1359` | El prompt del encargo dice *"En encargos AXA aparece como Fecha de efecto en la seccion Poliza al final del documento"* |
| `Peritia.jsx:141` | `COMPANIAS`: lista cerrada de 14 aseguradoras en el código |
| `CONTEXT.md` | Registra como pendiente de Fase 2: *"Multi-compañía: baremos propios por aseguradora (no solo AXA)"* |

**Impacto.**
- Incorporar una segunda aseguradora exige tocar el código y volver a desplegar,
  no cargar una configuración.
- La calidad de la extracción de pólizas de otras compañías es desconocida: el
  prompt está optimizado para una sola.
- Es el obstáculo directo al principio de independencia de aseguradora.

**Prioridad.** Alta.

---

## DT-06 · Conocimiento del dominio incrustado como código

**Problema.** El conocimiento pericial —precios, módulos, catálogos, reglas de
correspondencia— vive como constantes de JavaScript, no como configuración.

**Ubicación.**

| Constante | Línea | Contenido |
|---|---|---|
| `BAREMO` | 28-84 | 47 partidas con precio |
| `PCT_INDIRECTO` | 86 | 8 % de costes indirectos |
| `TABLAS_ARQ` | 89-96 | ~1.170 valores €/m² |
| `getFactorArq` | 126-131 | Factores 1,486 / 1,618 / 1,366 |
| `PROVINCIAS` | 135-140 | 13 provincias |
| `COMPANIAS` | 141 | 14 aseguradoras |
| `TIPOS_USO`, `TIPOS_GARANTIA` | 145-146 | Listas cerradas |
| `CAUSA_COB` | 1419 | Correspondencia causa → garantía |

**Impacto.**
- **Actualizar un precio del baremo exige un despliegue completo.** Los precios
  de construcción cambian cada año; los módulos de arquitectura, también.
- Nadie que no sea programador puede mantener el conocimiento del negocio.
- Imposible tener variantes por aseguradora, por zona o por año.
- No hay historial: no se sabe con qué precios se valoró un informe de hace seis
  meses. Un informe pericial es un documento con efectos legales y económicos;
  poder reproducir la valoración original importa.

**Prioridad.** Alta.

---

## DT-07 · El informe se genera tres veces

**Problema.** La misma estructura de informe está implementada tres veces, de
forma independiente.

**Ubicación.**

| Implementación | Líneas | Tamaño | Salida |
|---|---|---|---|
| `SecInforme` | 1617-1920 | ~300 | Vista previa en pantalla (JSX) |
| `buildWordHTML` | 3330-3541 | ~212 | HTML para Word |
| `exportPDF` | 3580-3801 | ~222 | HTML para impresión |

**Impacto.**
- Todo cambio en el informe hay que hacerlo tres veces. Olvidar una produce
  divergencia entre lo que el perito ve y lo que el cliente recibe.
- La divergencia **ya existe**: ver DT-08.
- La frase legal de cierre está duplicada literalmente en dos sitios (`3463` y
  `3701`): si cambia el texto legal, hay que acordarse de los dos.
- Es la mayor concentración de duplicación del proyecto: ~730 líneas.

**Excepción positiva.** El bloque meteorológico sí está compartido entre Word y
PDF (`meteoHTML`, con un parámetro para distinguirlos). Demuestra que el patrón
es viable.

**Prioridad.** Alta.

---

## DT-08 · La vista previa calcula el infraseguro distinto que el motor

**Problema.** `SecInforme` recalcula el capital, el valor preexistente, el
porcentaje de infraseguro y la regla proporcional con una lógica **que no
coincide** con la del motor de cálculo (`calcReglas`).

**Ubicación.** `components/Peritia.jsx:1621-1624` frente a `263-280`.

Tres diferencias concretas:

| Aspecto | `calcReglas` (motor) | `SecInforme` (vista previa) |
|---|---|---|
| Lectura del capital | `parseCap(...)` — entiende `6.000,00` | `parseFloat(enc.capitalContinente\|\|0)` — lee `6.000,00` como **6** |
| Corrección manual del perito | Respeta `s1.capContOverride` | La **ignora** |
| Póliza a primer riesgo | Si `primerRiesgo`, valor preexistente = capital | **No lo contempla** |

**Impacto.**
- La tabla de la vista previa puede mostrar un porcentaje de infraseguro y unos
  capitales distintos de los que aplica el cálculo real.
- El caso de `parseFloat` es el más grave: un capital de 6.000,00 € extraído por
  la IA en formato español se muestra como **6 €** en la vista previa, lo que
  presenta un infraseguro catastrófico e inexistente.
- Los importes finales (`ajustado`, `indemn`) sí usan las funciones correctas
  (`1627-1628`), así que **el total es correcto**: la discrepancia está en los
  valores intermedios que se muestran, incluida la fila de la tabla de capitales
  (`1723` en adelante).
- Es exactamente el problema que la existencia de un motor único pretendía
  evitar, y `Sec1` introduce una tercera variante propia (`2000-2003`).

**Prioridad.** Alta.

---

## DT-09 · Respuestas de IA sin validación de esquema

**Problema.** Ninguna de las nueve respuestas de IA se valida contra un esquema.
`parseJSON` comprueba que el texto sea JSON interpretable; nada comprueba que
tenga los campos esperados, ni del tipo esperado, ni en el rango esperado.

**Ubicación.** `Peritia.jsx:306-315` (`parseJSON`), y los nueve puntos de consumo.

**Impacto.**
- Un campo ausente aparece vacío en el informe sin ningún aviso.
- Un capital devuelto como texto no numérico se convierte en 0 y falsea el
  cálculo del infraseguro.
- `iaError` cubre solo dos casos: error de API y JSON no interpretable. Un JSON
  **válido pero incompleto o absurdo** pasa sin filtro.
- Las unidades (`uds`) que decide la IA en IA-8 multiplican directamente al
  precio, y no se acotan en el momento de la generación.

**Atenuantes existentes.** IA-1 comprueba que haya al menos referencia, asegurado
o compañía. IA-8 vuelve a emparejar contra el baremo y avisa de las partidas sin
precio. `parseJSON` marca el fallo en vez de devolver `{}` en silencio. La
validación de rangos de la Sección 3 (sesión 8) acota los valores en la tabla,
una vez introducidos.

**Prioridad.** Media.

**Nota.** Está en `CONTEXT.md` desde la auditoría de la sesión 6 y fue **diferido
por Pol** junto con DT-01.

---

## DT-10 · Sin pruebas ni integración continua

**Problema.** El repositorio no tiene ni una sola prueba automatizada, ni ejecutor
de pruebas, ni linter, ni comprobación en cada cambio.

**Ubicación.** `package.json` (sin `devDependencies`, sin script `test`);
ausencia de `.github/`.

**Impacto.**
- El motor de cálculo —donde un error se traduce en euros mal pagados o mal
  cobrados— **no tiene ninguna prueba**. Su única verificación son dos casos
  oráculo (463,59 € y 1.291,47 €) comprobados **a mano** por Pol.
- No hay pruebas de regresión: ningún error corregido queda protegido frente a
  su reaparición. El proyecto acumula 22 sesiones de correcciones sin ninguna red.
- La única comprobación automática mencionada en `CLAUDE.md` es el balance de
  llaves de `Peritia.jsx`, que detecta un archivo roto, no una lógica incorrecta.
- Hace que DT-01 (la división en módulos) sea mucho más arriesgada de lo
  necesario: no hay forma de comprobar que un refactor no ha roto nada.

**Prioridad.** Alta.

---

## DT-11 · Bucket de anexos público

**Problema.** El bucket `anexos` concede lectura al rol `public`. Fotografías del
interior de domicilios, facturas y documentos del expediente son accesibles por
URL, sin sesión.

**Ubicación.** `supabase/migrations/20260719120000_anexos_storage_bucket.sql:9-11`
y `23-28`.

```sql
insert into storage.buckets (id, name, public) values ('anexos','anexos', true);

create policy "anexos_select_public" on storage.objects
  for select to public using (bucket_id = 'anexos');
```

**Impacto.**
- Datos personales sensibles de terceros —el asegurado no es el usuario de la
  aplicación— accesibles sin autenticación y sin dejar rastro de acceso.
- Una URL compartida por error, indexada o filtrada por el histórico del
  navegador expone el material de forma permanente.
- Con toda probabilidad incompatible con el RGPD para este tipo de contenido.

**Contexto.** La migración documenta el motivo: la lectura pública es *"necesaria
para que los exports a PDF y Word puedan cargar las imágenes sin sesión"*. Es un
problema técnico real resuelto por la vía que crea un problema de privacidad. La
ruta lleva un sufijo aleatorio de 6 caracteres, lo que dificulta adivinarla —pero
la seguridad por oscuridad no es control de acceso.

**Prioridad.** Crítica.

**Antes de actuar** hay que confirmar si la publicidad fue una decisión
consciente y aceptada: ver `OPEN_QUESTIONS.md`, P-07.

---

## DT-12 · La IA no deja rastro

**Problema.** El proyecto exige que ningún texto generado exista sin procedencia.
Hoy no se guarda ninguno de los siete datos requeridos.

**Ubicación.** Los nueve puntos de invocación; `saveToSb` (`4345-4350`).

**Impacto.**
- Ante una reclamación sobre un informe, es imposible reconstruir de dónde salió
  una cifra o una frase.
- Imposible distinguir lo que escribió el perito de lo que escribió la IA.
- **Los PDFs de origen no se conservan**: se convierten a base64, se envían y se
  descartan. La fuente de toda la extracción desaparece.
- Imposible medir la calidad de la extracción o comparar versiones de prompt.
- Sin versión de modelo registrada, un cambio de modelo por parte del proveedor
  altera los resultados sin dejar constancia.

**Prioridad.** Alta.

Detalle completo en `AI_INVENTORY.md`, sección 7.

---

## DT-13 · Facturas de Sección 3 no se suben nunca

**Problema.** Las facturas adjuntadas en la Sección 3 para que la IA las lea se
guardan como objetos `File` del navegador dentro de `s3.facturas`, y **nunca se
suben a Storage**.

**Ubicación.** `Peritia.jsx:2562-2564` (alta), `3326` (uso en la exportación).

```js
const news = Array.from(files).map(f => ({id:…, name:f.name, size:f.size, file:f}));
```

**Impacto.**
- Al guardar en Supabase, un objeto `File` se serializa como `{}`: **el contenido
  del archivo se pierde**. Queda el nombre y el tamaño, no el documento.
- Al recargar el expediente, la exportación intenta crear una URL desde ese
  objeto vacío (`f.file ? URL.createObjectURL(f.file) : null`, línea `3326`), lo
  que lanza una excepción. Los dos caminos de exportación la capturan y muestran
  "Error al generar PDF/Word", de modo que **la exportación falla por completo**
  hasta que el perito vuelve a adjuntar las facturas.
- Los anexos de las pestañas "Facturas" y "Presupuestos" sí se suben
  correctamente: la incoherencia está solo en la vía de la Sección 3.

**Prioridad.** Media.

---

## DT-14 · Errores de negocio devueltos como HTTP 200

**Problema.** `/api/meteocat` y `/api/catastro` responden `200 OK` con
`{ok:false, error:"…"}` ante cualquier fallo de negocio: fecha inválida, fuera de
ámbito, dirección no localizable, sin datos.

**Ubicación.** `meteocat.js:176, 179, 192, 203, 217, 237`;
`catastro.js:107, 117, 124, 141`.

**Impacto.**
- Los registros y la supervisión de Vercel ven un 100 % de peticiones correctas
  aunque todas fallen.
- Ningún sistema externo —vigilancia, alertas, reintentos automáticos— puede
  distinguir el éxito del fracaso sin inspeccionar el cuerpo.
- Es coherente y está aplicado con consistencia dentro del proyecto; el problema
  es la incompatibilidad con cualquier herramienta estándar.

**Prioridad.** Media.

---

## DT-15 · Contador de tokens y coste no persistido

**Problema.** `cData.tokenStats` acumula tokens de entrada y salida durante la
sesión, pero no se incluye en lo que se guarda en la base de datos.

**Ubicación.** `Peritia.jsx:4345-4350` (no lo incluye), `4313` (lo reinicia al
cargar).

**Impacto.** El coste real de IA por expediente es irrecuperable. No se puede
medir cuánto cuesta un informe, ni detectar expedientes anormalmente caros, ni
sostener ninguna decisión de precio del producto. Es un dato de negocio que se
pierde cada vez que se recarga la página.

**Prioridad.** Baja (no afecta a la corrección del informe), pero es un obstáculo
directo para el punto "Métricas de uso" del roadmap de Fase 2.

---

## DT-16 · Precios del modelo incrustados en la interfaz

**Problema.** El cálculo del coste estimado tiene los precios del modelo y un
factor de conversión escritos dentro de un componente.

**Ubicación.** `Peritia.jsx:3997`

```js
const costEur = ((tokens.i||0)/1e6*3 + (tokens.o||0)/1e6*15) * 1.08;
```

**Impacto.** Cuando cambien las tarifas de Anthropic o el tipo de cambio, el coste
mostrado será falso y nadie lo notará. El origen del factor `1.08` no está
documentado en ninguna parte (ver `OPEN_QUESTIONS.md`, P-06).

**Prioridad.** Baja.

---

## DT-17 · Código duplicado en proxys y componente

**Problema.** Además de la triple duplicación del informe (DT-07), hay siete
duplicaciones menores.

**Ubicación.**

| Qué | Dónde |
|---|---|
| `geocodificar` | `meteocat.js:85-101` y `catastro.js:43-56` |
| `fetchJSON` | `meteocat.js:27-35` y `catastro.js:27-35` |
| Captura de imagen a `data:` URI | `meteocat.js:47-64` y `catastro.js:85-100` |
| `toB64` | `Peritia.jsx:1327` y `2537` |
| Formateo de importes (`fmt` / `fmtPDF`) | `Peritia.jsx:159` y `3314` |
| Comprobación "es PDF" | `Peritia.jsx:3315`, `3183` y `3332` |
| Bloque "capitales en póliza" | `Peritia.jsx:1595` y `3954` |

**Impacto.** Cada corrección hay que aplicarla en varios sitios. Los dos proxys ya
divergen ligeramente: `meteocat.js` envía `User-Agent` en `geocodificar` y
`catastro.js` lo hace en `fetchJSON`, con el mismo efecto por caminos distintos.

**Prioridad.** Media.

---

## DT-18 · Errores mostrados con `alert()`

**Problema.** Cuatro errores se comunican con el diálogo modal del navegador.

**Ubicación.** `Peritia.jsx:1373, 1380` y dos más.

**Impacto.** Bloquea la interfaz, rompe la coherencia visual, no permite copiar el
texto con comodidad y en móvil resulta especialmente brusco. El resto de la
aplicación ya usa avisos en pantalla (`setGenMsg`, `setUploadErr`, `setMeteoErr`),
que es el patrón correcto y establecido — la sesión 14 ya migró un `alert()` a ese
patrón.

**Prioridad.** Baja.

---

## DT-19 · Dos formas de interpretar importes

**Problema.** Conviven dos maneras de convertir un texto en número, con resultados
distintos para el mismo dato.

**Ubicación.** `parseCap` (`Peritia.jsx:187-195`) frente a `parseFloat` directo
(`1622`, `1723` y otros puntos de la vista previa).

`parseCap` entiende el formato español (`6.000,00` → `6000`). `parseFloat` lo lee
como `6`.

**Impacto.** Es la causa raíz de DT-08. Cualquier importe que llegue de la IA en
formato español y pase por `parseFloat` queda dividido por mil o peor. Que exista
una función correcta y no se use en todas partes es más peligroso que no tenerla:
da la impresión de que el problema está resuelto.

**Prioridad.** Media.

---

## DT-20 · `reactStrictMode` desactivado

**Problema.** `next.config.js` desactiva el modo estricto de React.

**Ubicación.** `next.config.js:3`

**Impacto.** Se pierden los avisos de React sobre patrones problemáticos (efectos
sin limpieza, APIs obsoletas, efectos secundarios en el renderizado). No consta en
`CONTEXT.md` por qué se desactivó; puede ser para evitar el doble montaje de
efectos en desarrollo, que con los efectos de auto-relleno de la Sección 1 podría
producir llamadas duplicadas a la IA.

**Prioridad.** Baja. **No tocar sin investigar el motivo original**: reactivarlo a
ciegas podría duplicar llamadas de pago.

---

## DT-21 · La documentación contradice al código

**Problema.** Tres afirmaciones de la documentación del repositorio no coinciden
con el código actual. Como la documentación tiene prioridad sobre el código, esto
importa.

**Ubicación.**

| Documento | Afirma | Realidad |
|---|---|---|
| `CLAUDE.md` | *"ni siquiera la URL/key de Supabase están escritas en `Peritia.jsx`"* | Sí lo están, como respaldo (`205-206`) |
| `CONTEXT.md` | `Peritia.jsx` tiene ~4.230 líneas | Tiene 4.413 |
| `CONTEXT.md` | Las constantes `SB_URL`/`SB_KEY` contienen el valor de producción | Hoy derivan del entorno; los nombres reales son `SB_URL_PROD`/`SB_KEY_PROD` |

**Impacto.** La primera es la peligrosa: alguien que lea `CLAUDE.md` concluirá que
un despliegue sin variables no puede tocar producción, que es exactamente lo
contrario de lo que ocurre (DT-02).

**Prioridad.** Media.

**Nota.** Corregir esto exige modificar archivos existentes y por tanto requiere
aprobación previa. Ver `REFACTOR_BACKLOG.md`, R-11.

---

## DT-22 · Sin límite de tamaño en los PDFs de entrada

**Problema.** Los PDFs del encargo, la póliza y las facturas se convierten a
base64 y se envían sin comprobar su tamaño en el navegador.

**Ubicación.** `Peritia.jsx:1327-1335` (encargo), `1387` (póliza), `2537-2542`
(facturas).

**Impacto.** La codificación base64 aumenta el tamaño un 33 %: un PDF de 16 MB
supera el límite de 20 MB del proxy y falla tras una espera larga, sin mensaje
claro. Los anexos sí tienen guarda (10 MB, `3147`); esta vía no.

**Prioridad.** Baja.

---

## DT-23 · Sin política de tratamiento y retención de datos

**Problema.** El sistema trata datos personales sensibles de terceros y no hay
ninguna política documentada.

**Ubicación.** Ausencia transversal. `docs/security/` está vacía.

**Impacto.** Sin respuesta documentada a preguntas que un cliente asegurador o
una autoridad de protección de datos harían el primer día:
- ¿Cuánto tiempo se conservan los expedientes y los anexos? (Hoy:
  indefinidamente, sin borrado lógico.)
- ¿Se informa al asegurado de que sus documentos se envían a un proveedor de IA
  en Estados Unidos?
- ¿Qué ocurre con los archivos de Storage al borrar un expediente? (Hoy: quedan
  huérfanos y siguen siendo públicos.)
- ¿Qué pasa si un perito borra su cuenta? (Hoy: `ON DELETE CASCADE` elimina todos
  sus expedientes de forma irreversible.)
- ¿Hay contrato de encargado de tratamiento con Anthropic, Supabase y Vercel?

**Prioridad.** Alta. Es un riesgo de negocio y legal, no solo técnico, y crece
con cada cliente nuevo.

---

## DT-24 · `parseCap` da un resultado incorrecto con símbolo de euro y espacio final

**Problema.** Descubierto al escribir las pruebas de `parseCap` en el Sprint 4
(Fase 0). Con un valor que incluye el símbolo de euro y un espacio antes de él
(`"6.000,00 €"`), la función devuelve **6**, no 6.000.

**Ubicación.** `components/Peritia.jsx`, función `parseCap` (línea ~187).

**Causa.** El texto no coincide con la expresión regular del formato español
estricto (`/^[\d.]+,\d{1,2}$/`, anclada de principio a fin, no admite el
sufijo " €"). Cae entonces a la vía genérica: se eliminan los caracteres no
numéricos, quedando `"6.000,00"`, y `.replace(",",".")` sustituye **solo la
primera coma** por un punto, dando `"6.000.00"`. `parseFloat("6.000.00")`
se detiene en el segundo punto y devuelve `6`.

**Impacto.** Si algún campo de importe llega con el símbolo de euro incluido
—por ejemplo, un capital corregido a mano por el perito escribiendo
"6.000,00 €" en vez de "6000"— el valor se trunca a una fracción minúscula
de su valor real, sin ningún aviso. No hay evidencia de que esto ocurra hoy
en producción: los prompts de extracción piden explícitamente a la IA
"solo el número, sin símbolo", así que la entrada real casi nunca lleva el
símbolo de euro. El riesgo es la corrección manual del perito en un campo de
texto libre, no la extracción automática.

**Prioridad.** Media — no se ha observado en producción, pero la corrección
es barata y el fallo, si ocurre, es silencioso y con impacto económico
directo (DT-19 ya señalaba el riesgo general de `parseCap` frente a
`parseFloat`; esta ficha documenta un caso concreto dentro de la propia
`parseCap`, no de su sustitución por `parseFloat`).

**No corregido en este sprint**, conforme al alcance de la Fase 0 del plan de
migración (`docs/migration/MIGRATION_MASTER_PLAN.md`): solo se documenta.
Candidato natural para la Fase 2 (extracción del motor de cálculo), donde
`parseCap` ya va a tener pruebas y va a moverse de sitio.

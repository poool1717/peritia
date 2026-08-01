# REFACTOR_BACKLOG.md

> Refactorizaciones propuestas, **documentadas y no ejecutadas**.
>
> **Este documento no cambia ni una línea de código.** Es un catálogo de trabajo
> pendiente, priorizado, con dependencias entre fichas, para que las decisiones se
> tomen con la información delante.
>
> **Fecha:** 1 de agosto de 2026

---

## Reglas que rigen este backlog

1. **Nada de aquí se ejecuta sin aprobación explícita.**
2. **R-01 (pruebas) va antes que cualquier refactor estructural.** Reordenar
   código sin red de seguridad, en un sistema que calcula dinero y no tiene ni una
   prueba, es la forma más rápida de romper lo que funciona.
3. Las fichas marcadas **⛔ DIFERIDO** lo están por decisión expresa de Pol
   registrada en `CONTEXT.md`. No se abordan aunque parezcan urgentes.
4. Varias fichas dependen de una respuesta de `OPEN_QUESTIONS.md`. No se empiezan
   antes de tenerla.

---

## Índice

| Ref. | Refactorización | Deuda que cierra | Esfuerzo | Riesgo | Prioridad |
|---|---|---|---|---|---|
| R-01 | Infraestructura de pruebas + pruebas del motor de cálculo | DT-10 | Medio | **Bajo** | 1 |
| R-02 | Eliminar el respaldo a producción | DT-02 | Bajo | Medio | 2 |
| R-03 | Persistencia de sesión y refresco de token | DT-03 | Medio | Medio | 3 |
| R-04 | Proteger `/api/claude` | DT-04 | Bajo | Bajo | 4 |
| R-05 | Anexos con acceso restringido | DT-11 | Medio | Medio | 5 |
| R-06 | Unificar el cálculo del infraseguro | DT-08, DT-19 | Bajo | **Bajo** | 6 |
| R-07 | Subir las facturas de Sección 3 a Storage | DT-13 | Bajo | Bajo | 7 |
| R-08 | Extraer los prompts a `prompts/` | DT-12 parcial | Bajo | Bajo | 8 |
| R-09 | Validación de respuestas de IA con esquema | DT-09 | Medio | Bajo | ⛔ Diferido |
| R-10 | Registro y trazabilidad de ejecuciones de IA | DT-12, DT-15 | Alto | Medio | 9 |
| R-11 | Corregir las contradicciones de la documentación | DT-21 | Bajo | **Nulo** | 10 |
| R-12 | Unificar utilidades duplicadas de los proxys | DT-17 | Bajo | Bajo | 11 |
| R-13 | Plantilla única de informe | DT-07 | Alto | **Alto** | 12 |
| R-14 | Extraer el conocimiento del dominio a `knowledge/` | DT-06, DT-05 | Alto | Alto | 13 |
| R-15 | Dividir `Peritia.jsx` en módulos | DT-01 | Muy alto | **Muy alto** | ⛔ Diferido |
| R-16 | Errores en pantalla en lugar de `alert()` | DT-18 | Bajo | Nulo | 14 |
| R-17 | Códigos HTTP correctos en los proxys | DT-14 | Bajo | Medio | 15 |
| R-18 | Guarda de tamaño en los PDFs de entrada | DT-22 | Bajo | Nulo | 16 |

---

## R-01 · Infraestructura de pruebas y pruebas del motor de cálculo

**Cierra:** DT-10.
**Prioridad: 1.** Es la ficha que habilita todas las demás.

**Alcance.** Añadir un ejecutor de pruebas y escribir la primera batería sobre el
motor de cálculo (`calcPartida`, `resolvePartidas`, `calcReglas`, `reglaPartida`,
`sumAjustado`, `calcIndemnizacion`, `parseCap`, `matchBaremo`).

**Casos de partida ya disponibles:** los dos casos oráculo validados por Pol
(463,59 € y 1.291,47 €), registrados en `CONTEXT.md`. Son la mejor base posible:
resultados conocidos y verificados a mano contra la realidad.

**Casos a cubrir:**
- Los dos oráculos, extremo a extremo.
- `parseCap` con los formatos `6.000,00`, `6000.00`, `6000`, `"6.000,00 €"`, `""`,
  `null`.
- Costes indirectos: que el 8 % se calcule sobre el subtotal sin incluirse a sí
  mismo.
- Regla proporcional: con infraseguro, sin infraseguro, a primer riesgo, con
  corrección manual del perito.
- Franquicia mayor que el daño → indemnización 0, nunca negativa.
- `matchBaremo` en sus tres niveles de coincidencia y en el caso "no encontrado".

**Obstáculo real.** El motor está dentro de `Peritia.jsx`, que importa React y
`lucide-react`. Probarlo aisladamente exige, o bien un ejecutor que resuelva JSX
(Vitest lo hace), o bien mover primero las funciones puras a un archivo aparte
—que es un paso de R-15, diferido—.

⚠ **Requiere aprobación previa:** modifica `package.json` (añadir
`devDependencies` y el script `test`), lo que choca con la regla vigente de no
instalar dependencias nuevas.

**Esfuerzo:** medio · **Riesgo:** bajo (solo añade, no toca código en producción).

---

## R-02 · Eliminar el respaldo a producción

**Cierra:** DT-02.
**Prioridad: 2.**

**Alcance.** Que la aplicación deje de caer a la base de datos de producción
cuando faltan las variables de entorno.

**Opciones a valorar (decisión de Pol, no del implementador):**

| Opción | Comportamiento | Ventaja | Inconveniente |
|---|---|---|---|
| A | Sin variables → error visible y bloqueo de la aplicación | Imposible escribir en la base equivocada | Un despliegue mal configurado deja la aplicación caída |
| B | Sin variables → aviso permanente y bloqueo de escritura | Fallo evidente sin caída total | Más código |
| C | Mantener el respaldo pero mostrar siempre un aviso de "base de datos de producción" | Cambio mínimo | Sigue escribiendo en producción |

**Precondición imprescindible.** Configurar antes en Vercel las variables del
proyecto de test en el ámbito *Preview*. Es un paso manual de Pol, ya registrado
como pendiente en `CONTEXT.md`. **Retirar el respaldo antes de eso dejaría el
entorno de test sin base de datos.**

**Esfuerzo:** bajo · **Riesgo:** medio (si se hace en el orden equivocado, tumba
los despliegues de previsualización).

---

## R-03 · Persistencia de sesión y refresco de token

**Cierra:** DT-03.
**Prioridad: 3.**

**Alcance.** Que recargar la página no cierre la sesión, y que el token se renueve
antes de caducar.

**Dos caminos posibles:**

| Camino | Qué implica | Ventaja | Inconveniente |
|---|---|---|---|
| Adoptar `@supabase/supabase-js` | Añadir una dependencia | Persistencia y refresco resueltos de serie, mantenidos por el proveedor | Rompe la regla de no instalar dependencias; obliga a reescribir `sbAuth` y `sbDb` |
| Implementarlo a mano | Guardar `access_token` y `refresh_token`, renovar contra `/auth/v1/token?grant_type=refresh_token` antes de caducar | Sin dependencias nuevas | Código de seguridad escrito a mano; hay que decidir dónde se guarda el token |

**Decisión previa necesaria:** dónde persistir el token. `localStorage` es lo
habitual pero es accesible desde JavaScript. Dado que la aplicación maneja datos
personales sensibles, la elección merece justificarse en un ADR.

**Mejora complementaria de bajo coste:** hacer que `sbDb` distinga un `401` de un
fallo de red, para poder avisar "tu sesión ha caducado" en lugar de fallar en
silencio.

⚠ **Requiere aprobación previa** en el camino de la dependencia.

**Esfuerzo:** medio · **Riesgo:** medio (toca el camino de autenticación de todos
los usuarios).

---

## R-04 · Proteger `/api/claude`

**Cierra:** DT-04.
**Prioridad: 4.**

**Alcance.** Que el proxy solo atienda a usuarios autenticados y con un límite de
uso.

**Elementos a considerar:**
- Exigir la cabecera `Authorization: Bearer <token>` y verificar el JWT contra
  Supabase antes de llamar a Anthropic.
- Límite de peticiones por usuario y ventana de tiempo. Sin base de datos de
  apoyo esto es incómodo en serverless; conviene decidir si se acepta un límite
  aproximado en memoria o hace falta almacenamiento.
- Registrar qué usuario consume qué, condición previa de DT-15.

**Beneficio adicional.** Una vez identificado el usuario, R-10 (trazabilidad) se
vuelve mucho más fácil.

**Esfuerzo:** bajo · **Riesgo:** bajo (si falla la verificación, el efecto es que
la IA deja de funcionar — visible de inmediato, no silencioso).

---

## R-05 · Anexos con acceso restringido

**Cierra:** DT-11.
**Prioridad: 5.**
**Bloqueada por:** `OPEN_QUESTIONS.md`, P-07.

**Alcance.** Que las fotografías y documentos del expediente dejen de ser
accesibles sin autenticación.

**El problema a resolver primero.** La publicidad existe porque las exportaciones
a PDF y Word cargan las imágenes por URL. Cualquier solución debe seguir
permitiéndolo.

**Opciones a valorar:**

| Opción | Cómo | Ventaja | Inconveniente |
|---|---|---|---|
| A | Bucket privado + URLs firmadas con caducidad al exportar | Estándar del sector | Hay que generar las firmas en el momento de exportar |
| B | Bucket privado + incrustar las imágenes en base64 al exportar | El documento queda autocontenido | Ficheros mucho más pesados; ya existe `resolveAnexosImgs` (`3554`), que hace algo parecido para Word |
| C | Mantener público pero con rutas de mayor entropía | Cambio mínimo | No es control de acceso, solo oscuridad |

**Nota.** La opción B ya está medio implementada para Word (`urlToDataURI`,
`wordImgCache`, `resolveAnexosImgs`, `3542-3564`). Extenderla al PDF sería
coherente con lo que ya hay.

**Migración.** Cambiar la política afecta a los archivos ya subidos. Hay que
comprobar que los expedientes antiguos siguen exportándose bien.

**Esfuerzo:** medio · **Riesgo:** medio (puede romper la exportación de
expedientes existentes).

---

## R-06 · Unificar el cálculo del infraseguro

**Cierra:** DT-08 y la parte visible de DT-19.
**Prioridad: 6.** Relación beneficio/riesgo excelente.

**Alcance.** Que `SecInforme` y `Sec1` dejen de recalcular capitales, valor
preexistente e infraseguro por su cuenta y usen `calcReglas`, que ya devuelve
todo lo necesario (`capCont`, `vPreexCont`, `capCont2`, `vPreexContenido`,
`infraCont`, `infraContenido`).

**Puntos afectados:** `Peritia.jsx:1621-1624` y `1723` (vista previa),
`2000-2003` (Sección 1).

**Por qué el riesgo es bajo.** No se cambia ninguna fórmula: se sustituyen tres
cálculos divergentes por la llamada a la función que ya es la fuente de verdad.
Los importes finales ya la usan, así que los totales no se mueven. Lo único que
cambia es que los valores intermedios mostrados pasan a coincidir con ellos.

**Requiere R-01 antes**, para poder demostrar que los dos casos oráculo siguen
dando el mismo resultado.

**Esfuerzo:** bajo · **Riesgo:** bajo.

---

## R-07 · Subir las facturas de Sección 3 a Storage

**Cierra:** DT-13.
**Prioridad: 7.**

**Alcance.** Que las facturas adjuntadas en la Sección 3 se suban al bucket
`anexos` igual que las de la pestaña de Anexos, en lugar de quedarse como objetos
`File` que no sobreviven a un guardado.

**Ya existe la pieza necesaria:** `SecAnexos.addFiles` (`3185-3216`) hace
exactamente esto. La ficha consiste en reutilizar ese mecanismo desde la Sección 3.

**Decisión previa.** ¿Las facturas de la Sección 3 y las de la pestaña "Facturas"
son el mismo concepto? Si lo son, quizá sobre una de las dos vías. Es una
pregunta de producto, no técnica.

**Efecto colateral positivo:** desaparece el fallo de exportación descrito en
DT-13.

**Esfuerzo:** bajo · **Riesgo:** bajo.

---

## R-08 · Extraer los prompts a `prompts/`

**Cierra:** parte de DT-12.
**Prioridad: 8.**

**Alcance.** Sacar los nueve prompts de `Peritia.jsx` a archivos independientes en
`prompts/`, cada uno con nombre y versión, e importarlos.

**Por qué es un buen primer paso.** Es la única parte de R-15 (dividir el archivo)
que se puede hacer **sin tocar la lógica**: mover cadenas de texto de un sitio a
otro. Reduce `Peritia.jsx` en varios cientos de líneas, hace visibles y revisables
las reglas de negocio escondidas en el prompt de la póliza (P-08), y es el primer
requisito de trazabilidad que se puede cumplir de verdad.

**Precaución.** El prompt de la póliza (`1389`) es una sola línea de ~4.500
caracteres con comillas escapadas. Moverlo exige cuidado extremo: cualquier
alteración del texto cambia el comportamiento de la extracción.

**Nota sobre el alcance.** Mover *prompts* no es el refactor estructural diferido
por Pol; aun así, al tocar `Peritia.jsx`, conviene confirmarlo antes.

**Esfuerzo:** bajo · **Riesgo:** bajo, con la precaución anterior.

---

## R-09 · Validación de respuestas de IA con esquema — ⛔ DIFERIDO

**Cierra:** DT-09.

**Estado:** diferido explícitamente por Pol en la sesión 21, junto con R-15
("lo dejamos para más adelante, no abordar sin que lo pida").

**Alcance previsto.** Definir en `schemas/` un esquema por cada respuesta de IA y
validar antes de consumirla. Ampliar `iaError` para que informe de qué campo falta
o es inválido.

**Obstáculo.** Hacerlo bien sugiere una biblioteca de validación (zod), que choca
con la regla de no instalar dependencias. Se puede hacer a mano, con más código y
menos garantías.

**No abordar sin petición expresa.**

---

## R-10 · Registro y trazabilidad de ejecuciones de IA

**Cierra:** DT-12 y DT-15.
**Prioridad: 9.**
**Bloqueada por:** `OPEN_QUESTIONS.md`, P-17 (si no se conservan los documentos
fuente, la trazabilidad completa es imposible por definición).

**Alcance.** Registrar cada ejecución de IA con: expediente, usuario, capacidad,
versión de prompt, modelo devuelto por la API, tokens, duración, resultado y marca
temporal. Y asociar cada texto generado con la ejecución que lo produjo.

**Implica:**
- Una tabla nueva (`ejecuciones_ia` o similar) y su migración, aplicada a los dos
  proyectos Supabase.
- Que `/api/claude` conozca al usuario (**depende de R-04**).
- Que los prompts tengan versión (**depende de R-08**).
- Persistir `tokenStats`, que hoy se pierde.

**Decisión previa.** ¿Trazabilidad por expediente (más simple) o por párrafo
generado (lo que exige el principio del proyecto, mucho más invasivo)? Merece un
ADR.

**Esfuerzo:** alto · **Riesgo:** medio (añade escrituras en cada llamada de IA;
un fallo del registro no debe impedir que la IA funcione).

---

## R-11 · Corregir las contradicciones de la documentación

**Cierra:** DT-21.
**Prioridad: 10.** Esfuerzo mínimo, riesgo nulo.

**Alcance.** Tres correcciones puntuales:

| Archivo | Qué corregir |
|---|---|
| `CLAUDE.md` | La frase que afirma que las credenciales ya no están en `Peritia.jsx`. Sí están, como respaldo |
| `CONTEXT.md` | El recuento de líneas: 4.230 → 4.413 |
| `CONTEXT.md` | El bloque de constantes `SB_URL`/`SB_KEY`, hoy derivadas del entorno |

⚠ **Requiere aprobación previa:** modifica tres archivos existentes. Es
precisamente el tipo de cambio que la instrucción de este sprint reserva a la
aprobación de Pol.

**Esfuerzo:** bajo · **Riesgo:** nulo (no toca código).

---

## R-12 · Unificar utilidades duplicadas de los proxys

**Cierra:** parte de DT-17.
**Prioridad: 11.**

**Alcance.** Extraer a un módulo compartido las funciones duplicadas entre
`meteocat.js` y `catastro.js`: `geocodificar`, `fetchJSON` y la captura de imagen
a `data:` URI.

**Decisión previa.** Dónde vive el módulo compartido. Next.js permite `lib/` o
`pages/api/_lib/` (el guion bajo evita que se publique como ruta). Es una decisión
de estructura y, por tanto, merece confirmarse antes.

**Beneficio adicional.** Al unificar `geocodificar` se corrige la divergencia
actual: hoy cada proxy envía la cabecera `User-Agent` en un punto distinto.

**Esfuerzo:** bajo · **Riesgo:** bajo (afecta a dos funciones bien delimitadas y
fáciles de comprobar a mano).

---

## R-13 · Plantilla única de informe

**Cierra:** DT-07.
**Prioridad: 12.**

**Alcance.** Sustituir las tres implementaciones del informe por una sola fuente
que genere las tres salidas (vista previa, Word y PDF).

**Por qué el riesgo es alto.** El informe es el producto final: lo que el perito
entrega al cliente. Un fallo aquí es visible para terceros e inmediato. Las tres
plantillas tienen diferencias reales y deliberadas (estilos de impresión, saltos
de página, tamaños de imagen, numeración de páginas del PDF) que hay que preservar,
no aplanar. Y hoy no hay ninguna prueba que compare la salida antes y después.

**Precondición.** Alguna forma de comparar la salida generada antes y después del
cambio, aunque sea comparación manual de un expediente de referencia exportado en
los dos formatos.

**Nota positiva.** El patrón ya existe y funciona: `meteoHTML` (`394-404`) comparte
plantilla entre Word y PDF con un parámetro para distinguirlos.

**Esfuerzo:** alto · **Riesgo:** alto.

---

## R-14 · Extraer el conocimiento del dominio a `knowledge/`

**Cierra:** DT-06 y DT-05.
**Prioridad: 13.**
**Bloqueada por:** P-01, P-02, P-03, P-04, P-08, P-11, P-12.

**Alcance.** Sacar el baremo, los módulos de arquitectura, los catálogos y las
correspondencias del código a archivos de datos en `knowledge/`, con versión y
fecha de vigencia.

**Por qué está bloqueada.** No se puede diseñar el formato de un catálogo sin
saber quién lo mantiene, cada cuánto cambia, si varía por aseguradora o por
provincia, y si hay que conservar el histórico. Diseñarlo antes de responder a
esas preguntas garantiza rehacerlo.

**Decisión de fondo.** ¿Los catálogos viven como archivos en el repositorio
(sencillo, versionado con git, exige despliegue para cambiarlos) o en la base de
datos (editables sin despliegue, pero requieren pantallas de administración)? Es
la decisión que más condiciona el futuro del producto y merece un ADR propio.

**Esfuerzo:** alto · **Riesgo:** alto (toca los datos que producen los importes).

---

## R-15 · Dividir `Peritia.jsx` en módulos — ⛔ DIFERIDO

**Cierra:** DT-01.

**Estado:** diferido explícitamente por Pol en la sesión 21. Consta en
`CONTEXT.md` desde la auditoría de la sesión 6. **No abordar sin petición
expresa.**

**Alcance previsto, si algún día se aprueba.** División por capas, no por
secciones:

```
lib/dominio/       → motor de cálculo (funciones puras, sin React)
lib/datos/         → catálogos, mientras no estén en knowledge/
lib/supabase/      → sbAuth, sbDb, Storage
lib/ia/            → callClaude y los servicios de IA
components/ui/     → componentes base
components/secciones/ → Sec1…Sec4, Anexos, Informe
components/export/ → plantillas
```

**Orden recomendado, de menor a mayor riesgo:**
1. Prompts (R-08) — solo texto.
2. Motor de cálculo — funciones puras, con las pruebas de R-01 ya escritas.
3. Catálogos de datos — constantes sin lógica.
4. Cliente de Supabase.
5. Componentes base de interfaz.
6. Secciones — lo más grande y arriesgado, al final.

**Precondición absoluta:** R-01. Sin pruebas, este refactor es una apuesta.

---

## R-16 · Errores en pantalla en lugar de `alert()`

**Cierra:** DT-18.
**Prioridad: 14.**

**Alcance.** Sustituir los cuatro `alert()` por avisos en pantalla, siguiendo el
patrón ya establecido en la aplicación (`setGenMsg`, `setUploadErr`,
`setMeteoErr`). La sesión 14 ya hizo esta migración en un punto; se trata de
completarla.

**Esfuerzo:** bajo · **Riesgo:** nulo.

---

## R-17 · Códigos HTTP correctos en los proxys

**Cierra:** DT-14.
**Prioridad: 15.**

**Alcance.** Que `/api/meteocat` y `/api/catastro` devuelvan `400` ante una
entrada inválida, `404` cuando no hay datos y `502` cuando falla un servicio
externo, en vez de `200` con `ok:false`.

⚠ **El cliente actual comprueba `d.ok`, no el código HTTP** (`Peritia.jsx:2249`).
Cambiar los códigos **sin cambiar el cliente a la vez** rompería la verificación
meteorológica y la consulta catastral. Las dos partes van juntas o no van.

**Alternativa de menor riesgo:** mantener los códigos actuales y añadir un
registro estructurado en el servidor, que resuelve el problema de supervisión sin
tocar el contrato.

**Esfuerzo:** bajo · **Riesgo:** medio, precisamente por ese acoplamiento.

---

## R-18 · Guarda de tamaño en los PDFs de entrada

**Cierra:** DT-22.
**Prioridad: 16.**

**Alcance.** Comprobar el tamaño del archivo antes de convertirlo a base64 en las
tres vías de subida de PDF (encargo, póliza y facturas de Sección 3), con un aviso
claro. El patrón ya existe en `SecAnexos` (`ANEXOS_MAX_SIZE`, `3147, 3189-3193`).

**Cálculo del límite:** base64 aumenta el tamaño un 33 %, y el proxy admite 20 MB,
así que el límite real de archivo está en torno a 15 MB.

**Esfuerzo:** bajo · **Riesgo:** nulo.

---

## Secuencia recomendada

Si en algún momento se decide atacar el backlog, este es el orden que minimiza el
riesgo:

```
Fase 0 — Red de seguridad
  R-01  Pruebas del motor de cálculo

Fase 1 — Riesgos críticos (cada una es independiente)
  R-02  Retirar el respaldo a producción   [tras configurar Vercel]
  R-03  Sesión y refresco de token
  R-04  Proteger /api/claude
  R-05  Anexos restringidos                 [tras responder P-07]

Fase 2 — Correcciones de bajo riesgo y alto valor
  R-06  Unificar el cálculo del infraseguro [necesita R-01]
  R-07  Subir las facturas de Sección 3
  R-11  Corregir la documentación
  R-16  Retirar los alert()
  R-18  Guarda de tamaño de PDF

Fase 3 — Preparación estructural
  R-08  Prompts a archivos
  R-12  Unificar utilidades de los proxys
  R-10  Trazabilidad de IA                  [necesita R-04 y R-08]

Fase 4 — Cambios estructurales mayores
  R-13  Plantilla única de informe
  R-14  Conocimiento a knowledge/           [necesita respuestas]

Diferidos por decisión de Pol
  R-09  Validación con esquema
  R-15  División de Peritia.jsx
```

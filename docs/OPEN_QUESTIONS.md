# OPEN_QUESTIONS.md

> Preguntas que **el código no permite responder**. Cada una bloquea o condiciona
> una decisión de arquitectura, y ninguna puede resolverse leyendo el
> repositorio: requieren respuesta de Pol, del Arquitecto de Producto o del
> Arquitecto de Negocio.
>
> **Fecha:** 1 de agosto de 2026
>
> Regla del proyecto: **ante la duda, preguntar en lugar de inventar.** Ninguna de
> estas preguntas se ha resuelto por cuenta propia.

---

## Índice

| Ref. | Pregunta | Bloquea | Urgencia |
|---|---|---|---|
| P-01 | ¿De dónde sale el baremo y cada cuánto se actualiza? | `knowledge/`, DT-06 | Alta |
| P-02 | ¿De dónde salen los módulos de arquitectura y su vigencia? | `knowledge/`, DT-06 | Alta |
| P-03 | ¿Qué son los factores 1,486 / 1,618 / 1,366? | Documentación del dominio | Media |
| P-04 | ¿El 8 % de costes indirectos es constante o variable? | `knowledge/`, catálogos | Media |
| P-05 | ¿Qué provincias debe cubrir el producto? | Datos maestros | Media |
| P-06 | ¿Qué representa el factor 1,08 del cálculo de coste? | DT-16 | Baja |
| P-07 | ¿La publicidad del bucket de anexos es una decisión aceptada? | **DT-11** | **Crítica** |
| P-08 | ¿Las reglas de selección de capital son de negocio o heurísticas? | Reglas de negocio, DT-05 | **Alta** |
| P-09 | ¿Cuánto tiempo deben conservarse los expedientes? | DT-23 | Alta |
| P-10 | ¿El borrado en cascada del usuario es intencionado? | DT-23 | Alta |
| P-11 | ¿Qué ramos debe cubrir el producto? | `knowledge/`, dominio | Alta |
| P-12 | ¿Cuántas aseguradoras hay en producción hoy? | Prioridad de DT-05 | Alta |
| P-13 | ¿"Instant Payment" es un tipo de encargo o un flujo aparte? | Modelo de dominio | Media |
| P-14 | ¿Por qué existe el estado `completado` si nunca se usa? | Ciclo de vida | Media |
| P-15 | ¿La regla proporcional debe aplicarse al contenido por defecto? | Reglas de negocio | Media |
| P-16 | ¿El umbral se supera con "igual o mayor" o con "mayor"? | Reglas de negocio | Media |
| P-17 | ¿Se acepta que los documentos fuente no se conserven? | DT-12, trazabilidad | Alta |
| P-18 | ¿Debe ampliarse la cobertura meteorológica fuera de Catalunya? | Roadmap | Media |
| P-19 | ¿Por qué está desactivado `reactStrictMode`? | DT-20 | Baja |
| P-20 | ¿Quién es el usuario final: perito autónomo o gabinete? | Arquitectura multi-usuario | Alta |
| P-21 | ¿Debe versionarse la póliza a lo largo de su vigencia? | `POLICY_VERSION`, dominio | Media |
| P-22 | ¿`Client` debe existir separado de `Insurer`, o siempre coinciden? | `CLIENT`, `RELATIONSHIPS.md` | Media |

---

## P-01 · ¿De dónde sale el baremo y cada cuánto se actualiza?

`BAREMO` (`Peritia.jsx:28-84`) contiene 47 partidas con precio base sin IVA. El
código no dice de dónde vienen esos precios, de qué año son, quién los mantiene
ni con qué frecuencia deben revisarse.

**Por qué importa.** Los precios de construcción cambian todos los años. Un
informe pericial es un documento con efectos económicos y legales: hay que poder
decir "esta valoración se hizo con el baremo de tal año". Hoy no se puede.

**Preguntas concretas:**
- ¿Es un baremo propio de Pol, de un colegio profesional, de una aseguradora o de
  una base de precios de la construcción?
- ¿Con qué periodicidad se actualiza?
- ¿Debe variar por provincia, como los módulos de arquitectura?
- ¿Debe variar por aseguradora? (`CONTEXT.md` menciona "baremos propios por
  aseguradora" en Fase 2.)
- ¿Hay que conservar las versiones históricas para poder reproducir informes
  antiguos?

**Bloquea:** el diseño de `knowledge/materiales/` y del catálogo de partidas.

---

## P-02 · ¿De dónde salen los módulos de arquitectura y cuál es su vigencia?

`TABLAS_ARQ` (`Peritia.jsx:89-96`) tiene ~1.170 valores €/m². El comentario dice
*"Tablas módulos arquitectura 2025"*, sin más.

**Preguntas concretas:**
- ¿Cuál es la fuente oficial? (¿Colegio de Arquitectos? ¿Ministerio? ¿Elaboración
  propia?)
- ¿Se publican anualmente? ¿Quién debe actualizarlas y cuándo?
- ¿Un informe emitido en 2027 debe usar las tablas de 2027 o las vigentes en la
  fecha del siniestro?
- Solo hay tablas para 6 códigos de provincia (`07`, `08`, `17`, `25`, `43` y
  `00` genérica), mientras que el selector ofrece 13. ¿Es aceptable que Madrid,
  Valencia o Sevilla usen la tabla genérica?

**Bloquea:** el diseño del catálogo de módulos y la corrección de las
valoraciones fuera de Catalunya y Baleares.

---

## P-03 · ¿Qué representan los factores 1,486 / 1,618 / 1,366?

`getFactorArq` (`Peritia.jsx:126-131`) multiplica el módulo por uno de tres
factores según la tipología: 1,486 para vivienda, 1,366 para urbanización, 1,618
para el resto. No hay ningún comentario que los explique.

El valor preexistente del continente —y con él la regla proporcional y, en último
término, la indemnización— depende directamente de ese número.

**Preguntas concretas:**
- ¿Qué son? ¿Gastos generales más beneficio industrial? ¿Honorarios técnicos y
  licencias? ¿Coeficiente de mercado?
- ¿De qué norma o fuente salen?
- ¿Deben revisarse con la misma cadencia que los módulos?
- ¿El 1,618 es un valor deliberado o coincidencia con la proporción áurea?

**Bloquea:** la documentación del dominio y cualquier revisión del motor de
cálculo.

---

## P-04 · ¿El 8 % de costes indirectos es constante o variable?

`PCT_INDIRECTO = 8` (`Peritia.jsx:86`) se aplica siempre, en todos los informes y
para todos los oficios.

**Preguntas concretas:**
- ¿Es un estándar del sector, un criterio de Pol o una imposición de la
  aseguradora?
- ¿Varía por compañía, por ramo o por volumen de obra?
- ¿Puede el perito modificarlo en un informe concreto? (Hoy no, es fijo.)

**Bloquea:** si es variable por aseguradora, pertenece a `knowledge/` como
configuración; si es constante, es una regla de negocio a documentar.

---

## P-05 · ¿Qué provincias debe cubrir el producto?

Hay tres ámbitos distintos y no coinciden:

| Ámbito | Cobertura |
|---|---|
| `PROVINCIAS` (selector) | 12 provincias + "Otras" |
| `TABLAS_ARQ` (módulos €/m²) | 5 provincias + tabla genérica |
| `/api/meteocat` | Solo Catalunya |
| `/api/catastro` | España, salvo País Vasco y Navarra |

**Preguntas concretas:**
- ¿El producto aspira a cubrir toda España o solo Catalunya y alrededores?
- ¿Es aceptable que una valoración en Madrid use la tabla genérica?
- ¿Debe aparecer un aviso al perito cuando trabaja fuera del ámbito con datos
  completos?

**Bloquea:** la prioridad de la integración con AEMET y la ampliación de tablas.

---

## P-06 · ¿Qué representa el factor 1,08 del cálculo de coste?

`Peritia.jsx:3997`: `((tokens.i/1e6*3) + (tokens.o/1e6*15)) * 1.08`.

3 y 15 son claramente los precios por millón de tokens. El `1.08` no se explica.

**Preguntas concretas:** ¿es la conversión de dólar a euro? ¿Un margen? ¿El IVA?
¿Se debe actualizar cuando cambie el tipo de cambio?

**Bloquea:** poco. Es una duda menor, pero deja un número mágico sin dueño.

---

## P-07 · ¿La publicidad del bucket de anexos es una decisión aceptada?

Es la pregunta más urgente del documento.

El bucket `anexos` concede lectura al rol `public`. Fotografías del interior de
domicilios, facturas y documentos personales son accesibles por URL sin sesión.
La migración lo justifica técnicamente (*"necesaria para que los exports a PDF y
Word puedan cargar las imágenes sin sesión"*), pero no consta que se valorase la
implicación de privacidad.

**Preguntas concretas:**
- ¿Se tomó la decisión sabiendo que cualquiera con la URL puede ver el material?
- ¿Se ha informado a los asegurados o a las aseguradoras?
- ¿Se acepta el riesgo mientras se encuentra una alternativa (URLs firmadas con
  caducidad, incrustar las imágenes en base64 al exportar)?

**Bloquea:** DT-11. No se puede proponer una corrección sin saber si el problema
que resolvía la publicidad —cargar imágenes en la exportación— tiene alguna
restricción adicional que desconozco.

---

## P-08 · ¿Las reglas de selección de capital son de negocio o heurísticas?

El prompt de extracción de póliza (`Peritia.jsx:1389`) contiene reglas de negocio
de alto impacto, redactadas en lenguaje natural **dentro del prompt**:

- *"Para DAGUA, RGEXT, INCEN: usa EDIFICIO PRIMER RIESGO si existe con valor>0.
  Si no, usa OBRAS DE REFORMA."*
- *"Para RCEXP, RCLOC: usa el capital de RC, no el de continente."*
- *"NUNCA sumes los valores, elige UNO solo el mas relevante."*
- *"Para contenido: usa el capital principal de Mobiliario y maquinaria, NO
  sublimites."*

Estas reglas determinan qué capital se usa y, por tanto, si hay infraseguro y
cuánto se indemniza.

**Preguntas concretas:**
- ¿Son reglas de negocio del oficio pericial, válidas para cualquier aseguradora?
- ¿O son heurísticas ajustadas a cómo AXA estructura sus pólizas?
- Si son de negocio, deben vivir en la documentación del dominio y aplicarse en
  código verificable, no dentro de un prompt.
- Si son específicas de AXA, deben vivir en `knowledge/` como configuración de esa
  compañía.

**Bloquea:** la separación entre dominio y configuración de aseguradora (DT-05).
Es la pregunta con mayor impacto arquitectónico del documento.

---

## P-09 · ¿Cuánto tiempo deben conservarse los expedientes?

No hay política de retención, ni borrado lógico, ni caducidad. Los expedientes y
sus anexos permanecen indefinidamente.

**Preguntas concretas:**
- ¿Hay obligación legal de conservar un informe pericial durante X años?
- ¿Hay obligación de **borrarlo** pasado ese plazo (minimización del RGPD)?
- Al borrar un expediente, hoy los archivos de Storage quedan huérfanos y siguen
  siendo públicos. ¿Debe el borrado arrastrarlos?
- ¿Hace falta poder exportar todos los datos de un asegurado (derecho de acceso)?

**Bloquea:** `docs/security/` y el diseño del ciclo de vida del expediente.

---

## P-10 · ¿El borrado en cascada del usuario es intencionado?

Ambas claves foráneas apuntan a `auth.users` con `ON DELETE CASCADE`. Borrar la
cuenta de un perito elimina de forma irreversible **todos sus expedientes**.

**Preguntas concretas:**
- ¿Es el comportamiento deseado?
- ¿O los informes deberían sobrevivir al usuario, por su valor legal y contable?
- Si un gabinete tiene varios peritos, ¿la baja de uno debe borrar su trabajo?

**Bloquea:** el modelo de propiedad de los datos y P-20.

---

## P-11 · ¿Qué ramos debe cubrir el producto?

La estructura de carpetas de este sprint prevé `knowledge/hogar/`,
`knowledge/empresa/` y `knowledge/automovil/`. La aplicación actual está
construida **solo para riesgos inmobiliarios**: las cuatro secciones, el baremo de
obra y los módulos €/m² no tienen sentido para un siniestro de automóvil.

**Preguntas concretas:**
- ¿Automóvil está en el plan de producto o la carpeta es preventiva?
- Si lo está, ¿comparte las cuatro secciones o necesita un flujo propio?
- ¿Hay más ramos previstos (responsabilidad civil, decesos, comunidades)?

**Bloquea:** el diseño de `knowledge/` y la decisión sobre si el flujo de informe
debe volverse configurable por ramo.

---

## P-12 · ¿Cuántas aseguradoras hay en producción hoy?

`COMPANIAS` lista 14, pero toda la lógica y los prompts están orientados a AXA.

**Preguntas concretas:**
- ¿Se están haciendo informes reales de otras compañías?
- Si es así, ¿qué tal funciona la extracción de sus pólizas?
- ¿Cuál es la siguiente aseguradora prevista y en qué plazo?

**Bloquea:** la prioridad real de DT-05. Si hoy solo hay AXA, la
independencia de aseguradora es trabajo preventivo; si ya hay varias, es urgente.

---

## P-13 · ¿"Instant Payment" es un tipo de encargo o un flujo aparte?

El código trata `tipoEncargo === 'INSTANT_PAYMENT'` como una variante: la Sección
1 se sustituye por una versión reducida (`Peritia.jsx:2005-2040`) con un texto
generado y sin verificación presencial.

**Preguntas concretas:**
- ¿Es un producto distinto con su propio ciclo de vida, o una modalidad del
  mismo?
- ¿Tiene reglas de valoración o de cobertura propias?
- ¿Es un concepto de AXA o del sector?
- ¿Hay más modalidades previstas?

**Bloquea:** el modelo de dominio del expediente.

---

## P-14 · ¿Por qué existe el estado `completado` si nunca se usa?

El esquema y `CLAUDE.md` documentan tres estados (`borrador`, `completado`,
`exportado`), pero **ningún camino del código escribe `completado`**. La etiqueta
"Pendiente revisión" del dashboard se calcula en vivo, no se guarda.

**Preguntas concretas:**
- ¿Se pensó un paso de revisión que nunca se implementó?
- ¿Debe existir un estado "listo para enviar" distinto de "exportado"?
- ¿O sobra y hay que retirarlo del esquema?

**Bloquea:** la documentación del ciclo de vida del expediente.

---

## P-15 · ¿La regla proporcional debe aplicarse al contenido por defecto?

`reglaPartida` (`Peritia.jsx:284-288`) aplica la regla proporcional solo si el
perito activa el interruptor correspondiente (`s3.reglaContinente` /
`s3.reglaContenido`). Por defecto están desactivados: **el infraseguro se calcula
y se muestra, pero no se aplica** salvo decisión expresa.

**Preguntas concretas:**
- ¿Es correcto que la aplicación de la regla sea siempre una decisión manual?
- ¿Hay casos en que deba aplicarse automáticamente?
- ¿Debe avisarse al perito cuando hay infraseguro y la regla está desactivada?

**Bloquea:** la documentación de la regla proporcional como regla de negocio.

---

## P-16 · ¿El umbral se supera con "igual o mayor" o con "mayor"?

`meteoSupera` (`Peritia.jsx:362-363`) usa `>=`: una racha de exactamente 80 km/h
con umbral de 80 km/h se considera superado.

**Pregunta concreta:** ¿es el criterio correcto según la redacción habitual de las
pólizas, o debería ser estrictamente mayor? La diferencia decide si un siniestro
tiene cobertura o no.

**Bloquea:** la validación de esta regla de negocio.

---

## P-17 · ¿Se acepta que los documentos fuente no se conserven?

Los PDFs del encargo y de la póliza se convierten a base64, se envían a la IA y se
descartan. No queda copia en ningún sitio.

**Preguntas concretas:**
- ¿Es una decisión deliberada (menos datos personales almacenados) o un descuido?
- El requisito de trazabilidad exige registrar el documento de origen y la página.
  ¿Cómo se cumple si el documento no se conserva?
- ¿El perito guarda los originales por su cuenta?

**Bloquea:** DT-12 y el diseño de la trazabilidad.

---

## P-18 · ¿Debe ampliarse la cobertura meteorológica fuera de Catalunya?

`/api/meteocat` solo cubre Catalunya. Fuera de ahí devuelve un mensaje pidiendo
adjuntar el informe manualmente. `CONTEXT.md` registra la integración con AEMET
como opcional.

**Preguntas concretas:** ¿cuántos informes reales caen fuera de Catalunya? ¿Es una
carencia que duela hoy o es teórica? ¿Prioridad frente al resto del roadmap?

---

## P-19 · ¿Por qué está desactivado `reactStrictMode`?

`next.config.js` lo pone a `false` sin explicación. La hipótesis más probable es
evitar el doble montaje de efectos en desarrollo, que con los efectos de
auto-relleno de la Sección 1 podría duplicar llamadas de pago a la IA.

**Pregunta concreta:** ¿se recuerda el motivo? Reactivarlo a ciegas podría
duplicar el gasto en IA durante el desarrollo.

---

## P-20 · ¿Quién es el usuario final: perito autónomo o gabinete?

Hoy el modelo es estrictamente de un usuario: RLS aísla por `user_id` y no hay
concepto de organización, equipo ni roles. `CONTEXT.md` menciona "Multi-usuario
por gabinete pericial" en Fase 3-4.

**Preguntas concretas:**
- ¿El cliente objetivo es el perito autónomo o el gabinete con varios peritos?
- ¿Debe un jefe de equipo ver los expedientes de sus peritos?
- ¿Se prevé que la aseguradora acceda a sus propios expedientes?
- ¿Hace falta separación por organización (*multi-tenant*)?

**Bloquea:** es la pregunta de arquitectura de mayor alcance de todas. La
respuesta condiciona el modelo de datos, el modelo de permisos y el de
facturación. Cuanto más tarde se responda, más caro será cambiarlo.

---

## P-21 · ¿Debe versionarse la póliza a lo largo de su vigencia? — Sprint 1

Surgida al documentar `docs/domain/entities/POLICY_VERSION.md`. Una póliza real
se renueva y sufre suplementos que cambian capitales, franquicias o garantías
contratadas. El sistema actual extrae un único juego de valores por
expediente, sin relación con ninguna versión concreta de la póliza
identificada por su fecha de efecto.

**Preguntas concretas:**
- ¿Ha habido ya, en la práctica, algún expediente donde importara distinguir
  entre dos versiones sucesivas de la misma póliza?
- Si dos siniestros del mismo asegurado ocurren en años distintos, ¿el perito
  hoy vuelve a extraer la póliza cada vez, sin relacionarlo con la extracción
  anterior? ¿Eso ha causado alguna vez una incoherencia entre expedientes?
- ¿Merece la pena modelar `PolicyVersion` como entidad propia, o es
  complejidad prematura para el volumen de trabajo actual?

**Bloquea:** el diseño de `POLICY.md` y `POLICY_VERSION.md` como entidades
reales, y cualquier futura reutilización de una póliza entre expedientes
distintos del mismo riesgo asegurado.

---

## P-22 · ¿`Client` debe existir separado de `Insurer`, o en la práctica siempre coinciden? — Sprint 1

Surgida al documentar `docs/domain/entities/CLIENT.md` y `RELATIONSHIPS.md`,
sección 9. El dominio pericial general distingue "quien encarga y paga la
peritación" de "quien asume el riesgo asegurado", porque no siempre son la
misma parte (una correduría, un despacho jurídico, un particular que pide una
contraperitación). El sistema actual no distingue nada de esto: solo existe
`enc.compania`, un campo de texto libre que se asume simultáneamente como
aseguradora y como origen del encargo.

**Preguntas concretas:**
- En el trabajo real de Pol, ¿ha habido encargos donde quien paga el servicio
  pericial no fuera la propia aseguradora?
- ¿Interviene alguna vez una correduría de forma diferenciada, o los encargos
  llegan siempre directamente de la compañía?
- Si en la práctica `Client` e `Insurer` son siempre la misma entidad, ¿tiene
  sentido mantener la distinción en el modelo de dominio, o es
  sobre-ingeniería para un caso que no ocurre?

**Bloquea:** si `CLIENT.md` y `BROKER.md` deben tratarse como entidades reales
a implementar en algún momento, o si son modelo puramente teórico sin
correspondencia con el negocio real de PERIT.IA.

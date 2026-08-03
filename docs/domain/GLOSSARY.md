# GLOSSARY.md — Lenguaje ubicuo de PERIT.IA

> El vocabulario común entre negocio, documentación y código. Toda entidad,
> regla, evento y nombre de campo del dominio debe usar los términos definidos
> aquí, con el mismo sentido, en cualquier contexto: una conversación con Pol,
> un documento de arquitectura, un prompt de IA o un nombre de variable.
>
> **Fecha:** 1 de agosto de 2026 · Sprint 1 — Domain Model
>
> Convención de esta ficha: **Término** — *forma en inglés si difiere* —
> definición — origen (dominio pericial establecido, o práctica observada en
> PERIT.IA) — término relacionado en el código actual, cuando existe.

---

## Núcleo del negocio

**Siniestro** — *Claim* — Suceso dañoso, súbito o continuado, que activa
potencialmente la cobertura de una póliza de seguro. El siniestro existe en el
mundo real independientemente de que un perito llegue a intervenir. En el
código actual no tiene entidad propia; su fecha y causa viven dentro de
`encargo.fechaSiniestro` / `encargo.causa`.

**Encargo** — *Assignment* — Mandato que una aseguradora, correduría o cliente
directo da a un perito o gabinete pericial para que valore un siniestro
concreto. El encargo es el contrato de servicio entre quien pide la peritación
y quien la realiza; no debe confundirse con el siniestro que se va a peritar.
Es la entidad raíz del sistema actual: cada fila de `informes` es, en la
práctica, un encargo con su expediente adjunto. Ver `ASSIGNMENT.md`.

**Expediente** — *File* — Conjunto documental y de trabajo que un perito
construye para resolver un encargo: datos extraídos, verificaciones,
valoración, conclusiones, anexos y el informe final. En el uso habitual del
sector, "expediente" y "encargo" se emplean a menudo como sinónimos; en este
glosario se distinguen porque el encargo es el mandato y el expediente es el
contenedor de trabajo que ese mandato origina. Corresponde a la fila completa
de `informes` en el código actual.

**Peritación** — *Loss adjustment* — El proceso profesional de examinar un
siniestro, verificar el riesgo, determinar la causa, valorar el daño y emitir
un dictamen sobre la procedencia y cuantía de la indemnización. Es el servicio
que PERIT.IA existe para acelerar.

**Perito** — *Loss adjuster* — Profesional que realiza la peritación. En el
sistema actual es el único rol de usuario que existe: quien se registra, sube
documentos, redacta y exporta. Ver `USER.md` y `ROLE.md`.

**Dictamen** — *Expert opinion / finding* — El juicio técnico y motivado del
perito sobre la causa, el alcance del daño y la procedencia de la cobertura.
El informe pericial es el documento que *contiene* el dictamen, no es el
dictamen en sí mismo: el dictamen es la conclusión razonada, el informe es su
soporte documental completo.

**Informe pericial** — *Expert report* — Documento final, estructurado en
secciones, que el perito entrega como resultado del encargo. En PERIT.IA tiene
cuatro secciones numeradas más los datos de encargo y los anexos. Ver
`REPORT.md`.

---

## La póliza y sus componentes

**Póliza** — *Policy* — Contrato de seguro entre la aseguradora y el
tomador/asegurado, vigente en la fecha del siniestro, cuyas condiciones
determinan si el siniestro tiene cobertura y con qué límites. Ver `POLICY.md`.

**Ramo** — *Line of business* — Categoría general de riesgo que cubre una
póliza (Hogar, Comercio, Comunidades, Industria…). Determina, en gran medida,
qué garantías son aplicables y qué flujo de peritación corresponde.

**Garantía** — *Coverage* — Cada uno de los riesgos concretos que la póliza
cubre (Incendio, Daños por agua, Atmosféricos, Robo, Daños eléctricos, RC
Explotación, RC Locatario…). Una póliza agrupa varias garantías bajo un mismo
contrato. Se corresponde con `TIPOS_GARANTIA` y con las claves de
`franquicias{}`/`descripciones{}` en el código actual (`INCEN`, `DAGUA`,
`RGEXT`, `ROBO`, `DELEC`, `RCEXP`, `RCLOC`). Ver `COVERAGE.md`.

**Subgarantía** — *Sub-coverage* — Desglose de una garantía en conceptos más
finos, cada uno con su propio límite, franquicia o condición (por ejemplo,
dentro de "Daños por agua": rotura de tubería, filtración, atasco). El sistema
actual no modela subgarantías como entidad separada: la granularidad se queda
en el nivel de garantía. Ver `SUBCOVERAGE.md` y `docs/OPEN_QUESTIONS.md`, P-08.

**Continente** — El elemento constructivo del riesgo asegurado: el edificio,
sus instalaciones fijas y elementos estructurales. Se opone a *contenido*. Es
uno de los dos bloques sobre los que se calcula la indemnización.

**Contenido** — El mobiliario, ajuar, maquinaria, mercancía o cualquier bien
mueble situado dentro del continente, no estructural. El otro bloque de
cálculo.

**Capital asegurado** — *Sum insured* — El importe máximo por el que el
tomador ha asegurado el continente o el contenido. No es el valor real del
bien, es el límite contractual de la cobertura.

**Primer riesgo** — Modalidad de aseguramiento en la que el capital asegurado
se establece libremente, sin relación obligatoria con el valor real del bien,
y **no se aplica regla proporcional** aunque el capital sea inferior al valor
real. Se opone a la modalidad a valor total.

**Valor de reposición a nuevo** — *Replacement value* — El coste de reponer el
bien dañado por otro de las mismas características, sin descontar
depreciación por uso o antigüedad.

**Valor real** — *Actual cash value* — El valor de reposición a nuevo menos la
depreciación aplicable por antigüedad, uso o estado de conservación. Es el
importe que habitualmente se indemniza salvo que la póliza cubra a valor de
reposición a nuevo.

**Franquicia** — *Deductible* — La parte del daño que queda siempre a cargo
del asegurado, no indemnizable, ya sea como importe fijo o como porcentaje.
Puede ser general de la póliza o específica de cada garantía.

**Infraseguro** — *Underinsurance* — Situación en la que el capital asegurado
es inferior al valor real del bien en el momento del siniestro. Activa, salvo
en pólizas a primer riesgo, la regla proporcional.

**Regla proporcional** — *Average clause / proportional rule* — Principio por
el que, en caso de infraseguro, la indemnización se reduce en la misma
proporción en que el capital asegurado es inferior al valor real
(`indemnización = daño × capital / valor real`). Es una de las reglas de
cálculo con mayor impacto económico del sistema.

**Efecto de la póliza** — *Effective date* — La fecha en que la póliza (o su
modificación vigente) entra en vigor. Determina qué condiciones, capitales y
franquicias son aplicables a un siniestro concreto.

---

## El riesgo y el daño

**Riesgo asegurado** — *Insured risk* — El bien, inmueble o actividad sobre el
que recae la cobertura de la póliza: la vivienda, el local, la nave. No debe
confundirse con "riesgo" en sentido de probabilidad; en el dominio pericial,
"riesgo" designa habitualmente el objeto asegurado.

**Objeto asegurado** — *Insured object* — Cada elemento identificable, dentro
del continente o del contenido, susceptible de sufrir daño y de ser valorado
de forma independiente (una pared, un electrodoméstico, un lote de mercancía).
El sistema actual no distingue objetos de forma individual: el daño se agrupa
directamente en partidas de reparación. Ver `INSURED_OBJECT.md`.

**Causa** — *Cause of loss* — El hecho generador del siniestro (rotura de
tubería, viento, pedrisco, incendio, robo…). Determina qué garantía es
aplicable y condiciona el procedimiento de verificación (por ejemplo, una
causa atmosférica activa la verificación meteorológica). Ver `CAUSE.md`.

**Daño** — *Damage* — La consecuencia material del siniestro sobre uno o
varios objetos asegurados: lo que hay que reparar o reponer. Ver `DAMAGE.md`.

**Umbral de cobertura** — *Coverage threshold* — El valor mínimo (de viento,
de precipitación) que la póliza exige para considerar cubierto un siniestro
atmosférico. Por debajo del umbral, el evento meteorológico no activa
cobertura aunque haya ocurrido.

**Verificación del riesgo** — Comprobación, documental o presencial, de las
características reales del inmueble asegurado (superficie, tipología,
calidad, año), para poder calcular su valor real y detectar infraseguro. Es la
Sección 1 del informe actual.

---

## La evidencia y la documentación

**Evidencia** — *Evidence* — Cualquier elemento que respalda una afirmación
del dictamen: una fotografía, un documento, una medición, una consulta a un
dato oficial. El proyecto exige que toda conclusión esté respaldada por
evidencia. Ver `EVIDENCE.md`.

**Anexo** — *Attachment* — Documento o fotografía incorporado al expediente
como material de apoyo (fotografías del daño, informe catastral, captura
meteorológica, facturas, presupuestos). Corresponde a `informes.anexos` en el
código actual.

**Documento fuente** — *Source document* — El PDF original del que se ha
extraído información (encargo, póliza, factura). Hoy no se conserva tras la
extracción: ver `docs/OPEN_QUESTIONS.md`, P-17.

**Extracción** — *Extraction* — El proceso, hoy asistido por IA, de convertir
el contenido de un documento fuente en datos estructurados del expediente.

**Inspección** — *Inspection* — La actuación mediante la cual el perito
examina el riesgo, de forma presencial o documental, para verificarlo y
documentar el daño. Ver `INSPECTION.md`.

**Modalidad documental** — Forma de gestión del encargo en la que no hay
visita presencial del perito: la verificación y valoración se resuelven a
partir de la documentación aportada. Se opone a la modalidad presencial.

---

## La valoración económica

**Baremo** — *Price schedule* — Catálogo de precios unitarios de reparación
por oficio y unidad de obra, usado como referencia para valorar el daño
cuando no hay factura ni presupuesto. Corresponde a `BAREMO` en el código
actual.

**Partida** — *Line item* — Cada línea de la valoración: un concepto de
reparación o reposición, con su unidad, cantidad y precio. Es la unidad
mínima de cálculo económico del sistema.

**Costes indirectos** — *Overheads* — Porcentaje añadido sobre el subtotal de
la reparación para cubrir gestión, coordinación y medios auxiliares no
desglosados partida a partida.

**Presupuesto** — *Estimate/Quote* — Documento, aportado por un reparador o
proveedor, que detalla el coste previsto de una reparación aún no ejecutada.

**Factura** — *Invoice* — Documento que acredita una reparación ya ejecutada y
su coste real, con el IVA correspondiente.

**Modo de valoración** — El método con el que se calcula el importe del daño
en un expediente concreto: por baremo, por presupuesto o por factura. Cada
modo tiene una redacción de conclusión distinta.

**Perceptor** — *Payee* — La persona o parte a la que se dirige la propuesta
de indemnización: el propio asegurado, un perjudicado por el siniestro (por
ejemplo, un vecino en un daño por agua) o el reparador cuando cobra
directamente.

**Depreciación** — *Depreciation* — Reducción del valor de reposición por
antigüedad o estado de uso del bien, aplicada para llegar al valor real. En el
sistema actual es siempre una decisión manual del perito.

**Indemnización** — *Indemnity / claim payment* — El importe final propuesto
para resarcir el daño, resultado de aplicar la regla proporcional (si
procede) al daño valorado y descontar la franquicia.

---

## Los actores del negocio

**Asegurado** — *Insured* — La persona o entidad titular del interés
asegurado, cuyo bien o actividad sufre el siniestro. No es, salvo excepción,
quien contrata al perito.

**Tomador** — *Policyholder* — Quien contrata la póliza y asume las
obligaciones frente a la aseguradora. Con frecuencia coincide con el
asegurado, pero no siempre (por ejemplo, un arrendador que asegura un
inmueble ocupado por un inquilino).

**Aseguradora** — *Insurer* — La compañía que emite la póliza, asume el
riesgo y encarga —directamente o a través de una correduría— la peritación.
Ver `INSURER.md`.

**Correduría** — *Broker* — Intermediario que gestiona la póliza entre el
tomador y la aseguradora, y que en ocasiones es quien encarga la peritación en
nombre de la aseguradora. No existe como concepto en el sistema actual. Ver
`BROKER.md`.

**Perjudicado** — *Third-party claimant* — Persona distinta del asegurado que
sufre un daño causado por el siniestro y que puede ser perceptor de la
indemnización, típicamente en garantías de responsabilidad civil.

**Reparador** — *Repairer* — El profesional o empresa que ejecuta la
reparación del daño, y que en determinados modos de cobro percibe
directamente la indemnización.

**Gabinete pericial** — *Adjusting firm* — Organización que agrupa a varios
peritos bajo una misma estructura de trabajo. No existe en el sistema actual,
que es de un único usuario. Ver `ORGANIZATION.md` y `docs/OPEN_QUESTIONS.md`,
P-20.

---

## Referencias cruzadas

Cada término con documento propio enlaza a `docs/domain/entities/`. Las reglas
que se derivan directamente de estas definiciones están en `BUSINESS_RULES.md`.
Los términos marcados como ausentes del sistema actual están, además,
recogidos como aspectos a decidir en `docs/OPEN_QUESTIONS.md`.

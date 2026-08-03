# BUSINESS_RULES.md — Reglas de negocio de PERIT.IA

> Reglas del negocio de la peritación de seguros, no reglas técnicas. Cada
> regla se clasifica por su origen:
>
> - **[Verificada]** — se deduce sin ambigüedad del código actual y es
>   coherente con el dominio pericial general.
> - **[Dominio]** — regla propia del oficio de la peritación de seguros,
>   independiente de PERIT.IA, aplicada con generalidad en el sector.
> - **[Abierta]** — el código sugiere un comportamiento, pero no hay forma de
>   confirmar si es una regla de negocio deliberada o una decisión implícita
>   de implementación. Referenciada en `docs/OPEN_QUESTIONS.md`.
>
> Ninguna regla de esta lista se ha inventado sin apoyo: donde falta ese
> apoyo, la regla se marca como abierta en vez de darse por buena.
>
> **Fecha:** 1 de agosto de 2026 · Sprint 1 — Domain Model

---

## 1. Reglas sobre la estructura de la póliza

**BR-01 · [Verificada]** Una póliza pertenece a una única compañía
aseguradora.

**BR-02 · [Verificada]** Una garantía pertenece siempre a una póliza; no
existe garantía sin póliza que la contenga.

**BR-03 · [Dominio]** Una subgarantía pertenece siempre a una garantía que la
contiene, y hereda su condición de estar contratada o no.

**BR-04 · [Verificada]** Una póliza cubre uno o varios ramos, y dentro de cada
ramo, una o varias garantías (`TIPOS_GARANTIA`: Continente, Contenido,
Terceros implicados, combinadas con las garantías por causa).

**BR-05 · [Dominio]** Una garantía puede aplicarse de forma independiente al
continente y al contenido, con capitales, franquicias y textos de cobertura
distintos para cada bloque. Verificado en el código: `descripciones{}` separa
`continente` y `contenido` para cada garantía (`Peritia.jsx:1389`).

**BR-06 · [Abierta]** ¿Puede una póliza cambiar de condiciones a lo largo de
su vigencia (renovación, suplemento) de forma que dos siniestros de la misma
póliza en fechas distintas deban valorarse con capitales o franquicias
diferentes? El sistema actual no versiona la póliza: solo existe un juego de
valores por expediente. Ver `docs/OPEN_QUESTIONS.md`, P-08 (relacionada) y la
nueva pregunta P-21 de este sprint.

---

## 2. Reglas sobre el riesgo y el daño

**BR-07 · [Dominio]** Un daño puede afectar a varios objetos asegurados, y un
objeto asegurado puede sufrir varios daños de distinta naturaleza a lo largo
de un mismo siniestro.

**BR-08 · [Dominio]** Un daño se imputa siempre a una garantía concreta
(continente o contenido de una cobertura determinada); no puede quedar sin
imputación si va a ser indemnizado. Verificado: cada partida de `s3.partidas`
lleva un campo `garantia` (`continente`/`contenido`).

**BR-09 · [Dominio]** La causa del siniestro condiciona qué garantía es
aplicable; una causa puede activar más de una garantía a la vez (por ejemplo,
un temporal puede producir daño por viento y, además, daño por agua de
lluvia). Verificado: `CAUSA_COB` mapea varias causas a la misma garantía y
`causasMeteo()` evalúa viento, lluvia y pedrisco de forma independiente.

**BR-10 · [Dominio]** Un siniestro de causa atmosférica solo tiene cobertura
si los valores medidos (racha de viento, intensidad de lluvia) igualan o
superan el umbral fijado por la póliza para esa garantía. Verificado:
`meteoSupera()`. **Matiz abierto:** si el umbral se supera con "igual o mayor"
o estrictamente "mayor" es una pregunta de redacción de póliza, no resuelta
—ver `docs/OPEN_QUESTIONS.md`, P-16.

**BR-11 · [Verificada]** Un siniestro solo puede verificarse meteorológicamente
de forma automática si su ubicación está dentro del ámbito de la red de
estaciones disponible (hoy, Catalunya). Fuera de ese ámbito, la verificación
exige aportación manual del informe meteorológico.

**BR-12 · [Dominio]** El infraseguro se produce cuando el capital asegurado es
inferior al valor real del bien en el momento del siniestro, y da lugar a la
regla proporcional — salvo que la póliza esté contratada a primer riesgo, en
cuyo caso el infraseguro no se penaliza.

**BR-13 · [Verificada]** El infraseguro y la regla proporcional se calculan de
forma independiente para el continente y para el contenido: un expediente
puede tener infraseguro en uno de los dos bloques y no en el otro.

**BR-14 · [Abierta]** ¿La regla proporcional, una vez detectado el
infraseguro, debe aplicarse siempre, o queda a criterio del perito activarla
caso por caso? El código actual la deja como interruptor manual, desactivado
por defecto (`s3.reglaContinente`/`s3.reglaContenido`). No hay confirmación de
si ese es el comportamiento de negocio correcto o una limitación de
implementación. Ver `docs/OPEN_QUESTIONS.md`, P-15.

---

## 3. Reglas sobre la valoración económica

**BR-15 · [Verificada]** El valor real de una partida es el valor de
reposición a nuevo, menos la depreciación aplicable, más el IVA cuando
corresponde (`vReal = vRepos × (1 − %depr) + IVA`).

**BR-16 · [Verificada]** Cuando la valoración se hace por baremo, el IVA de
cada partida es siempre 0 %: el baremo se usa "a modo informativo", sin
repercusión fiscal.

**BR-17 · [Verificada]** Cuando la valoración se hace por factura, el IVA es
el que consta en el documento aportado.

**BR-18 · [Dominio]** La depreciación por antigüedad o uso nunca se aplica de
forma automática: es siempre una decisión explícita del perito, partida a
partida.

**BR-19 · [Verificada]** Los costes indirectos de una valoración por baremo se
calculan como un porcentaje fijo (8 %) sobre el subtotal de reposición de las
demás partidas, y nunca se aplican sobre valoraciones por factura o
presupuesto.

**BR-20 · [Abierta]** ¿El porcentaje de costes indirectos es un estándar del
oficio, un criterio propio de Pol, o una condición impuesta por alguna
aseguradora? Ver `docs/OPEN_QUESTIONS.md`, P-04.

**BR-21 · [Dominio]** La indemnización nunca puede ser negativa: si la
franquicia iguala o supera el daño ajustado, la indemnización es cero.

**BR-22 · [Verificada]** La franquicia aplicable a un expediente es la
específica de la garantía afectada si existe, y si no, la franquicia general
de la póliza.

**BR-23 · [Dominio]** La redacción de la propuesta de indemnización depende
del modo de valoración y del perceptor: por baremo no se redacta propuesta
económica (el baremo es orientativo); por presupuesto se condiciona a la
aportación posterior de factura; por factura con perceptor reparador la
propuesta va dirigida al reparador, no al asegurado.

**BR-24 · [Dominio]** Cuando el perceptor es el reparador, el importe de la
indemnización no debe mostrar la depreciación como si fuera aplicable al
asegurado: el reparador cobra el coste de la reparación efectivamente
realizada.

---

## 4. Reglas sobre la evidencia y la trazabilidad

**BR-25 · [Dominio, exigida por CLAUDE.md]** Toda conclusión del informe debe
estar respaldada por evidencia: ninguna afirmación de causa, alcance de daño o
procedencia de cobertura puede sostenerse solo en la palabra del perito sin un
elemento verificable que la acompañe.

**BR-26 · [Dominio, exigida por CLAUDE.md]** Todo informe debe ser trazable:
cada dato relevante debe poder remontarse a su origen (documento, extracción
de IA, medición externa o introducción manual del perito).

**BR-27 · [Dominio, exigida por CLAUDE.md]** Todo documento conserva siempre
su versión original: una corrección posterior no debe hacer desaparecer el
dato tal y como se extrajo o se recibió en primer lugar.

**BR-28 · [Dominio, exigida por CLAUDE.md]** Nunca se sobrescriben datos
extraídos por IA: la corrección del perito se guarda como un valor adicional
o preferente, no reemplazando en silencio lo que la IA extrajo. **Nota de
contraste con el código actual:** hoy esta regla se cumple solo parcialmente
—algunos campos usan el patrón *valor extraído + campo de corrección*
(`capContOverride`, `capCont2Override`), pero la mayoría de campos de
`encargo` se sobrescriben directamente al editar. Ver la tabla de brechas en
`DOMAIN_MODEL.md`, sección 6.

**BR-29 · [Dominio]** Una fotografía puede justificar varios daños distintos
(por ejemplo, una imagen general de una estancia respalda varias partidas de
esa misma estancia), y un daño puede estar respaldado por varias fotografías.

**BR-30 · [Abierta]** ¿Deben conservarse los documentos fuente completos
(PDF de encargo, póliza, facturas) tras la extracción, o es aceptable
descartarlos por minimización de datos personales? Ver
`docs/OPEN_QUESTIONS.md`, P-17. Esta pregunta condiciona directamente si
BR-26 y BR-27 pueden llegar a cumplirse del todo.

---

## 5. Reglas sobre el ciclo de vida del expediente

**BR-31 · [Dominio]** Un expediente no puede exportarse como informe
definitivo si las secciones que el propio informe declara obligatorias no
están completas. **Nota:** el sistema actual no impone esta regla como
bloqueo: el panel de "Pendientes" la muestra como aviso, pero no impide
exportar con bloques pendientes.

**BR-32 · [Dominio]** Un expediente que ya ha sido exportado puede seguir
editándose y volver a exportarse: la exportación no cierra el expediente ni lo
hace inmutable. **Nota:** verificado en el código — `estado='exportado'` no
bloquea ninguna edición posterior.

**BR-33 · [Abierta]** ¿Debe existir un estado de "informe cerrado" a partir
del cual ya no se pueda modificar, por su valor como documento con efectos
legales frente a terceros? Ver `docs/OPEN_QUESTIONS.md`, P-14 (relacionada
con el estado `completado` que existe en el esquema pero nunca se usa).

**BR-34 · [Dominio]** Un expediente gestionado en modalidad documental
(Instant Payment) no requiere verificación presencial del riesgo, pero sigue
exigiendo identificar la causa y valorar el daño con el mismo rigor que un
expediente presencial.

---

## 6. Reglas sobre actores y acceso

**BR-35 · [Verificada]** Cada perito accede únicamente a sus propios
expedientes; no hay visibilidad cruzada entre peritos distintos. Verificado
por las políticas RLS de `informes` y `perfiles` (Sprint 0, `DB_MODEL.md`).

**BR-36 · [Abierta]** ¿Debe un responsable de gabinete poder ver los
expedientes de los peritos a su cargo? Depende de si el cliente objetivo es el
perito autónomo o el gabinete con equipo. Ver `docs/OPEN_QUESTIONS.md`, P-20.

**BR-37 · [Dominio, aspiracional]** La aseguradora que encarga la peritación
es, salvo pacto en contrario, quien recibe el informe final; el asegurado
puede tener derecho a una copia según la normativa aplicable, pero no es, por
defecto, el destinatario contractual del informe. **Esta regla no está
implementada**: hoy no existe concepto de "destinatario" ni de entrega
controlada del informe.

---

## 7. Reglas sobre independencia de aseguradora

**BR-38 · [Dominio, exigida por CLAUDE.md]** La plataforma debe funcionar de
forma equivalente para cualquier aseguradora: ninguna regla de cálculo, de
cobertura o de flujo debe depender de código específico de una compañía.
**Nota de contraste:** el código actual **incumple** esta regla — ver Sprint
0, `TECHNICAL_DEBT.md`, DT-05. El prompt de extracción de póliza está descrito
como especializado para "pólizas AXA y similares", y contiene reglas de
selección de capital que no consta si son del oficio pericial en general o
específicas de cómo AXA estructura sus pólizas (ver P-08).

**BR-39 · [Abierta]** ¿Existen ya en producción informes de aseguradoras
distintas de AXA, y con qué grado de fiabilidad de extracción? Ver
`docs/OPEN_QUESTIONS.md`, P-12.

---

## 8. Reglas que este sprint NO ha podido confirmar como reglas de negocio

Listadas aquí para que no se pierdan, aunque su desarrollo completo esté en
`docs/OPEN_QUESTIONS.md`:

- Vigencia y actualización del baremo de reparación (P-01).
- Vigencia y fuente de los módulos de arquitectura €/m² (P-02).
- Significado de los factores de arquitectura 1,486 / 1,618 / 1,366 (P-03).
- Alcance geográfico real que el producto debe cubrir (P-05).
- Política de retención de expedientes y evidencias (P-09).
- Si el borrado de un usuario debe arrastrar sus expedientes (P-10).
- Qué ramos, más allá de Hogar/Comunidades, debe cubrir el producto (P-11).

**Ninguna de estas preguntas se ha resuelto por decisión propia.** Es
deliberado: inventar la respuesta sería precisamente lo que este sprint tiene
prohibido hacer.

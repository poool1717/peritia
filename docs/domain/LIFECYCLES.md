# LIFECYCLES.md — Ciclo de vida completo de las entidades principales

> Mientras `STATE_MACHINES.md` documenta los estados formales de cada entidad,
> este documento narra su **ciclo de vida completo, extremo a extremo**: desde
> que nace hasta que deja de ser relevante para el negocio, incluyendo quién
> la crea, quién la modifica, qué la hace madurar y cómo (o si) termina.
>
> **Fecha:** 1 de agosto de 2026 · Sprint 1 — Domain Model

---

## 1. Ciclo de vida del `Assignment` (Encargo)

**Nace** cuando una aseguradora, correduría o cliente directo confía a un
perito la valoración de un siniestro. En PERIT.IA, el nacimiento se
materializa con la subida del PDF de encargo.

**Madura** a medida que se completan sus fases: verificación del riesgo,
determinación de la causa, valoración del daño, redacción de conclusiones.
Cada fase añade certeza y reduce lo pendiente — es la lógica detrás del
semáforo de completitud del sistema actual.

**Puede bloquearse** si falta documentación esencial (la póliza no llega, el
asegurado no facilita acceso al inmueble, una factura pendiente de un
reparador). El modelo conceptual (`STATE_MACHINES.md`) prevé un estado
explícito para esto; hoy se resuelve dejando el expediente en un semáforo
naranja indefinidamente, sin que el sistema distinga "en curso normal" de
"bloqueado".

**Se resuelve** cuando el informe se genera, se revisa y se exporta.

**Puede reabrirse** tras la entrega, si surge nueva evidencia, una objeción de
la aseguradora o un error detectado. El sistema actual permite la reapertura
de forma trivial —editar y volver a exportar— pero no la distingue de una
edición ordinaria ni dejar rastro de que ha ocurrido una reapertura.

**Termina** (conceptualmente) cuando se cierra de forma definitiva, tras la
entrega y sin más acción prevista. **El sistema actual no tiene fin de vida
para el expediente**: un expediente exportado sigue siendo editable
indefinidamente, y solo desaparece si alguien lo borra explícitamente. No hay
archivado automático ni política de retención (ver `docs/OPEN_QUESTIONS.md`,
P-09).

**Puede desaparecer** por borrado explícito del perito. Ese borrado, hoy, es
irrevocable y no arrastra los archivos de evidencia asociados en Storage, que
quedan huérfanos (Sprint 0, `DB_MODEL.md`, sección 8).

---

## 2. Ciclo de vida del `Claim` (Siniestro)

**Nace en el mundo real**, no en el sistema: el siniestro ocurre cuando se
produce el hecho dañoso, con independencia de cuándo se sepa de él o se
encargue su peritación. El sistema solo lo *representa* a partir del momento
en que se recibe el encargo.

**Se identifica** mediante los datos extraídos del PDF de encargo: fecha,
causa, lugar, garantía afectada.

**Se enriquece** con cada verificación: la meteorológica, la catastral, la
visual (fotografías). Cada una añade una faceta al siniestro sin cambiar el
hecho en sí.

**Nunca se "cierra"** en sentido propio: un siniestro es un hecho histórico
inmutable. Lo que se cierra es el *expediente* que lo documenta, no el
siniestro mismo. Esta distinción —hoy inexistente en el código, donde
`Claim` no tiene identidad separada de `Assignment`— importa para el futuro:
un mismo siniestro podría, en teoría, dar lugar a más de un encargo a lo
largo del tiempo (una revisión, una segunda opinión), y sería el mismo
siniestro documentado dos veces, no dos siniestros distintos.

---

## 3. Ciclo de vida de la `Policy` (Póliza) y su `PolicyVersion`

**Nace** cuando la aseguradora la emite, fuera del sistema.

**Entra en el dominio de PERIT.IA** cuando se aporta como documento en un
encargo y se extrae su contenido.

**Puede tener varias versiones a lo largo de su vigencia** — renovaciones,
suplementos que cambian capitales o añaden garantías. **Conceptual, no
implementado**: el sistema actual trata cada expediente como si tuviera una
única fotografía de la póliza, la vigente en el momento de la extracción, sin
relación con ninguna versión concreta identificada por fecha de efecto. Si dos
siniestros de la misma póliza ocurren en momentos distintos con condiciones
distintas, hoy no hay forma de representarlo como *la misma póliza en dos
estados*: cada expediente extrae sus propios valores de forma independiente.

**No caduca dentro del sistema**: PERIT.IA no gestiona la vigencia de la
póliza como tal, solo la interpreta en el contexto puntual de un siniestro.

---

## 4. Ciclo de vida del `InsuredObject` (Objeto asegurado)

**Conceptual: esta entidad no existe hoy en el código**, así que su ciclo de
vida se describe enteramente en términos del modelo objetivo.

**Nace** cuando el perito identifica, durante la verificación del riesgo, un
elemento del continente o del contenido susceptible de sufrir o haber sufrido
daño.

**Persiste** mientras el objeto siga existiendo, con independencia de que
sufra o no más siniestros en el futuro — a diferencia del expediente, que es
efímero, el objeto asegurado (una vivienda, una nave) tiene continuidad más
allá de un único siniestro.

**Acumula historial de daños** a lo largo de sucesivas peritaciones, si el
sistema llegara a vincular expedientes distintos sobre el mismo objeto —hoy
imposible, porque cada expediente es una isla de datos sin relación con
otros.

**No se "cierra"**: un objeto asegurado deja de ser relevante para el sistema
cuando deja de estar asegurado, un hecho externo que PERIT.IA no tiene forma
de conocer ni de representar hoy.

---

## 5. Ciclo de vida del `Damage` (Daño)

**Nace** cuando el perito, durante la verificación o el análisis, identifica
una consecuencia material del siniestro sobre un objeto asegurado.

**Se describe** en lenguaje natural (dictado o escrito), y esa descripción
puede mejorarse con asistencia de IA (IA-6, IA-7) sin perder el texto
original del perito.

**Se valora económicamente**, por una de tres vías excluyentes: baremo,
presupuesto o factura.

**Se imputa a una garantía** concreta, lo que determina si tiene cobertura y
bajo qué condiciones.

**Puede excluirse del cálculo** sin desaparecer del expediente: el campo
`cobertura` permite marcar una partida como no cubierta, conservándola visible
mientras se excluye del importe indemnizable — una decisión de diseño que
respeta el principio de no perder información, aplicada aquí correctamente.

**Termina su ciclo de vida** cuando el informe se cierra (conceptualmente) o,
en la práctica actual, cuando el expediente se exporta y no se vuelve a tocar.

---

## 6. Ciclo de vida de la `Evidence` (Evidencia)

**Nace** en el momento de la captura: una fotografía tomada durante la
inspección, un documento aportado por el asegurado o el reparador, una
captura automática de una fuente oficial (Catastro, XEMA).

**Se incorpora al expediente** mediante subida a almacenamiento.

**Debería vincularse a los daños o afirmaciones que respalda** (BR-25, BR-29).
**Conceptual, parcialmente implementado**: hoy la evidencia se agrupa en
pestañas por tipo (fotos, catastro, meteosim, facturas, presupuestos), pero no
existe una relación explícita entre una fotografía concreta y el daño
concreto que justifica — la asociación es solo visual e implícita, a cargo del
lector del informe.

**Puede perderse su origen**: el documento fuente completo (el PDF del
encargo o de la póliza) no se conserva tras la extracción (ver
`docs/OPEN_QUESTIONS.md`, P-17). La evidencia fotográfica sí persiste en
Storage, pero sin registro de cuándo ni con qué dispositivo se capturó, más
allá de lo que el propio archivo pueda llevar incrustado.

**No caduca ni se archiva**: permanece indefinidamente vinculada al
expediente, con el mismo problema de retención no resuelto que el propio
expediente (P-09), y con el agravante de que hoy es de **acceso público**
(Sprint 0, DT-11).

---

## 7. Ciclo de vida del `Estimate` / `Invoice` / `Repair`

**Nace** cuando el perito elige un modo de valoración para un daño.

**Se compone** de partidas (`Repair`), cada una nacida de tres formas
posibles: seleccionada del baremo con asistencia de IA, introducida a mano, o
extraída de un documento (presupuesto o factura) con asistencia de IA.

**Madura** conforme el perito ajusta cantidades, precios, IVA y depreciación.

**Se congela conceptualmente** cuando el perito considera la valoración
definitiva y avanza a la sección siguiente — aunque, en la práctica actual,
nada impide volver atrás y modificarla en cualquier momento, incluso después
de exportado el informe.

**Puede fallar en su persistencia**: las facturas adjuntadas específicamente
en la Sección 3 (para que la IA las lea) no se suben nunca a almacenamiento
permanente y se pierden al recargar el expediente (Sprint 0, DT-13) — un
fallo del ciclo de vida real, no solo una limitación conceptual.

---

## 8. Ciclo de vida del `Report` (Informe)

**Nace** desde el primer dato del encargo: conceptualmente, el informe existe
—aunque incompleto— desde el instante en que se crea el expediente, porque la
vista previa se compone en vivo con lo que haya en cada momento.

**Crece** sección a sección, sin un orden estrictamente obligatorio (el perito
puede saltar entre secciones), aunque el flujo habitual sigue el orden natural
del oficio: encargo → verificación → causas → valoración → cobertura →
anexos.

**Se materializa** en el momento de exportar, en dos formas independientes
(PDF y Word), cada una generada por su propia implementación (Sprint 0, DT-07)
— lo que significa que, en rigor, **no hay un único informe que se
materializa dos veces, sino dos construcciones paralelas** que deberían
coincidir y a veces no lo hacen del todo (DT-08).

**No tiene versión histórica**: cada exportación sobrescribe conceptualmente
a la anterior en la percepción del perito, aunque el archivo ya descargado
persista fuera del sistema. PERIT.IA no guarda un histórico de qué contenía
el informe en cada exportación sucesiva.

**Termina** su ciclo de vida activo cuando se entrega al destinatario, aunque,
como se ha dicho, nada en el sistema impide seguir modificándolo después.

---

## 9. Ciclo de vida del `User` (Perito)

**Nace** con el registro (email y contraseña, sin confirmación de email
exigida). El trigger `handle_new_user` crea automáticamente su fila de
`perfiles`.

**Trabaja** a través de una sesión que, hoy, **no sobrevive a un recierre del
navegador ni al paso de una hora** (Sprint 0, DT-03) — el ciclo de vida de la
sesión es más corto que el de cualquier tarea real de peritación, lo cual es
una fricción de uso diaria, no solo un detalle técnico.

**Acumula expedientes** a lo largo del tiempo, todos bajo su propiedad
exclusiva (aislamiento por RLS).

**Puede darse de baja**: al borrar la cuenta, `ON DELETE CASCADE` arrastra
—de forma irreversible— todos sus expedientes. No hay período de gracia, ni
exportación previa forzosa, ni traspaso de propiedad a un compañero de
gabinete (que, además, no existe como concepto). Ver `docs/OPEN_QUESTIONS.md`,
P-10.

---

## 10. Observación transversal

En casi todos los ciclos de vida descritos aparece el mismo patrón: **el
sistema actual modela el nacimiento y el crecimiento de las entidades con
razonable fidelidad al negocio, pero no modela su final.** No hay cierre, no
hay archivado, no hay retención, no hay versión histórica de lo entregado. Es
coherente con el origen del proyecto —una herramienta para acelerar la
redacción de un informe— y se convierte en una carencia a medida que el
sistema aspira a sostener procesos de negocio completos y de más largo plazo.
Esta observación alimenta varias de las propuestas de ADR del resumen
ejecutivo de este sprint.

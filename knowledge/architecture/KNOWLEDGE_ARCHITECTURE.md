# KNOWLEDGE_ARCHITECTURE.md — Arquitectura de la Base de Conocimiento de PERIT.IA

> Documento fundacional del Sprint 2. Define qué es una unidad de
> conocimiento, cómo se tipa, se relaciona, se versiona, se valida, se
> reutiliza, se referencia, se consume y se mantiene.
>
> **Premisa estratégica:** PERIT.IA no es un generador de informes con IA. Es
> una plataforma de conocimiento asegurador. La IA es un **consumidor** de ese
> conocimiento, no su fuente. El activo del proyecto es la base de
> conocimiento; el motor de IA es reemplazable, la base de conocimiento no.
>
> **Fecha:** 1 de agosto de 2026 · Sprint 2 — Knowledge Architecture
> **Depende de:** `docs/domain/` (Sprint 1) para el vocabulario y las
> entidades del dominio; `docs/CURRENT_IMPLEMENTATION.md` y
> `docs/AI_INVENTORY.md` (Sprint 0) para contrastar con dónde vive hoy el
> conocimiento (incrustado en código y en prompts).
>
> **Alcance de este sprint:** diseño del sistema que alojará el conocimiento.
> No se carga contenido real más allá de los ejemplos ilustrativos
> imprescindibles para explicar el modelo.

---

## 1. ¿Qué es una unidad de conocimiento?

Una **unidad de conocimiento** (*Knowledge Unit*, en adelante `KU`) es la
pieza atómica y direccionable de conocimiento validado sobre el dominio
pericial asegurador. Es atómica porque representa un único hecho, regla,
definición, procedimiento o ejemplo — no un documento completo ni una mezcla
de varios conceptos. Es direccionable porque tiene un identificador único y
estable al que cualquier otra pieza del sistema (código, prompt, otra unidad
de conocimiento) puede referirse sin duplicar su contenido.

Toda `KU`, con independencia de su tipo, comparte el mismo **sobre de
metadatos** — la envoltura común que la hace gestionable, versionable y
auditable — y difiere únicamente en su **cuerpo** (el contenido específico de
su tipo).

### 1.1. Sobre de metadatos común

```yaml
id: knowledge://coverages/DAGUA           # identificador único y estable (ver sección 7)
tipo: coverage                            # ver taxonomía de tipos, sección 2
version: 3                                # entero incremental (ver sección 4)
estado: aprobado                          # borrador | en_revision | aprobado | deprecado (ver quality/QUALITY_RULES.md)
vigenciaDesde: 2026-01-01                 # a partir de cuándo es válida esta versión
vigenciaHasta: null                       # null = vigente
ambito:                                   # a qué recorta su aplicabilidad
  ramo: [hogar, comunidades]
  aseguradora: null                       # null = general, no específica de ninguna
  provincia: null                         # null = sin restricción geográfica
fuente:                                   # de dónde procede (trazabilidad, BR-26)
  tipo: elaboracion_propia                # elaboracion_propia | normativa | extraido_de_documento | confirmado_por_perito
  referencia: null
confianza: alta                           # alta | media | baja | sin_verificar
autor: pol                                # quién la creó o la validó por última vez
revisadoPor: null                         # quién la revisó, si aplica
relaciones: []                            # ver knowledge/ontology/ y knowledge/relationships/
```

### 1.2. El cuerpo, según el tipo

El cuerpo es libre en estructura mientras respete el esquema de su tipo (ver
sección 2). Puede ser una definición de una frase (glosario), una tabla de
correspondencia (mapeo), un árbol de decisión (regla), una plantilla con
huecos, o un caso completo (ejemplo).

---

## 2. ¿Qué tipos existen?

| Tipo | Carpeta | Qué representa | Ejemplo |
|---|---|---|---|
| `branch` | `branches/` | Un ramo asegurador | Hogar |
| `coverage` | `coverages/` | Una garantía | Daños por agua |
| `subcoverage` | `subcoverages/` | Un desglose de garantía | Filtración por cubierta |
| `insured_object` | `insured_objects/` | Un tipo de objeto asegurado | Tubería de suministro |
| `cause` | `causes/` | Una causa de siniestro | Rotura de tubería |
| `damage` | `damages/` | Un tipo de daño | Humedad por filtración |
| `material` | `materials/` | Un material de construcción o bien | Baldosa cerámica |
| `repair` | `repairs/` | Un método de reparación | Enlucido con mortero |
| `document` | `documents/` | Un tipo de documento y su exigencia | Factura de reparación |
| `report` | `reports/` | Conocimiento sobre redacción de informe | Estructura de la Sección 4 |
| `legal` | `legal/` | Una referencia legal | Ley de Contrato de Seguro, art. 26 |
| `regulation` | `regulations/` | Una norma técnica | Código Técnico de la Edificación |
| `procedure` | `procedures/` | Un procedimiento pericial | Verificación de riesgo presencial |
| `checklist` | `checklists/` | Una lista de comprobación | Antes de exportar el informe |
| `rule` | `rules/` | Una regla ejecutable | Si franquicia ≥ daño → indemnización 0 |
| `example` | `examples/` | Un caso de referencia | Extracción correcta de póliza AXA Hogar |
| `template` | `templates/` | Una plantilla reutilizable | Redacción de párrafo de causas |
| `synonym_set` | `synonyms/` | Un conjunto de variantes equivalentes | "AXA" ≡ "AXA Seguros" ≡ "AXA Seguros Generales SA" |
| `mapping` | `mappings/` | Una correspondencia entre vocabularios | Garantía canónica ↔ nomenclatura de una aseguradora |
| `relationship_instance` | `relationships/` | Una relación concreta ya poblada | DAGUA → protege → Tubería de suministro |
| `glossary_term` | `glossary/` | Un término definido | Infraseguro |
| `catalog_entry` | (dentro de cada catálogo, ver `catalogs/CATALOGS.md`) | Una entrada de un catálogo cerrado | — |

El catálogo completo de tipos es, en sí mismo, una `KU` de tipo especial
(*meta-catálogo*): esta misma tabla debería vivir, en su forma madura, como
una unidad de conocimiento consultable, no solo como una sección de este
documento.

---

## 3. ¿Cómo se relacionan?

Dos mecanismos distintos, complementarios, no sustitutivos entre sí:

1. **Relaciones declaradas dentro del sobre de metadatos** (campo
   `relaciones`): enlaces directos, del tipo "esta unidad depende de aquella",
   "esta unidad sustituye a aquella otra". Sirven para navegación e integridad
   referencial.
2. **El modelo ontológico** (`knowledge/ontology/ONTOLOGY.md`): define los
   *tipos* de relación con sentido de negocio entre *tipos* de concepto
   (Garantía *protege* Objeto, Daño *puede repararse mediante* Método). Las
   instancias concretas de esas relaciones son las `KU` de tipo
   `relationship_instance`.

La distinción importa: el primer mecanismo es de fontanería del propio
sistema de conocimiento (qué depende de qué para no romperse al versionar); el
segundo es conocimiento de negocio en sí mismo (qué protege qué, según el
oficio pericial).

---

## 4. ¿Cómo se versionan?

Cada `KU` lleva un número de versión entero, incremental, sin semántica de
compatibilidad (no es semver: el conocimiento no tiene "cambios menores",
cualquier cambio de contenido es una versión nueva).

**Regla central: nunca se sobrescribe una versión anterior.** Una corrección
crea una versión nueva; la anterior se marca con `vigenciaHasta` en la fecha
en que deja de ser la vigente, pero permanece consultable. Esto responde
directamente al principio del proyecto de que un documento conserva siempre
su versión original (BR-27) — aplicado aquí no a documentos de un expediente,
sino al propio conocimiento de referencia.

**Por qué importa conservar el histórico, con un ejemplo concreto:** un
informe exportado en marzo de 2026 pudo haberse valorado con el baremo
vigente entonces. Si el baremo se actualiza en julio, ese informe de marzo
debe seguir siendo reproducible con los precios de marzo, no con los de
julio. Cada `KU` de tipo `repair` (partida de baremo) debe, por tanto, poder
recuperarse "tal y como era" en cualquier fecha pasada — de ahí los campos
`vigenciaDesde`/`vigenciaHasta` del sobre de metadatos.

**Quién puede crear una versión nueva:** cualquier cambio de contenido pasa
por el ciclo de estados de `knowledge/quality/QUALITY_RULES.md`
(`borrador` → `en_revision` → `aprobado`); solo una `KU` en estado `aprobado`
se considera vigente y consumible por IA.

---

## 5. ¿Cómo se validan?

Cada `KU`, antes de pasar a `aprobado`, debe superar los criterios definidos
en `knowledge/quality/QUALITY_RULES.md`: ser verificable, versionada,
trazable, referenciada, auditable y reutilizable. La validación tiene dos
niveles:

1. **Validación estructural** — automatizable: ¿el sobre de metadatos está
   completo? ¿el `id` es único? ¿las relaciones declaradas apuntan a `KU`
   existentes? ¿el tipo de cuerpo coincide con el esquema esperado para ese
   tipo?
2. **Validación de contenido** — no automatizable en general: ¿la afirmación
   es correcta según el oficio pericial? ¿la fuente citada existe y dice lo
   que se afirma que dice? Esta validación requiere criterio humano experto,
   y es la razón por la que `legal/` y `regulations/` exigen explícitamente
   revisión de una persona con competencia en la materia (ver sus README).

Ninguna `KU` generada automáticamente por una IA (por ejemplo, propuesta a
partir de un documento nuevo) alcanza el estado `aprobado` sin pasar por
revisión humana. Es la extensión, al conocimiento de referencia, del mismo
principio ya aplicado en el dominio del expediente: nunca se sobrescriben
datos extraídos por IA sin paso intermedio de confirmación (BR-28).

---

## 6. ¿Cómo se reutilizan?

Por **referencia, nunca por copia**. Si una regla de negocio, un prompt o un
procedimiento necesita mencionar la franquicia de la garantía de Daños por
Agua, no debe transcribir su valor: debe referenciar
`knowledge://coverages/DAGUA` y resolver el valor vigente en el momento de la
consulta. Copiar el valor rompe la trazabilidad y garantiza divergencia con
el tiempo — exactamente el problema que hoy tiene el sistema con el baremo y
los módulos de arquitectura incrustados en el código (`docs/TECHNICAL_DEBT.md`,
DT-06): cualquier corrección exige encontrar y cambiar cada copia dispersa.

La reutilización por referencia tiene una consecuencia de diseño importante:
**el consumidor resuelve la referencia en el momento de uso**, aplicando el
`ambito` (ramo, aseguradora, fecha) que corresponda a su contexto — no existe
"el" valor de una `KU`, existe "el valor de esa `KU` para tal ramo, tal
aseguradora, en tal fecha".

---

## 7. ¿Cómo se referencian?

Cada `KU` tiene un identificador con forma de URI:

```
knowledge://<tipo-plural>/<slug>[#version]
```

Ejemplos:

```
knowledge://coverages/DAGUA
knowledge://materials/baldosa-ceramica
knowledge://mappings/companies/axa/DAGUA
knowledge://rules/franquicia-mayor-que-dano
knowledge://coverages/DAGUA#v2          (una versión histórica concreta)
```

Sin sufijo de versión, la referencia resuelve siempre a la versión vigente en
el momento de la consulta (según `vigenciaDesde`/`vigenciaHasta`). Con
sufijo, resuelve a esa versión exacta, con independencia de si sigue vigente
— necesario para reproducir un informe antiguo tal y como se generó.

Este esquema de identificadores es deliberadamente independiente de dónde
viva físicamente el archivo (Markdown en este repositorio hoy; una base de
datos o un grafo mañana). El identificador es estable; el almacenamiento
puede cambiar sin romper ninguna referencia existente.

---

## 8. ¿Cómo se consumen desde IA?

Distintos mecanismos de consumo, según el propósito (desarrollados en
`knowledge/rag/RAG_ARCHITECTURE.md` y `knowledge/graph/KNOWLEDGE_GRAPH.md`):

| Mecanismo | Qué tipo de `KU` consume principalmente | Para qué |
|---|---|---|
| **RAG** (recuperación aumentada) | `glossary_term`, `example`, `procedure`, `legal`, `regulation` | Redacción, respuesta a preguntas abiertas, contexto no estructurado |
| **Grafo de conocimiento** | `coverage`, `insured_object`, `damage`, `cause`, `repair` y sus relaciones | Consultas estructuradas ("¿qué métodos reparan este daño?"), navegación |
| **Motor de reglas / validaciones** | `rule`, `checklist` | Decisiones deterministas que no deben delegarse en generación de texto |
| **Consulta directa por identificador** | Cualquier tipo | Cuando el consumidor (código o prompt) ya sabe exactamente qué `KU` necesita |
| **Mapeos** | `mapping`, `synonym_set` | Normalización de vocabulario antes de cualquiera de los usos anteriores |

**Principio rector, heredado explícitamente de `CLAUDE.md`:** la IA nunca es
la fuente del conocimiento, solo su consumidor. Un prompt no debe declarar
"la franquicia de daños por agua es 150 €" como si fuera un hecho fijo del
prompt: debe consultar `knowledge://coverages/DAGUA` en tiempo de ejecución.
Esto es, precisamente, lo contrario de cómo funcionan hoy los prompts de
extracción del sistema (`docs/AI_INVENTORY.md`), que incrustan reglas de
negocio como texto fijo dentro del propio prompt.

---

## 9. ¿Cómo se mantienen?

Cada `KU` tiene un `autor` y, opcionalmente, un `revisadoPor`. El
mantenimiento tiene tres disparadores posibles:

1. **Revisión periódica programada** — especialmente para `KU` con vigencia
   anual conocida (baremo, módulos de arquitectura).
2. **Corrección puntual** — cuando un perito detecta un dato incorrecto o
   desactualizado durante el uso real.
3. **Propuesta generada por IA, pendiente de validación** — cuando un
   servicio de IA detecta, a partir de documentos nuevos, un patrón que
   podría convertirse en `KU` (por ejemplo, una variante de nombre de
   aseguradora nunca vista). Esta vía **nunca** crea directamente una `KU` en
   estado `aprobado`.

El **responsable de mantenimiento** de cada tipo de `KU` es una decisión de
negocio pendiente — depende de si PERIT.IA sigue siendo una herramienta de un
único perito o evoluciona a plataforma con gabinete y roles (ver
`docs/OPEN_QUESTIONS.md`, P-20, y la nueva P-23 de este sprint, sección 12).

---

## 10. ¿Cómo evolucionan?

Una `KU` puede:

- **Corregirse** — nueva versión del mismo `id`, con el histórico conservado.
- **Ampliarse** — nuevas relaciones o metadatos, sin cambiar su identidad.
- **Deprecarse** — estado `deprecado`, cuando deja de ser válida pero se
  conserva por razones históricas o de trazabilidad (por ejemplo, una
  garantía que una aseguradora dejó de ofrecer).
- **Sustituirse** — una `KU` nueva declara en sus relaciones que sustituye a
  otra, que pasa a `deprecado` con una referencia explícita a su sucesora.

Ninguna `KU` se borra en el sentido estricto de eliminar el registro: el
principio de trazabilidad exige que incluso el conocimiento incorrecto o
obsoleto quede accesible para poder explicar, más adelante, por qué un
informe antiguo llegó a la conclusión a la que llegó.

---

## 11. Reconciliación con la estructura de `knowledge/` creada en el Sprint 0

**Este punto se documenta explícitamente en lugar de resolverse en
silencio**, conforme a la instrucción de este sprint de no mover archivos
existentes.

El Sprint 0 creó `knowledge/hogar/`, `knowledge/empresa/`, `knowledge/automovil/`,
`knowledge/garantias/`, `knowledge/causas/`, `knowledge/objetos/`,
`knowledge/materiales/`, `knowledge/clausulas/`, `knowledge/glosario/`,
`knowledge/sinonimos/` y `knowledge/procedimientos/`, cada una con un README
placeholder, sin el modelo de unidad de conocimiento que este sprint define.

Este Sprint 2 crea una estructura paralela más granular y en parte solapada
(`branches/`, `coverages/`, `causes/`, `materials/`, `synonyms/`,
`procedures/`, `glossary/`, entre otras) que **sí** sigue el modelo de `KU`
definido aquí.

**No se han fusionado ni movido las carpetas de Sprint 0.** Cada carpeta
nueva con solapamiento conceptual lo declara explícitamente en su propio
README (ver, por ejemplo, `knowledge/coverages/README.md`). Las opciones de
reconciliación posibles —y la decisión entre ellas queda pendiente de
aprobación, no se resuelve en este sprint— son:

| Opción | Descripción |
|---|---|
| A | Las carpetas de Sprint 0 se retiran cuando se cargue contenido real, migrando a las nuevas |
| B | Las carpetas de Sprint 0 se conservan como alias en español de las nuevas, sincronizadas |
| C | Las carpetas de Sprint 0 se reconvierten en subcarpetas de `branches/` (para hogar/empresa/automovil) y del resto de categorías nuevas |

Se propone tratar esta decisión como una ADR futura — ver el resumen
ejecutivo de cierre de este sprint.

---

## 12. Nueva pregunta abierta de este sprint

**P-23** — ¿Quién es el responsable de mantener la base de conocimiento a
medida que crece? Ver `docs/OPEN_QUESTIONS.md` para el desarrollo completo.
Esta pregunta condiciona directamente la sección 9 de este documento.

---

## 13. Relación con el resto de la documentación

| Este documento define… | Se aplica en… |
|---|---|
| El modelo de unidad de conocimiento | Todas las carpetas de `knowledge/` creadas en este sprint |
| Los tipos de `KU` | `knowledge/taxonomy/TAXONOMY.md`, que desarrolla la jerarquía de cada tipo |
| Las relaciones entre conceptos | `knowledge/ontology/ONTOLOGY.md` |
| El consumo por RAG | `knowledge/rag/RAG_ARCHITECTURE.md` |
| El consumo por grafo | `knowledge/graph/KNOWLEDGE_GRAPH.md` |
| La normalización de vocabulario | `knowledge/normalization/NORMALIZATION.md` |
| Los criterios de validación | `knowledge/quality/QUALITY_RULES.md` |
| Los catálogos futuros | `knowledge/catalogs/CATALOGS.md` |
| Los mapeos por aseguradora | `knowledge/mappings/COMPANIES.md` |

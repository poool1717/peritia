# RAG_ARCHITECTURE.md — Arquitectura de Recuperación Aumentada de PERIT.IA

> Diseño conceptual de cómo la base de conocimiento se pone a disposición de
> un modelo generativo mediante recuperación aumentada (RAG). **Solo
> arquitectura, sin proveedores concretos**: no se decide aquí qué motor de
> embeddings, qué base vectorial ni qué modelo de generación se usará —esa
> decisión pertenece al futuro Sprint 3 (AI Architecture).
>
> **Fecha:** 1 de agosto de 2026 · Sprint 2 — Knowledge Architecture
> **Depende de:** `knowledge/architecture/KNOWLEDGE_ARCHITECTURE.md` para el
> modelo de unidad de conocimiento (`KU`) que aquí se fragmenta e indexa.

---

## 1. Por qué RAG y no solo un prompt con contexto fijo

El sistema actual (`docs/AI_INVENTORY.md`) resuelve el "conocimiento" que la
IA necesita incrustándolo directamente en el prompt: el baremo completo se
serializa dentro del prompt de IA-8; las reglas de selección de capital viven
como texto dentro del prompt de IA-2. Este enfoque tiene un límite estructural
señalado ya en Sprint 0: cuanto más crece el conocimiento (más materiales, más
garantías, más aseguradoras), más crece el prompt, hasta chocar con el límite
de tokens — el propio código documenta que esto **ya ha ocurrido** (el ajuste
empírico de `max_tokens` a 8.000 tras observar respuestas cortadas).

RAG invierte el enfoque: en lugar de meter todo el conocimiento en cada
prompt, se **recupera solo lo relevante** para la consulta concreta, en el
momento de la consulta. Es la única vía viable cuando el conocimiento crece
hasta miles de unidades (`KU`), como prevé la visión estratégica de este
sprint.

---

## 2. Fragmentación (*chunking*)

**Principio central: la unidad de fragmentación es la `KU`, no un trozo
arbitrario de texto.** A diferencia de un sistema RAG genérico que trocea
documentos largos en fragmentos de tamaño fijo, PERIT.IA parte de contenido ya
atomizado por diseño (sección 1 de `KNOWLEDGE_ARCHITECTURE.md`): cada `KU` es
ya, por construcción, una pieza de tamaño razonable y de significado
autocontenido.

Matices sobre cuándo una `KU` sí requiere sub-fragmentación:

| Caso | Estrategia |
|---|---|
| `KU` de tipo `procedure` o `legal` con texto largo | Sub-fragmentar por apartado, conservando el `id` de la `KU` padre en los metadatos de cada fragmento |
| `KU` de tipo `example` (caso completo) | No fragmentar: el valor de un ejemplo está en su coherencia como caso completo |
| `KU` de tipo `coverage`, `material`, `cause`… (ficha corta) | No fragmentar: la ficha completa es ya la unidad de recuperación |
| `KU` de tipo `mapping` o `synonym_set` | No fragmentar: consulta estructurada, no semántica (ver sección 9) |

**Solapamiento (*overlap*) entre fragmentos de una misma `KU` larga:** cuando
se sub-fragmenta, cada fragmento conserva un margen del anterior y del
siguiente, para no perder contexto en los límites del corte — técnica estándar
de RAG, aplicable aquí sin más particularidad que respetar los límites
naturales de apartado en vez de un número fijo de caracteres.

---

## 3. Embeddings

Cada fragmento (`KU` completa o sub-fragmento) se convierte en un vector
numérico que representa su significado, para permitir búsqueda por similitud
semántica.

**Lo que este documento fija, con independencia del proveedor:**

- El embedding se calcula **sobre el cuerpo de la `KU`**, no sobre su sobre de
  metadatos — los metadatos se usan para filtrar (sección 4), no para
  búsqueda semántica.
- Cada `KU` **versionada** genera un embedding propio por versión: cuando una
  `KU` cambia de versión, se recalcula su embedding, no se reutiliza el
  anterior — de lo contrario, una `KU` corregida seguiría recuperándose por
  similitud con su contenido obsoleto.
- El idioma de referencia es el español, coherente con el resto del proyecto;
  si en el futuro se incorpora contenido en otros idiomas (normativa europea,
  documentación de aseguradoras internacionales), se marca explícitamente en
  los metadatos del fragmento.

**Lo que queda para el Sprint 3:** qué modelo de embeddings, qué dimensión de
vector, si se recalculan embeddings de forma incremental o por lote.

---

## 4. Metadatos del fragmento indexado

Cada fragmento indexado para recuperación lleva, como mínimo, estos metadatos
—derivados directamente del sobre de metadatos de la `KU` de origen
(`KNOWLEDGE_ARCHITECTURE.md`, sección 1.1)—:

```yaml
fragmentoId: knowledge://coverages/DAGUA#chunk-1
kuId: knowledge://coverages/DAGUA
kuVersion: 3
kuTipo: coverage
ambito: {ramo: [hogar], aseguradora: null, provincia: null}
vigenciaDesde: 2026-01-01
vigenciaHasta: null
estado: aprobado
confianza: alta
```

Estos metadatos permiten **filtrar antes o después de la búsqueda semántica**:
por ejemplo, recuperar solo fragmentos vigentes en la fecha del siniestro que
se está peritando, o solo fragmentos con `estado: aprobado` — nunca
`borrador` ni `en_revision` en una consulta de producción.

---

## 5. Versionado en el índice

**Regla:** el índice de recuperación refleja siempre el estado vigente de
cada `KU`, pero **conserva accesibles las versiones anteriores** con su propio
`fragmentoId` sufijado (`#v2`, `#v3`…), para dos escenarios:

1. **Reproducción de un informe antiguo** — si hace falta explicar con qué
   conocimiento se generó un informe de hace meses, la consulta debe poder
   fijar una fecha de referencia y recuperar el conocimiento vigente en esa
   fecha, no el actual.
2. **Auditoría de cambios de conocimiento** — comparar qué decía la versión
   anterior de una `KU` frente a la actual.

Esto implica que el índice de recuperación **no es un simple caché
regenerable en cualquier momento**: es, en sí mismo, un artefacto con
necesidad de conservar historial, alineado con la regla de no sobrescribir
versiones (`KNOWLEDGE_ARCHITECTURE.md`, sección 4).

---

## 6. Citas y procedencia (*provenance*)

**Principio no negociable, heredado directamente de BR-25/BR-26:** ninguna
respuesta generada a partir de recuperación debe presentarse sin indicar de
qué `KU` (y qué versión) procede cada afirmación.

Formato mínimo de cita que debe acompañar cualquier fragmento recuperado y
usado en una generación:

```yaml
citaId: knowledge://coverages/DAGUA#v3
tipo: coverage
confianza: alta
usadoParaAfirmar: "La franquicia de Daños por agua es de 150 € salvo pacto en contrario"
```

Esta estructura es la que, en su forma madura, permitiría cumplir el
requisito de trazabilidad del proyecto también para el conocimiento de
referencia (no solo para los datos extraídos de un documento concreto, que
ya se documentaron en `docs/domain/entities/DOCUMENT.md`).

**Diferencia importante con la provenance de un documento de expediente:** un
documento de expediente (`DOCUMENT.md`) tiene procedencia porque **se
extrajo** de un PDF concreto; una `KU` de conocimiento tiene procedencia
porque **se validó** por una persona o un proceso de revisión — la naturaleza
de la trazabilidad es distinta aunque el principio (nada sin origen
verificable) sea el mismo.

---

## 7. Re-ranking

Tras una primera recuperación por similitud semántica (que puede devolver
resultados numerosos y de relevancia desigual), un paso de **reordenación**
ajusta el orden final según criterios que la similitud semántica por sí sola
no captura bien:

| Criterio de re-ranking | Por qué importa en PERIT.IA |
|---|---|
| Coincidencia de `ambito` con el contexto de la consulta | Una `KU` de la garantía correcta pero de otro ramo no debería anteponerse a una menos "similar" pero del ramo correcto |
| Confianza (`alta`/`media`/`baja`) | Preferir conocimiento de alta confianza ante empate de relevancia |
| Recencia de vigencia | Ante dos `KU` igualmente relevantes, preferir la más reciente vigente |
| Especificidad | Una `subcoverage` específica debería primar sobre la `coverage` general de la que depende, cuando ambas son recuperadas para la misma consulta |

---

## 8. Recuperación híbrida

La búsqueda puramente semántica (por embeddings) no es suficiente para todo
el conocimiento de PERIT.IA. Se combinan tres mecanismos:

1. **Búsqueda semántica (vectorial)** — para consultas abiertas en lenguaje
   natural: "¿qué se considera daño por agua no cubierto?".
2. **Búsqueda estructurada (por metadatos y filtros exactos)** — para
   consultas donde el criterio es determinista: "dame la franquicia vigente de
   DAGUA para pólizas de Hogar en fecha X" no debería depender de similitud
   semántica, sino de una consulta exacta sobre metadatos y, en su caso, sobre
   el grafo de conocimiento (`KNOWLEDGE_GRAPH.md`).
3. **Búsqueda léxica (palabra clave)** — para términos exactos que la
   búsqueda semántica puede diluir: códigos de garantía (`DAGUA`), números de
   referencia normativa, nombres propios de aseguradora.

La recuperación híbrida combina los tres, ponderando su resultado según el
tipo de consulta — una decisión de implementación que corresponde al Sprint 3,
pero cuya necesidad debe quedar fijada aquí como requisito de arquitectura: un
diseño RAG que sea *solo* vectorial es insuficiente para el conocimiento
estructurado de PERIT.IA (garantías, franquicias, capitales), que exige
exactitud, no similitud.

---

## 9. Cuándo NO usar RAG

Coherente con el punto anterior: los tipos de `KU` `mapping`, `synonym_set`,
`rule` y `catalog_entry` con clave exacta **no deberían resolverse por
recuperación semántica**, sino por consulta directa (sección 8 de
`KNOWLEDGE_ARCHITECTURE.md`): dado un código de garantía, obtener su
franquicia es una consulta exacta, no una búsqueda de similitud. Usar RAG ahí
introduciría una fuente de error (recuperar la `KU` "casi correcta" en lugar
de la exacta) donde no hace ninguna falta.

---

## 10. Ventana de contexto (*context window*)

Al construir el contexto que se envía al modelo generativo, el ensamblado
sigue un orden de prioridad, no una simple concatenación de todo lo
recuperado:

1. **Instrucción del servicio de IA concreto** (qué se le pide: extraer,
   redactar, validar — ver la nota sobre IA modular en
   `docs/domain/DOMAIN_MODEL.md`, sección 7).
2. **`KU` de tipo `rule` aplicables**, si las hay — porque una regla debe
   condicionar la generación, no competir con ella en similitud.
3. **`KU` recuperadas por relevancia semántica**, tras re-ranking, hasta el
   presupuesto de tokens disponible.
4. **Datos concretos del expediente** en curso (nunca conocimiento genérico:
   los datos del expediente no son una `KU`, son el caso concreto sobre el que
   se aplica el conocimiento).

Cuando el volumen de `KU` relevantes excede el presupuesto de tokens, se
prioriza por: confianza → especificidad → recencia — en ese orden, coherente
con los criterios de re-ranking de la sección 7.

---

## 11. Fuentes

El índice de recuperación puede alimentarse, en su forma madura, de fuentes
de naturaleza distinta, todas ellas expresadas como `KU` antes de entrar al
índice (nunca indexadas "en crudo"):

| Fuente | Tipo de `KU` resultante | Nivel de confianza por defecto |
|---|---|---|
| Elaboración propia del perito, validada | Cualquier tipo | Alta |
| Normativa oficial publicada | `legal`, `regulation` | Alta |
| Documento aportado en un expediente, tras validación | `example`, potencialmente `mapping` | Media, hasta validación |
| Propuesta generada por IA a partir de un patrón detectado | Cualquier tipo, en estado `borrador` | Sin verificar, no indexable hasta aprobación |

**Regla de cierre:** ninguna fuente entra al índice de recuperación sin pasar
antes por el sobre de metadatos y el ciclo de estados de
`knowledge/quality/QUALITY_RULES.md`. El índice RAG es un espejo de la base de
conocimiento aprobada, no una vía paralela de entrada de contenido sin
control.

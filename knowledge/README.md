# knowledge/ — Base de Conocimiento de PERIT.IA

> Prioridad estratégica del proyecto (Sprint 2): PERIT.IA no es un generador
> de informes con IA. Es una plataforma de conocimiento asegurador. La IA es
> un **consumidor** de este conocimiento, nunca su fuente.

Base de conocimiento del dominio pericial, en formato legible por personas y
por máquinas. Es el material que alimentará a los servicios de IA (RAG,
grafo de conocimiento, motor de reglas, validaciones, búsquedas,
formación, automatizaciones futuras) **sin escribirlo dentro del código**.

Principio rector del proyecto: la plataforma es independiente de la
aseguradora. Cada compañía se representa mediante configuración, catálogos,
plantillas, mapeo y metadatos — nunca mediante código a medida (ver
`knowledge/mappings/COMPANIES.md`).

---

## Cómo leer esta carpeta

1. Empieza por **[`architecture/KNOWLEDGE_ARCHITECTURE.md`](./architecture/KNOWLEDGE_ARCHITECTURE.md)**
   — qué es una unidad de conocimiento, cómo se versiona, valida y consume.
2. Sigue por **[`taxonomy/TAXONOMY.md`](./taxonomy/TAXONOMY.md)** — la
   clasificación jerárquica completa del conocimiento pericial.
3. Profundiza en **[`ontology/ONTOLOGY.md`](./ontology/ONTOLOGY.md)** — cómo
   se relacionan los conceptos entre sí, con diagramas de grafo conceptual.
4. Consulta **[`rag/RAG_ARCHITECTURE.md`](./rag/RAG_ARCHITECTURE.md)** y
   **[`graph/KNOWLEDGE_GRAPH.md`](./graph/KNOWLEDGE_GRAPH.md)** para entender
   cómo se consumirá este conocimiento desde IA.
5. **[`normalization/NORMALIZATION.md`](./normalization/NORMALIZATION.md)**,
   **[`mappings/COMPANIES.md`](./mappings/COMPANIES.md)** y
   **[`quality/QUALITY_RULES.md`](./quality/QUALITY_RULES.md)** cierran el
   diseño: cómo se unifica el vocabulario, cómo se adapta a cada aseguradora
   sin tocar código, y qué calidad debe cumplir cada pieza.
6. **[`catalogs/CATALOGS.md`](./catalogs/CATALOGS.md)** resume qué catálogos
   existirán en el futuro y con qué esquema, antes de cargarlos de datos.

---

## Documentos de arquitectura (Sprint 2)

| Documento | Responde |
|---|---|
| [`architecture/KNOWLEDGE_ARCHITECTURE.md`](./architecture/KNOWLEDGE_ARCHITECTURE.md) | ¿Qué es y cómo se gestiona una unidad de conocimiento? |
| [`taxonomy/TAXONOMY.md`](./taxonomy/TAXONOMY.md) | ¿Cómo se clasifica el conocimiento pericial? |
| [`ontology/ONTOLOGY.md`](./ontology/ONTOLOGY.md) | ¿Cómo se relacionan los conceptos entre sí? |
| [`rag/RAG_ARCHITECTURE.md`](./rag/RAG_ARCHITECTURE.md) | ¿Cómo se recupera este conocimiento para generación con IA? |
| [`graph/KNOWLEDGE_GRAPH.md`](./graph/KNOWLEDGE_GRAPH.md) | ¿Cómo se modela como grafo consultable? |
| [`normalization/NORMALIZATION.md`](./normalization/NORMALIZATION.md) | ¿Cómo se unifica el vocabulario? |
| [`mappings/COMPANIES.md`](./mappings/COMPANIES.md) | ¿Cómo se adapta a cada aseguradora sin tocar código? |
| [`quality/QUALITY_RULES.md`](./quality/QUALITY_RULES.md) | ¿Qué calidad debe tener cada pieza de conocimiento? |
| [`catalogs/CATALOGS.md`](./catalogs/CATALOGS.md) | ¿Qué catálogos existirán y con qué campos? |

---

## Categorías de conocimiento (carpetas de contenido)

Todas vacías hoy — el diseño precede a la carga. Cada una explica en su
propio README su relación con las carpetas creadas en el Sprint 0, cuando
existe solapamiento.

**Clasificación y catálogo:** `branches/` · `coverages/` · `subcoverages/` ·
`insured_objects/` · `causes/` · `damages/` · `materials/` · `repairs/` ·
`documents/` · `reports/`

**Marco normativo:** `legal/` · `regulations/`

**Operación:** `procedures/` · `checklists/` · `rules/`

**Vocabulario:** `glossary/` · `synonyms/` · `normalization/` (documento) ·
`mappings/` (documento)

**Material de referencia:** `examples/` · `templates/`

**Relaciones y consulta:** `ontology/` (documento) · `relationships/` ·
`graph/` (documento) · `rag/` (documento)

**Gobernanza:** `quality/` (documento) · `catalogs/` (documento)

---

## Relación con `knowledge/hogar/`, `empresa/`, `automovil/`, `garantias/`,
## `causas/`, `objetos/`, `materiales/`, `clausulas/`, `glosario/`, `sinonimos/`, `procedimientos/` (Sprint 0)

Estas once carpetas se crearon en el Sprint 0, antes de que existiera el
modelo de unidad de conocimiento de este sprint. Varias de las carpetas
nuevas del Sprint 2 cubren un propósito solapado, con nombre distinto (en
inglés, más granular) y con el formato de `KU` que aquella etapa aún no
definía.

**No se han movido, fusionado ni eliminado.** La reconciliación entre ambas
estructuras es una decisión pendiente, documentada como propuesta de ADR en
`knowledge/architecture/KNOWLEDGE_ARCHITECTURE.md`, sección 11.

---

## Estado actual

**Todas las carpetas de contenido están vacías.** Este sprint diseña el
sistema que alojará el conocimiento; no carga contenido real, salvo los
ejemplos ilustrativos imprescindibles para explicar cada modelo. Hoy el
conocimiento del dominio sigue viviendo incrustado en `components/Peritia.jsx`
(baremo de partidas, módulos de arquitectura, listas de compañías y
garantías, y el texto de los prompts) — ver `docs/TECHNICAL_DEBT.md`, ficha
DT-06. Migrar ese conocimiento a esta estructura es trabajo de un sprint
futuro de carga de conocimiento, no de este sprint de diseño.

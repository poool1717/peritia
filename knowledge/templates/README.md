# knowledge/templates/ — Plantillas Maestras de la Insurance Knowledge Library

> Contrato común de todas las fichas de conocimiento de PERIT.IA. Este
> documento define el **front matter** y las **secciones de cuerpo** que
> comparten las 14 plantillas maestras; cada plantilla concreta añade solo lo
> específico de su categoría, sin repetir lo que aquí se define.
>
> **Fecha:** 1 de agosto de 2026 · Sprint 3 — Insurance Knowledge Library
> **Depende de:** `knowledge/architecture/KNOWLEDGE_ARCHITECTURE.md` (Sprint 2),
> del que este documento es la materialización operativa: allí se definió qué
> es una unidad de conocimiento (`KU`); aquí se define exactamente cómo se
> escribe una.

---

## 1. Objetivo del estándar

Que añadir conocimiento nuevo a PERIT.IA consista únicamente en **crear una
ficha nueva siguiendo su plantilla**, sin tocar código, sin tocar prompts y
sin depender de ningún proveedor de IA.

Corolario, y regla no negociable del proyecto:

> **Los prompts consumen la biblioteca. Nunca la contienen.**

Un prompt que afirme un hecho del dominio ("las partidas para reparar humedad
son X, Y y Z") está incumpliendo este estándar: ese hecho pertenece a una
ficha, y el prompt debe referenciarla, no transcribirla.

---

## 2. Anatomía de una ficha

```
┌─────────────────────────────────────┐
│  FRONT MATTER (YAML)                │  ← legible por máquina
│  identidad · estado · relaciones    │     validable · indexable
├─────────────────────────────────────┤
│  CUERPO (Markdown)                  │  ← legible por persona
│  definición · casos · exclusiones   │     fragmentable para RAG
└─────────────────────────────────────┘
```

Nombre de archivo: `<slug>.md`, en la carpeta de su categoría (no en
`templates/`, que contiene solo las plantillas). El `slug` debe coincidir con
el último segmento del `id`.

---

## 3. Front matter común

Todos los campos son obligatorios salvo los marcados como opcionales. Un
campo sin valor conocido se escribe explícitamente como `null` o lista vacía
— **nunca se omite**, para que la validación estructural pueda distinguir
"no aplica" de "se olvidó".

```yaml
# ── Identidad ────────────────────────────────────────────────────
id: knowledge://<tipo-plural>/<slug>   # único y estable (KNOWLEDGE_ARCHITECTURE.md §7)
tipo: <coverage|material|damage|...>   # uno de los 14 tipos con plantilla
version: 1                             # entero incremental, nunca se reutiliza
estado: borrador                       # borrador|en_revision|aprobado|deprecado
idioma: es                             # ISO 639-1
confianza: sin_verificar               # alta|media|baja|sin_verificar

# ── Vigencia ─────────────────────────────────────────────────────
vigenciaDesde: 2026-08-01              # fecha desde la que aplica esta versión
vigenciaHasta: null                    # null = vigente

# ── Ámbito de aplicabilidad ──────────────────────────────────────
ambito:
  ramo: []                             # [] = aplica a todos los ramos
  aseguradora: null                    # null = no específica de ninguna
  provincia: null                      # null = sin restricción geográfica

# ── Relaciones (KNOWLEDGE_GRAPH.md §3) ───────────────────────────
relaciones:
  garantias: []                        # knowledge://coverages/...
  subgarantias: []                     # knowledge://subcoverages/...
  objetos: []                          # knowledge://insured_objects/...
  materiales: []                       # knowledge://materials/...
  danos: []                            # knowledge://damages/...
  causas: []                           # knowledge://causes/...
  metodos: []                          # knowledge://repairs/...
  normativa: []                        # knowledge://regulations/... | legal/...
  documentacion: []                    # knowledge://documents/...
  fotografias: []                      # knowledge://documents/photo-guides/...
  procedimientos: []                   # knowledge://procedures/...

# ── Trazabilidad ─────────────────────────────────────────────────
autor: null                            # quién la redactó
revisadoPor: null                      # quién la validó (obligatorio si estado=aprobado)
fuentes: []                            # ver §5
historial: []                          # ver §6
```

### 3.1. Reconciliación con el sobre de metadatos del Sprint 2

El front matter de este sprint **extiende** el sobre definido en
`KNOWLEDGE_ARCHITECTURE.md` §1.1, sin contradecirlo:

| Sprint 2 | Sprint 3 | Cambio |
|---|---|---|
| `id`, `tipo`, `version`, `estado`, `confianza` | igual | — |
| `vigenciaDesde`/`vigenciaHasta` | igual | — |
| `ambito` | igual | — |
| `autor`, `revisadoPor` | igual | — |
| `fuente` (objeto único) | `fuentes` (lista) | Una ficha puede apoyarse en varias fuentes |
| `relaciones` (lista plana) | `relaciones` (objeto con buckets tipados) | Permite validar que cada relación apunta al tipo correcto |
| — | `idioma` | Nuevo: previsto para contenido normativo no español |
| — | `historial` | Nuevo: materializa el criterio "Auditable" de `QUALITY_RULES.md` |

---

## 4. Secciones de cuerpo comunes

Toda ficha, con independencia de su tipo, tiene estas secciones en este
orden. Cada plantilla añade después las suyas propias.

| Sección | Contenido | Obligatoria |
|---|---|---|
| `# <Nombre canónico>` | Título = forma canónica del concepto (ver `NORMALIZATION.md`) | Sí |
| `## Definición` | Qué es, en una o dos frases, sin ambigüedad | Sí |
| `## Casos habituales` | Situaciones frecuentes en la práctica pericial real | Sí |
| `## Casos excepcionales` | Situaciones infrecuentes que exigen criterio distinto | Sí |
| `## Exclusiones` | Qué queda fuera del alcance de esta ficha | Sí |
| `## Observaciones` | Matices, advertencias, notas de aplicación | Opcional |

**Nota sobre `## Exclusiones`:** en fichas de tipo `coverage` y `subcoverage`
esta sección tiene sentido contractual (qué no cubre la garantía). En los
demás tipos tiene sentido de delimitación conceptual (qué *no* es este
concepto, para evitar solapamiento con fichas vecinas). Ambos usos son
válidos; la plantilla de cada tipo precisa cuál aplica.

---

## 5. Fuentes

Cada entrada de `fuentes` documenta de dónde procede la afirmación de la
ficha — el criterio **Verificable** de `QUALITY_RULES.md` §1.1.

```yaml
fuentes:
  - tipo: codigo_actual          # extraído de components/Peritia.jsx (Sprint 0)
    referencia: "BAREMO, partida 'Picado de enlucido'"
    fecha: 2026-08-01
  - tipo: normativa
    referencia: "Ley 50/1980, art. 26"
    fecha: 2026-08-01
  - tipo: confirmado_por_perito
    referencia: "Pol, sesión de validación"
    fecha: null
  - tipo: elaboracion_propia
    referencia: "Inferido de la estructura del baremo, pendiente de validar"
    fecha: 2026-08-01
```

Tipos admitidos: `codigo_actual` · `normativa` · `documento_real` ·
`confirmado_por_perito` · `elaboracion_propia` · `propuesta_ia`.

**Regla:** una ficha cuya única fuente sea `elaboracion_propia` o
`propuesta_ia` **no puede alcanzar `estado: aprobado`** ni `confianza: alta`.

---

## 6. Historial

```yaml
historial:
  - version: 1
    fecha: 2026-08-01
    autor: claude
    estado: borrador
    cambio: "Creación inicial de la ficha"
  - version: 2
    fecha: 2026-09-15
    autor: pol
    estado: aprobado
    cambio: "Validado el precio contra el baremo vigente 2026"
```

Nunca se edita ni se borra una entrada de historial: solo se añaden.

---

## 7. Ciclo de vida de una ficha

Idéntico al de cualquier `KU` (`QUALITY_RULES.md` §2):

```
borrador ──▶ en_revision ──▶ aprobado ──▶ deprecado
                  ▲              │
                  └──────────────┘
```

Solo `aprobado` es consumible por IA en producción. Toda ficha creada en este
sprint nace en `borrador`: **ninguna ha sido validada por Pol todavía**.

---

## 8. Las 14 plantillas maestras

| Plantilla | Tipo | Carpeta destino de sus fichas |
|---|---|---|
| [`COVERAGE_TEMPLATE.md`](./COVERAGE_TEMPLATE.md) | `coverage` | `knowledge/coverages/` |
| [`SUBCOVERAGE_TEMPLATE.md`](./SUBCOVERAGE_TEMPLATE.md) | `subcoverage` | `knowledge/subcoverages/` |
| [`INSURED_OBJECT_TEMPLATE.md`](./INSURED_OBJECT_TEMPLATE.md) | `insured_object` | `knowledge/insured_objects/` |
| [`MATERIAL_TEMPLATE.md`](./MATERIAL_TEMPLATE.md) | `material` | `knowledge/materials/` |
| [`DAMAGE_TEMPLATE.md`](./DAMAGE_TEMPLATE.md) | `damage` | `knowledge/damages/` |
| [`CAUSE_TEMPLATE.md`](./CAUSE_TEMPLATE.md) | `cause` | `knowledge/causes/` |
| [`REPAIR_METHOD_TEMPLATE.md`](./REPAIR_METHOD_TEMPLATE.md) | `repair` | `knowledge/repairs/` |
| [`LEGAL_REFERENCE_TEMPLATE.md`](./LEGAL_REFERENCE_TEMPLATE.md) | `legal` / `regulation` | `knowledge/legal/`, `knowledge/regulations/` |
| [`PROCEDURE_TEMPLATE.md`](./PROCEDURE_TEMPLATE.md) | `procedure` | `knowledge/procedures/` |
| [`CHECKLIST_TEMPLATE.md`](./CHECKLIST_TEMPLATE.md) | `checklist` | `knowledge/checklists/` |
| [`PHOTO_GUIDE_TEMPLATE.md`](./PHOTO_GUIDE_TEMPLATE.md) | `photo_guide` | `knowledge/documents/` |
| [`DOCUMENT_TEMPLATE.md`](./DOCUMENT_TEMPLATE.md) | `document` | `knowledge/documents/` |
| [`REPORT_PATTERN_TEMPLATE.md`](./REPORT_PATTERN_TEMPLATE.md) | `report_pattern` | `knowledge/reports/` |
| [`CONCLUSION_TEMPLATE.md`](./CONCLUSION_TEMPLATE.md) | `conclusion` | `knowledge/reports/` |

---

## 9. Validación de una ficha

Antes de pasar de `borrador` a `en_revision`, debe superar la **validación
estructural** (automatizable):

- [ ] `id` único, con formato `knowledge://<tipo-plural>/<slug>`.
- [ ] `slug` del `id` coincide con el nombre del archivo.
- [ ] `tipo` corresponde a la plantilla usada y a la carpeta donde vive.
- [ ] Todos los campos obligatorios presentes (`null` explícito si no aplica).
- [ ] Toda referencia de `relaciones` apunta a un `id` existente y del tipo
      correcto para su bucket.
- [ ] `fuentes` no está vacío.
- [ ] `historial` tiene al menos una entrada, con `version` coincidente con la
      del front matter.
- [ ] Todas las secciones de cuerpo obligatorias (§4) presentes.

La **validación de contenido** (no automatizable) es la de
`QUALITY_RULES.md` §3, y requiere criterio humano experto.

---

## 10. Qué NO va en una ficha

- **Valores propios de una póliza concreta.** El capital y la franquicia
  reales salen siempre de la póliza del expediente, nunca del catálogo. Una
  ficha de garantía describe la garantía como concepto, no las condiciones
  económicas de ningún contrato.
- **Datos de un expediente real.** Las fichas son conocimiento reutilizable
  entre expedientes; los datos de un siniestro concreto viven en
  `informes` (ver `docs/DB_MODEL.md`), no aquí.
- **Lógica de cálculo.** Las fórmulas viven en el motor único
  (`docs/domain/entities/REPAIR.md`). Una ficha puede indicar *qué* precio de
  referencia tiene un método, no *cómo* se calcula el valor real de una
  partida.
- **Nada específico de una aseguradora**, salvo en fichas de tipo `mapping`
  (`knowledge/mappings/COMPANIES.md`), que es donde eso pertenece por diseño.

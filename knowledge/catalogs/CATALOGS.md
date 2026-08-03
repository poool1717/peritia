# CATALOGS.md — Modelo de los catálogos futuros de PERIT.IA

> Diseño de qué catálogos deberá tener la base de conocimiento y qué campos
> llevará cada uno. **No se rellenan datos**: se diseña el esquema que los
> contendrá, para que la carga de contenido futura tenga un molde claro que
> seguir.
>
> **Fecha:** 1 de agosto de 2026 · Sprint 2 — Knowledge Architecture
> **Convención:** cada entrada de catálogo es una `KU` (ver
> `knowledge/architecture/KNOWLEDGE_ARCHITECTURE.md`) del tipo `catalog_entry`,
> especializada según el esquema de este documento.

---

## 1. Qué es un catálogo, en este modelo

Un catálogo es una colección **cerrada y gobernada** de `KU` del mismo tipo,
con un esquema de campos común. "Cerrada" no significa inmutable —puede
crecer—, significa que toda entrada nueva pasa por el mismo ciclo de calidad
(`knowledge/quality/QUALITY_RULES.md`) y no se introduce de forma ad hoc desde
el código, como ocurre hoy con `BAREMO`, `TABLAS_ARQ`, `PROVINCIAS` o
`COMPANIAS` en `components/Peritia.jsx`.

---

## 2. Catálogo de Materiales

**Carpeta:** `knowledge/materials/`

| Campo | Tipo | Descripción |
|---|---|---|
| `nombre` | texto | Nombre del material |
| `categoria` | referencia a taxonomía | Pavimento / Revestimiento / Estructural / Instalación |
| `calidad` | enumerado | Básica / Media / Alta |
| `vidaUtilAnios` | número | Vida útil de referencia, para depreciación |
| `objetosCompatibles` | lista de referencias | Qué tipos de objeto asegurado suelen ser de este material |
| `metodosDeReparacionHabituales` | lista de referencias | Enlace a `knowledge/repairs/` |

---

## 3. Catálogo de Causas

**Carpeta:** `knowledge/causes/`

| Campo | Tipo | Descripción |
|---|---|---|
| `nombre` | texto | Nombre de la causa |
| `categoria` | enumerado | Atmosférica / Hídrica / Térmica / Eléctrica / Antrópica |
| `garantiasQueActiva` | lista de referencias | Ver `ONTOLOGY.md`, relación *activa* |
| `requiereVerificacionExterna` | booleano | Si dispara consulta a fuente externa (meteorológica, catastral) |
| `fuenteVerificacion` | referencia opcional | Qué servicio la verifica (XEMA, Catastro…) |

---

## 4. Catálogo de Garantías

**Carpeta:** `knowledge/coverages/`

| Campo | Tipo | Descripción |
|---|---|---|
| `codigo` | texto | Código corto (DAGUA, INCEN…) |
| `nombreComercial` | texto | Nombre canónico |
| `ramosAplicables` | lista de referencias | Ver `TAXONOMY.md`, sección 2 |
| `bloques` | estructura | Textos y condiciones separados para continente y contenido |
| `subgarantias` | lista de referencias | Ver sección 5 |
| `exclusionesTipicas` | lista de referencias | Ver sección 8 |
| `limitesTipicos` | lista de referencias | Ver sección 9 |
| `documentacionRequerida` | lista de referencias | Ver sección 6 |

---

## 5. Catálogo de Subgarantías

**Carpeta:** `knowledge/subcoverages/`

| Campo | Tipo | Descripción |
|---|---|---|
| `nombre` | texto | Concepto concreto |
| `garantiaPadre` | referencia | A qué garantía pertenece |
| `condicionActivacion` | texto | Cuándo aplica esta subgarantía en lugar de la general |

---

## 6. Catálogo de Documentación

**Carpeta:** `knowledge/documents/`

| Campo | Tipo | Descripción |
|---|---|---|
| `tipo` | enumerado | Encargo / Póliza / Factura / Presupuesto / Fotografía / Informe catastral / Captura meteorológica |
| `garantiasQueLoRequieren` | lista de referencias | Ver `ONTOLOGY.md`, relación *requiere* |
| `obligatoriedad` | enumerado | Obligatorio / Recomendado |
| `formatoEsperado` | texto | PDF, imagen, etc. |

---

## 7. Catálogo de Fotografías

**Carpeta:** dentro de `knowledge/documents/` (subtipo, ver
`knowledge/taxonomy/TAXONOMY.md`, sección 15), no una carpeta propia — se
diseña aquí igualmente por la mención explícita del enunciado de este sprint.

| Campo | Tipo | Descripción |
|---|---|---|
| `categoria` | enumerado | De riesgo / De daño / De evidencia externa |
| `requeridaPara` | lista de referencias | Qué garantías o procedimientos la exigen |
| `criteriosDeCalidad` | texto | Encuadre, iluminación, referencia de escala, etc. |

---

## 8. Catálogo de Exclusiones

**Carpeta:** referenciado desde `knowledge/coverages/` (ver
`knowledge/taxonomy/TAXONOMY.md`, sección 13); no tiene carpeta de primer
nivel propia en la estructura de este sprint, se modela como parte del
catálogo de garantías.

| Campo | Tipo | Descripción |
|---|---|---|
| `texto` | texto | Redacción de la exclusión |
| `garantiaPadre` | referencia | A qué garantía pertenece |
| `tipo` | enumerado | Total / Parcial / Por franquicia especial |
| `frecuenciaObservada` | enumerado (futuro) | Común / Infrecuente — útil si se llega a análisis estadístico sobre casos reales |

---

## 9. Catálogo de Límites

**Carpeta:** referenciado desde `knowledge/coverages/`, igual que
Exclusiones.

| Campo | Tipo | Descripción |
|---|---|---|
| `tipo` | enumerado | Capital / Temporal / Geográfico |
| `garantiaPadre` | referencia | A qué garantía pertenece |
| `valorPorDefecto` | número o texto | Solo orientativo — el valor real siempre viene de la póliza concreta, nunca del catálogo |

---

## 10. Catálogo de Métodos de Reparación

**Carpeta:** `knowledge/repairs/`

| Campo | Tipo | Descripción |
|---|---|---|
| `nombre` | texto | Nombre de la partida |
| `oficio` | referencia | Ver `TAXONOMY.md`, sección 10 |
| `unidad` | texto | m², ml, u |
| `precioReferencia` | número | Precio de referencia vigente |
| `rendimiento` | número opcional | Unidades por hora, si aplica |
| `dañosQueResuelve` | lista de referencias | Ver `ONTOLOGY.md`, relación *puede repararse mediante* |
| `condicionActivacion` | texto | Cuándo se incluye esta partida |

Es el catálogo con equivalente más maduro ya en el código (`BAREMO`, 47
entradas verificadas en Sprint 0) — el de menor esfuerzo de migración cuando
se decida cargar contenido real.

---

## 11. Catálogo de Normativa

**Carpeta:** `knowledge/regulations/` y `knowledge/legal/`

| Campo | Tipo | Descripción |
|---|---|---|
| `referencia` | texto | Identificador de la norma (ley, artículo, norma UNE) |
| `resumen` | texto | Qué dice, en lenguaje llano |
| `aplicaA` | lista de referencias | Garantías o procedimientos afectados |
| `tipo` | enumerado | Legal / Técnica |

**Advertencia repetida de `knowledge/legal/README.md`:** ninguna entrada de
este catálogo debe cargarse sin validación de una persona con competencia
legal.

---

## 12. Catálogo de Compañías y sus mapeos

**Carpeta:** `knowledge/mappings/` — desarrollado en detalle en
`knowledge/mappings/COMPANIES.md`, no se repite aquí el esquema.

---

## 13. Tabla resumen: catálogo → carpeta → tipo de `KU`

| Catálogo | Carpeta | Tipo de `KU` |
|---|---|---|
| Materiales | `materials/` | `material` |
| Causas | `causes/` | `cause` |
| Garantías | `coverages/` | `coverage` |
| Subgarantías | `subcoverages/` | `subcoverage` |
| Documentación | `documents/` | `document` |
| Métodos de reparación | `repairs/` | `repair` |
| Normativa | `regulations/`, `legal/` | `regulation`, `legal` |
| Compañías / mapeos | `mappings/` | `mapping` |
| Exclusiones y Límites | (dentro de `coverages/`) | parte del cuerpo de `coverage` |

---

## 14. Qué no se decide en este documento

- Si cada catálogo se persiste como archivos Markdown con frontmatter YAML
  (coherente con el resto de `knowledge/` en este sprint), como filas de base
  de datos, o como nodos de grafo — decisión de implementación futura.
- El volumen real de entradas de cada catálogo — depende de la carga de
  conocimiento real, fuera del alcance de este sprint.
- Quién es responsable de cada catálogo — depende de
  `docs/OPEN_QUESTIONS.md`, P-23.

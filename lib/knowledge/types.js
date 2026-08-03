// lib/knowledge/types.js
//
// Taxonomía cerrada de tipos de KU, estados de ciclo de vida, niveles de
// confianza y tipos de fuente. Copiado de knowledge/architecture/
// KNOWLEDGE_ARCHITECTURE.md §2, §4, §5 y §1.1 — no se inventa nada aquí que
// no esté ya aprobado en ese documento, con una excepción documentada abajo.

// tipo (singular) → carpeta (plural). `catalog_entry` no tiene carpeta
// propia: vive dentro de cada catálogo (knowledge/catalogs/CATALOGS.md), de
// ahí que su valor sea `null` en vez de un nombre de carpeta.
export const KU_TYPE_FOLDERS = {
  branch: "branches",
  coverage: "coverages",
  subcoverage: "subcoverages",
  insured_object: "insured_objects",
  cause: "causes",
  damage: "damages",
  material: "materials",
  repair: "repairs",
  document: "documents",
  report: "reports",
  legal: "legal",
  regulation: "regulations",
  procedure: "procedures",
  checklist: "checklists",
  rule: "rules",
  example: "examples",
  template: "templates",
  synonym_set: "synonyms",
  mapping: "mappings",
  relationship_instance: "relationships",
  glossary_term: "glossary",
  catalog_entry: null,
};

export const KU_TYPES = Object.freeze(Object.keys(KU_TYPE_FOLDERS));

// Carpeta plural → tipo singular (para resolver un identificador hacia su tipo).
export const KU_FOLDER_TYPES = Object.freeze(
  Object.fromEntries(
    Object.entries(KU_TYPE_FOLDERS)
      .filter(([, plural]) => plural !== null)
      .map(([tipo, plural]) => [plural, tipo])
  )
);

export const ESTADOS = Object.freeze(["borrador", "en_revision", "aprobado", "deprecado"]);

export const CONFIANZA = Object.freeze(["alta", "media", "baja", "sin_verificar"]);

// KNOWLEDGE_ARCHITECTURE.md §1.1 declara estos cuatro. Las fichas reales de
// knowledge/coverages/ ya usan un quinto ("codigo_actual", referencia al
// propio código de Peritia.jsx como fuente) que no está en esa lista — se
// incluye aquí para que las fichas reales validen, y se deja constancia del
// hallazgo en el informe de cierre de este EPIC en vez de tocar el
// documento de arquitectura.
export const FUENTE_TIPOS = Object.freeze([
  "elaboracion_propia",
  "normativa",
  "extraido_de_documento",
  "confirmado_por_perito",
  "codigo_actual",
]);

// lib/knowledge/coverage/types.js
//
// Taxonomía de exclusiones y límites de una garantía. Copiada de
// knowledge/taxonomy/TAXONOMY.md §13 — ahí figuran como "[Propuesto]": este
// EPIC (KP-02) es la primera implementación en código de esa propuesta, no
// una taxonomía inventada aparte.

export const EXCLUSION_TIPOS = Object.freeze([
  "total",                      // la garantía no cubre este supuesto en absoluto
  "parcial",                    // cubre con condición
  "por_franquicia_especial",    // cubre, pero con una franquicia distinta de la general
]);

export const LIMIT_TIPOS = Object.freeze([
  "capital",     // por garantía, por objeto
  "temporal",    // plazo para reclamar, plazo de paralización
  "geografico",  // ámbito de cobertura
]);

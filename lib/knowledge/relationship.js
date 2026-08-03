// lib/knowledge/relationship.js
//
// Validación y utilidades sobre el campo `relaciones` de una KU.
//
// Las fichas reales (knowledge/coverages/*.md, knowledge/templates/
// COVERAGE_TEMPLATE.md) usan un objeto con categorías propias del tipo
// `coverage` (garantias, subgarantias, objetos, materiales, danos, causas,
// metodos, normativa, documentacion, fotografias, procedimientos), cada una
// con un array de identificadores. Ese vocabulario de categorías es
// específico de la plantilla de cada tipo, no universal — un `material` o
// una `cause` tendrán las suyas. Este módulo, deliberadamente, NO exige un
// vocabulario de claves concreto: valida que `relaciones` sea un objeto
// cuyos valores son arrays de identificadores `knowledge://` sintácticamente
// válidos, sea cual sea el nombre de cada clave.

import { isValidIdentifier, stripVersion } from "./identifier.js";
import { isPlainObject } from "./validators.js";

// {valid, errors} — no lanza, para poder acumular todos los problemas de una
// vez (igual que schema.js).
export function validateRelaciones(relaciones) {
  const errors = [];
  if (!isPlainObject(relaciones)) {
    return { valid: false, errors: ["relaciones debe ser un objeto"] };
  }
  for (const [categoria, valores] of Object.entries(relaciones)) {
    if (!Array.isArray(valores)) {
      errors.push(`relaciones.${categoria} debe ser un array`);
      continue;
    }
    valores.forEach((v, i) => {
      if (!isValidIdentifier(v)) {
        errors.push(`relaciones.${categoria}[${i}] no es un identificador knowledge:// válido: ${JSON.stringify(v)}`);
      }
    });
  }
  return { valid: errors.length === 0, errors };
}

// Todos los identificadores referenciados, de todas las categorías,
// deduplicados. Útil para recorrer el grafo o comprobar referencias rotas
// contra un registro (lib/knowledge/registry.js).
export function listRelationTargets(relaciones) {
  if (!isPlainObject(relaciones)) return [];
  const todos = Object.values(relaciones)
    .filter(Array.isArray)
    .flat()
    .filter(v => typeof v === "string");
  return [...new Set(todos)];
}

// ¿Alguna relación apunta a la propia KU? Compara sin sufijo de versión,
// porque una KU que se referencia a sí misma en una versión anterior sigue
// siendo una auto-referencia conceptual.
export function hasSelfReference(id, relaciones) {
  let idBase;
  try { idBase = stripVersion(id); } catch { return false; }
  return listRelationTargets(relaciones).some(target => {
    try { return stripVersion(target) === idBase; } catch { return false; }
  });
}

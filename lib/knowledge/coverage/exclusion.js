// lib/knowledge/coverage/exclusion.js
//
// Una exclusión individual de una garantía (ONTOLOGY.md §7, "Garantía tiene
// Exclusiones", cardinalidad 1–N: cada instancia de exclusión pertenece a
// una única garantía). Objeto plano, no clase — mismo estilo que
// lib/knowledge/*.

import { EXCLUSION_TIPOS } from "./types.js";
import { isNonEmptyString, isPlainObject, isOneOf } from "../validators.js";
import { SchemaValidationError } from "../errors.js";

// {valid, errors}
export function validateExclusion(exclusion) {
  if (!isPlainObject(exclusion)) return { valid: false, errors: ["la exclusión debe ser un objeto"] };
  const errors = [];
  if (!isOneOf(exclusion.tipo, EXCLUSION_TIPOS)) {
    errors.push(`tipo debe ser uno de: ${EXCLUSION_TIPOS.join(", ")}`);
  }
  if (!isNonEmptyString(exclusion.descripcion)) {
    errors.push("descripcion debe ser una cadena no vacía");
  }
  return { valid: errors.length === 0, errors };
}

export function assertValidExclusion(exclusion) {
  const { valid, errors } = validateExclusion(exclusion);
  if (!valid) throw new SchemaValidationError(errors);
  return exclusion;
}

// Fábrica: normaliza y valida. { tipo, descripcion } → Exclusion
export function createExclusion({ tipo, descripcion }) {
  return assertValidExclusion({ tipo, descripcion });
}

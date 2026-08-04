// lib/knowledge/coverage/limit.js
//
// Un límite individual de una garantía (ONTOLOGY.md §8, "Garantía tiene
// Límites", cardinalidad 1–N). Sin importes: "los importes son de cada
// póliza" (COVERAGE_TEMPLATE.md, sección "Límites típicos") — este objeto
// describe el TIPO de límite que suele acompañar a la garantía, no su
// cuantía concreta.

import { LIMIT_TIPOS } from "./types.js";
import { isNonEmptyString, isPlainObject, isOneOf } from "../validators.js";
import { SchemaValidationError } from "../errors.js";

// {valid, errors}
export function validateLimit(limit) {
  if (!isPlainObject(limit)) return { valid: false, errors: ["el límite debe ser un objeto"] };
  const errors = [];
  if (!isOneOf(limit.tipo, LIMIT_TIPOS)) {
    errors.push(`tipo debe ser uno de: ${LIMIT_TIPOS.join(", ")}`);
  }
  if (!isNonEmptyString(limit.descripcion)) {
    errors.push("descripcion debe ser una cadena no vacía");
  }
  return { valid: errors.length === 0, errors };
}

export function assertValidLimit(limit) {
  const { valid, errors } = validateLimit(limit);
  if (!valid) throw new SchemaValidationError(errors);
  return limit;
}

// Fábrica: normaliza y valida. { tipo, descripcion } → Limit
export function createLimit({ tipo, descripcion }) {
  return assertValidLimit({ tipo, descripcion });
}

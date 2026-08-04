// lib/knowledge/reasoning/rule.js
//
// Una regla: condición declarativa (condition.js) + efecto. Usa el mismo
// formato de identificador que las KU de KP-01 (knowledge://rules/<slug>,
// `rule` ya es uno de los 22 tipos de knowledge/architecture/
// KNOWLEDGE_ARCHITECTURE.md §2) sin exigir todavía el sobre de metadatos
// completo (versión, vigencia, ambito) — sería ceremonia desproporcionada
// para las reglas de ejemplo de este incremento. Formalizarla como KU de
// pleno derecho, reutilizando lib/knowledge/registry.js y resolver.js, es
// un paso natural y de bajo riesgo cuando haya un catálogo real de reglas
// que versionar.

import { isValidIdentifier } from "../identifier.js";
import { CONFIANZA } from "../types.js";
import { isNonEmptyString, isPlainObject, isOneOf } from "../validators.js";
import { SchemaValidationError } from "../errors.js";
import { validateCondition, evaluateCondition } from "./condition.js";

export function createRule(data) {
  if (!isPlainObject(data)) throw new SchemaValidationError(["rule debe ser un objeto"]);
  const rule = {
    id: data.id,
    descripcion: data.descripcion,
    condicion: data.condicion ?? null,
    efecto: data.efecto,
  };
  return assertValidRule(rule);
}

export function validateRule(rule) {
  if (!isPlainObject(rule)) return { valid: false, errors: ["rule debe ser un objeto"] };
  const errors = [];
  if (!isNonEmptyString(rule.id) || !isValidIdentifier(rule.id)) {
    errors.push("id debe ser un identificador knowledge:// válido");
  }
  if (!isNonEmptyString(rule.descripcion)) errors.push("descripcion debe ser una cadena no vacía");

  const cond = validateCondition(rule.condicion);
  if (!cond.valid) errors.push(...cond.errors.map(e => `condicion: ${e}`));

  if (!isPlainObject(rule.efecto)) {
    errors.push("efecto debe ser un objeto");
  } else {
    if (!isNonEmptyString(rule.efecto.valor)) errors.push("efecto.valor debe ser una cadena no vacía");
    if (!isOneOf(rule.efecto.confianza, CONFIANZA)) errors.push(`efecto.confianza debe ser una de: ${CONFIANZA.join(", ")}`);
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidRule(rule) {
  const { valid, errors } = validateRule(rule);
  if (!valid) throw new SchemaValidationError(errors, isPlainObject(rule) ? rule.id : undefined);
  return rule;
}

// {matches, rule} — no lanza si la condición no puede evaluarse por datos
// ausentes: simplemente no coincide (matches:false), que es la respuesta
// correcta ante información incompleta, no un error.
export function evaluateRule(rule, context) {
  try {
    return { matches: evaluateCondition(rule.condicion, context), rule };
  } catch {
    return { matches: false, rule };
  }
}

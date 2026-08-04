// lib/knowledge/reasoning/decision.js
//
// Un punto de decisión dentro de una Stage: una pregunta, sus posibles
// valores, qué necesita para responderse, y qué reglas (por id, no
// embebidas) puede aplicar. evaluateDecision() es lo que la convierte de
// metadato declarativo a decisión evaluable: ejecuta sus reglas contra un
// ReasoningContext y devuelve un Outcome completo, nunca un valor suelto.

import { isValidIdentifier } from "../identifier.js";
import { isNonEmptyString, isPlainObject, isArrayOf } from "../validators.js";
import { SchemaValidationError } from "../errors.js";
import { evaluateRule } from "./rule.js";
import { createOutcome, undeterminedOutcome } from "./outcome.js";

export function createDecision(data) {
  if (!isPlainObject(data)) throw new SchemaValidationError(["decision debe ser un objeto"]);
  const decision = {
    id: data.id,
    pregunta: data.pregunta,
    posiblesValores: data.posiblesValores ?? [],
    entradasRequeridas: data.entradasRequeridas ?? [],
    reglas: data.reglas ?? [],
  };
  return assertValidDecision(decision);
}

export function validateDecision(decision) {
  if (!isPlainObject(decision)) return { valid: false, errors: ["decision debe ser un objeto"] };
  const errors = [];
  if (!isNonEmptyString(decision.id)) errors.push("id debe ser una cadena no vacía");
  if (!isNonEmptyString(decision.pregunta)) errors.push("pregunta debe ser una cadena no vacía");
  if (!isArrayOf(decision.posiblesValores, isNonEmptyString) || decision.posiblesValores.length === 0) {
    errors.push("posiblesValores debe ser un array no vacío de cadenas");
  }
  if (!isArrayOf(decision.entradasRequeridas, isNonEmptyString)) {
    errors.push("entradasRequeridas debe ser un array de cadenas");
  }
  if (!isArrayOf(decision.reglas, isValidIdentifier)) {
    errors.push("reglas debe ser un array de identificadores knowledge:// válidos");
  }
  return { valid: errors.length === 0, errors };
}

export function assertValidDecision(decision) {
  const { valid, errors } = validateDecision(decision);
  if (!valid) throw new SchemaValidationError(errors, isPlainObject(decision) ? decision.id : undefined);
  return decision;
}

function resolveRule(rules, id) {
  if (Array.isArray(rules)) return rules.find(r => r.id === id);
  if (rules && typeof rules.get === "function") return rules.get(id);
  return undefined;
}

// Evalúa TODAS las reglas de la decisión (no se detiene en la primera
// coincidencia): así el Outcome puede citar más de una regla aplicada, que
// es justamente lo que hace "completa" a la explicación. La primera regla
// que coincide, en el orden declarado en decision.reglas, fija el valor y
// la confianza — las demás coincidencias solo enriquecen la explicación.
export function evaluateDecision(decision, context, { rules = [], evidenceIds = [] } = {}) {
  const coincidencias = decision.reglas
    .map(id => resolveRule(rules, id))
    .filter(Boolean)
    .map(rule => evaluateRule(rule, context))
    .filter(e => e.matches)
    .map(e => e.rule);

  if (!coincidencias.length) return undeterminedOutcome();

  const principal = coincidencias[0];
  return createOutcome({
    valor: principal.efecto.valor,
    confianza: principal.efecto.confianza,
    explicacion: coincidencias.map(r => r.descripcion).join(" "),
    reglasAplicadas: coincidencias.map(r => r.id),
    evidenciasUsadas: evidenceIds,
  });
}

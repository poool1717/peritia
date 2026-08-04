// lib/knowledge/reasoning/trace.js
//
// Un Outcome ya registrado: a qué etapa y decisión pertenece, y cuándo se
// tomó. Inmutable — un Trace no se corrige, se sustituye por uno nuevo
// (mismo principio que el versionado de una KU en KP-01: nunca se pierde
// el histórico).

import { isNonEmptyString, isPlainObject } from "../validators.js";
import { SchemaValidationError } from "../errors.js";
import { validateOutcome } from "./outcome.js";

export function createTrace({ etapaId, decisionId, outcome, timestamp }) {
  const trace = {
    etapaId,
    decisionId,
    outcome,
    timestamp: timestamp ?? new Date().toISOString(),
  };
  return assertValidTrace(trace);
}

export function validateTrace(trace) {
  if (!isPlainObject(trace)) return { valid: false, errors: ["trace debe ser un objeto"] };
  const errors = [];
  if (!isNonEmptyString(trace.etapaId)) errors.push("etapaId debe ser una cadena no vacía");
  if (!isNonEmptyString(trace.decisionId)) errors.push("decisionId debe ser una cadena no vacía");
  if (!isNonEmptyString(trace.timestamp)) errors.push("timestamp debe ser una cadena no vacía");
  const outcome = validateOutcome(trace.outcome);
  if (!outcome.valid) errors.push(...outcome.errors.map(e => `outcome: ${e}`));
  return { valid: errors.length === 0, errors };
}

export function assertValidTrace(trace) {
  const { valid, errors } = validateTrace(trace);
  if (!valid) throw new SchemaValidationError(errors);
  return trace;
}

// lib/knowledge/reasoning/reasoningContext.js
//
// Los datos de un expediente concreto contra los que se evalúan condiciones
// y reglas: los campos recogidos (`data`), la evidencia disponible
// (`evidence[]`), y el ramo/variante que determina qué Workflow aplica.

import { isNonEmptyString, isPlainObject, isArrayOf } from "../validators.js";
import { SchemaValidationError } from "../errors.js";
import { validateEvidence } from "./evidence.js";

export function createReasoningContext(data = {}) {
  const context = {
    data: data.data ?? {},
    evidence: data.evidence ?? [],
    ramo: data.ramo ?? null,
    variante: data.variante ?? null,
  };
  return assertValidReasoningContext(context);
}

export function validateReasoningContext(context) {
  if (!isPlainObject(context)) return { valid: false, errors: ["reasoningContext debe ser un objeto"] };
  const errors = [];
  if (!isPlainObject(context.data)) errors.push("data debe ser un objeto");
  if (!Array.isArray(context.evidence)) {
    errors.push("evidence debe ser un array");
  } else {
    errors.push(...context.evidence.flatMap((e, i) => {
      const r = validateEvidence(e);
      return r.valid ? [] : r.errors.map(err => `evidence[${i}]: ${err}`);
    }));
  }
  if (context.ramo !== null && !isNonEmptyString(context.ramo)) errors.push("ramo debe ser una cadena no vacía o null");
  if (context.variante !== null && !isNonEmptyString(context.variante)) errors.push("variante debe ser una cadena no vacía o null");
  return { valid: errors.length === 0, errors };
}

export function assertValidReasoningContext(context) {
  const { valid, errors } = validateReasoningContext(context);
  if (!valid) throw new SchemaValidationError(errors);
  return context;
}

// Acceso por ruta con puntos, p. ej. "data.franquicia". Se usa aquí y en
// condition.js con el mismo criterio: undefined si el camino no existe, sin
// lanzar.
export function getContextField(context, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), context);
}

// No muta: devuelve un contexto nuevo con los datos fusionados.
export function withData(context, patch) {
  return createReasoningContext({ ...context, data: { ...context.data, ...patch } });
}

// No muta: devuelve un contexto nuevo con la evidencia añadida.
export function withEvidence(context, evidence) {
  return createReasoningContext({ ...context, evidence: [...context.evidence, evidence] });
}

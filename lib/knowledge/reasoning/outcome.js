// lib/knowledge/reasoning/outcome.js
//
// El resultado de evaluar una Decision: no un valor suelto, sino una
// explicación completa — valor decidido, nivel de confianza, por qué (las
// reglas que coincidieron) y sobre qué (la evidencia citada). Es la
// traducción directa del encargo: "las decisiones no deben devolver
// únicamente un resultado, sino una explicación completa".

import { CONFIANZA } from "../types.js";
import { isNonEmptyString, isPlainObject, isOneOf, isArrayOf } from "../validators.js";
import { SchemaValidationError } from "../errors.js";

export function createOutcome(data) {
  if (!isPlainObject(data)) throw new SchemaValidationError(["outcome debe ser un objeto"]);
  const outcome = {
    valor: data.valor ?? null,
    confianza: data.confianza ?? "sin_verificar",
    explicacion: data.explicacion ?? "",
    reglasAplicadas: data.reglasAplicadas ?? [],
    evidenciasUsadas: data.evidenciasUsadas ?? [],
  };
  return assertValidOutcome(outcome);
}

export function validateOutcome(outcome) {
  if (!isPlainObject(outcome)) return { valid: false, errors: ["outcome debe ser un objeto"] };
  const errors = [];
  if (outcome.valor !== null && !isNonEmptyString(outcome.valor)) {
    errors.push("valor debe ser una cadena no vacía o null (null = sin determinar)");
  }
  if (!isOneOf(outcome.confianza, CONFIANZA)) errors.push(`confianza debe ser una de: ${CONFIANZA.join(", ")}`);
  if (typeof outcome.explicacion !== "string") errors.push("explicacion debe ser una cadena");
  if (!isArrayOf(outcome.reglasAplicadas, isNonEmptyString)) errors.push("reglasAplicadas debe ser un array de cadenas");
  if (!isArrayOf(outcome.evidenciasUsadas, isNonEmptyString)) errors.push("evidenciasUsadas debe ser un array de cadenas");
  return { valid: errors.length === 0, errors };
}

export function assertValidOutcome(outcome) {
  const { valid, errors } = validateOutcome(outcome);
  if (!valid) throw new SchemaValidationError(errors);
  return outcome;
}

// Un outcome sin ninguna regla aplicable: no es un error, es una respuesta
// legítima cuando la información disponible no basta para decidir.
export function undeterminedOutcome(motivo = "No hay reglas aplicables con la información disponible.") {
  return createOutcome({ valor: null, confianza: "sin_verificar", explicacion: motivo });
}

// lib/knowledge/reasoning/caseState.js
//
// El estado de un expediente concreto avanzando por un Workflow: en qué
// etapa está, cuáles ya completó, su ReasoningContext acumulado, y el
// historial completo de Trace. Todas las funciones son inmutables: devuelven
// un CaseState nuevo, nunca modifican el que reciben — mismo principio que
// KP-01 aplica a las versiones de una KU (nunca se sobrescribe, se añade).

import { isNonEmptyString, isPlainObject, isArrayOf } from "../validators.js";
import { SchemaValidationError } from "../errors.js";
import { validateReasoningContext } from "./reasoningContext.js";
import { validateTrace } from "./trace.js";

export function createCaseState(data) {
  if (!isPlainObject(data)) throw new SchemaValidationError(["caseState debe ser un objeto"]);
  const caseState = {
    workflowId: data.workflowId,
    etapaActualId: data.etapaActualId,
    etapasCompletadas: data.etapasCompletadas ?? [],
    context: data.context,
    traces: data.traces ?? [],
  };
  return assertValidCaseState(caseState);
}

export function validateCaseState(caseState) {
  if (!isPlainObject(caseState)) return { valid: false, errors: ["caseState debe ser un objeto"] };
  const errors = [];
  if (!isNonEmptyString(caseState.workflowId)) errors.push("workflowId debe ser una cadena no vacía");
  if (!isNonEmptyString(caseState.etapaActualId)) errors.push("etapaActualId debe ser una cadena no vacía");
  if (!isArrayOf(caseState.etapasCompletadas, isNonEmptyString)) errors.push("etapasCompletadas debe ser un array de cadenas");

  const ctx = validateReasoningContext(caseState.context);
  if (!ctx.valid) errors.push(...ctx.errors.map(e => `context: ${e}`));

  if (!Array.isArray(caseState.traces)) {
    errors.push("traces debe ser un array");
  } else {
    caseState.traces.forEach((t, i) => {
      const r = validateTrace(t);
      if (!r.valid) errors.push(...r.errors.map(e => `traces[${i}]: ${e}`));
    });
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidCaseState(caseState) {
  const { valid, errors } = validateCaseState(caseState);
  if (!valid) throw new SchemaValidationError(errors, caseState?.workflowId);
  return caseState;
}

export function appendTrace(caseState, trace) {
  return createCaseState({ ...caseState, traces: [...caseState.traces, trace] });
}

export function markStageComplete(caseState, etapaId) {
  if (caseState.etapasCompletadas.includes(etapaId)) return caseState;
  return createCaseState({ ...caseState, etapasCompletadas: [...caseState.etapasCompletadas, etapaId] });
}

export function moveToStage(caseState, etapaId) {
  return createCaseState({
    ...markStageComplete(caseState, caseState.etapaActualId),
    etapaActualId: etapaId,
  });
}

export function withContext(caseState, context) {
  return createCaseState({ ...caseState, context });
}

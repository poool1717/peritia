// lib/knowledge/reasoning/stage.js
//
// Una etapa del razonamiento pericial: qué necesita (obligatorio y
// opcional, con requisitos condicionales según el contexto — BR-34 es el
// caso real que exige esto: Instant Payment no necesita inspección
// presencial, pero sí la misma exigencia en causa y valoración), qué
// produce, y qué Decision(es) se toman en ella.
//
// Una Stage NO sabe de qué Workflow forma parte, ni de qué depende — eso es
// responsabilidad de workflow.js. La misma Stage se reutiliza en varios
// Workflows distintos.

import { isNonEmptyString, isPlainObject, isArrayOf } from "../validators.js";
import { SchemaValidationError } from "../errors.js";
import { validateCondition, evaluateCondition } from "./condition.js";
import { validateDecision } from "./decision.js";
import { getContextField } from "./reasoningContext.js";

export function createStage(data) {
  if (!isPlainObject(data)) throw new SchemaValidationError(["stage debe ser un objeto"]);
  const stage = {
    id: data.id,
    label: data.label,
    entradasRequeridas: data.entradasRequeridas ?? [],
    entradasOpcionales: data.entradasOpcionales ?? [],
    requisitosCondicionales: data.requisitosCondicionales ?? [],
    salidas: data.salidas ?? [],
    decisiones: data.decisiones ?? [],
  };
  return assertValidStage(stage);
}

export function validateStage(stage) {
  if (!isPlainObject(stage)) return { valid: false, errors: ["stage debe ser un objeto"] };
  const errors = [];
  if (!isNonEmptyString(stage.id)) errors.push("id debe ser una cadena no vacía");
  if (!isNonEmptyString(stage.label)) errors.push("label debe ser una cadena no vacía");
  if (!isArrayOf(stage.entradasRequeridas, isNonEmptyString)) errors.push("entradasRequeridas debe ser un array de cadenas");
  if (!isArrayOf(stage.entradasOpcionales, isNonEmptyString)) errors.push("entradasOpcionales debe ser un array de cadenas");
  if (!isArrayOf(stage.salidas, isNonEmptyString)) errors.push("salidas debe ser un array de cadenas");

  if (!Array.isArray(stage.requisitosCondicionales)) {
    errors.push("requisitosCondicionales debe ser un array");
  } else {
    stage.requisitosCondicionales.forEach((r, i) => {
      if (!isPlainObject(r)) { errors.push(`requisitosCondicionales[${i}] debe ser un objeto`); return; }
      const cond = validateCondition(r.cuando);
      if (!cond.valid) errors.push(...cond.errors.map(e => `requisitosCondicionales[${i}].cuando: ${e}`));
      if (!isArrayOf(r.requiere, isNonEmptyString)) errors.push(`requisitosCondicionales[${i}].requiere debe ser un array de cadenas`);
    });
  }

  if (!Array.isArray(stage.decisiones)) {
    errors.push("decisiones debe ser un array");
  } else {
    stage.decisiones.forEach((d, i) => {
      const r = validateDecision(d);
      if (!r.valid) errors.push(...r.errors.map(e => `decisiones[${i}]: ${e}`));
    });
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidStage(stage) {
  const { valid, errors } = validateStage(stage);
  if (!valid) throw new SchemaValidationError(errors, isPlainObject(stage) ? stage.id : undefined);
  return stage;
}

// Entradas obligatorias reales para ESTE contexto: las fijas más las que
// activan sus requisitos condicionales. Es la pieza que hace que "qué es
// obligatorio" dependa del expediente, no de una lista estática única.
export function getRequiredInputsFor(stage, context) {
  const condicionales = stage.requisitosCondicionales
    .filter(r => evaluateCondition(r.cuando, context))
    .flatMap(r => r.requiere);
  return [...new Set([...stage.entradasRequeridas, ...condicionales])];
}

// {required, optional} — lo que aún falta en context.data, no lo que se pide.
export function getMissingInputs(stage, context) {
  const presente = campo => getContextField(context, `data.${campo}`) !== undefined && getContextField(context, `data.${campo}`) !== null;
  return {
    required: getRequiredInputsFor(stage, context).filter(c => !presente(c)),
    optional: stage.entradasOpcionales.filter(c => !presente(c)),
  };
}

export function isStageComplete(stage, context) {
  return getMissingInputs(stage, context).required.length === 0;
}

export function findDecision(stage, decisionId) {
  return stage.decisiones.find(d => d.id === decisionId);
}

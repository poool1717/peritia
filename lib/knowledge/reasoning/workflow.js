// lib/knowledge/reasoning/workflow.js
//
// La secuencia de etapas de un ramo/variante concreto, como DATOS: qué
// etapas usa (reutilizando las de stage.js, por id) y cómo se transita
// entre ellas, con condiciones declarativas opcionales. Añadir un ramo
// nuevo, o una variante como Instant Payment, es escribir un Workflow
// nuevo — nunca tocar el motor ni las Stage.
//
// Ejemplo real que justifica las transiciones condicionales:
// STATE_MACHINES.md §1 ya documenta "EnVerificacion --> EnInspeccion:
// modalidad presencial" / "EnVerificacion --> EnAnalisis: modalidad
// documental" — una bifurcación real, no inventada para este diseño.

import { isNonEmptyString, isPlainObject, isArrayOf } from "../validators.js";
import { SchemaValidationError } from "../errors.js";
import { validateCondition, evaluateCondition } from "./condition.js";

export function createWorkflow(data) {
  if (!isPlainObject(data)) throw new SchemaValidationError(["workflow debe ser un objeto"]);
  const workflow = {
    id: data.id,
    ramo: data.ramo,
    variante: data.variante,
    etapaInicial: data.etapaInicial,
    etapas: data.etapas ?? [],
    transiciones: data.transiciones ?? [],
  };
  return assertValidWorkflow(workflow);
}

export function validateWorkflow(workflow) {
  if (!isPlainObject(workflow)) return { valid: false, errors: ["workflow debe ser un objeto"] };
  const errors = [];
  if (!isNonEmptyString(workflow.id)) errors.push("id debe ser una cadena no vacía");
  if (!isNonEmptyString(workflow.ramo)) errors.push("ramo debe ser una cadena no vacía");
  if (!isNonEmptyString(workflow.variante)) errors.push("variante debe ser una cadena no vacía");
  if (!isArrayOf(workflow.etapas, isNonEmptyString) || workflow.etapas.length === 0) {
    errors.push("etapas debe ser un array no vacío de identificadores de Stage");
  }
  if (!isNonEmptyString(workflow.etapaInicial) || !workflow.etapas.includes(workflow.etapaInicial)) {
    errors.push("etapaInicial debe ser una de las etapas declaradas en 'etapas'");
  }

  if (!Array.isArray(workflow.transiciones)) {
    errors.push("transiciones debe ser un array");
  } else {
    workflow.transiciones.forEach((t, i) => {
      if (!isPlainObject(t)) { errors.push(`transiciones[${i}] debe ser un objeto`); return; }
      if (!workflow.etapas.includes(t.desde)) errors.push(`transiciones[${i}].desde ("${t.desde}") no está en 'etapas'`);
      if (!workflow.etapas.includes(t.hasta)) errors.push(`transiciones[${i}].hasta ("${t.hasta}") no está en 'etapas'`);
      const cond = validateCondition(t.cuando ?? null);
      if (!cond.valid) errors.push(...cond.errors.map(e => `transiciones[${i}].cuando: ${e}`));
    });
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidWorkflow(workflow) {
  const { valid, errors } = validateWorkflow(workflow);
  if (!valid) throw new SchemaValidationError(errors, isPlainObject(workflow) ? workflow.id : undefined);
  return workflow;
}

// Las etapas de destino alcanzables desde la etapa actual cuyas
// condiciones de transición se cumplen con el contexto dado. Una
// transición sin `cuando` es incondicional (siempre disponible).
export function getAvailableTransitions(workflow, etapaActualId, context) {
  return workflow.transiciones
    .filter(t => t.desde === etapaActualId && evaluateCondition(t.cuando ?? null, context))
    .map(t => t.hasta);
}

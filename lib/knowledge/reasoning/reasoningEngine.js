// lib/knowledge/reasoning/reasoningEngine.js
//
// El Pericial Decision Engine: compone Stage + Workflow + Rule y orquesta
// el avance de un CaseState. No integra con la aplicación, no persiste
// nada, no llama a IA — opera enteramente sobre los objetos planos que
// recibe y que devuelve.

import { findDecision, getMissingInputs as getStageMissingInputs, isStageComplete } from "./stage.js";
import { getAvailableTransitions as getWorkflowTransitions } from "./workflow.js";
import { evaluateDecision as evaluateDecisionDef } from "./decision.js";
import { createTrace } from "./trace.js";
import { createCaseState, appendTrace, moveToStage } from "./caseState.js";
import { NotFoundError } from "../errors.js";

export function createReasoningEngine({ stages = [], workflows = [], rules = [] } = {}) {
  const findStage = id => stages.find(s => s.id === id);
  const findWorkflow = id => workflows.find(w => w.id === id);

  function requireStage(id) {
    const stage = findStage(id);
    if (!stage) throw new NotFoundError(id);
    return stage;
  }
  function requireWorkflow(id) {
    const workflow = findWorkflow(id);
    if (!workflow) throw new NotFoundError(id);
    return workflow;
  }

  function startCase(workflowId, context) {
    const workflow = requireWorkflow(workflowId);
    return createCaseState({
      workflowId,
      etapaActualId: workflow.etapaInicial,
      context,
    });
  }

  function currentStage(caseState) {
    return requireStage(caseState.etapaActualId);
  }

  function getMissingInputs(caseState) {
    return getStageMissingInputs(currentStage(caseState), caseState.context);
  }

  function canAdvance(caseState) {
    return isStageComplete(currentStage(caseState), caseState.context);
  }

  // A qué etapas se podría transitar desde la actual, según el Workflow y
  // el contexto — con independencia de si la etapa actual ya está completa.
  function getAvailableTransitions(caseState) {
    const workflow = requireWorkflow(caseState.workflowId);
    return getWorkflowTransitions(workflow, caseState.etapaActualId, caseState.context);
  }

  // Evalúa una Decision de la etapa actual sin registrar nada — para poder
  // previsualizar el Outcome antes de decidir si se acepta.
  function evaluateDecision(caseState, decisionId, { evidenceIds = [] } = {}) {
    const decision = findDecision(currentStage(caseState), decisionId);
    if (!decision) throw new NotFoundError(decisionId);
    return evaluateDecisionDef(decision, caseState.context, { rules, evidenceIds });
  }

  // Registra un Outcome ya calculado (propio o de evaluateDecision) como
  // Trace. No lo recalcula: permite que quien llama anote o sustituya el
  // Outcome antes de dejar constancia.
  function recordDecision(caseState, decisionId, outcome) {
    const trace = createTrace({ etapaId: caseState.etapaActualId, decisionId, outcome });
    return appendTrace(caseState, trace);
  }

  // Conveniencia: evalúa y registra en un solo paso.
  function decide(caseState, decisionId, { evidenceIds = [] } = {}) {
    const outcome = evaluateDecision(caseState, decisionId, { evidenceIds });
    return recordDecision(caseState, decisionId, outcome);
  }

  // Avanza a una etapa concreta, si es alcanzable desde la actual con el
  // contexto de hoy. No exige que la etapa actual esté "completa" — esa
  // comprobación (canAdvance) queda a criterio de quien llama, igual que en
  // la aplicación real el perito puede saltar entre secciones.
  function advance(caseState, etapaDestinoId) {
    const disponibles = getAvailableTransitions(caseState);
    if (!disponibles.includes(etapaDestinoId)) {
      throw new NotFoundError(`transición ${caseState.etapaActualId} → ${etapaDestinoId}`);
    }
    requireStage(etapaDestinoId); // valida que la etapa de destino exista de verdad
    return moveToStage(caseState, etapaDestinoId);
  }

  function getTrace(caseState) {
    return caseState.traces;
  }

  return {
    startCase,
    currentStage,
    getMissingInputs,
    canAdvance,
    getAvailableTransitions,
    evaluateDecision,
    recordDecision,
    decide,
    advance,
    getTrace,
  };
}

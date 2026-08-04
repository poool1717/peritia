import { describe, it, expect } from "vitest";
import {
  createCaseState, validateCaseState, assertValidCaseState,
  appendTrace, markStageComplete, moveToStage, withContext,
} from "../../../lib/knowledge/reasoning/caseState.js";
import { createReasoningContext } from "../../../lib/knowledge/reasoning/reasoningContext.js";
import { createTrace } from "../../../lib/knowledge/reasoning/trace.js";
import { createOutcome } from "../../../lib/knowledge/reasoning/outcome.js";
import { SchemaValidationError } from "../../../lib/knowledge/errors.js";

const CONTEXT = createReasoningContext({ ramo: "hogar", variante: "estandar" });
const CASE = createCaseState({ workflowId: "workflow://hogar/estandar", etapaActualId: "encargo", context: CONTEXT });

describe("createCaseState — valores por defecto", () => {
  it("etapasCompletadas y traces por defecto vacíos", () => {
    expect(CASE.etapasCompletadas).toEqual([]);
    expect(CASE.traces).toEqual([]);
  });
  it("lanza SchemaValidationError si falta algo obligatorio", () => {
    expect(() => createCaseState({ workflowId: "", etapaActualId: "x", context: CONTEXT })).toThrow(SchemaValidationError);
  });
});

describe("validateCaseState", () => {
  it("valida el context embebido", () => {
    expect(validateCaseState({ ...CASE, context: { ramo: 42 } }).valid).toBe(false);
  });
  it("valida cada trace embebido", () => {
    const traceInvalido = { etapaId: "", decisionId: "y", outcome: createOutcome({ valor: "x" }), timestamp: "t" };
    expect(validateCaseState({ ...CASE, traces: [traceInvalido] }).valid).toBe(false);
  });
  it("rechaza traces si no es un array", () => {
    expect(validateCaseState({ ...CASE, traces: "no-array" }).valid).toBe(false);
  });
  it("rechaza algo que no sea un objeto", () => {
    expect(validateCaseState(null).valid).toBe(false);
  });
});

describe("appendTrace — inmutabilidad", () => {
  it("no muta el original, añade el trace al final", () => {
    const trace = createTrace({ etapaId: "encargo", decisionId: "encargo_completo", outcome: createOutcome({ valor: "completo" }) });
    const actualizado = appendTrace(CASE, trace);
    expect(CASE.traces).toEqual([]);
    expect(actualizado.traces).toEqual([trace]);
  });
  it("dos appendTrace sucesivos acumulan, no sobrescriben", () => {
    const t1 = createTrace({ etapaId: "encargo", decisionId: "d1", outcome: createOutcome({ valor: "a" }) });
    const t2 = createTrace({ etapaId: "encargo", decisionId: "d2", outcome: createOutcome({ valor: "b" }) });
    const conAmbos = appendTrace(appendTrace(CASE, t1), t2);
    expect(conAmbos.traces).toEqual([t1, t2]);
  });
});

describe("markStageComplete", () => {
  it("añade la etapa a etapasCompletadas", () => {
    const actualizado = markStageComplete(CASE, "encargo");
    expect(actualizado.etapasCompletadas).toEqual(["encargo"]);
  });
  it("no la duplica si ya estaba", () => {
    const primero = markStageComplete(CASE, "encargo");
    const segundo = markStageComplete(primero, "encargo");
    expect(segundo.etapasCompletadas).toEqual(["encargo"]);
  });
});

describe("moveToStage", () => {
  it("cambia etapaActualId y marca la anterior como completada", () => {
    const actualizado = moveToStage(CASE, "verificacion_riesgo");
    expect(actualizado.etapaActualId).toBe("verificacion_riesgo");
    expect(actualizado.etapasCompletadas).toEqual(["encargo"]);
  });
  it("no muta el caseState original", () => {
    moveToStage(CASE, "verificacion_riesgo");
    expect(CASE.etapaActualId).toBe("encargo");
  });
});

describe("withContext", () => {
  it("reemplaza el context sin mutar el original", () => {
    const nuevoContexto = createReasoningContext({ data: { a: 1 } });
    const actualizado = withContext(CASE, nuevoContexto);
    expect(actualizado.context).toEqual(nuevoContexto);
    expect(CASE.context.data).toEqual({});
  });
});

describe("assertValidCaseState", () => {
  it("devuelve el mismo caseState si es válido", () => {
    expect(assertValidCaseState(CASE)).toBe(CASE);
  });
});

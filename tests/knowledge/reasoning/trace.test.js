import { describe, it, expect } from "vitest";
import { createTrace, validateTrace, assertValidTrace } from "../../../lib/knowledge/reasoning/trace.js";
import { createOutcome } from "../../../lib/knowledge/reasoning/outcome.js";
import { SchemaValidationError } from "../../../lib/knowledge/errors.js";

const OUTCOME = createOutcome({ valor: "procede", confianza: "alta" });

describe("createTrace", () => {
  it("genera un timestamp si no se da uno", () => {
    const trace = createTrace({ etapaId: "cobertura_indemnizacion", decisionId: "procede_indemnizacion", outcome: OUTCOME });
    expect(trace.timestamp).toEqual(expect.any(String));
    expect(new Date(trace.timestamp).toString()).not.toBe("Invalid Date");
  });
  it("respeta el timestamp dado", () => {
    const trace = createTrace({ etapaId: "x", decisionId: "y", outcome: OUTCOME, timestamp: "2026-08-01T00:00:00.000Z" });
    expect(trace.timestamp).toBe("2026-08-01T00:00:00.000Z");
  });
});

describe("validateTrace", () => {
  it("acepta un trace bien formado", () => {
    const trace = createTrace({ etapaId: "x", decisionId: "y", outcome: OUTCOME });
    expect(validateTrace(trace)).toEqual({ valid: true, errors: [] });
  });
  it("rechaza etapaId o decisionId vacíos", () => {
    expect(validateTrace({ etapaId: "", decisionId: "y", outcome: OUTCOME, timestamp: "t" }).valid).toBe(false);
    expect(validateTrace({ etapaId: "x", decisionId: "", outcome: OUTCOME, timestamp: "t" }).valid).toBe(false);
  });
  it("rechaza un outcome inválido", () => {
    expect(validateTrace({ etapaId: "x", decisionId: "y", outcome: { valor: "x" }, timestamp: "t" }).valid).toBe(false);
  });
  it("rechaza timestamp vacío", () => {
    expect(validateTrace({ etapaId: "x", decisionId: "y", outcome: OUTCOME, timestamp: "" }).valid).toBe(false);
  });
  it("rechaza algo que no sea un objeto", () => {
    expect(validateTrace(null).valid).toBe(false);
  });
});

describe("assertValidTrace", () => {
  it("lanza SchemaValidationError si no es válido", () => {
    expect(() => assertValidTrace({ etapaId: "", decisionId: "y", outcome: OUTCOME, timestamp: "t" })).toThrow(SchemaValidationError);
  });
});

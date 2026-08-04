import { describe, it, expect } from "vitest";
import { createOutcome, validateOutcome, assertValidOutcome, undeterminedOutcome } from "../../../lib/knowledge/reasoning/outcome.js";
import { SchemaValidationError } from "../../../lib/knowledge/errors.js";

describe("validateOutcome", () => {
  it("acepta un outcome completo", () => {
    const r = validateOutcome({
      valor: "no_procede", confianza: "alta", explicacion: "x",
      reglasAplicadas: ["knowledge://rules/br-21-a"], evidenciasUsadas: ["ev-1"],
    });
    expect(r).toEqual({ valid: true, errors: [] });
  });
  it("acepta valor: null (sin determinar)", () => {
    expect(validateOutcome({ valor: null, confianza: "sin_verificar", explicacion: "", reglasAplicadas: [], evidenciasUsadas: [] }).valid).toBe(true);
  });
  it("rechaza una confianza desconocida", () => {
    expect(validateOutcome({ valor: "x", confianza: "muy-alta", explicacion: "", reglasAplicadas: [], evidenciasUsadas: [] }).valid).toBe(false);
  });
  it("rechaza valor vacío (ni cadena no vacía ni null)", () => {
    expect(validateOutcome({ valor: "", confianza: "alta", explicacion: "", reglasAplicadas: [], evidenciasUsadas: [] }).valid).toBe(false);
  });
  it("rechaza explicacion si no es una cadena", () => {
    expect(validateOutcome({ valor: "x", confianza: "alta", explicacion: 42, reglasAplicadas: [], evidenciasUsadas: [] }).valid).toBe(false);
  });
  it("rechaza algo que no sea un objeto", () => {
    expect(validateOutcome(null).valid).toBe(false);
  });
  it("rechaza reglasAplicadas o evidenciasUsadas que no sean array de cadenas", () => {
    expect(validateOutcome({ valor: "x", confianza: "alta", explicacion: "", reglasAplicadas: "no-array", evidenciasUsadas: [] }).valid).toBe(false);
    expect(validateOutcome({ valor: "x", confianza: "alta", explicacion: "", reglasAplicadas: [], evidenciasUsadas: [1, 2] }).valid).toBe(false);
  });
});

describe("createOutcome — valores por defecto", () => {
  it("rellena confianza, explicacion, reglasAplicadas y evidenciasUsadas si no se dan", () => {
    const o = createOutcome({ valor: "procede" });
    expect(o).toEqual({ valor: "procede", confianza: "sin_verificar", explicacion: "", reglasAplicadas: [], evidenciasUsadas: [] });
  });
  it("lanza SchemaValidationError si el resultado no es válido", () => {
    expect(() => createOutcome({ valor: "x", confianza: "muy-alta" })).toThrow(SchemaValidationError);
  });
});

describe("undeterminedOutcome", () => {
  it("valor null, confianza sin_verificar, con explicación por defecto", () => {
    const o = undeterminedOutcome();
    expect(o.valor).toBeNull();
    expect(o.confianza).toBe("sin_verificar");
    expect(o.explicacion).toContain("No hay reglas aplicables");
  });
  it("acepta un motivo propio", () => {
    expect(undeterminedOutcome("motivo concreto").explicacion).toBe("motivo concreto");
  });
});

describe("assertValidOutcome", () => {
  it("devuelve el mismo outcome si es válido", () => {
    const o = { valor: "x", confianza: "alta", explicacion: "", reglasAplicadas: [], evidenciasUsadas: [] };
    expect(assertValidOutcome(o)).toBe(o);
  });
});

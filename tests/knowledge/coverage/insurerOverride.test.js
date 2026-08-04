import { describe, it, expect } from "vitest";
import { createInsurerOverride, validateInsurerOverride, assertValidInsurerOverride } from "../../../lib/knowledge/coverage/insurerOverride.js";
import { SchemaValidationError } from "../../../lib/knowledge/errors.js";
import { AXA_DAGUA_OVERRIDE, OTRA_ASEGURADORA_OVERRIDE } from "./fixtures.js";

describe("validateInsurerOverride — fixtures reales", () => {
  it("el override de AXA es válido", () => {
    expect(validateInsurerOverride(AXA_DAGUA_OVERRIDE)).toEqual({ valid: true, errors: [] });
  });
  it("un override sin nada específico (todo por defecto) también es válido", () => {
    expect(validateInsurerOverride(OTRA_ASEGURADORA_OVERRIDE)).toEqual({ valid: true, errors: [] });
  });
});

describe("createInsurerOverride — normalización", () => {
  it("rellena los campos opcionales ausentes con su valor por defecto", () => {
    const o = createInsurerOverride({ coverageId: "knowledge://coverages/incendio", aseguradora: "Zurich" });
    expect(o).toEqual({
      coverageId: "knowledge://coverages/incendio",
      aseguradora: "Zurich",
      nombreComercial: null,
      alcance: {},
      exclusionesAdicionales: [],
      exclusionesNoAplicables: [],
      limitesEspecificos: [],
      reglasSeleccionCapital: null,
    });
  });
});

describe("validateInsurerOverride — validaciones", () => {
  it("rechaza coverageId inválido o ausente", () => {
    expect(validateInsurerOverride({ ...AXA_DAGUA_OVERRIDE, coverageId: "no-valido" }).valid).toBe(false);
    const { coverageId, ...sinId } = AXA_DAGUA_OVERRIDE;
    expect(validateInsurerOverride(sinId).valid).toBe(false);
  });
  it("rechaza aseguradora vacía o ausente", () => {
    expect(validateInsurerOverride({ ...AXA_DAGUA_OVERRIDE, aseguradora: "" }).valid).toBe(false);
  });
  it("rechaza nombreComercial si no es cadena no vacía ni null", () => {
    expect(validateInsurerOverride({ ...AXA_DAGUA_OVERRIDE, nombreComercial: "" }).valid).toBe(false);
    expect(validateInsurerOverride({ ...AXA_DAGUA_OVERRIDE, nombreComercial: null }).valid).toBe(true);
  });
  it("rechaza alcance.continente/contenido si no son cadena no vacía ni null", () => {
    expect(validateInsurerOverride({ ...AXA_DAGUA_OVERRIDE, alcance: { continente: 42 } }).valid).toBe(false);
  });
  it("rechaza una exclusión adicional mal formada", () => {
    const r = validateInsurerOverride({ ...AXA_DAGUA_OVERRIDE, exclusionesAdicionales: [{ tipo: "inventado", descripcion: "x" }] });
    expect(r.valid).toBe(false);
  });
  it("rechaza exclusionesNoAplicables si no es un array de cadenas", () => {
    expect(validateInsurerOverride({ ...AXA_DAGUA_OVERRIDE, exclusionesNoAplicables: "no es un array" }).valid).toBe(false);
    expect(validateInsurerOverride({ ...AXA_DAGUA_OVERRIDE, exclusionesNoAplicables: [""] }).valid).toBe(false);
  });
  it("acepta reglasSeleccionCapital null, rechaza cadena vacía", () => {
    expect(validateInsurerOverride({ ...AXA_DAGUA_OVERRIDE, reglasSeleccionCapital: null }).valid).toBe(true);
    expect(validateInsurerOverride({ ...AXA_DAGUA_OVERRIDE, reglasSeleccionCapital: "" }).valid).toBe(false);
  });
});

describe("assertValidInsurerOverride / createInsurerOverride ante datos inválidos", () => {
  it("lanza SchemaValidationError", () => {
    expect(() => assertValidInsurerOverride({ coverageId: "no-valido", aseguradora: "" })).toThrow(SchemaValidationError);
    expect(() => createInsurerOverride({ coverageId: "no-valido", aseguradora: "AXA" })).toThrow(SchemaValidationError);
  });
});

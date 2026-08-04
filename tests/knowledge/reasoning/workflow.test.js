import { describe, it, expect } from "vitest";
import { createWorkflow, validateWorkflow, assertValidWorkflow, getAvailableTransitions } from "../../../lib/knowledge/reasoning/workflow.js";
import { SchemaValidationError } from "../../../lib/knowledge/errors.js";

const WORKFLOW = {
  id: "workflow://hogar/estandar",
  ramo: "hogar",
  variante: "estandar",
  etapaInicial: "encargo",
  etapas: ["encargo", "verificacion_riesgo", "inspeccion", "causas"],
  transiciones: [
    { desde: "encargo", hasta: "verificacion_riesgo" },
    { desde: "verificacion_riesgo", hasta: "inspeccion", cuando: { campo: "data.modalidadVisita", operador: "equals", valor: "PRESENCIAL" } },
    { desde: "inspeccion", hasta: "causas" },
  ],
};

describe("validateWorkflow", () => {
  it("acepta un workflow bien formado", () => {
    expect(validateWorkflow(WORKFLOW)).toEqual({ valid: true, errors: [] });
  });
  it("rechaza etapaInicial que no está en 'etapas'", () => {
    expect(validateWorkflow({ ...WORKFLOW, etapaInicial: "no-existe" }).valid).toBe(false);
  });
  it("rechaza una transición cuyo 'desde' o 'hasta' no está en 'etapas'", () => {
    const r1 = validateWorkflow({ ...WORKFLOW, transiciones: [{ desde: "no-existe", hasta: "causas" }] });
    expect(r1.valid).toBe(false);
    const r2 = validateWorkflow({ ...WORKFLOW, transiciones: [{ desde: "encargo", hasta: "no-existe" }] });
    expect(r2.valid).toBe(false);
  });
  it("rechaza una transición con condición mal formada", () => {
    const r = validateWorkflow({ ...WORKFLOW, transiciones: [{ desde: "encargo", hasta: "causas", cuando: { campo: "x", operador: "inventado", valor: 1 } }] });
    expect(r.valid).toBe(false);
  });
  it("rechaza etapas vacío", () => {
    expect(validateWorkflow({ ...WORKFLOW, etapas: [] }).valid).toBe(false);
  });
  it("rechaza ramo o variante vacíos", () => {
    expect(validateWorkflow({ ...WORKFLOW, ramo: "" }).valid).toBe(false);
    expect(validateWorkflow({ ...WORKFLOW, variante: "" }).valid).toBe(false);
  });
  it("rechaza transiciones si no es un array, o una transición que no es un objeto", () => {
    expect(validateWorkflow({ ...WORKFLOW, transiciones: "no-array" }).valid).toBe(false);
    expect(validateWorkflow({ ...WORKFLOW, transiciones: ["no-objeto"] }).valid).toBe(false);
  });
  it("rechaza algo que no sea un objeto", () => {
    expect(validateWorkflow(null).valid).toBe(false);
  });
});

describe("createWorkflow / assertValidWorkflow", () => {
  it("createWorkflow devuelve el workflow si es válido", () => {
    expect(createWorkflow(WORKFLOW)).toEqual(WORKFLOW);
  });
  it("lanza SchemaValidationError si no lo es", () => {
    expect(() => createWorkflow({ ...WORKFLOW, etapaInicial: "no-existe" })).toThrow(SchemaValidationError);
  });
  it("assertValidWorkflow devuelve el mismo workflow", () => {
    expect(assertValidWorkflow(WORKFLOW)).toBe(WORKFLOW);
  });
});

describe("getAvailableTransitions", () => {
  it("una transición sin 'cuando' está siempre disponible", () => {
    expect(getAvailableTransitions(WORKFLOW, "encargo", {})).toEqual(["verificacion_riesgo"]);
  });
  it("una transición condicionada solo aparece si la condición se cumple", () => {
    expect(getAvailableTransitions(WORKFLOW, "verificacion_riesgo", { data: { modalidadVisita: "PRESENCIAL" } }))
      .toEqual(["inspeccion"]);
    expect(getAvailableTransitions(WORKFLOW, "verificacion_riesgo", { data: { modalidadVisita: "DOCUMENTAL" } }))
      .toEqual([]);
  });
  it("array vacío si no hay transiciones desde esa etapa", () => {
    expect(getAvailableTransitions(WORKFLOW, "causas", {})).toEqual([]);
  });
});

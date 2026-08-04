import { describe, it, expect } from "vitest";
import {
  createStage, validateStage, assertValidStage,
  getRequiredInputsFor, getMissingInputs, isStageComplete, findDecision,
} from "../../../lib/knowledge/reasoning/stage.js";
import { createDecision } from "../../../lib/knowledge/reasoning/decision.js";
import { SchemaValidationError } from "../../../lib/knowledge/errors.js";

const DECISION = createDecision({
  id: "riesgo_verificado",
  pregunta: "¿Verificado?",
  posiblesValores: ["verificado", "pendiente"],
  reglas: ["knowledge://rules/x"],
});

const STAGE_BASE = {
  id: "verificacion_riesgo",
  label: "Verificación del Riesgo",
  entradasRequeridas: ["lugarIntervencion", "tipoRiesgo"],
  entradasOpcionales: ["refCatastral"],
  requisitosCondicionales: [
    { cuando: { campo: "data.modalidadVisita", operador: "equals", valor: "PRESENCIAL" }, requiere: ["inspeccionRealizada"] },
  ],
  salidas: ["riesgo_verificado"],
  decisiones: [DECISION],
};

describe("validateStage", () => {
  it("acepta una etapa bien formada", () => {
    expect(validateStage(STAGE_BASE)).toEqual({ valid: true, errors: [] });
  });
  it("rechaza requisitosCondicionales con una condición mal formada", () => {
    const r = validateStage({ ...STAGE_BASE, requisitosCondicionales: [{ cuando: { campo: "x", operador: "inventado", valor: 1 }, requiere: ["y"] }] });
    expect(r.valid).toBe(false);
  });
  it("rechaza una decisión mal formada dentro de decisiones", () => {
    const r = validateStage({ ...STAGE_BASE, decisiones: [{ id: "x" }] });
    expect(r.valid).toBe(false);
  });
  it("rechaza id o label vacíos", () => {
    expect(validateStage({ ...STAGE_BASE, id: "" }).valid).toBe(false);
    expect(validateStage({ ...STAGE_BASE, label: "" }).valid).toBe(false);
  });
  it("rechaza requisitosCondicionales o decisiones si no son arrays", () => {
    expect(validateStage({ ...STAGE_BASE, requisitosCondicionales: "no-array" }).valid).toBe(false);
    expect(validateStage({ ...STAGE_BASE, decisiones: "no-array" }).valid).toBe(false);
  });
  it("rechaza algo que no sea un objeto", () => {
    expect(validateStage(null).valid).toBe(false);
  });
});

describe("createStage — valores por defecto", () => {
  it("rellena las listas ausentes", () => {
    const s = createStage({ id: "x", label: "X" });
    expect(s.entradasRequeridas).toEqual([]);
    expect(s.entradasOpcionales).toEqual([]);
    expect(s.requisitosCondicionales).toEqual([]);
    expect(s.salidas).toEqual([]);
    expect(s.decisiones).toEqual([]);
  });
  it("lanza SchemaValidationError si no es válida", () => {
    expect(() => createStage({ id: "", label: "X" })).toThrow(SchemaValidationError);
  });
});

describe("getRequiredInputsFor — requisitos condicionales (BR-34)", () => {
  it("sin modalidadVisita presencial, no exige inspeccionRealizada", () => {
    const ctx = { data: { modalidadVisita: "DOCUMENTAL" } };
    expect(getRequiredInputsFor(STAGE_BASE, ctx)).toEqual(["lugarIntervencion", "tipoRiesgo"]);
  });
  it("con modalidadVisita presencial, añade inspeccionRealizada", () => {
    const ctx = { data: { modalidadVisita: "PRESENCIAL" } };
    expect(getRequiredInputsFor(STAGE_BASE, ctx)).toEqual(["lugarIntervencion", "tipoRiesgo", "inspeccionRealizada"]);
  });
  it("no duplica un campo que ya estuviera en las entradas fijas", () => {
    const stage = createStage({
      id: "x", label: "X", entradasRequeridas: ["a"],
      requisitosCondicionales: [{ cuando: null, requiere: ["a", "b"] }],
    });
    expect(getRequiredInputsFor(stage, {})).toEqual(["a", "b"]);
  });
});

describe("getMissingInputs / isStageComplete", () => {
  it("con el contexto vacío, faltan todas las entradas requeridas y opcionales", () => {
    const r = getMissingInputs(STAGE_BASE, { data: {} });
    expect(r.required).toEqual(expect.arrayContaining(["lugarIntervencion", "tipoRiesgo"]));
    expect(r.optional).toEqual(["refCatastral"]);
    expect(isStageComplete(STAGE_BASE, { data: {} })).toBe(false);
  });

  it("con las entradas requeridas presentes (modalidad documental), la etapa está completa", () => {
    const ctx = { data: { modalidadVisita: "DOCUMENTAL", lugarIntervencion: "C/ Mayor 1", tipoRiesgo: "Vivienda" } };
    expect(getMissingInputs(STAGE_BASE, ctx).required).toEqual([]);
    expect(isStageComplete(STAGE_BASE, ctx)).toBe(true);
  });

  it("modalidad presencial sin inspeccionRealizada: sigue faltando esa entrada condicional", () => {
    const ctx = { data: { modalidadVisita: "PRESENCIAL", lugarIntervencion: "C/ Mayor 1", tipoRiesgo: "Vivienda" } };
    expect(getMissingInputs(STAGE_BASE, ctx).required).toEqual(["inspeccionRealizada"]);
    expect(isStageComplete(STAGE_BASE, ctx)).toBe(false);
  });

  it("un valor null cuenta como ausente, no como presente", () => {
    const ctx = { data: { lugarIntervencion: null, tipoRiesgo: "Vivienda" } };
    expect(getMissingInputs(STAGE_BASE, ctx).required).toContain("lugarIntervencion");
  });
});

describe("findDecision", () => {
  it("encuentra una decisión por id", () => {
    expect(findDecision(STAGE_BASE, "riesgo_verificado")).toBe(DECISION);
  });
  it("undefined si no existe", () => {
    expect(findDecision(STAGE_BASE, "no-existe")).toBeUndefined();
  });
});

describe("assertValidStage", () => {
  it("devuelve la misma etapa si es válida", () => {
    expect(assertValidStage(STAGE_BASE)).toBe(STAGE_BASE);
  });
});

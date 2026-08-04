import { describe, it, expect } from "vitest";
import { evaluateCondition, validateCondition } from "../../../lib/knowledge/reasoning/condition.js";

describe("evaluateCondition — null/ausente", () => {
  it("sin condición, siempre se cumple", () => {
    expect(evaluateCondition(null, {})).toBe(true);
    expect(evaluateCondition(undefined, {})).toBe(true);
  });
});

describe("evaluateCondition — operadores sobre un valor literal", () => {
  const ctx = { data: { modalidadVisita: "PRESENCIAL", capital: 100, franquicia: null } };

  it("equals / notEquals", () => {
    expect(evaluateCondition({ campo: "data.modalidadVisita", operador: "equals", valor: "PRESENCIAL" }, ctx)).toBe(true);
    expect(evaluateCondition({ campo: "data.modalidadVisita", operador: "equals", valor: "DOCUMENTAL" }, ctx)).toBe(false);
    expect(evaluateCondition({ campo: "data.modalidadVisita", operador: "notEquals", valor: "DOCUMENTAL" }, ctx)).toBe(true);
  });

  it("exists / notExists", () => {
    expect(evaluateCondition({ campo: "data.capital", operador: "exists" }, ctx)).toBe(true);
    expect(evaluateCondition({ campo: "data.franquicia", operador: "exists" }, ctx)).toBe(false); // null cuenta como ausente
    expect(evaluateCondition({ campo: "data.inexistente", operador: "notExists" }, ctx)).toBe(true);
  });

  it("in / notIn", () => {
    expect(evaluateCondition({ campo: "data.modalidadVisita", operador: "in", valor: ["PRESENCIAL", "DOCUMENTAL"] }, ctx)).toBe(true);
    expect(evaluateCondition({ campo: "data.modalidadVisita", operador: "notIn", valor: ["DOCUMENTAL"] }, ctx)).toBe(true);
  });

  it("gt / gte / lt / lte con valor literal", () => {
    expect(evaluateCondition({ campo: "data.capital", operador: "gt", valor: 50 }, ctx)).toBe(true);
    expect(evaluateCondition({ campo: "data.capital", operador: "gte", valor: 100 }, ctx)).toBe(true);
    expect(evaluateCondition({ campo: "data.capital", operador: "lt", valor: 50 }, ctx)).toBe(false);
    expect(evaluateCondition({ campo: "data.capital", operador: "lte", valor: 100 }, ctx)).toBe(true);
  });

  it("comparaciones numéricas con un operando null/ausente son false, no un error", () => {
    expect(evaluateCondition({ campo: "data.franquicia", operador: "gt", valor: 0 }, ctx)).toBe(false);
  });
});

describe("evaluateCondition — comparación entre dos campos (campoValor)", () => {
  it("compara dos rutas del contexto, no un literal", () => {
    const ctx = { data: { franquicia: 500, valorAjustado: 300 } };
    expect(evaluateCondition({ campo: "data.franquicia", operador: "gte", campoValor: "data.valorAjustado" }, ctx)).toBe(true);

    const ctx2 = { data: { franquicia: 100, valorAjustado: 300 } };
    expect(evaluateCondition({ campo: "data.franquicia", operador: "gte", campoValor: "data.valorAjustado" }, ctx2)).toBe(false);
  });
});

describe("evaluateCondition — combinadores todas/alguna/no", () => {
  const ctx = { data: { esAtmosferico: true, umbralSuperado: true } };

  it("todas — AND", () => {
    expect(evaluateCondition({ todas: [
      { campo: "data.esAtmosferico", operador: "equals", valor: true },
      { campo: "data.umbralSuperado", operador: "equals", valor: true },
    ] }, ctx)).toBe(true);
    expect(evaluateCondition({ todas: [
      { campo: "data.esAtmosferico", operador: "equals", valor: true },
      { campo: "data.umbralSuperado", operador: "equals", valor: false },
    ] }, ctx)).toBe(false);
  });

  it("alguna — OR", () => {
    expect(evaluateCondition({ alguna: [
      { campo: "data.esAtmosferico", operador: "equals", valor: false },
      { campo: "data.umbralSuperado", operador: "equals", valor: true },
    ] }, ctx)).toBe(true);
  });

  it("no — NOT", () => {
    expect(evaluateCondition({ no: { campo: "data.esAtmosferico", operador: "equals", valor: false } }, ctx)).toBe(true);
  });

  it("combinadores anidados", () => {
    const cond = { todas: [
      { campo: "data.esAtmosferico", operador: "equals", valor: true },
      { alguna: [
        { campo: "data.umbralSuperado", operador: "equals", valor: true },
        { campo: "data.umbralSuperado", operador: "equals", valor: "forzado-nunca-verdad" },
      ] },
    ] };
    expect(evaluateCondition(cond, ctx)).toBe(true);
  });
});

describe("evaluateCondition — errores", () => {
  it("lanza TypeError si la condición no es un objeto ni null", () => {
    expect(() => evaluateCondition("texto", {})).toThrow(TypeError);
  });
  it("lanza TypeError ante un operador desconocido", () => {
    expect(() => evaluateCondition({ campo: "x", operador: "inventado", valor: 1 }, {})).toThrow(TypeError);
  });
});

describe("validateCondition", () => {
  it("null es válido (siempre se cumple)", () => {
    expect(validateCondition(null)).toEqual({ valid: true, errors: [] });
  });
  it("una condición hoja bien formada es válida", () => {
    expect(validateCondition({ campo: "data.x", operador: "equals", valor: 1 })).toEqual({ valid: true, errors: [] });
  });
  it("exists/notExists no necesitan valor ni campoValor", () => {
    expect(validateCondition({ campo: "data.x", operador: "exists" }).valid).toBe(true);
  });
  it("rechaza un operador desconocido", () => {
    expect(validateCondition({ campo: "data.x", operador: "inventado", valor: 1 }).valid).toBe(false);
  });
  it("rechaza una condición sin valor ni campoValor (salvo exists/notExists)", () => {
    expect(validateCondition({ campo: "data.x", operador: "equals" }).valid).toBe(false);
  });
  it("valida recursivamente dentro de todas/alguna/no", () => {
    expect(validateCondition({ todas: [{ campo: "x", operador: "inventado", valor: 1 }] }).valid).toBe(false);
    expect(validateCondition({ no: { campo: "x", operador: "inventado", valor: 1 } }).valid).toBe(false);
  });
  it("rechaza algo que no sea un objeto (y no sea null)", () => {
    expect(validateCondition("texto").valid).toBe(false);
  });
});

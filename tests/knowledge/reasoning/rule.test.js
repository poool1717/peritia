import { describe, it, expect } from "vitest";
import { createRule, validateRule, assertValidRule, evaluateRule } from "../../../lib/knowledge/reasoning/rule.js";
import { SchemaValidationError } from "../../../lib/knowledge/errors.js";

const BR21 = {
  id: "knowledge://rules/br-21-indemnizacion-no-negativa",
  descripcion: "BR-21: si la franquicia iguala o supera el daño ajustado, la indemnización es cero.",
  condicion: { campo: "data.franquicia", operador: "gte", campoValor: "data.valorAjustado" },
  efecto: { valor: "no_procede", confianza: "alta" },
};

describe("validateRule", () => {
  it("acepta una regla bien formada", () => {
    expect(validateRule(BR21)).toEqual({ valid: true, errors: [] });
  });
  it("rechaza un id que no es un identificador knowledge:// válido", () => {
    expect(validateRule({ ...BR21, id: "no-valido" }).valid).toBe(false);
  });
  it("rechaza descripcion vacía", () => {
    expect(validateRule({ ...BR21, descripcion: "" }).valid).toBe(false);
  });
  it("rechaza una condición mal formada", () => {
    expect(validateRule({ ...BR21, condicion: { campo: "x", operador: "inventado", valor: 1 } }).valid).toBe(false);
  });
  it("acepta condicion: null (la regla siempre coincide)", () => {
    expect(validateRule({ ...BR21, condicion: null }).valid).toBe(true);
  });
  it("rechaza efecto sin valor o con confianza desconocida", () => {
    expect(validateRule({ ...BR21, efecto: { confianza: "alta" } }).valid).toBe(false);
    expect(validateRule({ ...BR21, efecto: { valor: "no_procede", confianza: "muy-alta" } }).valid).toBe(false);
  });
  it("rechaza efecto si no es un objeto", () => {
    expect(validateRule({ ...BR21, efecto: "no-objeto" }).valid).toBe(false);
  });
});

describe("createRule / assertValidRule", () => {
  it("createRule devuelve la regla si es válida", () => {
    expect(createRule(BR21)).toEqual(BR21);
  });
  it("createRule lanza SchemaValidationError si no lo es", () => {
    expect(() => createRule({ ...BR21, id: "no-valido" })).toThrow(SchemaValidationError);
  });
  it("assertValidRule devuelve la misma regla", () => {
    expect(assertValidRule(BR21)).toBe(BR21);
  });
});

describe("evaluateRule", () => {
  it("matches:true si la condición se cumple", () => {
    const ctx = { data: { franquicia: 500, valorAjustado: 300 } };
    expect(evaluateRule(BR21, ctx)).toEqual({ matches: true, rule: BR21 });
  });
  it("matches:false si la condición no se cumple", () => {
    const ctx = { data: { franquicia: 100, valorAjustado: 300 } };
    expect(evaluateRule(BR21, ctx)).toEqual({ matches: false, rule: BR21 });
  });
  it("matches:false, sin lanzar, si el contexto no tiene los campos que la condición necesita", () => {
    expect(evaluateRule(BR21, {})).toEqual({ matches: false, rule: BR21 });
  });
  it("una regla sin condición (condicion: null) siempre coincide", () => {
    const siempre = { ...BR21, condicion: null };
    expect(evaluateRule(siempre, {}).matches).toBe(true);
  });
  it("si la condición no puede evaluarse (mal formada), matches:false en vez de lanzar", () => {
    const rotaEnRuntime = { ...BR21, condicion: { campo: "x", operador: "operador-inventado", valor: 1 } };
    expect(evaluateRule(rotaEnRuntime, {})).toEqual({ matches: false, rule: rotaEnRuntime });
  });
});

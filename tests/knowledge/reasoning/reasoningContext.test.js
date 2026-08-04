import { describe, it, expect } from "vitest";
import {
  createReasoningContext, validateReasoningContext, getContextField, withData, withEvidence,
} from "../../../lib/knowledge/reasoning/reasoningContext.js";
import { createEvidence } from "../../../lib/knowledge/reasoning/evidence.js";
import { SchemaValidationError } from "../../../lib/knowledge/errors.js";

describe("createReasoningContext — valores por defecto", () => {
  it("sin argumentos, data/evidence/ramo/variante quedan por defecto", () => {
    expect(createReasoningContext()).toEqual({ data: {}, evidence: [], ramo: null, variante: null });
  });
  it("respeta lo que se le pasa", () => {
    const ctx = createReasoningContext({ data: { causa: "rotura" }, ramo: "hogar", variante: "estandar" });
    expect(ctx.data).toEqual({ causa: "rotura" });
    expect(ctx.ramo).toBe("hogar");
  });
});

describe("validateReasoningContext", () => {
  it("valida la evidencia embebida", () => {
    const evBuena = createEvidence({ id: "ev-1", tipo: "documento", descripcion: "x", fuente: "perito" });
    expect(validateReasoningContext({ data: {}, evidence: [evBuena], ramo: null, variante: null }).valid).toBe(true);
    expect(validateReasoningContext({ data: {}, evidence: [{ id: "ev-2" }], ramo: null, variante: null }).valid).toBe(false);
  });
  it("rechaza ramo o variante que no sean cadena no vacía ni null", () => {
    expect(validateReasoningContext({ data: {}, evidence: [], ramo: 42, variante: null }).valid).toBe(false);
  });
});

describe("getContextField", () => {
  it("accede por ruta con puntos", () => {
    const ctx = { data: { franquicia: 500 } };
    expect(getContextField(ctx, "data.franquicia")).toBe(500);
  });
  it("undefined si el camino no existe, sin lanzar", () => {
    expect(getContextField({ data: {} }, "data.inexistente.mas")).toBeUndefined();
  });
});

describe("withData / withEvidence — inmutabilidad", () => {
  it("withData no muta el original y fusiona los campos nuevos", () => {
    const original = createReasoningContext({ data: { a: 1 } });
    const actualizado = withData(original, { b: 2 });
    expect(original.data).toEqual({ a: 1 });
    expect(actualizado.data).toEqual({ a: 1, b: 2 });
  });
  it("withEvidence no muta el original y añade la evidencia", () => {
    const ev = createEvidence({ id: "ev-1", tipo: "documento", descripcion: "x", fuente: "perito" });
    const original = createReasoningContext();
    const actualizado = withEvidence(original, ev);
    expect(original.evidence).toEqual([]);
    expect(actualizado.evidence).toEqual([ev]);
  });
});

describe("createReasoningContext ante datos inválidos", () => {
  it("lanza SchemaValidationError", () => {
    expect(() => createReasoningContext({ ramo: 42 })).toThrow(SchemaValidationError);
  });
});

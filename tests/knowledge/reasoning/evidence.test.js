import { describe, it, expect } from "vitest";
import { createEvidence, validateEvidence, assertValidEvidence, EVIDENCIA_TIPOS } from "../../../lib/knowledge/reasoning/evidence.js";
import { SchemaValidationError } from "../../../lib/knowledge/errors.js";

describe("EVIDENCIA_TIPOS", () => {
  it("los 5 tipos documentados", () => {
    expect(EVIDENCIA_TIPOS).toEqual(["documento", "fotografia", "dato_extraido", "verificacion_externa", "declaracion_perito"]);
  });
});

describe("validateEvidence", () => {
  it("acepta una evidencia bien formada", () => {
    const r = validateEvidence({ id: "ev-1", tipo: "documento", descripcion: "Póliza aportada", fuente: "perito", confianza: "alta" });
    expect(r).toEqual({ valid: true, errors: [] });
  });
  it("rechaza un tipo desconocido", () => {
    expect(validateEvidence({ id: "ev-1", tipo: "inventado", descripcion: "x", fuente: "x", confianza: "alta" }).valid).toBe(false);
  });
  it("rechaza una confianza desconocida (no reutiliza CONFIANZA de KP-01 por error)", () => {
    expect(validateEvidence({ id: "ev-1", tipo: "documento", descripcion: "x", fuente: "x", confianza: "muy-alta" }).valid).toBe(false);
  });
  it("rechaza id, descripcion o fuente vacíos", () => {
    expect(validateEvidence({ id: "", tipo: "documento", descripcion: "x", fuente: "x", confianza: "alta" }).valid).toBe(false);
    expect(validateEvidence({ id: "ev-1", tipo: "documento", descripcion: "", fuente: "x", confianza: "alta" }).valid).toBe(false);
    expect(validateEvidence({ id: "ev-1", tipo: "documento", descripcion: "x", fuente: "", confianza: "alta" }).valid).toBe(false);
  });
  it("rechaza algo que no sea un objeto", () => {
    expect(validateEvidence(null).valid).toBe(false);
  });
});

describe("createEvidence", () => {
  it("confianza por defecto es sin_verificar", () => {
    const e = createEvidence({ id: "ev-1", tipo: "declaracion_perito", descripcion: "x", fuente: "perito" });
    expect(e.confianza).toBe("sin_verificar");
  });
  it("lanza SchemaValidationError si no es válida", () => {
    expect(() => createEvidence({ id: "ev-1", tipo: "inventado", descripcion: "x", fuente: "x" })).toThrow(SchemaValidationError);
  });
  it("lanza SchemaValidationError si data no es un objeto", () => {
    expect(() => createEvidence(null)).toThrow(SchemaValidationError);
  });
});

describe("assertValidEvidence", () => {
  it("devuelve la misma evidencia si es válida", () => {
    const e = { id: "ev-1", tipo: "documento", descripcion: "x", fuente: "x", confianza: "alta" };
    expect(assertValidEvidence(e)).toBe(e);
  });
  it("lanza SchemaValidationError si no lo es (incluido null)", () => {
    expect(() => assertValidEvidence(null)).toThrow(SchemaValidationError);
  });
});

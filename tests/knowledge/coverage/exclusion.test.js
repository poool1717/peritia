import { describe, it, expect } from "vitest";
import { validateExclusion, assertValidExclusion, createExclusion } from "../../../lib/knowledge/coverage/exclusion.js";
import { SchemaValidationError } from "../../../lib/knowledge/errors.js";

describe("validateExclusion", () => {
  it("acepta una exclusión con tipo y descripción válidos", () => {
    expect(validateExclusion({ tipo: "total", descripcion: "Falta de mantenimiento." })).toEqual({ valid: true, errors: [] });
  });
  it("rechaza un tipo desconocido", () => {
    expect(validateExclusion({ tipo: "inventado", descripcion: "x" }).valid).toBe(false);
  });
  it("rechaza una descripción vacía o ausente", () => {
    expect(validateExclusion({ tipo: "total", descripcion: "" }).valid).toBe(false);
    expect(validateExclusion({ tipo: "total" }).valid).toBe(false);
  });
  it("rechaza algo que no sea un objeto", () => {
    expect(validateExclusion(null).valid).toBe(false);
    expect(validateExclusion("texto").valid).toBe(false);
  });
});

describe("createExclusion", () => {
  it("devuelve la exclusión si es válida", () => {
    expect(createExclusion({ tipo: "parcial", descripcion: "Cubre con condición." }))
      .toEqual({ tipo: "parcial", descripcion: "Cubre con condición." });
  });
  it("lanza SchemaValidationError si no es válida", () => {
    expect(() => createExclusion({ tipo: "inventado", descripcion: "x" })).toThrow(SchemaValidationError);
  });
});

describe("assertValidExclusion", () => {
  it("devuelve la misma exclusión si es válida", () => {
    const e = { tipo: "total", descripcion: "x" };
    expect(assertValidExclusion(e)).toBe(e);
  });
});

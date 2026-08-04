import { describe, it, expect } from "vitest";
import { validateLimit, assertValidLimit, createLimit } from "../../../lib/knowledge/coverage/limit.js";
import { SchemaValidationError } from "../../../lib/knowledge/errors.js";

describe("validateLimit", () => {
  it("acepta un límite con tipo y descripción válidos", () => {
    expect(validateLimit({ tipo: "capital", descripcion: "Límite de capital sobre el continente." })).toEqual({ valid: true, errors: [] });
  });
  it("rechaza algo que no sea un objeto", () => {
    expect(validateLimit(null).valid).toBe(false);
    expect(validateLimit("texto").valid).toBe(false);
  });
  it("rechaza un tipo desconocido", () => {
    expect(validateLimit({ tipo: "inventado", descripcion: "x" }).valid).toBe(false);
  });
  it("rechaza una descripción vacía o ausente", () => {
    expect(validateLimit({ tipo: "temporal", descripcion: "" }).valid).toBe(false);
    expect(validateLimit({ tipo: "temporal" }).valid).toBe(false);
  });
  it("acepta los tres tipos documentados", () => {
    for (const tipo of ["capital", "temporal", "geografico"]) {
      expect(validateLimit({ tipo, descripcion: "x" }).valid).toBe(true);
    }
  });
});

describe("createLimit / assertValidLimit", () => {
  it("createLimit devuelve el límite si es válido", () => {
    expect(createLimit({ tipo: "geografico", descripcion: "Ámbito peninsular." }))
      .toEqual({ tipo: "geografico", descripcion: "Ámbito peninsular." });
  });
  it("createLimit lanza SchemaValidationError si no es válido", () => {
    expect(() => createLimit({ tipo: "inventado", descripcion: "x" })).toThrow(SchemaValidationError);
  });
});

import { describe, it, expect } from "vitest";
import {
  isNonEmptyString, isPlainObject, isArray, isArrayOf, isInteger,
  isPositiveInteger, isBoolean, isOneOf, isIsoDate, isIsoDateOrNull,
} from "../../lib/knowledge/validators.js";

describe("isNonEmptyString", () => {
  it("true para texto real, false para vacío, espacios o no-cadena", () => {
    expect(isNonEmptyString("hola")).toBe(true);
    expect(isNonEmptyString("")).toBe(false);
    expect(isNonEmptyString("   ")).toBe(false);
    expect(isNonEmptyString(null)).toBe(false);
    expect(isNonEmptyString(42)).toBe(false);
  });
});

describe("isPlainObject", () => {
  it("true solo para objetos planos, no arrays ni null", () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ a: 1 })).toBe(true);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject("x")).toBe(false);
  });
});

describe("isArray / isArrayOf", () => {
  it("isArray no distingue contenido", () => {
    expect(isArray([])).toBe(true);
    expect(isArray({})).toBe(false);
  });
  it("isArrayOf valida cada elemento con el predicado dado", () => {
    expect(isArrayOf(["a", "b"], isNonEmptyString)).toBe(true);
    expect(isArrayOf(["a", ""], isNonEmptyString)).toBe(false);
    expect(isArrayOf("no-array", isNonEmptyString)).toBe(false);
  });
});

describe("isInteger / isPositiveInteger", () => {
  it("distingue enteros de decimales y negativos", () => {
    expect(isInteger(3)).toBe(true);
    expect(isInteger(3.5)).toBe(false);
    expect(isPositiveInteger(3)).toBe(true);
    expect(isPositiveInteger(0)).toBe(false);
    expect(isPositiveInteger(-1)).toBe(false);
  });
});

describe("isBoolean", () => {
  it("solo true/false, ni 'true' ni 1", () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean("true")).toBe(false);
    expect(isBoolean(1)).toBe(false);
  });
});

describe("isOneOf", () => {
  it("pertenece o no a la lista dada", () => {
    expect(isOneOf("b", ["a", "b", "c"])).toBe(true);
    expect(isOneOf("z", ["a", "b", "c"])).toBe(false);
  });
});

describe("isIsoDate / isIsoDateOrNull", () => {
  it("exige el formato AAAA-MM-DD exacto", () => {
    expect(isIsoDate("2026-08-01")).toBe(true);
    expect(isIsoDate("01/08/2026")).toBe(false);
    expect(isIsoDate("2026-8-1")).toBe(false);
  });
  it("isIsoDateOrNull acepta también null, pero no undefined", () => {
    expect(isIsoDateOrNull(null)).toBe(true);
    expect(isIsoDateOrNull("2026-08-01")).toBe(true);
    expect(isIsoDateOrNull(undefined)).toBe(false);
  });
});

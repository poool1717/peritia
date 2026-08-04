import { describe, it, expect } from "vitest";
import { createCoverage, validateCoverage, assertValidCoverage, RELACION_CATEGORIAS } from "../../../lib/knowledge/coverage/coverage.js";
import { SchemaValidationError } from "../../../lib/knowledge/errors.js";
import { DANOS_POR_AGUA_COVERAGE } from "./fixtures.js";

describe("validateCoverage — la ficha real, estructurada", () => {
  it("la fixture de Daños por Agua es válida", () => {
    expect(validateCoverage(DANOS_POR_AGUA_COVERAGE)).toEqual({ valid: true, errors: [] });
  });
});

describe("createCoverage — normalización por defecto", () => {
  const minima = {
    id: "knowledge://coverages/incendio",
    tipo: "coverage",
    version: 1,
    estado: "borrador",
    vigenciaDesde: "2026-08-01",
    vigenciaHasta: null,
    ambito: { ramo: ["hogar"], aseguradora: null, provincia: null },
    confianza: "sin_verificar",
    autor: "claude",
    codigo: "INCEN",
    bloques: { continente: true, contenido: false },
  };

  it("rellena las 12 categorías de relaciones aunque no se den", () => {
    const c = createCoverage(minima);
    for (const categoria of RELACION_CATEGORIAS) {
      expect(c.relaciones[categoria]).toEqual([]);
    }
  });

  it("rellena alcance, exclusiones, limites y requiereVerificacionExterna con sus valores por defecto", () => {
    const c = createCoverage(minima);
    expect(c.alcance).toEqual({ continente: null, contenido: null });
    expect(c.exclusiones).toEqual([]);
    expect(c.limites).toEqual([]);
    expect(c.requiereVerificacionExterna).toBe(false);
  });

  it("respeta las relaciones ya dadas en vez de sobrescribirlas", () => {
    const c = createCoverage({ ...minima, relaciones: { objetos: ["knowledge://insured_objects/tuberia"] } });
    expect(c.relaciones.objetos).toEqual(["knowledge://insured_objects/tuberia"]);
    expect(c.relaciones.materiales).toEqual([]); // el resto, por defecto
  });

  it("fuerza tipo a 'coverage' aunque no se especifique o se dé otro", () => {
    expect(createCoverage(minima).tipo).toBe("coverage");
  });

  it("lanza SchemaValidationError si, tras normalizar, sigue sin ser válida", () => {
    expect(() => createCoverage({ ...minima, codigo: "" })).toThrow(SchemaValidationError);
  });
});

describe("validateCoverage — reglas propias de COVERAGE_TEMPLATE.md", () => {
  const base = createCoverage({
    id: "knowledge://coverages/robo",
    version: 1, estado: "borrador", vigenciaDesde: "2026-08-01", vigenciaHasta: null,
    ambito: { ramo: ["hogar"], aseguradora: null, provincia: null },
    confianza: "sin_verificar", autor: "claude", codigo: "ROBO",
    bloques: { continente: false, contenido: true },
  });

  it("rechaza bloques con continente y contenido ambos false", () => {
    const r = validateCoverage({ ...base, bloques: { continente: false, contenido: false } });
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.includes("bloques"))).toBe(true);
  });

  it("acepta bloques con solo uno de los dos en true", () => {
    expect(validateCoverage({ ...base, bloques: { continente: true, contenido: false } }).valid).toBe(true);
    expect(validateCoverage({ ...base, bloques: { continente: false, contenido: true } }).valid).toBe(true);
  });

  it("rechaza ambito.aseguradora si no es null — un Coverage canónico nunca es de una aseguradora", () => {
    const r = validateCoverage({ ...base, ambito: { ...base.ambito, aseguradora: "AXA" } });
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.includes("aseguradora"))).toBe(true);
  });

  it("rechaza requiereVerificacionExterna:true sin relaciones.procedimientos", () => {
    const r = validateCoverage({ ...base, requiereVerificacionExterna: true });
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.includes("procedimientos"))).toBe(true);
  });

  it("acepta requiereVerificacionExterna:true con relaciones.procedimientos no vacío", () => {
    const r = validateCoverage({
      ...base,
      requiereVerificacionExterna: true,
      relaciones: { ...base.relaciones, procedimientos: ["knowledge://procedures/verificacion-robo"] },
    });
    expect(r.valid).toBe(true);
  });

  it("rechaza una exclusión o un límite mal formados dentro del array", () => {
    expect(validateCoverage({ ...base, exclusiones: [{ tipo: "inventado", descripcion: "x" }] }).valid).toBe(false);
    expect(validateCoverage({ ...base, limites: [{ tipo: "inventado", descripcion: "x" }] }).valid).toBe(false);
  });

  it("rechaza bloques o alcance si no son objetos", () => {
    expect(validateCoverage({ ...base, bloques: "no es un objeto" }).valid).toBe(false);
    expect(validateCoverage({ ...base, alcance: "no es un objeto" }).valid).toBe(false);
  });

  it("rechaza alcance.continente/contenido si no son cadena no vacía ni null", () => {
    expect(validateCoverage({ ...base, alcance: { continente: 42 } }).valid).toBe(false);
    expect(validateCoverage({ ...base, alcance: { contenido: "" } }).valid).toBe(false);
    expect(validateCoverage({ ...base, alcance: { continente: null, contenido: "texto" } }).valid).toBe(true);
  });

  it("rechaza codigo vacío o ausente", () => {
    expect(validateCoverage({ ...base, codigo: "" }).valid).toBe(false);
    const { codigo, ...sinCodigo } = base;
    expect(validateCoverage(sinCodigo).valid).toBe(false);
  });

  it("hereda las reglas del sobre de metadatos genérico de KP-01 (p. ej. estado desconocido)", () => {
    expect(validateCoverage({ ...base, estado: "publicado" }).valid).toBe(false);
  });
});

describe("assertValidCoverage", () => {
  it("devuelve la misma coverage si es válida", () => {
    expect(assertValidCoverage(DANOS_POR_AGUA_COVERAGE)).toBe(DANOS_POR_AGUA_COVERAGE);
  });
  it("lanza SchemaValidationError con todos los problemas si no lo es", () => {
    try {
      assertValidCoverage({ ...DANOS_POR_AGUA_COVERAGE, bloques: { continente: false, contenido: false }, codigo: "" });
      throw new Error("no debería llegar aquí");
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      expect(e.details.issues.length).toBeGreaterThanOrEqual(2);
    }
  });
});

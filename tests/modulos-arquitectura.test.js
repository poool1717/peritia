import { describe, it, expect } from "vitest";
import { getModuloArq, getFactorArq, calcVPreexCont, TABLAS_ARQ, PROVINCIAS } from "../lib/dominio/calculo.js";

describe("TABLAS_ARQ — integridad del catálogo de módulos", () => {
  it("cubre exactamente los 6 códigos de provincia verificados en el Sprint 0", () => {
    expect(Object.keys(TABLAS_ARQ).sort()).toEqual(["00", "07", "08", "17", "25", "43"]);
  });
  it("cada entrada de provincia tiene [Básica, Media, Alta] — 3 valores", () => {
    for (const codigo of Object.keys(TABLAS_ARQ)) {
      for (const [tipologia, valores] of Object.entries(TABLAS_ARQ[codigo])) {
        expect(valores, `${codigo}.${tipologia}`).toHaveLength(3);
      }
    }
  });
  it("dentro de una misma tipología, Alta ≥ Media ≥ Básica (monotonía esperable)", () => {
    const [basica, media, alta] = TABLAS_ARQ["08"].unif_aislada;
    expect(alta).toBeGreaterThan(media);
    expect(media).toBeGreaterThan(basica);
  });
});

describe("getModuloArq", () => {
  it("Media es el índice 1 de la tabla de la provincia", () => {
    expect(getModuloArq("08", "unif_aislada", "Media")).toBe(TABLAS_ARQ["08"].unif_aislada[1]);
  });
  it("Básica es el índice 0, Alta es el índice 2", () => {
    const [basica, , alta] = TABLAS_ARQ["08"].unif_aislada;
    expect(getModuloArq("08", "unif_aislada", "Básica")).toBe(basica);
    expect(getModuloArq("08", "unif_aislada", "Alta")).toBe(alta);
  });
  it("una calidad no reconocida (ni Alta ni Básica) se trata como Media", () => {
    expect(getModuloArq("08", "unif_aislada", "cualquier-otra-cosa")).toBe(TABLAS_ARQ["08"].unif_aislada[1]);
  });
  it("una provincia sin tabla propia cae a la tabla genérica '00'", () => {
    // PROVINCIAS incluye 13 entradas, pero TABLAS_ARQ solo cubre 6 códigos
    // (ver docs/OPEN_QUESTIONS.md, P-05). Madrid ('28') es una de las que
    // no tiene tabla propia.
    expect(TABLAS_ARQ["28"]).toBeUndefined();
    expect(getModuloArq("28", "unif_aislada", "Media")).toBe(TABLAS_ARQ["00"].unif_aislada[1]);
  });
  it("una tipología inexistente en una provincia con tabla devuelve 0, no undefined ni NaN", () => {
    expect(getModuloArq("08", "tipologia-que-no-existe", "Media")).toBe(0);
  });
});

describe("getFactorArq", () => {
  it("vivienda unifamiliar o plurifamiliar: 1,486", () => {
    expect(getFactorArq("unif_aislada")).toBe(1.486);
    expect(getFactorArq("pluri_bloque_menos16")).toBe(1.486);
  });
  it("urbanización: 1,366", () => {
    expect(getFactorArq("urb_urbanizacion")).toBe(1.366);
  });
  it("cualquier otra tipología (oficinas, comercio, industria...): 1,618", () => {
    expect(getFactorArq("ofic_oficinas")).toBe(1.618);
    expect(getFactorArq("com_comercio")).toBe(1.618);
  });
  it("sin clave (null/undefined/vacío), el valor por defecto es 1,486", () => {
    expect(getFactorArq(null)).toBe(1.486);
    expect(getFactorArq(undefined)).toBe(1.486);
    expect(getFactorArq("")).toBe(1.486);
  });
});

describe("calcVPreexCont — valor preexistente del continente", () => {
  it("es superficie × módulo × factor", () => {
    const m2 = 100, prov = "08", key = "unif_aislada", calidad = "Media";
    const esperado = m2 * getModuloArq(prov, key, calidad) * getFactorArq(key);
    expect(calcVPreexCont(m2, prov, key, calidad)).toBeCloseTo(esperado, 6);
  });
  it("superficie 0 (o sin datos) da valor preexistente 0", () => {
    expect(calcVPreexCont(0, "08", "unif_aislada", "Media")).toBe(0);
    expect(calcVPreexCont(undefined, "08", "unif_aislada", "Media")).toBe(0);
  });
  it("es proporcional a la superficie", () => {
    const v100 = calcVPreexCont(100, "08", "unif_aislada", "Media");
    const v200 = calcVPreexCont(200, "08", "unif_aislada", "Media");
    expect(v200).toBeCloseTo(v100 * 2, 6);
  });
});

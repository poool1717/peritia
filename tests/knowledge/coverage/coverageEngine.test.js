import { describe, it, expect } from "vitest";
import { createCoverageEngine } from "../../../lib/knowledge/coverage/coverageEngine.js";
import { SchemaValidationError } from "../../../lib/knowledge/errors.js";
import { DANOS_POR_AGUA_COVERAGE, AXA_DAGUA_OVERRIDE, OTRA_ASEGURADORA_OVERRIDE } from "./fixtures.js";

describe("createCoverageEngine — construcción", () => {
  it("se construye sin overrides", () => {
    expect(() => createCoverageEngine(DANOS_POR_AGUA_COVERAGE)).not.toThrow();
  });
  it("rechaza un Coverage inválido", () => {
    expect(() => createCoverageEngine({ ...DANOS_POR_AGUA_COVERAGE, codigo: "" })).toThrow(SchemaValidationError);
  });
  it("rechaza un InsurerOverride que referencia otra garantía distinta", () => {
    const ajeno = { ...AXA_DAGUA_OVERRIDE, coverageId: "knowledge://coverages/incendio" };
    expect(() => createCoverageEngine(DANOS_POR_AGUA_COVERAGE, { insurerOverrides: [ajeno] })).toThrow(SchemaValidationError);
  });
});

describe("getCoveredScope — qué cubre", () => {
  it("sin aseguradora, devuelve el alcance canónico", () => {
    const engine = createCoverageEngine(DANOS_POR_AGUA_COVERAGE);
    expect(engine.getCoveredScope()).toEqual(DANOS_POR_AGUA_COVERAGE.alcance);
  });
  it("con una aseguradora sin override de alcance, sigue devolviendo el canónico", () => {
    const engine = createCoverageEngine(DANOS_POR_AGUA_COVERAGE, { insurerOverrides: [AXA_DAGUA_OVERRIDE] });
    expect(engine.getCoveredScope({ aseguradora: "AXA" })).toEqual(DANOS_POR_AGUA_COVERAGE.alcance);
  });
  it("con un override que sí define alcance, ese override gana", () => {
    const conAlcance = { ...AXA_DAGUA_OVERRIDE, alcance: { continente: "Solo plantas sobre rasante." } };
    const engine = createCoverageEngine(DANOS_POR_AGUA_COVERAGE, { insurerOverrides: [conAlcance] });
    expect(engine.getCoveredScope({ aseguradora: "AXA" }).continente).toBe("Solo plantas sobre rasante.");
    expect(engine.getCoveredScope({ aseguradora: "AXA" }).contenido).toBe(DANOS_POR_AGUA_COVERAGE.alcance.contenido);
  });
});

describe("getExclusions — qué no cubre", () => {
  it("sin aseguradora, devuelve las exclusiones canónicas tal cual", () => {
    const engine = createCoverageEngine(DANOS_POR_AGUA_COVERAGE);
    expect(engine.getExclusions()).toEqual(DANOS_POR_AGUA_COVERAGE.exclusiones);
  });

  it("con aseguradora: quita las exclusionesNoAplicables y añade exclusionesAdicionales", () => {
    const engine = createCoverageEngine(DANOS_POR_AGUA_COVERAGE, { insurerOverrides: [AXA_DAGUA_OVERRIDE] });
    const resultado = engine.getExclusions({ aseguradora: "AXA" });

    // La exclusión que AXA declara que no le aplica, no debe aparecer.
    expect(resultado.some(e => e.descripcion === "Daños producidos durante obras de reforma en curso.")).toBe(false);
    // Las demás exclusiones canónicas se mantienen.
    expect(resultado.some(e => e.descripcion === "Daños derivados de falta de mantenimiento de las instalaciones.")).toBe(true);
    // La exclusión adicional de AXA aparece.
    expect(resultado.some(e => e.descripcion.includes("sótanos"))).toBe(true);
    // Total: 4 canónicas - 1 no aplicable + 1 adicional = 4.
    expect(resultado).toHaveLength(4);
  });

  it("una aseguradora sin override específico de exclusiones no cambia nada", () => {
    const engine = createCoverageEngine(DANOS_POR_AGUA_COVERAGE, { insurerOverrides: [OTRA_ASEGURADORA_OVERRIDE] });
    expect(engine.getExclusions({ aseguradora: "Mapfre" })).toEqual(DANOS_POR_AGUA_COVERAGE.exclusiones);
  });
});

describe("getLimits", () => {
  it("sin aseguradora, devuelve los límites canónicos", () => {
    const engine = createCoverageEngine(DANOS_POR_AGUA_COVERAGE);
    expect(engine.getLimits()).toEqual(DANOS_POR_AGUA_COVERAGE.limites);
  });
  it("con aseguradora, añade los límites específicos a los canónicos", () => {
    const conLimite = { ...AXA_DAGUA_OVERRIDE, limitesEspecificos: [{ tipo: "geografico", descripcion: "Solo territorio peninsular." }] };
    const engine = createCoverageEngine(DANOS_POR_AGUA_COVERAGE, { insurerOverrides: [conLimite] });
    const resultado = engine.getLimits({ aseguradora: "AXA" });
    expect(resultado).toHaveLength(DANOS_POR_AGUA_COVERAGE.limites.length + 1);
    expect(resultado.some(l => l.descripcion === "Solo territorio peninsular.")).toBe(true);
  });
});

describe("relaciones directas — objetos, daños, materiales, métodos, partidas", () => {
  const engine = createCoverageEngine(DANOS_POR_AGUA_COVERAGE);

  it("getProtectedObjects", () => {
    expect(engine.getProtectedObjects()).toEqual(DANOS_POR_AGUA_COVERAGE.relaciones.objetos);
  });
  it("getTriggeredDamages", () => {
    expect(engine.getTriggeredDamages()).toEqual(DANOS_POR_AGUA_COVERAGE.relaciones.danos);
  });
  it("getAffectedMaterials", () => {
    expect(engine.getAffectedMaterials()).toEqual(DANOS_POR_AGUA_COVERAGE.relaciones.materiales);
    expect(engine.getAffectedMaterials()).toContain("knowledge://materials/pladur");
  });
  it("getRepairMethods", () => {
    expect(engine.getRepairMethods()).toEqual(DANOS_POR_AGUA_COVERAGE.relaciones.metodos);
  });
  it("getApplicableBaremoItems", () => {
    expect(engine.getApplicableBaremoItems()).toEqual(DANOS_POR_AGUA_COVERAGE.relaciones.partidas);
  });
});

describe("getRequiredEvidence — qué evidencias requiere", () => {
  it("devuelve documentación y fotografías por separado", () => {
    const engine = createCoverageEngine(DANOS_POR_AGUA_COVERAGE);
    expect(engine.getRequiredEvidence()).toEqual({
      documentacion: DANOS_POR_AGUA_COVERAGE.relaciones.documentacion,
      fotografias: DANOS_POR_AGUA_COVERAGE.relaciones.fotografias,
    });
  });
});

describe("getInsurerRules — qué reglas específicas existen por aseguradora", () => {
  it("devuelve el override si existe", () => {
    const engine = createCoverageEngine(DANOS_POR_AGUA_COVERAGE, { insurerOverrides: [AXA_DAGUA_OVERRIDE] });
    expect(engine.getInsurerRules("AXA")).toEqual(AXA_DAGUA_OVERRIDE);
  });
  it("devuelve null si no hay reglas específicas para esa aseguradora", () => {
    const engine = createCoverageEngine(DANOS_POR_AGUA_COVERAGE, { insurerOverrides: [AXA_DAGUA_OVERRIDE] });
    expect(engine.getInsurerRules("Generali")).toBeNull();
  });
  it("devuelve null si no se pide ninguna aseguradora", () => {
    const engine = createCoverageEngine(DANOS_POR_AGUA_COVERAGE, { insurerOverrides: [AXA_DAGUA_OVERRIDE] });
    expect(engine.getInsurerRules()).toBeNull();
  });
  it("con varias aseguradoras registradas, cada una resuelve a la suya", () => {
    const engine = createCoverageEngine(DANOS_POR_AGUA_COVERAGE, { insurerOverrides: [AXA_DAGUA_OVERRIDE, OTRA_ASEGURADORA_OVERRIDE] });
    expect(engine.getInsurerRules("AXA").aseguradora).toBe("AXA");
    expect(engine.getInsurerRules("Mapfre").aseguradora).toBe("Mapfre");
  });
});

describe("los arrays devueltos son copias — no exponen el estado interno del engine", () => {
  it("mutar el array devuelto no afecta a llamadas posteriores", () => {
    const engine = createCoverageEngine(DANOS_POR_AGUA_COVERAGE);
    const materiales = engine.getAffectedMaterials();
    materiales.push("knowledge://materials/inventado");
    expect(engine.getAffectedMaterials()).toEqual(DANOS_POR_AGUA_COVERAGE.relaciones.materiales);
  });
});

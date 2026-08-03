import { describe, it, expect } from "vitest";
import { validateEnvelope, assertValidEnvelope, REQUIRED_FIELDS } from "../../lib/knowledge/schema.js";
import { SchemaValidationError } from "../../lib/knowledge/errors.js";
import { DANOS_POR_AGUA, INCENDIO, MINIMA_VALIDA } from "./fixtures.js";

describe("validateEnvelope — fichas reales", () => {
  it("las dos fichas reales de knowledge/coverages/ son válidas tal cual están hoy", () => {
    expect(validateEnvelope(DANOS_POR_AGUA)).toEqual({ valid: true, errors: [] });
    expect(validateEnvelope(INCENDIO)).toEqual({ valid: true, errors: [] });
  });

  it("una KU mínima, sin los campos opcionales, también es válida", () => {
    expect(validateEnvelope(MINIMA_VALIDA)).toEqual({ valid: true, errors: [] });
  });

  it("idioma y revisadoPor son opcionales, pero se validan si están presentes", () => {
    expect(validateEnvelope({ ...MINIMA_VALIDA, idioma: "es" }).valid).toBe(true);
    expect(validateEnvelope({ ...MINIMA_VALIDA, idioma: "" }).valid).toBe(false);
    expect(validateEnvelope({ ...MINIMA_VALIDA, revisadoPor: null }).valid).toBe(true);
    expect(validateEnvelope({ ...MINIMA_VALIDA, revisadoPor: "pol" }).valid).toBe(true);
    expect(validateEnvelope({ ...MINIMA_VALIDA, revisadoPor: "" }).valid).toBe(false);
  });
});

describe("validateEnvelope — campos obligatorios", () => {
  it("detecta cada campo obligatorio que falte", () => {
    for (const campo of REQUIRED_FIELDS) {
      const { [campo]: _omitido, ...incompleta } = DANOS_POR_AGUA;
      const r = validateEnvelope(incompleta);
      expect(r.valid, `sin ${campo} debería ser inválida`).toBe(false);
      expect(r.errors.some(e => e.includes(campo))).toBe(true);
    }
  });

  it("rechaza algo que no sea un objeto", () => {
    expect(validateEnvelope(null).valid).toBe(false);
    expect(validateEnvelope("texto").valid).toBe(false);
    expect(validateEnvelope(undefined).valid).toBe(false);
  });
});

describe("validateEnvelope — coherencia id ↔ tipo", () => {
  it("rechaza un id cuyo tipo de carpeta no coincide con el campo tipo", () => {
    const r = validateEnvelope({ ...DANOS_POR_AGUA, tipo: "material" });
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.includes("no coincide"))).toBe(true);
  });

  it("rechaza un id sintácticamente inválido", () => {
    const r = validateEnvelope({ ...DANOS_POR_AGUA, id: "no es un identificador" });
    expect(r.valid).toBe(false);
  });
});

describe("validateEnvelope — enumeraciones", () => {
  it("rechaza un tipo desconocido", () => {
    expect(validateEnvelope({ ...MINIMA_VALIDA, tipo: "tipo-inventado" }).valid).toBe(false);
  });
  it("rechaza un estado desconocido", () => {
    expect(validateEnvelope({ ...MINIMA_VALIDA, estado: "publicado" }).valid).toBe(false);
  });
  it("rechaza una confianza desconocida", () => {
    expect(validateEnvelope({ ...MINIMA_VALIDA, confianza: "muy-alta" }).valid).toBe(false);
  });
  it("acepta los 4 estados y los 4 niveles de confianza documentados", () => {
    for (const estado of ["borrador", "en_revision", "aprobado", "deprecado"]) {
      expect(validateEnvelope({ ...MINIMA_VALIDA, estado }).valid).toBe(true);
    }
    for (const confianza of ["alta", "media", "baja", "sin_verificar"]) {
      expect(validateEnvelope({ ...MINIMA_VALIDA, confianza }).valid).toBe(true);
    }
  });
});

describe("validateEnvelope — version y fechas", () => {
  it("rechaza version 0, negativa o decimal", () => {
    expect(validateEnvelope({ ...MINIMA_VALIDA, version: 0 }).valid).toBe(false);
    expect(validateEnvelope({ ...MINIMA_VALIDA, version: -1 }).valid).toBe(false);
    expect(validateEnvelope({ ...MINIMA_VALIDA, version: 1.5 }).valid).toBe(false);
  });
  it("rechaza una fecha con formato distinto de AAAA-MM-DD", () => {
    expect(validateEnvelope({ ...MINIMA_VALIDA, vigenciaDesde: "01/08/2026" }).valid).toBe(false);
  });
  it("acepta vigenciaHasta null pero rechaza vigenciaHasta ausente", () => {
    expect(validateEnvelope({ ...MINIMA_VALIDA, vigenciaHasta: null }).valid).toBe(true);
    const { vigenciaHasta: _omitido, ...sinCampo } = MINIMA_VALIDA;
    expect(validateEnvelope(sinCampo).valid).toBe(false);
  });
  it("rechaza vigenciaHasta anterior a vigenciaDesde", () => {
    const r = validateEnvelope({ ...MINIMA_VALIDA, vigenciaDesde: "2026-06-01", vigenciaHasta: "2026-01-01" });
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.includes("vigenciaHasta"))).toBe(true);
  });
});

describe("validateEnvelope — ambito", () => {
  it("acepta ambito con los tres campos en null (aplica en general)", () => {
    expect(validateEnvelope({ ...MINIMA_VALIDA, ambito: { ramo: null, aseguradora: null, provincia: null } }).valid).toBe(true);
  });
  it("rechaza que ambito no sea un objeto", () => {
    expect(validateEnvelope({ ...MINIMA_VALIDA, ambito: "hogar" }).valid).toBe(false);
  });
  it("rechaza ambito.ramo si no es un array de cadenas ni null", () => {
    expect(validateEnvelope({ ...MINIMA_VALIDA, ambito: { ramo: "hogar" } }).valid).toBe(false);
    expect(validateEnvelope({ ...MINIMA_VALIDA, ambito: { ramo: [1, 2] } }).valid).toBe(false);
  });
  it("rechaza ambito.aseguradora si no es cadena no vacía ni null", () => {
    expect(validateEnvelope({ ...MINIMA_VALIDA, ambito: { aseguradora: "" } }).valid).toBe(false);
    expect(validateEnvelope({ ...MINIMA_VALIDA, ambito: { aseguradora: "AXA" } }).valid).toBe(true);
  });
  it("rechaza ambito.provincia si no es cadena no vacía ni null", () => {
    expect(validateEnvelope({ ...MINIMA_VALIDA, ambito: { provincia: 8 } }).valid).toBe(false);
    expect(validateEnvelope({ ...MINIMA_VALIDA, ambito: { provincia: "Barcelona" } }).valid).toBe(true);
  });
});

describe("validateEnvelope — fuentes (forma real, no la del documento ilustrativo)", () => {
  it("acepta fuentes con tipo codigo_actual, aunque no esté en el documento de arquitectura", () => {
    expect(validateEnvelope(DANOS_POR_AGUA).valid).toBe(true);
    expect(DANOS_POR_AGUA.fuentes.some(f => f.tipo === "codigo_actual")).toBe(true);
  });
  it("rechaza un tipo de fuente que no exista en ningún sitio", () => {
    const r = validateEnvelope({ ...MINIMA_VALIDA, fuentes: [{ tipo: "inventado", referencia: "x" }] });
    expect(r.valid).toBe(false);
  });
  it("rechaza fuente.referencia si no es cadena no vacía ni null", () => {
    const r = validateEnvelope({ ...MINIMA_VALIDA, fuente: { tipo: "elaboracion_propia", referencia: "" } });
    expect(r.valid).toBe(false);
  });
  it("acepta fuente (singular, forma del documento ilustrativo) con referencia null", () => {
    const r = validateEnvelope({ ...MINIMA_VALIDA, fuente: { tipo: "elaboracion_propia", referencia: null } });
    expect(r.valid).toBe(true);
  });
});

describe("validateEnvelope — fuentes/historial: formas inválidas", () => {
  it("rechaza fuentes si no es un array", () => {
    expect(validateEnvelope({ ...MINIMA_VALIDA, fuentes: "no es un array" }).valid).toBe(false);
  });
  it("rechaza historial si no es un array", () => {
    expect(validateEnvelope({ ...MINIMA_VALIDA, historial: "no es un array" }).valid).toBe(false);
  });
  it("rechaza una entrada de historial sin autor", () => {
    const r = validateEnvelope({ ...MINIMA_VALIDA, historial: [{ version: 1, fecha: "2026-08-01", estado: "borrador", cambio: "x" }] });
    expect(r.valid).toBe(false);
  });
  it("acepta el historial real de una ficha", () => {
    expect(validateEnvelope(DANOS_POR_AGUA).valid).toBe(true);
  });
  it("rechaza una entrada de historial que no sea un objeto, o con version/fecha/estado inválidos", () => {
    expect(validateEnvelope({ ...MINIMA_VALIDA, historial: ["no es un objeto"] }).valid).toBe(false);
    expect(validateEnvelope({ ...MINIMA_VALIDA, historial: [{ version: 0, fecha: "2026-08-01", autor: "x", estado: "borrador" }] }).valid).toBe(false);
    expect(validateEnvelope({ ...MINIMA_VALIDA, historial: [{ version: 1, fecha: "01/08/2026", autor: "x", estado: "borrador" }] }).valid).toBe(false);
    expect(validateEnvelope({ ...MINIMA_VALIDA, historial: [{ version: 1, fecha: "2026-08-01", autor: "x", estado: "publicado" }] }).valid).toBe(false);
  });
});

describe("assertValidEnvelope", () => {
  it("devuelve la misma KU si es válida", () => {
    expect(assertValidEnvelope(DANOS_POR_AGUA)).toBe(DANOS_POR_AGUA);
  });
  it("lanza SchemaValidationError, con todos los problemas, si no es válida", () => {
    try {
      assertValidEnvelope({ ...MINIMA_VALIDA, estado: "publicado" });
      throw new Error("no debería llegar aquí");
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      expect(e.code).toBe("SCHEMA_VALIDATION");
      expect(e.details.issues.length).toBeGreaterThan(0);
    }
  });
});

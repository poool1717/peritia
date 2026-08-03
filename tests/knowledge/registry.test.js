import { describe, it, expect, beforeEach } from "vitest";
import { createRegistry } from "../../lib/knowledge/registry.js";
import { DuplicateIdentifierError, SchemaValidationError } from "../../lib/knowledge/errors.js";
import { DANOS_POR_AGUA, INCENDIO, DAGUA_APROBADA_V1, DAGUA_APROBADA_V2, MINIMA_VALIDA } from "./fixtures.js";

describe("createRegistry — aislamiento entre instancias", () => {
  it("dos registros distintos no comparten estado", () => {
    const r1 = createRegistry();
    const r2 = createRegistry();
    r1.register(DANOS_POR_AGUA);
    expect(r1.size()).toBe(1);
    expect(r2.size()).toBe(0);
  });
});

describe("register", () => {
  let registry;
  beforeEach(() => { registry = createRegistry(); });

  it("registra una KU válida y la deja consultable", () => {
    registry.register(DANOS_POR_AGUA);
    expect(registry.has(DANOS_POR_AGUA.id)).toBe(true);
    expect(registry.size()).toBe(1);
  });

  it("rechaza registrar una KU que no pasa el esquema", () => {
    expect(() => registry.register({ ...MINIMA_VALIDA, estado: "publicado" })).toThrow(SchemaValidationError);
    expect(registry.size()).toBe(0);
  });

  it("rechaza registrar dos veces la misma versión del mismo id", () => {
    registry.register(DAGUA_APROBADA_V1);
    expect(() => registry.register(DAGUA_APROBADA_V1)).toThrow(DuplicateIdentifierError);
  });

  it("acepta dos versiones distintas del mismo id", () => {
    registry.register(DAGUA_APROBADA_V1);
    registry.register(DAGUA_APROBADA_V2);
    expect(registry.size()).toBe(2);
  });
});

describe("get", () => {
  let registry;
  beforeEach(() => {
    registry = createRegistry();
    registry.register(DAGUA_APROBADA_V1);
    registry.register(DAGUA_APROBADA_V2);
  });

  it("sin versión, devuelve la más alta registrada", () => {
    expect(registry.get(DAGUA_APROBADA_V1.id)).toBe(DAGUA_APROBADA_V2);
  });

  it("con versión explícita en las opciones, devuelve esa versión", () => {
    expect(registry.get(DAGUA_APROBADA_V1.id, { version: 1 })).toBe(DAGUA_APROBADA_V1);
  });

  it("con versión en el propio identificador (#vN), devuelve esa versión", () => {
    expect(registry.get("knowledge://coverages/danos-por-agua#v1")).toBe(DAGUA_APROBADA_V1);
  });

  it("undefined si el id no está registrado", () => {
    expect(registry.get("knowledge://coverages/robo")).toBeUndefined();
  });

  it("undefined si la versión pedida no existe", () => {
    expect(registry.get(DAGUA_APROBADA_V1.id, { version: 99 })).toBeUndefined();
  });
});

describe("getAllVersions", () => {
  it("devuelve todas las versiones ordenadas de más antigua a más nueva", () => {
    const registry = createRegistry();
    registry.register(DAGUA_APROBADA_V2);
    registry.register(DAGUA_APROBADA_V1);
    expect(registry.getAllVersions(DAGUA_APROBADA_V1.id)).toEqual([DAGUA_APROBADA_V1, DAGUA_APROBADA_V2]);
  });
  it("array vacío si no hay ninguna", () => {
    expect(createRegistry().getAllVersions("knowledge://coverages/robo")).toEqual([]);
  });
});

describe("list", () => {
  let registry;
  beforeEach(() => {
    registry = createRegistry();
    registry.register(DANOS_POR_AGUA);
    registry.register(INCENDIO);
    registry.register(MINIMA_VALIDA);
  });

  it("sin filtro, devuelve todas", () => {
    expect(registry.list()).toHaveLength(3);
  });
  it("filtra por tipo", () => {
    expect(registry.list({ tipo: "coverage" })).toHaveLength(2);
    expect(registry.list({ tipo: "material" })).toHaveLength(1);
  });
  it("filtra por estado", () => {
    expect(registry.list({ estado: "borrador" })).toHaveLength(3);
    expect(registry.list({ estado: "aprobado" })).toHaveLength(0);
  });
  it("con latestOnly:false incluye todas las versiones históricas", () => {
    registry.register(DAGUA_APROBADA_V2); // otra versión de un id ya distinto (aprobada), no colisiona
    const todas = registry.list({ latestOnly: false });
    expect(todas.length).toBeGreaterThanOrEqual(4);
  });
});

describe("clear", () => {
  it("vacía el registro por completo", () => {
    const registry = createRegistry();
    registry.register(DANOS_POR_AGUA);
    registry.clear();
    expect(registry.size()).toBe(0);
    expect(registry.has(DANOS_POR_AGUA.id)).toBe(false);
  });
});

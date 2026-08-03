import { describe, it, expect, beforeEach } from "vitest";
import { createRegistry } from "../../lib/knowledge/registry.js";
import { createResolver } from "../../lib/knowledge/resolver.js";
import { NotFoundError, AmbiguousReferenceError } from "../../lib/knowledge/errors.js";
import { DANOS_POR_AGUA, DAGUA_APROBADA_V1, DAGUA_APROBADA_V2 } from "./fixtures.js";

describe("resolve — regla del §4: solo 'aprobado' es vigente", () => {
  it("una KU en borrador (como las 4 fichas reales de hoy) no resuelve por defecto", () => {
    const registry = createRegistry();
    registry.register(DANOS_POR_AGUA); // estado: borrador
    const resolver = createResolver(registry);
    expect(() => resolver.resolve(DANOS_POR_AGUA.id)).toThrow(NotFoundError);
  });

  it("con requireApproved:false, una KU en borrador sí resuelve (herramientas internas)", () => {
    const registry = createRegistry();
    registry.register(DANOS_POR_AGUA);
    const resolver = createResolver(registry);
    expect(resolver.resolve(DANOS_POR_AGUA.id, { requireApproved: false })).toBe(DANOS_POR_AGUA);
  });

  it("un id que no existe en absoluto lanza NotFoundError", () => {
    const resolver = createResolver(createRegistry());
    expect(() => resolver.resolve("knowledge://coverages/no-existe")).toThrow(NotFoundError);
  });
});

describe("resolve — vigencia por fecha", () => {
  let registry, resolver;
  beforeEach(() => {
    registry = createRegistry();
    registry.register(DAGUA_APROBADA_V1); // vigente 2026-01-01 a 2026-06-30
    registry.register(DAGUA_APROBADA_V2); // vigente desde 2026-07-01, sin fin
    resolver = createResolver(registry);
  });

  it("sin asOf, resuelve a la vigente en la fecha de hoy (asumiendo que ya es posterior a julio 2026)", () => {
    // La fecha de hoy en este entorno es posterior a 2026-07-01 (contexto de
    // la sesión), así que la vigente por defecto es la v2, sin fecha de fin.
    expect(resolver.resolve(DAGUA_APROBADA_V1.id).version).toBe(2);
  });

  it("con asOf dentro del rango de la v1, resuelve a la v1", () => {
    expect(resolver.resolve(DAGUA_APROBADA_V1.id, { asOf: "2026-03-15" })).toBe(DAGUA_APROBADA_V1);
  });

  it("con asOf dentro del rango de la v2, resuelve a la v2", () => {
    expect(resolver.resolve(DAGUA_APROBADA_V1.id, { asOf: "2026-09-01" })).toBe(DAGUA_APROBADA_V2);
  });

  it("con asOf anterior a toda vigencia, no resuelve ninguna", () => {
    expect(() => resolver.resolve(DAGUA_APROBADA_V1.id, { asOf: "2025-01-01" })).toThrow(NotFoundError);
  });

  it("con asOf exactamente en el límite (vigenciaHasta inclusive), resuelve a esa versión", () => {
    expect(resolver.resolve(DAGUA_APROBADA_V1.id, { asOf: "2026-06-30" })).toBe(DAGUA_APROBADA_V1);
  });
});

describe("resolve — identificador pinneado a una versión (#vN)", () => {
  it("devuelve exactamente esa versión, con independencia de si sigue vigente", () => {
    const registry = createRegistry();
    registry.register(DAGUA_APROBADA_V1);
    registry.register(DAGUA_APROBADA_V2);
    const resolver = createResolver(registry);
    // v1 ya no está vigente hoy (terminó en junio 2026), pero pinneada debe resolver igual.
    expect(resolver.resolve(`${DAGUA_APROBADA_V1.id}#v1`)).toBe(DAGUA_APROBADA_V1);
  });

  it("pinneada, ignora también requireApproved: una versión en borrador con #vN resuelve igual", () => {
    const registry = createRegistry();
    registry.register(DANOS_POR_AGUA); // borrador, version 1
    const resolver = createResolver(registry);
    expect(resolver.resolve(`${DANOS_POR_AGUA.id}#v1`)).toBe(DANOS_POR_AGUA);
  });

  it("pinneada a una versión que no existe, lanza NotFoundError", () => {
    const registry = createRegistry();
    registry.register(DAGUA_APROBADA_V1);
    const resolver = createResolver(registry);
    expect(() => resolver.resolve(`${DAGUA_APROBADA_V1.id}#v9`)).toThrow(NotFoundError);
  });
});

describe("resolveByAmbito", () => {
  it("filtra por ramo cuando la KU restringe su ámbito", () => {
    const registry = createRegistry();
    registry.register(DAGUA_APROBADA_V2); // ambito.ramo: ["hogar"]
    const resolver = createResolver(registry);
    expect(resolver.resolveByAmbito(DAGUA_APROBADA_V2.id, { ramo: "hogar" })).toBe(DAGUA_APROBADA_V2);
    expect(() => resolver.resolveByAmbito(DAGUA_APROBADA_V2.id, { ramo: "automovil" })).toThrow(NotFoundError);
  });

  it("una KU con ambito.ramo null aplica a cualquier ramo consultado", () => {
    const registry = createRegistry();
    registry.register({ ...DAGUA_APROBADA_V2, ambito: { ramo: null, aseguradora: null, provincia: null } });
    const resolver = createResolver(registry);
    expect(resolver.resolveByAmbito(DAGUA_APROBADA_V2.id, { ramo: "cualquier-cosa" }).id).toBe(DAGUA_APROBADA_V2.id);
  });

  it("filtra por aseguradora cuando la KU la restringe", () => {
    const registry = createRegistry();
    registry.register({ ...DAGUA_APROBADA_V2, ambito: { ramo: null, aseguradora: "AXA", provincia: null } });
    const resolver = createResolver(registry);
    expect(resolver.resolveByAmbito(DAGUA_APROBADA_V2.id, { aseguradora: "AXA" }).id).toBe(DAGUA_APROBADA_V2.id);
    expect(() => resolver.resolveByAmbito(DAGUA_APROBADA_V2.id, { aseguradora: "Mapfre" })).toThrow(NotFoundError);
  });

  it("filtra por provincia cuando la KU la restringe", () => {
    const registry = createRegistry();
    registry.register({ ...DAGUA_APROBADA_V2, ambito: { ramo: null, aseguradora: null, provincia: "Barcelona" } });
    const resolver = createResolver(registry);
    expect(resolver.resolveByAmbito(DAGUA_APROBADA_V2.id, { provincia: "Barcelona" }).id).toBe(DAGUA_APROBADA_V2.id);
    expect(() => resolver.resolveByAmbito(DAGUA_APROBADA_V2.id, { provincia: "Girona" })).toThrow(NotFoundError);
  });
});

describe("resolve — ambigüedad", () => {
  it("dos versiones vigentes a la vez para el mismo id (solapadas) son un caso ambiguo", () => {
    const registry = createRegistry();
    registry.register(DAGUA_APROBADA_V1);
    registry.register({ ...DAGUA_APROBADA_V2, version: 3, vigenciaDesde: "2026-02-01" }); // solapa con v1
    const resolver = createResolver(registry);
    expect(() => resolver.resolve(DAGUA_APROBADA_V1.id, { asOf: "2026-03-01" })).toThrow(AmbiguousReferenceError);
  });
});

describe("tryResolve", () => {
  it("devuelve la KU si resuelve, sin lanzar", () => {
    const registry = createRegistry();
    registry.register(DAGUA_APROBADA_V1);
    const resolver = createResolver(registry);
    expect(resolver.tryResolve(DAGUA_APROBADA_V1.id, { asOf: "2026-03-01" })).toBe(DAGUA_APROBADA_V1);
  });
  it("devuelve null en vez de lanzar si no resuelve", () => {
    const resolver = createResolver(createRegistry());
    expect(resolver.tryResolve("knowledge://coverages/no-existe")).toBeNull();
  });
});

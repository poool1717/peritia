import { describe, it, expect } from "vitest";
import { validateRelaciones, listRelationTargets, hasSelfReference } from "../../lib/knowledge/relationship.js";
import { DANOS_POR_AGUA, INCENDIO } from "./fixtures.js";

describe("validateRelaciones", () => {
  it("acepta el objeto de relaciones real de una ficha de coverage", () => {
    expect(validateRelaciones(DANOS_POR_AGUA.relaciones)).toEqual({ valid: true, errors: [] });
  });

  it("acepta un objeto vacío (ninguna categoría declarada)", () => {
    expect(validateRelaciones({})).toEqual({ valid: true, errors: [] });
  });

  it("no exige ningún vocabulario de claves concreto — categorías inventadas también valen si su forma es correcta", () => {
    expect(validateRelaciones({ cualquierCategoria: ["knowledge://materials/pladur"] })).toEqual({ valid: true, errors: [] });
  });

  it("rechaza que relaciones no sea un objeto", () => {
    expect(validateRelaciones(null).valid).toBe(false);
    expect(validateRelaciones([]).valid).toBe(false);
    expect(validateRelaciones("texto").valid).toBe(false);
  });

  it("rechaza una categoría cuyo valor no es un array", () => {
    const r = validateRelaciones({ garantias: "knowledge://coverages/incendio" });
    expect(r.valid).toBe(false);
    expect(r.errors[0]).toContain("garantias");
  });

  it("rechaza un identificador mal formado dentro de una categoría", () => {
    const r = validateRelaciones({ materiales: ["no es un identificador"] });
    expect(r.valid).toBe(false);
    expect(r.errors[0]).toContain("materiales[0]");
  });

  it("acumula errores de varias categorías a la vez, no se detiene en la primera", () => {
    const r = validateRelaciones({ a: "no-array", b: ["malo"] });
    expect(r.errors).toHaveLength(2);
  });
});

describe("listRelationTargets", () => {
  it("aplana y deduplica todos los identificadores de todas las categorías", () => {
    const targets = listRelationTargets(DANOS_POR_AGUA.relaciones);
    expect(targets).toContain("knowledge://coverages/riesgos-extensivos");
    expect(targets).toContain("knowledge://materials/pladur");
    expect(targets).toContain("knowledge://materials/parquet");
    expect(targets).toContain("knowledge://causes/rotura-de-tuberia");
    expect(targets).toHaveLength(4); // el resto de categorías están vacías
  });

  it("con relaciones vacías u objeto no válido, devuelve un array vacío", () => {
    expect(listRelationTargets({})).toEqual([]);
    expect(listRelationTargets(null)).toEqual([]);
  });

  it("dedplica un mismo identificador repetido en dos categorías distintas", () => {
    const targets = listRelationTargets({
      garantias: ["knowledge://coverages/incendio"],
      normativa: ["knowledge://coverages/incendio"],
    });
    expect(targets).toEqual(["knowledge://coverages/incendio"]);
  });
});

describe("hasSelfReference", () => {
  it("false cuando ninguna relación apunta a la propia KU (caso real)", () => {
    expect(hasSelfReference(DANOS_POR_AGUA.id, DANOS_POR_AGUA.relaciones)).toBe(false);
    expect(hasSelfReference(INCENDIO.id, INCENDIO.relaciones)).toBe(false);
  });

  it("true cuando una KU se referencia a sí misma", () => {
    expect(hasSelfReference("knowledge://coverages/incendio", {
      garantias: ["knowledge://coverages/incendio"],
    })).toBe(true);
  });

  it("true también si la auto-referencia usa un sufijo de versión distinto", () => {
    expect(hasSelfReference("knowledge://coverages/incendio#v3", {
      garantias: ["knowledge://coverages/incendio#v1"],
    })).toBe(true);
  });

  it("false, sin lanzar excepción, si el id no es válido", () => {
    expect(hasSelfReference("no-valido", { a: [] })).toBe(false);
  });
});

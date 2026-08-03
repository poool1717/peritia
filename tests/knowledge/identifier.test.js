import { describe, it, expect } from "vitest";
import { parseIdentifier, buildIdentifier, isValidIdentifier, stripVersion } from "../../lib/knowledge/identifier.js";
import { InvalidIdentifierError } from "../../lib/knowledge/errors.js";

describe("parseIdentifier", () => {
  it("identificador simple, sin versión", () => {
    expect(parseIdentifier("knowledge://coverages/danos-por-agua")).toEqual({
      tipoPlural: "coverages", slug: "danos-por-agua", version: null,
    });
  });

  it("identificador con sufijo de versión histórica", () => {
    expect(parseIdentifier("knowledge://coverages/dagua#v2")).toEqual({
      tipoPlural: "coverages", slug: "dagua", version: 2,
    });
  });

  it("slug en mayúsculas (código corto) no es válido — el patrón exige minúsculas", () => {
    // El ejemplo ilustrativo de KNOWLEDGE_ARCHITECTURE.md usa "DAGUA" en
    // mayúsculas; las fichas reales usan slugs en minúsculas
    // ("danos-por-agua") con el código corto en un campo aparte (`codigo`).
    // Este test documenta, con el propio patrón elegido, que el slug de un
    // identificador es siempre minúsculas — coherente con las fichas reales.
    expect(() => parseIdentifier("knowledge://coverages/DAGUA")).toThrow(InvalidIdentifierError);
  });

  it("rechaza una cadena que no empieza por knowledge://", () => {
    expect(() => parseIdentifier("http://coverages/dagua")).toThrow(InvalidIdentifierError);
  });

  it("rechaza un identificador vacío, null o no-cadena", () => {
    expect(() => parseIdentifier("")).toThrow(InvalidIdentifierError);
    expect(() => parseIdentifier(null)).toThrow(InvalidIdentifierError);
    expect(() => parseIdentifier(undefined)).toThrow(InvalidIdentifierError);
  });

  it("rechaza un sufijo de versión sin la 'v' o con valor 0", () => {
    expect(() => parseIdentifier("knowledge://coverages/dagua#2")).toThrow(InvalidIdentifierError);
    expect(() => parseIdentifier("knowledge://coverages/dagua#v0")).toThrow(InvalidIdentifierError);
  });
});

describe("buildIdentifier", () => {
  it("construye un identificador simple", () => {
    expect(buildIdentifier({ tipoPlural: "coverages", slug: "danos-por-agua" }))
      .toBe("knowledge://coverages/danos-por-agua");
  });

  it("construye un identificador con versión", () => {
    expect(buildIdentifier({ tipoPlural: "coverages", slug: "dagua", version: 2 }))
      .toBe("knowledge://coverages/dagua#v2");
  });

  it("es la inversa exacta de parseIdentifier", () => {
    const original = "knowledge://materials/baldosa-ceramica#v3";
    expect(buildIdentifier(parseIdentifier(original))).toBe(original);
  });

  it("rechaza version 0, negativa o no entera", () => {
    expect(() => buildIdentifier({ tipoPlural: "coverages", slug: "dagua", version: 0 })).toThrow(InvalidIdentifierError);
    expect(() => buildIdentifier({ tipoPlural: "coverages", slug: "dagua", version: -1 })).toThrow(InvalidIdentifierError);
    expect(() => buildIdentifier({ tipoPlural: "coverages", slug: "dagua", version: 1.5 })).toThrow(InvalidIdentifierError);
  });

  it("rechaza tipoPlural o slug con mayúsculas o caracteres no válidos", () => {
    expect(() => buildIdentifier({ tipoPlural: "Coverages", slug: "dagua" })).toThrow(InvalidIdentifierError);
    expect(() => buildIdentifier({ tipoPlural: "coverages", slug: "DAGUA" })).toThrow(InvalidIdentifierError);
  });
});

describe("isValidIdentifier", () => {
  it("true para un identificador bien formado, con y sin versión", () => {
    expect(isValidIdentifier("knowledge://coverages/danos-por-agua")).toBe(true);
    expect(isValidIdentifier("knowledge://coverages/danos-por-agua#v2")).toBe(true);
  });
  it("false para cualquier cosa que no lo sea, sin lanzar excepción", () => {
    expect(isValidIdentifier("no es un identificador")).toBe(false);
    expect(isValidIdentifier(null)).toBe(false);
    expect(isValidIdentifier(42)).toBe(false);
  });
});

describe("stripVersion", () => {
  it("quita el sufijo de versión si lo hay", () => {
    expect(stripVersion("knowledge://coverages/danos-por-agua#v2")).toBe("knowledge://coverages/danos-por-agua");
  });
  it("no cambia nada si no hay sufijo", () => {
    expect(stripVersion("knowledge://coverages/danos-por-agua")).toBe("knowledge://coverages/danos-por-agua");
  });
});

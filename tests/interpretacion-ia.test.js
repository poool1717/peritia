import { describe, it, expect } from "vitest";
import { parseJSON, iaError } from "../components/Peritia.jsx";

describe("parseJSON — interpretación de la respuesta de la IA", () => {
  it("JSON limpio, sin markdown", () => {
    expect(parseJSON('{"a":1,"b":"x"}')).toEqual({ a: 1, b: "x" });
  });

  it("JSON envuelto en un bloque ```json ... ```", () => {
    const texto = '```json\n{"a":1}\n```';
    expect(parseJSON(texto)).toEqual({ a: 1 });
  });

  it("JSON envuelto en un bloque ``` genérico (sin la palabra json)", () => {
    const texto = '```\n{"a":1}\n```';
    expect(parseJSON(texto)).toEqual({ a: 1 });
  });

  it("texto que no es JSON interpretable devuelve _parseError, no {} en silencio", () => {
    const res = parseJSON("esto no es json en absoluto");
    expect(res._parseError).toBe(true);
  });

  it("cadena vacía también se marca como _parseError", () => {
    expect(parseJSON("")._parseError).toBe(true);
  });
});

describe("iaError — traducción de fallos a mensaje para el usuario", () => {
  it("respuesta no válida (null o no-objeto) da mensaje genérico", () => {
    expect(iaError(null)).toMatch(/no devolvió una respuesta válida/i);
    expect(iaError("texto plano")).toMatch(/no devolvió una respuesta válida/i);
  });

  it("marca _apiError incluye el código de estado y el mensaje", () => {
    const msg = iaError({ _apiError: true, _status: 429, _msg: "rate limited" });
    expect(msg).toContain("429");
    expect(msg).toContain("rate limited");
  });

  it("marca _parseError da un mensaje de reintento", () => {
    expect(iaError({ _parseError: true })).toMatch(/no se pudo interpretar/i);
  });

  it("un objeto válido sin marcas de error devuelve null (no hay error)", () => {
    expect(iaError({ compania: "AXA Seguros" })).toBeNull();
  });
});

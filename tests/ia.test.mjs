import { test } from "node:test";
import assert from "node:assert/strict";
import { parseJSON, iaError } from "../core/index.mjs";

test("parseJSON entiende un JSON pelado", () => {
  assert.deepEqual(parseJSON('{"asegurado":"Pol"}'), { asegurado: "Pol" });
});

test("parseJSON entiende el JSON dentro de un bloque ```json", () => {
  assert.deepEqual(parseJSON('Aquí tienes:\n```json\n{"a":1}\n```\nUn saludo'), { a: 1 });
});

test("parseJSON entiende el JSON dentro de un bloque ``` sin etiqueta", () => {
  assert.deepEqual(parseJSON('```\n{"a":1}\n```'), { a: 1 });
});

test("parseJSON entiende arrays, no solo objetos", () => {
  assert.deepEqual(parseJSON('```json\n[{"p":1},{"p":2}]\n```'), [{ p: 1 }, { p: 2 }]);
});

// Esto es lo que evita que un fallo de la IA se convierta en un informe vacío
// sin que nadie se entere.
test("parseJSON marca el fallo en vez de devolver un objeto vacío en silencio", () => {
  assert.deepEqual(parseJSON("lo siento, no puedo ayudarte con eso"), { _parseError: true });
  assert.deepEqual(parseJSON(""), { _parseError: true });
});

test("iaError no se queja cuando la respuesta es buena", () => {
  assert.equal(iaError({ asegurado: "Pol" }), null);
  assert.equal(iaError([]), null);
});

test("iaError avisa cuando la respuesta no se pudo interpretar", () => {
  assert.match(iaError({ _parseError: true }), /no se pudo interpretar/);
});

test("iaError incluye el código y el mensaje cuando falla la API", () => {
  const msg = iaError({ _apiError: true, _status: 429, _msg: "rate limit" });
  assert.match(msg, /429/);
  assert.match(msg, /rate limit/);
});

test("iaError aguanta que no llegue nada", () => {
  assert.match(iaError(null), /no devolvió una respuesta válida/);
  assert.match(iaError("texto suelto"), /no devolvió una respuesta válida/);
});

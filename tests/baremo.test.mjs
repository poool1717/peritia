import { test } from "node:test";
import assert from "node:assert/strict";
import { BAREMO, matchBaremo, norm } from "../core/index.mjs";

test("el baremo está completo: toda partida tiene oficio, descripción, unidad y precio", () => {
  assert.ok(BAREMO.length > 0);
  for (const b of BAREMO) {
    assert.ok(b.oficio, `sin oficio: ${b.desc}`);
    assert.ok(b.desc, `sin descripción: ${JSON.stringify(b)}`);
    assert.ok(b.u, `sin unidad: ${b.desc}`);
    assert.equal(typeof b.p, "number", `precio no numérico: ${b.desc}`);
    assert.ok(b.p >= 0, `precio negativo: ${b.desc}`);
  }
});

test("no hay dos partidas con la misma descripción", () => {
  const vistas = new Set();
  for (const b of BAREMO) {
    const k = norm(b.desc);
    assert.ok(!vistas.has(k), `descripción duplicada: ${b.desc}`);
    vistas.add(k);
  }
});

test("hay exactamente una partida de costes indirectos y va a precio 0", () => {
  const ind = BAREMO.filter(b => b.indirecto);
  assert.equal(ind.length, 1);
  assert.equal(ind[0].p, 0); // su importe se calcula, no se lee del baremo
});

test("matchBaremo encuentra la partida exacta ignorando tildes y mayúsculas", () => {
  assert.equal(matchBaremo("Pintura plástica en paredes").p, 10);
  assert.equal(matchBaremo("PINTURA PLASTICA EN PAREDES").p, 10);
  assert.equal(matchBaremo("  pintura   plastica en paredes  ").p, 10);
});

test("matchBaremo acepta que el texto de la IA contenga la partida", () => {
  const b = matchBaremo("Localización de fuga en el baño principal");
  assert.equal(b.oficio, "LAMPISTERÍA");
});

test("matchBaremo cae al parecido por palabras cuando no hay coincidencia literal", () => {
  const b = matchBaremo("Sustitución de la tubería general");
  assert.equal(b.desc, "Sustitución de tubería");
});

test("matchBaremo devuelve null en vez de inventarse una partida", () => {
  assert.equal(matchBaremo(""), null);
  assert.equal(matchBaremo(null), null);
  assert.equal(matchBaremo("xxxx yyyy zzzz"), null);
});

test("toda descripción del baremo se encuentra a sí misma", () => {
  for (const b of BAREMO) {
    const hallado = matchBaremo(b.desc);
    assert.ok(hallado, `no se encuentra a sí misma: ${b.desc}`);
    assert.equal(norm(hallado.desc), norm(b.desc), `${b.desc} → ${hallado.desc}`);
  }
});

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  UMBRAL_INFRASEGURO_SOSPECHOSO, infraseguroSospechoso,
  avisoInfraseguro, avisosDelRiesgo, s1BlockStates, semaforoFromStates,
} from "../core/index.mjs";

test("el umbral es del 90 %", () => {
  assert.equal(UMBRAL_INFRASEGURO_SOSPECHOSO, 90);
});

test("un infraseguro alto pero creíble no se marca como sospechoso", () => {
  assert.equal(infraseguroSospechoso(0), false);
  assert.equal(infraseguroSospechoso(60), false);
  assert.equal(infraseguroSospechoso(89.99), false);
});

test("a partir del 90 % sí se marca, el límite incluido", () => {
  assert.equal(infraseguroSospechoso(90), true);
  assert.equal(infraseguroSospechoso(99.89), true);
});

test("infraseguroSospechoso aguanta valores basura sin romperse", () => {
  assert.equal(infraseguroSospechoso(null), false);
  assert.equal(infraseguroSospechoso(undefined), false);
  assert.equal(infraseguroSospechoso("no es un número"), false);
  assert.equal(infraseguroSospechoso("95"), true);
});

test("no hay aviso cuando el infraseguro es plausible", () => {
  assert.equal(avisoInfraseguro({ infra: 45 }), null);
  assert.equal(avisoInfraseguro({}), null);
  assert.equal(avisoInfraseguro(), null);
});

test("el aviso de continente empieza por la causa más frecuente: el primer riesgo", () => {
  const av = avisoInfraseguro({ bloque: "continente", infra: 99.89, capital: 6000, preexistente: 5316211.83 });
  assert.match(av.titulo, /99,89 %/);
  assert.match(av.titulo, /continente/);
  assert.match(av.motivos[0], /PRIMER RIESGO/);
  assert.equal(av.motivos.length, 3);
});

test("el aviso enseña las cifras concretas para poder contrastarlas", () => {
  const av = avisoInfraseguro({ bloque: "continente", infra: 95, capital: 6000, preexistente: 5316211.83 });
  assert.ok(av.motivos.some(m => m.includes("6000") || m.includes("6.000")), "falta el capital");
  assert.ok(av.motivos.some(m => m.includes("5.316.211") || m.includes("5316211")), "falta el preexistente");
});

test("el aviso de contenido no habla de superficie ni de primer riesgo", () => {
  const av = avisoInfraseguro({ bloque: "contenido", infra: 97, capital: 1000, preexistente: 500000 });
  assert.match(av.titulo, /contenido/);
  assert.equal(av.motivos.length, 2);
  assert.ok(!av.motivos.some(m => /superficie|PRIMER RIESGO/.test(m)));
});

// ─── El caso real ────────────────────────────────────────────────────────────
// Mismos datos que tests/caso-real-01: hotel de 2.899 m² con el continente
// asegurado en 6.000 €. Si nadie marca "primer riesgo", el infraseguro sale
// del 99,89 % y la indemnización se desploma de 463,59 € a 0,52 €.
const ENC = { provincia: "GERONA", capitalContinente: "6.000,00 euros" };
const S1  = { superficieConstruida: 2899, tipoArqKey: "host_hoteles", calidad: "Media", estado: "Reformado" };

test("el caso real dispara el aviso", () => {
  const avisos = avisosDelRiesgo(ENC, S1);
  assert.equal(avisos.length, 1);
  assert.equal(avisos[0].bloque, "continente");
});

test("marcando primer riesgo el aviso desaparece, porque ya no hay infraseguro", () => {
  assert.deepEqual(avisosDelRiesgo({ ...ENC, primerRiesgo: true }, S1), []);
});

// Esto es lo que arregla (b): antes, el bloque de capitales salía en VERDE y
// el informe se exportaba con una indemnización de 0,52 € sin un solo aviso.
test("el bloque de capitales pasa a «revisar» en vez de darse por bueno", () => {
  const estados = s1BlockStates(S1, ENC);
  assert.equal(estados[2], "error");
  assert.equal(semaforoFromStates(estados), "red");
});

test("con el primer riesgo marcado, el bloque vuelve a estar completo y en verde", () => {
  const estados = s1BlockStates(S1, { ...ENC, primerRiesgo: true });
  assert.equal(estados[2], true);
  assert.equal(semaforoFromStates(estados), "green");
});

test("un capital sin rellenar sigue siendo «pendiente», no «revisar»", () => {
  assert.equal(s1BlockStates(S1, {})[2], false);
});

test("un riesgo normal sin infraseguro no se ve afectado por el aviso", () => {
  const enc = { provincia: "Barcelona", capitalContinente: "500.000,00 €" };
  const s1 = { superficieConstruida: 120, tipoArqKey: "pluri_bloque_16_40", calidad: "Media", estado: "Bueno" };
  assert.deepEqual(avisosDelRiesgo(enc, s1), []);
  assert.equal(s1BlockStates(s1, enc)[2], true);
});

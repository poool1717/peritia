import { test } from "node:test";
import assert from "node:assert/strict";
import {
  encargoBlockStates, s1BlockStates, s2BlockStates, s3BlockStates,
  s4BlockStates, anexosBlockStates, semaforoFromStates,
} from "../core/index.mjs";

// ─── Semáforo ────────────────────────────────────────────────────────────────
test("el semáforo se pone verde solo cuando está todo completo", () => {
  assert.equal(semaforoFromStates([true, true, true]), "green");
});

test("el semáforo se pone rojo cuando no hay nada relleno", () => {
  assert.equal(semaforoFromStates([false, false]), "red");
});

test("el semáforo se pone naranja cuando falta algo", () => {
  assert.equal(semaforoFromStates([true, false]), "orange");
});

test("un solo bloque en error tiñe la sección de rojo, aunque el resto esté hecho", () => {
  assert.equal(semaforoFromStates([true, true, "error"]), "red");
});

test("una sección sin bloques queda naranja, no verde por descuido", () => {
  assert.equal(semaforoFromStates([]), "orange");
});

// ─── Encargo ─────────────────────────────────────────────────────────────────
test("el encargo está completo con compañía, referencia, asegurado, lugar y capital", () => {
  const enc = { compania: "AXA Seguros", numReferencia: "2026/001", asegurado: "Pol",
                lugarIntervencion: "C/ Mayor 1", capitalContinente: "100.000,00 €" };
  assert.deepEqual(encargoBlockStates(enc), [true, true, true]);
  assert.equal(semaforoFromStates(encargoBlockStates(enc)), "green");
});

// Regresión ligada al fallo de parseCap: con "100.000,00 €" el capital valía 6,
// que sigue siendo > 0, así que el semáforo daba verde igualmente. El bloque
// pasaba la revisión con un capital equivocado. Vale la pena dejarlo fijado.
test("el capital cuenta como relleno solo si es mayor que cero", () => {
  assert.equal(encargoBlockStates({ capitalContinente: "100.000,00 €" })[2], true);
  assert.equal(encargoBlockStates({ capitalContinente: "0" })[2], false);
  assert.equal(encargoBlockStates({ capitalContinente: "" })[2], false);
  assert.equal(encargoBlockStates({})[2], false);
});

test("el encargo a medias sale en naranja, y vacío del todo en rojo", () => {
  // Compañía y referencia puestas, pero sin asegurado ni capital: falta cosas.
  const aMedias = { compania: "AXA Seguros", numReferencia: "2026/001" };
  assert.deepEqual(encargoBlockStates(aMedias), [true, false, false]);
  assert.equal(semaforoFromStates(encargoBlockStates(aMedias)), "orange");
  // La compañía sola no completa ni el primer bloque: hace falta la referencia.
  assert.equal(semaforoFromStates(encargoBlockStates({ compania: "AXA Seguros" })), "red");
});

// ─── Sección 1 ───────────────────────────────────────────────────────────────
test("la sección 1 necesita estado, superficie con tipo, y capital", () => {
  const enc = { capitalContinente: 100000 };
  assert.deepEqual(s1BlockStates({ estado: "Bueno", superficieConstruida: 90, tipoArqKey: "unif_aislada" }, enc),
    [true, true, true]);
});

test("la superficie sin tipo de edificio no cuenta como completa", () => {
  assert.equal(s1BlockStates({ superficieConstruida: 90 }, {})[1], false);
});

test("el capital corregido a mano en la sección 1 manda sobre el del encargo", () => {
  assert.equal(s1BlockStates({ capContOverride: "50.000,00" }, { capitalContinente: 0 })[2], true);
  // Y también al revés: si el perito lo pone a cero, el bloque deja de estar completo
  assert.equal(s1BlockStates({ capContOverride: "0" }, { capitalContinente: 100000 })[2], false);
});

// ─── Sección 2 ───────────────────────────────────────────────────────────────
test("la sección 2 solo pide el relato de los hechos si el siniestro no es atmosférico", () => {
  assert.deepEqual(s2BlockStates({ textoRaw: "Se produjo…" }, { garantia: "Daños por Agua" }), [true]);
});

test("si el siniestro es atmosférico, la sección 2 exige además la verificación XEMA", () => {
  const enc = { garantia: "Fenómenos Atmosféricos" };
  assert.deepEqual(s2BlockStates({ textoRaw: "Se produjo…" }, enc), [true, false]);
  assert.equal(semaforoFromStates(s2BlockStates({ textoRaw: "Se produjo…" }, enc)), "orange");
  assert.deepEqual(s2BlockStates({ textoRaw: "Se produjo…", meteo: { rachaMax: 90 } }, enc), [true, true]);
});

test("el texto de la sección 2 vale tanto escrito a mano como redactado por la IA", () => {
  assert.equal(s2BlockStates({ textoAI: "Redactado" }, {})[0], true);
  assert.equal(s2BlockStates({}, {})[0], false);
});

// ─── Sección 3 ───────────────────────────────────────────────────────────────
test("por baremo, la sección 3 exige que haya partidas", () => {
  assert.deepEqual(s3BlockStates({ textoRaw: "Daños…", partidas: [{ p: 100 }] }), [true, true]);
  assert.deepEqual(s3BlockStates({ textoRaw: "Daños…", partidas: [] }), [true, false]);
  assert.deepEqual(s3BlockStates({ textoRaw: "Daños…" }), [true, false]);
});

test("por presupuesto o factura, lo que se exige es saber a quién se paga", () => {
  assert.equal(s3BlockStates({ textoRaw: "x", modoValoracion: "factura" })[1], false);
  assert.equal(s3BlockStates({ textoRaw: "x", modoValoracion: "factura", perceptorTipo: "reparador" })[1], true);
  assert.equal(s3BlockStates({ textoRaw: "x", modoValoracion: "presupuesto", perceptorTipo: "asegurado" })[1], true);
});

test("una sección 3 vacía sale en rojo", () => {
  assert.equal(semaforoFromStates(s3BlockStates({})), "red");
});

// ─── Sección 4 ───────────────────────────────────────────────────────────────
test("la sección 4 necesita la introducción y la descripción de cobertura", () => {
  assert.deepEqual(s4BlockStates({ textoIntro: "a", descripcionCobertura: "b" }), [true, true]);
  assert.deepEqual(s4BlockStates({ textoIntro: "a" }), [true, false]);
});

// ─── Anexos ──────────────────────────────────────────────────────────────────
test("los anexos cuentan fotos, catastro, meteosim y facturas", () => {
  const anexos = { fotos: [1], catastro: [1], meteosim: [1], facturas: [1] };
  assert.deepEqual(anexosBlockStates(anexos, {}), [true, true, true, true]);
});

test("las facturas valen tanto desde anexos como desde la sección 3", () => {
  assert.equal(anexosBlockStates({}, { facturas: [1] })[3], true);
  assert.equal(anexosBlockStates({ facturas: [1] }, {})[3], true);
  assert.equal(anexosBlockStates({}, {})[3], false);
});

test("un expediente sin anexos no revienta el semáforo", () => {
  assert.deepEqual(anexosBlockStates(null, null), [false, false, false, false]);
  assert.equal(semaforoFromStates(anexosBlockStates(null, null)), "red");
});

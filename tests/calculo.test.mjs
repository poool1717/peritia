import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PCT_INDIRECTO, calcPartida, resolvePartidas, getPartidas,
  sumRepos, sumIVA, sumReal, calcReglas, calcRegla, reglaPartida,
  sumAjustado, calcIndemnizacion, fraseIndemn,
} from "../core/index.mjs";

const cerca = (a, b, tol = 1e-6) =>
  assert.ok(Math.abs(a - b) < tol, `esperaba ${b}, obtuve ${a}`);

// ─── calcPartida ─────────────────────────────────────────────────────────────
test("calcPartida: V.Real = V.Repos × (1 − Depr%) + IVA €", () => {
  const r = calcPartida({ uds: 2, p: 100, iva: 21, depr: true, pctDepr: 10 });
  cerca(r.vRepos, 200);
  cerca(r.ivaAmt, 42);
  cerca(r.vReal, 222); // 200 × 0,90 + 42
});

test("calcPartida: sin unidades cuenta 1, y sin IVA no suma IVA", () => {
  const r = calcPartida({ p: 50 });
  cerca(r.vRepos, 50);
  cerca(r.ivaAmt, 0);
  cerca(r.vReal, 50);
});

test("calcPartida: la depreciación solo se aplica si depr está activado", () => {
  cerca(calcPartida({ p: 100, pctDepr: 30 }).vReal, 100);
  cerca(calcPartida({ p: 100, depr: true, pctDepr: 30 }).vReal, 70);
});

test("calcPartida: una partida vacía vale 0 y no NaN", () => {
  const r = calcPartida({});
  cerca(r.vRepos, 0);
  cerca(r.vReal, 0);
});

// ─── Costes indirectos ───────────────────────────────────────────────────────
test("resolvePartidas: los costes indirectos son el 8 % del resto", () => {
  assert.equal(PCT_INDIRECTO, 8);
  const filas = resolvePartidas([
    { uds: 1, p: 100 }, { uds: 2, p: 50 }, { indirecto: true, p: 0 },
  ]);
  const ind = filas.find(p => p.indirecto);
  cerca(ind.p, 16); // 8 % de 200
  cerca(ind.uds, 1);
});

test("resolvePartidas: los indirectos no se cobran indirectos a sí mismos", () => {
  const filas = resolvePartidas([
    { uds: 1, p: 100 }, { indirecto: true, p: 999 }, { indirecto: true, p: 999 },
  ]);
  for (const p of filas.filter(x => x.indirecto)) cerca(p.p, 8);
});

test("getPartidas: las partidas sin cobertura no cuentan ni para los indirectos", () => {
  const s3 = { partidas: [
    { uds: 1, p: 100 },
    { uds: 1, p: 1000, cobertura: false },
    { indirecto: true, p: 0 },
  ]};
  const filas = getPartidas(s3);
  assert.equal(filas.length, 2);
  cerca(filas.find(p => p.indirecto).p, 8); // 8 % de 100, no de 1100
});

test("getPartidas: aguanta un expediente sin sección 3", () => {
  assert.deepEqual(getPartidas(undefined), []);
  assert.deepEqual(getPartidas({}), []);
});

// ─── Sumatorios ──────────────────────────────────────────────────────────────
test("sumRepos, sumIVA y sumReal suman lo que dicen que suman", () => {
  const filas = [
    { uds: 2, p: 100, iva: 21, depr: true, pctDepr: 10 },
    { uds: 1, p: 50 },
  ];
  cerca(sumRepos(filas), 250);
  cerca(sumIVA(filas), 42);
  cerca(sumReal(filas), 272); // 222 + 50
});

// ─── Reglas proporcionales ───────────────────────────────────────────────────
// Barcelona ("08"), unifamiliar aislada, calidad Media = 1.217,06 €/m²,
// factor 1,486 → 100 m² × 1.217,06 × 1,486 = 180.855,116 € de valor preexistente.
const ENC = { provincia: "Barcelona", capitalContinente: "100.000,00 €", capitalContenido: 20000 };
const S1  = { superficieConstruida: 100, tipoArqKey: "unif_aislada", calidad: "Media" };

test("calcReglas: con infraseguro la regla es capital / valor preexistente", () => {
  const r = calcReglas(ENC, S1);
  cerca(r.vPreexCont, 180855.116, 1e-3);
  cerca(r.capCont, 100000);
  cerca(r.continente, 100000 / 180855.116, 1e-9);
  cerca(r.infraCont, (180855.116 - 100000) / 180855.116 * 100, 1e-6);
});

test("calcReglas: sin infraseguro la regla es 1 y no penaliza", () => {
  const r = calcReglas({ ...ENC, capitalContinente: 500000 }, S1);
  cerca(r.continente, 1);
  cerca(r.infraCont, 0);
});

test("calcReglas: a primer riesgo nunca se aplica regla proporcional", () => {
  const r = calcReglas({ ...ENC, primerRiesgo: true }, S1);
  cerca(r.continente, 1);
  cerca(r.vPreexCont, 100000); // el valor preexistente pasa a ser el capital
});

test("calcReglas: el capital manual de la sección 1 manda sobre el del encargo", () => {
  const r = calcReglas(ENC, { ...S1, capContOverride: "50.000,00" });
  cerca(r.capCont, 50000);
  cerca(r.continente, 50000 / 180855.116, 1e-9);
});

test("calcReglas: sin valor preexistente de contenido no hay infraseguro de contenido", () => {
  cerca(calcReglas(ENC, S1).contenido, 1);
});

test("calcReglas: con valor preexistente de contenido sí se aplica", () => {
  const r = calcReglas(ENC, { ...S1, vPreexContenido: 50000 });
  cerca(r.contenido, 0.4); // 20.000 / 50.000
  cerca(r.infraContenido, 60);
});

test("calcReglas: un expediente vacío no revienta y devuelve reglas neutras", () => {
  const r = calcReglas(null, null);
  cerca(r.continente, 1);
  cerca(r.contenido, 1);
});

test("calcRegla sigue devolviendo la regla del continente", () => {
  cerca(calcRegla(ENC, S1), calcReglas(ENC, S1).continente);
});

// ─── Regla por partida ───────────────────────────────────────────────────────
test("reglaPartida: solo se aplica si la regla está activada para ese bloque", () => {
  const reglas = { continente: 0.5, contenido: 0.4 };
  cerca(reglaPartida({}, reglas, {}), 1);
  cerca(reglaPartida({}, reglas, { reglaContinente: true }), 0.5);
  cerca(reglaPartida({ garantia: "contenido" }, reglas, { reglaContinente: true }), 1);
  cerca(reglaPartida({ garantia: "contenido" }, reglas, { reglaContenido: true }), 0.4);
});

// ─── Indemnización ───────────────────────────────────────────────────────────
test("sumAjustado aplica la regla proporcional partida a partida", () => {
  const s3 = { partidas: [{ uds: 1, p: 1000 }], reglaContinente: true };
  const regla = calcReglas(ENC, S1).continente;
  cerca(sumAjustado(ENC, S1, s3), 1000 * regla);
});

test("sumAjustado arrastra también los costes indirectos", () => {
  const s3 = { partidas: [{ uds: 1, p: 1000 }, { indirecto: true, p: 0 }] };
  cerca(sumAjustado(ENC, S1, s3), 1080); // 1.000 + 8 %, sin regla activada
});

test("sumAjustado aplica la regla a cada bloque por separado", () => {
  const s3 = {
    partidas: [{ uds: 1, p: 1000 }, { uds: 1, p: 1000, garantia: "contenido" }],
    reglaContinente: true,
  };
  const r = calcReglas(ENC, S1);
  cerca(sumAjustado(ENC, S1, s3), 1000 * r.continente + 1000); // el contenido no lleva regla
});

test("calcIndemnizacion resta la franquicia", () => {
  const s3 = { partidas: [{ uds: 1, p: 1000 }], franquiciaVal: "150,00 €" };
  cerca(calcIndemnizacion(ENC, S1, s3), 1000 - 150);
});

test("calcIndemnizacion nunca es negativa aunque la franquicia se coma el daño", () => {
  const s3 = { partidas: [{ uds: 1, p: 100 }], franquiciaVal: 5000 };
  cerca(calcIndemnizacion(ENC, S1, s3), 0);
});

test("calcIndemnizacion cae a la franquicia del encargo si la sección 3 no la trae", () => {
  const enc = { ...ENC, franquicia: 200 };
  cerca(calcIndemnizacion(enc, S1, { partidas: [{ uds: 1, p: 1000 }] }), 1000 - 200);
});

// ─── Frase de indemnización ──────────────────────────────────────────────────
test("fraseIndemn no dice nada cuando se valora por baremo", () => {
  assert.equal(fraseIndemn({ modoValoracion: "baremo" }, 1000), "");
  assert.equal(fraseIndemn({}, 1000), "");
});

test("fraseIndemn: por factura indemniza con IVA incluido al asegurado", () => {
  const f = fraseIndemn({ modoValoracion: "factura" }, 1000);
  assert.match(f, /Asegurado/);
  assert.match(f, /IVA incl\./);
});

test("fraseIndemn: por presupuesto avisa de que falta la factura", () => {
  const f = fraseIndemn({ modoValoracion: "presupuesto" }, 1000);
  assert.match(f, /A la espera de aportación de la factura/);
  assert.doesNotMatch(f, /IVA incl\./);
});

test("fraseIndemn: al reparador se paga directamente, sin esperar factura", () => {
  const f = fraseIndemn({ modoValoracion: "presupuesto", perceptorTipo: "reparador" }, 1000);
  assert.match(f, /Reparador/);
  assert.doesNotMatch(f, /A la espera/);
});

test("fraseIndemn: al perjudicado se le nombra como tal", () => {
  assert.match(fraseIndemn({ modoValoracion: "factura", perceptorTipo: "perjudicado" }, 1000), /Perjudicado/);
});

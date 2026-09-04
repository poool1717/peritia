import { test } from "node:test";
import assert from "node:assert/strict";
import { PROVINCIAS, TABLAS_ARQ, ARQ_N2, ARQ_N3, getModuloArq, getFactorArq, calcVPreexCont } from "../core/index.mjs";

const cerca = (a, b, tol = 1e-6) =>
  assert.ok(Math.abs(a - b) < tol, `esperaba ${b}, obtuve ${a}`);

test("cada provincia con tabla propia tiene las tres calidades en todos los tipos", () => {
  for (const [prov, tabla] of Object.entries(TABLAS_ARQ)) {
    for (const [tipo, vals] of Object.entries(tabla)) {
      assert.equal(vals.length, 3, `${prov}/${tipo}`);
      for (const v of vals) assert.ok(typeof v === "number" && v > 0, `${prov}/${tipo}`);
      assert.ok(vals[0] <= vals[1] && vals[1] <= vals[2], `calidades desordenadas en ${prov}/${tipo}`);
    }
  }
});

test("todas las tablas cubren los mismos tipos de edificio", () => {
  const ref = Object.keys(TABLAS_ARQ["00"]).sort().join("|");
  for (const prov of Object.keys(TABLAS_ARQ))
    assert.equal(Object.keys(TABLAS_ARQ[prov]).sort().join("|"), ref, `faltan tipos en ${prov}`);
});

test("todo tipo que enseña la interfaz existe en las tablas de precios", () => {
  for (const grupos of Object.values(ARQ_N2))
    for (const g of grupos)
      assert.ok(ARQ_N3[g], `grupo sin tipos: ${g}`);
  for (const tipos of Object.values(ARQ_N3))
    for (const t of tipos)
      assert.ok(TABLAS_ARQ["00"][t.k], `tipo de la interfaz sin precio: ${t.k}`);
});

test("getModuloArq devuelve el módulo de la calidad pedida", () => {
  cerca(getModuloArq("08", "unif_aislada", "Básica"), 818.46);
  cerca(getModuloArq("08", "unif_aislada", "Media"), 1217.06);
  cerca(getModuloArq("08", "unif_aislada", "Alta"), 1825.17);
});

test("getModuloArq usa la calidad Media cuando no se le dice cuál", () => {
  cerca(getModuloArq("08", "unif_aislada"), 1217.06);
});

test("una provincia sin tabla propia usa la tabla genérica, no un 0", () => {
  cerca(getModuloArq("28", "unif_aislada", "Media"), getModuloArq("00", "unif_aislada", "Media"));
  assert.ok(getModuloArq("28", "unif_aislada", "Media") > 0);
});

test("un tipo de edificio desconocido vale 0 en vez de romper el cálculo", () => {
  assert.equal(getModuloArq("08", "no_existe", "Media"), 0);
  assert.equal(getModuloArq("08", undefined, "Media"), 0);
});

test("el factor depende de la familia del edificio", () => {
  assert.equal(getFactorArq("unif_aislada"), 1.486);
  assert.equal(getFactorArq("pluri_bloque_menos16"), 1.486);
  assert.equal(getFactorArq("urb_urbanizacion"), 1.366);
  assert.equal(getFactorArq("ofic_oficinas"), 1.618);
  assert.equal(getFactorArq(undefined), 1.486); // por defecto, residencial
});

test("calcVPreexCont = m² × módulo × factor", () => {
  cerca(calcVPreexCont(100, "08", "unif_aislada", "Media"), 100 * 1217.06 * 1.486, 1e-3);
});

test("calcVPreexCont trata la superficie escrita a mano como número", () => {
  cerca(calcVPreexCont("100", "08", "unif_aislada", "Media"), calcVPreexCont(100, "08", "unif_aislada", "Media"));
  assert.equal(calcVPreexCont("", "08", "unif_aislada", "Media"), 0);
  assert.equal(calcVPreexCont(null, "08", "unif_aislada", "Media"), 0);
});

test("las provincias de la interfaz tienen código de dos dígitos y no se repiten", () => {
  const vistos = new Set();
  for (const p of PROVINCIAS) {
    assert.match(p.v, /^\d{2}$/, `código raro: ${p.v}`);
    assert.ok(p.l, `provincia sin nombre: ${p.v}`);
    assert.ok(!vistos.has(p.v), `provincia duplicada: ${p.v}`);
    vistos.add(p.v);
  }
});

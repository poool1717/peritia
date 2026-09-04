import { test } from "node:test";
import assert from "node:assert/strict";
import { fmt, fmtE, fmtSmart, norm, parseCap } from "../core/index.mjs";

// El separador de miles y el espacio antes del € dependen de los datos de
// idioma que traiga el runtime (Node puede venir sin ellos; el navegador
// siempre los tiene). Se comparan quitando puntos de millar y espacios raros
// para que el test compruebe la lógica y no la instalación de Node.
const laxo = s => s.replace(/[  ]/g, " ").replace(/\.(?=\d{3}\b)/g, "");

test("fmt siempre da dos decimales con coma decimal", () => {
  assert.equal(laxo(fmt(1234.5)), "1234,50");
  assert.equal(fmt(0), "0,00");
  assert.equal(fmt(-42), "-42,00");
});

test("fmt trata la basura como cero en vez de romperse", () => {
  assert.equal(fmt(null), "0,00");
  assert.equal(fmt(undefined), "0,00");
  assert.equal(fmt("no es un número"), "0,00");
});

test("fmtE añade el símbolo de euro al final", () => {
  assert.equal(laxo(fmtE(1234.5)), "1234,50 €");
  assert.ok(fmtE(0).endsWith("€"));
});

test("fmtSmart quita los decimales cuando el número es entero", () => {
  assert.equal(fmtSmart(3), "3");
  assert.equal(fmtSmart(21), "21");
  assert.equal(fmtSmart(3.5), "3,50");
  assert.equal(fmtSmart(null), "0");
});

test("norm quita tildes, mayúsculas y espacios sobrantes", () => {
  assert.equal(norm("Daños por agua"), "danos por agua");
  assert.equal(norm("  DANOS   POR  AGUA "), "danos por agua");
  assert.equal(norm("Daños por agua"), norm("DANOS  POR AGUA"));
  assert.equal(norm(null), "");
});

test("parseCap entiende el formato español 6.000,00", () => {
  assert.equal(parseCap("6.000,00"), 6000);
  assert.equal(parseCap("1.234.567,89"), 1234567.89);
});

// Regresión: hasta la sesión 23 el símbolo de euro rompía el patrón español,
// la cifra caía al caso genérico y "6.000,00 €" devolvía 6. Con eso el capital
// asegurado quedaba en 6 € y la regla proporcional inventaba un infraseguro
// del 99,9 % sobre un expediente real.
test("parseCap no se rompe con el símbolo de euro ni con espacios duros", () => {
  assert.equal(parseCap("6.000,00 €"), 6000);
  assert.equal(parseCap("6.000,00 €"), 6000);
  assert.equal(parseCap(" 12.500,50 € "), 12500.5);
});

test("parseCap entiende también el formato anglosajón y los números sueltos", () => {
  assert.equal(parseCap("6000.00"), 6000);
  assert.equal(parseCap("6000"), 6000);
  assert.equal(parseCap(6000), 6000);
});

test("parseCap devuelve 0 y no NaN cuando no hay valor", () => {
  assert.equal(parseCap(null), 0);
  assert.equal(parseCap(""), 0);
  assert.equal(parseCap("sin especificar"), 0);
  assert.equal(parseCap(0), 0);
});

// PENDIENTE DE DECISIÓN DE PRODUCTO (no es un fallo del código):
// "6.000" sin decimales es ambiguo — seis mil en español, seis coma cero en
// formato anglosajón. Hoy devuelve 6. Decidir con Pol antes de tocarlo, porque
// cambia el importe de expedientes ya guardados.
test("parseCap con miles españoles sin decimales", { todo: "decisión de producto pendiente" }, () => {
  assert.equal(parseCap("6.000 €"), 6000);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseCap, findProvincia, calcReglas, calcIndemnizacion,
  esSiniestroAtmosferico, meteoSupera, calcPartida,
  avisosDelRiesgo, s1BlockStates,
} from "../core/index.mjs";

// ─────────────────────────────────────────────────────────────────────────────
// CASO REAL 01 — expediente cerrado por el perito, aportado por Pol.
//
// Anonimizado a propósito: aquí solo hay cifras y estructura. Ni nombres, ni
// NIF, ni dirección, ni número de expediente. Los documentos originales NO
// están en el repositorio y no deben subirse.
//
// Para qué sirve: es la primera vez que el comportamiento de PERIT.IA se
// compara contra un informe pericial real terminado. Si un cambio futuro hace
// que estas cifras dejen de salir, es que ha roto un caso que ya sabemos cómo
// termina.
//
// El caso: hotel en Girona, filtración de agua desde la terraza que daña un
// local colindante. Continente asegurado a PRIMER RIESGO por 6.000 €.
// El perito propuso 463,59 € de indemnización.
// ─────────────────────────────────────────────────────────────────────────────

const ENC = {
  compania: "AXA",
  provincia: "GERONA",              // así, en castellano y en mayúsculas, como llega
  garantia: "DAGUA ; RCEXP",
  causa: "DAÑOS AGUA(H)",
  descripcionSiniestro: "Filtración de agua desde la terraza que daña un local colindante",
  capitalContinente: "6.000,00 euros",   // literal de la póliza, con la palabra entera
  capitalContenido: "550.534,40 euros",
  umbralLluvia: 40,   // l/m² y hora, según condiciones de la póliza
  umbralViento: 90,   // km/h
  primerRiesgo: true, // la póliza dice "Edificio (primer riesgo): 6.000,00 euros"
};

const S1 = { superficieConstruida: 2899, tipoArqKey: "host_hoteles", calidad: "Media", estado: "Reformado" };

const S3 = {
  modoValoracion: "factura",
  perceptorTipo: "asegurado",
  partidas: [{ desc: "Pintura, papel decorativo y 4 cuadros", uds: 1, p: 383.13, iva: 21, depr: false }],
};

const cerca = (a, b, tol = 0.005) =>
  assert.ok(Math.abs(a - b) < tol, `esperaba ${b}, obtuve ${a}`);

// ─── Lo que hay que leer bien de los documentos ──────────────────────────────

test("los capitales de la póliza se leen enteros, con la palabra «euros» detrás", () => {
  cerca(parseCap("6.000,00 euros"), 6000);
  cerca(parseCap("1.388.139,45 euros"), 1388139.45);
  cerca(parseCap("561.545,08 euros"), 561545.08);
  cerca(parseCap("0,00 euros"), 0);
});

test("la provincia del encargo se reconoce aunque venga en castellano y en mayúsculas", () => {
  assert.equal(findProvincia("GERONA").v, "17");
});

// ─── Lo que calculó el perito ────────────────────────────────────────────────

test("la partida de la factura cuadra con el informe: 383,13 € + 21 % IVA = 463,59 €", () => {
  const r = calcPartida(S3.partidas[0]);
  cerca(r.vRepos, 383.13);
  cerca(r.ivaAmt, 80.46);
  cerca(r.vReal, 463.59);
});

test("a primer riesgo no hay infraseguro, como dice el informe", () => {
  const r = calcReglas(ENC, S1);
  cerca(r.capCont, 6000);
  cerca(r.vPreexCont, 6000);   // el informe: VALOR PREEXISTENTE 6.000,00 €
  cerca(r.continente, 1);
  cerca(r.infraCont, 0);       // el informe: INFRASEGURO 0,00 %
});

test("la indemnización propuesta coincide con la del perito: 463,59 €", () => {
  cerca(calcIndemnizacion(ENC, S1, S3), 463.59);
});

// ─── El agujero que destapó este caso ────────────────────────────────────────
// Si NO se marca "primer riesgo", la app calcula el valor preexistente por m²
// (2.899 m² de hotel) y lo compara con un capital de 6.000 €. Sale un
// infraseguro del 99,89 % y una indemnización de 0,52 € en vez de 463,59 €.
// El cálculo es correcto; lo que falla es el dato de entrada. La póliza dice
// "Edificio (primer riesgo)" justo al lado de la cifra, pero hoy la app se
// queda solo con el número y tira la etiqueta.
//
// Este test fija el tamaño del agujero, y el siguiente comprueba que desde la
// sesión 25 ya NO pasa en silencio.
test("SIN marcar primer riesgo, la misma factura da 0,52 € en vez de 463,59 €", () => {
  const sinMarcar = { ...ENC, primerRiesgo: false };
  const r = calcReglas(sinMarcar, S1);
  assert.ok(r.infraCont > 99, `infraseguro esperado >99 %, obtuve ${r.infraCont}`);
  cerca(calcIndemnizacion(sinMarcar, S1, { ...S3, reglaContinente: true }), 0.52, 0.01);
});

test("...pero ahora la app avisa en vez de dar el bloque por bueno", () => {
  const sinMarcar = { ...ENC, primerRiesgo: false };
  const avisos = avisosDelRiesgo(sinMarcar, S1);
  assert.equal(avisos.length, 1);
  assert.match(avisos[0].motivos[0], /PRIMER RIESGO/);
  assert.equal(s1BlockStates(S1, sinMarcar)[2], "error");
});

// ─── Verificación meteorológica ──────────────────────────────────────────────

test("30 l/m² medidos no superan los 40 l/m² que exige la póliza", () => {
  const r = meteoSupera({ precipMaxHoraria: 30 }, ENC);
  assert.equal(r.sl, false);
  assert.equal(r.hayUmbral, true);
  assert.equal(r.label, "No");
});

// Segundo agujero: el perito basó todo el estudio de cobertura en el umbral de
// lluvia de Riesgos Extensivos, pero la cobertura afectada que trae el encargo
// es "DAGUA ; RCEXP". Con esa cadena la app no considera el siniestro
// atmosférico y no ofrece la verificación XEMA, aunque haga falta.
test("con la cobertura del encargo, la app NO ofrece la verificación meteo", () => {
  assert.equal(esSiniestroAtmosferico(ENC), false);
  // Si el perito reclasifica a Riesgos Extensivos, sí la ofrece:
  assert.equal(esSiniestroAtmosferico({ ...ENC, garantia: "RGEXT" }), true);
});

import { describe, it, expect } from "vitest";
import {
  parseCap, findProvincia, calcReglas, calcIndemnizacion, calcPartida,
} from "../lib/dominio/calculo.js";
import { avisosDelRiesgo } from "../lib/dominio/alertas.js";

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
//
// Este expediente fue el que reclasificó DT-24 de prioridad Media a Crítica.
// ─────────────────────────────────────────────────────────────────────────────

const ENC = {
  compania: "AXA",
  provincia: "GERONA",                    // así, en castellano y en mayúsculas, como llega
  garantia: "DAGUA ; RCEXP",
  causa: "DAÑOS AGUA(H)",
  capitalContinente: "6.000,00 euros",    // literal de la póliza, con la palabra entera
  capitalContenido: "550.534,40 euros",
  umbralLluvia: 40,                       // l/m² y hora, según condiciones de la póliza
  umbralViento: 90,                       // km/h
  primerRiesgo: true,                     // la póliza: "Edificio (primer riesgo): 6.000,00 euros"
};

const S1 = { superficieConstruida: 2899, tipoArqKey: "host_hoteles", calidad: "Media", estado: "Reformado" };

const S3 = {
  modoValoracion: "factura",
  perceptorTipo: "asegurado",
  partidas: [{ desc: "Pintura, papel decorativo y 4 cuadros", uds: 1, p: 383.13, iva: 21, depr: false }],
};

describe("Caso real 01 — lo que hay que leer bien de los documentos", () => {
  it("los capitales de la póliza se leen enteros, con la palabra «euros» detrás", () => {
    expect(parseCap("6.000,00 euros")).toBe(6000);
    expect(parseCap("1.388.139,45 euros")).toBe(1388139.45);
  });

  it("la provincia del encargo se reconoce en castellano y en mayúsculas", () => {
    expect(findProvincia("GERONA").v).toBe("17");
  });
});

describe("Caso real 01 — lo que calculó el perito", () => {
  it("la partida de la factura cuadra con el informe: 383,13 € + 21 % IVA = 463,59 €", () => {
    const r = calcPartida(S3.partidas[0]);
    expect(r.vRepos).toBeCloseTo(383.13, 2);
    expect(r.ivaAmt).toBeCloseTo(80.46, 2);
    expect(r.vReal).toBeCloseTo(463.59, 2);
  });

  it("a primer riesgo no hay infraseguro, como dice el informe", () => {
    const r = calcReglas(ENC, S1);
    expect(r.capCont).toBeCloseTo(6000, 2);
    expect(r.vPreexCont).toBeCloseTo(6000, 2);   // el informe: VALOR PREEXISTENTE 6.000,00 €
    expect(r.continente).toBeCloseTo(1, 6);
    expect(r.infraCont).toBeCloseTo(0, 6);       // el informe: INFRASEGURO 0,00 %
  });

  it("la indemnización propuesta coincide con la del perito: 463,59 €", () => {
    expect(calcIndemnizacion(ENC, S1, S3)).toBeCloseTo(463.59, 2);
  });
});

describe("Caso real 01 — el agujero que destapó, y cómo se cubre", () => {
  // Si NO se marca "primer riesgo", la app calcula el valor preexistente por m²
  // (2.899 m² de hotel) y lo compara con un capital de 6.000 €. Sale un
  // infraseguro del 99,89 % y una indemnización de 0,52 € en vez de 463,59 €.
  // El cálculo es correcto; lo que falla es el dato de entrada.
  const SIN_MARCAR = { ...ENC, primerRiesgo: false };

  it("sin marcar primer riesgo, la misma factura da 0,52 € en vez de 463,59 €", () => {
    const r = calcReglas(SIN_MARCAR, S1);
    expect(r.infraCont).toBeGreaterThan(99);
    expect(calcIndemnizacion(SIN_MARCAR, S1, { ...S3, reglaContinente: true })).toBeCloseTo(0.52, 2);
  });

  it("...pero la app avisa en rojo en vez de dar el bloque por bueno", () => {
    const avisos = avisosDelRiesgo(SIN_MARCAR, S1);
    expect(avisos).toHaveLength(1);
    expect(avisos[0].bloque).toBe("continente");
    expect(avisos[0].motivos[0]).toMatch(/PRIMER RIESGO/);
  });

  it("marcando primer riesgo el aviso desaparece, porque ya no hay infraseguro", () => {
    expect(avisosDelRiesgo(ENC, S1)).toHaveLength(0);
  });
});

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  calcReglas, calcVPreexCont, findProvincia, parseCap, calcIndemnizacion,
} from "../lib/dominio/calculo.js";

// ─────────────────────────────────────────────────────────────────────────────
// DT-08 / R-06 · Un solo cálculo del infraseguro
//
// La vista previa del informe (SecInforme) y la Sección 1 calculaban
// capitales, valor preexistente e infraseguro cada una por su cuenta, en vez
// de usar calcReglas, que es lo que usan la Sección 3, la exportación a PDF y
// Word, y el cálculo de la indemnización. Tres copias de la misma regla.
//
// Aquí se reproducen las fórmulas ANTIGUAS, copiadas literalmente del código
// anterior al cambio, para dejar demostrado:
//   1. que la de la Sección 1 daba lo mismo que el motor (unificarla no cambia
//      ningún número);
//   2. que la de la vista previa NO daba lo mismo (ese era el fallo);
// y, al final, una guardia que falla si alguien vuelve a escribir una fórmula
// de infraseguro a mano dentro de Peritia.jsx.
// ─────────────────────────────────────────────────────────────────────────────

// Fórmula antigua de la Sección 1 (Peritia.jsx, antes de DT-08).
const sec1Antigua = (enc, data) => {
  const prov = findProvincia(enc.provincia);
  const arqKey = data.tipoArqKey || "unif_aislada";
  const capCont  = data.capContOverride  != null ? parseCap(data.capContOverride)  : parseCap(enc.capitalContinente);
  const capCont2 = data.capCont2Override != null ? parseCap(data.capCont2Override) : parseCap(enc.capitalContenido);
  const primer = !!enc.primerRiesgo;
  const vPreexCalc = calcVPreexCont(data.superficieConstruida, prov?.v || "00", arqKey, data.calidad || "Media");
  const vPreex = primer ? capCont : vPreexCalc;
  const infraCont = !primer && vPreexCalc > 0 && capCont > 0 && capCont < vPreexCalc ? ((vPreexCalc - capCont) / vPreexCalc * 100) : 0;
  const vPCont = data.vPreexContenido != null ? parseCap(data.vPreexContenido) : capCont2;
  const infraC2 = vPCont > 0 && capCont2 > 0 && capCont2 < vPCont ? ((vPCont - capCont2) / vPCont * 100) : 0;
  return { capCont, capCont2, vPreex, infraCont, vPCont, infraC2 };
};

// Fórmula antigua de la vista previa (SecInforme, antes de DT-08).
const previaAntigua = (enc, s1) => {
  const prov = findProvincia(enc.provincia);
  const arqKey = s1?.tipoArqKey || "unif_aislada";
  const vReal = calcVPreexCont(s1?.superficieConstruida, prov?.v || "00", arqKey, s1?.calidad || "Media");
  const capCont = parseFloat(enc.capitalContinente || 0);
  const infraCont = vReal > 0 && capCont > 0 && capCont < vReal ? ((vReal - capCont) / vReal * 100) : 0;
  const capCont2 = parseFloat(enc.capitalContenido || 0);
  return { capCont, vPreex: vReal, infraCont, capCont2 };
};

// Una batería variada: infraseguro, sin infraseguro, primer riesgo,
// corrección manual del perito, contenido con preexistente propio, formatos
// de importe distintos y encargos incompletos.
const CASOS = [];
for (const provincia of ["Barcelona", "GERONA", "Madrid", ""])
  for (const capitalContinente of ["100.000,00 €", "6.000,00 euros", 500000, "", "0"])
    for (const primerRiesgo of [false, true])
      for (const s1extra of [{}, { capContOverride: "50.000,00" }, { vPreexContenido: 80000 }, { capCont2Override: "1.000" }])
        CASOS.push({
          enc: { provincia, capitalContinente, capitalContenido: "20.000,00 €", primerRiesgo },
          s1: { superficieConstruida: 120, tipoArqKey: "pluri_bloque_16_40", calidad: "Media", ...s1extra },
        });

describe("la Sección 1 ya coincidía con el motor: unificarla no cambia ningún número", () => {
  it(`las ${CASOS.length} combinaciones dan exactamente lo mismo`, () => {
    for (const { enc, s1 } of CASOS) {
      const a = sec1Antigua(enc, s1);
      const r = calcReglas(enc, s1);
      const ctx = JSON.stringify({ enc, s1 });
      expect(r.capCont, ctx).toBeCloseTo(a.capCont, 6);
      expect(r.capCont2, ctx).toBeCloseTo(a.capCont2, 6);
      expect(r.vPreexCont, ctx).toBeCloseTo(a.vPreex, 6);
      expect(r.infraCont, ctx).toBeCloseTo(a.infraCont, 6);
      expect(r.vPreexContenido, ctx).toBeCloseTo(a.vPCont, 6);
      expect(r.infraContenido, ctx).toBeCloseTo(a.infraC2, 6);
    }
  });
});

describe("la vista previa NO coincidía con el motor: ese era el fallo", () => {
  // Expediente real 01 (hotel en Girona, ver tests/caso-real-01.test.js).
  const ENC = { provincia: "GERONA", capitalContinente: "6.000,00 euros", capitalContenido: "550.534,40 euros", primerRiesgo: true };
  const S1  = { superficieConstruida: 2899, tipoArqKey: "host_hoteles", calidad: "Media" };
  const S3  = { modoValoracion: "factura", perceptorTipo: "asegurado", partidas: [{ uds: 1, p: 383.13, iva: 21 }] };

  it("la vista previa antigua enseñaba un capital de 6 € y un infraseguro del 100 %", () => {
    const a = previaAntigua(ENC, S1);
    expect(a.capCont).toBe(6);
    expect(a.infraCont).toBeGreaterThan(99.9);
    expect(a.capCont2).toBeCloseTo(550.534, 3);
  });

  it("el motor —y ahora también la vista previa— dice 6.000 €, 0 % y 550.534,40 €", () => {
    const r = calcReglas(ENC, S1);
    expect(r.capCont).toBe(6000);
    expect(r.vPreexCont).toBe(6000);
    expect(r.infraCont).toBe(0);
    expect(r.capCont2).toBeCloseTo(550534.4, 2);
  });

  it("la indemnización nunca cambió: ya salía del motor (463,59 €)", () => {
    expect(calcIndemnizacion(ENC, S1, S3)).toBeCloseTo(463.59, 2);
  });

  it("la vista previa antigua ignoraba la corrección manual del perito", () => {
    const s1 = { ...S1, capContOverride: "250.000,00" };
    expect(previaAntigua({ ...ENC, primerRiesgo: false }, s1).capCont).toBe(6);
    expect(calcReglas({ ...ENC, primerRiesgo: false }, s1).capCont).toBe(250000);
  });
});

// Guardia contra la recaída. Si alguien vuelve a leer un capital con
// parseFloat o a escribir la fórmula del infraseguro a mano en la interfaz,
// este test se pone en rojo y dice dónde. Es un test sobre el texto del
// código, no sobre su comportamiento: poco elegante, pero es la única forma
// de vigilar la interfaz sin montar un entorno de React (fuera del alcance
// de la Fase 0, ver tests/README.md).
describe("guardia: la interfaz no calcula el infraseguro por su cuenta", () => {
  const src = readFileSync(new URL("../components/Peritia.jsx", import.meta.url), "utf8");
  const lineas = src.split("\n");
  const buscar = re => lineas.map((l, i) => re.test(l) ? `línea ${i + 1}: ${l.trim().slice(0, 120)}` : null).filter(Boolean);

  it("ningún capital ni valor preexistente se lee con parseFloat (DT-19)", () => {
    expect(buscar(/parseFloat\((enc|s1|data|cData)[^)]*(capital|vPreex|capCont)/)).toEqual([]);
  });

  it("ninguna fórmula de infraseguro escrita a mano (DT-08)", () => {
    expect(buscar(/\(\((vReal|vPreexCalc|vPCont|vPreex)\s*-\s*capCont2?\)/)).toEqual([]);
  });
});

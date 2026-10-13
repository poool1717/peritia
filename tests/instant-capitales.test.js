import { describe, it, expect } from "vitest";
import { muestraCapitalesAsegurados } from "../lib/dominio/informe.js";
import { buildWordHTML, buildPDFHTML } from "../components/Peritia.jsx";

// I-1. Los 63 informes Instant Payment reales no llevan el estudio de
// capitales asegurados. PERIT.IA lo imprimía igualmente, con "valor
// preexistente 0,00 €" e "infraseguro 0,00 %" porque en Instant no se piden
// superficie ni tipo de construcción.

const expediente = tipoEncargo => ({
  encargo: {
    numReferencia: "9705292172", compania: "AXA Seguros", tipoEncargo, modalidadVisita: "DOCUMENTAL",
    lugarIntervencion: "CALLE MAJOR 1, OLOT", garantia: "Daños por agua",
    capitalContinente: "230000", capitalContenido: "20000", franquicia: "0",
  },
  s1: tipoEncargo === "INSTANT_PAYMENT"
    ? { textoInstant: "Localización del riesgo: el riesgo está situado en CALLE MAJOR 1, OLOT. Este siniestro se ha gestionado documentalmente." }
    : { superficieConstruida: "90", calidad: "Media", tipoArqKey: "pluri_bloque_menos16" },
  s2: { textoRaw: "Rotura de tubería de suministro." },
  s3: { modoValoracion: "factura", partidas: [{ id: 1, oficio: "FONTANERÍA", desc: "Localizar y reparar fuga", uds: 1, p: 150, iva: 21, ivaOn: true, cobertura: true, garantia: "continente" }] },
  s4: {}, anexos: {},
});
const informes = tipo => { const c = expediente(tipo); return [buildWordHTML(c), buildPDFHTML(c, "")]; };

describe("Instant Payment: sin estudio de capitales asegurados", () => {
  it("no imprime valor asegurado, valor preexistente ni infraseguro (Word y PDF)", () => {
    for (const h of informes("INSTANT_PAYMENT")) {
      expect(h).not.toContain("VALOR PREEXISTENTE");
      expect(h).not.toContain("INFRASEGURO");
      expect(h).not.toContain("CONTINENTE / OBRAS DE REFORMA");
      expect(h).not.toContain("Estudios de los capitales");
    }
  });

  it("mantiene el resto del informe: localización, causas, valoración y resumen por garantías", () => {
    for (const h of informes("INSTANT_PAYMENT")) {
      expect(h).toMatch(/VERIFICACIÓN DEL RIESGO Y PÓLIZA/);
      expect(h).toContain("Este siniestro se ha gestionado documentalmente.");
      expect(h).toContain("Rotura de tubería de suministro.");
      expect(h).toContain("Localizar y reparar fuga");
      expect(h).toMatch(/ESTUDIO DE COBERTURA-INDEMNIZACIÓN/);
      expect(h).toContain("Resumen por garantías"); // los Instant reales lo incluyen
    }
  });
});

describe("Peritación: el estudio de capitales se mantiene igual", () => {
  it("imprime capital asegurado, valor preexistente e infraseguro (Word y PDF)", () => {
    for (const h of informes("PERITACION")) {
      expect(h).toContain("CONTINENTE / OBRAS DE REFORMA");
      expect(h).toContain("VALOR PREEXISTENTE");
      expect(h).toContain("INFRASEGURO");
      expect(h).toContain("230.000,00");
    }
  });
});

describe("muestraCapitalesAsegurados", () => {
  it("solo los oculta en Instant Payment", () => {
    expect(muestraCapitalesAsegurados({ tipoEncargo: "INSTANT_PAYMENT" })).toBe(false);
    expect(muestraCapitalesAsegurados({ tipoEncargo: "PERITACION" })).toBe(true);
    expect(muestraCapitalesAsegurados({})).toBe(true);       // expedientes antiguos sin tipo: como hasta ahora
    expect(muestraCapitalesAsegurados(undefined)).toBe(true);
  });
});

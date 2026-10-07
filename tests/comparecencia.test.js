import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fraseComparecencia, normalizarModalidad, modalidadInicial, MODALIDADES } from "../lib/dominio/informe.js";
import { buildWordHTML, buildPDFHTML } from "../components/Peritia.jsx";

// C-1. Si no consta una visita presencial, el informe no puede afirmar que el
// perito compareció en el riesgo. En los expedientes reales, 124 de 133
// informes son documentales o por vídeo.

// "se ha procedido a la comparecencia" sin un "NO" delante = afirma la visita.
const AFIRMA_VISITA = /(?<!NO )se ha procedido a la comparecencia/;

const expediente = encargo => ({
  encargo: { numReferencia: "9705000001", compania: "AXA Seguros", tipoEncargo: "PERITACION", ...encargo },
  s1: {}, s2: {}, s3: {}, s4: {}, anexos: {},
});
const informes = encargo => {
  const c = expediente(encargo);
  return { word: buildWordHTML(c), pdf: buildPDFHTML(c, "") };
};

describe("informe exportado según la modalidad de intervención", () => {
  it("presencial: afirma la comparecencia en el riesgo (Word y PDF)", () => {
    const { word, pdf } = informes({ modalidadVisita: "PRESENCIAL" });
    for (const h of [word, pdf]) expect(h).toMatch(AFIRMA_VISITA);
  });

  it("documental: dice que NO hubo comparecencia y que se hizo por sistema documental", () => {
    const { word, pdf } = informes({ modalidadVisita: "DOCUMENTAL" });
    for (const h of [word, pdf]) {
      expect(h).not.toMatch(AFIRMA_VISITA);
      expect(h).toContain("NO se ha procedido a la comparecencia");
      expect(h).toContain("sistema documental");
    }
  });

  it("vídeo-peritación: dice que NO hubo comparecencia y que fue remota", () => {
    const { word, pdf } = informes({ modalidadVisita: "VIDEO" });
    for (const h of [word, pdf]) {
      expect(h).not.toMatch(AFIRMA_VISITA);
      expect(h).toContain("vídeo-peritación");
    }
  });

  it("sin modalidad: redacción neutra, ni afirma ni niega la visita", () => {
    for (const modalidadVisita of [undefined, "", null]) {
      const { word, pdf } = informes({ modalidadVisita });
      for (const h of [word, pdf]) {
        expect(h).not.toMatch(/comparecencia/);
        expect(h).toContain("se ha realizado la función pericial");
      }
    }
  });

  it("un valor desconocido nunca se convierte en visita presencial", () => {
    const { word, pdf } = informes({ modalidadVisita: "telefónica" });
    for (const h of [word, pdf]) expect(h).not.toMatch(AFIRMA_VISITA);
  });

  it("Word y PDF dicen exactamente lo mismo", () => {
    for (const m of ["PRESENCIAL", "DOCUMENTAL", "VIDEO", ""]) {
      const { word, pdf } = informes({ modalidadVisita: m });
      expect(word).toContain(fraseComparecencia(m));
      expect(pdf).toContain(fraseComparecencia(m));
    }
  });
});

describe("normalizarModalidad", () => {
  it("acepta los valores ya guardados y variantes escritas a mano", () => {
    expect(normalizarModalidad("PRESENCIAL")).toBe(MODALIDADES.PRESENCIAL);
    expect(normalizarModalidad("presencial")).toBe(MODALIDADES.PRESENCIAL);
    expect(normalizarModalidad("Documental")).toBe(MODALIDADES.DOCUMENTAL);
    expect(normalizarModalidad("vídeo")).toBe(MODALIDADES.VIDEO);
    expect(normalizarModalidad("Videoperitación")).toBe(MODALIDADES.VIDEO);
    expect(normalizarModalidad("video-peritacion")).toBe(MODALIDADES.VIDEO);
  });
  it("lo que no reconoce queda sin indicar", () => {
    expect(normalizarModalidad("telefónica")).toBe(MODALIDADES.SIN_INDICAR);
    expect(normalizarModalidad(undefined)).toBe(MODALIDADES.SIN_INDICAR);
  });
});

describe("modalidad con la que nace el expediente al leer el encargo", () => {
  it("Instant Payment: documental (es su forma de gestión)", () => {
    expect(modalidadInicial({ tipoEncargo: "INSTANT_PAYMENT" })).toBe(MODALIDADES.DOCUMENTAL);
  });
  it("peritación: sin indicar hasta que el perito la elija, nunca presencial", () => {
    expect(modalidadInicial({ tipoEncargo: "PERITACION" })).toBe(MODALIDADES.SIN_INDICAR);
    expect(modalidadInicial({})).toBe(MODALIDADES.SIN_INDICAR);
  });
});

describe("guardia C-1 en Peritia.jsx", () => {
  const src = readFileSync(new URL("../components/Peritia.jsx", import.meta.url), "utf8");
  it("ninguna plantilla lleva la comparecencia escrita a mano", () => {
    expect(src).not.toMatch(/<p class=.intro.>En cumplimiento de lo requerido/);
  });
  it("la extracción del encargo ya no adivina la modalidad ni la pone presencial por defecto", () => {
    expect(src).not.toMatch(/"modalidadVisita":\s*"PRESENCIAL si/);
    expect(src).not.toMatch(/modalidadVisita:\s*enc\.modalidadVisita\|\|"PRESENCIAL"/);
  });
});

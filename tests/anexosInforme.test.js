import { describe, it, expect } from "vitest";
import { estadoDocumento, clasificarDocumentos, notaDocumento, hayDocumentosAportados, ESTADO_DOC } from "../lib/dominio/anexosInforme.js";

describe("E7 · estado de cada documento en el informe", () => {
  it("imagen con dirección: se reproduce", () => {
    expect(estadoDocumento({ name: "f.jpg", type: "image/jpeg", url: "u" })).toBe(ESTADO_DOC.IMAGEN);
    expect(estadoDocumento({ name: "foto", url: "data:image/png;base64,x" })).toBe(ESTADO_DOC.IMAGEN);
  });
  it("PDF con dirección: existe, pero no se puede reproducir", () => {
    expect(estadoDocumento({ name: "p.pdf", type: "application/pdf", url: "u" })).toBe(ESTADO_DOC.NO_REPRODUCIBLE);
    expect(estadoDocumento({ name: "p.PDF", url: "u" })).toBe(ESTADO_DOC.NO_REPRODUCIBLE);
  });
  it("sin dirección o marcado como perdido: no disponible", () => {
    expect(estadoDocumento({ name: "p.pdf" })).toBe(ESTADO_DOC.NO_DISPONIBLE);
    expect(estadoDocumento({ name: "p.pdf", url: "u", perdida: true })).toBe(ESTADO_DOC.NO_DISPONIBLE);
  });
  it("la nota no afirma que el contenido esté incluido", () => {
    expect(notaDocumento({ estado: ESTADO_DOC.NO_REPRODUCIBLE })).toMatch(/no se reproduce en este informe/);
    expect(notaDocumento({ estado: ESTADO_DOC.NO_DISPONIBLE })).toMatch(/no disponible/);
  });
});

describe("E7 · duplicados", () => {
  it("no quita ninguno: los numera todos y marca el posible duplicado", () => {
    const docs = clasificarDocumentos([
      { name: "P.pdf", size: 10, url: "a" },
      { name: "P.pdf", size: 10, url: "b" },
      { name: "P.pdf", size: 99, url: "c" },
      { name: "Q.pdf", url: "a" },
    ]);
    expect(docs.map(d => d.numero)).toEqual([1, 2, 3, 4]);
    expect(docs.map(d => d.duplicadoDe)).toEqual([null, 1, null, 1]);
  });
});

describe("E4 · ¿constan documentos aportados?", () => {
  it("cuenta Anexos y Sección 3, pero no los que se perdieron", () => {
    expect(hayDocumentosAportados({}, {})).toBe(false);
    expect(hayDocumentosAportados({ presupuestos: [{ name: "p.pdf", url: "u" }] }, {})).toBe(true);
    expect(hayDocumentosAportados({}, { facturas: [{ name: "f.pdf", url: "u" }] })).toBe(true);
    expect(hayDocumentosAportados({}, { facturas: [{ name: "f.pdf" }] })).toBe(false);
  });
});

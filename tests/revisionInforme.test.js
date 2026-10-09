import { describe, it, expect } from "vitest";
import { actuacionIncompatible, importesEnTexto, discrepanciaIndemnizacion, revisarInforme, textoSeccion2 } from "../lib/dominio/revisionInforme.js";

describe("E3 · actuaciones incompatibles con la modalidad", () => {
  const inspeccion = "Se llevó a cabo una inspección ocular directa del inmueble.";
  const documental = "Este siniestro se ha gestionado documentalmente.";
  it("documental: una inspección presencial es un error confirmado", () => {
    expect(actuacionIncompatible(inspeccion, "DOCUMENTAL")).toEqual({ nivel: "error", frases: ["inspección ocular"] });
    expect(actuacionIncompatible("El perito se personó en el domicilio.", "DOCUMENTAL")?.nivel).toBe("error");
    expect(actuacionIncompatible(documental, "DOCUMENTAL")).toBeNull();
  });
  it("presencial: describirlo como documental es un error; la inspección es compatible", () => {
    expect(actuacionIncompatible(documental, "PRESENCIAL")?.nivel).toBe("error");
    expect(actuacionIncompatible(inspeccion, "PRESENCIAL")).toBeNull();
  });
  it("vídeo: una inspección presencial es error, salvo que el texto hable del vídeo (aviso)", () => {
    expect(actuacionIncompatible(inspeccion, "VIDEO")?.nivel).toBe("error");
    expect(actuacionIncompatible("Inspección ocular por videollamada.", "VIDEO")?.nivel).toBe("aviso");
  });
  it("sin indicar: no se puede confirmar, es un aviso", () => {
    expect(actuacionIncompatible(inspeccion, "")?.nivel).toBe("aviso");
    expect(actuacionIncompatible("Granizo en la cubierta.", "")).toBeNull();
  });
});

describe("E2 · importe de la propuesta frente a la tabla", () => {
  it("lee importes con y sin separador de millares, solo tras «INDEMNIZACIÓN:»", () => {
    expect(importesEnTexto("Daños por 9.999,00 €.\nINDEMNIZACIÓN:\nAsegurado: 2.470,00 €")).toEqual([2470]);
    expect(importesEnTexto("INDEMNIZACIÓN:\nAsegurado: 2470,00 €\nReparador: 30 €")).toEqual([2470, 30]);
  });
  it("detecta la discrepancia del informe de prueba", () => {
    expect(discrepanciaIndemnizacion("INDEMNIZACIÓN:\nAsegurado: 0,00 €", 2470)).toEqual({ texto: 0, calculo: 2470, motivo: "importe" });
  });
  it("suma varios perceptores y tolera céntimos de redondeo", () => {
    expect(discrepanciaIndemnizacion("INDEMNIZACIÓN:\nAsegurado: 2.000,00 €\nReparador: 470,00 €", 2470)).toBeNull();
    expect(discrepanciaIndemnizacion("INDEMNIZACIÓN:\nAsegurado: 2.470,00 €", 2470.004)).toBeNull();
  });
  it("«NO se propone indemnización» con importe calculado es discrepancia", () => {
    expect(discrepanciaIndemnizacion("NO se propone indemnización.", 100)?.motivo).toBe("no_propone");
    expect(discrepanciaIndemnizacion("NO se propone indemnización.", 0)).toBeNull();
  });
  it("si el texto no da ningún importe, no inventa una discrepancia", () => {
    expect(discrepanciaIndemnizacion("Se propone indemnizar según factura definitiva.", 2470)).toBeNull();
  });
});

describe("revisión completa", () => {
  const base = () => ({
    encargo: { tipoEncargo: "PERITACION", modalidadVisita: "PRESENCIAL", franquicia: "0" },
    s1: {}, s2: { textoRaw: "Rotura de tubería." }, s4: {},
    s3: { modoValoracion: "factura", partidas: [{ id: 1, p: 100, uds: 1, cobertura: true }] },
  });
  it("un expediente coherente no da errores", () => {
    const r = revisarInforme(base(), { documentos: [{ name: "f.pdf", type: "application/pdf", url: "u", tipo: "Factura" }] });
    expect(r.filter(x => x.nivel === "error")).toEqual([]);
  });
  it("un PDF es un aviso; un documento perdido, un error", () => {
    const r = revisarInforme(base(), { documentos: [
      { name: "f.pdf", type: "application/pdf", url: "u", tipo: "Factura" },
      { name: "g.pdf", type: "application/pdf", tipo: "Factura" },
    ] });
    expect(r.find(x => x.codigo === "anexo_pdf")?.nivel).toBe("aviso");
    expect(r.find(x => x.codigo === "anexo_no_disponible")?.nivel).toBe("error");
  });
  it("valoración por factura sin ninguna factura: aviso", () => {
    expect(revisarInforme(base()).find(x => x.codigo === "sin_documento")?.nivel).toBe("aviso");
  });
  it("partida con cobertura a 0 €: aviso", () => {
    const c = base(); c.s3.partidas.push({ id: 2, p: 0, uds: 1, cobertura: true });
    expect(revisarInforme(c).find(x => x.codigo === "partida_sin_importe")?.mensaje).toMatch(/^1 partida/);
  });
  it("sin nombre de perito: aviso", () => {
    expect(revisarInforme(base(), { perito: { nombre: "" } }).find(x => x.codigo === "perito")?.nivel).toBe("aviso");
  });
  it("2.1 usa el texto mejorado si es válido y el del perito si la IA falló", () => {
    expect(textoSeccion2({ textoRaw: "A", textoAI: "B" })).toBe("B");
    expect(textoSeccion2({ textoRaw: "A", textoAI: '{"_apiError":true}' })).toBe("A");
    expect(textoSeccion2({ textoAI: "Error de conexión." })).toBe("");
  });
});

import { describe, it, expect } from "vitest";
import { estadosSeccion1, etiquetasSeccion1 } from "../lib/dominio/bloquesSeccion1.js";

// La revisión antes de exportar marcaba como pendientes "Datos del Riesgo
// Asegurado" y "Superficie y Arquitectura" en un expediente Instant Payment ya
// terminado (9705367688, AXA). En Instant la Sección 1 solo enseña el texto: el
// perito no tenía dónde rellenar lo que se le pedía.

const encInstant = {
  tipoEncargo: "INSTANT_PAYMENT", compania: "AXA Seguros", numReferencia: "9705367688",
  lugarIntervencion: "Rei Jaume II, 106, 17800 Olot (Girona)", capitalContinente: "230000",
};
const encPeritacion = { ...encInstant, tipoEncargo: "PERITACION" };

describe("Sección 1 en Instant Payment", () => {
  it("con el texto escrito, no queda nada pendiente aunque no haya superficie ni estado", () => {
    const s1 = { textoInstant: "La perita actuante procedió a la verificación del riesgo sito en Rei Jaume II, 106." };
    expect(estadosSeccion1(s1, encInstant)).toEqual([true]);
    expect(etiquetasSeccion1(encInstant)).toEqual(["Texto de la Sección 1"]);
  });

  it("sin texto (o solo espacios), el único pendiente es el texto de la sección", () => {
    expect(estadosSeccion1({}, encInstant)).toEqual([false]);
    expect(estadosSeccion1({ textoInstant: "   " }, encInstant)).toEqual([false]);
  });

  it("no pide capitales: un capital vacío no lo deja pendiente", () => {
    const s1 = { textoInstant: "Texto." };
    expect(estadosSeccion1(s1, { ...encInstant, capitalContinente: "" })).toEqual([true]);
  });
});

describe("Sección 1 en peritación (sin cambios)", () => {
  it("sigue pidiendo los tres bloques", () => {
    expect(etiquetasSeccion1(encPeritacion)).toEqual(["Datos del Riesgo Asegurado", "Superficie y Arquitectura", "Capitales Asegurados"]);
    expect(estadosSeccion1({}, encPeritacion)).toEqual([false, false, true]);
    expect(estadosSeccion1({}, { ...encPeritacion, capitalContinente: "" })).toEqual([false, false, false]);
  });

  it("el texto de Instant no cuenta como datos del riesgo en peritación", () => {
    expect(estadosSeccion1({ textoInstant: "Texto." }, encPeritacion)[0]).toBe(false);
  });

  it("completa con estado, superficie y tipo de arquitectura", () => {
    const s1 = { estado: "Bueno", superficieConstruida: "90", tipoArqKey: "pluri_bloque_menos16", calidad: "Media" };
    const enc = { ...encPeritacion, provincia: "Girona" };
    const [riesgo, superficie] = estadosSeccion1(s1, enc);
    expect(riesgo).toBe(true);
    expect(superficie).toBe(true);
  });

  it("acepta s1 o encargo nulos sin romperse", () => {
    expect(() => estadosSeccion1(null, null)).not.toThrow();
    expect(etiquetasSeccion1(null)).toHaveLength(3);
  });
});

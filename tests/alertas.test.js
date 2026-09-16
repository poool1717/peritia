import { describe, it, expect } from "vitest";
import {
  UMBRAL_INFRASEGURO_SOSPECHOSO, infraseguroSospechoso,
  avisoInfraseguro, avisosDelRiesgo,
} from "../lib/dominio/alertas.js";

describe("infraseguroSospechoso — dónde está el listón", () => {
  it("el umbral es del 90 %", () => {
    expect(UMBRAL_INFRASEGURO_SOSPECHOSO).toBe(90);
  });
  it("un infraseguro alto pero creíble no se marca", () => {
    expect(infraseguroSospechoso(0)).toBe(false);
    expect(infraseguroSospechoso(60)).toBe(false);
    expect(infraseguroSospechoso(89.99)).toBe(false);
  });
  it("a partir del 90 % sí se marca, el límite incluido", () => {
    expect(infraseguroSospechoso(90)).toBe(true);
    expect(infraseguroSospechoso(99.89)).toBe(true);
  });
  it("aguanta valores basura sin romperse", () => {
    expect(infraseguroSospechoso(null)).toBe(false);
    expect(infraseguroSospechoso(undefined)).toBe(false);
    expect(infraseguroSospechoso("no es un número")).toBe(false);
    expect(infraseguroSospechoso("95")).toBe(true);
  });
});

describe("avisoInfraseguro — qué se le dice al perito", () => {
  it("no hay aviso cuando el infraseguro es plausible", () => {
    expect(avisoInfraseguro({ infra: 45 })).toBe(null);
    expect(avisoInfraseguro({})).toBe(null);
    expect(avisoInfraseguro()).toBe(null);
  });

  it("el aviso de continente empieza por la causa más frecuente: el primer riesgo", () => {
    const av = avisoInfraseguro({ bloque: "continente", infra: 99.89, capital: 6000, preexistente: 5316211.83 });
    expect(av.titulo).toMatch(/99,89 %/);
    expect(av.titulo).toMatch(/continente/);
    expect(av.motivos[0]).toMatch(/PRIMER RIESGO/);
    expect(av.motivos).toHaveLength(3);
  });

  it("enseña las cifras concretas para poder contrastarlas contra la póliza", () => {
    const av = avisoInfraseguro({ bloque: "continente", infra: 95, capital: 6000, preexistente: 5316211.83 });
    expect(av.motivos.some(m => /6\.?000/.test(m))).toBe(true);
    expect(av.motivos.some(m => /5\.316\.211/.test(m))).toBe(true);
  });

  it("el aviso de contenido no habla de superficie ni de primer riesgo", () => {
    const av = avisoInfraseguro({ bloque: "contenido", infra: 97, capital: 1000, preexistente: 500000 });
    expect(av.titulo).toMatch(/contenido/);
    expect(av.motivos).toHaveLength(2);
    expect(av.motivos.some(m => /superficie|PRIMER RIESGO/.test(m))).toBe(false);
  });
});

describe("avisosDelRiesgo — sobre el encargo completo", () => {
  it("un riesgo normal sin infraseguro no dispara nada", () => {
    const enc = { provincia: "Barcelona", capitalContinente: "500.000,00 €" };
    const s1 = { superficieConstruida: 120, tipoArqKey: "pluri_bloque_16_40", calidad: "Media" };
    expect(avisosDelRiesgo(enc, s1)).toHaveLength(0);
  });
  it("un encargo vacío no revienta", () => {
    expect(avisosDelRiesgo(null, null)).toHaveLength(0);
  });
});

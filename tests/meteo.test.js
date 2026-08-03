import { describe, it, expect } from "vitest";
import { esSiniestroAtmosferico, causasMeteo, meteoSupera } from "../components/Peritia.jsx";

describe("esSiniestroAtmosferico", () => {
  it("garantía 'Atmosféricos' activa la verificación", () => {
    expect(esSiniestroAtmosferico({ garantia: "Atmosféricos" })).toBe(true);
  });
  it("garantía 'Riesgos Extensivos' también la activa", () => {
    expect(esSiniestroAtmosferico({ garantia: "Riesgos Extensivos" })).toBe(true);
  });
  it("garantía 'Daños por agua' NO la activa", () => {
    expect(esSiniestroAtmosferico({ garantia: "Daños por agua" })).toBe(false);
  });
  it("se evalúa también sobre coberturaInferida, no solo sobre garantia", () => {
    expect(esSiniestroAtmosferico({ garantia: "", coberturaInferida: "RGEXT" })).toBe(true);
  });
  it("sin datos, no es atmosférico", () => {
    expect(esSiniestroAtmosferico({})).toBe(false);
    expect(esSiniestroAtmosferico(undefined)).toBe(false);
  });
});

describe("causasMeteo — detección de viento / lluvia / pedrisco en el texto libre", () => {
  it("detecta viento", () => {
    expect(causasMeteo({ causa: "Viento fuerte" })).toEqual({ viento: true, lluvia: false, pedrisco: false });
  });
  it("detecta lluvia e inundación como la misma categoría", () => {
    expect(causasMeteo({ causa: "Inundación por lluvia intensa" }).lluvia).toBe(true);
  });
  it("detecta pedrisco/granizo", () => {
    expect(causasMeteo({ descripcionSiniestro: "Daños por granizo en cubierta" }).pedrisco).toBe(true);
  });
  it("un mismo texto puede activar más de una causa a la vez (BR-09)", () => {
    const c = causasMeteo({ causa: "Temporal de viento y lluvia" });
    expect(c.viento).toBe(true);
    expect(c.lluvia).toBe(true);
  });
  it("causa no atmosférica no activa ninguna", () => {
    expect(causasMeteo({ causa: "Rotura de tubería" })).toEqual({ viento: false, lluvia: false, pedrisco: false });
  });
});

describe("meteoSupera — comparación de valores medidos contra los umbrales de la póliza", () => {
  it("viento supera el umbral de la póliza: label específico de viento", () => {
    const m = { rachaMax: 90, precipMaxHoraria: 5 };
    const enc = { causa: "Viento fuerte", umbralViento: "80", umbralLluvia: "40" };
    const r = meteoSupera(m, enc);
    expect(r).toEqual({ sv: true, sl: false, label: "Sí (viento)", hayUmbral: true });
  });

  it("lluvia supera el umbral de la póliza: label específico de lluvia", () => {
    const m = { rachaMax: 10, precipMaxHoraria: 50 };
    const enc = { causa: "Lluvia intensa", umbralViento: "80", umbralLluvia: "40" };
    const r = meteoSupera(m, enc);
    expect(r).toEqual({ sv: false, sl: true, label: "Sí (lluvia)", hayUmbral: true });
  });

  it("viento y lluvia superan a la vez: label combinado", () => {
    const m = { rachaMax: 100, precipMaxHoraria: 60 };
    const enc = { causa: "Temporal de viento y lluvia", umbralViento: "80", umbralLluvia: "40" };
    const r = meteoSupera(m, enc);
    expect(r.label).toBe("Sí (viento y lluvia)");
  });

  it("hay umbral pero no se supera: label 'No'", () => {
    const m = { rachaMax: 10, precipMaxHoraria: 5 };
    const enc = { causa: "Viento", umbralViento: "80", umbralLluvia: "40" };
    const r = meteoSupera(m, enc);
    expect(r).toEqual({ sv: false, sl: false, label: "No", hayUmbral: true });
  });

  it("la póliza no fija umbrales: label '—', hayUmbral false", () => {
    const m = { rachaMax: 100, precipMaxHoraria: 100 };
    const enc = { causa: "Viento" }; // sin umbralViento ni umbralLluvia
    const r = meteoSupera(m, enc);
    expect(r).toEqual({ sv: false, sl: false, label: "—", hayUmbral: false });
  });

  it("el umbral se supera con igual, no solo con mayor (>=) — ver docs/OPEN_QUESTIONS.md P-16", () => {
    const m = { rachaMax: 80, precipMaxHoraria: 0 };
    const enc = { causa: "Viento", umbralViento: "80", umbralLluvia: "999" };
    expect(meteoSupera(m, enc).sv).toBe(true);
  });

  // Comportamiento documentado (caracterización), no necesariamente el
  // deseado: cuando la causa declarada NO coincide con ningún patrón
  // atmosférico conocido, meteoSupera evalúa igualmente viento y lluvia de
  // forma genérica si la póliza tiene umbrales fijados — en vez de omitir
  // la comparación por no tratarse, aparentemente, de un siniestro
  // atmosférico. Se documenta tal cual está hoy.
  it("[caracterización] causa sin patrón atmosférico reconocido, pero con umbrales en la póliza: se evalúan igualmente", () => {
    const m = { rachaMax: 90, precipMaxHoraria: 10 };
    const enc = { causa: "Rotura de tubería", umbralViento: "80", umbralLluvia: "40" };
    const r = meteoSupera(m, enc);
    expect(r.sv).toBe(true); // 90 >= 80, evaluado aunque la causa no sea "viento"
    expect(r.sl).toBe(false); // 10 < 40
  });
});

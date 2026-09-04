import { test } from "node:test";
import assert from "node:assert/strict";
import { esSiniestroAtmosferico, causasMeteo, meteoSupera } from "../core/index.mjs";

// La verificación XEMA solo se muestra si la GARANTÍA es atmosféricos o
// riesgos extensivos — criterio del perito, no de la causa declarada.
test("es atmosférico según la garantía afectada, no según la causa", () => {
  assert.equal(esSiniestroAtmosferico({ garantia: "Fenómenos Atmosféricos" }), true);
  assert.equal(esSiniestroAtmosferico({ garantia: "Riesgos Extensivos" }), true);
  assert.equal(esSiniestroAtmosferico({ coberturaInferida: "RGEXT" }), true);
  assert.equal(esSiniestroAtmosferico({ garantia: "Daños por Agua" }), false);
});

test("una causa de viento sin garantía atmosférica no activa la verificación", () => {
  assert.equal(esSiniestroAtmosferico({ garantia: "Daños por Agua", causa: "viento fuerte" }), false);
});

test("es atmosférico aguanta un encargo vacío", () => {
  assert.equal(esSiniestroAtmosferico(null), false);
  assert.equal(esSiniestroAtmosferico({}), false);
});

test("causasMeteo detecta viento, lluvia y pedrisco, también en catalán", () => {
  assert.deepEqual(causasMeteo({ causa: "Fuertes rachas de viento" }), { viento: true, lluvia: false, pedrisco: false });
  assert.deepEqual(causasMeteo({ causa: "Pluja intensa" }), { viento: false, lluvia: true, pedrisco: false });
  assert.deepEqual(causasMeteo({ causa: "Calamarsa" }), { viento: false, lluvia: false, pedrisco: true });
});

test("causasMeteo mira causa, descripción y garantía a la vez", () => {
  const c = causasMeteo({ causa: "Temporal", descripcionSiniestro: "entró agua de lluvia por la cubierta" });
  assert.equal(c.viento, true);
  assert.equal(c.lluvia, true);
});

test("causasMeteo con un encargo vacío no detecta nada", () => {
  assert.deepEqual(causasMeteo(null), { viento: false, lluvia: false, pedrisco: false });
});

// meteoSupera compara lo medido por la estación con los umbrales de la póliza.
const ENC_VIENTO = { causa: "viento", umbralViento: 80, umbralLluvia: 40 };

test("supera el umbral de viento cuando la racha medida llega al límite", () => {
  assert.equal(meteoSupera({ rachaMax: 95 }, ENC_VIENTO).sv, true);
  assert.equal(meteoSupera({ rachaMax: 80 }, ENC_VIENTO).sv, true); // el límite cuenta
  assert.equal(meteoSupera({ rachaMax: 79 }, ENC_VIENTO).sv, false);
});

test("solo se evalúa el umbral de la causa declarada", () => {
  // Siniestro de viento: aunque llueva a mares, la lluvia no se evalúa.
  const r = meteoSupera({ rachaMax: 40, precipMaxHoraria: 200 }, ENC_VIENTO);
  assert.equal(r.sl, false);
  assert.equal(r.label, "No");
});

test("el pedrisco se evalúa contra el umbral de lluvia", () => {
  const enc = { causa: "granizo", umbralViento: 80, umbralLluvia: 40 };
  assert.equal(meteoSupera({ precipMaxHoraria: 50 }, enc).sl, true);
});

test("sin causa reconocida se evalúan los dos umbrales", () => {
  const enc = { causa: "siniestro varios", umbralViento: 80, umbralLluvia: 40 };
  const r = meteoSupera({ rachaMax: 90, precipMaxHoraria: 50 }, enc);
  assert.equal(r.label, "Sí (viento y lluvia)");
});

test("sin umbrales en la póliza no se puede concluir nada", () => {
  const r = meteoSupera({ rachaMax: 200, precipMaxHoraria: 200 }, { causa: "viento" });
  assert.equal(r.hayUmbral, false);
  assert.equal(r.label, "—");
});

test("sin datos de la estación no se supera ningún umbral", () => {
  const r = meteoSupera(null, ENC_VIENTO);
  assert.equal(r.sv, false);
  assert.equal(r.label, "No");
});

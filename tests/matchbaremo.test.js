import { describe, it, expect } from "vitest";
import { matchBaremo, BAREMO, PCT_INDIRECTO } from "../components/Peritia.jsx";

// Comportamiento verificado ejecutando matchBaremo contra el BAREMO real
// (no adivinado): ver el propio código, tests/matchbaremo.test.js documenta
// los tres niveles de coincidencia descritos en su comentario original.

describe("BAREMO — integridad del catálogo verificado en el Sprint 0", () => {
  it("tiene 47 partidas", () => {
    expect(BAREMO).toHaveLength(47);
  });
  it("toda partida tiene oficio, descripción, unidad y precio", () => {
    for (const p of BAREMO) {
      expect(p.oficio, p.desc).toBeTruthy();
      expect(p.desc).toBeTruthy();
      expect(p.u).toBeTruthy();
      expect(typeof p.p).toBe("number");
    }
  });
  it("exactamente una partida es de costes indirectos, con precio base 0", () => {
    const indirectas = BAREMO.filter(p => p.indirecto);
    expect(indirectas).toHaveLength(1);
    expect(indirectas[0].p).toBe(0);
    expect(indirectas[0].desc).toBe("Costos indirectos");
  });
  it(`el porcentaje de costes indirectos documentado es ${PCT_INDIRECTO}%`, () => {
    expect(PCT_INDIRECTO).toBe(8);
  });
});

describe("matchBaremo — nivel 1: coincidencia exacta (sin tildes/mayúsculas)", () => {
  it("coincidencia literal", () => {
    expect(matchBaremo("picado de enlucido")?.desc).toBe("Picado de enlucido");
  });
  it("mayúsculas y tildes no importan", () => {
    expect(matchBaremo("ENLUCIDO CON MORTERO")?.desc).toBe("Enlucido con mortero");
  });
});

describe("matchBaremo — nivel 2: contención (una cadena contiene a la otra)", () => {
  it("el texto de la IA es más largo que la partida y la contiene", () => {
    const r = matchBaremo("Pintura plástica en paredes de la cocina");
    expect(r?.desc).toBe("Pintura plástica en paredes");
  });
  it("el texto de la IA es más corto y está contenido en la partida", () => {
    const r = matchBaremo("fuga");
    expect(r?.desc).toBe("Localización de fuga");
  });
});

describe("matchBaremo — nivel 3: mayoría de palabras significativas (mínimo la mitad)", () => {
  it("sin coincidencia exacta ni contención, empareja por palabras compartidas", () => {
    // "reparacion"(10) "picado"(6) "enlucido"(8) "pared"(5): las 4 tienen
    // más de 3 letras. "Picado de enlucido" comparte picado+enlucido = 2
    // de 4 → cumple el umbral (mitad, redondeado hacia arriba = 2).
    const r = matchBaremo("reparacion picado enlucido pared");
    expect(r?.desc).toBe("Picado de enlucido");
  });

  it("en empate de palabras compartidas, gana la primera partida del baremo en ese orden", () => {
    // "Sustitución de cerradura" (CARPINTERÍA) y "Sustitución de bombín"
    // (CERRAJERÍA) empatan a 2 palabras compartidas con este texto; CARPINTERÍA
    // precede a CERRAJERÍA en BAREMO, así que gana la primera encontrada.
    const r = matchBaremo("sustitucion bombin cerradura");
    expect(r?.desc).toBe("Sustitución de cerradura");
  });
});

describe("matchBaremo — sin coincidencia", () => {
  it("un texto sin relación con ninguna partida devuelve null, no una partida al azar", () => {
    expect(matchBaremo("algo que no existe en absoluto xyz")).toBeNull();
  });
  it("texto vacío devuelve null", () => {
    expect(matchBaremo("")).toBeNull();
    expect(matchBaremo(null)).toBeNull();
  });
});

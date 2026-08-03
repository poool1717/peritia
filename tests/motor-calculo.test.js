import { describe, it, expect } from "vitest";
import {
  calcPartida, resolvePartidas, getPartidas,
  sumRepos, sumIVA, sumReal,
  calcReglas, calcRegla, reglaPartida, sumAjustado, calcIndemnizacion,
  fraseIndemn, calcVPreexCont, PCT_INDIRECTO,
} from "../components/Peritia.jsx";

// ─── calcPartida ────────────────────────────────────────────────────────────
// Fórmula documentada en el propio código y en docs/domain/entities/REPAIR.md:
//   V.Repos = uds × p
//   IVA €   = V.Repos × (iva / 100)
//   V.Real  = V.Repos × (1 − %Depr/100) + IVA €
describe("calcPartida", () => {
  it("sin depreciación ni IVA, el valor real es igual al de reposición", () => {
    const r = calcPartida({ uds: 2, p: 100 });
    expect(r.vRepos).toBe(200);
    expect(r.ivaAmt).toBe(0);
    expect(r.vReal).toBe(200);
  });

  it("con IVA y sin depreciación", () => {
    const r = calcPartida({ uds: 1, p: 100, iva: 21 });
    expect(r.vRepos).toBe(100);
    expect(r.ivaAmt).toBe(21);
    expect(r.vReal).toBe(121);
  });

  it("con depreciación activada", () => {
    const r = calcPartida({ uds: 1, p: 100, depr: true, pctDepr: 10 });
    expect(r.vReal).toBe(90); // 100 * 0.9 + 0
  });

  it("con depreciación e IVA combinados", () => {
    // vRepos=200, ivaAmt=200*0.21=42, vReal=200*(1-0.10)+42=180+42=222
    const r = calcPartida({ uds: 2, p: 100, iva: 21, depr: true, pctDepr: 10 });
    expect(r.vRepos).toBe(200);
    expect(r.ivaAmt).toBe(42);
    expect(r.vReal).toBe(222);
  });

  it("pctDepr se ignora si depr es false, aunque tenga un valor", () => {
    const r = calcPartida({ uds: 1, p: 100, depr: false, pctDepr: 50 });
    expect(r.vReal).toBe(100);
  });

  it("uds por defecto es 1 si no se especifica", () => {
    const r = calcPartida({ p: 50 });
    expect(r.vRepos).toBe(50);
  });

  it("precio por defecto es 0 si no se especifica", () => {
    const r = calcPartida({ uds: 5 });
    expect(r.vRepos).toBe(0);
  });
});

// ─── resolvePartidas — costes indirectos ───────────────────────────────────
describe("resolvePartidas", () => {
  it(`la partida indirecta se calcula como ${PCT_INDIRECTO}% del subtotal de las demás`, () => {
    const rows = [
      { uds: 1, p: 100 },
      { uds: 1, p: 200 },
      { uds: 5, p: 999, indirecto: true }, // uds y p de entrada se ignoran
    ];
    const out = resolvePartidas(rows);
    const indirecta = out.find(p => p.indirecto);
    expect(indirecta.uds).toBe(1);
    expect(indirecta.p).toBe(24); // (100+200) * 8/100 = 24
  });

  it("el subtotal de la partida indirecta NO se incluye en su propia base", () => {
    // Dos partidas indirectas: cada una se calcula sobre las NO indirectas,
    // no se contaminan entre sí ni se recalculan en cascada.
    const rows = [
      { uds: 1, p: 100 },
      { uds: 3, p: 50, indirecto: true },
      { uds: 2, p: 10, indirecto: true },
    ];
    const out = resolvePartidas(rows);
    const indirectas = out.filter(p => p.indirecto);
    expect(indirectas.every(p => p.p === 8)).toBe(true); // 100 * 8/100 = 8, para ambas
  });

  it("sin partidas indirectas, no cambia nada", () => {
    const rows = [{ uds: 1, p: 100 }, { uds: 2, p: 50 }];
    expect(resolvePartidas(rows)).toEqual(rows);
  });
});

// ─── getPartidas — fuente única de partidas activas ────────────────────────
describe("getPartidas", () => {
  it("excluye las partidas marcadas explícitamente sin cobertura", () => {
    const s3 = { partidas: [
      { id: 1, uds: 1, p: 100, cobertura: true },
      { id: 2, uds: 1, p: 100, cobertura: false },
      { id: 3, uds: 1, p: 100 }, // sin campo cobertura: se incluye (!== false)
    ]};
    const out = getPartidas(s3);
    expect(out.map(p => p.id)).toEqual([1, 3]);
  });

  it("sin partidas o sin s3, devuelve un array vacío", () => {
    expect(getPartidas({})).toEqual([]);
    expect(getPartidas(null)).toEqual([]);
    expect(getPartidas(undefined)).toEqual([]);
  });

  it("aplica resolvePartidas: los indirectos llegan ya calculados", () => {
    const s3 = { partidas: [
      { uds: 1, p: 100, cobertura: true },
      { uds: 1, p: 999, indirecto: true, cobertura: true },
    ]};
    const out = getPartidas(s3);
    expect(out.find(p => p.indirecto).p).toBe(8); // 100 * 8/100
  });
});

// ─── sumRepos / sumIVA / sumReal ────────────────────────────────────────────
describe("sumRepos / sumIVA / sumReal", () => {
  const rows = [
    { uds: 1, p: 100, iva: 21 },      // vRepos 100, iva 21, vReal 121
    { uds: 2, p: 50, depr: true, pctDepr: 20 }, // vRepos 100, iva 0, vReal 80
  ];
  it("sumRepos suma el valor de reposición de todas las filas", () => {
    expect(sumRepos(rows)).toBe(200);
  });
  it("sumIVA suma el IVA de todas las filas", () => {
    expect(sumIVA(rows)).toBe(21);
  });
  it("sumReal suma el valor real de todas las filas", () => {
    expect(sumReal(rows)).toBe(201); // 121 + 80
  });
  it("con lista vacía, las tres devuelven 0", () => {
    expect(sumRepos([])).toBe(0);
    expect(sumIVA([])).toBe(0);
    expect(sumReal([])).toBe(0);
  });
});

// ─── calcReglas — regla proporcional e infraseguro ─────────────────────────
// Se usa calcVPreexCont (ya verificado en su propia batería,
// tests/modulos-arquitectura.test.js) para construir capitales de partida
// coherentes con la tabla real, en vez de fijar a mano un valor de módulo
// con muchos decimales que sería fácil transcribir mal.
describe("calcReglas", () => {
  const base = { provincia: "08" }; // Barcelona, con tabla propia en TABLAS_ARQ
  const s1base = { tipoArqKey: "unif_aislada", calidad: "Media", superficieConstruida: 100 };

  it("sin infraseguro cuando el capital iguala el valor preexistente: regla 1, infraCont 0", () => {
    const vPreex = calcVPreexCont(100, "08", "unif_aislada", "Media");
    const enc = { ...base, capitalContinente: String(vPreex), primerRiesgo: false };
    const r = calcReglas(enc, s1base);
    expect(r.continente).toBeCloseTo(1, 9);
    expect(r.infraCont).toBe(0);
  });

  it("infraseguro del 50%: la regla proporcional reduce a la mitad", () => {
    const vPreex = calcVPreexCont(100, "08", "unif_aislada", "Media");
    const capCont = vPreex / 2;
    const enc = { ...base, capitalContinente: String(capCont), primerRiesgo: false };
    const r = calcReglas(enc, s1base);
    expect(r.continente).toBeCloseTo(0.5, 9);
    expect(r.infraCont).toBeCloseTo(50, 6);
  });

  it("a primer riesgo, la regla es siempre 1 aunque el capital sea muy inferior al módulo", () => {
    const vPreex = calcVPreexCont(100, "08", "unif_aislada", "Media");
    const capContBajo = vPreex / 4; // sería infraseguro severo si no fuera primer riesgo
    const enc = { ...base, capitalContinente: String(capContBajo), primerRiesgo: true };
    const r = calcReglas(enc, s1base);
    expect(r.continente).toBe(1);
    expect(r.infraCont).toBe(0);
    // A primer riesgo, el valor preexistente ES el capital declarado, no el
    // calculado por módulo — así lo dice el propio código.
    expect(r.vPreexCont).toBe(capContBajo);
  });

  it("capContOverride (corrección manual del perito) tiene prioridad sobre el capital del encargo", () => {
    const enc = { ...base, capitalContinente: "999999", primerRiesgo: false };
    const s1 = { ...s1base, capContOverride: "1000" };
    const r = calcReglas(enc, s1);
    expect(r.capCont).toBe(1000);
  });

  it("capital superior al valor preexistente no produce infraseguro (regla se queda en 1)", () => {
    const vPreex = calcVPreexCont(100, "08", "unif_aislada", "Media");
    const enc = { ...base, capitalContinente: String(vPreex * 2), primerRiesgo: false };
    const r = calcReglas(enc, s1base);
    expect(r.continente).toBe(1);
  });

  it("bloque de contenido: infraseguro independiente del continente", () => {
    const enc = { ...base, capitalContinente: "0", capitalContenido: "5000", primerRiesgo: false };
    const s1 = { ...s1base, vPreexContenido: "10000" };
    const r = calcReglas(enc, s1);
    expect(r.contenido).toBeCloseTo(0.5, 9);
    expect(r.infraContenido).toBeCloseTo(50, 6);
  });

  it("calcRegla (compatibilidad) devuelve solo la regla del continente", () => {
    const vPreex = calcVPreexCont(100, "08", "unif_aislada", "Media");
    const enc = { ...base, capitalContinente: String(vPreex / 2), primerRiesgo: false };
    expect(calcRegla(enc, s1base)).toBeCloseTo(calcReglas(enc, s1base).continente, 9);
  });

  it("sin encargo ni sección 1 (undefined), no lanza excepción", () => {
    expect(() => calcReglas(undefined, undefined)).not.toThrow();
  });
});

// ─── reglaPartida — aplicación de la regla según garantía y toggle ─────────
describe("reglaPartida", () => {
  const reglas = { continente: 0.5, contenido: 0.8 };

  it("con el toggle desactivado, la regla no se aplica (siempre 1)", () => {
    const p = { garantia: "continente" };
    expect(reglaPartida(p, reglas, { reglaContinente: false })).toBe(1);
  });

  it("con el toggle activado, se aplica la regla del bloque correspondiente", () => {
    expect(reglaPartida({ garantia: "continente" }, reglas, { reglaContinente: true })).toBe(0.5);
    expect(reglaPartida({ garantia: "contenido" }, reglas, { reglaContenido: true })).toBe(0.8);
  });

  it("una partida sin garantía explícita se trata como continente", () => {
    expect(reglaPartida({}, reglas, { reglaContinente: true })).toBe(0.5);
  });
});

// ─── sumAjustado / calcIndemnizacion ───────────────────────────────────────
describe("sumAjustado y calcIndemnizacion", () => {
  const enc = { provincia: "08", capitalContinente: "1000000", primerRiesgo: true }; // sin infraseguro
  const s1 = { tipoArqKey: "unif_aislada", calidad: "Media", superficieConstruida: 100 };

  it("sin infraseguro, el ajustado es igual a la suma de valores reales", () => {
    const s3 = { partidas: [{ uds: 1, p: 100, garantia: "continente", cobertura: true }] };
    expect(sumAjustado(enc, s1, s3)).toBe(100);
  });

  it("la indemnización descuenta la franquicia", () => {
    const s3 = { partidas: [{ uds: 1, p: 500, cobertura: true }], franquiciaVal: "150" };
    expect(calcIndemnizacion(enc, s1, s3)).toBe(350);
  });

  it("la indemnización nunca es negativa: franquicia mayor que el daño da 0", () => {
    const s3 = { partidas: [{ uds: 1, p: 100, cobertura: true }], franquiciaVal: "9999" };
    expect(calcIndemnizacion(enc, s1, s3)).toBe(0);
  });

  it("franquicia general del encargo se usa si no hay franquicia específica en s3", () => {
    const encConFranquicia = { ...enc, franquicia: "50" };
    const s3 = { partidas: [{ uds: 1, p: 100, cobertura: true }] };
    expect(calcIndemnizacion(encConFranquicia, s1, s3)).toBe(50);
  });
});

// ─── fraseIndemn — redacción según modo y perceptor ────────────────────────
describe("fraseIndemn", () => {
  it("en modo baremo no hay frase (el baremo es orientativo)", () => {
    expect(fraseIndemn({ modoValoracion: "baremo" }, 1000)).toBe("");
  });

  it("en modo presupuesto, condiciona la propuesta a la aportación de factura", () => {
    const texto = fraseIndemn({ modoValoracion: "presupuesto" }, 500);
    expect(texto).toContain("factura");
    expect(texto).toContain("500,00 €");
  });

  it("en modo factura con perceptor asegurado, indica IVA incluido", () => {
    const texto = fraseIndemn({ modoValoracion: "factura" }, 500);
    expect(texto).toContain("Asegurado");
    expect(texto).toContain("IVA incl.");
  });

  it("con perceptor reparador, no se menciona IVA incluido", () => {
    const texto = fraseIndemn({ modoValoracion: "factura", perceptorTipo: "reparador" }, 500);
    expect(texto).toContain("Reparador");
    expect(texto).not.toContain("IVA incl.");
  });

  it("con perceptor perjudicado, aparece en la frase", () => {
    const texto = fraseIndemn({ modoValoracion: "factura", perceptorTipo: "perjudicado" }, 200);
    expect(texto).toContain("Perjudicado");
  });
});

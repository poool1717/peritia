import { describe, it, expect } from "vitest";
import { fmt, fmtE, fmtSmart, parseCap, norm, normCompania } from "../components/Peritia.jsx";

describe("fmt / fmtE — formato de importes en español", () => {
  it("formatea con coma decimal y dos decimales", () => {
    expect(fmt(1.5)).toBe("1,50");
    expect(fmt(0)).toBe("0,00");
    expect(fmt(42.1)).toBe("42,10");
  });
  // fmt() usa Intl.NumberFormat("es-ES", ...) sin fijar `useGrouping`. Su
  // separador de millares depende, por tanto, de la implementación de Intl
  // del entorno donde se ejecute. En el navegador (único sitio donde esta
  // app corre de verdad: pages/index.js carga el componente con ssr:false)
  // los motores agrupan por defecto para es-ES ("1.234,50"); en este runtime
  // Node de test (ICU 78.2) no lo hace salvo que se pida explícitamente
  // ("1234,50"). No es un bug de producción — nadie ejecuta fmt() en
  // servidor — pero conviene no fijar en el test un separador de millares
  // concreto que no depende del propio código, sino del entorno.
  it("agrupa millares según el entorno; la parte decimal es estable en cualquiera", () => {
    expect(fmt(1234.5)).toMatch(/^1\.?234,50$/);
  });
  it("fmtE añade el símbolo de euro", () => {
    expect(fmtE(100)).toBe("100,00 €");
  });
  it("valores no numéricos se tratan como 0", () => {
    expect(fmt(null)).toBe("0,00");
    expect(fmt(undefined)).toBe("0,00");
    expect(fmt("abc")).toBe("0,00");
  });
});

describe("fmtSmart — sin decimales si el valor es entero", () => {
  it("un entero no muestra decimales", () => {
    expect(fmtSmart(3)).toBe("3");
    expect(fmtSmart(21)).toBe("21");
  });
  it("un valor con decimales sí los muestra", () => {
    expect(fmtSmart(3.5)).toBe("3,50");
  });
});

describe("parseCap — interpretación de importes extraídos por IA", () => {
  it("formato español con miles y decimales: 6.000,00 → 6000", () => {
    expect(parseCap("6.000,00")).toBe(6000);
  });
  it("formato con punto decimal simple: 6000.00 → 6000", () => {
    expect(parseCap("6000.00")).toBe(6000);
  });
  it("número entero como texto", () => {
    expect(parseCap("6000")).toBe(6000);
  });
  it("número entero como valor numérico (no string)", () => {
    expect(parseCap(6000)).toBe(6000);
  });
  it("vacío, null o undefined → 0", () => {
    expect(parseCap("")).toBe(0);
    expect(parseCap(null)).toBe(0);
    expect(parseCap(undefined)).toBe(0);
  });
  it("cero explícito se conserva como 0, no como vacío", () => {
    expect(parseCap(0)).toBe(0);
    expect(parseCap("0")).toBe(0);
  });
  it("miles con decimales distintos de .00: 1.234,56 → 1234.56", () => {
    expect(parseCap("1.234,56")).toBe(1234.56);
  });

  // Caso límite descubierto al escribir esta batería (no existía antes ningún
  // test que lo hubiera revelado): con el símbolo de euro y espacio al final,
  // el segundo punto que introduce el propio parseCap al convertir la coma en
  // punto ("6.000,00" -> "6.000.00") hace que parseFloat corte en el primer
  // punto y devuelva 6, no 6000. No es el comportamiento esperado por nadie,
  // pero es el comportamiento REAL de hoy — se documenta aquí como
  // caracterización (no como corrección) y se traslada como hallazgo nuevo a
  // docs/TECHNICAL_DEBT.md (DT-24), conforme a la instrucción de este sprint
  // de anotar sin implementar.
  it("[caracterización] con símbolo de euro y espacio, el resultado NO es el importe correcto — ver DT-24", () => {
    expect(parseCap("6.000,00 €")).toBe(6);
  });
});

describe("norm — normalización de texto para comparar", () => {
  it("quita tildes y pasa a minúsculas", () => {
    expect(norm("Daños por Agua")).toBe("danos por agua");
  });
  it("colapsa espacios repetidos y recorta extremos", () => {
    expect(norm("  DANOS   POR   AGUA  ")).toBe("danos por agua");
  });
  it("dos formas distintas de escribir lo mismo normalizan igual", () => {
    expect(norm("Daños por Agua")).toBe(norm("DANOS  POR AGUA"));
  });
  it("valor vacío o no textual no lanza excepción", () => {
    expect(norm(null)).toBe("");
    expect(norm(undefined)).toBe("");
  });
});

describe("normCompania — AXA siempre con el mismo nombre comercial", () => {
  it("reconoce variantes de AXA con distinta capitalización y razón social", () => {
    expect(normCompania("AXA")).toBe("AXA Seguros");
    expect(normCompania("axa")).toBe("AXA Seguros");
    expect(normCompania("AXA Seguros Generales SA")).toBe("AXA Seguros");
  });
  it("otras aseguradoras se devuelven tal cual, sin normalizar", () => {
    expect(normCompania("Mapfre")).toBe("Mapfre");
  });
  it("vacío devuelve cadena vacía, no undefined", () => {
    expect(normCompania("")).toBe("");
    expect(normCompania(null)).toBe("");
  });
});

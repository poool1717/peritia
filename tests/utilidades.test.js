import { describe, it, expect } from "vitest";
import { fmt, parseCap, norm, findProvincia } from "../lib/dominio/calculo.js";

// fmtE, fmtSmart y normCompania se quedaron en components/Peritia.jsx (no
// forman parte del motor de cálculo strictamente, y Peritia.jsx ya no
// exporta nada) — sin cobertura en esta fase. Ver el informe de cierre.

describe("fmt — formato de importes en español", () => {
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
  it("valores no numéricos se tratan como 0", () => {
    expect(fmt(null)).toBe("0,00");
    expect(fmt(undefined)).toBe("0,00");
    expect(fmt("abc")).toBe("0,00");
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

  // DT-24, CERRADA. El Sprint 4 dejó aquí un test de caracterización fijando
  // que "6.000,00 €" devolvía 6 en vez de 6000, con la instrucción de anotar
  // sin implementar. Un expediente real (ver tests/caso-real-01.test.js)
  // demostró después que la prioridad era más alta de lo que parecía: con el
  // capital a 6 € la regla proporcional inventa un infraseguro del 99,9 % y
  // la indemnización propuesta cae de 463,59 € a 0,52 €, sin ningún mensaje
  // de error. Corregido: parseCap aísla la cifra del texto que la rodea antes
  // de decidir el formato.
  it("el símbolo de euro ya no rompe la cifra", () => {
    expect(parseCap("6.000,00 €")).toBe(6000);
    expect(parseCap(" 12.500,50 € ")).toBe(12500.5);
  });

  // La póliza real no escribe el símbolo: escribe la palabra entera.
  it("la palabra «euros» tampoco la rompe", () => {
    expect(parseCap("6.000,00 euros")).toBe(6000);
    expect(parseCap("1.388.139,45 euros")).toBe(1388139.45);
    expect(parseCap("561.545,08 euros")).toBe(561545.08);
    expect(parseCap("0,00 euros")).toBe(0);
  });

  // Se coge el grupo de dígitos más largo, no el primero.
  it("un número suelto delante no despista a la función", () => {
    expect(parseCap("Pág. 11: 6.000,00 euros")).toBe(6000);
  });

  it("un texto sin cifras sigue dando 0", () => {
    expect(parseCap("sin especificar")).toBe(0);
    expect(parseCap("No")).toBe(0);
  });
});

describe("findProvincia — la provincia llega escrita de cualquier manera", () => {
  // El campo Provincia es de texto libre y lo rellena la IA desde el encargo.
  // La comparación era exacta contra la lista, así que un encargo real que
  // dice "GERONA" no encontraba "Girona" y el cálculo caía a la tabla de
  // precios genérica "Otras" sin avisar de nada.
  it("reconoce la provincia en mayúsculas y con el nombre en castellano", () => {
    expect(findProvincia("GERONA").v).toBe("17");
    expect(findProvincia("Gerona").v).toBe("17");
    expect(findProvincia("GIRONA").v).toBe("17");
    expect(findProvincia("BARCELONA").v).toBe("08");
    expect(findProvincia("LERIDA").v).toBe("25");
  });
  it("ignora tildes y espacios sobrantes", () => {
    expect(findProvincia("  malaga ").v).toBe("29");
    expect(findProvincia("Málaga").v).toBe("29");
  });
  it("acepta también el código de dos dígitos", () => {
    expect(findProvincia("17").v).toBe("17");
  });
  it("entiende los nombres alternativos", () => {
    expect(findProvincia("Tenerife").v).toBe("38");
    expect(findProvincia("Islas Baleares").v).toBe("07");
  });
  it("devuelve null si la provincia de verdad no está, en vez de un dato equivocado", () => {
    expect(findProvincia("Cuenca")).toBe(null);
    expect(findProvincia("")).toBe(null);
    expect(findProvincia(null)).toBe(null);
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

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { peritoDesdePerfil, cambiosPerfil, firmarEncargo, sinDatosDePerito } from "../lib/dominio/perito.js";
import { buildWordHTML, buildPDFHTML } from "../components/Peritia.jsx";

// I-2. En 114 de 118 encargos reales legibles, el campo "Perito" trae el
// gabinete ("GABINETE DE VALORACIONES PERICIA"), no la persona que firma.

const GABINETE = "GABINETE DE VALORACIONES PERICIA";
const perfil = { nombre: "Agustí Oliver Queralt", telefono: "684 000 000", dni: "B00000000" };

describe("de dónde salen los datos del perito", () => {
  it("la extracción del encargo no conserva perito ni teléfono del perito", () => {
    const extraido = { numReferencia: "9705000001", asegurado: "X", perito: GABINETE, telPerito: "902902902" };
    const enc = sinDatosDePerito(extraido);
    expect(enc).toEqual({ numReferencia: "9705000001", asegurado: "X" });
  });

  it("la ventana de exportación se rellena con el perfil", () => {
    expect(peritoDesdePerfil(perfil)).toEqual({ nombre: "Agustí Oliver Queralt", telefono: "684 000 000", dni: "B00000000" });
  });

  it("sin perfil, los campos quedan vacíos para que el perito los escriba (nunca el gabinete)", () => {
    expect(peritoDesdePerfil({})).toEqual({ nombre: "", telefono: "", dni: "" });
    expect(peritoDesdePerfil(null)).toEqual({ nombre: "", telefono: "", dni: "" });
  });
});

describe("informe exportado con los datos del perfil", () => {
  it("cabecera, introducción y firma llevan al perito del perfil (Word y PDF)", () => {
    const encargoExtraido = sinDatosDePerito({ numReferencia: "9705000001", tipoEncargo: "PERITACION", perito: GABINETE });
    const c = { encargo: firmarEncargo(encargoExtraido, perfil), s1: {}, s2: {}, s3: {}, s4: {}, anexos: {} };
    for (const h of [buildWordHTML(c), buildPDFHTML(c, c.encargo.dniPerito)]) {
      // E5 (revisión del informe de prueba 27603166): una sola forma de
      // nombrar al perito, sin tratamiento ("Don") ni género.
      expect(h).toContain("emitido por Agustí Oliver Queralt, en calidad de perito");
      expect(h).not.toContain("perito Don");
      expect(h).toContain("684 000 000");
      // E9: el DNI está en los dos formatos (antes solo en el PDF).
      expect(h).toContain("DNI: B00000000");
      // La cabecera del gabinete ("GABINETE DE VALORACIONES PERICIALES") es
      // correcta; lo que no puede ser el gabinete es el perito.
      expect(h).not.toMatch(/emitido por GABINETE/);
      expect(h).not.toMatch(/Perito:\s*(<[^>]+>\s*)*GABINETE/);
    }
  });
});

describe("guardar el perfil al exportar", () => {
  it("solo actualiza lo que ha cambiado", () => {
    expect(cambiosPerfil(perfil, { ...perfil, telefono: "600 111 222" })).toEqual({ telefono: "600 111 222" });
    expect(cambiosPerfil(perfil, perfil)).toEqual({});
  });
  it("el primer informe rellena un perfil vacío", () => {
    expect(cambiosPerfil({}, perfil)).toEqual(perfil);
  });
  it("ignora espacios sobrantes al comparar", () => {
    expect(cambiosPerfil(perfil, { ...perfil, nombre: "  Agustí Oliver Queralt " })).toEqual({});
  });
  it("deja constancia en el expediente de quién firmó, sin tocar el resto del encargo", () => {
    const enc = firmarEncargo({ numReferencia: "9705000001", asegurado: "X" }, perfil);
    expect(enc).toEqual({ numReferencia: "9705000001", asegurado: "X", perito: "Agustí Oliver Queralt", telPerito: "684 000 000", dniPerito: "B00000000" });
  });
});

describe("guardia I-2 en Peritia.jsx", () => {
  const src = readFileSync(new URL("../components/Peritia.jsx", import.meta.url), "utf8");
  it("el prompt del encargo ya no pide el perito", () => {
    expect(src).not.toMatch(/"perito":\s*"nombre completo del perito"/);
    expect(src).not.toMatch(/"telPerito":\s*"telefono del perito"/);
  });
  it("la ventana de exportación ya no toma el perito del encargo", () => {
    expect(src).not.toMatch(/useState\(cData\.encargo\?\.perito/);
    expect(src).toMatch(/peritoDesdePerfil\(perfil\)/);
  });
  it("Word también guarda los datos del perito (antes solo el PDF)", () => {
    expect(src).toMatch(/exportWord\(cDataWithPerito\(\)\);[^\n]*onExported\?\.\(\{nombre:perito/);
  });
  it("el perfil se lee al iniciar sesión", () => {
    expect(src).toMatch(/perfiles\?id=eq\.\$\{u\.id\}&select=nombre,dni,telefono/);
  });
});

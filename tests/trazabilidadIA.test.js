import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  huellaDocumento, registroExtraccionEncargo, registroExtraccionPartidas, anadirExtraccion,
  compararEncargo, compararPartidas, resumenTrazabilidad, MAX_EXTRACCIONES,
} from "../lib/dominio/trazabilidadIA.js";
import { filaInforme } from "../lib/dominio/guardado.js";
import { aplicarEscrituraTardia } from "../lib/dominio/escrituraTardia.js";

// I-10. Para validar con expedientes reales hay que poder responder: ¿qué
// extrajo la IA?, ¿qué cambió el perito?, ¿cuántas partidas tocó y en qué
// valores?, ¿resultado original frente a final?

const CAMPOS = ["compania", "numReferencia", "asegurado", "capitalContinente", "franquicia", "garantia"];
const sha = buf => createHash("sha256").update(Buffer.from(buf)).digest("hex");
const archivo = (nombre, contenido) => ({ name: nombre, size: contenido.length, arrayBuffer: async () => new TextEncoder().encode(contenido).buffer });

describe("lo que propuso la IA al leer encargo y póliza", () => {
  it("se identifica el documento original sin guardarlo (nombre, tamaño, SHA-256)", async () => {
    const h = await huellaDocumento(archivo("9705292172 encargo.pdf", "%PDF-1.4 encargo"), sha);
    expect(h).toEqual({ nombre: "9705292172 encargo.pdf", tamano: 16, sha256: sha(new TextEncoder().encode("%PDF-1.4 encargo")) });
  });

  it("si no se puede calcular el hash, la huella sigue sirviendo (sha256 null)", async () => {
    const h = await huellaDocumento(archivo("e.pdf", "x"), async () => { throw new Error("sin crypto"); });
    expect(h).toEqual({ nombre: "e.pdf", tamano: 1, sha256: null });
    expect(await huellaDocumento(null, sha)).toBe(null);
  });

  it("guarda la respuesta de la IA y la propuesta revisable, separadas", () => {
    const propuesta = { compania: "AXA Seguros", numReferencia: "9705292172", asegurado: "X", capitalContinente: "230000", franquicia: "0", garantia: "Daños por agua", descripciones: { DAGUA: "texto largo" } };
    const r = registroExtraccionEncargo({ fecha: "2026-10-07T10:00:00Z", modelo: "claude-sonnet-4-6",
      documentos: { encargo: { nombre: "e.pdf" }, poliza: null }, encargoIA: { numReferencia: "9705292172", causa: "Daños Agua" }, polizaIA: {}, propuesta, campos: CAMPOS });
    expect(r.encargoIA).toEqual({ numReferencia: "9705292172", causa: "Daños Agua" });
    expect(r.polizaIA).toBe(null);                      // póliza no leída: null, no {}
    expect(r.propuesta).toEqual({ compania: "AXA Seguros", numReferencia: "9705292172", asegurado: "X", capitalContinente: "230000", franquicia: "0", garantia: "Daños por agua" });
    expect(r.propuesta.descripciones).toBeUndefined();  // ya está en polizaIA; no se duplica
    expect(r.modelo).toBe("claude-sonnet-4-6");
  });

  it("¿qué cambió el perito en el encargo?", () => {
    const propuesta = { compania: "AXA Seguros", numReferencia: "9705292172", capitalContinente: "230000", franquicia: "0" };
    const final = { ...propuesta, capitalContinente: "250000", franquicia: "0,00", trazaIA: {} };
    expect(compararEncargo(propuesta, final, ["compania", "numReferencia", "capitalContinente", "franquicia"]))
      .toEqual([{ campo: "capitalContinente", ia: "230000", final: "250000" }, { campo: "franquicia", ia: "0", final: "0,00" }]);
  });
});

describe("tabla de partidas generada por la IA frente a la tabla final", () => {
  const ia = [
    { id: 1, oficio: "FONTANERÍA", desc: "Localizar y reparar fuga", uds: 1, p: 247.5, iva: 21, ivaOn: true, cobertura: true },
    { id: 2, oficio: "PINTURA", desc: "Pintura plástica", uds: 12, p: 10, iva: 0, ivaOn: false, cobertura: true },
    { id: 3, oficio: "LIMPIEZA", desc: "Limpieza final", uds: 1, p: 45, iva: 0, ivaOn: false, cobertura: true },
  ];

  it("cuenta partidas sin cambios, modificadas (con sus valores), eliminadas y añadidas", () => {
    const final = [
      { ...ia[0] },                                   // igual
      { ...ia[1], uds: 15, p: 9.5 },                  // corregida por el perito
      { id: 9, oficio: "ALBAÑILERÍA", desc: "Repicado", uds: 2, p: 14 }, // añadida a mano
    ];                                                // la 3 se borró
    const r = compararPartidas(ia, final);
    expect(r.totalIA).toBe(3);
    expect(r.sinCambios).toEqual([1]);
    expect(r.modificadas).toEqual([{ id: 2, cambios: { uds: { ia: 12, final: 15 }, p: { ia: 10, final: 9.5 } } }]);
    expect(r.eliminadas).toEqual([3]);
    expect(r.anadidas).toEqual([9]);
  });

  it("no cuenta como cambio un número que llega como texto con el mismo valor", () => {
    expect(compararPartidas([ia[2]], [{ ...ia[2], uds: "1", p: "45" }]).sinCambios).toEqual([3]);
  });

  it("el registro guarda las partidas tal como entraron en la tabla y las facturas leídas por su dirección", () => {
    const r = registroExtraccionPartidas({ tipo: "facturas", fecha: "f", modelo: "m",
      documentos: [{ id: 7, name: "fra fontanería.pdf", url: "https://storage/f.pdf", file: { pesado: true } }],
      partidas: [{ ...ia[0], u: "ud", basura: "x" }] });
    expect(r.documentos).toEqual([{ id: 7, nombre: "fra fontanería.pdf", url: "https://storage/f.pdf" }]); // sin el archivo
    expect(r.partidas[0]).toEqual(ia[0]);
  });

  it("guarda todas las extracciones (última al final) hasta un máximo", () => {
    let t;
    for (let i = 0; i < MAX_EXTRACCIONES + 3; i++) t = anadirExtraccion(t, { n: i });
    expect(t.extracciones).toHaveLength(MAX_EXTRACCIONES);
    expect(t.extracciones.at(-1)).toEqual({ n: MAX_EXTRACCIONES + 2 });
  });
});

describe("expediente completo: original frente a final", () => {
  it("responde a las preguntas de la validación con el último registro", () => {
    const ext = registroExtraccionPartidas({ tipo: "baremo", fecha: "f", modelo: "m", partidas: [{ id: 1, desc: "Pintura", uds: 12, p: 10 }] });
    const caso = {
      encargo: { compania: "AXA Seguros", numReferencia: "9705000001", trazaIA: { propuesta: { compania: "AXA Seguros", numReferencia: "9705000002" } } },
      s3: { partidas: [{ id: 1, desc: "Pintura", uds: 20, p: 10 }], trazaIA: anadirExtraccion(undefined, ext) },
    };
    const r = resumenTrazabilidad(caso);
    expect(r.encargo).toEqual([{ campo: "numReferencia", ia: "9705000002", final: "9705000001" }]);
    expect(r.partidas.tipo).toBe("baremo");
    expect(r.partidas.modificadas).toEqual([{ id: 1, cambios: { uds: { ia: 12, final: 20 } } }]);
  });

  it("expedientes sin trazabilidad (anteriores o creados sin documentos) no rompen nada", () => {
    expect(resumenTrazabilidad({ encargo: {}, s3: {} })).toEqual({ encargo: null, partidas: null });
  });

  it("la trazabilidad viaja con el expediente al guardarlo (columnas existentes, sin migración)", () => {
    const caso = { id: "local_1", encargo: { numReferencia: "1", trazaIA: { propuesta: {} } }, s3: { trazaIA: { extracciones: [] } } };
    const fila = filaInforme(caso);
    expect(fila.encargo.trazaIA).toEqual({ propuesta: {} });
    expect(fila.s3.trazaIA).toEqual({ extracciones: [] });
  });

  it("una tabla de la IA que llega tarde conserva el historial y las correcciones hechas mientras tanto", () => {
    const previa = registroExtraccionPartidas({ tipo: "baremo", fecha: "1", modelo: "m", partidas: [] });
    const actual = { id: "A", s3: { textoRaw: "escrito durante la espera", trazaIA: { extracciones: [previa] } } };
    const nueva = registroExtraccionPartidas({ tipo: "facturas", fecha: "2", modelo: "m", partidas: [{ id: 5, desc: "x" }] });
    const r = aplicarEscrituraTardia({ actual, idOrigen: "A", editorAbierto: true, clave: "s3",
      fn: s3 => ({ ...s3, partidas: [{ id: 5, desc: "x" }], trazaIA: anadirExtraccion(s3.trazaIA, nueva) }) });
    expect(r.s3.textoRaw).toBe("escrito durante la espera");
    expect(r.s3.trazaIA.extracciones.map(e => e.tipo)).toEqual(["baremo", "facturas"]);
  });
});

describe("guardia I-10 en Peritia.jsx", () => {
  const src = readFileSync(new URL("../components/Peritia.jsx", import.meta.url), "utf8");
  it("la extracción del encargo deja trazaIA con la propuesta antes de la revisión", () => {
    expect(src).toMatch(/setData\(\{\.\.\.propuesta, trazaIA: registroExtraccionEncargo\(/);
    expect(src).toMatch(/encargoIA: rawParsed, polizaIA: pol, propuesta, campos: CAMPOS_ENCARGO/);
  });
  it("las dos tablas de la IA de la Sección 3 se registran", () => {
    expect(src).toMatch(/setLateTablaIA\(rows\.map\(sanP\), "baremo", \[\], huellaAntes\)/);
    expect(src).toMatch(/setLateTablaIA\(all\.map\(sanP\), "facturas", leidas, huellaAntes\)/);
    expect(src).not.toMatch(/setLate\(\{partidas:(rows|all)\.map\(sanP\)\}\)/);
  });
});

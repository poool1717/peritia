import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { huellaTabla, aplicarTablaIA, mensajeTrasTablaIA } from "../lib/dominio/tablaIA.js";
import { registroExtraccionPartidas, resumenTrazabilidad } from "../lib/dominio/trazabilidadIA.js";
import { aplicarEscrituraTardia } from "../lib/dominio/escrituraTardia.js";

// P-28. "Extraer tabla" / "Generar tabla" tardan segundos y la tabla sigue
// editable. Antes, al volver la IA, la tabla se sustituía siempre y se perdía
// lo que el perito había corregido durante la espera.

const tablaInicial = [
  { id: 1, oficio: "PINTURA", desc: "Pintura plástica en paredes", uds: 12, p: 10, iva: 0, ivaOn: false, cobertura: true },
  { id: 2, oficio: "ALBAÑILERÍA", desc: "Repicado y saneado", uds: 2, p: 14, iva: 0, ivaOn: false, cobertura: true },
];
const tablaIA = [
  { id: 101, oficio: "FONTANERÍA", desc: "Localizar y reparar fuga", uds: 1, p: 247.5, iva: 21, ivaOn: true, cobertura: true },
  { id: 102, oficio: "PINTURA", desc: "Pintado zona afectada", uds: 1, p: 1280, iva: 21, ivaOn: true, cobertura: true },
];

// Réplica del recorrido real (Sec3 + ReportEditor), con las funciones de verdad:
//  1. al pulsar el botón se toma la huella de la tabla en pantalla;
//  2. mientras la IA trabaja, el expediente cambia (o no);
//  3. la respuesta llega por la escritura tardía del editor (updLatest) y la
//     Sección 3 decide qué aplicar y qué mensaje enseñar.
const recorrido = ({ duranteLaEspera = c => c, tipo = "facturas", avisosExtra = "" } = {}) => {
  let activo = { id: "A", s3: { textoRaw: "Rotura de tubería", partidas: tablaInicial, facturas: [{ id: 7, name: "fra.pdf" }] } };
  const huellaAntes = huellaTabla(activo.s3.partidas);          // 1. clic
  activo = duranteLaEspera(activo);                              // 2. espera
  const registro = registroExtraccionPartidas({ tipo, fecha: "2026-10-07T10:00:00Z", modelo: "claude-sonnet-4-6", documentos: [], partidas: tablaIA });
  let aplicada;                                                  // 3. vuelve la IA
  const fn = s3 => { const r = aplicarTablaIA({ s3, huellaAntes, partidas: tablaIA, registro }); aplicada = r.aplicada; return r.s3; };
  const nuevo = aplicarEscrituraTardia({ actual: activo, idOrigen: "A", editorAbierto: true, clave: "s3", fn });
  if (nuevo) activo = nuevo;
  const mensaje = mensajeTrasTablaIA({ aplicada, tipo, extra: avisosExtra, mensajeNormal: null });
  return { activo, aplicada, mensaje };
};
const editar = fn => c => ({ ...c, s3: { ...c.s3, partidas: fn(c.s3.partidas) } });

describe("tabla sin cambios durante la espera", () => {
  it("la respuesta de la IA sustituye la tabla, como hasta ahora", () => {
    const { activo, aplicada, mensaje } = recorrido();
    expect(aplicada).toBe(true);
    expect(activo.s3.partidas).toEqual(tablaIA);
    expect(mensaje).toBe(null); // sin aviso de "no sustituida"
  });

  it("subir una factura o escribir texto durante la espera no impide sustituirla", () => {
    const { activo, aplicada } = recorrido({ duranteLaEspera: c => ({ ...c, s3: { ...c.s3, textoRaw: "otro texto", facturas: [{ id: 7, name: "fra.pdf", url: "https://storage/fra.pdf" }] } }) });
    expect(aplicada).toBe(true);
    expect(activo.s3.partidas).toEqual(tablaIA);
    expect(activo.s3.facturas[0].url).toBe("https://storage/fra.pdf"); // y no se pierde la dirección (DT-13)
  });

  it("cambiar una partida y dejarla como estaba no cuenta como cambio", () => {
    const { aplicada } = recorrido({ duranteLaEspera: editar(ps => ps.map(p => ({ ...p }))) });
    expect(aplicada).toBe(true);
  });
});

describe("tabla modificada durante la espera", () => {
  const casos = {
    "corrige un valor": editar(ps => ps.map(p => p.id === 1 ? { ...p, uds: 15 } : p)),
    "añade una fila": editar(ps => [...ps, { id: 3, oficio: "LIMPIEZA", desc: "Limpieza final", uds: 1, p: 45 }]),
    "borra una fila": editar(ps => ps.filter(p => p.id !== 2)),
    "cambia el orden": editar(ps => [ps[1], ps[0]]),
    "quita la cobertura de una partida": editar(ps => ps.map(p => p.id === 2 ? { ...p, cobertura: false } : p)),
  };

  for (const [nombre, cambio] of Object.entries(casos)) {
    it(`si el perito ${nombre}, la IA NO sustituye la tabla y su cambio se conserva`, () => {
      const esperada = cambio({ s3: { partidas: tablaInicial } }).s3.partidas;
      const { activo, aplicada } = recorrido({ duranteLaEspera: cambio });
      expect(aplicada).toBe(false);
      expect(activo.s3.partidas).toEqual(esperada);
    });
  }

  it("el resto de la Sección 3 tampoco se toca", () => {
    const { activo } = recorrido({ duranteLaEspera: editar(ps => ps.map(p => p.id === 1 ? { ...p, uds: 15 } : p)) });
    expect(activo.s3.textoRaw).toBe("Rotura de tubería");
    expect(activo.s3.facturas).toEqual([{ id: 7, name: "fra.pdf" }]);
  });
});

describe("trazabilidad (I-10) cuando la tabla no se sustituye", () => {
  it("la propuesta de la IA queda registrada, completa y marcada como no aplicada", () => {
    const { activo } = recorrido({ duranteLaEspera: editar(ps => ps.map(p => p.id === 1 ? { ...p, uds: 15 } : p)) });
    const ext = activo.s3.trazaIA.extracciones;
    expect(ext).toHaveLength(1);
    expect(ext[0].aplicada).toBe(false);
    expect(ext[0].tipo).toBe("facturas");
    expect(ext[0].partidas.map(p => p.id)).toEqual([101, 102]);
    expect(ext[0].partidas[0].p).toBe(247.5);
  });

  it("cuando sí se aplica, queda marcada como aplicada", () => {
    expect(recorrido().activo.s3.trazaIA.extracciones[0].aplicada).toBe(true);
  });

  it("la comparación IA frente a final usa la última propuesta aplicada, no la descartada", () => {
    // 1ª extracción aplicada; el perito corrige; 2ª extracción llega con la tabla cambiada.
    let { activo } = recorrido();
    activo = { ...activo, s3: { ...activo.s3, partidas: activo.s3.partidas.map(p => p.id === 101 ? { ...p, p: 200 } : p) } };
    const huellaAntes = huellaTabla(tablaIA); // el clic se hizo antes de la corrección
    const registro = registroExtraccionPartidas({ tipo: "facturas", fecha: "2", modelo: "m", partidas: [{ id: 201, desc: "otra" }] });
    activo = { ...activo, s3: aplicarTablaIA({ s3: activo.s3, huellaAntes, partidas: [{ id: 201, desc: "otra" }], registro }).s3 };
    const r = resumenTrazabilidad(activo);
    expect(activo.s3.trazaIA.extracciones.map(e => e.aplicada)).toEqual([true, false]);
    expect(r.partidas.modificadas).toEqual([{ id: 101, cambios: { p: { ia: 247.5, final: 200 } } }]);
    expect(r.partidas.eliminadas).toEqual([]);
  });
});

describe("aviso al perito y posibilidad de repetir", () => {
  it("si la tabla no se sustituye, el aviso lo dice, confirma que sus cambios se conservan y cómo sustituirla", () => {
    const { mensaje } = recorrido({ duranteLaEspera: editar(ps => ps.slice(1)) });
    expect(mensaje.tipo).toBe("aviso");
    expect(mensaje.texto).toMatch(/no se ha sustituido/);
    expect(mensaje.texto).toMatch(/Tus cambios se conservan/);
    expect(mensaje.texto).toMatch(/pulsa de nuevo «Extraer tabla»/);
  });

  it("en «Generar tabla» el aviso nombra ese botón", () => {
    const { mensaje } = recorrido({ tipo: "baremo", duranteLaEspera: editar(ps => ps.slice(1)) });
    expect(mensaje.texto).toMatch(/pulsa de nuevo «Generar tabla de valoración»/);
  });

  it("los demás avisos de la operación (facturas perdidas o grandes) no se pierden", () => {
    const { mensaje } = recorrido({ avisosExtra: "fra.pdf: se perdió al guardar el expediente.", duranteLaEspera: editar(ps => ps.slice(1)) });
    expect(mensaje.texto).toMatch(/fra\.pdf: se perdió/);
  });

  it("volver a pulsar con la tabla ya editada sí la sustituye", () => {
    let { activo } = recorrido({ duranteLaEspera: editar(ps => ps.slice(1)) });
    const huellaAntes = huellaTabla(activo.s3.partidas); // nuevo clic, sin tocar nada después
    const registro = registroExtraccionPartidas({ tipo: "facturas", fecha: "2", modelo: "m", partidas: tablaIA });
    const r = aplicarTablaIA({ s3: activo.s3, huellaAntes, partidas: tablaIA, registro });
    expect(r.aplicada).toBe(true);
    expect(r.s3.partidas).toEqual(tablaIA);
  });

  it("si la respuesta se descarta (otro expediente o editor cerrado), no se enseña ningún aviso", () => {
    expect(mensajeTrasTablaIA({ aplicada: undefined, tipo: "facturas", mensajeNormal: { tipo: "aviso", texto: "x" } })).toBe(null);
  });
});

describe("guardia P-28 en Peritia.jsx", () => {
  const src = readFileSync(new URL("../components/Peritia.jsx", import.meta.url), "utf8");
  const cuerpo = nombre => { const i = src.indexOf(`const ${nombre} = async`); return src.slice(i, src.indexOf("\n  };", i)); };

  for (const [fn, tipo] of [["extractFromFacturas", "facturas"], ["genFromBaremo", "baremo"]]) {
    it(`${fn}: toma la huella ANTES de llamar a la IA y enseña el mensaje de la regla`, () => {
      const c = cuerpo(fn);
      const huella = c.indexOf("const huellaAntes = huellaTabla(data.partidas)");
      expect(huella).toBeGreaterThan(-1);
      expect(huella).toBeLessThan(c.indexOf("callClaude("));
      expect(c).toMatch(new RegExp(`const aplicada = setLateTablaIA\\([^;]*"${tipo}"[^;]*huellaAntes\\)`));
      expect(c).toMatch(/setGenMsg\(mensajeTrasTablaIA\(\{aplicada, tipo:"/);
    });
  }

  it("la escritura tardía de la tabla pasa por aplicarTablaIA (no sustituye a ciegas)", () => {
    expect(src).toMatch(/const r = aplicarTablaIA\(\{s3, huellaAntes, partidas, registro\}\)/);
    expect(src).not.toMatch(/s3 => \(\{\.\.\.s3, partidas, trazaIA/);
  });
});

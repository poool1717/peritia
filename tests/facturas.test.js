import { describe, it, expect, vi } from "vitest";
import {
  tieneArchivoEnMemoria, facturaPerdida, facturaSec3ParaExportar, fuentesDeFacturas,
} from "../lib/dominio/facturas.js";

// Simula exactamente lo que hace la base de datos: el expediente se guarda
// como JSON y se vuelve a leer. Un `File`/`Blob` sale de ahí convertido en `{}`.
const guardarYRecargar = obj => JSON.parse(JSON.stringify(obj));

const pdf = () => new Blob(["%PDF-1.4 factura"], { type: "application/pdf" });
const URL_STORAGE = "https://x.supabase.co/storage/v1/object/public/anexos/u/i/sec3-facturas/f.pdf";

describe("DT-13 · el fallo, reproducido", () => {
  it("un archivo en memoria sale de la base de datos convertido en {}", () => {
    const antes = { id: 1, name: "VIADER 33-2025.pdf", size: 2019727, file: pdf() };
    const despues = guardarYRecargar(antes);
    expect(despues.file).toEqual({});
    // Y {} es "verdadero": el código antiguo lo tomaba por un archivo.
    expect(!!despues.file).toBe(true);
  });

  it("el código antiguo de la exportación reventaba con esa factura", () => {
    const f = guardarYRecargar({ id: 1, name: "VIADER.pdf", file: pdf() });
    // Réplica literal de la línea antigua de allFacturasOf:
    //   url: f.url || (f.file ? URL.createObjectURL(f.file) : null)
    const crearUrl = () => { throw new TypeError("Failed to execute 'createObjectURL'"); };
    expect(() => f.url || (f.file ? crearUrl(f.file) : null)).toThrow();
  });

  it("con la función nueva, la misma factura no revienta: se marca como perdida", () => {
    const f = guardarYRecargar({ id: 1, name: "VIADER.pdf", file: pdf() });
    const crearUrl = vi.fn();
    const r = facturaSec3ParaExportar(f, "Factura", crearUrl);
    expect(crearUrl).not.toHaveBeenCalled();
    expect(r.url).toBe(null);
    expect(r.perdida).toBe(true);
    expect(r.name).toBe("VIADER.pdf");
  });
});

describe("tieneArchivoEnMemoria — un archivo de verdad, no lo que queda de él", () => {
  it("reconoce un archivo recién adjuntado", () => {
    expect(tieneArchivoEnMemoria({ file: pdf() })).toBe(true);
  });
  it("no se deja engañar por el {} de un archivo guardado y recargado", () => {
    expect(tieneArchivoEnMemoria({ file: {} })).toBe(false);
  });
  it("aguanta facturas sin archivo o vacías", () => {
    expect(tieneArchivoEnMemoria({})).toBe(false);
    expect(tieneArchivoEnMemoria(null)).toBe(false);
    expect(tieneArchivoEnMemoria(undefined)).toBe(false);
  });
});

describe("facturaPerdida — cuándo hay que avisar al perito", () => {
  it("una factura subida a Storage no está perdida, aunque se recargue", () => {
    const f = guardarYRecargar({ name: "a.pdf", url: URL_STORAGE, file: pdf() });
    expect(facturaPerdida(f)).toBe(false);
  });
  it("una recién adjuntada y aún sin subir tampoco", () => {
    expect(facturaPerdida({ name: "a.pdf", file: pdf() })).toBe(false);
  });
  it("una guardada antes de la corrección, sin url, sí: hay que volver a adjuntarla", () => {
    expect(facturaPerdida(guardarYRecargar({ name: "a.pdf", size: 10, file: pdf() }))).toBe(true);
  });
});

describe("facturaSec3ParaExportar — lo que va al PDF y al Word", () => {
  it("usa la url de Storage cuando existe, sin crear otra", () => {
    const crearUrl = vi.fn();
    const r = facturaSec3ParaExportar({ name: "a.pdf", url: URL_STORAGE, type: "application/pdf" }, "Factura", crearUrl);
    expect(r.url).toBe(URL_STORAGE);
    expect(r.perdida).toBe(false);
    expect(crearUrl).not.toHaveBeenCalled();
  });

  it("si solo está en memoria, crea una url temporal desde el archivo", () => {
    const blob = pdf();
    const crearUrl = vi.fn(() => "blob:local/123");
    const r = facturaSec3ParaExportar({ name: "a.pdf", file: blob }, "Presupuesto", crearUrl);
    expect(crearUrl).toHaveBeenCalledWith(blob);
    expect(r.url).toBe("blob:local/123");
    expect(r.type).toBe("application/pdf"); // lo toma del archivo si no venía
    expect(r.tipo).toBe("Presupuesto");
  });

  it("nunca pasa a crearUrl algo que no sea un archivo", () => {
    const crearUrl = vi.fn(x => { if (!(x instanceof Blob)) throw new TypeError("no es un Blob"); return "blob:ok"; });
    for (const f of [{ file: {} }, { file: null }, {}, { file: "texto" }])
      expect(() => facturaSec3ParaExportar(f, "Factura", crearUrl)).not.toThrow();
    expect(crearUrl).not.toHaveBeenCalled();
  });
});

describe("fuentesDeFacturas — la IA no se salta facturas en silencio", () => {
  it("separa las que se pueden leer de las perdidas", () => {
    const enMemoria = { id: 1, name: "a.pdf", file: pdf() };
    const enStorage = guardarYRecargar({ id: 2, name: "b.pdf", url: URL_STORAGE, file: pdf() });
    const perdida   = guardarYRecargar({ id: 3, name: "c.pdf", file: pdf() });
    const { disponibles, perdidas } = fuentesDeFacturas([enMemoria, enStorage, perdida]);
    expect(disponibles.map(d => [d.factura.id, d.fuente])).toEqual([[1, "memoria"], [2, "url"]]);
    expect(perdidas.map(p => p.name)).toEqual(["c.pdf"]);
  });

  it("prefiere el archivo en memoria a descargar de Storage lo que ya tiene", () => {
    const f = { id: 1, name: "a.pdf", url: URL_STORAGE, file: pdf() };
    expect(fuentesDeFacturas([f]).disponibles[0].fuente).toBe("memoria");
  });

  it("aguanta que no haya facturas", () => {
    expect(fuentesDeFacturas(undefined)).toEqual({ disponibles: [], perdidas: [] });
    expect(fuentesDeFacturas([])).toEqual({ disponibles: [], perdidas: [] });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// La carrera que casi deja el arreglo sin efecto.
//
// El flujo normal es: adjuntar la factura y pulsar enseguida "Extraer tabla".
// La subida a Storage termina antes que la IA. Si la IA guarda al volver con
// los datos del momento en que se pulsó el botón ({...data, partidas}), esos
// datos todavía no tenían la `url`: se borra, y la factura vuelve a perderse
// al recargar. Aquí se simula esa secuencia con un almacén mínimo que se
// comporta como el editor: `estado` es el expediente vivo.
// ─────────────────────────────────────────────────────────────────────────────
describe("la carrera subida / IA no borra la url de la factura", () => {
  const montar = () => {
    let estado = { facturas: [], partidas: [], textoAI: "" };
    return {
      get: () => estado,
      onChange: nuevo => { estado = nuevo; },                        // escribe lo que le den
      onPatch: fn => { estado = fn(estado); },                       // aplica sobre el más reciente
    };
  };

  const secuencia = escribirTarde => {
    const ed = montar();
    // 1. Adjuntar
    ed.onChange({ ...ed.get(), facturas: [{ id: 1, name: "VIADER.pdf", file: pdf() }] });
    // 2. Pulsar "Extraer tabla": la función captura `data` en este momento
    const dataAlPulsar = ed.get();
    // 3. Termina la subida (siempre vía onPatch)
    ed.onPatch(s3 => ({ ...s3, facturas: s3.facturas.map(f => f.id === 1 ? { ...f, url: URL_STORAGE } : f) }));
    // 4. Vuelve la IA con las partidas
    escribirTarde(ed, dataAlPulsar, { partidas: [{ desc: "Pintura y papel", p: 383.13 }] });
    return guardarYRecargar(ed.get());
  };

  it("con la forma antigua ({...data, partidas}) la url se pierde", () => {
    const final = secuencia((ed, data, patch) => ed.onChange({ ...data, ...patch }));
    expect(final.partidas).toHaveLength(1);
    expect(final.facturas[0].url).toBeUndefined();
    expect(facturaPerdida(final.facturas[0])).toBe(true);
  });

  it("con la forma nueva (setLate → onPatch) se conservan las dos cosas", () => {
    const final = secuencia((ed, data, patch) => ed.onPatch(s3 => ({ ...s3, ...patch })));
    expect(final.partidas).toHaveLength(1);
    expect(final.facturas[0].url).toBe(URL_STORAGE);
    expect(facturaPerdida(final.facturas[0])).toBe(false);
  });
});

// Guardia sobre el código: si alguien vuelve a los patrones que causaron
// DT-13, se pone en rojo y dice dónde. Es un test sobre el texto porque la
// interfaz no se puede probar sin montar React (ver tests/README.md).
describe("guardia DT-13 en Peritia.jsx", async () => {
  const { readFileSync } = await import("node:fs");
  const src = readFileSync(new URL("../components/Peritia.jsx", import.meta.url), "utf8");
  const lineas = src.split("\n");
  const buscar = re => lineas.map((l, i) => re.test(l) ? `línea ${i + 1}: ${l.trim().slice(0, 110)}` : null).filter(Boolean);

  it("nadie trata un `file` como archivo solo porque existe", () => {
    expect(buscar(/\.file\s*\?\s*URL\.createObjectURL/)).toEqual([]);
  });
  it("la IA no se salta facturas sin decirlo", () => {
    expect(buscar(/if\s*\(\s*!fac\.file\s*\)\s*continue/)).toEqual([]);
  });
  it("las escrituras tras la IA en la Sección 3 no usan los datos viejos", () => {
    // Solo dentro del componente Sec3. La Sección 2 tiene el mismo patrón en
    // "Redactar con IA", pero no afecta a las facturas: está anotado aparte.
    const ini = lineas.findIndex(l => l.startsWith("const Sec3 = "));
    const fin = lineas.findIndex((l, i) => i > ini && /^const [A-Z][A-Za-z0-9]* = /.test(l));
    expect(ini).toBeGreaterThan(-1);
    const sec3 = lineas.slice(ini, fin);
    const malas = sec3.map((l, i) => /onChange\(\{\.\.\.data,\s*(textoAI:text|partidas:(rows|all)\.map)/.test(l) ? `línea ${ini + i + 1}: ${l.trim()}` : null).filter(Boolean);
    expect(malas).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Ajustes de revisión de la PR #23
// ─────────────────────────────────────────────────────────────────────────────
import { adjuntarUrlsSubidas } from "../lib/dominio/facturas.js";
import { aplicarEscrituraTardia } from "../lib/dominio/escrituraTardia.js";

describe("adjuntarUrlsSubidas — la url llega a su factura y nada más", () => {
  const s3 = { partidas: [{ desc: "x" }], facturas: [{ id: 1, name: "a.pdf", type: "" }, { id: 2, name: "b.pdf", type: "application/pdf" }] };

  it("añade la url a las facturas que siguen en la lista", () => {
    const r = adjuntarUrlsSubidas(s3, [{ id: 1, url: "u1", type: "application/pdf" }]);
    expect(r.s3.facturas[0]).toMatchObject({ id: 1, url: "u1", type: "application/pdf" });
    expect(r.s3.facturas[1].url).toBeUndefined();
    expect(r.s3.partidas).toEqual(s3.partidas);
    expect(r.huerfanas).toEqual([]);
  });

  it("no pisa el tipo que ya tenía la factura", () => {
    const r = adjuntarUrlsSubidas(s3, [{ id: 2, url: "u2", type: "application/octet-stream" }]);
    expect(r.s3.facturas[1].type).toBe("application/pdf");
  });

  it("una factura borrada mientras se subía NO reaparece y su archivo queda marcado como huérfano", () => {
    const r = adjuntarUrlsSubidas(s3, [{ id: 99, url: "u99" }]);
    expect(r.s3.facturas.map(f => f.id)).toEqual([1, 2]);
    expect(r.huerfanas).toEqual(["u99"]);
  });

  it("aguanta una sección vacía", () => {
    expect(adjuntarUrlsSubidas(undefined, [{ id: 1, url: "u" }])).toEqual({ s3: { facturas: [] }, huerfanas: ["u"] });
  });
});

// Réplica literal del final de la subida en la Sección 3 (addFactura), con el
// editor (updLatest) y el borrado de Storage simulados.
describe("carrera subida → borrado de la factura", () => {
  const montar = ({ editorAbierto = true } = {}) => {
    let activo = { id: "A", s3: { facturas: [] } };
    const borrar = vi.fn();
    const onUpdate = u => { activo = u; };
    const updLatest = (clave, fn, idOrigen) => {
      const nuevo = aplicarEscrituraTardia({ actual: activo, idOrigen, editorAbierto, clave, fn });
      if (nuevo) onUpdate(nuevo);
    };
    const onPatch = fn => updLatest("s3", fn, "A");
    const terminarSubida = ok => {                              // literal de addFactura
      let huerfanas = ok.map(o => o.url);
      if (ok.length) onPatch(s3 => { const r = adjuntarUrlsSubidas(s3, ok); huerfanas = r.huerfanas; return r.s3; });
      huerfanas.forEach(url => borrar(url));
    };
    return { get: () => activo, set: a => { activo = a; }, borrar, terminarSubida };
  };

  it("adjuntar, borrar antes de que termine: no queda factura visible y se borra el archivo subido", () => {
    const ed = montar();
    ed.set({ ...ed.get(), s3: { facturas: [{ id: 1, name: "VIADER.pdf", file: pdf() }] } }); // adjuntar
    ed.set({ ...ed.get(), s3: { facturas: [] } });                                           // borrar (aún sin url)
    ed.terminarSubida([{ id: 1, url: URL_STORAGE }]);                                         // termina la subida
    expect(ed.get().s3.facturas).toEqual([]);
    expect(ed.borrar).toHaveBeenCalledWith(URL_STORAGE);
  });

  it("si no se borra, la factura conserva su url y NO se borra nada de Storage", () => {
    const ed = montar();
    ed.set({ ...ed.get(), s3: { facturas: [{ id: 1, name: "VIADER.pdf", file: pdf() }] } });
    ed.terminarSubida([{ id: 1, url: URL_STORAGE }]);
    expect(ed.get().s3.facturas[0].url).toBe(URL_STORAGE);
    expect(ed.borrar).not.toHaveBeenCalled();
  });

  it("de dos facturas, solo se borra el archivo de la que el perito quitó", () => {
    const ed = montar();
    ed.set({ ...ed.get(), s3: { facturas: [{ id: 1, name: "a.pdf" }, { id: 2, name: "b.pdf" }] } });
    ed.set({ ...ed.get(), s3: { facturas: [{ id: 2, name: "b.pdf" }] } }); // quita la 1
    ed.terminarSubida([{ id: 1, url: "u1" }, { id: 2, url: "u2" }]);
    expect(ed.get().s3.facturas).toEqual([{ id: 2, name: "b.pdf", url: "u2", type: undefined }]);
    expect(ed.borrar.mock.calls).toEqual([["u1"]]);
  });

  it("si el editor se cerró durante la subida, no se toca el expediente y no queda archivo huérfano", () => {
    const ed = montar({ editorAbierto: false });
    ed.set({ ...ed.get(), s3: { facturas: [{ id: 1, name: "a.pdf", file: pdf() }] } });
    ed.terminarSubida([{ id: 1, url: "u1" }]);
    expect(ed.get().s3.facturas[0].url).toBeUndefined(); // queda "Sin guardar", visible
    expect(ed.borrar).toHaveBeenCalledWith("u1");
  });
});

describe("guardia de los ajustes de la PR #23 en Peritia.jsx", async () => {
  const { readFileSync } = await import("node:fs");
  const src = readFileSync(new URL("../components/Peritia.jsx", import.meta.url), "utf8");
  const addFactura = src.slice(src.indexOf("const addFactura = files"), src.indexOf("const delFactura = id"));

  it("las facturas de la Sección 3 se guardan con el mismo límite que lee la IA (14 MB)", () => {
    expect(addFactura).toMatch(/n\.size>PDF_IA_MAX_SIZE/);
    expect(addFactura).not.toMatch(/ANEXOS_MAX_SIZE/);
  });
  it("las escrituras tardías de la Sección 3 llevan el expediente de origen", () => {
    expect(src).toMatch(/onPatch=\{fn=>updLatest\("s3",fn,cData\.id\)\}/);
  });
  it("al terminar la subida se borran los archivos que nadie referencia", () => {
    expect(addFactura).toMatch(/adjuntarUrlsSubidas/);
    expect(addFactura).toMatch(/huerfanas\.forEach\(url=>borrarArchivoAnexo\(url, token\)\)/);
  });
});

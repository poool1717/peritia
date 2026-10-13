import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { crearGuardador, marcarPersistido, filaInforme } from "../lib/dominio/guardado.js";
import { aplicarEscrituraTardia } from "../lib/dominio/escrituraTardia.js";

// C-3. La primera creación del expediente en la base de datos puede fallar.
// Antes no se reintentaba nunca y no había aviso; además, cuando salía bien,
// se perdía lo hecho mientras tanto.

const nuevo = (extra = {}) => ({ id: "local_1", encargo: { numReferencia: "9705000001", compania: "AXA Seguros", asegurado: "X" }, s1: {}, s2: {}, s3: {}, s4: {}, anexos: {}, estado: "borrador", ...extra });

// Promesa que se resuelve desde fuera, para simular la latencia de la red.
const pendiente = () => { let resolve; const p = new Promise(r => { resolve = r; }); return { p, resolve }; };

describe("primer guardado de un expediente nuevo", () => {
  it("si la creación falla, el resultado es fallo (nunca 'guardado')", async () => {
    const guardar = crearGuardador({ crear: async () => null, actualizar: vi.fn() });
    expect(await guardar(nuevo())).toEqual({ ok: false, sbId: null });
  });

  it("un error de red cuenta como fallo, no como excepción sin tratar", async () => {
    const guardar = crearGuardador({ crear: async () => { throw new Error("Failed to fetch"); }, actualizar: vi.fn() });
    expect((await guardar(nuevo())).ok).toBe(false);
  });

  it("tras un fallo, el siguiente intento vuelve a crear el expediente (reintentar)", async () => {
    const crear = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce("uuid-1");
    const guardar = crearGuardador({ crear, actualizar: vi.fn() });
    expect((await guardar(nuevo())).ok).toBe(false);
    expect(await guardar(nuevo())).toEqual({ ok: true, sbId: "uuid-1" });
    expect(crear).toHaveBeenCalledTimes(2);
  });

  it("el reintento guarda los datos que el perito introdujo después del fallo", async () => {
    const crear = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce("uuid-1");
    const guardar = crearGuardador({ crear, actualizar: vi.fn() });
    await guardar(nuevo());
    await guardar(nuevo({ s2: { textoRaw: "Rotura de tubería en el baño" } }));
    expect(crear.mock.calls[1][0].s2).toEqual({ textoRaw: "Rotura de tubería en el baño" });
  });

  it("varios guardados mientras se crea: se crea UNA vez y lo más reciente se guarda encima", async () => {
    const red = pendiente();
    const crear = vi.fn(() => red.p);
    const actualizar = vi.fn(async () => true);
    const guardar = crearGuardador({ crear, actualizar });
    const primero = guardar(nuevo());
    const segundo = guardar(nuevo({ s3: { facturas: [{ id: 7, name: "factura.pdf" }] } }));
    red.resolve("uuid-1");
    expect(await primero).toEqual({ ok: true, sbId: "uuid-1" });
    expect(await segundo).toEqual({ ok: true, sbId: "uuid-1" });
    expect(crear).toHaveBeenCalledTimes(1);
    expect(actualizar).toHaveBeenCalledWith("uuid-1", expect.objectContaining({ s3: { facturas: [{ id: 7, name: "factura.pdf" }] } }));
  });

  it("un guardado tardío sin _sbId (copia antigua del expediente) no crea un duplicado", async () => {
    const crear = vi.fn(async () => "uuid-1");
    const actualizar = vi.fn(async () => true);
    const guardar = crearGuardador({ crear, actualizar });
    await guardar(nuevo());
    await guardar(nuevo({ s1: { superficieConstruida: "90" } })); // aún sin _sbId
    expect(crear).toHaveBeenCalledTimes(1);
    expect(actualizar).toHaveBeenCalledWith("uuid-1", expect.objectContaining({ s1: { superficieConstruida: "90" } }));
  });
});

describe("guardados de un expediente que ya existe", () => {
  it("actualiza y no crea", async () => {
    const crear = vi.fn(); const actualizar = vi.fn(async () => true);
    const guardar = crearGuardador({ crear, actualizar });
    expect(await guardar(nuevo({ _sbId: "uuid-9" }))).toEqual({ ok: true, sbId: "uuid-9" });
    expect(crear).not.toHaveBeenCalled();
  });
  it("un fallo al actualizar se informa como fallo", async () => {
    const guardar = crearGuardador({ crear: vi.fn(), actualizar: async () => { throw new Error("500"); } });
    expect((await guardar(nuevo({ _sbId: "uuid-9" }))).ok).toBe(false);
  });
});

describe("marcarPersistido: el id de base de datos llega sin pisar nada", () => {
  it("conserva lo que el perito hizo mientras se creaba (la factura adjuntada no desaparece)", () => {
    const abierto = nuevo({ s3: { facturas: [{ id: 7, name: "factura.pdf" }] } });
    const r = marcarPersistido(abierto, "local_1", "uuid-1");
    expect(r._sbId).toBe("uuid-1");
    expect(r.id).toBe("local_1"); // el id no cambia: las operaciones en curso siguen siendo de este expediente
    expect(r.s3.facturas).toEqual([{ id: 7, name: "factura.pdf" }]);
  });
  it("no toca otro expediente ni actúa sin id", () => {
    const otro = nuevo({ id: "local_2" });
    expect(marcarPersistido(otro, "local_1", "uuid-1")).toBe(otro);
    expect(marcarPersistido(nuevo(), "local_1", null)._sbId).toBeUndefined();
    expect(marcarPersistido(null, "local_1", "uuid-1")).toBe(null);
  });
});

// Escenario F de la validación de la PR #23: expediente nuevo, se adjunta una
// factura enseguida y su subida termina DESPUÉS de que el expediente se cree
// en la base de datos. Con el id estable, la dirección de la factura se aplica.
describe("expediente nuevo + factura subiéndose (escenario F)", () => {
  it("la subida que empezó antes de crearse el expediente se aplica al terminar", async () => {
    let activo = nuevo();
    const idOrigen = activo.id; // la subida empieza con el expediente aún sin crear
    activo = { ...activo, s3: { facturas: [{ id: 7, name: "factura.pdf" }] } }; // se adjunta
    const guardar = crearGuardador({ crear: async () => "uuid-1", actualizar: async () => true });
    const { sbId } = await guardar(activo);
    activo = marcarPersistido(activo, idOrigen, sbId); // el expediente ya existe
    const r = aplicarEscrituraTardia({ actual: activo, idOrigen, editorAbierto: true, clave: "s3",
      fn: s3 => ({ ...s3, facturas: s3.facturas.map(f => f.id === 7 ? { ...f, url: "https://storage/f.pdf" } : f) }) });
    expect(r).not.toBe(null);
    expect(r._sbId).toBe("uuid-1");
    expect(r.s3.facturas[0].url).toBe("https://storage/f.pdf");
  });
});

describe("filaInforme", () => {
  it("lleva las columnas de la tabla informes con los datos del expediente", () => {
    expect(filaInforme(nuevo({ estado: "exportado" }))).toMatchObject({ num_referencia: "9705000001", compania: "AXA Seguros", asegurado: "X", estado: "exportado", s3: {} });
  });
});

describe("guardia C-3 en Peritia.jsx", () => {
  const src = readFileSync(new URL("../components/Peritia.jsx", import.meta.url), "utf8");
  it("al crearse, el expediente abierto ya no se sustituye por la copia del momento de crearlo", () => {
    expect(src).not.toMatch(/savedCase\s*=\s*\{\.\.\.localCase/);
  });
  it("el autoguardado ya no se salta los expedientes sin _sbId", () => {
    expect(src).not.toMatch(/if\(!u\._sbId\|\|!token\) return false/);
    expect(src).not.toMatch(/if\(u\._sbId&&token\)\{\s*dirtyRef/);
  });
  it("el editor avisa de forma visible y permite reintentar", () => {
    expect(src).toMatch(/Este expediente todavía NO está guardado/);
    expect(src).toMatch(/Reintentar guardado/);
  });
});

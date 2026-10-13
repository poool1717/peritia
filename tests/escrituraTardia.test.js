import { describe, it, expect, vi } from "vitest";
import { aplicarEscrituraTardia } from "../lib/dominio/escrituraTardia.js";

const A = { id: "A", s3: { partidas: [{ desc: "de A" }], facturas: [{ id: 1, name: "factura-A.pdf" }] }, s1: { superficieConstruida: "90" } };
const B = { id: "B", s3: { partidas: [{ desc: "de B" }], facturas: [{ id: 2, name: "factura-B.pdf" }] }, s1: { superficieConstruida: "120" } };
const ponerPartidas = partidas => s3 => ({ ...s3, partidas });

describe("aplicarEscrituraTardia — cuándo se aplica un resultado que llega tarde", () => {
  it("se aplica sobre el estado más reciente del mismo expediente", () => {
    const actual = { ...A, s1: { superficieConstruida: "95" } }; // el perito cambió algo mientras tanto
    const r = aplicarEscrituraTardia({ actual, idOrigen: "A", editorAbierto: true, clave: "s3", fn: ponerPartidas([{ desc: "IA" }]) });
    expect(r.s3.partidas).toEqual([{ desc: "IA" }]);
    expect(r.s1.superficieConstruida).toBe("95"); // no se pisa lo hecho mientras tanto
    expect(r.s3.facturas).toEqual(A.s3.facturas);  // ni el resto de la sección
  });

  it("NUNCA escribe en otro expediente: lo que empezó en A no llega a B", () => {
    const fn = vi.fn(ponerPartidas([{ desc: "partidas extraídas de la factura de A" }]));
    const r = aplicarEscrituraTardia({ actual: B, idOrigen: "A", editorAbierto: true, clave: "s3", fn });
    expect(r).toBe(null);
    expect(fn).not.toHaveBeenCalled();
  });

  it("no escribe si el editor ya está cerrado, aunque sea el mismo expediente", () => {
    const fn = vi.fn(ponerPartidas([]));
    expect(aplicarEscrituraTardia({ actual: A, idOrigen: "A", editorAbierto: false, clave: "s3", fn })).toBe(null);
    expect(fn).not.toHaveBeenCalled();
  });

  it("no escribe si no hay expediente abierto o no se sabe de dónde venía", () => {
    expect(aplicarEscrituraTardia({ actual: null, idOrigen: "A", editorAbierto: true, clave: "s3", fn: ponerPartidas([]) })).toBe(null);
    expect(aplicarEscrituraTardia({ actual: A, idOrigen: undefined, editorAbierto: true, clave: "s3", fn: ponerPartidas([]) })).toBe(null);
    expect(aplicarEscrituraTardia({ actual: { s3: {} }, idOrigen: undefined, editorAbierto: true, clave: "s3", fn: ponerPartidas([]) })).toBe(null);
  });

  it("aguanta una sección que todavía no existe", () => {
    const r = aplicarEscrituraTardia({ actual: { id: "A" }, idOrigen: "A", editorAbierto: true, clave: "s3", fn: ponerPartidas([1]) });
    expect(r.s3).toEqual({ partidas: [1] });
  });

  // Límite conocido y aceptado: el expediente recién creado cambia de id al
  // guardarse por primera vez (~1 s). Se prefiere descartar a escribir mal.
  it("descarta si el expediente cambió de id al guardarse por primera vez (límite documentado)", () => {
    const guardado = { ...A, id: "uuid-definitivo", _sbId: "uuid-definitivo" };
    expect(aplicarEscrituraTardia({ actual: guardado, idOrigen: "local_123", editorAbierto: true, clave: "s3", fn: ponerPartidas([]) })).toBe(null);
  });
});

// Réplica de ReportEditor: `activo` es el expediente en pantalla; cambiar de
// caso sin cerrar el editor es lo que hoy no ocurre (siempre se pasa por el
// listado), pero la regla no debe depender de eso.
describe("cambio de expediente con una operación en curso", () => {
  it("la operación de A termina con B abierto: B no cambia", () => {
    let activo = A; const editorAbierto = true;
    const onUpdate = vi.fn(u => { activo = u; });
    const updLatest = (clave, fn, idOrigen) => {
      const nuevo = aplicarEscrituraTardia({ actual: activo, idOrigen, editorAbierto, clave, fn });
      if (nuevo) onUpdate(nuevo);
    };
    const onPatchDeA = fn => updLatest("s3", fn, A.id); // capturado al empezar, en A
    activo = B;                                          // el perito pasa a B
    onPatchDeA(ponerPartidas([{ desc: "partidas de A" }]));
    expect(onUpdate).not.toHaveBeenCalled();
    expect(activo).toBe(B);
    expect(activo.s3.partidas).toEqual([{ desc: "de B" }]);
  });
});

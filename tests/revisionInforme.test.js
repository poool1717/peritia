import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { actuacionIncompatible, importesEnTexto, discrepanciaIndemnizacion, revisarInforme, textoSeccion2, leerImporte } from "../lib/dominio/revisionInforme.js";
import { calcIndemnizacion } from "../lib/dominio/calculo.js";
import { sec4IndemnAuto, importeInforme } from "../lib/dominio/textosInforme.js";

describe("E3 · actuaciones incompatibles con la modalidad", () => {
  const inspeccion = "Se llevó a cabo una inspección ocular directa del inmueble.";
  const documental = "Este siniestro se ha gestionado documentalmente.";
  it("documental: una inspección presencial es un error confirmado", () => {
    expect(actuacionIncompatible(inspeccion, "DOCUMENTAL")).toEqual({ nivel: "error", frases: ["inspección ocular"] });
    expect(actuacionIncompatible("El perito se personó en el domicilio.", "DOCUMENTAL")?.nivel).toBe("error");
    expect(actuacionIncompatible(documental, "DOCUMENTAL")).toBeNull();
  });
  it("presencial: describirlo como documental es un error; la inspección es compatible", () => {
    expect(actuacionIncompatible(documental, "PRESENCIAL")?.nivel).toBe("error");
    expect(actuacionIncompatible(inspeccion, "PRESENCIAL")).toBeNull();
  });
  it("vídeo: una inspección presencial es error, salvo que el texto hable del vídeo (aviso)", () => {
    expect(actuacionIncompatible(inspeccion, "VIDEO")?.nivel).toBe("error");
    expect(actuacionIncompatible("Inspección ocular por videollamada.", "VIDEO")?.nivel).toBe("aviso");
  });
  it("sin indicar: no se puede confirmar, es un aviso", () => {
    expect(actuacionIncompatible(inspeccion, "")?.nivel).toBe("aviso");
    expect(actuacionIncompatible("Granizo en la cubierta.", "")).toBeNull();
  });
});

describe("E3 · modalidad: negación, quién actúa y en qué texto (revisión técnica)", () => {
  // Las 14 frases de la revisión técnica: ninguna puede dar un error injustificado.
  const sinIncidencia = [
    ["DOCUMENTAL", "No se realizó inspección ocular del inmueble; la valoración se basa en fotografías."],
    ["DOCUMENTAL", "Sin inspección ocular, a la vista del reportaje fotográfico aportado."],
    ["DOCUMENTAL", "El asegurado se personó en la oficina de la compañía para dar parte."],
    ["DOCUMENTAL", "El fontanero acudió al domicilio y reparó la tubería."],
    ["DOCUMENTAL", "Tras la visita al domicilio del reparador se localizó la fuga."],
    ["DOCUMENTAL", "La reparación se realizó in situ por la empresa instaladora."],
    ["DOCUMENTAL", "Los bomberos se desplazaron al lugar del siniestro."],
    ["PRESENCIAL", "Se completó la revisión de facturas por vía documental."],
    ["PRESENCIAL", "El daño se produjo sin visita previa del mantenedor."],
    ["VIDEO", "El técnico acudió al domicilio para cortar el agua."],
    ["", "El fontanero acudió al domicilio."],
    ["DOCUMENTAL", "No fue posible realizar visita al inmueble."],
    ["PRESENCIAL", "Las facturas se recibieron por correo; la tramitación de pagos es documental."],
  ];
  for (const ctx of ["riesgo", "siniestro", "danos", "meteo"]) {
    it(`sin incidencia en el texto «${ctx}»: negaciones, terceros y documentación`, () => {
      for (const [m, t] of sinIncidencia) expect(actuacionIncompatible(t, m, ctx), `${m}: ${t}`).toBeNull();
    });
  }
  it("vídeo: una inspección por videollamada es solo un aviso, aunque mencione al asegurado", () => {
    expect(actuacionIncompatible("Inspección ocular realizada por videollamada con el asegurado.", "VIDEO")?.nivel).toBe("aviso");
  });
  it("sigue detectando la contradicción inequívoca del propio perito", () => {
    const errores = [
      ["DOCUMENTAL", "Inspección ocular directa del inmueble por el perito."],
      ["DOCUMENTAL", "La perita actuante procedió a la verificación del riesgo, llevando a cabo una inspección ocular directa del inmueble."],
      ["DOCUMENTAL", "El que suscribe se personó en el domicilio el día 6."],
      ["DOCUMENTAL", "Acudimos al riesgo y comprobamos los daños."],
      ["VIDEO", "El perito se desplazó al inmueble para medir la estancia."],
      ["PRESENCIAL", "Este siniestro se ha gestionado documentalmente."],
      ["PRESENCIAL", "La función pericial se ha realizado por sistema documental."],
      ["PRESENCIAL", "NO se ha procedido a la comparecencia en el riesgo."],
    ];
    for (const ctx of ["riesgo", "siniestro"]) {
      for (const [m, t] of errores.filter(([, t]) => /perit|suscribe|Acudimos/i.test(t) || ctx === "riesgo")) {
        expect(actuacionIncompatible(t, m, ctx)?.nivel, `${ctx} · ${m}: ${t}`).toBe("error");
      }
    }
  });
  it("una frase impersonal es error en el texto del perito y aviso en el relato del siniestro", () => {
    const t = "Se comprobó in situ el estado de la cubierta.";
    expect(actuacionIncompatible(t, "DOCUMENTAL", "riesgo")?.nivel).toBe("error");
    expect(actuacionIncompatible(t, "DOCUMENTAL", "danos")?.nivel).toBe("error");
    expect(actuacionIncompatible(t, "DOCUMENTAL", "siniestro")?.nivel).toBe("aviso");
  });
  it("un desplazamiento sin sujeto es aviso, no error", () => {
    expect(actuacionIncompatible("Se realizó una visita al domicilio.", "DOCUMENTAL", "riesgo")?.nivel).toBe("aviso");
  });
  it("analiza cada frase por separado: un tercero en una no excusa al perito en otra", () => {
    const t = "El administrador de la finca acudió al edificio. Se llevó a cabo una inspección ocular del inmueble.";
    expect(actuacionIncompatible(t, "DOCUMENTAL", "riesgo")).toEqual({ nivel: "error", frases: ["inspección ocular"] });
  });
  it("en la revisión completa, el relato de terceros en 2.1 no da incidencia", () => {
    const c = {
      encargo: { tipoEncargo: "PERITACION", modalidadVisita: "DOCUMENTAL", franquicia: "0" },
      s1: {}, s4: {}, s3: { modoValoracion: "baremo", partidas: [] },
      s2: { textoRaw: "El fontanero acudió al domicilio y reparó la tubería. Tras la visita al domicilio del reparador se localizó la fuga." },
    };
    expect(revisarInforme(c).filter(x => x.codigo === "modalidad")).toEqual([]);
  });
});

describe("E2 · importe de la propuesta frente a la tabla", () => {
  it("lee importes con y sin separador de millares, solo tras «INDEMNIZACIÓN:»", () => {
    expect(importesEnTexto("Daños por 9.999,00 €.\nINDEMNIZACIÓN:\nAsegurado: 2.470,00 €")).toEqual([2470]);
    expect(importesEnTexto("INDEMNIZACIÓN:\nAsegurado: 2470,00 €\nReparador: 30 €")).toEqual([2470, 30]);
  });
  it("detecta la discrepancia del informe de prueba", () => {
    expect(discrepanciaIndemnizacion("INDEMNIZACIÓN:\nAsegurado: 0,00 €", 2470)).toEqual({ texto: 0, calculo: 2470, motivo: "importe" });
  });
  it("suma varios perceptores y tolera céntimos de redondeo", () => {
    expect(discrepanciaIndemnizacion("INDEMNIZACIÓN:\nAsegurado: 2.000,00 €\nReparador: 470,00 €", 2470)).toBeNull();
    expect(discrepanciaIndemnizacion("INDEMNIZACIÓN:\nAsegurado: 2.470,00 €", 2470.004)).toBeNull();
  });
  it("«NO se propone indemnización» con importe calculado es discrepancia", () => {
    expect(discrepanciaIndemnizacion("NO se propone indemnización.", 100)?.motivo).toBe("no_propone");
    expect(discrepanciaIndemnizacion("NO se propone indemnización.", 0)).toBeNull();
  });
  it("si el texto no da ningún importe, no inventa una discrepancia", () => {
    expect(discrepanciaIndemnizacion("Se propone indemnizar según factura definitiva.", 2470)).toBeNull();
  });
});

describe("E2 · importes propuestos: solo lo que se paga (revisión técnica)", () => {
  const D = discrepanciaIndemnizacion;
  it("lee los formatos habituales", () => {
    expect(leerImporte("2.470,00")).toBe(2470);
    expect(leerImporte("2470,00")).toBe(2470);
    expect(leerImporte("2470.00")).toBe(2470);
    expect(leerImporte("2.470")).toBe(2470);
    expect(leerImporte("1.234.567,89")).toBe(1234567.89);
    expect(leerImporte("2,470.00")).toBe(2470);
    expect(leerImporte("2470")).toBe(2470);
    expect(leerImporte("2,470")).toBeNull(); // ¿2,47 o 2.470? No se adivina
  });
  it("no suma la franquicia ni el IVA citados como explicación", () => {
    expect(D("INDEMNIZACIÓN:\nAsegurado: 2.320,00 €\nFranquicia aplicada: 150,00 €", 2320)).toBeNull();
    expect(D("INDEMNIZACIÓN:\nAsegurado: 2.320,00 € (descontada franquicia de 150,00 €)", 2320)).toBeNull();
    expect(D("INDEMNIZACIÓN:\nAsegurado: 2.470,00 € (IVA incl. 428,68 €)", 2470)).toBeNull();
  });
  it("suma varios perceptores", () => {
    expect(D("INDEMNIZACIÓN:\nAsegurado: 2.000,00 €\nReparador: 470,00 €", 2470)).toBeNull();
    expect(D("INDEMNIZACIÓN:\nAsegurado: 2.000,00 €\nReparador: 400,00 €", 2470)).toEqual({ motivo: "importe", texto: 2400, calculo: 2470 });
  });
  it("decimal con punto y símbolo delante", () => {
    expect(D("INDEMNIZACIÓN:\nAsegurado: 2470.00 €", 2470)).toBeNull();
    expect(D("INDEMNIZACIÓN:\nAsegurado: € 2.470,00", 2470)).toBeNull();
  });
  it("una negación parcial no contradice el importe de otra partida", () => {
    expect(D("NO se propone indemnización para el contenido.\nINDEMNIZACIÓN:\nAsegurado: 2.470,00 €", 2470)).toBeNull();
    // Sin ningún importe, la negación parcial no se puede contrastar: aviso, no error.
    expect(D("NO se propone indemnización para el contenido.", 2470)?.motivo).toBe("ambiguo");
  });
  it("si no se puede saber qué se paga, es un aviso, nunca un error", () => {
    expect(D("INDEMNIZACIÓN:\nAsegurado: dos mil euros", 2000)?.motivo).toBe("ambiguo");
    expect(D("Daños por 2.620,00 € y gastos de 300,00 €.", 2470)?.motivo).toBe("ambiguo");
    expect(D("Se propone indemnizar 2.470,00 € según presupuesto de 2.470,00 €.", 2470)).toBeNull();
  });
  it("redondeo: se compara con el importe que imprime la tabla", () => {
    // Factura de 15,25 € + IVA 10 % = 16,775 €: la tabla imprime 16,78 €.
    const enc = { franquicia: "0", capitalContinente: "100000" };
    const s3 = { modoValoracion: "factura", partidas: [{ uds: 1, p: 15.25, ivaOn: true, iva: 10, cobertura: true }] };
    const indemn = calcIndemnizacion(enc, {}, s3);
    expect(importeInforme(indemn)).toBe("16,78");
    expect(D(sec4IndemnAuto(s3, indemn), indemn)).toBeNull();
    expect(D("INDEMNIZACIÓN:\nAsegurado: 16,78 €", indemn)).toBeNull();
    const mal = D("INDEMNIZACIÓN:\nAsegurado: 16,77 €", indemn);
    expect(mal).toEqual({ motivo: "importe", texto: 16.77, calculo: 16.78 });
    expect(revisarInforme({ encargo: enc, s1: {}, s2: {}, s3, s4: {} }).filter(x => x.codigo.startsWith("indemnizacion"))).toEqual([]);
  });
  it("ningún texto automático da discrepancia con importes de medio céntimo", () => {
    for (let c = 5; c < 200000; c += 10) {
      const x = c / 1000;
      expect(D(sec4IndemnAuto({ modoValoracion: "baremo", partidas: [{ cobertura: true }] }, x), x)).toBeNull();
    }
  });
  it("en la revisión, lo ambiguo es aviso y la discrepancia real, error", () => {
    const base = { encargo: { franquicia: "0" }, s1: {}, s2: {}, s3: { modoValoracion: "baremo", partidas: [{ id: 1, uds: 1, p: 2470, cobertura: true }] } };
    const amb = revisarInforme({ ...base, s4: { textoIndemnEdited: true, textoIndemn: "INDEMNIZACIÓN:\nAsegurado: según factura definitiva" } });
    // Aviso (no error), con su propio código, y sin ninguna incidencia de error.
    expect(amb.find(x => x.codigo === "indemnizacion_ambigua")?.nivel).toBe("aviso");
    expect(amb.find(x => x.codigo === "indemnizacion")).toBeUndefined();
    expect(amb.filter(x => x.codigo.startsWith("indemnizacion")).every(x => x.nivel === "aviso")).toBe(true);
    expect(amb.find(x => x.codigo === "indemnizacion_ambigua").mensaje).toMatch(/No se ha podido identificar con seguridad/);
    const err = revisarInforme({ ...base, s4: { textoIndemnEdited: true, textoIndemn: "INDEMNIZACIÓN:\nAsegurado: 2.000,00 €" } });
    expect(err.find(x => x.codigo === "indemnizacion")?.nivel).toBe("error");
    expect(err.find(x => x.codigo === "indemnizacion_ambigua")).toBeUndefined();
  });
});

describe("Aviso ambiguo de la propuesta de indemnización: título y categoría", () => {
  const base = { encargo: { franquicia: "0" }, s1: {}, s2: {}, s3: { modoValoracion: "baremo", partidas: [{ id: 1, uds: 1, p: 2470, cobertura: true }] } };
  const con = texto => revisarInforme({ ...base, s4: { textoIndemnEdited: true, textoIndemn: texto } });
  // El título lo pone la interfaz según el código de la incidencia (REV_LABELS en Peritia.jsx).
  const fuente = readFileSync(new URL("../components/Peritia.jsx", import.meta.url), "utf8");
  it("lo que no se puede verificar tiene su propio código y un título neutral, no «no cuadra»", () => {
    expect(fuente).toContain('indemnizacion_ambigua:"No se ha podido verificar la propuesta de indemnización"');
    const r = con("INDEMNIZACIÓN:\nAsegurado: según factura definitiva").filter(x => x.codigo.startsWith("indemnizacion"));
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ codigo: "indemnizacion_ambigua", nivel: "aviso", secId: "s4", informativo: false });
  });
  it("las discrepancias reales siguen siendo error, con su código y su título de siempre", () => {
    expect(fuente).toContain('indemnizacion:"La propuesta de indemnización no cuadra"');
    for (const t of ["INDEMNIZACIÓN:\nAsegurado: 1.000,00 €", "INDEMNIZACIÓN:\nAsegurado: 2.000,00 €\nReparador: 400,00 €", "NO se propone indemnización."]) {
      const r = con(t).filter(x => x.codigo.startsWith("indemnizacion"));
      expect(r, t).toHaveLength(1);
      expect(r[0], t).toMatchObject({ codigo: "indemnizacion", nivel: "error", secId: "s4" });
    }
  });
  it("ningún texto dudoso se convierte en error", () => {
    for (const t of ["INDEMNIZACIÓN:\nAsegurado: dos mil euros", "Daños por 2.620,00 € y gastos de 300,00 €.", "NO se propone indemnización para el contenido."]) {
      const r = con(t).filter(x => x.codigo.startsWith("indemnizacion"));
      expect(r.every(x => x.nivel === "aviso"), t).toBe(true);
    }
  });
});

describe("revisión completa", () => {
  const base = () => ({
    encargo: { tipoEncargo: "PERITACION", modalidadVisita: "PRESENCIAL", franquicia: "0" },
    s1: {}, s2: { textoRaw: "Rotura de tubería." }, s4: {},
    s3: { modoValoracion: "factura", partidas: [{ id: 1, p: 100, uds: 1, cobertura: true }] },
  });
  it("un expediente coherente no da errores", () => {
    const r = revisarInforme(base(), { documentos: [{ name: "f.pdf", type: "application/pdf", url: "u", tipo: "Factura" }] });
    expect(r.filter(x => x.nivel === "error")).toEqual([]);
  });
  it("un PDF es un aviso; un documento perdido, un error", () => {
    const r = revisarInforme(base(), { documentos: [
      { name: "f.pdf", type: "application/pdf", url: "u", tipo: "Factura" },
      { name: "g.pdf", type: "application/pdf", tipo: "Factura" },
    ] });
    expect(r.find(x => x.codigo === "anexo_pdf")?.nivel).toBe("aviso");
    expect(r.find(x => x.codigo === "anexo_no_disponible")?.nivel).toBe("error");
  });
  it("valoración por factura sin ninguna factura: aviso", () => {
    expect(revisarInforme(base()).find(x => x.codigo === "sin_documento")?.nivel).toBe("aviso");
  });
  it("partida con cobertura a 0 €: aviso", () => {
    const c = base(); c.s3.partidas.push({ id: 2, p: 0, uds: 1, cobertura: true });
    expect(revisarInforme(c).find(x => x.codigo === "partida_sin_importe")?.mensaje).toMatch(/^1 partida/);
  });
  it("el mensaje de duplicado dice el criterio real", () => {
    const r = revisarInforme(base(), { documentos: [
      { name: "f.pdf", size: 5, type: "application/pdf", url: "u", tipo: "Factura" },
      { name: "f.pdf", size: 5, type: "application/pdf", url: "v", tipo: "Factura" },
      { name: "g.pdf", type: "application/pdf", url: "u", tipo: "Factura" },
    ] }).filter(x => x.codigo === "anexo_duplicado").map(x => x.mensaje);
    expect(r[0]).toMatch(/mismo nombre y tamaño que el documento 1, aunque son archivos distintos/);
    expect(r[1]).toMatch(/es el mismo archivo guardado que el documento 1/);
  });
  it("el aviso de anexo en PDF es informativo; los demás avisos, no", () => {
    const r = revisarInforme(base(), { documentos: [
      { name: "f.pdf", size: 5, type: "application/pdf", url: "u", tipo: "Factura" },
      { name: "f.pdf", size: 5, type: "application/pdf", url: "v", tipo: "Factura" },
    ] });
    expect(r.filter(x => x.codigo === "anexo_pdf").every(x => x.informativo)).toBe(true);
    expect(r.filter(x => x.codigo !== "anexo_pdf").some(x => x.informativo)).toBe(false);
  });
  it("si el perfil no se ha podido leer, no se dice que falta el nombre", () => {
    expect(revisarInforme(base(), { perito: null }).find(x => x.codigo === "perito")).toBeUndefined();
  });
  it("sin nombre de perito: aviso", () => {
    expect(revisarInforme(base(), { perito: { nombre: "" } }).find(x => x.codigo === "perito")?.nivel).toBe("aviso");
  });
  it("2.1 usa el texto mejorado si es válido y el del perito si la IA falló", () => {
    expect(textoSeccion2({ textoRaw: "A", textoAI: "B" })).toBe("B");
    expect(textoSeccion2({ textoRaw: "A", textoAI: '{"_apiError":true}' })).toBe("A");
    expect(textoSeccion2({ textoAI: "Error de conexión." })).toBe("");
  });
});

import { describe, it, expect } from "vitest";
import { buildWordHTML, buildPDFHTML, datosInforme } from "../components/Peritia.jsx";
import { revisarInforme } from "../lib/dominio/revisionInforme.js";
import { fraseComparecencia } from "../lib/dominio/informe.js";

// Primer informe de prueba con PERIT.IA (encargo 27603166, expediente
// 9705367688, Instant Payment documental, pedrisco). Word y PDF salieron con:
//   E1  el JSON de un error de la API de IA como descripción del siniestro;
//   E2  "Asegurado: 0,00 €" con una tabla de garantías de 2.470,00 €;
//   E3  "inspección ocular directa" en un expediente documental;
//   E4  "a la espera de presupuestos" con dos presupuestos adjuntos;
//   E5  "Don <perito>" en la introducción y "La perita actuante" en 1.1;
//   E6  ** alrededor de la dirección;
//   E7  los presupuestos PDF como páginas en blanco;
//   E9  el DNI del perito solo en el PDF.
// Datos personales anonimizados; importes, textos de la IA y estados, los reales.

const ERROR_API = '{"_apiError":true,"_status":400,"_msg":"Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits."}';
const PDF_URL = "https://example.invalid/storage/v1/object/public/anexos/u/9705367688/presupuesto.pdf";
const TEXTO_IA_S1 = "La perita actuante procedió a la verificación del riesgo sito en **Calle Mayor, 1, 17800 Olot (Girona)**, llevando a cabo una inspección ocular directa del inmueble mediante la cual se comprobaron las características constructivas. En el plano documental, se procedió a la revisión de la documentación aportada.";

const expediente = (cambios = {}) => {
  const base = {
    encargo: {
      compania: "AXA Seguros", numReferencia: "9705367688", numPoliza: "00000000", ramo: "Hogar",
      garantia: "Atmosféricos", causa: "PEDRISCO-NIEVE", tipoEncargo: "INSTANT_PAYMENT", modalidadVisita: "DOCUMENTAL",
      fechaEncargo: "26/09/2026", fechaSiniestro: "06/08/2026", numExpInterno: "27603166",
      lugarIntervencion: "CALLE MAYOR 1 OLOT GERONA 17800", municipio: "OLOT", provincia: "GERONA",
      asegurado: "ASEGURADA DE PRUEBA", capitalContinente: "560400", capitalContenido: "0", franquicia: "0",
      umbralViento: "80", umbralLluvia: "40",
      perito: "Perito Prueba", telPerito: "600 000 000", dniPerito: "00000000T",
    },
    s1: { textoInstant: TEXTO_IA_S1 },
    s2: {
      textoRaw: "Granizo que perfora el techo de uralita del cobertizo.",
      textoAI: ERROR_API, aiApplied: false,
      meteo: { estacio: "Olot", distanciaKm: 2, tempMax: 34.8, humitatMax: 97, rachaMax: 59, precipMaxHoraria: 4.1, consultadoEl: "2026-10-08", texto: "" },
    },
    s3: {
      modoValoracion: "presupuesto", perceptorTipo: "particular", franquiciaVal: "0",
      textoAI: "Techo de fibrocemento (uralita) de cobertizo con perforaciones puntuales por impacto de granizo.",
      partidas: [
        { id: 1, oficio: "Construcciones", desc: "Cambiar placas y tornillos dañados por el granizo.", uds: 1, p: 930, ivaOn: false, iva: 0, depr: false, pctDepr: 0, perceptor: "Asegurado", garantia: "continente", cobertura: true },
        { id: 2, oficio: "Construcciones", desc: "Colocar placas nuevas y retirar las viejas a vertedero.", uds: 1, p: 1540, ivaOn: false, iva: 0, depr: false, pctDepr: 0, perceptor: "Asegurado", garantia: "continente", cobertura: true },
      ],
      facturas: [
        { id: 11, name: "PRESUPUESTO.pdf", size: 81234, type: "application/pdf", url: PDF_URL },
        { id: 12, name: "PRESUPUESTO.pdf", size: 81234, type: "application/pdf", url: PDF_URL },
      ],
    },
    s4: {
      // Guardados por la Sección 4 cuando se visitó con la tabla vacía y en modo baremo.
      textoIntro: "A la espera de aportación de presupuestos o facturas procedemos a realizar valoración unilateral a modo informativo.",
      descripcionCobertura: "Continente: daños por pedrisco.\nContenido: daños por pedrisco.",
      textoIndemn: "Se propone indemnización a modo informativo de la siguiente manera:\n\nINDEMNIZACIÓN:\nAsegurado: 0,00 €",
    },
    anexos: {},
  };
  return {
    ...base, ...cambios,
    encargo: { ...base.encargo, ...(cambios.encargo || {}) },
    s1: { ...base.s1, ...(cambios.s1 || {}) },
    s2: { ...base.s2, ...(cambios.s2 || {}) },
    s3: { ...base.s3, ...(cambios.s3 || {}) },
    s4: { ...base.s4, ...(cambios.s4 || {}) },
  };
};
const ambos = c => [["Word", buildWordHTML(c)], ["PDF", buildPDFHTML(c)]];
const texto = html => html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");

describe("E1 · un error de la API de IA no llega al informe", () => {
  it("ni el JSON ni el mensaje técnico aparecen en Word ni en PDF", () => {
    for (const [, h] of ambos(expediente())) {
      expect(h).not.toContain("_apiError");
      expect(h).not.toContain("credit balance");
      expect(h).not.toContain("Plans &");
    }
  });
  it("no sustituye al texto válido: la descripción del perito sigue en 2.1", () => {
    for (const [, h] of ambos(expediente())) {
      expect(texto(h)).toMatch(/2\.1\. Descripción del siniestro: Granizo que perfora el techo de uralita del cobertizo\./);
    }
  });
  it("si no hay ningún texto válido, 2.1 queda vacío (no se inventa) y la revisión lo da como error", () => {
    const c = expediente({ s2: { textoRaw: "", textoAI: ERROR_API } });
    for (const [, h] of ambos(c)) expect(texto(h)).toMatch(/2\.1\. Descripción del siniestro: 2\.2\./);
    const r = revisarInforme(c);
    expect(r.find(x => x.codigo === "error_ia" && x.secId === "s2")?.nivel).toBe("error");
  });
});

describe("E2 · la propuesta final y la tabla de garantías dicen lo mismo", () => {
  it("un texto automático guardado con la tabla vacía se recalcula al exportar", () => {
    for (const [, h] of ambos(expediente())) {
      expect(h).not.toMatch(/Asegurado: 0,00 €/);
      expect(h).toMatch(/Asegurado: 2\.470,00 €/);
    }
  });
  it("un texto editado por el perito se respeta, y la revisión avisa de la discrepancia", () => {
    const c = expediente({ s4: { textoIndemn: "INDEMNIZACIÓN:\nAsegurado: 1.000,00 €", textoIndemnEdited: true } });
    for (const [, h] of ambos(c)) expect(h).toMatch(/Asegurado: 1\.000,00 €/);
    const r = revisarInforme(c);
    const d = r.find(x => x.codigo === "indemnizacion");
    expect(d?.nivel).toBe("error");
    expect(d.mensaje).toMatch(/1\.000,00 €.*2\.470,00 €/);
  });
  it("el caso real (texto automático desfasado) no deja discrepancia: se recalcula", () => {
    expect(revisarInforme(expediente()).find(x => x.codigo === "indemnizacion")).toBeUndefined();
  });
});

describe("E3 · la modalidad manda sobre lo que se cuenta", () => {
  it("documental: el texto de la IA con «inspección ocular» se detecta como error", () => {
    const r = revisarInforme(expediente());
    const m = r.find(x => x.codigo === "modalidad" && x.secId === "s1");
    expect(m?.nivel).toBe("error");
    expect(m.mensaje).toMatch(/inspección ocular/);
  });
  it("documental: el texto por defecto no menciona ninguna inspección ni visita", () => {
    const c = expediente({ s1: { textoInstant: "" } });
    for (const [, h] of ambos(c)) {
      const t = texto(h);
      expect(t).toMatch(/Este siniestro se ha gestionado documentalmente/);
      expect(t).not.toMatch(/inspecci[oó]n ocular|se person[oó]|visita al riesgo/i);
      expect(t).toContain("NO se ha procedido a la comparecencia");
    }
  });
  it("presencial: ni la portada ni 1.1 dicen que fue documental", () => {
    const c = expediente({ encargo: { modalidadVisita: "PRESENCIAL" }, s1: { textoInstant: "" } });
    for (const [, h] of ambos(c)) {
      const t = texto(h);
      expect(t).toContain(fraseComparecencia("PRESENCIAL"));
      expect(t).not.toMatch(/documental/i);
    }
  });
  it("vídeo y sin indicar: ninguna de las plantillas afirma una visita", () => {
    for (const mod of ["VIDEO", ""]) {
      const c = expediente({ encargo: { modalidadVisita: mod }, s1: { textoInstant: "" } });
      for (const [, h] of ambos(c)) {
        const t = texto(h);
        expect(t).toContain(fraseComparecencia(mod));
        expect(t).not.toMatch(/(?<!NO )se ha procedido a la comparecencia pericial en el Riesgo/);
        expect(t).not.toMatch(/gestionado documentalmente/);
      }
    }
  });
});

describe("E4 · el texto de la valoración refleja los documentos que constan", () => {
  it("con presupuestos adjuntos no dice que se esperan", () => {
    for (const [, h] of ambos(expediente())) {
      expect(h).not.toContain("A la espera de aportación de presupuestos o facturas");
      expect(h).toContain("en base al presupuesto aportado");
      // Lo que falta, la factura, sí se dice.
      expect(h).toContain("A la espera de aportación de la factura");
    }
  });
});

describe("E5 / E9 · identificación del perito y mismos datos en Word y PDF", () => {
  it("una sola forma de nombrar al perito, con nombre, teléfono y DNI en los dos formatos", () => {
    for (const [, h] of ambos(expediente())) {
      expect(h).toContain("emitido por Perito Prueba, en calidad de perito");
      expect(h).not.toMatch(/\bDon\b/);
      expect(h).toContain("DNI: 00000000T");
      expect(h).toContain("600 000 000");
    }
  });
  it("Word y PDF llevan los mismos datos sustanciales", () => {
    const c = expediente();
    const D = datosInforme(c);
    const sustanciales = [
      D.perito, D.telPerito, D.dni, D.emision, D.comparecencia, ...D.riesgo, D.s2Texto, D.intro3, D.s3Texto,
      D.desc4, D.indemnTexto, `En ${D.lugarFirma}, a ${D.fechaFirma}`,
      "2.470,00 €", "560.400,00 €", "26/09/2026", "06/08/2026", "08/10/2026",
      ...D.documentos.map(d => `${d.tipo} ${d.numero}:`),
    ];
    for (const [formato, h] of ambos(c)) {
      for (const s of sustanciales) expect(h, `${formato}: ${s.slice(0, 60)}`).toContain(s);
    }
  });
});

describe("E6 · sin delimitadores Markdown literales", () => {
  it("la dirección marcada con ** sale sin asteriscos", () => {
    for (const [, h] of ambos(expediente())) {
      expect(texto(h)).not.toContain("**");
      expect(h).toContain("Calle Mayor, 1, 17800 Olot (Girona)");
    }
  });
  it("un texto con < o & no rompe el HTML del informe", () => {
    const c = expediente({ s3: { textoAI: "Daño < 2 m² & <b>sin</b> filtración" } });
    for (const [, h] of ambos(c)) {
      expect(h).toContain("Daño &lt; 2 m² &amp; &lt;b&gt;sin&lt;/b&gt; filtración");
    }
  });
});

describe("E7 · anexos que no se pueden reproducir", () => {
  it("los PDF se citan con su estado, sin iframes ni páginas vacías por documento", () => {
    for (const [, h] of ambos(expediente())) {
      expect(h).not.toContain("<iframe");
      expect(h).not.toContain("[Documento adjunto");
      expect(texto(h)).toMatch(/Presupuesto 1: PRESUPUESTO\.pdf — documento PDF que consta en el expediente; su contenido no se reproduce en este informe/);
      expect(texto(h)).toMatch(/Presupuesto 2: PRESUPUESTO\.pdf/);
      // Un único salto de página para los anexos, no uno por documento.
      const anexos = h.slice(h.indexOf("Anexos."));
      expect(anexos).not.toContain("page-break");
    }
  });
  it("no se quitan duplicados por nombre, pero la revisión avisa", () => {
    const r = revisarInforme(expediente(), { documentos: expediente().s3.facturas.map(f => ({ ...f, tipo: "Presupuesto" })) });
    expect(r.filter(x => x.codigo === "anexo_duplicado")).toHaveLength(1);
  });
  it("un documento sin archivo se cita como no disponible (error en la revisión)", () => {
    const c = expediente({ s3: { facturas: [{ id: 13, name: "FACTURA.pdf", type: "application/pdf" }] } });
    for (const [, h] of ambos(c)) expect(texto(h)).toMatch(/FACTURA\.pdf — documento no disponible/);
  });
  it("una imagen se reproduce, y si no carga deja una nota en vez de una página en blanco", () => {
    const c = expediente({ s3: { facturas: [{ id: 14, name: "factura.jpg", type: "image/jpeg", url: "https://example.invalid/f.jpg" }] } });
    const pdf = buildPDFHTML(c);
    expect(pdf).toMatch(/<img src="https:\/\/example\.invalid\/f\.jpg"[^>]*onerror="this\.replaceWith/);
    expect(pdf).not.toContain("this.style.display='none'");
  });
});

describe("E8 · cabecera y saltos de página del PDF", () => {
  const pdf = buildPDFHTML(expediente());
  it("la cabecera va en el margen de la página, no en un bloque fijo que tapa el primer título", () => {
    expect(pdf).toMatch(/@top-left\{[^}]*GABINETE DE VALORACIONES PERICIALES/);
    expect(pdf).toMatch(/@top-right\{[^}]*expediente 9705367688/);
    expect(pdf).not.toMatch(/\.hdr\{position:fixed/);
    expect(pdf).toMatch(/@bottom-center\{[^}]*counter\(page\)[^}]*counter\(pages\)/);
  });
  it("los títulos no se separan de lo que les sigue", () => {
    expect(pdf).toMatch(/h2\{[^}]*break-after:avoid/);
    expect(pdf).toMatch(/h3\{[^}]*break-after:avoid/);
  });
});

describe("E10 · formatos", () => {
  it("fecha de la consulta meteorológica en dd/mm/aaaa y millares agrupados siempre", () => {
    for (const [, h] of ambos(expediente())) {
      expect(h).toContain("Consulta: 08/10/2026");
      expect(h).not.toContain("2026-10-08");
      expect(h).not.toMatch(/\b2470,00/);
      expect(h).toContain("2.470,00 €");
    }
  });
  it("la dirección de la portada es la del encargo, sin transformar", () => {
    for (const [, h] of ambos(expediente())) expect(h).toContain("CALLE MAYOR 1 OLOT GERONA 17800");
  });
});

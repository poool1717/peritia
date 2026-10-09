import { describe, it, expect } from "vitest";
import {
  esErrorIA, mensajeErrorIA, respuestaTextoIA, limpiarMarkdown, escaparHTML, textoParaInforme,
  textoInstantPorDefecto, fraseEmision, fechaInforme, importeInforme, reglasRedaccionIA,
  SEC4_INTROS, sec4IntroAuto, sec4IndemnAuto, textoIntroVigente, textoIndemnVigente,
} from "../lib/dominio/textosInforme.js";

const ERROR_SALDO = '{"_apiError":true,"_status":400,"_msg":"Your credit balance is too low to access the Anthropic API."}';

describe("E1 · errores de la IA", () => {
  it("reconoce el error de la API, el de interpretación y los textos de fallo de conexión", () => {
    expect(esErrorIA(ERROR_SALDO)).toBe(true);
    expect(esErrorIA('  {"_parseError":true}')).toBe(true);
    expect(esErrorIA({ _apiError: true })).toBe(true);
    expect(esErrorIA("Error de conexión.")).toBe(true);
    expect(esErrorIA("Error al conectar.")).toBe(true);
  });
  it("no confunde un texto pericial con un error", () => {
    expect(esErrorIA("Se produjo un error de montaje en la tubería.")).toBe(false);
    expect(esErrorIA('El perito anotó {"_apiError"} en su libreta')).toBe(false);
    expect(esErrorIA("")).toBe(false);
    expect(esErrorIA(null)).toBe(false);
  });
  it("da un mensaje comprensible, sin el texto técnico de la API", () => {
    const m = mensajeErrorIA(ERROR_SALDO);
    expect(m).toMatch(/saldo de la cuenta de IA se ha agotado/);
    expect(m).toMatch(/no se ha modificado/);
    expect(m).not.toMatch(/credit balance|_apiError/);
    expect(mensajeErrorIA('{"_apiError":true,"_status":500,"_msg":"x"}')).toMatch(/código 500/);
    expect(mensajeErrorIA(null)).toMatch(/No se ha podido conectar/);
    expect(mensajeErrorIA("Texto bueno.")).toBeNull();
  });
  it("una respuesta con error conserva el texto que había", () => {
    expect(respuestaTextoIA(ERROR_SALDO, "Texto del perito")).toEqual({ texto: "Texto del perito", error: expect.any(String) });
    expect(respuestaTextoIA(null, "Texto del perito").texto).toBe("Texto del perito");
    expect(respuestaTextoIA("Texto mejorado", "Texto del perito")).toEqual({ texto: "Texto mejorado", error: null });
  });
  it("un error nunca llega al informe", () => {
    expect(textoParaInforme(ERROR_SALDO)).toBe("");
    expect(textoParaInforme("Error de conexión.")).toBe("");
  });
});

describe("E6 · Markdown y HTML", () => {
  it("quita negritas, cursivas, código y almohadillas de título", () => {
    expect(limpiarMarkdown("sito en **Calle Mayor, 1**, Olot")).toBe("sito en Calle Mayor, 1, Olot");
    expect(limpiarMarkdown("__importante__ y *matiz* y `x`")).toBe("importante y matiz y x");
    expect(limpiarMarkdown("## Daños\nTexto")).toBe("Daños\nTexto");
  });
  it("no altera asteriscos sueltos ni guiones de lista", () => {
    expect(limpiarMarkdown("2 * 3 m² de superficie")).toBe("2 * 3 m² de superficie");
    expect(limpiarMarkdown("- partida uno\n- partida dos")).toBe("- partida uno\n- partida dos");
    expect(limpiarMarkdown("nota*")).toBe("nota*");
  });
  it("escapa el HTML y convierte los saltos de línea", () => {
    expect(escaparHTML(`<b>"a" & 'b'</b>`)).toBe("&lt;b&gt;&quot;a&quot; &amp; &#39;b&#39;&lt;/b&gt;");
    expect(textoParaInforme("**A**\n<B>")).toBe("A<br/>&lt;B&gt;");
  });
});

describe("E3 · texto por defecto de Instant Payment", () => {
  it("solo dice «gestionado documentalmente» si la modalidad es documental", () => {
    const enc = { lugarIntervencion: "CALLE MAYOR 1 OLOT", modalidadVisita: "DOCUMENTAL" };
    expect(textoInstantPorDefecto(enc)).toBe("Localización del riesgo: el riesgo está situado en CALLE MAYOR 1 OLOT. Este siniestro se ha gestionado documentalmente.");
    for (const m of ["PRESENCIAL", "VIDEO", ""]) {
      expect(textoInstantPorDefecto({ ...enc, modalidadVisita: m })).toBe("Localización del riesgo: el riesgo está situado en CALLE MAYOR 1 OLOT.");
    }
  });
  it("las peticiones de redacción a la IA llevan la modalidad y prohíben inventar", () => {
    expect(reglasRedaccionIA({ modalidadVisita: "DOCUMENTAL" })).toMatch(/sin visita al riesgo.*inspección ocular/);
    expect(reglasRedaccionIA({ modalidadVisita: "PRESENCIAL" })).toMatch(/visita presencial/);
    expect(reglasRedaccionIA({})).toMatch(/no consta/);
    expect(reglasRedaccionIA({})).toMatch(/sin Markdown/);
    expect(reglasRedaccionIA({})).toMatch(/No nombres al perito/);
  });
});

describe("E5 · identificación del perito", () => {
  it("sin tratamiento ni género, y sin «Don —» si falta el nombre", () => {
    expect(fraseEmision("Pol")).toMatch(/^Este informe pericial ha sido emitido por Pol, en calidad de perito, ha sido solicitado/);
    expect(fraseEmision("")).toMatch(/emitido por el perito que suscribe,/);
    expect(fraseEmision("A <b>")).toContain("A &lt;b&gt;");
  });
});

describe("E10 · fechas e importes", () => {
  it("solo convierte fechas aaaa-mm-dd", () => {
    expect(fechaInforme("2026-10-08")).toBe("08/10/2026");
    expect(fechaInforme("06/08/2026")).toBe("06/08/2026");
    expect(fechaInforme("")).toBe("");
  });
  it("agrupa siempre los millares", () => {
    expect(importeInforme(2470)).toBe("2.470,00");
    expect(importeInforme(560400)).toBe("560.400,00");
    expect(importeInforme(930)).toBe("930,00");
    expect(importeInforme("abc")).toBe("0,00");
  });
});

describe("E2 / E4 · textos automáticos de la Sección 3 y 4", () => {
  it("valoración por presupuesto o factura: solo dice «aportado» si hay documento", () => {
    expect(sec4IntroAuto("presupuesto", true)).toBe(SEC4_INTROS[0]);
    expect(sec4IntroAuto("factura", true)).toBe(SEC4_INTROS[1]);
    expect(sec4IntroAuto("presupuesto", false)).toBe("Procedemos a realizar la valoración de los daños.");
    expect(sec4IntroAuto("factura", false)).toBe("Procedemos a realizar la valoración de los daños.");
  });
  it("valoración propia (baremo): «a la espera» solo si no consta ningún documento", () => {
    expect(sec4IntroAuto("baremo", false)).toBe("A la espera de aportación de presupuestos o facturas procedemos a realizar valoración unilateral a modo informativo.");
    expect(sec4IntroAuto("baremo", true)).toBe("Procedemos a realizar valoración propia a modo informativo.");
  });
  it("un texto introductorio automático se recalcula; uno personalizado se respeta", () => {
    expect(textoIntroVigente({ textoIntro: SEC4_INTROS[2] }, "presupuesto", true)).toBe(SEC4_INTROS[0]);
    expect(textoIntroVigente({ textoIntro: "Mi texto." }, "presupuesto", true)).toBe("Mi texto.");
    expect(textoIntroVigente({}, "baremo", false)).toBe(SEC4_INTROS[2]);
  });
  it("la propuesta automática sigue a los datos; la editada se respeta", () => {
    const s3 = { modoValoracion: "presupuesto", partidas: [{ p: 2470, uds: 1, cobertura: true }] };
    const guardada = { textoIndemn: "INDEMNIZACIÓN:\nAsegurado: 0,00 €" };
    expect(textoIndemnVigente(guardada, s3, 2470)).toMatch(/Asegurado: 2\.470,00 €$/);
    expect(textoIndemnVigente({ ...guardada, textoIndemnEdited: true }, s3, 2470)).toBe(guardada.textoIndemn);
  });
  it("las fórmulas de la propuesta no cambian (solo el formato del importe)", () => {
    expect(sec4IndemnAuto({ modoValoracion: "factura", perceptorTipo: "reparador", partidas: [{ cobertura: true }] }, 1234.5))
      .toBe("Se propone indemnización de la siguiente manera:\n\nINDEMNIZACIÓN:\nReparador: 1.234,50 €");
    expect(sec4IndemnAuto({ partidas: [{ cobertura: false }] }, 0)).toBe("NO se propone indemnización.");
  });
});

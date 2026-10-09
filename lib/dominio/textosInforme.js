// ─────────────────────────────────────────────────────────────────────────────
// Textos que entran en el informe exportado (Word y PDF)
//
// Capa de dominio pura: sin React ni red. Se prueba en tests/textosInforme.test.js
// y, a través de buildWordHTML/buildPDFHTML, en tests/informe-prueba-27603166.test.js.
//
// Nace de la revisión del primer informe de prueba (expediente 9705367688,
// encargo 27603166). Las dos exportaciones usan estas mismas funciones para
// que Word y PDF no puedan decir cosas distintas.
// ─────────────────────────────────────────────────────────────────────────────

import { getPartidas } from "./calculo.js";
import { normalizarModalidad, MODALIDADES } from "./informe.js";

// ── E1. Errores técnicos de la IA ───────────────────────────────────────────
//
// callClaude (Peritia.jsx) no lanza una excepción cuando la API falla:
// devuelve el texto JSON {"_apiError":true,"_status":…,"_msg":…}. Las
// llamadas que esperan JSON lo detectan con iaError(), pero las que esperan
// un texto (mejorar redacción) lo guardaban tal cual como si fuera la
// redacción, y acababa impreso en el apartado 2.1 del informe. Los `.catch`
// de esas llamadas guardaban además "Error de conexión." / "Error al conectar."
// como texto.
const FALLOS_CONEXION = ["Error de conexión.", "Error al conectar."];

export const esErrorIA = texto => {
  if (texto == null) return false;
  if (typeof texto === "object") return !!(texto._apiError || texto._parseError);
  const t = String(texto).trim();
  if (!t) return false;
  if (FALLOS_CONEXION.includes(t)) return true;
  return /^\{\s*"_apiError"\s*:/.test(t) || /^\{\s*"_parseError"\s*:/.test(t);
};

const datosError = texto => {
  if (texto && typeof texto === "object") return texto;
  try { return JSON.parse(String(texto).trim()); } catch { return {}; }
};

// Mensaje para el perito (en la aplicación, nunca en el informe). null si el
// texto es válido. Una respuesta vacía o nula también es un fallo: la llamada
// no llegó a devolver nada.
export const mensajeErrorIA = texto => {
  if (texto == null || (typeof texto === "string" && !texto.trim())) {
    return "No se ha podido conectar con la IA. Tu texto no se ha modificado. Vuelve a intentarlo en unos minutos.";
  }
  if (!esErrorIA(texto)) return null;
  const d = datosError(texto);
  const msg = String(d._msg || "");
  if (/credit balance|saldo/i.test(msg)) {
    return "La IA no está disponible: el saldo de la cuenta de IA se ha agotado. Tu texto no se ha modificado. Avisa al administrador y vuelve a intentarlo cuando se haya recargado.";
  }
  if (d._status === 401 || d._status === 403) {
    return "La IA ha rechazado la petición por un problema de sesión. Tu texto no se ha modificado. Vuelve a iniciar sesión e inténtalo de nuevo.";
  }
  if (d._status) {
    return `La IA ha devuelto un error (código ${d._status}). Tu texto no se ha modificado. Vuelve a intentarlo.`;
  }
  return "No se ha podido conectar con la IA. Tu texto no se ha modificado. Vuelve a intentarlo en unos minutos.";
};

// Qué hacer con la respuesta de una petición de redacción: si es válida, es el
// texto nuevo; si es un error, se conserva el texto que había y se devuelve el
// mensaje para el perito. Así un fallo nunca sustituye contenido válido.
export const respuestaTextoIA = (respuesta, textoActual) => {
  const error = mensajeErrorIA(respuesta);
  return error ? { texto: textoActual, error } : { texto: respuesta, error: null };
};

// ── E6. Marcas Markdown y HTML en los textos ────────────────────────────────
//
// Los textos de la IA traen a veces Markdown (**negrita**) aunque se le pida
// que no. El informe es HTML: los asteriscos salían literales. Además los
// textos se insertaban sin escapar, así que un "<" en un texto podía romper la
// estructura del documento.
//
// Solo se quitan delimitadores que envuelven texto (**x**, __x__, *x*, `x`) y
// las almohadillas de título al principio de línea. No se tocan los guiones de
// lista ni los asteriscos sueltos (p. ej. "2 * 3"), que forman parte del texto.
export const limpiarMarkdown = texto => {
  let t = String(texto ?? "");
  t = t.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, "$1");
  t = t.replace(/__(?=\S)([\s\S]*?\S)__/g, "$1");
  t = t.replace(/(^|[^\w*])\*(?=\S)([^*\n]*?\S)\*(?!\w)/g, "$1$2");
  t = t.replace(/`([^`\n]+)`/g, "$1");
  t = t.replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm, "");
  return t;
};

export const escaparHTML = texto => String(texto ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

// Texto libre (redactado por la IA o por el perito) listo para insertarlo en
// el HTML del informe: nunca un error técnico, sin Markdown, escapado y con
// los saltos de línea como <br/>.
export const textoParaInforme = texto => {
  if (texto == null || esErrorIA(texto)) return "";
  return escaparHTML(limpiarMarkdown(texto).trim()).replace(/\r?\n/g, "<br/>");
};

// ── E3. Texto por defecto de la Sección 1 en Instant Payment ────────────────
//
// Antes decía siempre "Este siniestro se ha gestionado documentalmente.",
// aunque el perito hubiera cambiado la modalidad a presencial o vídeo.
export const textoInstantPorDefecto = (enc = {}) => {
  const loc = enc?.lugarIntervencion || enc?.municipio || "";
  const base = `Localización del riesgo: el riesgo está situado en ${loc}.`;
  return normalizarModalidad(enc?.modalidadVisita) === MODALIDADES.DOCUMENTAL
    ? `${base} Este siniestro se ha gestionado documentalmente.`
    : base;
};

// ── E5. Identificación del perito ───────────────────────────────────────────
//
// El informe decía "emitido por el perito Don <nombre>" y el texto de la IA
// "La perita actuante": dos tratamientos distintos para la misma persona. Se
// deja una forma única, sin tratamiento ni género: "<nombre>, en calidad de
// perito". Los textos de la IA se piden en forma impersonal.
export const fraseEmision = nombre => {
  const n = String(nombre ?? "").trim();
  return `Este informe pericial ha sido emitido por ${n ? escaparHTML(n) + ", en calidad de perito" : "el perito que suscribe"}, ha sido solicitado por el departamento de siniestros de la aseguradora epigrafiada anteriormente, a tenor del siniestro declarado en el riesgo asegurado con póliza suscrita por la precitada aseguradora.`;
};

// ── E10. Importes ───────────────────────────────────────────────────────────
//
// Intl en español no agrupa los números de cuatro cifras ("2470,00") pero sí
// los de cinco o más ("560.400,00"): en la misma tabla del informe salían las
// dos formas. En el informe se agrupan siempre los millares.
export const importeInforme = n =>
  new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: "always" }).format(+n || 0);

// ── E10. Fechas ─────────────────────────────────────────────────────────────
//
// El resto del informe usa dd/mm/aaaa; la consulta meteorológica se guardaba
// como aaaa-mm-dd. Solo se convierte ese formato exacto: cualquier otra cosa
// se deja como está.
export const fechaInforme = v => {
  const t = String(v ?? "").trim();
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : t;
};

// ── E2 / E4. Textos automáticos de la Sección 3 y 4 ─────────────────────────
//
// La Sección 4 guarda en el expediente el texto introductorio y la propuesta
// de indemnización. Se recalculan solos, pero SOLO mientras la pantalla de la
// Sección 4 está abierta. En el informe de prueba se visitó la Sección 4 con
// la tabla vacía y en modo baremo; después se extrajo la tabla del
// presupuesto. El informe imprimió los textos guardados entonces:
//   - "A la espera de aportación de presupuestos o facturas…", con dos
//     presupuestos adjuntos y la tabla sacada de ellos (E4);
//   - "Asegurado: 0,00 €", con una tabla de garantías que daba 2.470,00 € (E2).
//
// La regla de siempre es "el texto automático sigue a los datos mientras el
// perito no lo edite". Al exportar se aplica la misma regla: si el texto
// guardado es automático, se vuelve a generar con los datos actuales; si el
// perito lo editó, se respeta (y la revisión avisa si su importe no cuadra).
export const SEC4_INTROS = [
  "Procedemos a realizar valoración correspondiente, en base al presupuesto aportado por el asegurado.",
  "Procedemos a realizar valoración correspondiente, en base a la factura aportada por el asegurado.",
  "A la espera de aportación de presupuestos o facturas procedemos a realizar valoración unilateral a modo informativo.",
  // E4: valoración propia (baremo) cuando ya constan documentos aportados: no
  // se dice que se esperan.
  "Procedemos a realizar valoración propia a modo informativo.",
  // E4: valoración por presupuesto o factura sin ningún documento adjunto: no
  // se afirma que se haya aportado.
  "Procedemos a realizar la valoración de los daños.",
];

export const sec4IntroAuto = (modo, hayDocumentos = false) => {
  if (modo === "presupuesto") return hayDocumentos ? SEC4_INTROS[0] : SEC4_INTROS[4];
  if (modo === "factura") return hayDocumentos ? SEC4_INTROS[1] : SEC4_INTROS[4];
  return hayDocumentos ? SEC4_INTROS[3] : SEC4_INTROS[2];
};

export const sec4IndemnAuto = (s3, indemn) => {
  const todaSinCob = (s3?.partidas?.length > 0) && getPartidas(s3).length === 0;
  if (todaSinCob) return "NO se propone indemnización.";
  const modo = s3?.modoValoracion || "baremo";
  const reparador = s3?.perceptorTipo === "reparador";
  const perceptor = { reparador: "Reparador", perjudicado: "Perjudicado" }[s3?.perceptorTipo] || "Asegurado";
  const eur = importeInforme(indemn) + " €";
  if (modo === "presupuesto")
    return `A la espera de aportación de la factura, se propone indemnización a valor real sin IVA de la siguiente manera:\n\nINDEMNIZACIÓN:\n${perceptor}: ${eur}`;
  if (modo === "factura" && reparador)
    return `Se propone indemnización de la siguiente manera:\n\nINDEMNIZACIÓN:\nReparador: ${eur}`;
  if (modo === "factura")
    return `Se propone indemnización de la siguiente manera:\n\nINDEMNIZACIÓN:\n${perceptor}: ${eur} (IVA incl.)`;
  // Modo "a modo informativo" (baremo): también se eleva propuesta
  return `Se propone indemnización a modo informativo de la siguiente manera:\n\nINDEMNIZACIÓN:\n${perceptor}: ${eur}`;
};

export const introEsAutomatica = texto => !texto || SEC4_INTROS.includes(texto);

// Texto introductorio de la valoración que lleva el informe.
export const textoIntroVigente = (s4, modo, hayDocumentos) =>
  introEsAutomatica(s4?.textoIntro) ? sec4IntroAuto(modo || "baremo", hayDocumentos) : s4.textoIntro;

// Propuesta de indemnización que lleva el informe.
export const textoIndemnVigente = (s4, s3, indemn) =>
  (s4?.textoIndemnEdited && s4?.textoIndemn) ? s4.textoIndemn : sec4IndemnAuto(s3, indemn);

// ── E3 / E5 / E6 / E10. Reglas que se añaden a toda petición de redacción ───
//
// El texto de la Sección 1 del informe de prueba lo escribió la IA al pulsar
// «Mejorar»: inventó una "inspección ocular directa del inmueble" en un
// expediente documental, llamó al perito "La perita actuante", reformateó la
// dirección y la marcó con **. La petición no le decía nada de eso.
const MODALIDAD_PARA_IA = {
  [MODALIDADES.DOCUMENTAL]: "gestión documental, sin visita al riesgo. No digas que se acudió al inmueble, que hubo visita ni que hubo inspección ocular o presencial.",
  [MODALIDADES.VIDEO]: "vídeo-peritación (inspección remota). No digas que se acudió al inmueble ni que hubo inspección presencial; describe solo lo que el texto diga que se comprobó por vídeo.",
  [MODALIDADES.PRESENCIAL]: "visita presencial al riesgo. Puedes mencionar la visita, pero no inventes lo que se comprobó en ella.",
  [MODALIDADES.SIN_INDICAR]: "no consta. No menciones visitas, inspecciones ni gestión documental.",
};

export const reglasRedaccionIA = (enc = {}) => `REGLAS OBLIGATORIAS:
- Modalidad de la intervención: ${MODALIDAD_PARA_IA[normalizarModalidad(enc?.modalidadVisita)]}
- No inventes actuaciones, comprobaciones, documentos recibidos ni características del inmueble que no figuren en el texto o en los datos.
- Escribe en forma impersonal ("se procedió", "se comprobó"). No nombres al perito ni uses tratamientos o género ("Don", "la perita", "el perito actuante").
- Si citas la dirección, cópiala exactamente como figura en los datos, sin cambiar su formato.
- Texto plano: sin Markdown, sin asteriscos, sin títulos ni listas.`;

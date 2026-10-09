// ─────────────────────────────────────────────────────────────────────────────
// Revisión del informe antes de exportar
//
// Capa de dominio pura: sin React ni red. Se prueba en tests/revisionInforme.test.js.
//
// Comprobaciones deterministas sobre los datos que van a salir en el informe.
// No es un motor de reglas periciales: no decide coberturas ni importes, solo
// detecta que el informe se contradice a sí mismo o que falta algo.
//
// Dos niveles:
//   - "error": el informe saldría mal (contradicción confirmada, texto técnico
//     en lugar de redacción, documento que ya no existe). Cuenta como
//     pendiente: la sección no se da por completa.
//   - "aviso": algo que el perito debe mirar, pero que puede ser correcto
//     (un PDF que no se reproduce, dos documentos con el mismo nombre…).
//
// Ninguno de los dos bloquea la exportación: es el comportamiento documentado
// del panel de revisión ("es un aviso, no un bloqueo", docs/domain/entities/
// REPORT.md). Si se quiere que algún error impida exportar, es una decisión de
// producto pendiente (ver docs/OPEN_QUESTIONS.md, P-29).
// ─────────────────────────────────────────────────────────────────────────────

import { calcIndemnizacion, getPartidas, calcPartida } from "./calculo.js";
import { normalizarModalidad, MODALIDADES } from "./informe.js";
import { esErrorIA, textoIndemnVigente, importeInforme } from "./textosInforme.js";
import { clasificarDocumentos, ESTADO_DOC } from "./anexosInforme.js";

// ── Textos redactados que lleva el informe ──────────────────────────────────
// Misma elección que hacen las exportaciones: un texto con un error técnico
// de la IA cuenta como si no existiera.
const valido = t => (typeof t === "string" && t.trim() && !esErrorIA(t)) ? t : "";
export const textoSeccion2 = (s2 = {}) => valido(s2?.textoAI) || valido(s2?.textoRaw);
export const textoSeccion3 = (s3 = {}) => valido(s3?.textoAI);

// ── E3. Actuaciones incompatibles con la modalidad ──────────────────────────
const PRESENCIALES = [
  /inspecci[oó]n\s+ocular/i,
  /inspecci[oó]n\s+(presencial|in\s+situ|f[ií]sica)/i,
  /reconocimiento\s+(ocular|f[ií]sico|presencial)/i,
  /visita\s+(presencial\s+|t[eé]cnica\s+)?(al|del|en\s+el)\s+(riesgo|inmueble|domicilio|lugar|local|edificio)/i,
  /se\s+person[oó]/i,
  /\bin\s+situ\b/i,
  /(acudi[oó]|se\s+desplaz[oó]|desplazamiento)\s+(al|hasta\s+el|a\s+la)\s+(riesgo|inmueble|domicilio|lugar|vivienda|local)/i,
  /objeto\s+de\s+(la\s+)?inspecci[oó]n/i,
];
const DOCUMENTALES = [
  /gestionad[oa]\s+documentalmente/i,
  /(por\s+)?(sistema|v[ií]a)\s+documental/i,
  /sin\s+(visita|comparecencia|desplazamiento|inspecci[oó]n\s+presencial)/i,
];
const REMOTO = /(v[ií]deo|videollamada|remot[oa]|a\s+distancia)/i;

const coincidencias = (texto, patrones) =>
  patrones.map(p => (String(texto || "").match(p) || [])[0]).filter(Boolean);

// Devuelve { nivel, frases } o null si el texto es compatible con la modalidad.
export const actuacionIncompatible = (texto, modalidad) => {
  const m = normalizarModalidad(modalidad);
  const pres = coincidencias(texto, PRESENCIALES);
  if (m === MODALIDADES.DOCUMENTAL && pres.length) return { nivel: "error", frases: pres };
  if (m === MODALIDADES.VIDEO && pres.length) return { nivel: REMOTO.test(texto) ? "aviso" : "error", frases: pres };
  if (m === MODALIDADES.SIN_INDICAR && pres.length) return { nivel: "aviso", frases: pres };
  if (m === MODALIDADES.PRESENCIAL) {
    const docs = coincidencias(texto, DOCUMENTALES);
    if (docs.length) return { nivel: "error", frases: docs };
  }
  return null;
};

// ── E2. Importe de la propuesta de indemnización ────────────────────────────
// Lee los importes en euros de la propuesta ("Asegurado: 2.470,00 €"). Si el
// texto tiene un bloque "INDEMNIZACIÓN:", solo cuenta lo que va después.
const aNumero = (entero, dec) => parseFloat(String(entero).replace(/\./g, "") + "." + (dec || "0"));
export const importesEnTexto = texto => {
  const t = String(texto || "");
  const i = t.search(/INDEMNIZACI[OÓ]N\s*:/i);
  const tramo = i >= 0 ? t.slice(i) : t;
  const out = [];
  const re = /(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?\s*(?:€|euros?\b)/gi;
  let m;
  while ((m = re.exec(tramo))) out.push(aNumero(m[1], m[2]));
  return out;
};

const NO_PROPONE = /NO\s+se\s+propone\s+indemnizaci[oó]n/i;

// null si cuadra o si no se puede saber (el texto no dice ningún importe).
export const discrepanciaIndemnizacion = (texto, indemn) => {
  const calc = Math.round((+indemn || 0) * 100) / 100;
  if (NO_PROPONE.test(String(texto || ""))) {
    return calc > 0.005 ? { texto: 0, calculo: calc, motivo: "no_propone" } : null;
  }
  const imp = importesEnTexto(texto);
  if (!imp.length) return null;
  const suma = Math.round(imp.reduce((a, b) => a + b, 0) * 100) / 100;
  return Math.abs(suma - calc) > 0.01 ? { texto: suma, calculo: calc, motivo: "importe" } : null;
};

// ── Revisión completa ───────────────────────────────────────────────────────
// `documentos`: facturas y presupuestos tal como los ve la exportación
// (allFacturasOf en Peritia.jsx), con `url` y `perdida`.
// `perito`: datos con los que se va a firmar (perfil).
export const revisarInforme = (cData = {}, { documentos = [], perito = null } = {}) => {
  const enc = cData.encargo || {}, s1 = cData.s1 || {}, s2 = cData.s2 || {}, s3 = cData.s3 || {}, s4 = cData.s4 || {};
  const out = [];
  const add = (nivel, secId, codigo, mensaje) => out.push({ nivel, secId, codigo, mensaje });
  const esInstant = enc.tipoEncargo === "INSTANT_PAYMENT";

  // E1. Errores técnicos de la IA guardados como texto.
  const lugares = [
    ["s1", "Texto de la Sección 1", [s1.textoInstant], esInstant],
    ["s1", "Texto del riesgo", [s1.aiText], true],
    ["s2", "Descripción del siniestro", [s2.textoAI, s2.textoRaw], true],
    ["s2", "Texto meteorológico", [s2.meteo?.texto], true],
    ["s3", "Descripción de los daños", [s3.textoAI], true],
    ["s4", "Texto de valoración", [s4.textoIntro], true],
    ["s4", "Propuesta de indemnización", [s4.textoIndemn], true],
  ];
  for (const [secId, etiqueta, vals, aplica] of lugares) {
    if (!aplica || !vals.some(esErrorIA)) continue;
    const hayOtro = vals.some(v => valido(v));
    add(hayOtro ? "aviso" : "error", secId, "error_ia",
      hayOtro
        ? `${etiqueta}: la última mejora con IA falló y no se usará. El informe llevará tu texto original.`
        : `${etiqueta}: contiene un error técnico de la IA en lugar de la redacción. No se exportará: vuelve a generarlo o escríbelo.`);
  }

  // E3. Actuaciones incompatibles con la modalidad registrada.
  const modalidad = enc.modalidadVisita;
  const redactados = [
    ["s1", "Texto de la Sección 1", esInstant ? valido(s1.textoInstant) : ""],
    ["s1", "Texto del riesgo", valido(s1.aiText)],
    ["s2", "Descripción del siniestro", textoSeccion2(s2)],
    ["s2", "Texto meteorológico", valido(s2.meteo?.texto)],
    ["s3", "Descripción de los daños", textoSeccion3(s3)],
  ];
  const nombreModalidad = { PRESENCIAL: "presencial", VIDEO: "vídeo-peritación", DOCUMENTAL: "documental", "": "sin indicar" }[normalizarModalidad(modalidad)];
  for (const [secId, etiqueta, texto] of redactados) {
    const r = texto && actuacionIncompatible(texto, modalidad);
    if (!r) continue;
    add(r.nivel, secId, "modalidad",
      `${etiqueta}: dice «${r.frases[0]}», pero la modalidad del expediente es ${nombreModalidad}. ` +
      (normalizarModalidad(modalidad) === MODALIDADES.SIN_INDICAR
        ? "Indica la modalidad en Datos del Encargo o revisa el texto."
        : "Corrige el texto para que describa solo lo que se hizo."));
  }

  // E2. La propuesta final frente a la tabla de garantías.
  const indemn = calcIndemnizacion(enc, s1, s3);
  const propuesta = textoIndemnVigente(s4, s3, indemn);
  const d = discrepanciaIndemnizacion(propuesta, indemn);
  if (d) {
    add("error", "s4", "indemnizacion",
      d.motivo === "no_propone"
        ? `La propuesta dice que no se propone indemnización, pero la tabla de garantías da ${importeInforme(d.calculo)} €. Revisa la propuesta o pulsa «Restaurar».`
        : `La propuesta de indemnización dice ${importeInforme(d.texto)} €, pero la tabla de garantías da ${importeInforme(d.calculo)} €. Revisa la propuesta (la editaste a mano) o pulsa «Restaurar».`);
  }

  // Partidas con cobertura sin importe.
  const sinImporte = getPartidas(s3).filter(p => !(calcPartida(p).vReal > 0)).length;
  if (sinImporte) add("aviso", "s3", "partida_sin_importe",
    `${sinImporte} ${sinImporte === 1 ? "partida con cobertura tiene" : "partidas con cobertura tienen"} importe 0 €.`);

  // E4. Valoración por presupuesto o factura sin ningún documento.
  const modo = s3.modoValoracion || "baremo";
  const docs = clasificarDocumentos(documentos);
  if ((modo === "presupuesto" || modo === "factura") && !docs.some(x => x.estado !== ESTADO_DOC.NO_DISPONIBLE)) {
    add("aviso", "s3", "sin_documento",
      `La valoración es por ${modo}, pero no hay ningún ${modo} adjunto. El informe no dirá que se ha aportado.`);
  }

  // E7. Anexos.
  for (const x of docs) {
    const nombre = `${x.tipo || "Documento"} ${x.numero}${x.name ? ` (${x.name})` : ""}`;
    if (x.estado === ESTADO_DOC.NO_DISPONIBLE)
      add("error", "anexos", "anexo_no_disponible", `${nombre}: el archivo no está disponible. Vuelve a adjuntarlo; en el informe saldrá como «no disponible».`);
    else if (x.estado === ESTADO_DOC.NO_REPRODUCIBLE)
      add("aviso", "anexos", "anexo_pdf", `${nombre}: es un PDF y su contenido no se puede reproducir dentro del informe. Saldrá citado en la lista de anexos.`);
    if (x.duplicadoDe)
      add("aviso", "anexos", "anexo_duplicado", `${nombre}: tiene el mismo nombre y tamaño que el documento ${x.duplicadoDe}. Si es el mismo archivo, quita uno.`);
  }

  // E5. Perito que firma.
  if (perito && !String(perito.nombre || "").trim())
    add("aviso", "informe", "perito", "Falta tu nombre de perito. Complétalo en la ventana de exportación.");

  return out;
};

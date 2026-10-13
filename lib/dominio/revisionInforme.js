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
//
// Se analiza frase a frase, no por coincidencia de palabras sueltas. En cada
// frase se mira:
//   1. Qué se afirma: una actuación presencial (inspección ocular, visita,
//      desplazamiento, "in situ" ligado a una comprobación) o que la
//      intervención fue documental.
//   2. Si está negado ("No se realizó inspección ocular", "Sin visita…").
//   3. Quién lo hace: el perito ("el perito", "la perita actuante", "el que
//      suscribe", primera persona del plural) o un tercero ("el fontanero",
//      "el asegurado", "del reparador"…). Lo que hacen terceros no dice nada
//      de cómo intervino el perito.
//   4. En qué texto aparece: la verificación del riesgo y la descripción de
//      los daños las escribe el perito sobre su propia actuación; la
//      descripción del siniestro y el párrafo meteorológico cuentan lo que
//      pasó y quién hizo qué, así que en ellos una frase impersonal no basta
//      para afirmar que el perito acudió.
//
// Resultado: "error" solo cuando la contradicción es inequívoca; "aviso"
// cuando la frase puede referirse al perito pero no lo dice; nada en el resto.

// Frases (y saltos de línea) como unidad de análisis.
const frasesDe = texto => String(texto || "")
  .split(/(?<=[.;!?])\s+|\n+/)
  .map(s => s.trim())
  .filter(Boolean);

// Negación en las palabras previas de la misma frase.
// (?![a-záéíóúñ]) en vez de \b: en JavaScript \b no reconoce el final de una
// palabra que acaba en vocal acentuada ("impidió").
const NEGACION = /\b(no|sin|ni|nunca|tampoco|jam[aá]s|ning[uú]n[oa]?|imposible|impidi[oó])(?![a-záéíóúñ])/i;
const negadaAntes = (frase, idx) => {
  const previas = frase.slice(0, idx).split(/\s+/).filter(Boolean).slice(-6).join(" ");
  return NEGACION.test(previas);
};

// El propio perito como sujeto.
const ACTOR_PERITO = new RegExp([
  String.raw`\b(el|la|este|esta)\s+perit[oa]\b`,
  String.raw`\bperit[oa]\s+(actuante|designad[oa]|firmante|que\s+suscribe)\b`,
  String.raw`\b(el|la|quien)\s+(t[eé]cnic[oa]\s+)?que\s+suscribe\b`,
  String.raw`\b(el|la)\s+abajo\s+firmante\b`,
  String.raw`\b(nos\s+personamos|nos\s+desplazamos|acudimos|visitamos|inspeccionamos|realizamos|efectuamos|procedimos|comprobamos|constatamos|verificamos|reconocimos|comparecimos)\b`,
].join("|"), "i");

// Terceros como sujeto o agente: sustantivo con artículo o preposición
// ("el fontanero", "del reparador", "por la empresa"). Con artículo para no
// confundir el sustantivo "el asegurado" con el adjetivo "riesgo asegurado".
// No cuenta si el tercero solo acompaña o recibe la acción ("con el
// asegurado", "para la empresa"): ahí no es quien actúa.
const ACTOR_TERCERO = new RegExp(
  String.raw`(?<!\b(con|para|ante|junto\s+a|junto\s+con|seg[uú]n)\s)\b(el|la|los|las|un|una|unos|unas|del|al|por\s+el|por\s+la|su|sus)\s+` +
  String.raw`(fontaner[oa]s?|reparador(a|es)?|mantenedor(a|es)?|instalador(a|es)?|operari[oa]s?|bomberos?|polic[ií]as?|vecin[oa]s?|inquilin[oa]s?|propietari[oa]s?|arrendatari[oa]s?|administrador(a|es)?|electricistas?|alba[ñn]il(es)?|cerrajer[oa]s?|pintor(a|es)?|carpinter[oa]s?|empresas?|profesional(es)?|gremios?|asistencia|asegurad[oa]s?|tomador(a|es)?|perjudicad[oa]s?|t[eé]cnic[oa]s?(?!\s+que\s+suscribe)|compa[ñn][ií]a\s+(de\s+)?(agua|gas|luz|suministro)|conserje|porter[oa])\b`,
  "i");

// Afirmaciones de actuación presencial. "fuerte": solo puede referirse a una
// inspección pericial. "debil": un desplazamiento o una visita, que también
// hacen terceros.
const PRESENCIALES = [
  { re: /inspecci[oó]n\s+ocular/i, fuerza: "fuerte" },
  { re: /inspecci[oó]n\s+(presencial|in\s+situ|f[ií]sica)/i, fuerza: "fuerte" },
  { re: /reconocimiento\s+(ocular|f[ií]sico|presencial)/i, fuerza: "fuerte" },
  { re: /visita\s+(pericial|presencial)/i, fuerza: "fuerte" },
  { re: /objeto\s+de\s+(la\s+)?inspecci[oó]n/i, fuerza: "fuerte" },
  { re: /comparecencia(\s+pericial)?\s+en\s+el\s+(riesgo|inmueble|domicilio)/i, fuerza: "fuerte" },
  { re: /(comprob|verific|constat|inspeccion|observ)[a-záéíóúñ]*\s+in\s+situ|\bin\s+situ\s+(se\s+)?(comprob|verific|constat|inspeccion|observ)[a-záéíóúñ]*/i, fuerza: "fuerte" },
  { re: /visita\s+(t[eé]cnica\s+)?(al|del|en\s+el)\s+(riesgo|inmueble|domicilio|lugar|local|edificio|vivienda)/i, fuerza: "debil" },
  { re: /\b(visit(?:[oó]|amos|aron)|se\s+visit[oó])\s+(el|la)\s+(riesgo|inmueble|domicilio|vivienda|local|edificio)/i, fuerza: "debil" },
  { re: /\b(se\s+person(?:[oó]|aron)|nos\s+personamos|person[aá]ndose)(?![a-záéíóúñ])/i, fuerza: "debil" },
  { re: /\b(acudi(?:[oó]|mos|eron)|acudir|se\s+desplaz(?:[oó]|aron)|nos\s+desplazamos|desplazamiento)\s+(al|hasta\s+el|a\s+la|hasta\s+la)\s+(riesgo|inmueble|domicilio|lugar|vivienda|local|edificio)/i, fuerza: "debil" },
];

// Afirmaciones de que la intervención del perito fue documental o sin visita.
// "por vía documental" a secas no basta: se revisan facturas por vía
// documental en cualquier modalidad.
const DOCUMENTALES = [
  /gestionad[oa]\s+documentalmente/i,
  /(funci[oó]n\s+pericial|intervenci[oó]n|peritaci[oó]n|siniestro|expediente)\s+[^.;]{0,40}?(por\s+sistema\s+documental|de\s+forma\s+documental|documentalmente)/i,
  /\bpor\s+sistema\s+documental\b/i,
  /\bno\s+se\s+(ha\s+)?(procedido|realizado|efectuado)\s+(a\s+)?(la\s+)?(comparecencia|visita|inspecci[oó]n)/i,
  /\bsin\s+(visita|comparecencia|desplazamiento|inspecci[oó]n)\s+(presencial\s+|pericial\s+)?(al|en\s+el|del)\s+(riesgo|inmueble|domicilio)/i,
];
const REMOTO = /(v[ií]deo|videollamada|remot[oa]|a\s+distancia)/i;

// Contextos en los que el perito describe su propia actuación.
const CONTEXTOS_PROPIOS = new Set(["riesgo", "danos"]);

// Devuelve { nivel, frases } o null si el texto es compatible con la modalidad.
// `contexto`: "riesgo" (Sección 1, por defecto), "danos" (Sección 3),
// "siniestro" (Sección 2) o "meteo" (párrafo meteorológico).
export const actuacionIncompatible = (texto, modalidad, contexto = "riesgo") => {
  const m = normalizarModalidad(modalidad);
  const propio = CONTEXTOS_PROPIOS.has(contexto);
  const hallazgos = [];
  for (const frase of frasesDe(texto)) {
    const peritoActua = ACTOR_PERITO.test(frase);
    const terceroActua = ACTOR_TERCERO.test(frase);

    if (m === MODALIDADES.PRESENCIAL) {
      for (const re of DOCUMENTALES) {
        const mt = frase.match(re);
        if (!mt) continue;
        // "No se ha procedido a la comparecencia" ya es una negación: no se
        // vuelve a mirar si está negada.
        const esNegacionPropia = /^no\s+se\b/i.test(mt[0]);
        if (!esNegacionPropia && negadaAntes(frase, mt.index)) continue;
        if (terceroActua && !peritoActua) continue;
        hallazgos.push({ nivel: (peritoActua || propio) ? "error" : "aviso", frase: mt[0] });
        break;
      }
      continue;
    }

    for (const { re, fuerza } of PRESENCIALES) {
      const mt = frase.match(re);
      if (!mt) continue;
      if (negadaAntes(frase, mt.index)) continue;          // "No se realizó inspección ocular"
      if (terceroActua && !peritoActua) continue;          // "El fontanero acudió al domicilio"
      let nivel;
      if (m === MODALIDADES.SIN_INDICAR) nivel = "aviso";  // no se puede confirmar nada
      else if (peritoActua) nivel = "error";               // "La perita… inspección ocular"
      else if (propio && fuerza === "fuerte") nivel = "error";
      else nivel = "aviso";                                // impersonal en un relato, o desplazamiento sin sujeto
      if (m === MODALIDADES.VIDEO && REMOTO.test(frase)) nivel = "aviso"; // "inspección ocular por videollamada"
      hallazgos.push({ nivel, frase: mt[0] });
      break;
    }
  }
  if (!hallazgos.length) return null;
  const errores = hallazgos.filter(h => h.nivel === "error");
  const elegidos = errores.length ? errores : hallazgos;
  return { nivel: errores.length ? "error" : "aviso", frases: elegidos.map(h => h.frase) };
};

// ── E2. Importe de la propuesta de indemnización ────────────────────────────
//
// Solo se comparan los importes que la propuesta dice que se pagan: el primer
// importe de cada línea de perceptor ("Asegurado: 2.000,00 €",
// "Reparador: 470,00 €"). Lo que acompaña a ese importe en la misma línea (una
// franquicia o un IVA entre paréntesis) es explicación y no se suma. Si el
// texto tiene un bloque "INDEMNIZACIÓN:", solo cuentan las líneas que siguen.
//
// La comparación se hace con el importe tal como se imprime en la tabla de
// garantías (importeInforme), en céntimos, para que el redondeo sea el mismo.
//
// Si el texto no permite saber con seguridad qué se propone pagar, el
// resultado es "ambiguo" (un aviso), nunca un error confirmado.

// Un número escrito con separadores españoles o con punto decimal.
// Devuelve el importe o null si no se puede saber qué separador es cuál.
export const leerImporte = s => {
  const t = String(s || "").trim();
  if (!/^\d[\d.,]*$/.test(t)) return null;
  const ultimoP = t.lastIndexOf("."), ultimaC = t.lastIndexOf(",");
  let entero = t, dec = "";
  if (ultimoP >= 0 && ultimaC >= 0) {
    // Los dos: el último es el decimal ("2.470,00" o "2,470.00").
    const k = Math.max(ultimoP, ultimaC);
    entero = t.slice(0, k).replace(/[.,]/g, ""); dec = t.slice(k + 1);
    if (!/^\d{1,2}$/.test(dec) || !/^\d{1,3}([.,]\d{3})*$/.test(t.slice(0, k))) return null;
  } else if (ultimaC >= 0) {
    // Solo coma: en español es el decimal ("2470,00"). "2,470" sería ambiguo.
    const partes = t.split(",");
    if (partes.length !== 2 || !/^\d{1,2}$/.test(partes[1])) return null;
    entero = partes[0]; dec = partes[1];
  } else if (ultimoP >= 0) {
    const partes = t.split(".");
    if (partes.length === 2 && /^\d{1,2}$/.test(partes[1])) { entero = partes[0]; dec = partes[1]; } // "2470.00"
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) entero = t.replace(/\./g, "");                         // "2.470"
    else return null;
  }
  return parseFloat(entero + "." + (dec || "0"));
};

const aCentimos = n => Math.round(n * 100);
// Importe tal como lo imprime la tabla de garantías, en céntimos.
const centimosImpresos = indemn => aCentimos(leerImporte(importeInforme(indemn)));

const PERCEPTOR = /^\s*[-•·*]?\s*(asegurad[oa]|reparador[a]?|perjudicad[oa]|tomador[a]?|propietari[oa]|beneficiari[oa]|perceptor|comunidad(?:\s+de\s+propietarios)?)\b[^:\n]{0,40}:\s*(.*)$/i;
const IMPORTE_AL_INICIO = /^(?:€\s*)?(\d[\d.,]*)\s*(?:€|euros?\b)?/i;
const IMPORTE_EN_TEXTO = /(?:€\s*)?(\d[\d.,]*\d|\d)\s*(?:€|euros?\b)/gi;

const tramoPropuesta = texto => {
  const t = String(texto || "");
  const i = t.search(/INDEMNIZACI[OÓ]N\s*:/i);
  return i >= 0 ? t.slice(i) : t;
};

// Líneas de perceptor de la propuesta: { importe } si empiezan por un importe
// legible, { importe: null } si no (p. ej. "Asegurado: según factura").
const lineasPerceptor = texto => tramoPropuesta(texto).split(/\r?\n/)
  .map(l => l.match(PERCEPTOR))
  .filter(Boolean)
  .map(mt => {
    const imp = mt[2].match(IMPORTE_AL_INICIO);
    return { importe: imp ? leerImporte(imp[1]) : null };
  });

// Importes propuestos (uno por perceptor), para mostrar o comparar.
export const importesEnTexto = texto => lineasPerceptor(texto).map(l => l.importe).filter(v => v != null);

const NO_PROPONE = /NO\s+se\s+propone\s+indemnizaci[oó]n/i;
// "NO se propone indemnización para el contenido": la negación es parcial.
const NO_PROPONE_PARCIAL = /NO\s+se\s+propone\s+indemnizaci[oó]n\s+(para|por|respecto|en\s+cuanto|de\s+l[oa]s?|del|al|a\s+l[oa]s?|sobre|en\s+(el|la|los|las))\b/i;

// null si cuadra o si no hay nada que comparar. Si no:
//   { motivo: "importe", texto, calculo }    la propuesta paga otra cifra (error)
//   { motivo: "no_propone", texto: 0, calculo } dice que no se indemniza y la tabla da importe (error)
//   { motivo: "ambiguo", texto: null, calculo } no se puede saber con seguridad (aviso)
export const discrepanciaIndemnizacion = (texto, indemn) => {
  const calcC = centimosImpresos(indemn);
  const calculo = calcC / 100;
  const t = String(texto || "");
  const lineas = lineasPerceptor(t);

  if (lineas.length) {
    if (lineas.some(l => l.importe == null)) return { motivo: "ambiguo", texto: null, calculo };
    const sumaC = lineas.reduce((a, l) => a + aCentimos(l.importe), 0);
    return sumaC === calcC ? null : { motivo: "importe", texto: sumaC / 100, calculo };
  }

  if (NO_PROPONE.test(t)) {
    if (calcC === 0) return null;
    return NO_PROPONE_PARCIAL.test(t)
      ? { motivo: "ambiguo", texto: null, calculo }
      : { motivo: "no_propone", texto: 0, calculo };
  }

  // Sin líneas de perceptor: si hay importes sueltos y ninguno coincide con la
  // tabla, no se puede saber cuál se propone pagar.
  const sueltos = [...tramoPropuesta(t).matchAll(IMPORTE_EN_TEXTO)].map(mt => leerImporte(mt[1]));
  if (!sueltos.length) return null;
  if (sueltos.some(v => v != null && aCentimos(v) === calcC)) return null;
  return { motivo: "ambiguo", texto: null, calculo };
};

// ── Revisión completa ───────────────────────────────────────────────────────
// `documentos`: facturas y presupuestos tal como los ve la exportación
// (allFacturasOf en Peritia.jsx), con `url` y `perdida`.
// `perito`: datos con los que se va a firmar (perfil).
export const revisarInforme = (cData = {}, { documentos = [], perito = null } = {}) => {
  const enc = cData.encargo || {}, s1 = cData.s1 || {}, s2 = cData.s2 || {}, s3 = cData.s3 || {}, s4 = cData.s4 || {};
  const out = [];
  // `informativo`: aviso que se enseña en el panel pero que, por sí solo, no
  // hace que el panel se abra al exportar (p. ej. "este anexo es un PDF").
  const add = (nivel, secId, codigo, mensaje, informativo = false) => out.push({ nivel, secId, codigo, mensaje, informativo });
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
    ["s1", "Texto de la Sección 1", esInstant ? valido(s1.textoInstant) : "", "riesgo"],
    ["s1", "Texto del riesgo", valido(s1.aiText), "riesgo"],
    ["s2", "Descripción del siniestro", textoSeccion2(s2), "siniestro"],
    ["s2", "Texto meteorológico", valido(s2.meteo?.texto), "meteo"],
    ["s3", "Descripción de los daños", textoSeccion3(s3), "danos"],
  ];
  const nombreModalidad = { PRESENCIAL: "presencial", VIDEO: "vídeo-peritación", DOCUMENTAL: "documental", "": "sin indicar" }[normalizarModalidad(modalidad)];
  for (const [secId, etiqueta, texto, contexto] of redactados) {
    const r = texto && actuacionIncompatible(texto, modalidad, contexto);
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
    add(d.motivo === "ambiguo" ? "aviso" : "error", "s4", "indemnizacion",
      d.motivo === "no_propone"
        ? `La propuesta dice que no se propone indemnización, pero la tabla de garantías da ${importeInforme(d.calculo)} €. Revisa la propuesta o pulsa «Restaurar».`
        : d.motivo === "ambiguo"
          ? `No se ha podido identificar con seguridad qué importe paga la propuesta de indemnización. Comprueba que coincide con la tabla de garantías (${importeInforme(d.calculo)} €).`
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
      add("aviso", "anexos", "anexo_pdf", `${nombre}: es un PDF y su contenido no se puede reproducir dentro del informe. Saldrá citado en la lista de anexos.`, true);
    if (x.duplicadoDe)
      add("aviso", "anexos", "anexo_duplicado", x.duplicadoPor === "archivo"
        ? `${nombre}: es el mismo archivo guardado que el documento ${x.duplicadoDe} (se ha adjuntado dos veces). Quita uno si sobra.`
        : `${nombre}: tiene el mismo nombre y tamaño que el documento ${x.duplicadoDe}, aunque son archivos distintos. Comprueba si es el mismo documento.`);
  }

  // E5. Perito que firma.
  if (perito && !String(perito.nombre || "").trim())
    add("aviso", "informe", "perito", "Falta tu nombre de perito. Complétalo en la ventana de exportación.");

  return out;
};

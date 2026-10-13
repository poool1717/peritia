// Qué bloques tiene que tener rellenos la Sección 1 (Verificación del Riesgo)
// para que la revisión antes de exportar, el semáforo de la topbar y cada
// <Block> la den por completa.
//
// Depende del tipo de encargo, porque la pantalla es distinta:
//
// - Peritación: tres bloques — datos del riesgo (estado tras la visita),
//   superficie y arquitectura, y capitales asegurados.
// - Instant Payment: la sección se gestiona documentalmente y la pantalla solo
//   enseña el texto de la sección. No hay visita, ni superficie, ni tipo de
//   construcción, ni estudio de capitales (I-1: el informe Instant tampoco lo
//   imprime). Antes se le exigían igualmente los bloques de peritación, así que
//   la revisión marcaba como pendientes "Datos del Riesgo Asegurado" y
//   "Superficie y Arquitectura" en un expediente Instant ya terminado, y el
//   perito no tenía dónde rellenarlos.
//
// Cada estado es true (hecho), false (falta rellenar) o "error" (relleno pero
// con un dato que no cuadra, ver alertas.js).

import { parseCap } from "./calculo.js";
import { avisosDelRiesgo } from "./alertas.js";
import { esErrorIA } from "./textosInforme.js";

export const esInstantPayment = (enc = {}) => enc?.tipoEncargo === "INSTANT_PAYMENT";

export const ETIQUETAS_S1_PERITACION = ["Datos del Riesgo Asegurado", "Superficie y Arquitectura", "Capitales Asegurados"];
export const ETIQUETAS_S1_INSTANT = ["Texto de la Sección 1"];

export const etiquetasSeccion1 = (enc = {}) =>
  esInstantPayment(enc) ? ETIQUETAS_S1_INSTANT : ETIQUETAS_S1_PERITACION;

export const estadosSeccion1 = (s1 = {}, enc = {}) => {
  const data = s1 || {};
  const e = enc || {};
  // Un error técnico de la IA guardado como texto no cuenta como texto (E1).
  if (esInstantPayment(e)) return [!!String(data.textoInstant || "").trim() && !esErrorIA(data.textoInstant)];

  const capCont = data.capContOverride != null ? parseCap(data.capContOverride) : parseCap(e.capitalContinente);
  // El bloque de capitales puede estar en tres estados, no en dos: relleno,
  // vacío, o relleno CON UN DATO QUE NO CUADRA. El tercero se marca "error"
  // (rojo, "Revisar") en vez de verde, porque un infraseguro absurdo con el
  // semáforo en verde es la peor combinación posible: el informe sale mal y
  // nada lo indica.
  const hayAviso = avisosDelRiesgo(e, data).length > 0;
  return [
    !!data.estado,
    !!(data.superficieConstruida && data.tipoArqKey),
    capCont > 0 ? (hayAviso ? "error" : true) : false,
  ];
};

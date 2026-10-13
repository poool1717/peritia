// ─────────────────────────────────────────────────────────────────────────────
// Reglas de redacción del informe que dependen del tipo de expediente
//
// Capa de dominio pura: sin React. Se prueba en tests/informe.test.js.
// La usan las dos exportaciones (Word y PDF), para que no puedan decir cosas
// distintas.
// ─────────────────────────────────────────────────────────────────────────────

// ── C-1. Modalidad de la intervención y frase de comparecencia ──────────────
//
// En los 150 expedientes reales analizados, 124 de 133 informes declaran que
// NO hubo comparecencia en el riesgo (gestión documental o vídeo-peritación).
// Antes, el informe exportado afirmaba SIEMPRE "se ha procedido a la
// comparecencia pericial en el Riesgo Asegurado", y la extracción del encargo
// rellenaba "PRESENCIAL" por defecto cuando no sabía nada. El encargo no puede
// saberlo: la modalidad la decide el perito después de recibirlo.
//
// Regla: si no consta una visita presencial, el informe no afirma que el
// perito se desplazó al riesgo. Sin dato, redacción neutra.
export const MODALIDADES = {
  PRESENCIAL: "PRESENCIAL",
  VIDEO: "VIDEO",
  DOCUMENTAL: "DOCUMENTAL",
  SIN_INDICAR: "",
};

// Acepta los valores guardados hasta ahora ("PRESENCIAL", "DOCUMENTAL") y
// variantes razonables escritas a mano. Cualquier otra cosa cuenta como "sin
// indicar": nunca se convierte un valor desconocido en una visita presencial.
export const normalizarModalidad = v => {
  const t = String(v ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toUpperCase();
  if (!t) return MODALIDADES.SIN_INDICAR;
  if (t === "PRESENCIAL") return MODALIDADES.PRESENCIAL;
  if (t === "DOCUMENTAL") return MODALIDADES.DOCUMENTAL;
  if (/^(VIDEO|VIDEO[- ]?PERITACION|VIDEOPERITACION|REMOTO|REMOTA)$/.test(t)) return MODALIDADES.VIDEO;
  return MODALIDADES.SIN_INDICAR;
};

// Modalidad con la que nace un expediente al extraer el encargo. Un Instant
// Payment se gestiona documentalmente por definición (la Sección 1 del propio
// informe ya lo dice); en una peritación todavía no se sabe y queda sin indicar
// hasta que el perito la elija.
export const modalidadInicial = ({ tipoEncargo } = {}) =>
  tipoEncargo === "INSTANT_PAYMENT" ? MODALIDADES.DOCUMENTAL : MODALIDADES.SIN_INDICAR;

const COLA_INTRO = "iniciando los trabajos que nos son propios, tendentes a la determinación de las causas y circunstancias del siniestro y a la valoración de los daños consecuentes al mismo, para finalmente elevar propuesta de indemnización a las partes, a tenor de la información conocida hasta la fecha.";

// Párrafo de la introducción del informe sobre cómo se ha intervenido. Las
// redacciones documental y presencial son las que usan los informes reales del
// gabinete; la de vídeo y la neutra siguen el mismo patrón.
export const fraseComparecencia = modalidad => {
  switch (normalizarModalidad(modalidad)) {
    case MODALIDADES.PRESENCIAL:
      return `En cumplimiento de lo requerido, se ha procedido a la comparecencia pericial en el Riesgo Asegurado, realizando la función pericial ${COLA_INTRO}`;
    case MODALIDADES.VIDEO:
      return `En cumplimiento de lo requerido, NO se ha procedido a la comparecencia pericial en el Riesgo Asegurado, realizando la función pericial mediante vídeo-peritación (inspección remota del riesgo), ${COLA_INTRO}`;
    case MODALIDADES.DOCUMENTAL:
      return `En cumplimiento de lo requerido, NO se ha procedido a la comparecencia pericial en el Riesgo Asegurado, realizando la función pericial por sistema documental (digital), ${COLA_INTRO}`;
    default:
      return `En cumplimiento de lo requerido, se ha realizado la función pericial ${COLA_INTRO}`;
  }
};

// ── I-1. Bloque de capitales asegurados en el informe ───────────────────────
//
// Los 63 informes Instant Payment reales no llevan el estudio de capitales
// (valor asegurado, preexistente e infraseguro): en Instant la Sección 1 no
// pide superficie ni tipo de construcción, así que el bloque salía con un
// "valor preexistente 0,00 €" y un "infraseguro 0,00 %" que no son un dato
// pericial. El resumen por garantías de la Sección 4 sí se mantiene: los
// informes Instant reales lo incluyen.
export const muestraCapitalesAsegurados = (enc = {}) => enc?.tipoEncargo !== "INSTANT_PAYMENT";

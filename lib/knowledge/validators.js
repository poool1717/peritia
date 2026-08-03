// lib/knowledge/validators.js
//
// Predicados genéricos, sin conocimiento de negocio ni del modelo de KU.
// schema.js y relationship.js los componen; este archivo no importa nada
// del propio Knowledge Core para poder reutilizarse sin arrastrar el resto.

import { ISO_DATE_PATTERN } from "./constants.js";

export const isNonEmptyString = v => typeof v === "string" && v.trim().length > 0;

export const isPlainObject = v =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export const isArray = v => Array.isArray(v);

export const isArrayOf = (v, itemPredicate) =>
  Array.isArray(v) && v.every(itemPredicate);

export const isInteger = v => Number.isInteger(v);

export const isPositiveInteger = v => Number.isInteger(v) && v > 0;

export const isBoolean = v => typeof v === "boolean";

export const isOneOf = (v, allowed) => allowed.includes(v);

// Acepta null explícito además de una fecha ISO válida — vigenciaHasta usa
// null para "sin fecha de fin", no la ausencia del campo.
export const isIsoDateOrNull = v => v === null || (typeof v === "string" && ISO_DATE_PATTERN.test(v));

export const isIsoDate = v => typeof v === "string" && ISO_DATE_PATTERN.test(v);

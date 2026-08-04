// lib/knowledge/reasoning/condition.js
//
// Lenguaje de condiciones declarativo: una condición es un objeto plano, no
// una función. Es lo que hace que las transiciones de un Workflow y las
// reglas de una Decision sean datos configurables — añadir un ramo nuevo no
// exige escribir código, exige escribir una condición.
//
// Forma de una condición hoja:
//   { campo: "modalidadVisita", operador: "equals", valor: "PRESENCIAL" }
//   { campo: "franquicia", operador: "gte", campoValor: "valorAjustado" }  // compara dos campos del contexto
// Combinadores:
//   { todas: [condicion, condicion, ...] }   — AND
//   { alguna: [condicion, condicion, ...] }  — OR
//   { no: condicion }                        — NOT
// Sin condición (null/undefined) significa "siempre se cumple".

import { isPlainObject, isArray } from "../validators.js";

const OPERADORES = Object.freeze([
  "equals", "notEquals", "exists", "notExists",
  "in", "notIn", "gt", "gte", "lt", "lte",
]);

// Acceso por ruta con puntos: "data.franquicia" → context.data.franquicia
function getField(context, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), context);
}

export function evaluateCondition(condicion, context) {
  if (condicion == null) return true;
  if (!isPlainObject(condicion)) {
    throw new TypeError("la condición debe ser un objeto plano o null");
  }

  if ("todas" in condicion) return condicion.todas.every(c => evaluateCondition(c, context));
  if ("alguna" in condicion) return condicion.alguna.some(c => evaluateCondition(c, context));
  if ("no" in condicion) return !evaluateCondition(condicion.no, context);

  const izquierda = getField(context, condicion.campo);
  const derecha = "campoValor" in condicion ? getField(context, condicion.campoValor) : condicion.valor;

  switch (condicion.operador) {
    case "equals":    return izquierda === derecha;
    case "notEquals": return izquierda !== derecha;
    case "exists":    return izquierda !== undefined && izquierda !== null;
    case "notExists": return izquierda === undefined || izquierda === null;
    case "in":        return Array.isArray(derecha) && derecha.includes(izquierda);
    case "notIn":     return Array.isArray(derecha) && !derecha.includes(izquierda);
    case "gt":        return izquierda != null && derecha != null && izquierda > derecha;
    case "gte":       return izquierda != null && derecha != null && izquierda >= derecha;
    case "lt":        return izquierda != null && derecha != null && izquierda < derecha;
    case "lte":       return izquierda != null && derecha != null && izquierda <= derecha;
    default:
      throw new TypeError(`operador de condición desconocido: ${condicion.operador}`);
  }
}

// {valid, errors} — validación estructural de la condición en sí (no la evalúa).
export function validateCondition(condicion) {
  if (condicion == null) return { valid: true, errors: [] };
  if (!isPlainObject(condicion)) return { valid: false, errors: ["la condición debe ser un objeto"] };

  if ("todas" in condicion || "alguna" in condicion) {
    const lista = condicion.todas ?? condicion.alguna;
    if (!isArray(lista)) return { valid: false, errors: ["todas/alguna debe ser un array de condiciones"] };
    const errores = lista.flatMap((c, i) => validateCondition(c).errors.map(e => `[${i}] ${e}`));
    return { valid: errores.length === 0, errors: errores };
  }
  if ("no" in condicion) return validateCondition(condicion.no);

  const errors = [];
  if (typeof condicion.campo !== "string" || !condicion.campo) errors.push("campo debe ser una cadena no vacía");
  if (!OPERADORES.includes(condicion.operador)) errors.push(`operador debe ser uno de: ${OPERADORES.join(", ")}`);
  if (!("valor" in condicion) && !("campoValor" in condicion) && !["exists", "notExists"].includes(condicion.operador)) {
    errors.push("la condición necesita 'valor' o 'campoValor' salvo que el operador sea exists/notExists");
  }
  return { valid: errors.length === 0, errors };
}

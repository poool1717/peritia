// lib/knowledge/reasoning/evidence.js
//
// Una pieza de evidencia individual que respalda una decisión (BR-25:
// "toda conclusión debe estar respaldada por evidencia"). El nivel de
// confianza reutiliza CONFIANZA de lib/knowledge/types.js (KP-01) — no se
// inventa una escala nueva donde ya existe una.

import { CONFIANZA } from "../types.js";
import { isNonEmptyString, isPlainObject, isOneOf } from "../validators.js";
import { SchemaValidationError } from "../errors.js";

export const EVIDENCIA_TIPOS = Object.freeze([
  "documento",              // póliza, factura, presupuesto...
  "fotografia",
  "dato_extraido",          // de una capacidad de IA (docs/AI_INVENTORY.md)
  "verificacion_externa",   // Catastro, XEMA/meteocat
  "declaracion_perito",     // observación directa del perito
]);

export function createEvidence(data) {
  if (!isPlainObject(data)) throw new SchemaValidationError(["evidence debe ser un objeto"]);
  const evidence = {
    id: data.id,
    tipo: data.tipo,
    descripcion: data.descripcion,
    fuente: data.fuente,
    confianza: data.confianza ?? "sin_verificar",
  };
  return assertValidEvidence(evidence);
}

export function validateEvidence(evidence) {
  if (!isPlainObject(evidence)) return { valid: false, errors: ["evidence debe ser un objeto"] };
  const errors = [];
  if (!isNonEmptyString(evidence.id)) errors.push("id debe ser una cadena no vacía");
  if (!isOneOf(evidence.tipo, EVIDENCIA_TIPOS)) errors.push(`tipo debe ser uno de: ${EVIDENCIA_TIPOS.join(", ")}`);
  if (!isNonEmptyString(evidence.descripcion)) errors.push("descripcion debe ser una cadena no vacía");
  if (!isNonEmptyString(evidence.fuente)) errors.push("fuente debe ser una cadena no vacía");
  if (!isOneOf(evidence.confianza, CONFIANZA)) errors.push(`confianza debe ser una de: ${CONFIANZA.join(", ")}`);
  return { valid: errors.length === 0, errors };
}

export function assertValidEvidence(evidence) {
  const { valid, errors } = validateEvidence(evidence);
  if (!valid) throw new SchemaValidationError(errors, isPlainObject(evidence) ? evidence.id : undefined);
  return evidence;
}

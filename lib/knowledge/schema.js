// lib/knowledge/schema.js
//
// Validación del sobre de metadatos común de una KU (knowledge/architecture/
// KNOWLEDGE_ARCHITECTURE.md §1.1), contrastado contra la forma real de las
// fichas ya existentes en knowledge/coverages/ y su plantilla
// (knowledge/templates/COVERAGE_TEMPLATE.md) — no contra el ejemplo
// ilustrativo del documento, que diverge en dos puntos:
//   1. el documento usa `fuente` (objeto); las fichas reales usan `fuentes`
//      (array). Este validador acepta cualquiera de las dos formas si está
//      presente, y no exige ninguna (ver REQUIRED_FIELDS).
//   2. el documento no menciona `idioma` ni `historial`; las fichas reales
//      los llevan. Se validan si están presentes, sin exigirlos.
//
// Campos específicos de un tipo concreto (p. ej. `codigo`, `bloques` de
// `coverage`) no se validan aquí — son responsabilidad de un validador por
// tipo que no existe todavía (fuera de alcance de este incremento).

import { ESTADOS, CONFIANZA, FUENTE_TIPOS, KU_TYPES, KU_TYPE_FOLDERS } from "./types.js";
import {
  isNonEmptyString, isPlainObject, isPositiveInteger, isOneOf,
  isIsoDate, isIsoDateOrNull, isArrayOf,
} from "./validators.js";
import { isValidIdentifier, parseIdentifier } from "./identifier.js";
import { validateRelaciones } from "./relationship.js";
import { SchemaValidationError } from "./errors.js";

// Campos que toda KU, sea cual sea su tipo, debe tener — la intersección
// estable entre el documento de arquitectura y las fichas reales.
export const REQUIRED_FIELDS = Object.freeze([
  "id", "tipo", "version", "estado", "vigenciaDesde", "vigenciaHasta",
  "ambito", "confianza", "autor", "relaciones",
]);

// {valid, errors} — nunca lanza; acumula todos los problemas encontrados
// para que quien valide un lote (futuro cargador) los reporte todos de una
// vez, no uno por intento.
export function validateEnvelope(ku) {
  const errors = [];
  if (!isPlainObject(ku)) {
    return { valid: false, errors: ["la KU debe ser un objeto"] };
  }

  for (const campo of REQUIRED_FIELDS) {
    if (!(campo in ku)) errors.push(`falta el campo obligatorio "${campo}"`);
  }
  if (errors.length) return { valid: false, errors }; // sin los básicos, no tiene sentido seguir

  if (!isNonEmptyString(ku.id) || !isValidIdentifier(ku.id)) {
    errors.push(`id inválido: ${JSON.stringify(ku.id)}`);
  } else {
    // El tipo embebido en el id (carpeta plural) debe coincidir con `tipo`.
    const { tipoPlural } = parseIdentifier(ku.id);
    const pluralEsperado = KU_TYPE_FOLDERS[ku.tipo];
    if (pluralEsperado && tipoPlural !== pluralEsperado) {
      errors.push(`id (${tipoPlural}) no coincide con tipo (${ku.tipo} → ${pluralEsperado})`);
    }
  }

  if (!isOneOf(ku.tipo, KU_TYPES)) errors.push(`tipo debe ser uno de: ${KU_TYPES.join(", ")}`);
  if (!isPositiveInteger(ku.version)) errors.push("version debe ser un entero positivo");
  if (!isOneOf(ku.estado, ESTADOS)) errors.push(`estado debe ser uno de: ${ESTADOS.join(", ")}`);
  if (!isIsoDate(ku.vigenciaDesde)) errors.push("vigenciaDesde debe ser una fecha AAAA-MM-DD");
  if (!isIsoDateOrNull(ku.vigenciaHasta)) errors.push("vigenciaHasta debe ser una fecha AAAA-MM-DD o null");
  if (ku.vigenciaHasta !== null && isIsoDate(ku.vigenciaDesde) && isIsoDate(ku.vigenciaHasta) && ku.vigenciaHasta < ku.vigenciaDesde) {
    errors.push("vigenciaHasta no puede ser anterior a vigenciaDesde");
  }
  if (!isOneOf(ku.confianza, CONFIANZA)) errors.push(`confianza debe ser una de: ${CONFIANZA.join(", ")}`);
  if (!isNonEmptyString(ku.autor)) errors.push("autor debe ser una cadena no vacía");

  errors.push(...validateAmbito(ku.ambito));
  const rel = validateRelaciones(ku.relaciones);
  if (!rel.valid) errors.push(...rel.errors);

  if ("idioma" in ku && !isNonEmptyString(ku.idioma)) errors.push("idioma debe ser una cadena no vacía si está presente");
  if ("revisadoPor" in ku && ku.revisadoPor !== null && !isNonEmptyString(ku.revisadoPor)) {
    errors.push("revisadoPor debe ser una cadena no vacía o null");
  }
  if ("fuente" in ku) errors.push(...validateFuente(ku.fuente, "fuente"));
  if ("fuentes" in ku) errors.push(...validateFuentesArray(ku.fuentes));
  if ("historial" in ku) errors.push(...validateHistorial(ku.historial));

  return { valid: errors.length === 0, errors };
}

export function assertValidEnvelope(ku) {
  const { valid, errors } = validateEnvelope(ku);
  if (!valid) throw new SchemaValidationError(errors, isPlainObject(ku) ? ku.id : undefined);
  return ku;
}

function validateAmbito(ambito) {
  const errors = [];
  if (!isPlainObject(ambito)) return ["ambito debe ser un objeto"];
  if ("ramo" in ambito && ambito.ramo !== null && !isArrayOf(ambito.ramo, isNonEmptyString)) {
    errors.push("ambito.ramo debe ser un array de cadenas no vacías, o null");
  }
  if ("aseguradora" in ambito && ambito.aseguradora !== null && !isNonEmptyString(ambito.aseguradora)) {
    errors.push("ambito.aseguradora debe ser una cadena no vacía o null");
  }
  if ("provincia" in ambito && ambito.provincia !== null && !isNonEmptyString(ambito.provincia)) {
    errors.push("ambito.provincia debe ser una cadena no vacía o null");
  }
  return errors;
}

function validateFuente(fuente, campo) {
  if (!isPlainObject(fuente)) return [`${campo} debe ser un objeto`];
  const errors = [];
  if (!isOneOf(fuente.tipo, FUENTE_TIPOS)) errors.push(`${campo}.tipo debe ser uno de: ${FUENTE_TIPOS.join(", ")}`);
  if ("referencia" in fuente && fuente.referencia !== null && !isNonEmptyString(fuente.referencia)) {
    errors.push(`${campo}.referencia debe ser una cadena no vacía o null`);
  }
  return errors;
}

function validateFuentesArray(fuentes) {
  if (!Array.isArray(fuentes)) return ["fuentes debe ser un array"];
  return fuentes.flatMap((f, i) => validateFuente(f, `fuentes[${i}]`));
}

function validateHistorial(historial) {
  if (!Array.isArray(historial)) return ["historial debe ser un array"];
  return historial.flatMap((h, i) => {
    if (!isPlainObject(h)) return [`historial[${i}] debe ser un objeto`];
    const errors = [];
    if (!isPositiveInteger(h.version)) errors.push(`historial[${i}].version debe ser un entero positivo`);
    if (!isIsoDate(h.fecha)) errors.push(`historial[${i}].fecha debe ser una fecha AAAA-MM-DD`);
    if (!isNonEmptyString(h.autor)) errors.push(`historial[${i}].autor debe ser una cadena no vacía`);
    if (!isOneOf(h.estado, ESTADOS)) errors.push(`historial[${i}].estado debe ser uno de: ${ESTADOS.join(", ")}`);
    return errors;
  });
}

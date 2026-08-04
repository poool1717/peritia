// lib/knowledge/coverage/coverage.js
//
// La garantía canónica (Coverage), siempre independiente de aseguradora
// (COVERAGE_TEMPLATE.md: "ambito.aseguradora: SIEMPRE null. Cómo llama cada
// compañía a esta garantía... vive en knowledge/mappings/COMPANIES.md,
// nunca en esta ficha"). Un Coverage es, además, una KU de tipo `coverage`
// —reutiliza y no duplica la validación del sobre de metadatos ya escrita
// en KP-01 (lib/knowledge/schema.js)— con los campos propios de esta
// categoría por encima.

import { validateEnvelope } from "../schema.js";
import { validateRelaciones } from "../relationship.js";
import { isNonEmptyString, isPlainObject, isBoolean, isArrayOf } from "../validators.js";
import { SchemaValidationError } from "../errors.js";
import { validateExclusion } from "./exclusion.js";
import { validateLimit } from "./limit.js";

// Las 11 categorías de knowledge/templates/COVERAGE_TEMPLATE.md más
// `partidas`, extensión de este EPIC (KP-02) documentada en el informe de
// cierre: la plantilla no tiene hueco para "qué partidas del baremo suelen
// aplicarse" — la relación más cercana en ONTOLOGY.md es indirecta (Método
// → genera → Coste) — así que se declara aquí una categoría propia en vez
// de forzarla dentro de `metodos`.
export const RELACION_CATEGORIAS = Object.freeze([
  "garantias", "subgarantias", "objetos", "materiales", "danos", "causas",
  "metodos", "normativa", "documentacion", "fotografias", "procedimientos",
  "partidas",
]);

// Normaliza (rellena categorías de relaciones y campos opcionales
// ausentes con su valor por defecto) y valida. Lanza SchemaValidationError
// si el resultado no es válido; si lo es, devuelve el objeto normalizado.
export function createCoverage(data) {
  if (!isPlainObject(data)) throw new SchemaValidationError(["coverage debe ser un objeto"]);

  const relaciones = { ...Object.fromEntries(RELACION_CATEGORIAS.map(c => [c, []])), ...(data.relaciones || {}) };
  const coverage = {
    ...data,
    tipo: "coverage",
    bloques: { continente: false, contenido: false, ...(data.bloques || {}) },
    alcance: { continente: null, contenido: null, ...(data.alcance || {}) },
    exclusiones: data.exclusiones || [],
    limites: data.limites || [],
    requiereVerificacionExterna: data.requiereVerificacionExterna ?? false,
    relaciones,
  };

  return assertValidCoverage(coverage);
}

// {valid, errors} — no lanza.
export function validateCoverage(coverage) {
  if (!isPlainObject(coverage)) return { valid: false, errors: ["coverage debe ser un objeto"] };

  const envelope = validateEnvelope(coverage);
  const errors = [...envelope.errors];

  if (coverage.tipo !== "coverage") errors.push('tipo debe ser "coverage"');
  if (!isNonEmptyString(coverage.codigo)) errors.push("codigo debe ser una cadena no vacía");

  if (!isPlainObject(coverage.bloques)) {
    errors.push("bloques debe ser un objeto");
  } else if (!coverage.bloques.continente && !coverage.bloques.contenido) {
    // COVERAGE_TEMPLATE.md, reglas de validación: "Al menos uno de
    // bloques.continente / bloques.contenido es true."
    errors.push("bloques: al menos uno de continente/contenido debe ser true");
  }

  if (!isPlainObject(coverage.alcance)) {
    errors.push("alcance debe ser un objeto");
  } else {
    for (const bloque of ["continente", "contenido"]) {
      const v = coverage.alcance[bloque];
      if (v !== null && v !== undefined && !isNonEmptyString(v)) {
        errors.push(`alcance.${bloque} debe ser una cadena no vacía o null`);
      }
    }
  }

  errors.push(...validarListaDe(coverage.exclusiones, "exclusiones", validateExclusion));
  errors.push(...validarListaDe(coverage.limites, "limites", validateLimit));

  if (isPlainObject(coverage.ambito) && coverage.ambito.aseguradora !== null && coverage.ambito.aseguradora !== undefined) {
    // COVERAGE_TEMPLATE.md: "ambito.aseguradora: SIEMPRE null. [...] Es la
    // regla que hace cumplible la independencia de aseguradora (BR-38)."
    errors.push("ambito.aseguradora debe ser siempre null en un Coverage canónico — las reglas por aseguradora van en un InsurerOverride, no aquí");
  }

  if (coverage.requiereVerificacionExterna === true) {
    const procedimientos = coverage.relaciones?.procedimientos;
    if (!Array.isArray(procedimientos) || procedimientos.length === 0) {
      // COVERAGE_TEMPLATE.md: "Si requiereVerificacionExterna es true,
      // relaciones.procedimientos referencia el procedimiento de
      // verificación correspondiente."
      errors.push("requiereVerificacionExterna es true pero relaciones.procedimientos está vacío");
    }
  }

  if (isPlainObject(coverage.relaciones)) {
    const rel = validateRelaciones(coverage.relaciones);
    if (!rel.valid) errors.push(...rel.errors);
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidCoverage(coverage) {
  const { valid, errors } = validateCoverage(coverage);
  if (!valid) throw new SchemaValidationError(errors, isPlainObject(coverage) ? coverage.id : undefined);
  return coverage;
}

function validarListaDe(lista, nombre, validador) {
  if (!Array.isArray(lista)) return [`${nombre} debe ser un array`];
  return lista.flatMap((item, i) => {
    const { valid, errors } = validador(item);
    return valid ? [] : errors.map(e => `${nombre}[${i}]: ${e}`);
  });
}

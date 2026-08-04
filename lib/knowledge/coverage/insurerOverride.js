// lib/knowledge/coverage/insurerOverride.js
//
// Lo que una aseguradora concreta cambia sobre una garantía canónica. Existe
// porque el Coverage canónico tiene prohibido llevar nada específico de
// aseguradora (ver coverage.js) — este es el sitio correcto para ello.
//
// Le da forma, sin resolverlo, a un hueco ya documentado: DT-05 (lógica de
// AXA incrustada en el código) y P-08 (¿las reglas de selección de capital
// son de negocio o heurísticas?, aún sin respuesta). `reglasSeleccionCapital`
// es, deliberadamente, un texto libre por ahora — estructurarlo como regla
// ejecutable es trabajo de un incremento posterior, no de este EPIC.

import { isValidIdentifier } from "../identifier.js";
import { isNonEmptyString, isPlainObject, isArrayOf } from "../validators.js";
import { SchemaValidationError } from "../errors.js";
import { validateExclusion } from "./exclusion.js";
import { validateLimit } from "./limit.js";

export function createInsurerOverride(data) {
  if (!isPlainObject(data)) throw new SchemaValidationError(["insurerOverride debe ser un objeto"]);
  const override = {
    coverageId: data.coverageId,
    aseguradora: data.aseguradora,
    nombreComercial: data.nombreComercial ?? null,
    alcance: data.alcance ? { ...data.alcance } : {},
    exclusionesAdicionales: data.exclusionesAdicionales || [],
    exclusionesNoAplicables: data.exclusionesNoAplicables || [],
    limitesEspecificos: data.limitesEspecificos || [],
    reglasSeleccionCapital: data.reglasSeleccionCapital ?? null,
  };
  return assertValidInsurerOverride(override);
}

export function validateInsurerOverride(override) {
  if (!isPlainObject(override)) return { valid: false, errors: ["insurerOverride debe ser un objeto"] };
  const errors = [];

  if (!isNonEmptyString(override.coverageId) || !isValidIdentifier(override.coverageId)) {
    errors.push("coverageId debe ser un identificador knowledge:// válido");
  }
  if (!isNonEmptyString(override.aseguradora)) {
    errors.push("aseguradora debe ser una cadena no vacía");
  }
  if (override.nombreComercial != null && !isNonEmptyString(override.nombreComercial)) {
    errors.push("nombreComercial debe ser una cadena no vacía o null");
  }
  if (!isPlainObject(override.alcance)) {
    errors.push("alcance debe ser un objeto");
  } else {
    for (const bloque of ["continente", "contenido"]) {
      const v = override.alcance[bloque];
      if (v !== undefined && v !== null && !isNonEmptyString(v)) {
        errors.push(`alcance.${bloque} debe ser una cadena no vacía o null`);
      }
    }
  }
  errors.push(...validarListaDe(override.exclusionesAdicionales, "exclusionesAdicionales", validateExclusion));
  errors.push(...validarListaDe(override.limitesEspecificos, "limitesEspecificos", validateLimit));
  if (!isArrayOf(override.exclusionesNoAplicables, isNonEmptyString)) {
    errors.push("exclusionesNoAplicables debe ser un array de cadenas no vacías");
  }
  if (override.reglasSeleccionCapital != null && !isNonEmptyString(override.reglasSeleccionCapital)) {
    errors.push("reglasSeleccionCapital debe ser una cadena no vacía o null");
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidInsurerOverride(override) {
  const { valid, errors } = validateInsurerOverride(override);
  if (!valid) throw new SchemaValidationError(errors);
  return override;
}

function validarListaDe(lista, nombre, validador) {
  if (!Array.isArray(lista)) return [`${nombre} debe ser un array`];
  return lista.flatMap((item, i) => {
    const { valid, errors } = validador(item);
    return valid ? [] : errors.map(e => `${nombre}[${i}]: ${e}`);
  });
}

// lib/knowledge/coverage/coverageEngine.js
//
// Compone un Coverage canónico con, opcionalmente, InsurerOverride[] y
// responde las preguntas semánticas sobre esa garantía. No resuelve
// identificadores contra contenido real — eso exige el cargador, fuera de
// alcance de este EPIC (KP-02). Cada método devuelve identificadores
// knowledge:// o datos estructurados propios del Coverage/InsurerOverride
// que se le pasaron.

import { assertValidCoverage } from "./coverage.js";
import { assertValidInsurerOverride } from "./insurerOverride.js";
import { stripVersion } from "../identifier.js";
import { SchemaValidationError } from "../errors.js";

export function createCoverageEngine(coverage, { insurerOverrides = [] } = {}) {
  assertValidCoverage(coverage);
  insurerOverrides.forEach(assertValidInsurerOverride);

  const coverageIdBase = stripVersion(coverage.id);
  const desajustados = insurerOverrides.filter(o => stripVersion(o.coverageId) !== coverageIdBase);
  if (desajustados.length) {
    throw new SchemaValidationError(
      desajustados.map(o => `InsurerOverride de "${o.aseguradora}" referencia ${o.coverageId}, no ${coverage.id}`),
      coverage.id
    );
  }

  function findOverride(aseguradora) {
    if (!aseguradora) return null;
    return insurerOverrides.find(o => o.aseguradora === aseguradora) || null;
  }

  // Qué cubre — alcance por bloque, con el override de la aseguradora si se pide.
  function getCoveredScope({ aseguradora } = {}) {
    const override = findOverride(aseguradora);
    return {
      continente: override?.alcance?.continente ?? coverage.alcance.continente,
      contenido: override?.alcance?.contenido ?? coverage.alcance.contenido,
    };
  }

  // Qué no cubre — exclusiones canónicas, menos las que la aseguradora
  // declara que no le aplican, más las que añade.
  function getExclusions({ aseguradora } = {}) {
    const override = findOverride(aseguradora);
    if (!override) return [...coverage.exclusiones];
    const noAplicables = new Set(override.exclusionesNoAplicables);
    const base = coverage.exclusiones.filter(e => !noAplicables.has(e.descripcion));
    return [...base, ...override.exclusionesAdicionales];
  }

  // Límites — no es una de las 9 preguntas pedidas, pero es el complemento
  // natural de getExclusions() sobre la misma relación de ONTOLOGY.md (§8),
  // con la misma composición por aseguradora.
  function getLimits({ aseguradora } = {}) {
    const override = findOverride(aseguradora);
    return override ? [...coverage.limites, ...override.limitesEspecificos] : [...coverage.limites];
  }

  function getProtectedObjects() {
    return [...coverage.relaciones.objetos];
  }

  function getTriggeredDamages() {
    return [...coverage.relaciones.danos];
  }

  function getAffectedMaterials() {
    return [...coverage.relaciones.materiales];
  }

  // Documentación y fotografías por separado: son categorías distintas en
  // la plantilla (documentacion vs. fotografias), aunque ambas respondan a
  // "qué evidencias requiere".
  function getRequiredEvidence() {
    return {
      documentacion: [...coverage.relaciones.documentacion],
      fotografias: [...coverage.relaciones.fotografias],
    };
  }

  function getRepairMethods() {
    return [...coverage.relaciones.metodos];
  }

  function getApplicableBaremoItems() {
    return [...coverage.relaciones.partidas];
  }

  // null si no hay reglas específicas para esa aseguradora — no es un error,
  // es la respuesta correcta cuando la garantía se aplica igual para todos.
  function getInsurerRules(aseguradora) {
    return findOverride(aseguradora);
  }

  return {
    getCoveredScope,
    getExclusions,
    getLimits,
    getProtectedObjects,
    getTriggeredDamages,
    getAffectedMaterials,
    getRequiredEvidence,
    getRepairMethods,
    getApplicableBaremoItems,
    getInsurerRules,
  };
}

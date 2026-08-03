// lib/knowledge/registry.js
//
// Almacén en memoria de KU, indexado por identificador y versión. No sabe
// leer archivos (eso es el cargador, fuera de este incremento) ni decidir
// qué versión está vigente en una fecha concreta (eso es resolver.js) — solo
// guarda lo que se le registra y lo devuelve por identificador/versión.
//
// Se expone como fábrica (`createRegistry()`) en vez de un módulo con
// estado global: cada test, y cada consumidor futuro que lo necesite,
// trabaja con su propia instancia sin pisarse.

import { assertValidEnvelope } from "./schema.js";
import { parseIdentifier, buildIdentifier } from "./identifier.js";
import { DuplicateIdentifierError } from "./errors.js";

export function createRegistry() {
  // idBase (sin versión) → Map(version → ku)
  const store = new Map();

  const idBaseOf = id => {
    const { tipoPlural, slug } = parseIdentifier(id);
    return buildIdentifier({ tipoPlural, slug });
  };

  const highestVersion = versions => Math.max(...versions.keys());

  function register(ku) {
    assertValidEnvelope(ku);
    const idBase = idBaseOf(ku.id);
    if (!store.has(idBase)) store.set(idBase, new Map());
    const versions = store.get(idBase);
    if (versions.has(ku.version)) throw new DuplicateIdentifierError(idBase, ku.version);
    versions.set(ku.version, ku);
    return ku;
  }

  // Sin `version` explícita (ni en `id`, ni en `opts.version`) devuelve la
  // versión más alta registrada — "la más reciente que conocemos", no
  // necesariamente "la vigente hoy" (eso lo decide resolver.js con fechas).
  function get(id, opts = {}) {
    const parsed = parseIdentifier(id);
    const idBase = idBaseOf(id);
    const versions = store.get(idBase);
    if (!versions) return undefined;
    const version = opts.version ?? parsed.version;
    if (version != null) return versions.get(version);
    return versions.get(highestVersion(versions));
  }

  function has(id, opts = {}) {
    return get(id, opts) !== undefined;
  }

  // Todas las versiones registradas de un id, ordenadas de más antigua a más nueva.
  function getAllVersions(id) {
    const versions = store.get(idBaseOf(id));
    if (!versions) return [];
    return [...versions.keys()].sort((a, b) => a - b).map(v => versions.get(v));
  }

  // {tipo, estado, latestOnly} — todos opcionales. latestOnly=true (por
  // defecto) devuelve solo la versión más alta de cada id; false devuelve
  // también las históricas.
  function list({ tipo, estado, latestOnly = true } = {}) {
    const resultado = [];
    for (const versions of store.values()) {
      const kus = latestOnly ? [versions.get(highestVersion(versions))] : [...versions.values()];
      for (const ku of kus) {
        if (tipo && ku.tipo !== tipo) continue;
        if (estado && ku.estado !== estado) continue;
        resultado.push(ku);
      }
    }
    return resultado;
  }

  function clear() {
    store.clear();
  }

  function size() {
    let total = 0;
    for (const versions of store.values()) total += versions.size;
    return total;
  }

  return { register, get, has, getAllVersions, list, clear, size };
}

// Instancia compartida de conveniencia. Los tests, y cualquier código que
// quiera aislamiento, deben preferir `createRegistry()` en vez de esta.
export const defaultRegistry = createRegistry();

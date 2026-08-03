// lib/knowledge/resolver.js
//
// Resuelve un identificador a una única KU concreta, aplicando las reglas
// ya fijadas en knowledge/architecture/KNOWLEDGE_ARCHITECTURE.md:
//   §4 — "solo una KU en estado aprobado se considera vigente y consumible"
//   §7 — "sin sufijo de versión resuelve siempre a la vigente; con sufijo,
//         resuelve a esa versión exacta, con independencia de si sigue vigente"
//
// No sabe cargar nada de disco: opera sobre un lib/knowledge/registry.js ya
// poblado (por ahora, a mano — el cargador es un incremento futuro).

import { parseIdentifier } from "./identifier.js";
import { NotFoundError, AmbiguousReferenceError } from "./errors.js";
import { isNonEmptyString } from "./validators.js";

export function createResolver(registry) {
  // opts:
  //   asOf            — fecha AAAA-MM-DD a la que resolver (por defecto, hoy)
  //   ambito           — {ramo, aseguradora, provincia}, filtra por coincidencia
  //   requireApproved — por defecto true; false permite ver borrador/en_revision
  //                      (para herramientas internas, nunca para IA de cara al perito)
  function resolve(id, opts = {}) {
    const { asOf = todayIso(), ambito, requireApproved = true } = opts;
    const parsed = parseIdentifier(id);

    // Pinned a una versión concreta: se devuelve tal cual, sin filtrar por
    // estado ni vigencia — es exactamente lo que "#vN" promete.
    if (parsed.version != null) {
      const ku = registry.get(id);
      if (!ku) throw new NotFoundError(id);
      return ku;
    }

    const versiones = registry.getAllVersions(id);
    if (!versiones.length) throw new NotFoundError(id);

    let candidatas = versiones.filter(ku =>
      (!requireApproved || ku.estado === "aprobado") && vigenteEn(ku, asOf)
    );
    if (ambito) candidatas = candidatas.filter(ku => ambitoCoincide(ku.ambito, ambito));

    if (!candidatas.length) throw new NotFoundError(id);
    if (candidatas.length > 1) {
      throw new AmbiguousReferenceError(id, candidatas.map(ku => `${ku.id}#v${ku.version}`));
    }
    return candidatas[0];
  }

  function resolveByAmbito(id, ambito, opts = {}) {
    return resolve(id, { ...opts, ambito });
  }

  // No lanza: útil para comprobaciones de "¿existe?" sin manejar excepciones.
  function tryResolve(id, opts = {}) {
    try { return resolve(id, opts); }
    catch { return null; }
  }

  return { resolve, resolveByAmbito, tryResolve };
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function vigenteEn(ku, fecha) {
  if (ku.vigenciaDesde > fecha) return false;
  if (ku.vigenciaHasta !== null && ku.vigenciaHasta < fecha) return false;
  return true;
}

// null en un campo de ambito de la KU significa "aplica en general"; un
// valor concreto en la consulta debe encajar con ese campo si la KU lo
// restringe. Campos de la consulta que no se especifican no filtran nada.
function ambitoCoincide(kuAmbito, consulta) {
  if (isNonEmptyString(consulta.ramo) && kuAmbito?.ramo != null && !kuAmbito.ramo.includes(consulta.ramo)) {
    return false;
  }
  if (isNonEmptyString(consulta.aseguradora) && kuAmbito?.aseguradora != null && kuAmbito.aseguradora !== consulta.aseguradora) {
    return false;
  }
  if (isNonEmptyString(consulta.provincia) && kuAmbito?.provincia != null && kuAmbito.provincia !== consulta.provincia) {
    return false;
  }
  return true;
}

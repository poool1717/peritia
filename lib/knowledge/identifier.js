// lib/knowledge/identifier.js
//
// Parseo y construcción de identificadores knowledge://tipo/slug[#vN].
// Ver knowledge/architecture/KNOWLEDGE_ARCHITECTURE.md §7.
//
// Deliberadamente no sabe qué carpetas de tipo existen de verdad (eso es
// types.js) — solo entiende la SINTAXIS del identificador. Quien necesite
// validar que el tipo es uno de los 22 reconocidos compone este módulo con
// types.js (así lo hace schema.js).

import { IDENTIFIER_PATTERN, KNOWLEDGE_SCHEME } from "./constants.js";
import { InvalidIdentifierError } from "./errors.js";

// { tipoPlural, slug, version } — version es null sin sufijo, o un entero
// positivo si el identificador trae "#vN".
export function parseIdentifier(uri) {
  if (typeof uri !== "string" || uri.length === 0) {
    throw new InvalidIdentifierError(uri, "debe ser una cadena no vacía");
  }
  const m = uri.match(IDENTIFIER_PATTERN);
  if (!m) {
    throw new InvalidIdentifierError(uri, `no coincide con el formato ${KNOWLEDGE_SCHEME}tipo/slug[#vN]`);
  }
  const [, tipoPlural, slug, versionStr] = m;
  return { tipoPlural, slug, version: versionStr ? parseInt(versionStr, 10) : null };
}

export function buildIdentifier({ tipoPlural, slug, version = null }) {
  if (!isValidoTipoPluralOSlug(tipoPlural)) {
    throw new InvalidIdentifierError(tipoPlural, "tipoPlural inválido");
  }
  if (!isValidoTipoPluralOSlug(slug)) {
    throw new InvalidIdentifierError(slug, "slug inválido");
  }
  const base = `${KNOWLEDGE_SCHEME}${tipoPlural}/${slug}`;
  if (version == null) return base;
  if (!Number.isInteger(version) || version < 1) {
    throw new InvalidIdentifierError(version, "version debe ser un entero positivo");
  }
  return `${base}#v${version}`;
}

export function isValidIdentifier(uri) {
  return typeof uri === "string" && IDENTIFIER_PATTERN.test(uri);
}

// El mismo identificador sin su sufijo de versión, si lo tuviera — para
// comparar "misma KU, versión distinta" sin volver a parsear a mano.
export function stripVersion(uri) {
  const { tipoPlural, slug } = parseIdentifier(uri);
  return buildIdentifier({ tipoPlural, slug });
}

function isValidoTipoPluralOSlug(v) {
  return typeof v === "string" && /^[a-z][a-z0-9_-]*$/.test(v);
}

// lib/knowledge/errors.js
//
// Errores propios del Knowledge Core. Cada uno lleva un `code` estable
// (para que quien los capture pueda distinguirlos sin comparar el texto del
// mensaje) y, cuando aplica, un `details` con la información estructurada
// del fallo.

export class KnowledgeError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
  }
}

export class InvalidIdentifierError extends KnowledgeError {
  constructor(value, reason) {
    super(`Identificador inválido: ${JSON.stringify(value)}${reason ? ` — ${reason}` : ""}`,
      "INVALID_IDENTIFIER", { value, reason });
  }
}

export class SchemaValidationError extends KnowledgeError {
  constructor(issues, id) {
    super(`El sobre de metadatos${id ? ` de ${id}` : ""} no es válido: ${issues.join("; ")}`,
      "SCHEMA_VALIDATION", { id, issues });
  }
}

export class NotFoundError extends KnowledgeError {
  constructor(id) {
    super(`No existe ninguna KU para ${JSON.stringify(id)}`, "NOT_FOUND", { id });
  }
}

export class DuplicateIdentifierError extends KnowledgeError {
  constructor(id, version) {
    super(`Ya existe una KU registrada para ${id}${version != null ? ` versión ${version}` : ""}`,
      "DUPLICATE_IDENTIFIER", { id, version });
  }
}

export class AmbiguousReferenceError extends KnowledgeError {
  constructor(id, candidatos) {
    super(`${id} resuelve a ${candidatos.length} KU vigentes distintas; se necesita más contexto (ámbito o versión) para desambiguar`,
      "AMBIGUOUS_REFERENCE", { id, candidatos });
  }
}

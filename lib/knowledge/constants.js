// lib/knowledge/constants.js
//
// Datos fijos del Knowledge Core, sin lógica. Ver knowledge/architecture/
// KNOWLEDGE_ARCHITECTURE.md §7 para el esquema de identificador.

export const KNOWLEDGE_SCHEME = "knowledge://";

// knowledge://<tipo-plural>/<slug>[#vN]
//   tipo-plural: minúsculas, letras/dígitos/guion bajo (nombre de carpeta)
//   slug:        minúsculas, letras/dígitos separados por guiones simples
//   #vN:         sufijo de versión histórica, opcional, N entero positivo
export const IDENTIFIER_PATTERN =
  /^knowledge:\/\/([a-z][a-z0-9_]*)\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:#v([1-9][0-9]*))?$/;

// AAAA-MM-DD, el formato usado en vigenciaDesde/vigenciaHasta de las fichas reales.
export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

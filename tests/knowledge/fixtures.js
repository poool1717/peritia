// tests/knowledge/fixtures.js
//
// Objetos JavaScript transcritos a mano del frontmatter real de
// knowledge/coverages/danos-por-agua.md e incendio.md (Sprint 3). No se lee
// el .md en los tests: sin cargador ni YAML todavía, este es el terreno que
// tenemos — fiel a lo que ya existe, no inventado.

export const DANOS_POR_AGUA = Object.freeze({
  id: "knowledge://coverages/danos-por-agua",
  tipo: "coverage",
  version: 1,
  estado: "borrador",
  idioma: "es",
  confianza: "media",
  vigenciaDesde: "2026-08-01",
  vigenciaHasta: null,
  ambito: { ramo: ["hogar", "comunidades", "comercio"], aseguradora: null, provincia: null },
  codigo: "DAGUA",
  bloques: { continente: true, contenido: true },
  requiereVerificacionExterna: false,
  relaciones: {
    garantias: ["knowledge://coverages/riesgos-extensivos"],
    subgarantias: [],
    objetos: [],
    materiales: ["knowledge://materials/pladur", "knowledge://materials/parquet"],
    danos: [],
    causas: ["knowledge://causes/rotura-de-tuberia"],
    metodos: [],
    normativa: [],
    documentacion: [],
    fotografias: [],
    procedimientos: [],
  },
  autor: "claude",
  revisadoPor: null,
  fuentes: [
    { tipo: "codigo_actual", referencia: "components/Peritia.jsx — código DAGUA en franquicias{} y descripciones{} del prompt de extracción de póliza", fecha: "2026-08-01" },
    { tipo: "codigo_actual", referencia: "BAREMO — 12 partidas con dano='Humedad' o 'Rotura de tubería'", fecha: "2026-08-01" },
    { tipo: "elaboracion_propia", referencia: "Alcance, exclusiones típicas y frontera con otras garantías: conocimiento estándar del oficio, pendiente de validación por Pol", fecha: "2026-08-01" },
  ],
  historial: [
    { version: 1, fecha: "2026-08-01", autor: "claude", estado: "borrador", cambio: "Creación inicial como ejemplo de referencia del Sprint 3" },
  ],
});

export const INCENDIO = Object.freeze({
  id: "knowledge://coverages/incendio",
  tipo: "coverage",
  version: 1,
  estado: "borrador",
  idioma: "es",
  confianza: "media",
  vigenciaDesde: "2026-08-01",
  vigenciaHasta: null,
  ambito: { ramo: ["hogar", "empresa"], aseguradora: null, provincia: null },
  codigo: "INCEN",
  relaciones: {
    garantias: ["knowledge://coverages/danos-por-agua", "knowledge://coverages/danos-electricos"],
    subgarantias: [],
    objetos: [],
    materiales: [],
    danos: [],
    causas: [],
    metodos: [],
    normativa: [],
    documentacion: [],
    fotografias: [],
    procedimientos: [],
  },
  autor: "claude",
  revisadoPor: null,
  fuentes: [
    { tipo: "elaboracion_propia", referencia: "Conocimiento estándar del oficio", fecha: "2026-08-01" },
  ],
  historial: [
    { version: 1, fecha: "2026-08-01", autor: "claude", estado: "borrador", cambio: "Creación inicial" },
  ],
});

// No es una transcripción de una ficha real: es una variante mínima válida,
// en estado `aprobado`, para las pruebas de resolver.js que necesitan una
// KU realmente resoluble (las 4 fichas reales están todas en `borrador`,
// correctamente, porque nadie las ha revisado todavía).
export const DAGUA_APROBADA_V1 = Object.freeze({
  id: "knowledge://coverages/danos-por-agua",
  tipo: "coverage",
  version: 1,
  estado: "aprobado",
  confianza: "alta",
  vigenciaDesde: "2026-01-01",
  vigenciaHasta: "2026-06-30",
  ambito: { ramo: ["hogar"], aseguradora: null, provincia: null },
  relaciones: { garantias: [] },
  autor: "pol",
});

export const DAGUA_APROBADA_V2 = Object.freeze({
  id: "knowledge://coverages/danos-por-agua",
  tipo: "coverage",
  version: 2,
  estado: "aprobado",
  confianza: "alta",
  vigenciaDesde: "2026-07-01",
  vigenciaHasta: null,
  ambito: { ramo: ["hogar"], aseguradora: null, provincia: null },
  relaciones: { garantias: [] },
  autor: "pol",
});

export const MINIMA_VALIDA = Object.freeze({
  id: "knowledge://materials/baldosa-ceramica",
  tipo: "material",
  version: 1,
  estado: "borrador",
  vigenciaDesde: "2026-08-01",
  vigenciaHasta: null,
  ambito: { ramo: null, aseguradora: null, provincia: null },
  confianza: "sin_verificar",
  autor: "claude",
  relaciones: {},
});

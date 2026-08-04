// tests/knowledge/coverage/fixtures.js
//
// Coverage estructurado a mano a partir del CUERPO real de
// knowledge/coverages/danos-por-agua.md (secciones "Alcance por bloque",
// "Exclusiones", "Límites típicos"), que hoy es prosa Markdown. Este EPIC
// no lee Markdown, así que esto es la versión estructurada de ese mismo
// contenido — no inventada, transcrita — para poder probar el modelo con
// datos reales sin necesitar todavía el cargador.

export const DANOS_POR_AGUA_COVERAGE = Object.freeze({
  id: "knowledge://coverages/danos-por-agua",
  tipo: "coverage",
  version: 1,
  estado: "aprobado", // sintético: en knowledge/coverages/ está en borrador; aquí se fija en aprobado para poder probar el motor con una KU resoluble, igual que se hizo en KP-01 con DAGUA_APROBADA_V1/V2.
  confianza: "media",
  vigenciaDesde: "2026-08-01",
  vigenciaHasta: null,
  ambito: { ramo: ["hogar", "comunidades", "comercio"], aseguradora: null, provincia: null },
  autor: "claude",
  codigo: "DAGUA",
  bloques: { continente: true, contenido: true },
  requiereVerificacionExterna: false,
  alcance: {
    continente: "Elementos constructivos y acabados afectados por el agua: paramentos verticales y horizontales, pavimentos, revestimientos, falsos techos y las propias instalaciones de fontanería y desagüe cuando la póliza incluye su reparación.",
    contenido: "Mobiliario, ajuar y equipamiento dañados por el agua, con el criterio de depreciación que corresponda a su antigüedad y estado.",
  },
  exclusiones: [
    { tipo: "total", descripcion: "Daños derivados de falta de mantenimiento de las instalaciones." },
    { tipo: "total", descripcion: "Humedad por condensación o capilaridad, al no responder a un hecho súbito y accidental." },
    { tipo: "parcial", descripcion: "El coste de reparación de la propia avería cuando la póliza cubre solo sus consecuencias." },
    { tipo: "total", descripcion: "Daños producidos durante obras de reforma en curso." },
  ],
  limites: [
    { tipo: "capital", descripcion: "Límite de capital sobre el continente y sobre el contenido, de forma independiente." },
    { tipo: "capital", descripcion: "Franquicia, general de la póliza o específica de esta garantía." },
    { tipo: "capital", descripcion: "Sublímite frecuente para localización y reparación de la avería, distinto del límite de los daños que causa." },
  ],
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
    partidas: [],
  },
});

// El nombre comercial y las reglas de selección de capital que hoy están
// incrustadas en el prompt de IA-2 (docs/AI_INVENTORY.md, IA-2), dándoles
// forma sin resolver DT-05/P-08: sigue siendo texto libre, no una regla
// ejecutable.
export const AXA_DAGUA_OVERRIDE = Object.freeze({
  coverageId: "knowledge://coverages/danos-por-agua",
  aseguradora: "AXA",
  nombreComercial: "Daños por Agua",
  alcance: {},
  exclusionesAdicionales: [
    { tipo: "total", descripcion: "Daños por agua en sótanos o semisótanos no habitables, salvo pacto expreso." },
  ],
  exclusionesNoAplicables: ["Daños producidos durante obras de reforma en curso."],
  limitesEspecificos: [],
  reglasSeleccionCapital: "Para DAGUA usa EDIFICIO PRIMER RIESGO si existe con valor>0. Si no, usa OBRAS DE REFORMA.",
});

export const OTRA_ASEGURADORA_OVERRIDE = Object.freeze({
  coverageId: "knowledge://coverages/danos-por-agua",
  aseguradora: "Mapfre",
  nombreComercial: null,
  alcance: {},
  exclusionesAdicionales: [],
  exclusionesNoAplicables: [],
  limitesEspecificos: [],
  reglasSeleccionCapital: null,
});

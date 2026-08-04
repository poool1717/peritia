// lib/knowledge/reasoning/workflows.js
//
// Dos workflows reales de Hogar, para demostrar que las mismas Stage (ver
// stages.js) se combinan de forma distinta sin tocar el motor. La
// bifurcación entre ambos no es inventada: STATE_MACHINES.md §1 ya
// documenta "EnVerificacion --> EnInspeccion: modalidad presencial" /
// "EnVerificacion --> EnAnalisis: modalidad documental (sin inspección)",
// y BR-34 confirma que Instant Payment sigue exigiendo el mismo rigor en
// causa y valoración aunque se salte la inspección presencial.
//
// Deliberadamente NO hay workflows de Auto, Empresas ni ningún otro ramo:
// docs/OPEN_QUESTIONS.md P-11 ("¿qué ramos debe cubrir el producto?") sigue
// abierta. El mecanismo los soporta — añadir uno es escribir un Workflow
// nuevo con las Stage que le apliquen — pero fabricar su contenido de
// negocio sin confirmación sería inventar lo que este proyecto, en cada
// sprint, ha evitado inventar.

import { createWorkflow } from "./workflow.js";

export const HOGAR_ESTANDAR = createWorkflow({
  id: "workflow://hogar/estandar",
  ramo: "hogar",
  variante: "estandar",
  etapaInicial: "encargo",
  etapas: ["encargo", "verificacion_riesgo", "inspeccion", "causas", "valoracion", "cobertura_indemnizacion", "informe"],
  transiciones: [
    { desde: "encargo", hasta: "verificacion_riesgo" },
    { desde: "verificacion_riesgo", hasta: "inspeccion", cuando: { campo: "data.modalidadVisita", operador: "equals", valor: "PRESENCIAL" } },
    { desde: "inspeccion", hasta: "causas" },
    { desde: "causas", hasta: "valoracion" },
    { desde: "valoracion", hasta: "cobertura_indemnizacion" },
    { desde: "cobertura_indemnizacion", hasta: "informe" },
  ],
});

export const HOGAR_INSTANT_PAYMENT = createWorkflow({
  id: "workflow://hogar/instant-payment",
  ramo: "hogar",
  variante: "instant_payment",
  etapaInicial: "encargo",
  // Sin "inspeccion": BR-34, la modalidad documental no la exige.
  etapas: ["encargo", "verificacion_riesgo", "causas", "valoracion", "cobertura_indemnizacion", "informe"],
  transiciones: [
    { desde: "encargo", hasta: "verificacion_riesgo" },
    { desde: "verificacion_riesgo", hasta: "causas" }, // incondicional: elegir esta variante ya implica modalidad documental
    { desde: "causas", hasta: "valoracion" },
    { desde: "valoracion", hasta: "cobertura_indemnizacion" },
    { desde: "cobertura_indemnizacion", hasta: "informe" },
  ],
});

export const WORKFLOWS = Object.freeze([HOGAR_ESTANDAR, HOGAR_INSTANT_PAYMENT]);

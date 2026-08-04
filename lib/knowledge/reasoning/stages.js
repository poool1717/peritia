// lib/knowledge/reasoning/stages.js
//
// Las etapas concretas del razonamiento pericial. El orden y los nombres
// están triangulados desde tres fuentes independientes que coinciden:
// docs/domain/DOMAIN_MODEL.md §5, docs/domain/LIFECYCLES.md §8 ("encargo →
// verificación → causas → valoración → cobertura → anexos") y
// docs/AI_INVENTORY.md §6 (el flujo real de la aplicación en producción).
//
// `entradasRequeridas`/`entradasOpcionales` usan nombres de campo "pelados"
// (p. ej. "compania"), resueltos siempre bajo `context.data` por
// stage.js:getMissingInputs. Las condiciones de las reglas (rules.js), en
// cambio, usan la ruta completa ("data.compania") porque una condición
// puede necesitar mirar también `evidence`, `ramo` o `variante`, no solo
// `data`. Son dos convenios distintos a propósito, cada uno consistente
// dentro de su propio archivo.

import { createStage } from "./stage.js";
import { createDecision } from "./decision.js";

export const ENCARGO = createStage({
  id: "encargo",
  label: "Encargo",
  entradasRequeridas: ["compania", "numReferencia", "asegurado", "causa", "garantia"],
  entradasOpcionales: ["poliza"],
  salidas: ["encargo_verificado"],
  decisiones: [
    createDecision({
      id: "encargo_completo",
      pregunta: "¿Hay datos suficientes del encargo para iniciar la peritación?",
      posiblesValores: ["completo", "incompleto"],
      entradasRequeridas: ["compania", "numReferencia", "asegurado"],
      reglas: [
        "knowledge://rules/encargo-datos-minimos-completos",
        "knowledge://rules/encargo-datos-minimos-incompletos",
      ],
    }),
  ],
});

export const VERIFICACION_RIESGO = createStage({
  id: "verificacion_riesgo",
  label: "Verificación del Riesgo",
  entradasRequeridas: ["lugarIntervencion", "tipoRiesgo"],
  entradasOpcionales: ["refCatastral", "superficieConstruida", "calidad"],
  // BR-34: en modalidad documental (Instant Payment) no se exige
  // inspección presencial; en modalidad presencial, sí.
  requisitosCondicionales: [
    { cuando: { campo: "data.modalidadVisita", operador: "equals", valor: "PRESENCIAL" }, requiere: ["inspeccionRealizada"] },
  ],
  salidas: ["riesgo_verificado"],
  decisiones: [
    createDecision({
      id: "riesgo_verificado",
      pregunta: "¿El riesgo asegurado está identificado y verificado?",
      posiblesValores: ["verificado", "pendiente", "bloqueado"],
      entradasRequeridas: ["lugarIntervencion", "tipoRiesgo"],
      reglas: [
        "knowledge://rules/riesgo-bloqueado",
        "knowledge://rules/riesgo-verificado",
      ],
    }),
  ],
});

export const INSPECCION = createStage({
  id: "inspeccion",
  label: "Inspección",
  entradasRequeridas: ["inspeccionRealizada", "fechaInspeccion"],
  salidas: ["inspeccion_completada"],
  decisiones: [],
});

export const CAUSAS = createStage({
  id: "causas",
  label: "Causas y Circunstancias",
  entradasRequeridas: ["causa", "descripcionSiniestro"],
  entradasOpcionales: ["verificacionMeteorologica"],
  // BR-11: solo se verifica meteorológicamente de forma automática dentro
  // del ámbito de la red de estaciones (hoy, Catalunya); fuera de ese
  // ámbito exige aportación manual, pero sigue siendo necesaria si la causa
  // es atmosférica.
  requisitosCondicionales: [
    { cuando: { campo: "data.esAtmosferico", operador: "equals", valor: true }, requiere: ["verificacionMeteorologica"] },
  ],
  salidas: ["causa_determinada"],
  decisiones: [
    createDecision({
      id: "causa_cubierta",
      pregunta: "¿La causa identificada está cubierta por la garantía afectada?",
      posiblesValores: ["cubierta", "no_cubierta", "cubierta_parcial"],
      entradasRequeridas: ["causa"],
      reglas: [
        "knowledge://rules/br-10-umbral-atmosferico-superado",
        "knowledge://rules/br-10-umbral-atmosferico-no-superado",
      ],
    }),
  ],
});

export const VALORACION = createStage({
  id: "valoracion",
  label: "Valoración de Daños",
  entradasRequeridas: ["modoValoracion", "partidas"],
  entradasOpcionales: ["reglaProporcional"],
  salidas: ["valor_ajustado"],
  decisiones: [
    createDecision({
      id: "infraseguro_detectado",
      pregunta: "¿Hay infraseguro en este bloque (continente o contenido)?",
      posiblesValores: ["si", "no", "primer_riesgo_no_aplica"],
      entradasRequeridas: ["capital", "valorReal"],
      reglas: [
        "knowledge://rules/br-12-infraseguro-primer-riesgo",
        "knowledge://rules/br-12-infraseguro-detectado",
      ],
    }),
  ],
});

export const COBERTURA_INDEMNIZACION = createStage({
  id: "cobertura_indemnizacion",
  label: "Cobertura e Indemnización",
  entradasRequeridas: ["franquicia", "garantia", "valorAjustado"],
  salidas: ["indemnizacion_propuesta"],
  decisiones: [
    createDecision({
      id: "procede_indemnizacion",
      pregunta: "¿Procede indemnización, dado el valor ajustado y la franquicia?",
      posiblesValores: ["procede", "no_procede"],
      entradasRequeridas: ["franquicia", "valorAjustado"],
      reglas: [
        "knowledge://rules/br-21-indemnizacion-no-negativa",
        "knowledge://rules/br-21-indemnizacion-procede",
      ],
    }),
  ],
});

export const INFORME = createStage({
  id: "informe",
  label: "Informe",
  entradasRequeridas: ["seccionesObligatoriasCompletas"],
  salidas: ["informe_exportable"],
  decisiones: [
    createDecision({
      id: "listo_para_exportar",
      pregunta: "¿El informe está listo para exportarse como definitivo?",
      posiblesValores: ["listo", "pendiente"],
      entradasRequeridas: ["seccionesObligatoriasCompletas"],
      reglas: [
        "knowledge://rules/br-31-informe-listo",
        "knowledge://rules/br-31-informe-pendiente",
      ],
    }),
  ],
});

export const STAGES = Object.freeze([
  ENCARGO, VERIFICACION_RIESGO, INSPECCION, CAUSAS, VALORACION, COBERTURA_INDEMNIZACION, INFORME,
]);

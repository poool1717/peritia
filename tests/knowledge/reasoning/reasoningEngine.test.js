import { describe, it, expect } from "vitest";
import { createReasoningEngine } from "../../../lib/knowledge/reasoning/reasoningEngine.js";
import { createReasoningContext, withData } from "../../../lib/knowledge/reasoning/reasoningContext.js";
import { NotFoundError } from "../../../lib/knowledge/errors.js";
import { STAGES } from "../../../lib/knowledge/reasoning/stages.js";
import { RULES } from "../../../lib/knowledge/reasoning/rules.js";
import { WORKFLOWS, HOGAR_ESTANDAR, HOGAR_INSTANT_PAYMENT } from "../../../lib/knowledge/reasoning/workflows.js";

const engine = createReasoningEngine({ stages: STAGES, workflows: WORKFLOWS, rules: RULES });

describe("startCase", () => {
  it("empieza en la etapaInicial del workflow", () => {
    const caso = engine.startCase(HOGAR_ESTANDAR.id, createReasoningContext());
    expect(caso.etapaActualId).toBe("encargo");
    expect(caso.workflowId).toBe(HOGAR_ESTANDAR.id);
  });
  it("lanza NotFoundError si el workflow no existe", () => {
    expect(() => engine.startCase("workflow://no-existe", createReasoningContext())).toThrow(NotFoundError);
  });
});

describe("getMissingInputs / canAdvance en la etapa 'encargo'", () => {
  it("con el contexto vacío, faltan los datos del encargo", () => {
    const caso = engine.startCase(HOGAR_ESTANDAR.id, createReasoningContext());
    expect(engine.getMissingInputs(caso).required).toEqual(
      expect.arrayContaining(["compania", "numReferencia", "asegurado", "causa", "garantia"])
    );
    expect(engine.canAdvance(caso)).toBe(false);
  });

  it("con los datos del encargo completos, se puede avanzar", () => {
    const ctx = createReasoningContext({ data: {
      compania: "AXA Seguros", numReferencia: "SIN-2026-001", asegurado: "Juan Pérez",
      causa: "Rotura de tubería", garantia: "Daños por agua",
    } });
    const caso = engine.startCase(HOGAR_ESTANDAR.id, ctx);
    expect(engine.canAdvance(caso)).toBe(true);
  });
});

describe("Pericial Decision Engine — decide() produce una explicación completa, no solo un valor", () => {
  it("encargo_completo, con los tres campos mínimos presentes", () => {
    const ctx = createReasoningContext({ data: { compania: "AXA Seguros", numReferencia: "SIN-1", asegurado: "Juan Pérez" } });
    const caso = engine.startCase(HOGAR_ESTANDAR.id, ctx);
    const outcome = engine.evaluateDecision(caso, "encargo_completo");

    expect(outcome.valor).toBe("completo");
    expect(outcome.confianza).toBe("alta");
    expect(outcome.reglasAplicadas).toEqual(["knowledge://rules/encargo-datos-minimos-completos"]);
    expect(outcome.explicacion.length).toBeGreaterThan(0);
  });

  it("encargo_completo, sin asegurado: incompleto", () => {
    const ctx = createReasoningContext({ data: { compania: "AXA Seguros", numReferencia: "SIN-1" } });
    const caso = engine.startCase(HOGAR_ESTANDAR.id, ctx);
    const outcome = engine.evaluateDecision(caso, "encargo_completo");
    expect(outcome.valor).toBe("incompleto");
  });

  it("decide() evalúa Y registra: el caseState devuelto tiene un Trace nuevo", () => {
    const ctx = createReasoningContext({ data: { compania: "AXA Seguros", numReferencia: "SIN-1", asegurado: "Juan Pérez" } });
    const caso = engine.startCase(HOGAR_ESTANDAR.id, ctx);
    const conDecision = engine.decide(caso, "encargo_completo", { evidenceIds: ["ev-poliza-1"] });

    expect(caso.traces).toEqual([]); // el original no se muta
    expect(conDecision.traces).toHaveLength(1);
    expect(conDecision.traces[0].decisionId).toBe("encargo_completo");
    expect(conDecision.traces[0].outcome.valor).toBe("completo");
    expect(conDecision.traces[0].outcome.evidenciasUsadas).toEqual(["ev-poliza-1"]);
  });

  it("causa_cubierta — BR-10, siniestro atmosférico con umbral superado", () => {
    const ctx = createReasoningContext({ data: { esAtmosferico: true, umbralSuperado: true } });
    let caso = engine.startCase(HOGAR_ESTANDAR.id, ctx);
    caso = { ...caso, etapaActualId: "causas" }; // nos situamos directamente en la etapa a probar
    const outcome = engine.evaluateDecision(caso, "causa_cubierta");
    expect(outcome.valor).toBe("cubierta");
    expect(outcome.reglasAplicadas).toEqual(["knowledge://rules/br-10-umbral-atmosferico-superado"]);
  });

  it("causa_cubierta — causa no atmosférica: sin determinar, honestamente (no hay Coverage Engine conectado)", () => {
    const ctx = createReasoningContext({ data: { esAtmosferico: false } });
    let caso = engine.startCase(HOGAR_ESTANDAR.id, ctx);
    caso = { ...caso, etapaActualId: "causas" };
    const outcome = engine.evaluateDecision(caso, "causa_cubierta");
    expect(outcome.valor).toBeNull();
    expect(outcome.confianza).toBe("sin_verificar");
  });

  it("infraseguro_detectado — BR-12, primer riesgo no penaliza", () => {
    const ctx = createReasoningContext({ data: { primerRiesgo: true, capital: 1000, valorReal: 5000 } });
    let caso = engine.startCase(HOGAR_ESTANDAR.id, ctx);
    caso = { ...caso, etapaActualId: "valoracion" };
    expect(engine.evaluateDecision(caso, "infraseguro_detectado").valor).toBe("primer_riesgo_no_aplica");
  });

  it("infraseguro_detectado — BR-12, capital por debajo del valor real sin primer riesgo", () => {
    const ctx = createReasoningContext({ data: { primerRiesgo: false, capital: 1000, valorReal: 5000 } });
    let caso = engine.startCase(HOGAR_ESTANDAR.id, ctx);
    caso = { ...caso, etapaActualId: "valoracion" };
    expect(engine.evaluateDecision(caso, "infraseguro_detectado").valor).toBe("si");
  });

  it("procede_indemnizacion — BR-21, franquicia igual al daño ajustado: no procede", () => {
    const ctx = createReasoningContext({ data: { franquicia: 300, valorAjustado: 300 } });
    let caso = engine.startCase(HOGAR_ESTANDAR.id, ctx);
    caso = { ...caso, etapaActualId: "cobertura_indemnizacion" };
    const outcome = engine.evaluateDecision(caso, "procede_indemnizacion");
    expect(outcome.valor).toBe("no_procede");
    expect(outcome.explicacion).toContain("BR-21");
  });

  it("listo_para_exportar — BR-31", () => {
    const ctx = createReasoningContext({ data: { seccionesObligatoriasCompletas: false } });
    let caso = engine.startCase(HOGAR_ESTANDAR.id, ctx);
    caso = { ...caso, etapaActualId: "informe" };
    expect(engine.evaluateDecision(caso, "listo_para_exportar").valor).toBe("pendiente");
  });

  it("lanza NotFoundError si la decisión no existe en la etapa actual", () => {
    const caso = engine.startCase(HOGAR_ESTANDAR.id, createReasoningContext());
    expect(() => engine.evaluateDecision(caso, "decision-inexistente")).toThrow(NotFoundError);
  });
});

describe("getAvailableTransitions — la bifurcación real de STATE_MACHINES.md §1", () => {
  it("hogar-estandar, modalidad presencial: puede transitar a 'inspeccion'", () => {
    const ctx = createReasoningContext({ data: { modalidadVisita: "PRESENCIAL" } });
    let caso = engine.startCase(HOGAR_ESTANDAR.id, ctx);
    caso = { ...caso, etapaActualId: "verificacion_riesgo" };
    expect(engine.getAvailableTransitions(caso)).toEqual(["inspeccion"]);
  });

  it("hogar-estandar, modalidad documental: NO puede transitar a 'inspeccion' (BR-34)", () => {
    const ctx = createReasoningContext({ data: { modalidadVisita: "DOCUMENTAL" } });
    let caso = engine.startCase(HOGAR_ESTANDAR.id, ctx);
    caso = { ...caso, etapaActualId: "verificacion_riesgo" };
    expect(engine.getAvailableTransitions(caso)).toEqual([]);
  });

  it("hogar-instant-payment salta 'inspeccion' incondicionalmente: va directa a 'causas'", () => {
    let caso = engine.startCase(HOGAR_INSTANT_PAYMENT.id, createReasoningContext());
    caso = { ...caso, etapaActualId: "verificacion_riesgo" };
    expect(engine.getAvailableTransitions(caso)).toEqual(["causas"]);
    expect(HOGAR_INSTANT_PAYMENT.etapas).not.toContain("inspeccion");
  });
});

describe("advance", () => {
  it("avanza y marca la etapa anterior como completada", () => {
    const ctx = createReasoningContext({ data: { modalidadVisita: "DOCUMENTAL" } });
    const caso = engine.startCase(HOGAR_INSTANT_PAYMENT.id, ctx);
    const avanzado = engine.advance(caso, "verificacion_riesgo");
    expect(avanzado.etapaActualId).toBe("verificacion_riesgo");
    expect(avanzado.etapasCompletadas).toEqual(["encargo"]);
  });

  it("lanza NotFoundError si la transición no está disponible con el contexto actual", () => {
    const ctx = createReasoningContext({ data: { modalidadVisita: "DOCUMENTAL" } });
    let caso = engine.startCase(HOGAR_ESTANDAR.id, ctx);
    caso = { ...caso, etapaActualId: "verificacion_riesgo" };
    // en hogar-estandar, documental no habilita la transición a 'inspeccion'
    expect(() => engine.advance(caso, "inspeccion")).toThrow(NotFoundError);
  });

  it("recorrido completo de hogar-instant-payment, encadenando advance()", () => {
    let caso = engine.startCase(HOGAR_INSTANT_PAYMENT.id, createReasoningContext());
    for (const etapa of ["verificacion_riesgo", "causas", "valoracion", "cobertura_indemnizacion", "informe"]) {
      caso = engine.advance(caso, etapa);
    }
    expect(caso.etapaActualId).toBe("informe");
    expect(caso.etapasCompletadas).toEqual(["encargo", "verificacion_riesgo", "causas", "valoracion", "cobertura_indemnizacion"]);
  });
});

describe("getTrace — trazabilidad acumulada a lo largo de varias decisiones", () => {
  it("cada decide() añade un Trace sin perder los anteriores", () => {
    const ctx = createReasoningContext({ data: { compania: "AXA Seguros", numReferencia: "SIN-1", asegurado: "Juan Pérez" } });
    let caso = engine.startCase(HOGAR_ESTANDAR.id, ctx);
    caso = engine.decide(caso, "encargo_completo");
    caso = withContextAt(caso, "verificacion_riesgo", { data: { lugarIntervencion: "C/ Mayor 1", tipoRiesgo: "Vivienda" } });
    caso = engine.decide(caso, "riesgo_verificado");

    expect(engine.getTrace(caso)).toHaveLength(2);
    expect(engine.getTrace(caso).map(t => t.decisionId)).toEqual(["encargo_completo", "riesgo_verificado"]);
  });
});

// Helper de test: mueve el caso a otra etapa y fusiona datos nuevos en el
// contexto, sin pasar por advance() (que exige una transición real del
// workflow) — útil para probar una decisión de una etapa concreta de forma
// aislada.
function withContextAt(caseState, etapaId, dataPatch) {
  return { ...caseState, etapaActualId: etapaId, context: withData(caseState.context, dataPatch.data) };
}

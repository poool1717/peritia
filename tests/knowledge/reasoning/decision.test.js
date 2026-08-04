import { describe, it, expect } from "vitest";
import { createDecision, validateDecision, assertValidDecision, evaluateDecision } from "../../../lib/knowledge/reasoning/decision.js";
import { createRule } from "../../../lib/knowledge/reasoning/rule.js";
import { SchemaValidationError } from "../../../lib/knowledge/errors.js";

const REGLA_PROCEDE = createRule({
  id: "knowledge://rules/br-21-procede",
  descripcion: "BR-21: el daño ajustado supera la franquicia, procede indemnización.",
  condicion: { campo: "data.franquicia", operador: "lt", campoValor: "data.valorAjustado" },
  efecto: { valor: "procede", confianza: "alta" },
});
const REGLA_NO_PROCEDE = createRule({
  id: "knowledge://rules/br-21-no-procede",
  descripcion: "BR-21: la franquicia iguala o supera el daño ajustado, no procede.",
  condicion: { campo: "data.franquicia", operador: "gte", campoValor: "data.valorAjustado" },
  efecto: { valor: "no_procede", confianza: "alta" },
});

const DECISION = createDecision({
  id: "procede_indemnizacion",
  pregunta: "¿Procede indemnización?",
  posiblesValores: ["procede", "no_procede"],
  entradasRequeridas: ["franquicia", "valorAjustado"],
  reglas: [REGLA_NO_PROCEDE.id, REGLA_PROCEDE.id],
});

describe("validateDecision", () => {
  it("acepta una decisión bien formada", () => {
    expect(validateDecision(DECISION)).toEqual({ valid: true, errors: [] });
  });
  it("rechaza posiblesValores vacío", () => {
    expect(validateDecision({ ...DECISION, posiblesValores: [] }).valid).toBe(false);
  });
  it("rechaza una regla que no es un identificador knowledge:// válido", () => {
    expect(validateDecision({ ...DECISION, reglas: ["no-valido"] }).valid).toBe(false);
  });
  it("rechaza pregunta vacía", () => {
    expect(validateDecision({ ...DECISION, pregunta: "" }).valid).toBe(false);
  });
});

describe("createDecision / assertValidDecision", () => {
  it("createDecision rellena entradasRequeridas y reglas por defecto", () => {
    const d = createDecision({ id: "x", pregunta: "¿x?", posiblesValores: ["a"] });
    expect(d.entradasRequeridas).toEqual([]);
    expect(d.reglas).toEqual([]);
  });
  it("lanza SchemaValidationError si no es válida", () => {
    expect(() => createDecision({ id: "x", pregunta: "¿x?", posiblesValores: [] })).toThrow(SchemaValidationError);
  });
});

describe("evaluateDecision — con un array de reglas", () => {
  it("cuando una regla coincide, el outcome toma su valor y confianza", () => {
    const ctx = { data: { franquicia: 100, valorAjustado: 300 } };
    const outcome = evaluateDecision(DECISION, ctx, { rules: [REGLA_PROCEDE, REGLA_NO_PROCEDE] });
    expect(outcome.valor).toBe("procede");
    expect(outcome.confianza).toBe("alta");
    expect(outcome.reglasAplicadas).toEqual([REGLA_PROCEDE.id]);
    expect(outcome.explicacion).toContain("BR-21");
  });

  it("sin ninguna regla que coincida, el outcome está sin determinar", () => {
    const outcome = evaluateDecision(DECISION, {}, { rules: [REGLA_PROCEDE, REGLA_NO_PROCEDE] });
    expect(outcome.valor).toBeNull();
    expect(outcome.confianza).toBe("sin_verificar");
    expect(outcome.reglasAplicadas).toEqual([]);
  });

  it("las evidencias pasadas se incluyen en el outcome", () => {
    const ctx = { data: { franquicia: 100, valorAjustado: 300 } };
    const outcome = evaluateDecision(DECISION, ctx, { rules: [REGLA_PROCEDE], evidenceIds: ["ev-1", "ev-2"] });
    expect(outcome.evidenciasUsadas).toEqual(["ev-1", "ev-2"]);
  });

  it("una regla referenciada por id que no existe en la lista de reglas disponibles se ignora, no lanza", () => {
    const ctx = { data: { franquicia: 100, valorAjustado: 300 } };
    const outcome = evaluateDecision(DECISION, ctx, { rules: [REGLA_PROCEDE] }); // falta REGLA_NO_PROCEDE, referenciada por DECISION.reglas
    expect(outcome.valor).toBe("procede");
  });
});

describe("evaluateDecision — rules ni array ni registro", () => {
  it("no encuentra ninguna regla y queda sin determinar, sin lanzar", () => {
    const ctx = { data: { franquicia: 100, valorAjustado: 300 } };
    const outcome = evaluateDecision(DECISION, ctx, { rules: null });
    expect(outcome.valor).toBeNull();
  });
});

describe("evaluateDecision — con un registro tipo KP-01 (objeto con .get)", () => {
  it("acepta cualquier objeto con .get(id), no solo arrays", () => {
    const ctx = { data: { franquicia: 100, valorAjustado: 300 } };
    const registro = { get: id => [REGLA_PROCEDE, REGLA_NO_PROCEDE].find(r => r.id === id) };
    const outcome = evaluateDecision(DECISION, ctx, { rules: registro });
    expect(outcome.valor).toBe("procede");
  });
});

// lib/knowledge/reasoning/rules.js
//
// Reglas concretas de ejemplo, todas ancladas en docs/domain/BUSINESS_RULES.md
// o en comportamiento ya documentado (docs/AI_INVENTORY.md) — ninguna
// inventada. No es un catálogo exhaustivo: es la demostración de que el
// mecanismo (rule.js + condition.js) funciona con reglas reales.
//
// Deliberadamente NO incluye una regla genérica de "¿esta causa está
// cubierta?" para causas no atmosféricas: eso es, precisamente, lo que un
// futuro Coverage Engine conectado (KP-02) resolvería. Sin esa conexión
// —fuera de alcance de este EPIC— la decisión correspondiente queda
// honestamente "sin determinar" en vez de fabricar una regla sin base.

import { createRule } from "./rule.js";

export const RULES = Object.freeze([
  // ── encargo ────────────────────────────────────────────────────────────
  // Comportamiento real de IA-1 (docs/AI_INVENTORY.md): "si no hay
  // referencia, asegurado ni compañía, avisa con alert() y vuelve a la
  // pantalla de subida".
  createRule({
    id: "knowledge://rules/encargo-datos-minimos-completos",
    descripcion: "El encargo tiene compañía, referencia y asegurado identificados.",
    condicion: { todas: [
      { campo: "data.compania", operador: "exists" },
      { campo: "data.numReferencia", operador: "exists" },
      { campo: "data.asegurado", operador: "exists" },
    ] },
    efecto: { valor: "completo", confianza: "alta" },
  }),
  createRule({
    id: "knowledge://rules/encargo-datos-minimos-incompletos",
    descripcion: "Falta compañía, referencia o asegurado: el encargo no tiene los datos mínimos para iniciar la peritación.",
    condicion: { alguna: [
      { campo: "data.compania", operador: "notExists" },
      { campo: "data.numReferencia", operador: "notExists" },
      { campo: "data.asegurado", operador: "notExists" },
    ] },
    efecto: { valor: "incompleto", confianza: "alta" },
  }),

  // ── verificación del riesgo ──────────────────────────────────────────
  // LIFECYCLES.md §1: "puede bloquearse si falta documentación esencial".
  createRule({
    id: "knowledge://rules/riesgo-verificado",
    descripcion: "El lugar de intervención y el tipo de riesgo están identificados.",
    condicion: { todas: [
      { campo: "data.lugarIntervencion", operador: "exists" },
      { campo: "data.tipoRiesgo", operador: "exists" },
    ] },
    efecto: { valor: "verificado", confianza: "media" },
  }),
  createRule({
    id: "knowledge://rules/riesgo-bloqueado",
    descripcion: "El expediente está marcado explícitamente como bloqueado por falta de documentación esencial.",
    condicion: { campo: "data.bloqueadoPorDocumentacion", operador: "equals", valor: true },
    efecto: { valor: "bloqueado", confianza: "alta" },
  }),

  // ── causas — BR-10 ────────────────────────────────────────────────────
  createRule({
    id: "knowledge://rules/br-10-umbral-atmosferico-superado",
    descripcion: "BR-10: un siniestro de causa atmosférica tiene cobertura porque los valores medidos igualan o superan el umbral fijado por la póliza.",
    condicion: { todas: [
      { campo: "data.esAtmosferico", operador: "equals", valor: true },
      { campo: "data.umbralSuperado", operador: "equals", valor: true },
    ] },
    efecto: { valor: "cubierta", confianza: "alta" },
  }),
  createRule({
    id: "knowledge://rules/br-10-umbral-atmosferico-no-superado",
    descripcion: "BR-10: un siniestro de causa atmosférica no tiene cobertura porque los valores medidos no superan el umbral fijado por la póliza.",
    condicion: { todas: [
      { campo: "data.esAtmosferico", operador: "equals", valor: true },
      { campo: "data.umbralSuperado", operador: "equals", valor: false },
    ] },
    efecto: { valor: "no_cubierta", confianza: "alta" },
  }),

  // ── valoración — BR-12 ────────────────────────────────────────────────
  createRule({
    id: "knowledge://rules/br-12-infraseguro-primer-riesgo",
    descripcion: "BR-12: contratado a primer riesgo, el infraseguro no se penaliza aunque el capital sea inferior al valor real.",
    condicion: { campo: "data.primerRiesgo", operador: "equals", valor: true },
    efecto: { valor: "primer_riesgo_no_aplica", confianza: "alta" },
  }),
  createRule({
    id: "knowledge://rules/br-12-infraseguro-detectado",
    descripcion: "BR-12: el capital asegurado es inferior al valor real del bien en el momento del siniestro — hay infraseguro.",
    condicion: { todas: [
      { campo: "data.primerRiesgo", operador: "notEquals", valor: true },
      { campo: "data.capital", operador: "lt", campoValor: "data.valorReal" },
    ] },
    efecto: { valor: "si", confianza: "alta" },
  }),

  // ── cobertura e indemnización — BR-21 ────────────────────────────────
  createRule({
    id: "knowledge://rules/br-21-indemnizacion-no-negativa",
    descripcion: "BR-21: la franquicia iguala o supera el daño ajustado, así que la indemnización es cero — no procede.",
    condicion: { campo: "data.franquicia", operador: "gte", campoValor: "data.valorAjustado" },
    efecto: { valor: "no_procede", confianza: "alta" },
  }),
  createRule({
    id: "knowledge://rules/br-21-indemnizacion-procede",
    descripcion: "BR-21: el daño ajustado supera la franquicia, así que procede indemnización por la diferencia.",
    condicion: { campo: "data.franquicia", operador: "lt", campoValor: "data.valorAjustado" },
    efecto: { valor: "procede", confianza: "alta" },
  }),

  // ── informe — BR-31 ───────────────────────────────────────────────────
  createRule({
    id: "knowledge://rules/br-31-informe-listo",
    descripcion: "BR-31: todas las secciones que el informe declara obligatorias están completas.",
    condicion: { campo: "data.seccionesObligatoriasCompletas", operador: "equals", valor: true },
    efecto: { valor: "listo", confianza: "alta" },
  }),
  createRule({
    id: "knowledge://rules/br-31-informe-pendiente",
    descripcion: "BR-31: quedan secciones obligatorias sin completar; el informe no debería exportarse como definitivo todavía.",
    condicion: { campo: "data.seccionesObligatoriasCompletas", operador: "equals", valor: false },
    efecto: { valor: "pendiente", confianza: "media" },
  }),
]);

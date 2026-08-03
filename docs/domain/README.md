# docs/domain/ — Bounded context del dominio de PERIT.IA

Documentación completa del dominio de la peritación de seguros: entidades,
relaciones, reglas de negocio, ciclos de vida, eventos y vocabulario.

**El dominio es la autoridad.** El software se adapta al negocio, nunca al
revés. Cuando esta documentación y el código actual difieran, el modelo aquí
descrito no se recorta para encajar en lo que hay hoy — la diferencia se
señala explícitamente como brecha a cerrar en el futuro, no se oculta.

**Ninguna regla de negocio se ha inventado.** Donde el código no permite
deducir con certeza una decisión de negocio, y no hay confirmación de Pol o
del Arquitecto de Producto/Negocio, la duda queda registrada en
`../OPEN_QUESTIONS.md` en lugar de asumirse.

---

## Cómo leer esta carpeta

1. Empieza por **`GLOSSARY.md`** — sin el vocabulario común, el resto no se
   entiende igual para todos.
2. Sigue por **`DOMAIN_MODEL.md`** — la visión general: bounded contexts,
   agregados y el mapa completo de entidades.
3. Profundiza en **`BUSINESS_RULES.md`**, **`STATE_MACHINES.md`**,
   **`EVENTS.md`**, **`RELATIONSHIPS.md`** y **`LIFECYCLES.md`** — cada uno
   mira el mismo dominio desde un ángulo distinto.
4. Consulta la ficha de cada entidad en **`entities/`** cuando necesites el
   detalle completo de una sola pieza del modelo.

---

## Documentos de este bounded context

| Documento | Qué responde |
|---|---|
| [`GLOSSARY.md`](./GLOSSARY.md) | ¿Qué significa cada término del negocio? |
| [`DOMAIN_MODEL.md`](./DOMAIN_MODEL.md) | ¿Cómo se organiza el dominio en su conjunto? |
| [`BUSINESS_RULES.md`](./BUSINESS_RULES.md) | ¿Qué reglas gobiernan el negocio? |
| [`STATE_MACHINES.md`](./STATE_MACHINES.md) | ¿Por qué estados pasa cada entidad? |
| [`EVENTS.md`](./EVENTS.md) | ¿Qué hechos relevantes ocurren y cuándo? |
| [`RELATIONSHIPS.md`](./RELATIONSHIPS.md) | ¿Cómo se relacionan las entidades entre sí? |
| [`LIFECYCLES.md`](./LIFECYCLES.md) | ¿Cómo nace, crece y termina cada entidad? |
| [`entities/`](./entities/) | Ficha individual de cada una de las 30 entidades principales |

---

## Las 30 entidades

Agrupadas por bounded context (ver `DOMAIN_MODEL.md`, sección 2):

**Organización y acceso**
[`ORGANIZATION`](./entities/ORGANIZATION.md) ·
[`OFFICE`](./entities/OFFICE.md) ·
[`USER`](./entities/USER.md) ·
[`ROLE`](./entities/ROLE.md)

**Gestión del encargo**
[`CLIENT`](./entities/CLIENT.md) ·
[`INSURER`](./entities/INSURER.md) ·
[`BROKER`](./entities/BROKER.md) ·
[`ASSIGNMENT`](./entities/ASSIGNMENT.md) ·
[`CLAIM`](./entities/CLAIM.md)

**Póliza y cobertura**
[`POLICY`](./entities/POLICY.md) ·
[`POLICY_VERSION`](./entities/POLICY_VERSION.md) ·
[`COVERAGE`](./entities/COVERAGE.md) ·
[`SUBCOVERAGE`](./entities/SUBCOVERAGE.md)

**Riesgo y daño**
[`INSURED_OBJECT`](./entities/INSURED_OBJECT.md) ·
[`DAMAGE`](./entities/DAMAGE.md) ·
[`CAUSE`](./entities/CAUSE.md) ·
[`INSPECTION`](./entities/INSPECTION.md)

**Evidencia documental**
[`EVIDENCE`](./entities/EVIDENCE.md) ·
[`DOCUMENT`](./entities/DOCUMENT.md) ·
[`PHOTO`](./entities/PHOTO.md)

**Valoración económica**
[`ESTIMATE`](./entities/ESTIMATE.md) ·
[`INVOICE`](./entities/INVOICE.md) ·
[`REPAIR`](./entities/REPAIR.md)

**Informe pericial**
[`REPORT`](./entities/REPORT.md) ·
[`REPORT_SECTION`](./entities/REPORT_SECTION.md) ·
[`CONCLUSION`](./entities/CONCLUSION.md) ·
[`EXPORT`](./entities/EXPORT.md)

**Operación y trazabilidad**
[`TASK`](./entities/TASK.md) ·
[`AUDIT`](./entities/AUDIT.md) ·
[`NOTIFICATION`](./entities/NOTIFICATION.md)

---

## Relación con el resto de `docs/`

| Este documento habla de… | Se contrasta con… |
|---|---|
| El dominio tal como debería modelarse | `docs/CURRENT_IMPLEMENTATION.md` — el dominio tal como está implementado hoy |
| Entidades y sus relaciones | `docs/DB_MODEL.md` — cómo se guardan hoy esas mismas ideas en 2 tablas JSONB |
| Reglas de negocio | `docs/TECHNICAL_DEBT.md` — dónde el código se aparta de esas reglas |
| Preguntas sin resolver | `docs/OPEN_QUESTIONS.md` — el mismo documento, ampliado en este sprint |
| Brechas identificadas | `docs/REFACTOR_BACKLOG.md` — nada de este sprint se ejecuta ahí sin aprobación |

---

## Estado de este sprint

**Sprint 1 — Domain Model.** Completado el 1 de agosto de 2026. Documentación
pura: no se ha modificado ni una línea de código, ni movido ni renombrado
ningún archivo existente. El resumen ejecutivo de decisiones, dudas e
inconsistencias detectadas está en la respuesta de cierre del sprint.

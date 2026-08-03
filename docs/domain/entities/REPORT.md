# REPORT

> Bounded context: Informe Pericial · **Implementada, con triple materialización
> independiente**

## Objetivo

Representar el documento final que el perito entrega como resultado del
encargo: la composición estructurada de todo el trabajo de verificación,
análisis y valoración en un dictamen presentable.

## Descripción

El informe es el producto que PERIT.IA existe para producir más rápido. Se
compone de secciones fijas, concluye con un dictamen motivado, y se
materializa en distintos formatos de exportación. Es, junto con `Assignment`,
la entidad más central del negocio, y la que sufre la deuda técnica más
visible del sistema: existen **tres implementaciones independientes** del
mismo informe (vista previa, Word, PDF), que deberían ser una sola fuente
materializada de tres formas (Sprint 0, DT-07).

## Responsabilidades

- Componer, de forma coherente, el resultado de todas las secciones del
  expediente.
- Presentar el dictamen final de forma clara y trazable.
- Materializarse en los formatos que el destinatario necesite.

## Atributos

| Atributo | Tipo | Implementado | Descripción |
|---|---|---|---|
| `id` | identificador | Implícito (igual al del `Assignment`) | Clave del informe |
| `assignmentId` | referencia | Sí (1–1 implícito) | Encargo que lo origina |
| `secciones` | lista | Sí (`s1`-`s4` + encargo + anexos) | Ver `REPORT_SECTION.md` |
| `conclusion` | estructura | Sí (sin entidad propia) | Ver `CONCLUSION.md` |
| `version` | número | No | Historial de exportaciones (conceptual) |
| `plantilla` | referencia | No | Identidad visual, si varía por organización (conceptual) |

## Relaciones

- 1 Report — 1 `ASSIGNMENT`
- 1 Report — N `REPORT_SECTION`
- 1 Report — 1 `CONCLUSION`
- 1 Report — N `EXPORT`

## Ciclo de vida

Ver `LIFECYCLES.md`, sección 8. Existe, en potencia, desde el primer dato del
expediente —la vista previa se compone en vivo—; crece sección a sección; se
materializa en exportaciones sucesivas sin versión histórica; y no tiene
cierre formal: sigue siendo editable después de exportado.

## Estados

`En construcción` → `Incompleto` / `Listo para revisión` → `Exportado` (ver
`STATE_MACHINES.md`, sección 4).

## Eventos

`InformeGenerado` · `InformeRevisado` (conceptual) · `ExportacionRealizada`.

## Reglas de negocio

- Un expediente no debería exportarse como informe definitivo si sus
  secciones obligatorias no están completas (BR-31) — hoy solo se avisa, no
  se bloquea.
- Un informe ya exportado puede seguir editándose y volver a exportarse
  (BR-32).

## Validaciones

- El panel de "Pendientes" calcula, mediante el mismo semáforo que usa cada
  bloque de sección, qué apartados faltan antes de exportar — como aviso, no
  como bloqueo.

## Permisos

Hereda los del expediente.

## Casos de uso

- El perito completa las seis secciones, revisa el panel de pendientes (vacío)
  y exporta el informe en PDF para entregarlo a la aseguradora.
- El perito exporta con apartados pendientes, aceptando el aviso, porque el
  plazo de entrega obliga a enviar un avance.

## Ejemplos

```
Report (del Assignment "SIN-2026-04521"):
  secciones: [Encargo, S1, S2, S3, S4, Anexos] — todas completas
  conclusion: indemnización propuesta 1.291,47 €
  exportaciones: [PDF el 2/8/2026, Word el 2/8/2026]
```

## Posibles evoluciones

- Fuente única de composición del informe (Sprint 0, R-13), de la que se
  deriven vista previa, PDF y Word.
- Historial de versiones exportadas.
- Plantilla configurable por organización.

## Relación con el sistema actual

**Implementada de forma redundante**: `SecInforme` (vista previa),
`buildWordHTML` y `exportPDF` son tres construcciones paralelas del mismo
contenido conceptual, con una discrepancia real ya detectada entre la
primera y las otras dos (Sprint 0, DT-08).

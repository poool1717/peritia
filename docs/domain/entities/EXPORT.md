# EXPORT

> Bounded context: Informe Pericial · **Implementada como acción, no como
> entidad con historial**

## Objetivo

Representar la materialización del informe en un formato de archivo entregable
—PDF o Word—, en un momento concreto, con los datos que el expediente tenía en
ese instante.

## Descripción

La exportación es el punto en que el informe deja de ser un dato vivo dentro
de PERIT.IA y se convierte en un documento entregado a un tercero. Es, por
tanto, el momento de mayor responsabilidad del sistema: lo que se genera aquí
es lo que la aseguradora, el asegurado o cualquier otro destinatario van a
leer y a conservar, con independencia de lo que ocurra después dentro de la
aplicación.

## Responsabilidades

- Generar un artefacto de archivo (PDF o Word) a partir del estado actual del
  informe.
- Marcar el expediente como entregado (`estado='exportado'`).
- Debería, en su forma madura, conservar constancia de qué contenía
  exactamente esa exportación concreta.

## Atributos

| Atributo | Tipo | Implementado | Descripción |
|---|---|---|---|
| `id` | identificador | No | Clave de la exportación |
| `reportId` | referencia | Implícito | Informe exportado |
| `formato` | enumerado | Sí (acción, no dato) | `PDF` \| `Word` |
| `fecha` | fecha | Parcial (solo `updated_at` del expediente) | Cuándo se generó |
| `usuarioId` | referencia | Implícito | Quién la generó |
| `snapshotDatos` | estructura | **No** | Copia de los datos en ese instante (conceptual) |

## Relaciones

- N Export — 1 `REPORT`
- N Export — 1 `USER`

## Ciclo de vida

Nace en el instante en que el perito pulsa "Exportar" en el modal
correspondiente. Se genera de inmediato (impresión del navegador para PDF,
descarga de HTML como `.doc` para Word). No deja rastro persistente más allá
de marcar el expediente como `exportado`: el archivo generado vive fuera de
PERIT.IA desde el momento de su creación.

## Estados

`Generándose` → `Generada` → `Entregada` (conceptual, distinta de
simplemente generada).

## Eventos

`ExportacionRealizada` · `InformeEntregado` (conceptual).

## Reglas de negocio

- Una exportación no cierra el expediente: puede volver a exportarse tras
  nuevas ediciones (BR-32).
- Cada exportación debería poder auditarse por separado si el informe cambia
  entre una entrega y la siguiente — no implementado.

## Validaciones

- El PDF requiere que el navegador permita ventanas emergentes/impresión; el
  fallo se comunica como mensaje de error genérico.

## Permisos

Solo el perito propietario del expediente puede exportar.

## Casos de uso

- El perito exporta un primer PDF con el informe al 80 % completo para
  compartir un avance interno, y una semana después exporta la versión Word
  definitiva tras completar la última sección — el sistema no distingue una
  exportación de la otra más allá de la fecha de `updated_at`.

## Ejemplos

```
Export: PDF del Report de "SIN-2026-04521"
  formato: PDF
  fecha: 2/8/2026 (solo inferible por updated_at)
  snapshotDatos: no conservado
```

## Posibles evoluciones

- Historial de exportaciones con copia de los datos exactos de cada una, para
  poder responder "¿qué decía el informe que le entregamos el 2 de agosto?"
  incluso después de haber seguido editando el expediente.
- Registro de a quién se entregó cada exportación (destinatario, canal).

## Relación con el sistema actual

**Implementada como acción puntual sin historial.** Es la manifestación más
directa, en este contexto, de la falta de trazabilidad general del sistema
(Sprint 0, DT-12): el momento de mayor responsabilidad —la entrega— es,
paradójicamente, el que menos rastro deja.

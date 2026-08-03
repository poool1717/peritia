# INSPECTION

> Bounded context: Riesgo y Daño · **Parcialmente implementada — como campo,
> no como entidad con ciclo de vida propio**

## Objetivo

Representar la actuación mediante la cual el perito examina el riesgo
asegurado, de forma presencial o documental, para verificarlo y documentar el
daño.

## Descripción

La inspección es el acto profesional central del oficio pericial: es donde el
perito confirma con sus propios sentidos (o con la documentación disponible,
si no hay visita) lo que el encargo describe. PERIT.IA reconoce hoy dos
modalidades —presencial y documental (Instant Payment)— pero las trata como
un atributo del encargo, no como una entidad con su propia fecha, duración,
hallazgos y posible repetición.

## Responsabilidades

- Verificar el estado real del riesgo asegurado frente a lo declarado en la
  póliza (superficie, tipología, calidad).
- Documentar el daño con evidencia de primera mano.
- Servir de base fáctica para el dictamen.

## Atributos

| Atributo | Tipo | Implementado | Descripción |
|---|---|---|---|
| `id` | identificador | No | Clave de la inspección |
| `claimId` | referencia | Sí (implícito) | Siniestro al que pertenece |
| `modalidad` | enumerado | Sí (`enc.modalidadVisita`) | `PRESENCIAL` \| `DOCUMENTAL` |
| `fecha` | fecha | No | Cuándo se realizó |
| `hallazgos` | texto | Parcial (mezclado en el texto de Secciones 1 y 2) | Qué se constató |
| `numeroDeVisita` | número | No | Si es la primera, una revisión, etc. |

## Relaciones

- N Inspection — 1 `CLAIM`
- 1 Inspection — N `EVIDENCE` (lo documentado en esa visita concreta)
- N Inspection — 1 `USER` (perito que la realiza)

## Ciclo de vida

Nace cuando se decide o se ejecuta la verificación del riesgo. En modalidad
presencial, culmina con la visita física; en modalidad documental, con el
análisis de lo aportado. Puede repetirse si surge la necesidad de una segunda
visita (revisión de una reparación provisional, por ejemplo) — caso que el
sistema actual no distingue de una edición ordinaria del expediente.

## Estados

`Programada` (conceptual) → `Realizada` → `Documentada`.

## Eventos

`InspeccionRealizada` · `RiesgoVerificado` · `SegundaVisitaSolicitada`
(conceptual).

## Reglas de negocio

- Un expediente gestionado en modalidad documental no requiere verificación
  presencial, pero sigue exigiendo identificar causa y valorar daño con el
  mismo rigor (BR-34).
- Un siniestro puede requerir más de una inspección.

## Validaciones

Ninguna formal más allá de la elección de modalidad, que condiciona qué
pantalla del editor se muestra (Sección 1 completa frente a su versión
reducida para Instant Payment).

## Permisos

Hereda los del expediente.

## Casos de uso

- Inspección presencial de un piso tras un daño por agua: el perito mide la
  superficie, valora la calidad de los acabados y fotografía el daño.
- Inspección documental de un siniestro Instant Payment: sin visita física,
  el texto de verificación se genera automáticamente a partir de la
  dirección del encargo.

## Ejemplos

```
Inspection: (implícita en el Assignment "SIN-2026-04521")
  modalidad: PRESENCIAL
  hallazgos: superficie 85 m², calidad Media, capital continente coherente
```

## Posibles evoluciones

- Entidad propia con fecha, duración y posibilidad de más de una visita por
  siniestro.
- Planificación y agenda de inspecciones (relacionado con `TASK.md`).

## Relación con el sistema actual

**Reducida a un campo** (`modalidadVisita`) que bifurca la interfaz de
Sección 1 entre su versión completa (presencial) y su versión reducida
(Instant Payment), sin entidad ni ciclo de vida propios.

# POLICY_VERSION

> Bounded context: Póliza y Cobertura · **Conceptual — no implementada**

## Objetivo

Representar el estado de una póliza en un momento concreto de su vigencia,
para poder aplicar a cada siniestro las condiciones que realmente estaban en
vigor en la fecha en que ocurrió, y no las últimas conocidas.

## Descripción

Una póliza no es estática: se renueva anualmente, puede sufrir suplementos que
cambian capitales, añaden o retiran garantías, o modifican franquicias. Cada
uno de esos momentos es una versión distinta de la misma póliza. Sin esta
entidad, un sistema que solo conoce "la póliza" corre el riesgo de aplicar a
un siniestro de hace dos años las condiciones vigentes hoy, si es que ambas
llegaran a coexistir en el mismo dato.

## Responsabilidades

- Fijar, para un rango de fechas concreto, qué capitales, franquicias y
  garantías estaban en vigor.
- Permitir que el sistema seleccione automáticamente la versión correcta según
  la fecha del siniestro.

## Atributos

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | identificador | Clave de la versión |
| `policyId` | referencia | Póliza a la que pertenece |
| `fechaEfecto` | fecha | Inicio de vigencia de esta versión |
| `fechaFin` | fecha opcional | Fin de vigencia (null si es la vigente) |
| `motivo` | enumerado | `emision_inicial` \| `renovacion` \| `suplemento` |
| `capitales` | estructura | Capitales de continente y contenido en esta versión |
| `franquicias` | estructura | Franquicias por garantía en esta versión |

## Relaciones

- N PolicyVersion — 1 `POLICY`
- 1 PolicyVersion — N `COVERAGE`

## Ciclo de vida

Nace con cada renovación o suplemento de la póliza. La versión anterior no se
borra: se cierra fijando su `fechaFin` en el día anterior al de vigencia de la
nueva. Persiste indefinidamente como registro histórico, incluso mucho después
de haber dejado de estar vigente, porque sigue siendo necesaria para valorar
siniestros ocurridos durante su periodo de vigencia.

## Estados

`Vigente` · `Histórica` (sustituida por una versión posterior).

## Eventos

`VersionDePolizaCreada` · `VersionDePolizaSustituida`.

## Reglas de negocio

- Un siniestro debe valorarse siempre con la versión de la póliza vigente en
  la fecha del siniestro, no con la versión vigente en la fecha en que se
  realiza la peritación.
- Solo puede existir una versión vigente (sin `fechaFin`) por póliza en cada
  momento.

## Validaciones

- Los rangos de vigencia de las distintas versiones de una misma póliza no
  pueden solaparse.

## Permisos

Hereda los de la póliza a la que pertenece.

## Casos de uso

- Una póliza se renueva el 30 de junio de cada año, incrementando el capital
  del continente. Un siniestro ocurrido el 15 de mayo debe valorarse con el
  capital vigente hasta esa fecha, no con el ya renovado.
- Un suplemento a mitad de año añade la garantía de daños eléctricos: un
  siniestro anterior a esa fecha no puede beneficiarse de esa cobertura.

## Ejemplos

```
PolicyVersion: v1
  fechaEfecto: 30/06/2021 — fechaFin: 29/06/2022
  capitalContinente: 180.000 €

PolicyVersion: v2
  fechaEfecto: 30/06/2022 — fechaFin: null (vigente)
  capitalContinente: 195.000 €
```

## Posibles evoluciones

Es, en sí misma, la evolución de `POLICY`. Su implementación completa
depende de decidir primero el modelo de retención documental (P-17) y si el
producto necesita gestionar avisos de renovación (relacionado con
`NOTIFICATION.md`).

## Relación con el sistema actual

**No existe.** El sistema actual extrae un único juego de valores por
expediente, sin relación con ninguna versión concreta de la póliza
identificada por fecha de efecto. Si dos siniestros de la misma póliza, en
fechas distintas, tienen condiciones distintas, hoy no hay forma de
representarlo como una única póliza con dos estados. Ver
`docs/OPEN_QUESTIONS.md`, P-21 (nueva de este sprint).

# ESTIMATE

> Bounded context: Valoración Económica · **Implementada**

## Objetivo

Representar el cálculo del coste de reparación o reposición de un daño,
cuando ese cálculo se realiza por referencia (baremo) o por un presupuesto
aportado por un tercero, antes de que exista una factura real.

## Descripción

La estimación es uno de los tres caminos de valoración económica del sistema
(junto con `Invoice`), y el único que no requiere que la reparación ya se haya
ejecutado. Cubre dos modos distintos con la misma estructura: valoración por
baremo (precio de referencia interno) y valoración por presupuesto (precio
propuesto por un reparador externo, aún no ejecutado ni cobrado).

## Responsabilidades

- Calcular el coste estimado de un daño antes de su reparación efectiva.
- Servir de base a la propuesta de indemnización cuando aún no hay factura.

## Atributos

| Atributo | Tipo | Implementado | Descripción |
|---|---|---|---|
| `id` | identificador | Implícito (a nivel de expediente) | Clave de la valoración |
| `damageId` | referencia | No (agrupación implícita) | Daño al que corresponde |
| `modo` | enumerado | Sí (`modoValoracion`) | `baremo` \| `presupuesto` |
| `documentoOrigenId` | referencia | Solo para presupuesto, parcial | Presupuesto aportado, si lo hay |
| `partidas` | lista | Sí (`s3.partidas`) | Líneas que componen la estimación |
| `totalReposicion` | número | Sí (calculado, `sumRepos`) | Suma de valor de reposición |
| `totalReal` | número | Sí (calculado, `sumReal`) | Suma de valor real tras depreciación |

## Relaciones

- N Estimate — 1 `DAMAGE` (conceptual)
- 1 Estimate — N `REPAIR`
- 0..1 Estimate — 1 `DOCUMENT` (el presupuesto, si el modo es `presupuesto`)

## Ciclo de vida

Nace al elegir el modo de valoración. Se compone de partidas generadas por
asistencia de IA desde el baremo, o extraídas de un presupuesto aportado. Se
ajusta manualmente por el perito (cantidades, IVA, depreciación). No se
congela formalmente: puede modificarse en cualquier momento, incluso tras la
exportación del informe.

## Estados

`Sin valorar` → `En valoración` → `Valorado` → `Confirmado` (ver
`STATE_MACHINES.md`, sección 3).

## Eventos

`ModoValoracionElegido` · `TablaGeneradaDesdeBaremo` ·
`PartidasExtraidasDePresupuesto`.

## Reglas de negocio

- El IVA de una valoración por baremo es siempre 0 % (BR-16).
- Los costes indirectos (8 %) se calculan sobre el subtotal de reposición de
  las demás partidas y solo aplican en modo baremo (BR-19).
- La redacción de la propuesta condicionada a modo presupuesto exige esperar
  la factura definitiva (BR-23).

## Validaciones

- Sin descripción del daño, no puede generarse la tabla desde baremo.
- Cada partida generada por IA que no encuentra coincidencia en el baremo
  entra a precio 0 € con aviso explícito.

## Permisos

Hereda los del expediente.

## Casos de uso

- Un daño de humedad se valora por baremo: la IA propone las partidas de
  albañilería y pintura necesarias, cada una con su precio de referencia.
- Un daño más complejo se valora por presupuesto de un reparador externo: la
  IA extrae las líneas del PDF, con sus precios reales e IVA.

## Ejemplos

```
Estimate (modo baremo):
  partidas: [Picado enlucido, Enlucido con mortero, Pintura plástica, Costos indirectos]
  totalReposicion: 429,25 €
```

## Posibles evoluciones

- Congelar la estimación en el momento en que el perito la da por definitiva,
  conservando el histórico de cambios posteriores.
- Vincular cada partida a un `INSURED_OBJECT` concreto.

## Relación con el sistema actual

**Bien implementada como cálculo**, con motor único y verificado contra dos
casos oráculo (Sprint 0, `CONTEXT.md`). La brecha está en la trazabilidad
(qué generó cada partida, si la IA o el perito) y en la ausencia de un estado
de "confirmación" explícito.

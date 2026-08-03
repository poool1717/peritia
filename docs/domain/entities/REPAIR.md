# REPAIR

> Bounded context: Valoración Económica · **Implementada — es la entidad
> mejor formalizada y verificada de todo el sistema**

## Objetivo

Representar la unidad mínima de cálculo económico: un concepto de reparación
o reposición concreto, con su unidad, cantidad y precio, cuya suma compone el
importe total del daño.

## Descripción

La partida de reparación es donde el trabajo pericial se convierte en
números. Es la entidad común a los tres modos de valoración (baremo,
presupuesto, factura): con independencia de dónde venga su precio, toda
partida se calcula con la misma fórmula (`valor real = valor de reposición ×
(1 − % depreciación) + IVA`), verificada contra dos casos oráculo reales.

## Responsabilidades

- Cuantificar el coste de un concepto concreto de reparación o reposición.
- Distinguir valor de reposición, depreciación aplicable e IVA.
- Imputarse a un bloque de garantía (continente o contenido) y, si procede,
  quedar excluida del cálculo sin desaparecer del expediente.

## Atributos

| Atributo | Tipo | Implementado | Descripción |
|---|---|---|---|
| `id` | identificador | Sí | Clave de la partida |
| `oficio` | texto | Sí | Albañilería, Pintura, Lampistería… |
| `desc` | texto | Sí | Descripción de la partida |
| `u` | texto | Sí | Unidad (m², ml, u) |
| `uds` | número | Sí | Cantidad |
| `p` | número | Sí | Precio unitario |
| `indirecto` | booleano | Sí | Si su precio se calcula como 8 % del subtotal |
| `ivaOn` / `iva` | booleano / número | Sí | IVA aplicado |
| `depr` / `pctDepr` | booleano / número | Sí | Depreciación (siempre manual) |
| `garantia` | enumerado | Sí | `continente` \| `contenido` |
| `cobertura` | booleano | Sí | Si se incluye en el cálculo |
| `perceptor` | texto | Sí | Asegurado, Perjudicado o Reparador |
| `origen` | enumerado | No | `baremo` \| `presupuesto` \| `factura` \| `manual` (conceptual) |

## Relaciones

- N Repair — 1 `ESTIMATE` o 1 `INVOICE`
- N Repair — 1 `COVERAGE` (a través de `garantia`)

## Ciclo de vida

Nace de tres formas: seleccionada del baremo con asistencia de IA (IA-8),
extraída de un documento con asistencia de IA (IA-9), o introducida a mano.
Se ajusta libremente por el perito. Se calcula en tiempo real con cada cambio
(`calcPartida`). No se congela: permanece editable indefinidamente.

## Estados

`Generada` (por IA o manual) → `Ajustada` → `Confirmada` (implícita al
avanzar de sección).

## Eventos

`PartidaGenerada` · `PartidaAjustada` · `PartidaExcluidaDeCobertura`.

## Reglas de negocio

- `valor real = valor de reposición × (1 − % depreciación) + IVA` (BR-15).
- El IVA en modo baremo es siempre 0 % (BR-16).
- Los costes indirectos se calculan como 8 % del subtotal de las demás
  partidas, nunca sobre valoración por factura o presupuesto (BR-19).
- La depreciación nunca se aplica de forma automática (BR-18).

## Validaciones

Acotación de rangos en la tabla de Sección 3 para cantidades, precio, IVA y
porcentaje de depreciación (introducida en la sesión 8 del proyecto,
verificada en Sprint 0).

## Permisos

Hereda los del expediente.

## Casos de uso

- Partida "Enlucido con mortero", 12 m², 18 €/m², sin IVA (modo baremo): valor
  de reposición 216 €, sin depreciación → valor real 216 €.
- Partida "Costos indirectos": su precio se recalcula automáticamente como el
  8 % del subtotal de todas las demás partidas activas.

## Ejemplos

```
Repair: "Enlucido con mortero"
  oficio: ALBAÑILERÍA — u: m² — uds: 12 — p: 18 €
  garantia: continente — cobertura: true
  vReposicion: 216 € — vReal: 216 €
```

## Posibles evoluciones

- Registrar el `origen` de cada partida (IA vs. manual, y de qué prompt/
  versión) para trazabilidad completa.
- Vincular cada partida a un `INSURED_OBJECT` en lugar de solo a una
  garantía.

## Relación con el sistema actual

**Es la entidad de mayor madurez de todo el sistema**: fuente única de verdad
(`getPartidas`), fórmula estable y verificada, y el único punto del sistema
con casos de prueba reales conocidos (463,59 € y 1.291,47 €), aunque no
automatizados (Sprint 0, DT-10).

# INSURED_OBJECT

> Bounded context: Riesgo y Daño · **Conceptual — no implementada**

## Objetivo

Representar cada elemento identificable del riesgo asegurado —continente o
contenido— susceptible de sufrir daño y de ser valorado de forma
individualizada, para poder estructurar el análisis del siniestro objeto a
objeto en lugar de tratarlo como una masa indiferenciada de "daños".

## Descripción

Un objeto asegurado es la unidad intermedia entre el riesgo global (la
vivienda, el local) y el daño concreto: una pared, una instalación eléctrica,
un electrodoméstico, un lote de mercancía. PERIT.IA no distingue hoy objetos
individuales: el daño se agrupa directamente en partidas de reparación
(`REPAIR.md`), sin pasar por un objeto intermedio que agrupe "todo lo que le
ha pasado a esta pared" o "todo lo que le ha pasado a este electrodoméstico".

## Responsabilidades

- Agrupar los daños que afectan a un mismo elemento físico del riesgo.
- Distinguir si el objeto pertenece al continente o al contenido, a efectos
  de imputación de capital y franquicia.
- Servir de unidad de valoración cuando el daño se analiza objeto a objeto en
  lugar de partida a partida.

## Atributos

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | identificador | Clave del objeto |
| `claimId` | referencia | Siniestro al que pertenece |
| `tipo` | enumerado | `continente` \| `contenido` |
| `descripcion` | texto | Qué es (pared del salón, nevera, mercancía en almacén…) |
| `ubicacion` | texto | Estancia o zona donde se encuentra |
| `valorPreexistente` | número opcional | Valor estimado del objeto antes del siniestro |
| `estado` | enumerado | `sin_dano` \| `dañado_reparable` \| `dañado_irreparable` |

## Relaciones

- N InsuredObject — 1 `CLAIM`
- 1 InsuredObject — N `DAMAGE`
- N InsuredObject — N `EVIDENCE` (fotografías del objeto concreto)

## Ciclo de vida

Nace cuando el perito, durante la verificación, identifica un elemento
susceptible de análisis individual. Persiste mientras dure el expediente.
Conceptualmente —si el sistema evolucionara a mantener un histórico por
riesgo asegurado, no solo por expediente— podría trascender un único
siniestro, acumulando historial de daños a lo largo del tiempo.

## Estados

`Identificado` → `En análisis` → `Valorado`.

## Eventos

`ObjetoAseguradoIdentificado` · `ObjetoAseguradoValorado`.

## Reglas de negocio

- Un daño puede afectar a varios objetos asegurados, y un objeto asegurado
  puede sufrir varios daños de distinta naturaleza (BR-07).

## Validaciones

Ninguna implementada; la entidad no existe.

## Permisos

Hereda los del siniestro al que pertenece.

## Casos de uso

- Un siniestro de daño por agua afecta a la pared del salón (continente) y a
  un sofá y una estantería (contenido): son tres objetos asegurados
  distintos, cada uno con su propio daño y su propia valoración, aunque
  compartan la misma causa.
- Un incendio en una nave industrial afecta a la estructura (continente) y a
  varios lotes de mercancía almacenada (contenido), cada lote valorado de
  forma independiente.

## Ejemplos

```
InsuredObject: "Pared medianera salón"
  tipo: continente
  estado: dañado_reparable
  daños: [humedad por filtración]

InsuredObject: "Sofá 3 plazas"
  tipo: contenido
  estado: dañado_irreparable
  daños: [mancha de agua, deformación de tapizado]
```

## Posibles evoluciones

- Vincular objetos asegurados a un catálogo de `knowledge/objetos/` (Sprint 0)
  para sugerir vida útil y depreciación estándar por tipo de bien.
- Historial de objetos a través de sucesivos siniestros sobre el mismo
  riesgo, si el producto llega a mantener continuidad entre expedientes.

## Relación con el sistema actual

**No existe.** El daño se registra directamente como partidas de reparación
(`s3.partidas`), sin agrupación intermedia por objeto físico. Introducir esta
entidad exigiría un cambio de estructura significativo en la Sección 3 —no
es una tarea de este sprint, solo su documentación conceptual.

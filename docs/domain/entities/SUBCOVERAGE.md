# SUBCOVERAGE

> Bounded context: Póliza y Cobertura · **Conceptual — no implementada**

## Objetivo

Representar el desglose de una garantía en conceptos más finos, cada uno
susceptible de tener su propio límite, franquicia o condición, para poder
determinar cobertura con más precisión de la que permite el nivel de la
garantía general.

## Descripción

Una garantía como "Daños por agua" puede, en la redacción real de muchas
pólizas, distinguir entre rotura de tubería propia, filtración desde vivienda
vecina, atasco de desagües o daños por lluvia, con límites o exclusiones
distintos para cada supuesto. PERIT.IA no baja hoy a ese nivel de detalle:
todo lo que ocurre dentro de "Daños por agua" se trata de forma homogénea, con
la misma franquicia y el mismo texto de cobertura, con independencia del
supuesto concreto.

## Responsabilidades

- Afinar la determinación de cobertura por debajo del nivel de garantía.
- Permitir franquicias o límites diferenciados dentro de una misma garantía.

## Atributos

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | identificador | Clave de la subgarantía |
| `coverageId` | referencia | Garantía a la que pertenece |
| `nombre` | texto | Concepto concreto (rotura de tubería, filtración, atasco…) |
| `franquiciaPropia` | número opcional | Franquicia específica, si difiere de la de la garantía |
| `limitePropio` | número opcional | Límite específico, si difiere del de la garantía |
| `textoCondiciones` | texto | Redacción literal de esta subgarantía en la póliza |

## Relaciones

- N SubCoverage — 1 `COVERAGE`
- N SubCoverage — N `CAUSE` (una subgarantía puede corresponder a varias
  causas afines, y una causa puede activar más de una subgarantía)

## Ciclo de vida

Nace al extraerse, con el mismo mecanismo que la garantía que la contiene, si
la póliza analizada llega a ese nivel de detalle. Persiste como dato de
referencia mientras dure el expediente.

## Estados

`Contratada` · `No contratada` · `Contratada con condición especial`.

## Eventos

`SubgarantiaDetectada`.

## Reglas de negocio

- Una subgarantía pertenece siempre a una garantía que la contiene, y hereda
  su condición de estar o no contratada, salvo exclusión específica que la
  excluya solo a ella (BR-03).
- Si una subgarantía no tiene franquicia o límite propios, se aplican los de
  la garantía general que la contiene.

## Validaciones

Ninguna implementada; la entidad no existe.

## Permisos

Hereda los de la garantía a la que pertenece.

## Casos de uso

- Una póliza de Hogar cubre "Daños por agua" en general con franquicia de
  150 €, pero fija una franquicia especial de 300 € para "filtraciones por
  cubierta" — sin esta entidad, esa distinción se pierde y todo el daño por
  agua se trata con la misma franquicia.

## Ejemplos

```
SubCoverage: "Filtración por cubierta"
  coverage: DAGUA
  franquiciaPropia: 300 €
  textoCondiciones: "Se excluyen las filtraciones por cubierta salvo
    rotura súbita y accidental de la impermeabilización..."
```

## Posibles evoluciones

Depende directamente de que el negocio confirme si esta granularidad es
necesaria hoy o es una complejidad prematura — ver
`docs/OPEN_QUESTIONS.md`, P-08, sobre el nivel real de detalle que exige la
extracción de póliza.

## Relación con el sistema actual

**No existe en ningún grado.** Es la entidad más especulativa del contexto de
Póliza y Cobertura: no hay evidencia en el código de que se haya necesitado
nunca este nivel de detalle, pero se incluye porque el dominio pericial
general la contempla y el enunciado de este sprint la pide explícitamente.

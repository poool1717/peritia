# DAMAGE

> Bounded context: Riesgo y Daño · **Implementada, agrupada directamente como
> partida de valoración**

## Objetivo

Representar la consecuencia material del siniestro sobre uno o varios objetos
asegurados: lo que hay que reparar o reponer, y por qué garantía queda —o no—
cubierto.

## Descripción

El daño es el puente entre "lo que ha ocurrido" (`Claim`, `Cause`) y "cuánto
cuesta arreglarlo" (`Estimate`, `Invoice`, `Repair`). En PERIT.IA actual, el
daño no se modela como entidad independiente con su propia descripción,
estado y evidencia asociada: se registra directamente como partidas de
reparación en la tabla de valoración, cada una con su descripción textual,
pero sin una capa intermedia que agrupe "todo lo que le pasó a este objeto"
antes de descomponerlo en líneas de coste.

## Responsabilidades

- Describir, en lenguaje pericial, qué le ha ocurrido a un objeto asegurado.
- Determinar la garantía a la que se imputa (continente o contenido de una
  cobertura concreta).
- Servir de base para la valoración económica.
- Estar respaldado por evidencia verificable (BR-25).

## Atributos

| Atributo | Tipo | Implementado | Descripción |
|---|---|---|---|
| `id` | identificador | Sí (a nivel de partida) | Clave del daño / partida |
| `insuredObjectId` | referencia | No | Objeto asegurado afectado (conceptual) |
| `descripcion` | texto | Sí (`textoRaw`/`textoAI` de Sección 3) | Relato del daño |
| `garantia` | enumerado | Sí (`continente`/`contenido` por partida) | Bloque de imputación |
| `causaId` | referencia | Parcial (heredada del siniestro) | Causa que lo originó |
| `cobertura` | booleano | Sí | Si queda incluido en el cálculo de indemnización |
| `evidenciaIds` | lista | No (solo coexistencia visual en Anexos) | Evidencias que lo respaldan |

## Relaciones

- N Damage — 1 `INSURED_OBJECT` (conceptual)
- N Damage — 1 `CAUSE`
- N Damage — 1 `COVERAGE`
- N Damage — N `EVIDENCE`
- 1 Damage — 0..1 `ESTIMATE` / 0..1 `INVOICE`

## Ciclo de vida

Ver `LIFECYCLES.md`, sección 5. Nace al identificarse en la Sección 3, se
describe y mejora con asistencia de IA, se valora por una de tres vías
excluyentes, puede excluirse del cálculo sin desaparecer del expediente
(marcado `cobertura: false`), y termina su ciclo activo con el cierre
(conceptual) del informe.

## Estados

`Identificado` → `Descrito` → `Valorado` → `Confirmado` / `Excluido de
cobertura`.

## Eventos

`DañoIdentificado` · `DañoValorado` · `DañoExcluidoDeCobertura`.

## Reglas de negocio

- Un daño puede afectar a varios objetos, y un objeto puede sufrir varios
  daños (BR-07).
- Un daño se imputa siempre a una garantía concreta (BR-08).
- Toda conclusión sobre un daño debe estar respaldada por evidencia (BR-25).

## Validaciones

- Sin descripción del daño, no puede generarse la tabla de valoración
  asistida por IA (`genFromBaremo` exige `textoAI`/`textoRaw`).

## Permisos

Hereda los del expediente al que pertenece.

## Casos de uso

- Un daño de humedad en pared por rotura de tubería se describe, se
  valora por baremo (picado, saneado, pintura) y se imputa a la garantía
  "Daños por agua", bloque continente.
- Un daño sobre mobiliario dañado por la misma agua se registra como partida
  independiente, imputada al bloque contenido de la misma garantía.

## Ejemplos

```
Damage: "Humedad en pared medianera del salón"
  garantia: continente / DAGUA
  cobertura: true
  valoración: 3 partidas de baremo (picado, enlucido, pintura)
```

## Posibles evoluciones

- Vínculo explícito con `INSURED_OBJECT` y con la evidencia concreta que lo
  respalda (hoy solo coexisten en el mismo expediente, sin relación
  declarada).
- Clasificación estructurada del tipo de daño contra un catálogo en
  `knowledge/` en lugar de texto libre.

## Relación con el sistema actual

**Implementada de forma fusionada con `REPAIR`**: en el código actual, "daño"
y "partida de reparación" son, en la práctica, el mismo concepto —no hay una
capa de daño que se descomponga en varias partidas; cada partida ya lleva su
propia descripción de daño.

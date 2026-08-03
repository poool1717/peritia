# CLAIM

> Bounded context: Gestión del Encargo / Riesgo y Daño ·
> **Implementada de forma implícita, sin identidad propia separada del encargo**

## Objetivo

Representar el siniestro en sí mismo: el hecho dañoso ocurrido en el mundo
real, con independencia del mandato de peritación que lo documenta.

## Descripción

El siniestro es un hecho, no un documento: ocurre en una fecha y lugar
concretos, tiene una causa, y afecta a uno o varios objetos asegurados. El
`Assignment` (encargo) es el mandato para investigarlo y valorarlo; el `Claim`
es lo investigado. La distinción importa porque, conceptualmente, un mismo
siniestro podría dar lugar a más de un encargo a lo largo del tiempo —una
segunda opinión, una revisión tras una reclamación—, y sería *el mismo
siniestro* documentado dos veces, no dos siniestros distintos. Hoy esa
distinción no existe: el código trata encargo y siniestro como una sola cosa.

## Responsabilidades

- Fijar los hechos objetivos del siniestro: cuándo ocurrió, dónde, y por qué
  causa.
- Servir de ancla para toda la evidencia y el análisis posteriores.

## Atributos

| Atributo | Tipo | Implementado | Descripción |
|---|---|---|---|
| `id` | identificador | No (implícito en el encargo) | Clave del siniestro |
| `fechaSiniestro` | fecha | Sí (`enc.fechaSiniestro`) | Cuándo ocurrió |
| `lugarIntervencion` | texto | Sí | Dónde ocurrió |
| `municipio` / `provincia` / `codigoPostal` | texto | Sí | Localización estructurada |
| `causeId` | referencia | Parcial (`enc.causa`, texto) | Causa del siniestro (ver `CAUSE.md`) |
| `descripcion` | texto | Sí (`enc.descripcionSiniestro`) | Relato de lo ocurrido |
| `garantiaAfectada` | texto | Sí (`enc.garantia`) | Cobertura potencialmente aplicable |

## Relaciones

- 1 Claim — 1 `ASSIGNMENT` (relación inversa a la de `ASSIGNMENT.md`)
- 1 Claim — N `INSURED_OBJECT` (conceptual)
- 1 Claim — 1 `CAUSE`
- 1 Claim — N `INSPECTION`
- 1 Claim — N `EVIDENCE`

## Ciclo de vida

Ver `LIFECYCLES.md`, sección 2. En síntesis: el siniestro nace en el mundo
real, se representa en el sistema a partir de la recepción del encargo, se
enriquece con cada verificación, y no tiene un "cierre" propio —es un hecho
histórico inmutable; lo que se cierra es el expediente que lo documenta.

## Estados

Conceptualmente, un siniestro no tiene estados de negocio propios (es un
hecho, no un proceso); lo que evoluciona es el grado de conocimiento que se
tiene de él, reflejado en el estado del `Assignment`.

## Eventos

`SiniestroIdentificado` · `CausaDeterminada` · `SiniestroVerificado`.

## Reglas de negocio

- La causa del siniestro condiciona qué garantía es aplicable (BR-09).
- Un siniestro de causa atmosférica solo tiene cobertura si los valores
  medidos superan el umbral de la póliza (BR-10).
- Un siniestro solo puede verificarse meteorológicamente si está dentro del
  ámbito de cobertura disponible (BR-11).

## Validaciones

- La fecha del siniestro debe ser una fecha válida y, razonablemente, no
  posterior a la fecha del encargo.
- Sin fecha de siniestro válida, no puede realizarse la verificación
  meteorológica (validación implementada: `parseFecha` en `/api/meteocat`).

## Permisos

Hereda los del `Assignment` al que pertenece: solo visible para el perito
asignado.

## Casos de uso

- Un siniestro de rotura de tubería el 15 de julio, en un piso de Barcelona,
  activa la garantía "Daños por agua" y no requiere verificación
  meteorológica.
- Un siniestro por temporal de viento el 3 de marzo activa la garantía
  "Atmosféricos" y dispara la verificación automática contra la estación
  meteorológica más cercana.

## Ejemplos

```
Claim (implícito en el Assignment "SIN-2026-04521"):
  fechaSiniestro: 15/07/2026
  lugarIntervencion: C/ Balmes 45, 3º 2ª, Barcelona
  causa: Rotura de tubería
  garantiaAfectada: Daños por agua
```

## Posibles evoluciones

- Separación formal de `Claim` y `Assignment`, permitiendo varios encargos
  sobre un mismo siniestro (segunda opinión, revisión, contraperitación).
- Vínculo entre siniestros relacionados (un mismo evento —un temporal— que
  origina múltiples siniestros en distintos asegurados).

## Relación con el sistema actual

**No existe como entidad separada.** Todos sus atributos viven mezclados
dentro de `encargo` (JSONB de `informes`), junto con los datos del propio
mandato de encargo. Es la brecha conceptual más importante del contexto
"Gestión del Encargo", documentada en `DOMAIN_MODEL.md`, sección 6.

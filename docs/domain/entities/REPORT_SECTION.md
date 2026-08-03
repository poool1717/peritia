# REPORT_SECTION

> Bounded context: Informe Pericial · **Implementada**

## Objetivo

Representar cada bloque estructurado en el que se organiza el informe
pericial, con su propio contenido, su propio criterio de completitud y su
propio lugar en el orden natural de la peritación.

## Descripción

El informe de PERIT.IA no es un documento monolítico: se divide en seis
secciones con propósito propio, que reflejan las fases sucesivas del trabajo
pericial (encargo → verificación → causas → valoración → cobertura →
anexos), más una séptima que es la vista previa del conjunto. Cada sección
tiene su propio criterio de "completa" (las funciones `*BlockStates` del
código), que alimenta tanto el indicador visual de cada bloque como el
semáforo general de navegación.

## Responsabilidades

- Agrupar coherentemente una fase del trabajo pericial.
- Declarar su propio criterio de completitud.
- Aportar su contenido a la composición final del informe.

## Atributos

| Atributo | Tipo | Implementado | Descripción |
|---|---|---|---|
| `id` | identificador | Sí | `encargo` \| `s1` \| `s2` \| `s3` \| `s4` \| `anexos` \| `informe` |
| `titulo` | texto | Sí | Nombre visible de la sección |
| `orden` | número | Sí | Posición en la navegación |
| `contenido` | estructura | Sí | Datos propios (jsonb por sección) |
| `completitud` | función calculada | Sí | Estado verde/naranja/rojo según campos rellenos |

## Relaciones

- N ReportSection — 1 `REPORT`

## Ciclo de vida

Cada sección nace vacía al crearse el expediente, crece con cada dato que el
perito introduce o la IA extrae, y alcanza su estado "completa" cuando sus
campos obligatorios están rellenos. No tiene fin de vida propio más allá del
del informe que la contiene.

## Estados

`Vacía` → `Parcial` → `Completa` (semáforo rojo/naranja/verde,
`semaforoFromStates`).

## Eventos

`SeccionIniciada` · `SeccionCompletada` · `BloqueDeSeccionModificado`.

## Reglas de negocio

- El criterio de completitud de cada sección debe ser el mismo tanto para el
  indicador de su propio bloque como para el semáforo general de navegación
  — regla de coherencia interna ya aplicada correctamente en el código
  (`encargoBlockStates`, etc., reutilizadas en ambos sitios).

## Validaciones

Ninguna impide avanzar de sección con datos incompletos: el sistema avisa,
nunca bloquea.

## Permisos

Hereda los del informe al que pertenece.

## Casos de uso

- La sección "Verificación del Riesgo" se considera completa cuando hay
  estado del inmueble, superficie con tipología, y capital de continente
  mayor que cero.
- La sección "Anexos" se considera completa cuando hay al menos una
  fotografía, la información catastral, la meteorológica (si aplica) y algún
  documento de facturación.

## Ejemplos

```
ReportSection: "s3" (Valoración de Daños)
  completitud: verde
  criterios: [hay descripción de daños, hay partidas o perceptor definido]
```

## Posibles evoluciones

- Secciones configurables por ramo o por tipo de encargo, más allá de las
  seis fijas actuales.
- Reordenación de secciones según el flujo de trabajo real del gabinete.

## Relación con el sistema actual

**Bien implementada** como concepto de navegación y de completitud, con un
diseño ya correcto de reutilización entre el indicador de bloque y el
semáforo general. La brecha no está en esta entidad, sino en que su
contenido se materializa de forma distinta según el destino final (ver
`REPORT.md`).

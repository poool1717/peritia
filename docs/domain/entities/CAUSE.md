# CAUSE

> Bounded context: Riesgo y Daño · **Implementada como texto libre, sin catálogo**

## Objetivo

Representar el hecho generador del siniestro, del que dependen tanto la
garantía aplicable como el procedimiento de verificación que corresponde
seguir.

## Descripción

La causa es el primer dato que condiciona todo el resto del expediente: de
ella depende qué garantía puede activarse (BR-09) y qué verificaciones son
pertinentes —una causa atmosférica dispara la consulta meteorológica; una
rotura de tubería, no—. PERIT.IA reconoce hoy un conjunto de causas típicas
del ramo Hogar/Comunidades, mapeadas a sus garantías mediante una tabla fija
en el código (`CAUSA_COB`), sin que exista un catálogo consultable o
ampliable de causas.

## Responsabilidades

- Determinar la garantía potencialmente aplicable al siniestro.
- Determinar qué procedimiento de verificación corresponde (meteorológica,
  catastral, ninguna adicional).

## Atributos

| Atributo | Tipo | Implementado | Descripción |
|---|---|---|---|
| `id` | identificador | No | Clave de la causa |
| `nombre` | texto | Sí (`enc.causa`, texto libre) | Descripción de la causa |
| `categoria` | enumerado | Parcial (deducida por expresión regular) | `atmosferica` \| `agua` \| `incendio` \| `robo` \| `electrica` \| `rc` |
| `coberturaAsociada` | texto | Sí (`CAUSA_COB`) | Garantía que activa por defecto |
| `requiereVerificacionMeteo` | booleano | Sí (`esSiniestroAtmosferico`) | Si dispara la consulta a XEMA |

## Relaciones

- 1 Cause — 1 `CLAIM`
- 1 Cause — N `COVERAGE` (una causa puede activar más de una garantía)
- N Cause — N `SUBCOVERAGE` (conceptual)

## Ciclo de vida

Se fija en el momento de la extracción del encargo o de la descripción manual
del perito, y no cambia a lo largo del expediente salvo corrección explícita
si la causa inicialmente indicada resulta incorrecta tras la verificación.

## Estados

`Declarada` (según el encargo) → `Verificada` (confirmada tras el análisis
del perito, posiblemente distinta de la inicialmente declarada).

## Eventos

`CausaDeclarada` · `CausaVerificada` · `CausaCorregida`.

## Reglas de negocio

- La causa condiciona qué garantía es aplicable; puede activar más de una a
  la vez (BR-09).
- Un siniestro de causa atmosférica solo tiene cobertura si los valores
  medidos superan el umbral de la póliza (BR-10).

## Validaciones

- La detección de causa atmosférica se basa en expresiones regulares sobre el
  texto libre de causa, garantía y descripción — no hay validación estructural
  de que la causa declarada sea una de un conjunto cerrado y reconocido.

## Permisos

Hereda los del siniestro al que pertenece.

## Casos de uso

- Causa "rotura de tubería" → categoría `agua` → garantía "Daños por agua",
  sin verificación meteorológica.
- Causa "viento fuerte" → categoría `atmosferica` → garantía "Atmosféricos",
  con verificación automática contra la estación XEMA más cercana.
- Causa "granizo" y descripción que también menciona "lluvia intensa" →
  ambas categorías atmosféricas evaluadas de forma independiente (BR-09).

## Ejemplos

```
Cause: "Viento fuerte con caída de rama sobre tejado"
  categoria: atmosferica
  coberturaAsociada: Atmosféricos / Riesgos extensivos
  requiereVerificacionMeteo: true
```

## Posibles evoluciones

- Catálogo de causas en `knowledge/causas/` (Sprint 0), sustituyendo el mapa
  fijo `CAUSA_COB` y las expresiones regulares del código.
- Clasificación estructurada (desplegable) en lugar de texto libre, reduciendo
  la dependencia de que la IA infiera correctamente la categoría.

## Relación con el sistema actual

**Implementada como texto libre** (`enc.causa`), con una correspondencia fija
a garantías (`CAUSA_COB`, `Peritia.jsx:1419`) y una detección de categoría
atmosférica por expresión regular (`causasMeteo`, `Peritia.jsx:335-342`). Es
funcional, pero frágil ante variaciones de redacción no previstas en las
expresiones regulares.

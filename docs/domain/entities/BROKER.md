# BROKER

> Bounded context: Gestión del Encargo · **Conceptual — no implementada**

## Objetivo

Representar a la correduría de seguros que intermedia entre el tomador y la
aseguradora, y que en ocasiones es quien traslada el encargo de peritación al
perito en nombre de la aseguradora.

## Descripción

Un bróker o correduría gestiona la relación comercial entre el asegurado y la
aseguradora: coloca la póliza, la administra y, en algunos flujos de trabajo,
actúa como intermediario también en la gestión del siniestro, incluyendo el
encargo de la peritación. No es la aseguradora (no asume el riesgo) ni
necesariamente el cliente directo del perito (puede actuar en nombre de la
aseguradora sin facturar ella misma el servicio pericial).

## Responsabilidades

- Ser la referencia de la correduría cuando interviene en un encargo.
- Servir de canal de comunicación adicional cuando el flujo de trabajo lo
  requiere (solicitudes de documentación, aclaraciones).

## Atributos

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | identificador | Clave de la correduría |
| `nombre` | texto | Nombre comercial |
| `nif` | texto | Identificador fiscal |
| `aseguradorasRepresentadas` | lista | Compañías con las que opera habitualmente |
| `datosContacto` | estructura | Persona de contacto para el encargo |

## Relaciones

- 0..1 Broker — N `ASSIGNMENT` (relación opcional: no todo encargo pasa por
  correduría)
- N Broker — N `INSURER` (una correduría trabaja con varias aseguradoras; una
  aseguradora trabaja con varias corredurías)

## Ciclo de vida

Nace en el primer encargo en que interviene. No tiene fin de vida natural
salvo que deje de intermediar con el perito.

## Estados

`Activo` · `Inactivo`.

## Eventos

`CorreduriaRegistrada` · `EncargoIntermediadoPorCorreduria`.

## Reglas de negocio

- Una correduría puede intermediar en un encargo sin ser ella misma el
  cliente que factura el servicio (rol distinto del de `CLIENT`).
- Cuando interviene una correduría, las comunicaciones sobre el encargo
  pueden dirigirse a ella en lugar de, o además de, a la aseguradora.

## Validaciones

Ninguna implementada; la entidad no existe.

## Permisos

Sin restricciones propias más allá de las del encargo en que interviene.

## Casos de uso

- Una correduría gestiona la póliza de un cliente particular y, ante un
  siniestro, es ella quien contacta directamente con el perito para encargar
  la peritación, indicando la aseguradora que finalmente asumirá el coste.
- Un mismo perito trabaja con varias corredurías que, a su vez, colocan
  pólizas en las mismas aseguradoras: el sistema debería poder distinguir por
  qué canal llegó cada encargo, aunque el riesgo final lo asuma la misma
  compañía.

## Ejemplos

```
Broker: "Correduría Mediterránea SL"
  aseguradorasRepresentadas: [AXA Seguros, Mapfre, Allianz]
  encargo actual: intermedia en nombre de AXA Seguros
```

## Posibles evoluciones

- Panel propio para la correduría con seguimiento del estado de los encargos
  que ha intermediado (portal externo, fuera del alcance actual).
- Condiciones de servicio o tarifa específicas por correduría.

## Relación con el sistema actual

**No existe en absoluto.** Ni como entidad, ni como campo, ni como
distinción conceptual dentro de `compania`. Es una de las piezas puramente
aspiracionales de este sprint, incluida porque el dominio pericial general la
contempla, aunque no haya evidencia de que el negocio actual de PERIT.IA la
necesite ya. Ver `docs/OPEN_QUESTIONS.md`, P-22.

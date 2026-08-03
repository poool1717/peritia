# INVOICE

> Bounded context: Valoración Económica · **Implementada**

## Objetivo

Representar el documento que acredita una reparación ya ejecutada y su coste
real, incluido el IVA correspondiente, como base para la propuesta de
indemnización cuando la reparación ya se ha llevado a cabo.

## Descripción

La factura es el tercer camino de valoración económica, y el único que
refleja un coste ya incurrido y verificable, no una estimación. A diferencia
del baremo y del presupuesto, el precio de cada partida lo fija el documento
real, no una referencia interna ni una propuesta pendiente de ejecutar.

## Responsabilidades

- Acreditar el coste real y ejecutado de la reparación.
- Servir de base directa a la propuesta de indemnización, con el IVA que
  realmente corresponde.
- Identificar al perceptor del pago cuando es el propio reparador quien cobra
  directamente.

## Atributos

| Atributo | Tipo | Implementado | Descripción |
|---|---|---|---|
| `id` | identificador | Sí | Clave de la factura |
| `damageId` | referencia | No | Daño al que corresponde |
| `documentoOrigenId` | referencia | Parcial (el PDF, si se conserva) | Documento fuente |
| `emisor` | texto | Parcial (implícito, no estructurado) | Reparador o proveedor que la emite |
| `partidas` | lista | Sí | Líneas de la factura |
| `iva` | número | Sí (por partida) | Tipo de IVA real aplicado |
| `perceptor` | enumerado | Sí | Asegurado \| Perjudicado \| Reparador |

## Relaciones

- N Invoice — 1 `DAMAGE` (conceptual)
- 1 Invoice — N `REPAIR`
- Invoice *es-un* `DOCUMENT` (especialización)

## Ciclo de vida

Nace cuando el reparador emite la factura tras ejecutar la reparación. Se
aporta al expediente (por la pestaña de Anexos, o por la Sección 3 para su
extracción). Se procesa con IA para extraer sus líneas. Determina, junto con
el modo de valoración y el perceptor, la redacción final de la propuesta de
indemnización.

## Estados

`Aportada` → `Procesada` → `Valorada` → `Confirmada`.

## Eventos

`FacturaAportada` · `LineasDeFacturaExtraidas`.

## Reglas de negocio

- El IVA de una factura es el que consta en el propio documento (BR-17).
- La depreciación nunca se aplica automáticamente sobre una factura: es
  siempre decisión manual del perito (BR-18).
- Cuando el perceptor es el reparador, la propuesta no debe presentar
  depreciación como si aplicase al asegurado (BR-24).

## Validaciones

Ninguna formal sobre el contenido fiscal de la factura (no se valida NIF del
emisor, número de factura, ni coherencia del IVA declarado).

## Permisos

Hereda los del expediente. **Advertencia de fiabilidad:** las facturas
adjuntadas específicamente en la Sección 3 para su lectura por IA no se
persisten en almacenamiento y se pierden al recargar el expediente (Sprint 0,
DT-13) — un fallo del ciclo de vida real de esta entidad, no solo una
limitación conceptual.

## Casos de uso

- Un reparador ejecuta la reparación de una fuga y factura directamente a la
  aseguradora: el perceptor es "Reparador", y la propuesta de indemnización
  se dirige a él con el importe exacto de la factura.
- El asegurado repara por su cuenta y aporta la factura para reembolso: el
  perceptor es "Asegurado", y la propuesta incluye el IVA soportado.

## Ejemplos

```
Invoice: "factura_lampisteria_2026-0847.pdf"
  emisor: Lampistería García
  perceptor: Reparador
  partidas: [Localización de fuga: 45€, Sustitución de tubería 3ml: 84€, IVA 21%]
```

## Posibles evoluciones

- Persistencia fiable de las facturas de Sección 3 (Sprint 0, R-07).
- Validación estructural del documento (NIF, número, fecha) antes de aceptar
  sus datos.

## Relación con el sistema actual

**Implementada con una brecha operativa real**, no solo conceptual: la vía de
adjuntar facturas en Sección 3 pierde el archivo al recargar, mientras que la
vía de la pestaña de Anexos sí lo conserva correctamente. Son, hoy, dos
implementaciones distintas de la misma idea con fiabilidad desigual.

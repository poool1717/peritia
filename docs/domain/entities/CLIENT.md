# CLIENT

> Bounded context: Gestión del Encargo · **Conceptual — no implementada como
> entidad separada; hoy es un caso particular de `INSURER` representado como
> texto libre**

## Objetivo

Representar, de forma genérica, a quien encarga la peritación a PERIT.IA —sea
o no la propia aseguradora—, para que el sistema pueda razonar sobre "quién
nos ha contratado" con independencia de si coincide o no con "quién asume el
riesgo".

## Descripción

**Esta es la entidad con mayor ambigüedad de todo el modelo** (ver
`RELATIONSHIPS.md`, sección 9). En la mayoría de los encargos que gestiona
PERIT.IA hoy, el cliente del perito y la aseguradora son la misma cosa: es
AXA (o cualquier otra compañía) quien encarga directamente. Pero el dominio
pericial en general contempla clientes que no son aseguradoras: una
correduría que encarga en nombre propio, un particular que solicita una
contraperitación, un gabinete jurídico que necesita una peritación de parte.

`Client` se define aquí como el rol contractual de "quien encarga y paga el
servicio pericial", distinto de `Insurer` —quien asume el riesgo del
siniestro— precisamente para poder representar los casos en que no coinciden.

## Responsabilidades

- Ser la parte con la que existe la relación comercial y de facturación del
  servicio pericial.
- Ser el destinatario contractual del informe, salvo pacto distinto.

## Atributos

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | identificador | Clave del cliente |
| `nombre` | texto | Razón social o nombre |
| `tipo` | enumerado | `aseguradora` \| `correduria` \| `particular` \| `despacho_juridico` |
| `insurerId` | referencia opcional | Si el cliente es, además, la aseguradora del riesgo |
| `datosFacturacion` | estructura | CIF, dirección fiscal (si aplica) |

## Relaciones

- 1 Client — N `ASSIGNMENT`
- 0..1 Client — 1 `INSURER` (cuando el cliente es la propia aseguradora)

## Ciclo de vida

Nace en el momento del primer encargo recibido de esa parte. Persiste como
referencia reutilizable en encargos sucesivos. No tiene fin de vida natural
salvo que deje de operar con el perito.

## Estados

`Activo` · `Inactivo` (sin encargos recientes, sin baja formal).

## Eventos

`ClienteRegistrado` · `EncargoRecibidoDeCliente`.

## Reglas de negocio

- Un encargo tiene siempre un cliente identificado, aunque en la práctica
  actual ese dato viva mezclado con el de la aseguradora (`enc.compania`).
- El destinatario del informe es, por defecto, el cliente que lo encargó, no
  necesariamente el asegurado.

## Validaciones

Ninguna implementada hoy: el campo equivalente (`compania`) acepta texto
libre sin validar contra ningún catálogo.

## Permisos

Solo usuarios de la organización que gestiona el encargo pueden ver los datos
del cliente asociado.

## Casos de uso

- Una aseguradora encarga directamente: `Client` e `Insurer` son la misma
  entidad.
- Una correduría encarga en nombre de una aseguradora que no tiene relación
  directa con el perito: `Client` es la correduría, `Insurer` es una entidad
  distinta referenciada en el encargo.
- Un particular encarga una contraperitación tras un siniestro: `Client` es
  el particular, y puede no haber `Insurer` alguno si el objetivo es
  independiente de la aseguradora.

## Ejemplos

```
Client: "AXA Seguros"
  tipo: aseguradora
  insurerId: → AXA Seguros (la misma entidad, dos roles)

Client: "Correduría Mediterránea SL"
  tipo: correduria
  insurerId: null (actúa en nombre de varias aseguradoras según el caso)
```

## Posibles evoluciones

- Catálogo de clientes recurrentes con condiciones de servicio propias
  (plazos, formato de entrega, tarifa).
- Portal de cliente con acceso de solo lectura a sus expedientes entregados.

## Relación con el sistema actual

**No existe como entidad.** El único dato equivalente es `enc.compania`, un
campo de texto normalizado únicamente para el caso de AXA (`normCompania`).
No hay distinción entre "quien encarga" y "quien asegura el riesgo". Ver
`docs/OPEN_QUESTIONS.md`, P-22 (nueva de este sprint): si el negocio real de
PERIT.IA necesita separar `Client` de `Insurer`, o si en la práctica siempre
son la misma parte y esta entidad sobra.

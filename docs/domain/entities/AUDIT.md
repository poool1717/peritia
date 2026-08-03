# AUDIT

> Bounded context: Operación y Trazabilidad · **Conceptual — no implementada**

## Objetivo

Registrar de forma inmutable quién hizo qué, sobre qué entidad y cuándo, para
sostener la trazabilidad exigida por el proyecto y permitir reconstruir la
historia de un expediente ante cualquier duda o reclamación.

## Descripción

El registro de auditoría es la infraestructura que hace cumplibles, en la
práctica, varios de los principios ya declarados como obligatorios en
`BUSINESS_RULES.md`: que todo informe sea trazable (BR-26), que los datos
extraídos por IA no se sobrescriban en silencio (BR-28), que toda conclusión
tenga respaldo verificable (BR-25). Sin un registro de auditoría, esos
principios dependen de la buena disciplina de cada parte del código, no de
una garantía estructural del sistema.

## Responsabilidades

- Registrar cada acción relevante sobre una entidad del dominio: creación,
  modificación, borrado, exportación.
- Conservar quién la realizó (usuario humano, o el sistema en nombre de una
  ejecución de IA) y cuándo.
- Ser, por diseño, de solo escritura: un registro de auditoría no se corrige,
  se complementa con un nuevo registro.

## Atributos

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | identificador | Clave del registro |
| `entidadTipo` | texto | Sobre qué tipo de entidad ocurrió (Assignment, Damage, Estimate…) |
| `entidadId` | referencia | Sobre qué instancia concreta |
| `accion` | enumerado | `creado` \| `modificado` \| `borrado` \| `exportado` \| `ia_ejecutada` |
| `autorUserId` | referencia opcional | Usuario humano, si aplica |
| `autorSistema` | texto opcional | Identificador de la ejecución de IA, si aplica |
| `valorAnterior` / `valorNuevo` | estructura | Qué cambió |
| `timestamp` | fecha-hora | Cuándo ocurrió |

## Relaciones

- N Audit — 1 `USER` (autor humano)
- N Audit — 1 `ASSIGNMENT` (indirectamente, a través de la entidad afectada)

## Ciclo de vida

Nace en el instante mismo de la acción que registra. No se modifica nunca
tras su creación. Se conserva indefinidamente, salvo política de purga
explícita por antigüedad —a decidir junto con la política general de
retención (P-09).

## Estados

No aplica: un registro de auditoría no tiene estados, es un hecho consumado
en el instante de su creación.

## Eventos

Cada evento del catálogo de `EVENTS.md` es, potencialmente, un registro de
auditoría. Esta entidad es, en cierto sentido, la persistencia sistemática de
ese catálogo de eventos.

## Reglas de negocio

- Todo informe debe ser trazable (BR-26): sin auditoría, esta regla depende
  de inferencias indirectas, no de un registro verificable.
- Nunca se sobrescriben datos extraídos por IA (BR-28): el registro de
  auditoría es el mecanismo natural para conservar el valor anterior cuando
  el perito corrige un dato.

## Validaciones

No aplica; es, por definición, un registro de hechos ya ocurridos.

## Permisos

Lectura restringida a quien tiene acceso a la entidad auditada, y
posiblemente a roles de administración de la organización con visión más
amplia.

## Casos de uso

- Ante una discrepancia entre lo que la IA extrajo de la póliza y lo que el
  informe final muestra, el registro de auditoría permite reconstruir
  exactamente cuándo y por quién se corrigió el dato.
- Un cliente reclama sobre un importe de indemnización: el registro permite
  reconstruir el cálculo exacto en el momento de la exportación que se le
  entregó.

## Ejemplos

```
Audit:
  entidadTipo: Repair (partida)
  entidadId: partida-8842
  accion: modificado
  autor: poool.1717@gmail.com
  valorAnterior: {pctDepr: 0}
  valorNuevo: {pctDepr: 15}
  timestamp: 2026-08-01T11:32:00Z
```

## Posibles evoluciones

Es la base técnica de la que dependen R-10 del backlog de refactor (Sprint 0)
y buena parte de las garantías de trazabilidad que el proyecto exige. Su
diseño detallado (por expediente o por párrafo generado) merece una ADR
propia, señalada en el resumen ejecutivo de este sprint.

## Relación con el sistema actual

**No existe en absoluto.** El único rastro temporal disponible hoy es
`updated_at` a nivel de fila completa de `informes`, que no dice qué cambió,
quién lo cambió, ni cuál era el valor anterior.

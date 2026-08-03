# TASK

> Bounded context: Operación y Trazabilidad · **Conceptual — no implementada**

## Objetivo

Representar una unidad de trabajo concreta y acotada dentro de un encargo,
para poder gestionar la carga de trabajo del perito o del gabinete más allá
del propio expediente como unidad indivisible.

## Descripción

Hoy, el expediente es la única unidad de trabajo que PERIT.IA reconoce: no hay
forma de decir "queda pendiente pedir la factura al reparador" o "hay que
revisar la Sección 3 antes del viernes" como algo distinto de simplemente
tener el expediente abierto con esa sección incompleta. Una tarea introduce
esa granularidad: acciones concretas, con plazo y responsable, que pueden
existir dentro de un encargo sin confundirse con el propio encargo.

## Responsabilidades

- Representar una acción pendiente concreta, con su propio plazo y estado.
- Permitir asignar trabajo a un usuario distinto del propietario del
  expediente, si la organización lo requiere.
- Servir de base a recordatorios y notificaciones.

## Atributos

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | identificador | Clave de la tarea |
| `assignmentId` | referencia | Encargo al que pertenece |
| `titulo` | texto | Qué hay que hacer |
| `asignadaAUserId` | referencia | Quién debe realizarla |
| `fechaLimite` | fecha opcional | Plazo |
| `prioridad` | enumerado | `baja` \| `media` \| `alta` |
| `estado` | enumerado | Ver sección de estados |

## Relaciones

- N Task — 1 `ASSIGNMENT`
- N Task — 1 `USER` (a quien se asigna)

## Ciclo de vida

Ver `STATE_MACHINES.md`, sección 5. Nace cuando se identifica una acción
pendiente concreta, evoluciona por los estados de trabajo habituales de
cualquier sistema de gestión de tareas, y termina completada o cancelada.

## Estados

`Pendiente` → `En curso` → `Bloqueada` / `Completada` / `Cancelada`.

## Eventos

`TareaCreada` · `TareaAsignada` · `TareaCompletada` · `TareaBloqueada`.

## Reglas de negocio

- Una tarea pertenece siempre a un único encargo.
- Completar todas las tareas de un encargo no implica automáticamente que el
  informe esté listo: son conceptos relacionados pero independientes (la
  completitud de las secciones del informe es un criterio distinto).

## Validaciones

Ninguna, la entidad no existe.

## Permisos

Visible y gestionable por quien tiene acceso al encargo al que pertenece, y
por el usuario al que se asigna aunque no sea el propietario del expediente
(caso relevante solo si existe `ORGANIZATION` con varios usuarios).

## Casos de uso

- "Solicitar factura definitiva al reparador antes del viernes" —tarea
  asociada al expediente, con plazo, que dispara una notificación si se
  acerca la fecha sin completarse.
- Un responsable de gabinete asigna "revisar Sección 4 antes de exportar" a
  un perito junior antes de que el informe salga del gabinete.

## Ejemplos

```
Task: "Pedir factura al reparador"
  assignment: SIN-2026-04521
  asignadaA: poool.1717@gmail.com
  fechaLimite: 5/08/2026
  estado: Pendiente
```

## Posibles evoluciones

Es, en sí misma, una pieza de evolución del producto hacia gestión de trabajo
en equipo. Depende de que existan `ORGANIZATION` y varios `USER` para
justificar plenamente su valor; con un único usuario, su utilidad se reduce a
un recordatorio personal.

## Relación con el sistema actual

**No existe en ningún grado.** El expediente completo hace las veces de única
unidad de trabajo.

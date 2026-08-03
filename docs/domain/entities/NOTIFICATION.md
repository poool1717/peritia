# NOTIFICATION

> Bounded context: Operación y Trazabilidad · **Conceptual — no implementada**

## Objetivo

Representar un aviso dirigido a una parte interesada —el propio perito, un
compañero de gabinete, o en el futuro un cliente externo— ante un hito
relevante del ciclo de vida del encargo, para que la información llegue a
quien la necesita sin depender de que entre activamente a revisar el sistema.

## Descripción

Hoy PERIT.IA no notifica nada: toda la información relevante solo es visible
para quien abre la aplicación y navega hasta el expediente concreto. Una
notificación cierra esa distancia entre "el sistema sabe que algo importante
ha ocurrido" y "la persona interesada se entera de que ha ocurrido".

## Responsabilidades

- Avisar de un hito relevante (plazo próximo a vencer, sesión a punto de
  caducar sin guardar, extracción de IA fallida, expediente asignado).
- Dirigirse al destinatario correcto según su rol y su relación con el
  encargo.
- No perderse: debería poder marcarse como leída y persistir hasta entonces.

## Atributos

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | identificador | Clave de la notificación |
| `destinatarioUserId` | referencia | A quién se dirige |
| `assignmentId` | referencia opcional | Encargo relacionado, si aplica |
| `tipo` | enumerado | `plazo_proximo` \| `extraccion_fallida` \| `sesion_por_caducar` \| `tarea_asignada` \| `informe_completado` |
| `mensaje` | texto | Contenido del aviso |
| `canal` | enumerado | `en_app` \| `email` (propuesto) |
| `estado` | enumerado | Ver `STATE_MACHINES.md`, sección 6 |

## Relaciones

- N Notification — 1 `USER`
- N Notification — 0..1 `ASSIGNMENT`
- N Notification — 0..1 `TASK`

## Ciclo de vida

Ver `STATE_MACHINES.md`, sección 6. Nace cuando ocurre el hito que la
origina, se envía por el canal correspondiente, y termina su ciclo cuando el
destinatario la marca como leída (o cuando expira, si el tipo de aviso lo
justifica).

## Estados

`Generada` → `Enviada` → `Entregada` → `Leída` / `Fallo de envío`.

## Eventos

Las propias notificaciones son, en su mayoría, reacciones a otros eventos del
catálogo de `EVENTS.md` (por ejemplo, `ExtraccionFallida` debería disparar
una `Notification` de tipo `extraccion_fallida`).

## Reglas de negocio

- Una notificación se dirige siempre a un usuario concreto, nunca a una
  organización entera sin resolver antes a quién concretamente le
  corresponde.
- Una notificación relacionada con un plazo debe generarse con antelación
  suficiente para que la acción correspondiente aún sea posible.

## Validaciones

No aplica; la entidad no existe.

## Permisos

Solo visible para su destinatario.

## Casos de uso

- La sesión del perito está a punto de caducar mientras trabaja en un
  informe largo: una notificación en la aplicación le avisa antes de que
  pierda la conexión con la base de datos (relacionado directamente con
  DT-03 del Sprint 0: hoy este aviso no existe, y el primer síntoma de la
  caducidad es un guardado fallido silencioso).
- Un plazo de entrega contractual está a dos días de vencer y el expediente
  sigue con secciones incompletas: se notifica al perito responsable.
- La extracción del PDF de la póliza falla: se notifica de inmediato en lugar
  de que el perito lo descubra al revisar manualmente que faltan datos.

## Ejemplos

```
Notification:
  destinatario: poool.1717@gmail.com
  tipo: sesion_por_caducar
  mensaje: "Tu sesión caduca en 5 minutos. Guarda los cambios pendientes."
  canal: en_app
```

## Posibles evoluciones

Es una de las piezas con mayor retorno inmediato de experiencia de usuario si
se llega a implementar, precisamente porque una de sus primeras aplicaciones
—avisar de la caducidad de sesión— mitigaría directamente una de las
carencias críticas ya detectadas (DT-03), sin necesidad de resolver primero
el problema de fondo del refresco de token.

## Relación con el sistema actual

**No existe en absoluto.** Toda comunicación de estado hoy es pasiva: el
perito debe entrar y mirar para enterarse de que algo requiere su atención.

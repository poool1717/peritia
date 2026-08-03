# ROLE

> Bounded context: Organización y Acceso · **Conceptual — no implementada**

## Objetivo

Representar el conjunto de capacidades y responsabilidades que un usuario
desempeña dentro de su organización, para poder distinguir qué puede hacer
cada persona sin depender de que "tener cuenta" equivalga siempre a "poder
hacerlo todo".

## Descripción

Un rol es una etiqueta con significado de negocio —perito, administrador,
revisor, personal administrativo— que determina qué acciones puede realizar
un usuario y sobre qué alcance de datos. En el sistema actual, mono-usuario,
solo existe un rol implícito e indiferenciado: quien tiene cuenta puede hacer
todo sobre sus propios datos.

## Responsabilidades

- Delimitar qué acciones puede iniciar un usuario (crear expediente, exportar
  informe, gestionar usuarios de la organización).
- Delimitar sobre qué alcance de datos actúa (solo lo propio, todo lo de su
  oficina, todo lo de la organización).

## Atributos

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | identificador | Clave del rol |
| `nombre` | texto | `perito` \| `administrador` \| `revisor` \| `admin_gabinete` (propuesto) |
| `alcance` | enumerado | `propio` \| `oficina` \| `organizacion` |
| `permisos` | lista | Conjunto de capacidades concretas asociadas |

## Relaciones

- N `USER` — 1 Role

## Ciclo de vida

Los roles, a diferencia de las entidades operativas, no tienen un ciclo de
vida por instancia de negocio: son configuración relativamente estable,
definida por la organización o por el propio producto, y asignada a los
usuarios según su función.

## Estados

No aplica en sentido de máquina de estados; un rol simplemente está definido
o no lo está.

## Eventos

`RolCreado` · `RolAsignado` · `RolRevocado` · `PermisosDeRolModificados`.

## Reglas de negocio

- Todo usuario tiene exactamente un rol activo en cada momento (o, en un
  modelo más flexible, uno o varios roles combinables — decisión pendiente).
- El rol `perito` nunca debería tener alcance más amplio que `propio` salvo
  decisión explícita de la organización.

## Validaciones

- No puede asignarse un rol de alcance `organizacion` a un usuario si quien
  se lo asigna no tiene, a su vez, permisos de administración de esa
  organización.

## Permisos

El propio rol *es* el mecanismo de permisos; no tiene un permiso "sobre sí
mismo" salvo el de quién puede definir o modificar los roles disponibles —
típicamente reservado a administración de plataforma.

## Casos de uso

- Un gabinete asigna el rol `perito` a sus cinco técnicos y el rol
  `admin_gabinete` a su responsable, que puede ver el trabajo de todos.
- Una aseguradora que acceda en el futuro a sus propios expedientes (ver
  `CLIENT.md`) tendría un rol de alcance muy restringido: solo lectura de sus
  informes ya entregados.

## Ejemplos

```
Rol: perito
  alcance: propio
  permisos: [crear_expediente, editar_expediente_propio, exportar_informe_propio]

Rol: admin_gabinete
  alcance: organizacion
  permisos: [todo lo de perito] + [ver_expedientes_organizacion, gestionar_usuarios]
```

## Posibles evoluciones

- Permisos granulares por acción (crear, leer, editar, exportar, borrar) y
  por tipo de dato (expediente, evidencia, informe).
- Roles personalizados por organización, más allá de los predefinidos por el
  producto.

## Relación con el sistema actual

**No existe.** Cero representación en el código o en el esquema de base de
datos. Depende directamente de que se resuelva `docs/OPEN_QUESTIONS.md`, P-20.

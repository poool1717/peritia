# USER

> Bounded context: Organización y Acceso · **Implementada, parcialmente**

## Objetivo

Representar a la persona que opera PERIT.IA: quien se autentica, gestiona
expedientes y produce informes periciales.

## Descripción

Un usuario es, en el estado actual del producto, sinónimo de perito: la única
clase de usuario que existe es quien se registra con email y contraseña y
trabaja sobre sus propios expedientes. El modelo de dominio prevé que, con la
llegada de `ORGANIZATION` y `ROLE`, el usuario pueda desempeñar papeles
distintos del de perito (administrador, revisor, personal administrativo),
pero eso todavía no ocurre.

## Responsabilidades

- Autenticarse ante el sistema.
- Crear, editar y exportar expedientes de su propiedad.
- Aportar los datos de identificación profesional que el informe requiere
  (nombre, teléfono, DNI del perito firmante).

## Atributos

| Atributo | Tipo | Implementado | Descripción |
|---|---|---|---|
| `id` | identificador (UUID) | Sí | Clave, igual a `auth.users.id` |
| `email` | texto | Sí | Identificador de acceso |
| `nombre` | texto | Sí (columna existe, no se rellena desde ninguna pantalla) | Nombre completo del perito |
| `dni` | texto | Sí | DNI del perito, capturado en `ExportModal` |
| `telefono` | texto | Sí (columna existe, sin pantalla) | Teléfono de contacto |
| `organizationId` | referencia | No | Organización a la que pertenece (conceptual) |
| `roleId` | referencia | No | Rol desempeñado (conceptual) |
| `officeId` | referencia | No | Oficina de adscripción (conceptual) |
| `createdAt` / `updatedAt` | fecha | Sí | Alta y última modificación del perfil |

## Relaciones

- N User — 1 `ORGANIZATION` (conceptual)
- N User — 1 `ROLE` (conceptual)
- 0..1 User — 1 `OFFICE` (conceptual)
- 1 User — N `ASSIGNMENT` (como perito responsable)
- 1 User — N `AUDIT` (como autor de acciones, conceptual)

## Ciclo de vida

Nace con el registro por email y contraseña, sin confirmación de correo
exigida hoy. Se activa de inmediato: no hay paso de aprobación ni de
verificación adicional. Permanece activo mientras use el sistema. Puede darse
de baja, lo que hoy **arrastra en cascada todos sus expedientes** de forma
irreversible (`ON DELETE CASCADE`).

## Estados

`Registrado` → `Activo` → (opcional) `Suspendido` → `Dado de baja`. Solo
`Registrado`/`Activo` existen hoy; no hay mecanismo de suspensión.

## Eventos

`UsuarioRegistrado` · `UsuarioAutenticado` · `PerfilActualizado` ·
`UsuarioDadoDeBaja`.

## Reglas de negocio

- Cada perito accede únicamente a sus propios expedientes (BR-35).
- Un usuario pertenece exactamente a una organización (conceptual, BR
  relacionada en `BUSINESS_RULES.md`).

## Validaciones

- La contraseña debe tener un mínimo de 6 caracteres (validación implementada
  en el formulario de registro).
- El email debe tener formato válido (validación del propio campo `type=email`
  del navegador; sin validación adicional en servidor más allá de la que
  aplique Supabase Auth).

## Permisos

Hoy, todos los permisos son implícitos: un usuario puede hacer todo sobre sus
propios expedientes y nada sobre los ajenos. No hay distinción de
capacidades dentro de una misma cuenta.

## Casos de uso

- Pol se registra con su email y empieza a crear expedientes de inmediato.
- Un perito de un gabinete futuro se registra y queda adscrito
  automáticamente a la organización de su gabinete mediante invitación
  (conceptual, no implementado).

## Ejemplos

```
Usuario: poool.1717@gmail.com
  nombre: (sin rellenar)
  dni: (rellenado al exportar el primer informe)
  organización: (no aplica hoy)
  expedientes: N, todos suyos
```

## Posibles evoluciones

- Invitación de usuarios a una organización existente.
- Perfil profesional ampliado: colegiación, especialidades, firma digital.
- Preferencias de usuario (plantilla de informe por defecto, idioma).

## Relación con el sistema actual

**Implementada como tabla `perfiles`**, con RLS por `id = auth.uid()`. La
brecha principal no es de modelo de datos sino de comportamiento: la sesión no
persiste y el token no se refresca (Sprint 0, DT-03), lo que hace que la
experiencia del usuario sea más frágil de lo que su modelo de datos permitiría.

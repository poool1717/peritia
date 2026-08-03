# ORGANIZATION

> Bounded context: Organización y Acceso · **Conceptual — no implementada**

## Objetivo

Representar la unidad de negocio que emplea o agrupa a uno o varios peritos y
que es titular de los expedientes que estos gestionan, de modo que el sistema
pueda distinguir "el trabajo de este gabinete" de "el trabajo de ese otro",
con independencia de cuántas personas trabajen dentro de cada uno.

## Descripción

Una organización es el gabinete pericial, la consultora o el perito autónomo
—tratado como una organización de un único miembro— que contrata el uso de
PERIT.IA. Es la raíz de todo el árbol de acceso: oficinas, usuarios y, en
última instancia, los expedientes que esos usuarios crean pertenecen, directa
o indirectamente, a una organización.

## Responsabilidades

- Ser el límite de aislamiento de datos entre clientes de PERIT.IA (multi-tenancy).
- Agrupar oficinas y usuarios bajo una misma titularidad.
- Ser la unidad de facturación y de configuración (plantillas, catálogos
  propios, integraciones) cuando el producto evolucione en esa dirección.

## Atributos

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | identificador | Clave de la organización |
| `nombre` | texto | Razón social o nombre comercial del gabinete |
| `nif` | texto | Identificador fiscal |
| `tipo` | enumerado | `autonomo` \| `gabinete` \| `corporativo` (propuesto) |
| `plan` | texto | Plan de suscripción contratado (si el producto evoluciona a modelo de facturación) |
| `fechaAlta` | fecha | Cuándo se dio de alta en la plataforma |
| `activa` | booleano | Si sigue operando en el sistema |

## Relaciones

- 1 Organization — N `OFFICE` (ver `OFFICE.md`)
- 1 Organization — N `USER` (ver `USER.md`)
- Indirectamente, 1 Organization — N `ASSIGNMENT`, a través de sus usuarios

## Ciclo de vida

Nace cuando un gabinete o un perito autónomo se da de alta en la plataforma.
Crece al incorporar oficinas y usuarios. No tiene fin de vida natural salvo
baja voluntaria o impago, si el producto adopta modelo de suscripción.

## Estados

`Activa` · `Suspendida` (impago o incidencia) · `Dada de baja`.

## Eventos

`OrganizacionCreada` · `UsuarioIncorporado` · `OrganizacionSuspendida` ·
`OrganizacionDadaDeBaja`.

## Reglas de negocio

- Todo usuario pertenece exactamente a una organización (BR relacionada en
  `BUSINESS_RULES.md`, sección 6).
- Los datos de una organización nunca son visibles para otra.
- Una organización suspendida no puede crear expedientes nuevos, pero
  conserva el acceso de lectura a los ya existentes (propuesto, no
  confirmado).

## Validaciones

- El NIF, si se exige, debe tener formato válido español (o el que corresponda
  al país de operación, si el producto se internacionaliza).
- No puede existir una organización sin al menos un usuario con rol de
  administrador.

## Permisos

Solo un usuario con rol administrador de la organización puede modificar sus
datos, dar de alta o baja oficinas, o invitar y retirar usuarios.

## Casos de uso

- Un perito autónomo se registra: se crea automáticamente una organización de
  un único miembro, transparente para él.
- Un gabinete con cinco peritos se da de alta como una única organización, con
  cinco usuarios y, opcionalmente, varias oficinas.
- Un gabinete se fusiona con otro: sus expedientes deben poder migrar de
  organización sin perder historial (caso avanzado, no resuelto).

## Ejemplos

```
Organización: "Perito Autónomo — Pol"
  tipo: autonomo
  usuarios: 1 (el propio Pol)
  oficinas: 0 (no aplica)

Organización: "Gabinete Pericial Llevant SL"
  tipo: gabinete
  usuarios: 6
  oficinas: 2 (Barcelona, Girona)
```

## Posibles evoluciones

- Jerarquía de organizaciones (una central y sus delegaciones).
- Configuración propia por organización: catálogos de baremo, plantillas de
  informe con su propia identidad visual, integraciones con su ERP.
- Modelo de facturación por organización (asientos, consumo de IA).

## Relación con el sistema actual

**No existe.** El sistema de hoy es mono-usuario: cada cuenta de Supabase Auth
es, de facto, una organización de un único miembro, sin que el concepto esté
representado en ningún sitio. Ver `docs/OPEN_QUESTIONS.md`, P-20.

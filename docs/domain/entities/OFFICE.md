# OFFICE

> Bounded context: Organización y Acceso · **Conceptual — no implementada**

## Objetivo

Representar una sede o unidad administrativa dentro de una organización, para
permitir agrupar usuarios y expedientes por delegación geográfica o funcional
cuando la organización lo requiera.

## Descripción

Una oficina es una subdivisión opcional de una `Organization`. No todas las
organizaciones necesitan oficinas: un perito autónomo o un gabinete pequeño
operan con una organización plana, sin esta capa intermedia. Las oficinas
cobran sentido en gabinetes con presencia en varias provincias o zonas de
actuación.

## Responsabilidades

- Agrupar usuarios que comparten ubicación o ámbito territorial de actuación.
- Servir de criterio de reparto de encargos entrantes por zona.
- Permitir informes de actividad segmentados por sede.

## Atributos

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | identificador | Clave de la oficina |
| `organizationId` | referencia | Organización a la que pertenece |
| `nombre` | texto | Nombre de la sede |
| `direccion` | texto | Ubicación física |
| `provinciasCubiertas` | lista | Ámbito territorial de actuación habitual |
| `activa` | booleano | Si sigue operativa |

## Relaciones

- N Office — 1 `ORGANIZATION`
- 1 Office — N `USER` (adscripción opcional)

## Ciclo de vida

Nace cuando la organización decide segmentar su operación por sede. Puede
cerrarse sin que ello afecte a los usuarios, que pasan a quedar sin oficina
adscrita (organización plana) o se reasignan a otra sede.

## Estados

`Activa` · `Cerrada`.

## Eventos

`OficinaCreada` · `OficinaCerrada` · `UsuarioReasignadoDeOficina`.

## Reglas de negocio

- Una oficina pertenece siempre a una única organización.
- Cerrar una oficina no borra los expedientes de los usuarios que estuvieron
  adscritos a ella.

## Validaciones

- No puede crearse una oficina para una organización que no exista o esté
  dada de baja.

## Permisos

Solo un administrador de la organización puede crear, modificar o cerrar
oficinas.

## Casos de uso

- Un gabinete con delegaciones en Barcelona y Girona reparte los encargos
  entrantes según la provincia del siniestro, dirigiéndolos a la oficina
  correspondiente.
- Un informe de actividad mensual se desglosa por oficina para evaluar carga
  de trabajo.

## Ejemplos

```
Oficina: "Delegación Girona"
  organización: Gabinete Pericial Llevant SL
  provinciasCubiertas: [Girona, Barcelona]
  usuarios adscritos: 2
```

## Posibles evoluciones

- Horarios y disponibilidad propios por oficina, para planificación de
  inspecciones presenciales.
- Configuración de plantilla de informe con membrete propio por oficina.

## Relación con el sistema actual

**No existe.** No hay ningún concepto de sede en el código actual; es
enteramente aspiracional, dependiente de que primero exista `ORGANIZATION`.

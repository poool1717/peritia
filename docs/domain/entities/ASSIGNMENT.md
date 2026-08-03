# ASSIGNMENT

> Bounded context: Gestión del Encargo · **Implementada, sin separación de `CLAIM`**

## Objetivo

Representar el mandato mediante el cual un cliente confía a un perito la
valoración de un siniestro concreto. Es la entidad raíz de todo el sistema:
todo lo demás —verificación, evidencia, valoración, informe— existe en
función de un encargo.

## Descripción

El encargo es el contrato de servicio entre quien pide la peritación y quien
la realiza. En PERIT.IA actual, cada fila de la tabla `informes` es, en la
práctica, un encargo con su expediente de trabajo adjunto: no hay distinción
formal entre "el mandato recibido" y "el siniestro sobre el que versa" (ver
`CLAIM.md`), aunque conceptualmente son cosas distintas.

## Responsabilidades

- Ser el punto de entrada de toda la información de un caso: quién encarga,
  sobre qué siniestro, a qué perito.
- Servir de contenedor de todo el trabajo derivado (verificación, valoración,
  informe, anexos).
- Determinar la modalidad de gestión (presencial o documental) y el tipo de
  encargo (peritación ordinaria o Instant Payment).

## Atributos

| Atributo | Tipo | Implementado | Descripción |
|---|---|---|---|
| `id` | identificador | Sí | Clave del expediente (`informes.id`) |
| `clientId` | referencia | No (texto libre en `compania`) | Quién encarga |
| `insurerId` | referencia | No (texto libre en `compania`) | Aseguradora del riesgo |
| `brokerId` | referencia opcional | No | Correduría intermediaria, si la hay |
| `assignedUserId` | referencia | Sí (implícito: `user_id`) | Perito responsable |
| `claimId` | referencia | No (implícito, sin separación) | Siniestro sobre el que versa |
| `numReferencia` | texto | Sí | Número de siniestro o referencia de la aseguradora |
| `numExpInterno` | texto | Sí | Expediente interno del perito o gabinete |
| `tipoEncargo` | enumerado | Sí (`PERITACION` \| `INSTANT_PAYMENT`) | Naturaleza del encargo |
| `modalidadVisita` | enumerado | Sí (`PRESENCIAL` \| `DOCUMENTAL`) | Si requiere inspección física |
| `fechaEncargo` | fecha | Sí | Cuándo se recibió el mandato |
| `estado` | enumerado | Parcial (`borrador` \| `exportado`) | Estado del expediente (ver `STATE_MACHINES.md`) |

## Relaciones

- N Assignment — 1 `CLIENT` (conceptual)
- N Assignment — 1 `INSURER` (conceptual)
- N Assignment — 0..1 `BROKER` (conceptual)
- N Assignment — 1 `USER` (perito responsable)
- 1 Assignment — 1 `CLAIM`
- 1 Assignment — 0..1 `POLICY`
- 1 Assignment — 1 `REPORT`

## Ciclo de vida

Ver `LIFECYCLES.md`, sección 1, y `STATE_MACHINES.md`, sección 1, para el
detalle completo. En síntesis: nace con la recepción del encargo, madura con
cada sección completada, se resuelve con la entrega del informe, y hoy no
tiene fin de vida formal.

## Estados

`Asignado` → `Abierto` → `En verificación` → `En inspección` / `En análisis`
→ `Informe generado` → `En revisión` → `Entregado` → `Cerrado` (conceptual).
Implementado: `borrador` → `exportado`.

## Eventos

`EncargoRecibido` · `ExpedienteCreado` · `ExpedienteAsignado` (conceptual) ·
`ExpedienteReabierto` · `ExpedienteBorrado`.

## Reglas de negocio

- Un encargo versa siempre sobre un único siniestro (relación 1–1 con `Claim`).
- Un encargo se apoya, casi siempre, en una póliza identificada, salvo en
  modalidades como Instant Payment donde puede gestionarse sin identificarla
  formalmente (BR relacionada en `RELATIONSHIPS.md`, sección 3).
- Un expediente gestionado en modalidad documental no requiere verificación
  presencial, pero sí causa y valoración con el mismo rigor (BR-34).

## Validaciones

- Campos obligatorios para considerar el encargo mínimamente viable:
  compañía, número de referencia, asegurado, lugar de intervención
  (`CAMPOS_OBLIGATORIOS` en el código actual).

## Permisos

Solo el perito asignado (hoy, el propietario de la cuenta) puede ver, editar
o exportar el encargo.

## Casos de uso

- Se recibe un PDF de encargo de AXA para un siniestro de daño por agua en
  Barcelona: se crea el expediente, se extraen los datos automáticamente y el
  perito comienza a trabajar sobre él.
- Un encargo Instant Payment se gestiona íntegramente en modalidad documental,
  sin visita presencial, con un texto de verificación generado
  automáticamente a partir de la dirección.

## Ejemplos

```
Assignment: "SIN-2026-04521"
  cliente/aseguradora: AXA Seguros
  perito: poool.1717@gmail.com
  tipoEncargo: PERITACION
  modalidadVisita: PRESENCIAL
  claim: siniestro de daño por agua, 15/07/2026, Barcelona
  estado: borrador
```

## Posibles evoluciones

- Separar formalmente `Assignment` de `Claim` (ver `CLAIM.md`), para permitir
  que un mismo siniestro dé lugar a más de un encargo a lo largo del tiempo.
- Plazos contractuales de entrega, con alertas de vencimiento (relacionado con
  `TASK.md` y `NOTIFICATION.md`).
- Reparto automático de encargos entrantes entre los peritos de una
  organización, por carga de trabajo o zona.

## Relación con el sistema actual

**Es la entidad mejor implementada del sistema**, aunque bajo el nombre
`informes` y sin separación de sus partes conceptuales (`Client`, `Insurer`,
`Claim`). Es la fila central de la base de datos y el objeto que viaja por
casi todo el código bajo el nombre `cData`/`active`.

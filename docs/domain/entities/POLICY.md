# POLICY

> Bounded context: Póliza y Cobertura · **Implementada de forma implícita,
> sin identidad ni versión propia**

## Objetivo

Representar el contrato de seguro cuyas condiciones determinan si el
siniestro tiene cobertura, con qué capitales y bajo qué límites.

## Descripción

La póliza es, junto con el siniestro, el segundo pilar sobre el que se
levanta toda la peritación: sin conocer sus condiciones no se puede
determinar cobertura, capital ni franquicia. En PERIT.IA, la póliza se conoce
por extracción de IA a partir del PDF aportado (IA-2, la extracción más
compleja del sistema, ver Sprint 0, `AI_INVENTORY.md`), y sus datos quedan
incorporados al expediente sin persistir el documento fuente ni versionar sus
condiciones en el tiempo.

## Responsabilidades

- Fijar el marco contractual del que dependen todos los cálculos económicos
  del expediente: capitales, franquicias, umbrales, exclusiones.
- Determinar qué garantías están contratadas y con qué alcance.

## Atributos

| Atributo | Tipo | Implementado | Descripción |
|---|---|---|---|
| `id` | identificador | No | Clave de la póliza |
| `numPoliza` | texto | Sí | Número de póliza |
| `insurerId` | referencia | Parcial (texto) | Aseguradora emisora |
| `fechaEfecto` | fecha | Sí | Inicio de vigencia de las condiciones aplicables |
| `ramo` | texto | Sí | Ramo cubierto |
| `productoContratado` | texto | Sí | Nombre comercial del producto |
| `primerRiesgo` | booleano | Sí | Si el continente está a primer riesgo |
| `valorNuevoContinente` / `valorNuevoContenido` | booleano | Sí | Si se asegura a valor de reposición a nuevo |
| `depreciacionPoliza` | número | Sí | Porcentaje de depreciación que la propia póliza fija |
| `condicionesEspeciales` | texto | Sí | Resumen de condiciones relevantes |

## Relaciones

- N Policy — 1 `INSURER`
- 1 Policy — N `POLICY_VERSION` (conceptual)
- 1 Policy — N `COVERAGE`
- N Policy — 0..1 `ASSIGNMENT` (la póliza puede reutilizarse en encargos
  sucesivos sobre el mismo riesgo, aunque hoy cada expediente la extrae de
  nuevo, sin reutilización)

## Ciclo de vida

Ver `LIFECYCLES.md`, sección 3. Nace fuera del sistema, cuando la aseguradora
la emite. Entra en el dominio de PERIT.IA en el momento en que se aporta como
documento y se extrae su contenido. No caduca dentro del sistema: PERIT.IA no
gestiona su vigencia, solo la interpreta puntualmente.

## Estados

Conceptualmente: `Vigente` · `Vencida` · `Anulada` — ninguno representado hoy;
la póliza se trata siempre como un dato estático y presente.

## Eventos

`PolizaAportada` · `PolizaExtraida` · `CondicionesDeCoberturaIdentificadas`.

## Reglas de negocio

- Una póliza pertenece a una única compañía aseguradora (BR-01).
- Una póliza cubre uno o varios ramos, y dentro de cada ramo, una o varias
  garantías (BR-04).
- Una garantía puede aplicarse de forma independiente al continente y al
  contenido (BR-05).

## Validaciones

- El sistema comprueba que la extracción haya producido al menos algún dato
  aprovechable antes de darla por válida (aplicado de forma más laxa que en
  el encargo: no hay ningún campo obligatorio exigido para la póliza).

## Permisos

Hereda los del expediente al que pertenece.

## Casos de uso

- Se aporta la póliza junto al encargo: IA-2 extrae capitales, franquicias,
  garantías activas y el texto literal de cada cobertura.
- No se aporta póliza: el expediente sigue siendo viable con los datos del
  encargo, pero sin capitales de referencia claros, lo que dificulta detectar
  infraseguro.

## Ejemplos

```
Policy: número 8452001-AX
  insurer: AXA Seguros
  ramo: Hogar
  primerRiesgo: false
  valorNuevoContinente: true
  fechaEfecto: 30/06/2021
```

## Posibles evoluciones

- Persistencia del documento fuente para trazabilidad (P-17).
- Versionado de condiciones (ver `POLICY_VERSION.md`).
- Reutilización de una misma póliza entre expedientes distintos del mismo
  asegurado, evitando reextraerla cada vez.

## Relación con el sistema actual

**Implementada de forma implícita**, como un subconjunto de campos dentro de
`encargo` (JSONB). No tiene identidad propia, no se reutiliza entre
expedientes, y su documento fuente no se conserva (Sprint 0, DT-12; P-17).

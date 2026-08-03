# INSURER

> Bounded context: Gestión del Encargo / Póliza y Cobertura ·
> **Parcialmente implementada — como texto libre, no como entidad configurable**

## Objetivo

Representar a la compañía aseguradora que emite la póliza y asume el riesgo
del siniestro, de forma que el sistema pueda tratar sus particularidades
—formato de póliza, garantías propias, criterios de valoración— como
configuración y no como código.

## Descripción

La aseguradora es, junto con el asegurado, una de las dos partes del contrato
de seguro. Es quien, en la inmensa mayoría de los casos observados hoy en
PERIT.IA, actúa también como `Client` (ver `CLIENT.md`). El principio rector
del proyecto —la plataforma debe ser independiente de la aseguradora— convierte
a esta entidad en la pieza central de cualquier estrategia multi-compañía: cada
particularidad de cómo una aseguradora redacta sus pólizas o estructura sus
capitales debería vivir aquí, como dato, nunca como código o como prompt
especializado.

## Responsabilidades

- Ser la referencia única de cada compañía aseguradora con la que se trabaja.
- Alojar, en su evolución futura, la configuración específica de cómo
  interpretar sus documentos (plantillas de extracción, catálogo de
  garantías propio, reglas de selección de capital).

## Atributos

| Atributo | Tipo | Implementado | Descripción |
|---|---|---|---|
| `id` | identificador | No | Clave de la aseguradora |
| `nombreComercial` | texto | Parcial (`COMPANIAS`, lista cerrada de 14) | Nombre con el que se muestra en el informe |
| `variantesNombre` | lista | Parcial (solo para AXA, `normCompania`) | Formas alternativas con las que aparece en los documentos |
| `plantillaExtraccionId` | referencia | No | Configuración de cómo leer sus pólizas (conceptual) |
| `catalogoGarantiasId` | referencia | No | Sus garantías propias y su nomenclatura (conceptual) |

## Relaciones

- 1 Insurer — N `POLICY`
- 1 Insurer — N `ASSIGNMENT` (cuando actúa también como `Client`)

## Ciclo de vida

Nace cuando el perito trabaja por primera vez con una compañía nueva. Su
configuración (si llega a existir) madura con cada expediente adicional, a
medida que se detectan particularidades de cómo esa aseguradora redacta sus
documentos. No tiene fin de vida natural.

## Estados

`Activa` · `Inactiva` (sin trabajar con ella recientemente).

## Eventos

`AseguradoraRegistrada` · `ConfiguracionDeAseguradoraActualizada`.

## Reglas de negocio

- Una póliza pertenece siempre a una única aseguradora (BR-01).
- La plataforma debe funcionar de forma equivalente para cualquier
  aseguradora (BR-38) — **regla incumplida hoy**, ver más abajo.

## Validaciones

Ninguna formal hoy: el nombre de la aseguradora es texto libre extraído por
IA, sin contraste contra un catálogo cerrado salvo la normalización específica
de AXA.

## Permisos

Sin restricciones propias más allá de las del expediente al que pertenece la
póliza.

## Casos de uso

- El perito trabaja habitualmente con AXA: el sistema normaliza cualquier
  variante de su nombre a "AXA Seguros" y aplica sus reglas de extracción
  específicas.
- El perito recibe un encargo de una aseguradora nueva, nunca vista: hoy no
  hay ninguna adaptación posible salvo que el prompt genérico de extracción
  funcione razonablemente bien "por similitud" con AXA.

## Ejemplos

```
Insurer: "AXA Seguros"
  variantesNombre: [AXA, AXA Seguros Generales SA, AXA Seguros]
  plantillaExtraccionId: (implícita en el prompt del código, no configurable)

Insurer: "Mapfre"
  variantesNombre: [Mapfre]
  plantillaExtraccionId: (no existe; usa el mismo prompt genérico que AXA)
```

## Posibles evoluciones

- Configuración de extracción por aseguradora en `knowledge/` (Sprint 0,
  R-14), sustituyendo el prompt hoy especializado para AXA.
- Catálogo de garantías propio por aseguradora, con su correspondencia al
  vocabulario común del glosario de PERIT.IA.
- Acuerdos de nivel de servicio por aseguradora (plazo de entrega, formato
  exigido).

## Relación con el sistema actual

**Parcialmente implementada.** Existe una lista cerrada de 14 nombres
(`COMPANIAS`) y una normalización específica para AXA (`normCompania`), pero
ninguna configuración real por aseguradora: los prompts de extracción de
encargo y de póliza están escritos pensando en AXA ("expertos en pólizas AXA y
similares"). Es la manifestación más directa de la deuda técnica DT-05 del
Sprint 0, y la pregunta de si esas reglas son del oficio pericial o
específicas de AXA es P-08 en `docs/OPEN_QUESTIONS.md`.

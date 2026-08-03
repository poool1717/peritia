---
id: knowledge://coverages/incendio
tipo: coverage
version: 1
estado: borrador
idioma: es
confianza: media

vigenciaDesde: 2026-08-01
vigenciaHasta: null

ambito:
  ramo: [hogar, comunidades, comercio, industria]
  aseguradora: null
  provincia: null

codigo: INCEN
bloques:
  continente: true
  contenido: true
requiereVerificacionExterna: false

relaciones:
  garantias:
    - knowledge://coverages/danos-por-agua
    - knowledge://coverages/danos-electricos
  subgarantias: []
  objetos: []
  materiales: []
  danos: []
  causas: []
  metodos: []
  normativa: []
  documentacion: []
  fotografias: []
  procedimientos: []

autor: claude
revisadoPor: null
fuentes:
  - tipo: codigo_actual
    referencia: "components/Peritia.jsx — código INCEN en franquicias{} y descripciones{} del prompt de extracción de póliza"
    fecha: 2026-08-01
  - tipo: elaboracion_propia
    referencia: "Alcance, exclusiones y frontera: conocimiento estándar del oficio, pendiente de validación por Pol"
    fecha: 2026-08-01
historial:
  - version: 1
    fecha: 2026-08-01
    autor: claude
    estado: borrador
    cambio: "Creación inicial como ejemplo de referencia del Sprint 3"
---

# Incendio

## Definición

Garantía que ampara los daños materiales causados por la combustión y la
acción del fuego, así como los daños consecuenciales derivados de la
extinción y del humo, cuando el fuego se produce de forma accidental y se
propaga fuera del lugar destinado a contenerlo.

## Alcance por bloque

### Continente

Elementos constructivos afectados por el fuego, el calor, el humo y el agua
o los agentes empleados en la extinción, incluida la eventual demolición de
elementos que hayan quedado en estado inseguro.

### Contenido

Bienes muebles destruidos o deteriorados por el fuego, el humo o la
extinción. El humo es, con frecuencia, la causa de mayor alcance económico
sobre el contenido, porque afecta a superficie mucho mayor que la alcanzada
por las llamas.

## Casos habituales

- Incendio de origen eléctrico en cuadro o instalación, con daño localizado
  y ahumado generalizado de la estancia.
- Incendio de origen doméstico en cocina, con daño a mobiliario, campana y
  paramentos.
- Daño por humo sin daño directo por llama en estancias contiguas.
- Daño por agua de extinción en plantas inferiores.

## Casos excepcionales

- Incendio de origen externo propagado desde un inmueble colindante, que
  puede activar una reclamación frente a un tercero además de la propia
  garantía.
- Conato sin llama con daño exclusivamente por humo, en el que discutir si
  hubo o no "incendio" en sentido contractual es determinante para la
  cobertura.
- Daño por calor sin combustión (proximidad a foco de calor), que muchas
  pólizas excluyen expresamente al no haber fuego propiamente dicho.

## Exclusiones

Exclusiones **habituales del mercado**, con valor orientativo:

- Daños por quemaduras o chamuscados sin propagación del fuego, típicamente
  excluidos por no constituir incendio.
- Daños causados intencionadamente por el asegurado.
- Daños a bienes sometidos a proceso de calor por su propia función
  (hornos, chimeneas) cuando el daño se produce dentro del lugar destinado
  a contener el fuego.

⚠ Las exclusiones aplicables a un expediente concreto son siempre las de su
póliza.

## Límites típicos

- Límite de capital sobre continente y contenido, de forma independiente.
- Franquicia, general o específica.
- Sublímites frecuentes para gastos de desescombro, salvamento y
  reposición de documentos.

## Documentación necesaria

- Póliza con el detalle de la garantía y sus capitales.
- Atestado o informe de bomberos, cuando haya habido intervención.
- Informe de la causa del incendio, si se ha determinado pericialmente.
- Factura o presupuesto de reparación y reposición.
- Reportaje fotográfico del foco y del alcance.

## Fotografías recomendadas

Pendiente de crear la ficha `photo_guide` correspondiente.

## Frontera con otras garantías

| Frente a | Criterio de separación |
|---|---|
| **Daños eléctricos** | Si el daño se limita al efecto de la corriente sobre el aparato o la instalación, sin combustión propagada, corresponde a daños eléctricos. Si hay fuego propagado, corresponde a esta garantía |
| **Daños por agua** | El agua de extinción se imputa a incendio como daño consecuencial, no a la garantía de agua |
| **Riesgos extensivos** | El incendio originado por rayo suele imputarse a la garantía que la póliza designe expresamente para el rayo, que no siempre es esta |

## Observaciones

⚠ **Carencia detectada en el baremo actual.** El sistema no tiene ninguna
partida de reparación específica de daños por incendio: no existen partidas
de limpieza de hollín, desodorización, saneado de elementos carbonizados ni
desescombro por incendio. Las tres partidas de limpieza disponibles
("Limpieza final de obra", "Limpieza por siniestro", "Desinfección") son
genéricas. Valorar un siniestro de incendio con el baremo actual obliga hoy a
introducir partidas a mano. Ver el resumen de cierre del Sprint 3.

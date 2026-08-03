---
id: knowledge://materials/parquet
tipo: material
version: 1
estado: borrador
idioma: es
confianza: sin_verificar

vigenciaDesde: 2026-08-01
vigenciaHasta: null

ambito:
  ramo: []
  aseguradora: null
  provincia: null

categoria: Pavimento
calidadesDisponibles: [Básica, Media, Alta]
vidaUtilAniosReferencia: null
unidadMedidaHabitual: m²
esReparableParcialmente: true

relaciones:
  garantias:
    - knowledge://coverages/danos-por-agua
  subgarantias: []
  objetos: []
  materiales: []
  danos: []
  causas:
    - knowledge://causes/rotura-de-tuberia
  metodos: []
  normativa: []
  documentacion: []
  fotografias: []
  procedimientos: []

autor: claude
revisadoPor: null
fuentes:
  - tipo: elaboracion_propia
    referencia: "Material NO presente en el baremo del sistema (cero partidas de parquet o tarima en las 47 verificadas). Contenido basado en conocimiento estándar del oficio, pendiente de validación por Pol."
    fecha: 2026-08-01
historial:
  - version: 1
    fecha: 2026-08-01
    autor: claude
    estado: borrador
    cambio: "Creación inicial como ejemplo de referencia del Sprint 3, marcando un hueco detectado en el baremo"
---

# Parquet

> ⚠ **Material sin ninguna partida en el baremo actual.** Las 47 partidas
> verificadas del sistema solo contemplan pavimento de baldosa cerámica. No
> existe ninguna partida de desmontaje, suministro, colocación, acuchillado ni
> barnizado de parquet o tarima. Ver `## Observaciones`.

## Definición

Pavimento de madera, en cualquiera de sus formatos: parquet macizo, parquet
multicapa (contralaminado), o tarima flotante laminada. Los tres se comportan
de forma muy distinta ante el daño por agua, y su valoración difiere
sustancialmente.

## Identificación en inspección

Distinguir el tipo es determinante para valorar, y no siempre es evidente:

| Tipo | Cómo se reconoce | Comportamiento ante el agua |
|---|---|---|
| **Macizo** | Canto de madera uniforme en todo el espesor; suele ir encolado o clavado | Se hincha y deforma, pero admite acuchillado y rebarnizado si el soporte no ha cedido |
| **Multicapa** | Canto con capa noble superior fina sobre soporte contrachapado | Admite un número muy limitado de acuchillados; la capa noble puede levantarse |
| **Laminado (tarima flotante)** | Canto de tablero de fibras (HDF), habitualmente con junta de clic; no es madera natural en superficie | **No es reparable**: el HDF se hincha de forma irreversible al mojarse |

## Calidades

La calidad depende del tipo, de la especie de madera, del espesor de la capa
noble (en multicapa) y del formato de la lama. Una sustitución debe reponer
material equivalente, no un laminado genérico en lugar de un macizo.

## Comportamiento ante el daño

Ante el agua, la madera absorbe, se hincha y deforma. El daño característico
es el **abombamiento o cúpula** en las juntas entre lamas, y la separación de
las propias juntas al secarse. El proceso continúa después de retirar el
agua, por lo que el alcance definitivo puede no ser visible en la primera
inspección: es un daño progresivo.

En tarima flotante, el hinchamiento del núcleo de fibras es irreversible y
obliga a sustituir.

## Reparación frente a sustitución

- **Acuchillado y rebarnizado** en macizo, cuando la deformación es leve y el
  espesor lo permite.
- **Sustitución de lamas puntuales** cuando el daño está localizado y se
  dispone de material de reserva de la misma partida de fabricación.
- **Sustitución de la superficie completa** en tarima flotante mojada, y en
  general cuando no es posible casar el material existente.

**Uniformidad estética — determinante en este material.** El parquet no se
sustituye por estancias aisladas cuando el pavimento es continuo entre ellas:
la diferencia de tono entre madera nueva y madera envejecida es visible
incluso con material idéntico. Este criterio suele obligar a extender la
sustitución a toda la superficie continua, y es la principal fuente de
discrepancia económica en expedientes de daño por agua sobre parquet.

## Depreciación

`sin_verificar`. Sin dato de vida útil de referencia confirmado.

## Casos habituales

- Abombamiento del pavimento por fuga de tubería empotrada bajo el
  pavimento o en tabique contiguo.
- Daño en la franja perimetral de la estancia por filtración desde paramento.
- Tarima flotante hinchada por rebose de electrodoméstico.

## Casos excepcionales

- Daño bajo mobiliario fijo (armarios empotrados, cocinas), cuyo desmontaje y
  reposición debe valorarse aparte del propio pavimento.
- Parquet sobre suelo radiante, en el que la reparación afecta también a la
  instalación de climatización.
- Pavimento descatalogado, imposible de reponer parcialmente.

## Exclusiones

- Suelo laminado sin capa de madera natural: aunque comercialmente se
  denomine "tarima", técnicamente no es parquet y su valoración es muy
  distinta. Merecería ficha propia.
- Pavimento vinílico con acabado imitación madera: material completamente
  distinto.

## Métodos de reparación aplicables

**Ninguno verificado.** El baremo actual no tiene partidas de parquet. Las
partidas de pavimento existentes ("Demolición de pavimento existente",
"Formación de pavimento", "Suministro baldosa cerámica", "Colocación baldosa
cerámica") son de cerámica y no sirven para valorar este material.

## Documentación necesaria

Factura de instalación o memoria de calidades, para acreditar tipo, especie
y formato — imprescindible cuando la reposición debe ser equivalente.

## Fotografías recomendadas

Pendiente de crear la ficha `photo_guide` correspondiente. Debe incluir
detalle del canto de una lama levantada: es lo que permite acreditar el tipo
de parquet y, con él, si el daño es reparable o no.

## Observaciones

⚠ **Carencia del baremo.** El parquet es uno de los pavimentos más frecuentes
en vivienda y uno de los materiales más sensibles al daño por agua —la
garantía más habitual del sistema—, y sin embargo **no tiene ninguna partida
propia**. Es, probablemente, el hueco de mayor impacto práctico detectado en
este sprint. Ver el resumen de cierre.

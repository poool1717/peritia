---
id: knowledge://materials/teja-ceramica
tipo: material
version: 1
estado: borrador
idioma: es
confianza: sin_verificar

vigenciaDesde: 2026-08-01
vigenciaHasta: null

ambito:
  ramo: [hogar, comunidades]
  aseguradora: null
  provincia: null

categoria: Cubierta
calidadesDisponibles: [Básica, Media, Alta]
vidaUtilAniosReferencia: null
unidadMedidaHabitual: m²
esReparableParcialmente: true

relaciones:
  garantias:
    - knowledge://coverages/riesgos-extensivos
    - knowledge://coverages/danos-por-agua
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
  - tipo: elaboracion_propia
    referencia: "Material NO presente en el baremo del sistema (cero partidas de teja o cubierta en las 47 verificadas). Contenido basado en conocimiento estándar del oficio, pendiente de validación por Pol."
    fecha: 2026-08-01
historial:
  - version: 1
    fecha: 2026-08-01
    autor: claude
    estado: borrador
    cambio: "Creación inicial como ejemplo de referencia del Sprint 3, marcando un hueco detectado en el baremo"
---

# Teja cerámica

> ⚠ **Material sin ninguna partida en el baremo actual.** Las 47 partidas
> verificadas no incluyen ningún trabajo de cubierta: ni retirada, ni
> suministro, ni colocación de teja, ni impermeabilización, ni medios
> auxiliares de trabajo en altura. Ver `## Observaciones`.

## Definición

Elemento de cobertura de cubierta inclinada, fabricado en arcilla cocida, en
sus formatos habituales: teja curva (árabe), teja mixta y teja plana.

## Identificación en inspección

- Formato y solape, que determinan el número de piezas por metro cuadrado y,
  con ello, la medición.
- Sistema de fijación: recibida con mortero, atornillada o simplemente
  encajada por gravedad. Condiciona por completo el coste de sustitución.
- Existencia o no de lámina impermeabilizante bajo la teja: si existe, una
  teja rota no produce necesariamente filtración inmediata al interior.
- Estado del rastrel o del soporte, visible solo al retirar piezas.

## Calidades

Determinada por el formato, el tratamiento superficial (natural, esmaltada,
envejecida) y la resistencia a heladicidad, relevante en zonas frías. La
reposición debe casar con la teja existente, cuestión no trivial en
cubiertas antiguas.

## Comportamiento ante el daño

La teja cerámica es frágil ante el impacto —pedrisco, caída de rama, tránsito
sobre la cubierta— y resistente a la intemperie. El daño típico es la rotura
o el desplazamiento de piezas por viento, que puede no producir filtración
inmediata si hay lámina bajo teja, pero que la producirá en la siguiente
lluvia si no se repara.

Es un material en el que **el daño tiene una fase latente**: rotura hoy,
filtración semanas después. Esto complica establecer la fecha de ocurrencia y
puede llevar a discutir si el siniestro es uno o son dos.

## Reparación frente a sustitución

- **Sustitución de piezas puntuales** cuando el número de tejas afectadas es
  reducido y se dispone de piezas compatibles.
- **Levantado y reposición de un faldón completo** cuando el daño afecta al
  soporte, al rastrel o a la impermeabilización subyacente.
- El **casado de la teja** es aquí especialmente problemático: una cubierta
  con décadas de envejecimiento no admite reposición parcial invisible, pero
  al ser un elemento no visible desde el interior, el criterio de uniformidad
  estética pesa mucho menos que en un pavimento.

**Coste de medios auxiliares.** A diferencia del resto de materiales de esta
biblioteca, la intervención en cubierta exige andamio, línea de vida o
plataforma elevadora, y ese coste puede superar al de la propia teja
sustituida en daños pequeños. Valorar solo el material es un error frecuente.

## Depreciación

`sin_verificar`.

## Casos habituales

- Rotura y desplazamiento de tejas por temporal de viento, con filtración
  posterior.
- Rotura por pedrisco, con daño repartido en la superficie del faldón.
- Filtración por deterioro del mortero de recibido en cumbrera o limahoya.

## Casos excepcionales

- Daño invisible desde el interior, detectado solo al inspeccionar la
  cubierta, en el que la fecha de ocurrencia declarada por el asegurado es
  necesariamente aproximada.
- Cubierta con teja descatalogada, que obliga a sustituir el faldón completo
  o a recuperar piezas de otras zonas.
- Concurrencia de daño por viento y falta de mantenimiento previo, que es la
  discusión más habitual en esta tipología.

## Exclusiones

- Teja de hormigón: material distinto, de comportamiento y precio distintos.
- Placa de fibrocemento y panel sándwich: sistemas de cubierta distintos.
- Elementos singulares de cubierta (claraboyas, chimeneas, canalones), con
  tratamiento propio.

## Métodos de reparación aplicables

**Ninguno verificado.** El baremo no contiene partidas de cubierta. La única
partida genérica aplicable sería "Medios auxiliares" (AUXILIARES, 15 €/u),
manifiestamente insuficiente para valorar un trabajo en altura.

## Documentación necesaria

- Acreditación del evento atmosférico, cuando la causa es viento o pedrisco:
  es el supuesto en que el sistema sí dispone de verificación automática
  contra estación meteorológica.
- Presupuesto de reparación con desglose de medios auxiliares.

## Fotografías recomendadas

Pendiente de crear la ficha `photo_guide` correspondiente. Debe contemplar la
dificultad práctica de fotografiar una cubierta con seguridad.

## Observaciones

⚠ **Carencia del baremo, con agravante.** Los daños en cubierta son el
supuesto más característico de la garantía de riesgos extensivos /
atmosféricos —precisamente la única garantía del sistema que tiene
verificación externa automatizada (consulta a estación meteorológica)—. Que
exista la verificación de la causa pero no ninguna partida para valorar la
reparación es una asimetría llamativa del catálogo actual.

---
id: knowledge://coverages/rotura-de-cristales
tipo: coverage
version: 1
estado: borrador
idioma: es
confianza: sin_verificar

vigenciaDesde: 2026-08-01
vigenciaHasta: null

ambito:
  ramo: [hogar, comunidades, comercio]
  aseguradora: null
  provincia: null

codigo: null
bloques:
  continente: true
  contenido: true
requiereVerificacionExterna: false

relaciones:
  garantias:
    - knowledge://coverages/robo
    - knowledge://coverages/riesgos-extensivos
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
    referencia: "Garantía estándar del mercado asegurador español. NO existe en el sistema actual: cero apariciones de 'cristal' o 'vidrio' en components/Peritia.jsx. Pendiente de confirmación de negocio."
    fecha: 2026-08-01
historial:
  - version: 1
    fecha: 2026-08-01
    autor: claude
    estado: borrador
    cambio: "Creación inicial como ejemplo de referencia del Sprint 3, marcando un hueco detectado en el catálogo de garantías"
---

# Rotura de cristales

> ⚠ **Esta garantía NO existe en el sistema actual.** El catálogo
> implementado reconoce siete garantías (`INCEN`, `DAGUA`, `RGEXT`, `ROBO`,
> `DELEC`, `RCEXP`, `RCLOC`) y ninguna cubre la rotura de cristales. Una
> búsqueda exhaustiva de "cristal" y "vidrio" en `components/Peritia.jsx`
> devuelve **cero coincidencias**: ni como garantía, ni como material, ni como
> partida de baremo.
>
> La ficha se crea deliberadamente para dejar constancia del hueco. Su
> `codigo` queda a `null` porque asignarle uno sería inventar una decisión que
> corresponde al negocio. Ver `docs/OPEN_QUESTIONS.md`, P-25.

## Definición

Garantía que ampara la rotura accidental de elementos de vidrio o cristal
que forman parte del riesgo asegurado —lunas, acristalamientos, espejos,
encimeras, mamparas— incluidos los gastos de retirada, transporte y
colocación del elemento sustituido.

## Alcance por bloque

### Continente

Acristalamiento de huecos de fachada y de patios, mamparas fijas, espejos
adheridos a paramento, vidrios de puertas y ventanas.

### Contenido

Elementos de vidrio no incorporados al inmueble: encimeras, mesas, vitrinas,
espejos no fijados.

## Casos habituales

- Rotura accidental de una hoja de acristalamiento de ventana.
- Rotura de mampara de baño o de encimera de vitrocerámica.
- Rotura de espejo fijado a paramento durante una manipulación.

## Casos excepcionales

- Rotura de vidrio de doble acristalamiento en la que solo una de las hojas
  resulta afectada, pero la sustitución técnica obliga a reponer la unidad
  completa.
- Fisura progresiva sin impacto identificable, en la que discutir el carácter
  súbito del daño es determinante.
- Rotura de vidrio con marcado técnico específico (seguridad, control solar,
  acústico), cuya reposición tiene un coste muy superior al de un vidrio
  común y exige acreditar sus características.

## Exclusiones

Exclusiones **habituales del mercado**, con valor orientativo y **sin
verificar** contra ninguna póliza concreta:

- Arañazos, desconchados y defectos superficiales sin rotura.
- Rotura durante trabajos de instalación, montaje o traslado del propio
  elemento.
- Vidrios de aparatos y electrodomésticos, habitualmente amparados —si acaso—
  por la garantía del propio aparato.
- Rotura por defecto de fabricación o de colocación.

## Límites típicos

- Límite de capital, con frecuencia expresado a primer riesgo.
- Franquicia, que en esta garantía es a menudo inexistente o simbólica por
  la baja cuantía habitual del siniestro.

## Documentación necesaria

- Póliza con el detalle de la garantía.
- Presupuesto o factura de sustitución, con las características técnicas del
  vidrio repuesto.
- Reportaje fotográfico de la rotura antes de la sustitución.

## Fotografías recomendadas

Especialmente crítico en esta garantía: el elemento roto se sustituye con
rapidez y, una vez repuesto, la evidencia desaparece por completo. Sin
fotografía previa a la sustitución, el daño resulta prácticamente
inacreditable.

## Frontera con otras garantías

| Frente a | Criterio de separación |
|---|---|
| **Robo** | El vidrio roto para acceder al inmueble es daño de robo, no de esta garantía |
| **Riesgos extensivos** | El vidrio roto por pedrisco o viento se imputa a la garantía atmosférica |
| **Incendio** | El vidrio roto por el calor del fuego es daño consecuencial de incendio |

Esta triple frontera explica, en parte, por qué la ausencia de la garantía en
el sistema puede no haberse notado: buena parte de las roturas de cristal que
llegan a un expediente entran por otra garantía.

## Observaciones

**Hueco correlativo en el baremo.** No solo falta la garantía: tampoco existe
ninguna partida de reparación relacionada con vidrio en las 47 del baremo
actual —ni suministro, ni retirada, ni colocación—. Un expediente de rotura
de cristales hoy debe valorarse íntegramente a mano o por factura.

**Qué haría falta para aprobar esta ficha:** confirmación de Pol sobre si el
negocio recibe encargos de esta garantía, y en tal caso, asignación de su
código canónico e incorporación al catálogo de `TAXONOMY.md` §4.

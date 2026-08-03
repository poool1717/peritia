---
id: knowledge://coverages/danos-por-agua
tipo: coverage
version: 1
estado: borrador
idioma: es
confianza: media

vigenciaDesde: 2026-08-01
vigenciaHasta: null

ambito:
  ramo: [hogar, comunidades, comercio]
  aseguradora: null
  provincia: null

codigo: DAGUA
bloques:
  continente: true
  contenido: true
requiereVerificacionExterna: false

relaciones:
  garantias:
    - knowledge://coverages/riesgos-extensivos
  subgarantias: []
  objetos: []
  materiales:
    - knowledge://materials/pladur
    - knowledge://materials/parquet
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
  - tipo: codigo_actual
    referencia: "components/Peritia.jsx — código DAGUA en franquicias{} y descripciones{} del prompt de extracción de póliza"
    fecha: 2026-08-01
  - tipo: codigo_actual
    referencia: "BAREMO — 12 partidas con dano='Humedad' o 'Rotura de tubería'"
    fecha: 2026-08-01
  - tipo: elaboracion_propia
    referencia: "Alcance, exclusiones típicas y frontera con otras garantías: conocimiento estándar del oficio, pendiente de validación por Pol"
    fecha: 2026-08-01
historial:
  - version: 1
    fecha: 2026-08-01
    autor: claude
    estado: borrador
    cambio: "Creación inicial como ejemplo de referencia del Sprint 3"
---

# Daños por agua

## Definición

Garantía que ampara los daños materiales directos causados por la acción del
agua procedente de las instalaciones del riesgo asegurado, de instalaciones
ajenas, o de otros orígenes accidentales distintos de los fenómenos
atmosféricos.

## Alcance por bloque

### Continente

Elementos constructivos y acabados afectados por el agua: paramentos
verticales y horizontales, pavimentos, revestimientos, falsos techos y las
propias instalaciones de fontanería y desagüe cuando la póliza incluye su
reparación.

### Contenido

Mobiliario, ajuar y equipamiento dañados por el agua, con el criterio de
depreciación que corresponda a su antigüedad y estado.

## Casos habituales

- Rotura de tubería de suministro empotrada, con humedad en paramento y daño
  al pavimento de la estancia contigua.
- Filtración procedente de la vivienda superior, con afectación de techo y
  parte alta de paredes.
- Atasco o rebose de desagüe con encharcamiento del pavimento.
- Daño a mobiliario apoyado sobre paramento húmedo o sobre suelo encharcado.

## Casos excepcionales

- Daño por agua cuyo origen está en un elemento común de la comunidad, que
  desplaza la reclamación al seguro de la comunidad de propietarios y puede
  activar además una garantía de responsabilidad civil.
- Concurrencia con causa atmosférica: agua de lluvia que penetra por un
  elemento previamente dañado por viento. La imputación depende de cuál sea
  la causa eficiente del daño, no del agua como agente material.
- Daño oculto de manifestación tardía, en el que la fecha de ocurrencia
  declarada y la fecha real de inicio del proceso no coinciden.

## Exclusiones

Exclusiones **habituales del mercado**, con valor orientativo:

- Daños derivados de falta de mantenimiento de las instalaciones.
- Humedad por condensación o capilaridad, al no responder a un hecho súbito
  y accidental.
- El coste de reparación de la propia avería cuando la póliza cubre solo sus
  consecuencias (varía notablemente entre productos).
- Daños producidos durante obras de reforma en curso.

⚠ Las exclusiones aplicables a un expediente concreto son siempre las de su
póliza, extraídas del documento real. Esta lista no sustituye a esa lectura.

## Límites típicos

- Límite de capital sobre el continente y sobre el contenido, de forma
  independiente.
- Franquicia, general de la póliza o específica de esta garantía.
- Sublímite frecuente para localización y reparación de la avería, distinto
  del límite de los daños que causa.

Sin importes: proceden siempre de la póliza del expediente.

## Documentación necesaria

- Póliza con el detalle de la garantía y sus capitales.
- Acreditación del origen del agua (informe del reparador, prueba de
  estanqueidad).
- Factura o presupuesto de reparación.
- Reportaje fotográfico del daño y del punto de origen.

## Fotografías recomendadas

Pendiente de crear la ficha `photo_guide` correspondiente.

## Frontera con otras garantías

| Frente a | Criterio de separación |
|---|---|
| **Riesgos extensivos / Atmosféricos** | Si el agua procede de lluvia, nieve o pedrisco actuando sobre el riesgo, la garantía aplicable es la atmosférica, no esta. La frontera se decide por el origen del agua, no por el daño observado |
| **Incendio** | El agua empleada en la extinción de un incendio se imputa habitualmente a la garantía de incendio como daño consecuencial, no a esta |
| **RC Explotación / Locatario** | Cuando el agua causa daño a un tercero (vivienda vecina), el daño propio va a esta garantía y el daño ajeno a la de responsabilidad civil |

## Observaciones

Es la garantía con mayor cobertura en el baremo actual del sistema: doce
partidas verificadas responden específicamente a daños de humedad o rotura de
tubería (albañilería, pintura y lampistería). Es también la garantía más
frecuente en la práctica de expedientes de hogar.

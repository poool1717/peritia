---
id: knowledge://causes/rotura-de-tuberia
tipo: cause
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

categoria: Hídrica
esSubita: true
requiereVerificacionExterna: false
fuenteVerificacion: null
requiereUmbral: false

relaciones:
  garantias:
    - knowledge://coverages/danos-por-agua
  subgarantias: []
  objetos: []
  materiales:
    - knowledge://materials/pladur
    - knowledge://materials/parquet
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
    referencia: "components/Peritia.jsx — CAUSA_COB mapea AGUA y FILTRAC a la garantía 'Daños por agua'; 8 partidas del BAREMO llevan dano='Rotura de tubería'"
    fecha: 2026-08-01
  - tipo: elaboracion_propia
    referencia: "Acreditación, distinción súbito/deterioro y causas concomitantes: conocimiento estándar del oficio, pendiente de validación por Pol"
    fecha: 2026-08-01
historial:
  - version: 1
    fecha: 2026-08-01
    autor: claude
    estado: borrador
    cambio: "Creación inicial como ejemplo de referencia del Sprint 3"
---

# Rotura de tubería

## Definición

Fallo súbito y accidental de una conducción de agua —de suministro, de
distribución interior o de evacuación— que provoca la salida incontrolada de
agua y el consiguiente daño a los elementos del riesgo asegurado.

## Garantías que activa

| Garantía | Cuándo |
|---|---|
| **Daños por agua** (`DAGUA`) | Siempre: es la garantía natural de esta causa |
| **RC Explotación / Locatario** | Adicionalmente, cuando el agua causa daño a un tercero (vivienda vecina, local inferior). El daño propio va a `DAGUA`; el ajeno, a la garantía de responsabilidad civil |

Una misma causa puede activar ambas de forma simultánea, con valoraciones
independientes.

## Acreditación

Qué demuestra que la causa es esta y no otra:

- **Localización del punto de fuga**, acreditada por el reparador. Es la
  prueba principal, y el baremo la reconoce como partida propia
  ("Localización de fuga", LAMPISTERÍA, 45 €/u).
- **Prueba de estanqueidad** posterior a la reparación, que confirma que la
  fuga era la localizada y que ha quedado resuelta (partida verificada,
  25 €/u).
- Fotografía del tramo de tubería roto, antes de su sustitución.
- Coherencia entre la ubicación de la fuga y la distribución del daño: la
  humedad debe ser compatible, en posición y extensión, con el punto de
  origen declarado.

Qué la descartaría: humedad sin punto de fuga localizable, distribución del
daño incompatible con la conducción señalada, o ausencia de caída de presión
en la instalación.

## Verificación externa

**No procede.** A diferencia de las causas atmosféricas, esta causa no se
verifica contra ninguna fuente oficial: se acredita mediante la intervención
del reparador y la evidencia recogida en la propia inspección.

## Umbrales

No aplica. Esta causa no depende de que ningún valor medido supere un
umbral de póliza.

## Daños que produce

- Humedad en paramentos verticales y horizontales.
- Deterioro de pavimentos, especialmente los sensibles al agua
  (`knowledge://materials/parquet`).
- Disgregación de placa de yeso laminado
  (`knowledge://materials/pladur`).
- Daño a mobiliario y contenido en contacto con la zona afectada.
- Daño a instalación eléctrica próxima, que puede activar adicionalmente la
  garantía de daños eléctricos.

## Causas concomitantes

- **Corrosión o envejecimiento de la instalación**: cuando la rotura se
  produce sobre una tubería en mal estado general, la discusión sobre si el
  hecho fue súbito o fue la manifestación de un deterioro progresivo es
  determinante para la cobertura. Ver la sección siguiente.
- **Helada**: la rotura por congelación del agua en la conducción es súbita,
  pero muchas pólizas la tratan de forma diferenciada.
- **Obra reciente**: una rotura durante o poco después de una reforma suele
  desplazar la responsabilidad hacia el contratista.

## Distinción respecto al deterioro progresivo

Es el criterio pericial de mayor peso en esta causa:

| Indicio de rotura súbita | Indicio de deterioro progresivo |
|---|---|
| Fractura limpia, con bordes definidos | Picaduras, adelgazamiento generalizado, corrosión extendida |
| Aparición brusca del daño, con fecha identificable | Manchas con anillos concéntricos de secado y humedecido sucesivos |
| Caída de presión detectable | Humedad estabilizada, sin progresión reciente |
| Ausencia de daño previo en la zona | Reparaciones o repintados anteriores en el mismo punto |

La mayoría de pólizas cubren el daño súbito y excluyen el derivado de falta
de mantenimiento. Determinar cuál de los dos es el caso corresponde
íntegramente al criterio del perito y debe quedar motivado en el informe.

## Casos habituales

- Rotura de tubería empotrada en tabique, con humedad ascendente o
  descendente en el paramento y daño en la estancia contigua.
- Fuga en tubería bajo pavimento, con abombamiento del suelo y humedad
  perimetral.
- Rotura en montante común de la comunidad, con daño en varias viviendas.

## Casos excepcionales

- Fuga de manifestación tardía en tubería enterrada, en la que el daño
  aparece mucho después del inicio real de la fuga.
- Rotura en instalación de calefacción, en la que el agua caliente agrava el
  daño respecto al agua fría.
- Fuga cuyo punto de origen está en propiedad ajena y resulta inaccesible
  para el perito, lo que obliga a razonar la causa de forma indirecta.

## Exclusiones

- Filtración desde el exterior (cubierta, fachada, terreno): es otra causa,
  aunque el daño observado sea muy parecido.
- Condensación: no hay rotura ni salida de agua de conducción.
- Rebose o descuido de un ocupante (grifo abierto, lavadora): causa distinta,
  habitualmente cubierta por la misma garantía pero con acreditación
  diferente.
- Atasco de desagüe: causa distinta dentro de la misma garantía.

## Documentación necesaria

- Informe o factura del reparador con la localización de la fuga.
- Prueba de estanqueidad posterior.
- Factura o presupuesto de la reparación de los daños.
- Póliza con la garantía de daños por agua y sus condiciones.

## Fotografías recomendadas

Pendiente de crear la ficha `photo_guide` correspondiente. Crítico: la
fotografía del tramo de tubería roto **antes de su sustitución** es la única
evidencia que permite valorar a posteriori si la rotura fue súbita o fue
consecuencia de corrosión, y desaparece en cuanto el fontanero interviene.

## Observaciones

Es la causa mejor cubierta por el baremo actual del sistema: ocho partidas
verificadas llevan explícitamente `dano: "Rotura de tubería"`, repartidas
entre albañilería (cierre de cata, enlucido), lampistería (localización de
fuga, sustitución de tubería, prueba de estanqueidad) y pintura. Junto con la
humedad, es el supuesto para el que el sistema está mejor preparado hoy.

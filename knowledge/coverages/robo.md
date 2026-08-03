---
id: knowledge://coverages/robo
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

codigo: ROBO
bloques:
  continente: true
  contenido: true
requiereVerificacionExterna: false

relaciones:
  garantias: []
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
    referencia: "components/Peritia.jsx — código ROBO en franquicias{} y descripciones{}; CAUSA_COB mapea ROBO y HURTO a la garantía Robo"
    fecha: 2026-08-01
  - tipo: codigo_actual
    referencia: "BAREMO — oficio CERRAJERÍA: 'Apertura de puerta' 65 €/u, 'Sustitución de bombín' 45 €/u, 'Reparación de cierre' 30 €/u"
    fecha: 2026-08-01
  - tipo: elaboracion_propia
    referencia: "Distinción robo/hurto/expoliación y exclusiones: conocimiento estándar del oficio, pendiente de validación por Pol"
    fecha: 2026-08-01
historial:
  - version: 1
    fecha: 2026-08-01
    autor: claude
    estado: borrador
    cambio: "Creación inicial como ejemplo de referencia del Sprint 3"
---

# Robo

## Definición

Garantía que ampara la sustracción ilegítima de bienes asegurados mediante
fuerza en las cosas para acceder al lugar donde se encuentran, así como los
daños causados al continente durante la comisión o la tentativa.

## Alcance por bloque

### Continente

Daños causados en el acceso: puertas, cerraduras, ventanas, rejas,
persianas y paramentos forzados. Es la parte de la garantía que el baremo
actual sí cubre, mediante las partidas de cerrajería y carpintería.

### Contenido

Bienes sustraídos, valorados según su naturaleza y antigüedad. Es
habitualmente la parte de mayor cuantía y la que más sublímites presenta.

## Casos habituales

- Fuerza en puerta de acceso con daño en cerradura y marco, y sustracción de
  bienes del interior.
- Tentativa de robo sin sustracción, con daño exclusivamente en el
  continente.
- Sustracción de bienes concretos con sublímite propio (joyas, dinero
  efectivo, equipos informáticos).

## Casos excepcionales

- Sustracción sin señales de fuerza, que la mayoría de pólizas trata como
  hurto y excluye o cubre con condiciones muy distintas.
- Robo cometido por persona con acceso legítimo al inmueble.
- Expoliación (sustracción con violencia o intimidación sobre las personas),
  que muchas pólizas tratan como garantía diferenciada del robo con fuerza.

## Exclusiones

Exclusiones **habituales del mercado**, con valor orientativo:

- Hurto: sustracción sin fuerza en las cosas ni violencia sobre las personas.
- Sustracción cometida por familiares, empleados o personas que convivan con
  el asegurado.
- Bienes situados en zonas comunes, dependencias anexas o exteriores, salvo
  pacto expreso.
- Desaparición o extravío no atribuible a un acto de sustracción acreditado.

⚠ Las exclusiones aplicables a un expediente concreto son siempre las de su
póliza.

## Límites típicos

- Límite de capital sobre contenido, habitualmente con sublímites por
  categoría de bien.
- Límite específico para dinero en efectivo y para objetos de valor
  especial.
- Franquicia, general o específica.
- Condición frecuente de existencia de medidas de protección declaradas
  (tipo de cerradura, alarma), cuyo incumplimiento puede reducir o anular la
  prestación.

## Documentación necesaria

- Póliza con el detalle de la garantía, capitales y sublímites.
- **Denuncia ante autoridad competente**: es el documento que acredita el
  hecho y sin el cual la mayoría de compañías no tramita el siniestro.
- Relación valorada de bienes sustraídos.
- Acreditación de preexistencia y valor de los bienes (facturas,
  fotografías previas, tasaciones).
- Reportaje fotográfico de las señales de fuerza.

## Fotografías recomendadas

Pendiente de crear la ficha `photo_guide` correspondiente. Debe incluir
necesariamente el detalle de las señales de fuerza en el punto de acceso: es
la evidencia que distingue robo de hurto y, por tanto, la que decide la
cobertura.

## Frontera con otras garantías

| Frente a | Criterio de separación |
|---|---|
| **Actos vandálicos** | Si hay daño sin ánimo de sustracción, corresponde a vandalismo (garantía distinta, no presente en el catálogo actual del sistema) |
| **Daños eléctricos** | El daño a un equipo durante la sustracción es daño de robo, no eléctrico |
| **RC** | El robo no genera responsabilidad civil del asegurado; si el daño se produce a un tercero durante el acceso, se valora aparte |

## Observaciones

La acreditación de la **preexistencia** de los bienes sustraídos es el punto
más conflictivo de esta garantía en la práctica: a diferencia de un daño
material, que puede examinarse, lo sustraído ya no está y su existencia
previa debe demostrarse documentalmente.

---
id: knowledge://materials/pladur
tipo: material
version: 1
estado: borrador
idioma: es
confianza: media

vigenciaDesde: 2026-08-01
vigenciaHasta: null

ambito:
  ramo: []
  aseguradora: null
  provincia: null

categoria: Revestimiento
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
  - tipo: codigo_actual
    referencia: "BAREMO — 'Cierre de cata en pladur', ALBAÑILERÍA, u, 45 €, rend 2, dano 'Rotura de tubería', cond 'Si se abre pared'"
    fecha: 2026-08-01
  - tipo: elaboracion_propia
    referencia: "Comportamiento ante el daño y criterio reparación/sustitución: conocimiento estándar del oficio, pendiente de validación por Pol"
    fecha: 2026-08-01
historial:
  - version: 1
    fecha: 2026-08-01
    autor: claude
    estado: borrador
    cambio: "Creación inicial como ejemplo de referencia del Sprint 3"
---

# Pladur (placa de yeso laminado)

## Definición

Sistema constructivo de tabiquería y trasdosado formado por placas de yeso
revestidas de celulosa, atornilladas sobre una estructura auxiliar metálica.
"Pladur" es una marca comercial usada de forma genérica en el oficio para
designar la placa de yeso laminado.

## Identificación en inspección

- Sonido hueco al golpear el paramento, frente al sonido macizo de la fábrica
  de ladrillo.
- Estructura metálica detectable con localizador de perfiles, a modulación
  regular (habitualmente 40 o 60 cm).
- Espesor de tabique menor que el de una división de fábrica equivalente.
- Presencia de juntas tratadas con cinta y pasta, visibles a luz rasante.

## Calidades

La distinción por calidad no procede tanto del yeso como del **tipo de placa**
y del tratamiento de los remates: placa estándar, placa hidrófuga (para zonas
húmedas), placa resistente al fuego, o placa de alta dureza. Una sustitución
debe reponer el mismo tipo de placa que existía, no una placa estándar
genérica.

## Comportamiento ante el daño

Es el material más sensible al agua de los habituales en tabiquería. La placa
absorbe humedad con rapidez, pierde cohesión, se disgrega y **no recupera sus
propiedades al secarse**: una placa que ha estado empapada debe sustituirse,
no secarse. El daño avanza por capilaridad desde la zona mojada hacia arriba,
por lo que la superficie afectada suele ser mayor que la visiblemente
manchada.

La estructura metálica interior, en cambio, resiste bien el agua salvo
oxidación prolongada, y habitualmente puede conservarse.

## Reparación frente a sustitución

- **Reparación puntual** cuando el daño es un orificio o una cata de registro
  de dimensión reducida: se cierra el hueco con un parche de placa, se trata
  la junta y se pinta. Es el supuesto que cubre la partida verificada del
  baremo, "Cierre de cata en pladur".
- **Sustitución de paño completo** cuando la placa ha estado empapada, cuando
  se ha disgregado, o cuando el número de reparaciones puntuales haría
  antieconómico el parcheo.
- **Uniformidad estética:** la reparación puntual siempre exige repintar,
  como mínimo, el paño completo hasta una arista o cambio de plano; no es
  posible casar una pintura parcial sobre un paramento continuo.

## Depreciación

`sin_verificar`. No consta vida útil de referencia ni criterio de
depreciación para este material en el sistema actual. Al tratarse de un
elemento del continente integrado en la obra, en la práctica pericial suele
valorarse a valor de reposición sin depreciación cuando la póliza cubre a
valor de nuevo — pero **este criterio no está confirmado por Pol** y no debe
darse por bueno sin validación.

## Casos habituales

- Cata de registro abierta para localizar una fuga, cerrada después.
- Trasdosado de fachada afectado por filtración, con disgregación de la placa
  en la franja inferior.
- Tabique divisorio empapado por rotura de tubería empotrada en su interior.

## Casos excepcionales

- Placa hidrófuga en zona húmeda que resiste sin disgregarse, lo que puede
  llevar a subestimar el alcance real del daño si solo se observa la
  superficie.
- Falso techo de placa que colapsa por acumulación de agua sobre su cara
  superior, con daño al contenido situado debajo.

## Exclusiones

- **Yeso laminado no es lo mismo que enlucido de yeso** sobre fábrica: son
  materiales y sistemas distintos, con partidas de reparación distintas
  ("Picado de enlucido" y "Enlucido con mortero" corresponden al segundo, no
  a este). Confundirlos produce una valoración incorrecta.
- Tabiquería de cartón-yeso con alma de celdillas, sistema distinto.

## Métodos de reparación aplicables

| Método | Verificado en baremo |
|---|---|
| Cierre de cata en pladur (45 €/u) | Sí |
| Pintura plástica en paredes (10 €/m²) | Sí |
| Preparación de superficies (6 €/m²) | Sí |
| Gestión de escombros (35 €/u) | Sí |
| **Sustitución de paño completo de placa** | **No existe partida propia** |

## Documentación necesaria

Memoria de calidades del edificio o factura de la reforma, cuando sea
necesario acreditar el tipo de placa instalado.

## Fotografías recomendadas

Pendiente de crear la ficha `photo_guide` correspondiente.

## Observaciones

⚠ **Carencia detectada.** El baremo actual solo contempla el cierre de una
cata puntual. **No existe partida para sustituir un paño completo de placa**,
que es el supuesto más frecuente cuando hay daño por agua significativo. Un
expediente de este tipo obliga hoy a introducir la partida a mano.

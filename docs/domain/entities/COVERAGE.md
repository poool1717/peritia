# COVERAGE

> Bounded context: Póliza y Cobertura · **Implementada como texto y estructura
> plana, no como entidad relacional**

## Objetivo

Representar cada riesgo concreto que la póliza cubre, con su capital, su
franquicia y su alcance sobre continente y contenido, de forma que el sistema
pueda determinar con precisión si un daño concreto tiene cobertura y bajo qué
condiciones.

## Descripción

La garantía es el eslabón que conecta la causa del siniestro con la
indemnización: sin garantía activa, no hay cobertura, con independencia de
cuán bien documentado esté el daño. PERIT.IA trabaja hoy con siete garantías
reconocidas (Incendio, Daños por agua, Riesgos extensivos/Atmosféricos, Robo,
Daños eléctricos, RC Explotación, RC Locatario), cada una con capital,
franquicia y texto de cobertura propios, y con la particularidad de que ese
texto se distingue explícitamente para continente y para contenido.

## Responsabilidades

- Determinar si un daño concreto está o no cubierto.
- Fijar el capital asegurado y la franquicia aplicable a ese daño.
- Conservar el texto literal de la póliza sobre esa cobertura, como evidencia
  de la extensión y los límites contratados.

## Atributos

| Atributo | Tipo | Implementado | Descripción |
|---|---|---|---|
| `id` | identificador | No | Clave de la garantía |
| `codigo` | texto | Sí | `INCEN` \| `DAGUA` \| `RGEXT` \| `ROBO` \| `DELEC` \| `RCEXP` \| `RCLOC` |
| `nombreComercial` | texto | Sí | Incendio, Daños por agua, Atmosféricos… |
| `franquicia` | número | Sí (`franquicias{codigo}`) | Franquicia específica de esta garantía |
| `textoContinente` | texto | Sí (`descripciones{codigo}.continente`) | Texto literal de cobertura o exclusión, bloque continente |
| `textoContenido` | texto | Sí (`descripciones{codigo}.contenido`) | Ídem, bloque contenido |
| `contratada` | booleano | Implícito | Si figura entre `garantiasActivas` |

## Relaciones

- N Coverage — 1 `POLICY_VERSION` (conceptual; hoy: 1 `POLICY` implícita)
- 1 Coverage — N `SUBCOVERAGE` (conceptual)
- 1 Coverage — N `DAMAGE` (los daños que se imputan a esta garantía)

## Ciclo de vida

Nace al extraerse de la póliza (IA-2). No cambia dentro de un mismo
expediente: es un dato de referencia, no algo que el perito construya.
Persiste mientras persista el expediente.

## Estados

`Contratada, con texto de cobertura` · `Contratada, con texto de exclusión` ·
`No contratada` — los tres casos que el prompt de extracción distingue
explícitamente.

## Eventos

`GarantiasDetectadas` · `TextoDeCoberturaExtraido`.

## Reglas de negocio

- Una garantía pertenece siempre a una póliza (BR-02).
- Una garantía puede aplicarse de forma independiente al continente y al
  contenido, con capitales, franquicias y textos distintos para cada bloque
  (BR-05).
- La franquicia aplicable a un daño es la específica de su garantía si existe,
  y si no, la franquicia general de la póliza (BR-22).

## Validaciones

- Si la garantía no tiene cobertura para continente o para contenido, el texto
  debe ser la cláusula exacta de exclusión, no un resumen — exigencia
  explícita del prompt actual de extracción, aunque no verificable
  automáticamente.

## Permisos

Hereda los de la póliza a la que pertenece.

## Casos de uso

- Un siniestro de rotura de tubería activa la garantía "Daños por agua": se
  consulta su franquicia específica y su texto de cobertura para continente
  (posiblemente distinto del de contenido).
- Una garantía no contratada (por ejemplo, "Robo" en una póliza que no la
  incluye) hace que cualquier daño imputado a ella quede automáticamente sin
  cobertura, con el texto de exclusión como respaldo documental de por qué.

## Ejemplos

```
Coverage: DAGUA (Daños por agua)
  franquicia: 150 €
  textoContinente: "Se garantizan los daños materiales directos causados
    por agua procedente de la red de suministro..."
  textoContenido: "Queda excluido el mobiliario situado en sótanos..."
```

## Posibles evoluciones

- Relación explícita con `SUBCOVERAGE` para desglosar cada garantía en
  conceptos más finos.
- Catálogo de garantías por aseguradora en `knowledge/garantias/` (Sprint 0,
  ficha correspondiente), sustituyendo el mapa fijo `CAUSA_COB` incrustado en
  código.

## Relación con el sistema actual

**Implementada como estructura de datos**, no como entidad con identidad
propia: vive como claves de dos objetos (`franquicias{}`, `descripciones{}`)
dentro de `encargo`. El conjunto de garantías reconocidas es una lista
cerrada de siete códigos, escrita en el prompt de extracción, no en un
catálogo consultable ni editable.

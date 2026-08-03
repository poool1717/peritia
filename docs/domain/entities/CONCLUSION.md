# CONCLUSION

> Bounded context: Informe Pericial · **Implementada como texto calculado,
> sin entidad propia**

## Objetivo

Representar el dictamen final del perito: el juicio motivado sobre causa,
alcance del daño y procedencia de la indemnización, con el importe propuesto
y su justificación.

## Descripción

La conclusión es la razón de ser del informe: todo lo anterior —verificación,
evidencia, valoración— existe para sostener esta pieza final. PERIT.IA calcula
la conclusión de forma determinista a partir de los datos ya introducidos
(no usa IA para decidir el importe, solo para redactar el texto que lo
acompaña), lo que es una fortaleza de diseño: la cifra de indemnización nunca
depende de una generación de IA no verificable, siempre de un cálculo
reproducible.

## Responsabilidades

- Fijar el importe final propuesto de indemnización.
- Justificar ese importe con referencia a la regla proporcional (si aplica),
  la franquicia y el modo de valoración.
- Identificar al perceptor de la propuesta.

## Atributos

| Atributo | Tipo | Implementado | Descripción |
|---|---|---|---|
| `id` | identificador | No | Clave de la conclusión |
| `reportId` | referencia | Sí (1–1 implícito) | Informe al que pertenece |
| `importeIndemnizacion` | número | Sí (`calcIndemnizacion`) | Importe final propuesto |
| `reglaProporcionalAplicada` | booleano | Sí | Si hubo ajuste por infraseguro |
| `franquiciaDescontada` | número | Sí | Franquicia aplicada |
| `perceptor` | enumerado | Sí | Asegurado \| Perjudicado \| Reparador |
| `textoJustificativo` | texto | Sí (`fraseIndemn`) | Redacción de la propuesta |
| `evidenciaIds` | lista | No | Evidencia que la respalda (conceptual) |

## Relaciones

- 1 Conclusion — 1 `REPORT`
- N Conclusion — N `EVIDENCE` (conceptual, BR-25)
- N Conclusion — N `DAMAGE` (los daños que resume)

## Ciclo de vida

Se recalcula en tiempo real con cada cambio en la valoración o en la regla
proporcional: no existe como un hecho congelado hasta que el informe se
exporta, momento en el que su valor queda fijado en el documento entregado
—aunque el sistema, si se vuelve a exportar tras una edición, generará una
conclusión distinta sin conservar la anterior.

## Estados

`Calculada` (en vivo) → `Exportada` (congelada en el documento entregado, sin
persistir esa congelación en el sistema).

## Eventos

`IndemnizacionCalculada` · `ConclusionExportada`.

## Reglas de negocio

- La indemnización nunca puede ser negativa (BR-21).
- La redacción depende del modo de valoración y del perceptor (BR-23).
- Toda conclusión debe estar respaldada por evidencia (BR-25) — sin
  implementación de esa relación explícita hoy.

## Validaciones

- `max(0, ajustado − franquicia)` garantiza que el importe nunca sea negativo.

## Permisos

Hereda los del informe.

## Casos de uso

- Con infraseguro del 20 % en el continente, daño valorado en 1.500 € y
  franquicia de 150 €: la conclusión aplica la regla proporcional antes de
  descontar la franquicia, y redacta la propuesta dirigida al asegurado.
- Con perceptor reparador y modo factura: la conclusión se redacta dirigida
  al reparador, sin mostrar depreciación.

## Ejemplos

```
Conclusion:
  importeIndemnizacion: 1.291,47 €
  reglaProporcionalAplicada: false
  perceptor: Asegurado
  textoJustificativo: "Se propone indemnización de la siguiente manera:
    INDEMNIZACION: Asegurado: 1.291,47 € (IVA incl.)"
```

## Posibles evoluciones

- Vínculo explícito con la evidencia que la respalda, no solo con el cálculo
  numérico.
- Persistencia de la conclusión en el momento exacto de cada exportación,
  para poder auditar qué se dijo en cada entrega.

## Relación con el sistema actual

**El cálculo es sólido y verificado** (`calcIndemnizacion`, `fraseIndemn`),
pero **como concepto de negocio, no existe como entidad propia**: es un valor
derivado que se recalcula en cada render, sin persistencia de su historial ni
vínculo declarado con la evidencia que la sostiene.

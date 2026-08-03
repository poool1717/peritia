# CONCLUSION_TEMPLATE — Plantilla maestra de Conclusión

> Plantilla para fichas de tipo `conclusion`. Destino: `knowledge/reports/`.
> Contrato común en [`README.md`](./README.md).
>
> Entidad de dominio: `docs/domain/entities/CONCLUSION.md`.
>
> Una ficha de conclusión define **cómo se motiva y se redacta un dictamen**
> en un supuesto tipo: con cobertura, sin cobertura, con reserva, con
> infraseguro. No contiene importes ni resultados: contiene el razonamiento y
> la forma de expresarlo.

---

## Front matter

```yaml
id: knowledge://reports/conclusions/<slug>
tipo: conclusion
version: 1
estado: borrador
idioma: es
confianza: sin_verificar

vigenciaDesde: <AAAA-MM-DD>
vigenciaHasta: null

ambito:
  ramo: []
  aseguradora: null
  provincia: null

# ── Específico de conclusion ─────────────────────────────────────
sentido: <texto>              # con_cobertura|sin_cobertura|cobertura_parcial|con_reserva
modoValoracion: []            # [baremo], [presupuesto], [factura] o combinación
perceptor: []                 # [asegurado], [perjudicado], [reparador]
requiereReglaProporcional: false
requiereEvidencia: true       # SIEMPRE true: no hay conclusión sin evidencia (BR-25)

relaciones:
  garantias: []
  subgarantias: []
  objetos: []
  materiales: []
  danos: []
  causas: []
  metodos: []
  normativa: []               # norma que sostiene el sentido de la conclusión
  documentacion: []           # documentos que deben respaldarla
  fotografias: []
  procedimientos: []

autor: null
revisadoPor: null
fuentes: []
historial: []
```

---

## Cuerpo

```markdown
# <Nombre canónico del supuesto de conclusión>

## Definición
En qué supuesto se emite esta conclusión.

## Condiciones para emitirla
Qué debe concurrir para que este sea el dictamen correcto. Cada condición
debe ser comprobable contra los datos del expediente, no una impresión.

## Motivación
Cómo se razona el dictamen: encadenamiento de causa, daño, garantía aplicable
y, en su caso, exclusión o límite. Una conclusión sin motivación explícita no
es un dictamen, es una afirmación.

## Evidencia exigible
Qué evidencia debe respaldar cada eslabón del razonamiento (BR-25). Es la
sección que hace auditable la conclusión.

## Redacción
Estructura de la redacción y fórmulas habituales del oficio, con huecos para
las variables. Sin importes: los importes proceden siempre del cálculo del
expediente.

## Variantes por perceptor
Cómo cambia la redacción según a quién se dirija la propuesta (asegurado,
perjudicado o reparador). El sentido del dictamen no cambia; su expresión sí.

## Variantes por modo de valoración
Cómo cambia según se haya valorado por baremo, presupuesto o factura.

## Advertencias y reservas
Qué salvedades deben hacerse constar: supeditación al criterio de la
compañía, pendiente de documentación, valoración provisional.

## Casos habituales
## Casos excepcionales

## Exclusiones
Supuestos parecidos que conducen a una conclusión distinta, con el criterio
que los separa.

## Observaciones
```

---

## Reglas específicas de validación

- [ ] `sentido` está relleno y es uno de los valores admitidos.
- [ ] `requiereEvidencia` es `true` — sin excepciones (BR-25).
- [ ] La sección `## Condiciones para emitirla` tiene condiciones comprobables
      contra datos del expediente.
- [ ] La sección `## Motivación` está rellena.
- [ ] La sección `## Evidencia exigible` cubre todos los eslabones del
      razonamiento descrito en `## Motivación`.
- [ ] Si `sentido` es `sin_cobertura` o `cobertura_parcial`,
      `relaciones.normativa` o la ficha de garantía correspondiente sostiene
      la exclusión o el límite invocado — una denegación debe apoyarse en algo
      citable.
- [ ] La ficha **no contiene ningún importe**: los importes son del
      expediente, nunca del catálogo.

---

## Por qué esta plantilla no contiene lógica de cálculo

El importe de la indemnización lo calcula el motor único del sistema
(`calcIndemnizacion`, verificado contra dos casos oráculo, ver
`docs/CURRENT_IMPLEMENTATION.md`). Esta ficha aporta **el razonamiento y la
redacción**, nunca la cifra. Es una separación deliberada: la cifra debe
proceder siempre de un cálculo reproducible, no de una generación de texto
—principio que el sistema actual ya respeta correctamente y que la biblioteca
no debe erosionar.

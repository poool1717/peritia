# CHECKLIST_TEMPLATE — Plantilla maestra de Lista de Comprobación

> Plantilla para fichas de tipo `checklist`. Destino: `knowledge/checklists/`.
> Contrato común en [`README.md`](./README.md).
>
> Es el nivel más operativo de la biblioteca: convierte un procedimiento
> (`PROCEDURE_TEMPLATE.md`) o una regla de negocio en puntos verificables uno
> a uno, potencialmente evaluables de forma automática.

---

## Front matter

```yaml
id: knowledge://checklists/<slug>
tipo: checklist
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

# ── Específico de checklist ──────────────────────────────────────
momentoAplicacion: <texto>    # p. ej. "antes de exportar el informe"
procedimientoOrigen: null     # knowledge://procedures/<slug>
esBloqueante: false           # true si ningún punto puede quedar sin cumplir
automatizable: parcial        # si | no | parcial

relaciones:
  garantias: []               # garantías para las que aplica esta lista
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

autor: null
revisadoPor: null
fuentes: []
historial: []
```

---

## Cuerpo

```markdown
# <Nombre canónico de la lista>

## Definición
Qué verifica esta lista y por qué existe.

## Momento de aplicación
En qué punto del expediente debe recorrerse.

## Puntos de comprobación

| # | Comprobación | Criterio de cumplimiento | Automatizable | Bloqueante |
|---|---|---|---|---|
| 1 | <qué se comprueba> | <cuándo se da por cumplido> | sí/no | sí/no |
| 2 | … | … | … | … |

Cada punto debe poder responderse con sí o no. Un punto que requiera
matizar la respuesta está mal formulado y debe dividirse en varios.

## Qué hacer si un punto no se cumple
Acción concreta por cada punto incumplido: solicitar documentación, repetir
una comprobación, dejar constancia motivada de la omisión.

## Casos habituales
## Casos excepcionales

## Exclusiones
Comprobaciones que podrían parecer de esta lista pero pertenecen a otra.

## Observaciones
```

---

## Reglas específicas de validación

- [ ] La tabla `## Puntos de comprobación` tiene al menos un punto.
- [ ] Cada punto tiene criterio de cumplimiento explícito — no basta con
      enunciar qué se comprueba.
- [ ] Cada punto se puede responder con sí o no.
- [ ] La sección `## Qué hacer si un punto no se cumple` cubre todos los
      puntos marcados como bloqueantes.
- [ ] Si `esBloqueante` es `true`, al menos un punto está marcado como
      bloqueante en la tabla.
- [ ] Si `procedimientoOrigen` tiene valor, esa ficha existe y referencia de
      vuelta a esta lista.

---

## Nota sobre el estado actual del producto

El sistema de hoy ya tiene una comprobación de completitud antes de exportar
(el panel de "Pendientes", ver `docs/CURRENT_IMPLEMENTATION.md`), pero es
**genérica**: aplica los mismos criterios con independencia de la garantía
del expediente, y **avisa sin bloquear** (BR-31). Esta plantilla permite
representar listas específicas por garantía, y distinguir explícitamente lo
bloqueante de lo meramente recomendable — sin que ello implique cambiar hoy
el comportamiento del producto, que sigue congelado en este sprint.

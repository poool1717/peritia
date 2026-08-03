# SUBCOVERAGE_TEMPLATE — Plantilla maestra de Subgarantía

> Plantilla para fichas de tipo `subcoverage`. Destino:
> `knowledge/subcoverages/`. Contrato común en [`README.md`](./README.md).
>
> Entidad de dominio: `docs/domain/entities/SUBCOVERAGE.md`.
>
> ⚠ **Advertencia de alcance.** El sistema actual no baja a este nivel de
> detalle: no hay evidencia en el código de que el negocio necesite todavía
> subgarantías (ver `docs/OPEN_QUESTIONS.md`, P-08). Esta plantilla existe
> para que la biblioteca pueda representarlas el día que se confirme su
> necesidad, no porque se dé por hecha.

---

## Front matter

```yaml
id: knowledge://subcoverages/<slug>
tipo: subcoverage
version: 1
estado: borrador
idioma: es
confianza: sin_verificar

vigenciaDesde: <AAAA-MM-DD>
vigenciaHasta: null

ambito:
  ramo: []
  aseguradora: null           # SIEMPRE null, igual que en coverage
  provincia: null

# ── Específico de subcoverage ────────────────────────────────────
garantiaPadre: knowledge://coverages/<slug>   # OBLIGATORIO, no puede ser null
condicionActivacion: <texto>  # cuándo aplica esta subgarantía y no la general
tieneFranquiciaPropia: false  # si difiere de la de su garantía padre
tieneLimitePropio: false

relaciones:
  garantias: []               # normalmente solo la padre, ya declarada arriba
  subgarantias: []            # subgarantías hermanas con las que hace frontera
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
# <Nombre canónico de la subgarantía>

## Definición
Qué supuesto concreto ampara, dentro de su garantía padre.

## Condición de activación
Qué tiene que ocurrir para que aplique esta subgarantía en lugar del
tratamiento general de la garantía padre. Debe ser lo bastante preciso como
para que dos peritos distintos lleguen a la misma decisión.

## Casos habituales
## Casos excepcionales

## Exclusiones
Qué queda fuera de esta subgarantía aunque parezca encajar.

## Diferencia respecto a la garantía padre
En qué se aparta del tratamiento general: franquicia distinta, límite propio,
documentación adicional, o exclusión específica.

## Documentación necesaria
Solo lo que esta subgarantía exige **por encima** de lo que ya exige su
garantía padre.

## Fotografías recomendadas
## Observaciones
```

---

## Reglas específicas de validación

- [ ] `garantiaPadre` está relleno y apunta a una ficha `coverage` existente.
- [ ] `condicionActivacion` no está vacío — una subgarantía sin condición de
      activación no se distingue de su padre y no debería existir.
- [ ] La sección `## Diferencia respecto a la garantía padre` está rellena.
- [ ] Si `tieneFranquiciaPropia` o `tieneLimitePropio` es `true`, la
      diferencia se explica en esa sección.

---

## Cuándo NO crear una subgarantía

Si la única diferencia respecto a la garantía padre es de matiz descriptivo,
sin condición de activación distinta ni franquicia, límite o documentación
propios, **no es una subgarantía**: es un caso habitual de la garantía padre y
pertenece a su sección `## Casos habituales`. Crear subgarantías sin esta
disciplina fragmenta la biblioteca sin aportar capacidad de decisión.

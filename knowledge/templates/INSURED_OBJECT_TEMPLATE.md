# INSURED_OBJECT_TEMPLATE — Plantilla maestra de Objeto Asegurado

> Plantilla para fichas de tipo `insured_object`. Destino:
> `knowledge/insured_objects/`. Contrato común en [`README.md`](./README.md).
>
> Entidad de dominio: `docs/domain/entities/INSURED_OBJECT.md`.
>
> ⚠ **Advertencia de alcance.** Esta entidad no existe en el sistema actual:
> el daño se registra hoy directamente como partidas de reparación, sin capa
> intermedia de objeto. La biblioteca la modela porque el dominio la exige;
> su uso real depende de una evolución futura del producto.

---

## Front matter

```yaml
id: knowledge://insured_objects/<slug>
tipo: insured_object
version: 1
estado: borrador
idioma: es
confianza: sin_verificar

vigenciaDesde: <AAAA-MM-DD>
vigenciaHasta: null

ambito:
  ramo: []                    # ramos en los que este objeto es habitual
  aseguradora: null
  provincia: null

# ── Específico de insured_object ─────────────────────────────────
bloque: continente            # continente | contenido — OBLIGATORIO
categoria: <texto>            # ver TAXONOMY.md §6
vidaUtilAniosReferencia: null # para depreciación; null si no procede
esEstructural: false          # si su daño puede comprometer la estabilidad

relaciones:
  garantias: []               # qué garantías lo protegen (relación PROTEGE)
  subgarantias: []
  objetos: []                 # objetos con los que forma conjunto
  materiales: []              # de qué suele estar hecho (relación HECHO_DE)
  danos: []                   # qué puede sufrir (relación PUEDE_SUFRIR)
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
# <Nombre canónico del objeto>

## Definición
Qué elemento es y cómo se identifica en una inspección.

## Clasificación
Por qué pertenece al bloque continente o contenido. Si el criterio puede ser
discutible (un elemento empotrado, una instalación desmontable), explicarlo:
la imputación a un bloque u otro cambia el capital y la franquicia aplicables.

## Materiales habituales
Con qué materiales suele construirse o fabricarse, y cómo eso condiciona su
vida útil y su depreciación.

## Daños que puede sufrir
Tipos de daño plausibles sobre este objeto, con referencia a sus fichas.

## Casos habituales
## Casos excepcionales

## Exclusiones
Qué elementos, pareciéndose a este objeto, **no** son este objeto y tienen
ficha propia.

## Criterios de valoración
Cómo se determina su valor preexistente: por módulo €/m², por precio de
mercado, por factura de adquisición. Sin importes concretos.

## Documentación necesaria
Qué acredita su existencia, características y valor previo al siniestro.

## Fotografías recomendadas
## Observaciones
```

---

## Reglas específicas de validación

- [ ] `bloque` es `continente` o `contenido` — nunca vacío ni ambiguo.
- [ ] `relaciones.danos` no está vacío: un objeto que no puede sufrir ningún
      daño catalogado no aporta valor a la biblioteca.
- [ ] Si `esEstructural` es `true`, la sección `## Criterios de valoración`
      menciona el impacto sobre el valor del continente.
- [ ] Si `vidaUtilAniosReferencia` tiene valor, `fuentes` incluye de dónde
      procede ese dato — no puede ser una estimación sin origen.

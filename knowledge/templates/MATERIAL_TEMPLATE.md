# MATERIAL_TEMPLATE — Plantilla maestra de Material

> Plantilla para fichas de tipo `material`. Destino: `knowledge/materials/`.
> Contrato común en [`README.md`](./README.md).
>
> Catálogo correspondiente: `knowledge/catalogs/CATALOGS.md` §2.

---

## Front matter

```yaml
id: knowledge://materials/<slug>
tipo: material
version: 1
estado: borrador
idioma: es
confianza: sin_verificar

vigenciaDesde: <AAAA-MM-DD>
vigenciaHasta: null

ambito:
  ramo: []
  aseguradora: null
  provincia: null             # relevante si el material es de uso regional

# ── Específico de material ───────────────────────────────────────
categoria: <texto>            # Pavimento|Revestimiento|Estructural|Instalación|Carpintería|Cubierta
calidadesDisponibles: []      # subconjunto de [Básica, Media, Alta]
vidaUtilAniosReferencia: null # base para depreciación por antigüedad
unidadMedidaHabitual: null    # m² | ml | u — coherente con el baremo
esReparableParcialmente: null # true si admite reparación puntual sin sustituir todo

relaciones:
  garantias: []
  subgarantias: []
  objetos: []                 # en qué objetos aparece (inversa de HECHO_DE)
  materiales: []              # materiales sustitutivos o compatibles
  danos: []                   # daños característicos de este material
  causas: []
  metodos: []                 # métodos de reparación aplicables
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
# <Nombre canónico del material>

## Definición
Qué es y dónde se emplea habitualmente.

## Identificación en inspección
Cómo se reconoce en obra: aspecto, formato, disposición, señales que lo
distinguen de materiales parecidos. Es la sección más útil para el trabajo
de campo del perito.

## Calidades
Qué distingue una calidad Básica de una Media o Alta en este material, y qué
efecto tiene sobre la valoración (módulo €/m² aplicable).

## Comportamiento ante el daño
Cómo responde este material a los daños típicos: si absorbe humedad, si se
deforma, si el daño es reversible, si el paso del tiempo agrava el efecto.
Determina si procede reparación o sustitución.

## Reparación frente a sustitución
Criterio para decidir entre reparar puntualmente o sustituir la superficie
completa, incluida la cuestión de la **uniformidad estética**: cuándo un daño
parcial obliga a intervenir sobre una superficie mayor por imposibilidad de
casar el material existente.

## Depreciación
Qué vida útil se considera y cómo afecta al valor real. Sin porcentajes
inventados: si no hay dato con fuente, se declara `sin_verificar`.

## Casos habituales
## Casos excepcionales

## Exclusiones
Materiales parecidos que tienen ficha propia y no deben confundirse con este.

## Métodos de reparación aplicables
Referencia a las fichas de `knowledge/repairs/`.

## Documentación necesaria
Qué acredita su calidad y antigüedad (factura de instalación, memoria de
calidades del edificio, etc.).

## Fotografías recomendadas
## Observaciones
```

---

## Reglas específicas de validación

- [ ] `categoria` pertenece a la taxonomía de `TAXONOMY.md` §7.
- [ ] `unidadMedidaHabitual` es coherente con la unidad de los métodos de
      reparación referenciados en `relaciones.metodos`.
- [ ] Si `vidaUtilAniosReferencia` tiene valor, `fuentes` documenta su origen.
- [ ] La sección `## Reparación frente a sustitución` está rellena: es el
      criterio que más impacto económico tiene en la valoración.

---

## Advertencia sobre el estado actual del catálogo

De los materiales de uso más frecuente, el baremo del sistema actual solo
contempla explícitamente **baldosa cerámica** y **pladur** (esta última con
una única partida, "Cierre de cata en pladur"). Materiales tan habituales
como el parquet o la teja cerámica **no tienen ninguna partida propia**, lo
que hoy obliga a valorarlos con partidas genéricas o a mano. Es una carencia
real del catálogo, no de esta plantilla — ver el resumen de cierre del
Sprint 3.

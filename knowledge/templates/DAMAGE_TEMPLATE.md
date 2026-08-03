# DAMAGE_TEMPLATE — Plantilla maestra de Daño

> Plantilla para fichas de tipo `damage`. Destino: `knowledge/damages/`.
> Contrato común en [`README.md`](./README.md).
>
> Entidad de dominio: `docs/domain/entities/DAMAGE.md`.

---

## Front matter

```yaml
id: knowledge://damages/<slug>
tipo: damage
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

# ── Específico de damage ─────────────────────────────────────────
categoria: <texto>            # ver TAXONOMY.md §8
esProgresivo: false           # true si se agrava con el tiempo sin intervención
esVisibleDeInmediato: true    # false si puede permanecer oculto (relevante para plazos)
afectaEstructura: false       # true si puede comprometer la estabilidad

relaciones:
  garantias: []               # a qué garantías se imputa habitualmente
  subgarantias: []
  objetos: []                 # qué objetos lo sufren (inversa de PUEDE_SUFRIR)
  materiales: []              # materiales especialmente sensibles a este daño
  danos: []                   # daños derivados o concomitantes
  causas: []                  # relación PUEDE_ESTAR_CAUSADO_POR
  metodos: []                 # relación PUEDE_REPARARSE_MEDIANTE
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
# <Nombre canónico del daño>

## Definición
Qué manifestación material describe este daño.

## Identificación en inspección
Cómo se reconoce sobre el terreno, qué señales lo confirman y cuáles pueden
confundirse con otro daño distinto. Incluir, si procede, qué mediciones o
pruebas lo acreditan.

## Causas plausibles
Qué causas pueden producirlo, con referencia a sus fichas. Si una causa es
mucho más frecuente que las demás, indicarlo — orienta la investigación
pericial.

## Distinción de causa: daño súbito frente a daño por deterioro
Cómo distinguir este daño cuando procede de un hecho súbito y accidental
(potencialmente cubierto) de cuando procede de falta de mantenimiento o
desgaste (habitualmente excluido). Es la sección de mayor peso pericial de
toda la ficha.

## Alcance típico
Hasta dónde suele extenderse: superficie afectada, elementos colaterales,
daños derivados que suelen acompañarlo.

## Métodos de reparación aplicables
Referencia a las fichas de `knowledge/repairs/`, con el orden lógico de
ejecución si lo tiene.

## Casos habituales
## Casos excepcionales

## Exclusiones
Daños parecidos con ficha propia; y supuestos de este mismo daño que
habitualmente quedan fuera de cobertura.

## Documentación necesaria
## Fotografías recomendadas
## Observaciones
```

---

## Reglas específicas de validación

- [ ] `relaciones.causas` no está vacío: un daño sin ninguna causa catalogada
      no permite razonar sobre cobertura.
- [ ] `relaciones.metodos` no está vacío: un daño sin métodos de reparación
      no puede valorarse.
- [ ] La sección `## Distinción de causa: daño súbito frente a daño por
      deterioro` está rellena — determina la procedencia de la cobertura y es
      el criterio más frecuentemente discutido en un expediente.
- [ ] Si `esProgresivo` es `true`, la sección `## Alcance típico` explica cómo
      evoluciona sin intervención.
- [ ] Si `esVisibleDeInmediato` es `false`, la sección `## Identificación en
      inspección` explica cómo se detecta un daño oculto.

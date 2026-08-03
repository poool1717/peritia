# COVERAGE_TEMPLATE — Plantilla maestra de Garantía

> Plantilla para fichas de tipo `coverage`. Destino: `knowledge/coverages/`.
> El contrato común (front matter, secciones obligatorias, fuentes,
> historial, validación) está en [`README.md`](./README.md) — aquí solo lo
> específico de esta categoría.
>
> Entidad de dominio correspondiente: `docs/domain/entities/COVERAGE.md`.

---

## Front matter

```yaml
id: knowledge://coverages/<slug>
tipo: coverage
version: 1
estado: borrador
idioma: es
confianza: sin_verificar

vigenciaDesde: <AAAA-MM-DD>
vigenciaHasta: null

ambito:
  ramo: []                    # ramos en los que esta garantía se ofrece
  aseguradora: null           # SIEMPRE null: una garantía canónica no es de nadie
  provincia: null

# ── Específico de coverage ───────────────────────────────────────
codigo: <DAGUA|INCEN|...>     # código corto canónico
bloques:                      # una garantía aplica de forma independiente a
  continente: true            # continente y contenido (BR-05)
  contenido: true
requiereVerificacionExterna: false   # si dispara consulta a fuente externa

relaciones:
  garantias: []               # otras garantías con las que solapa o compite
  subgarantias: []
  objetos: []                 # qué protege (ONTOLOGY.md, relación PROTEGE)
  materiales: []
  danos: []                   # daños que típicamente se imputan aquí
  causas: []                  # causas que la activan (relación ACTIVA)
  metodos: []
  normativa: []
  documentacion: []           # qué exige (relación REQUIERE)
  fotografias: []
  procedimientos: []

autor: null
revisadoPor: null
fuentes: []
historial: []
```

**Campo `ambito.aseguradora`: siempre `null`.** Es la regla que hace cumplible
la independencia de aseguradora (BR-38). Cómo llama cada compañía a esta
garantía, y qué reglas propias aplica al leer sus pólizas, vive en
`knowledge/mappings/COMPANIES.md`, nunca en esta ficha.

---

## Cuerpo

```markdown
# <Nombre comercial canónico>

## Definición
Qué riesgo cubre esta garantía, en una o dos frases.

## Alcance por bloque
### Continente
Qué elementos del continente ampara.
### Contenido
Qué elementos del contenido ampara. Si la garantía no aplica al contenido,
indicarlo expresamente en lugar de omitir el apartado.

## Casos habituales
Supuestos frecuentes que esta garantía resuelve en la práctica pericial.

## Casos excepcionales
Supuestos infrecuentes, o de frontera con otra garantía, que exigen criterio
específico del perito.

## Exclusiones
Exclusiones típicas del sector para esta garantía.
⚠ Las exclusiones aquí listadas son las **habituales del mercado**, con valor
orientativo. Las exclusiones aplicables a un expediente concreto son siempre
las de su póliza, extraídas del documento real.

## Límites típicos
Tipos de límite que suelen acompañar a esta garantía (capital, temporal,
geográfico). Sin importes: los importes son de cada póliza.

## Documentación necesaria
Qué debe reunirse para acreditar un siniestro de esta garantía.

## Fotografías recomendadas
Referencia a las fichas de tipo `photo_guide` aplicables.

## Frontera con otras garantías
Cómo distinguir esta garantía de las que se le parecen, y qué criterio decide
la imputación cuando ambas podrían aplicar.

## Observaciones
```

---

## Reglas específicas de validación

Además de la validación estructural común (`README.md` §9):

- [ ] `codigo` es único entre todas las fichas de tipo `coverage`.
- [ ] `ambito.aseguradora` es `null` — sin excepciones.
- [ ] Al menos uno de `bloques.continente` / `bloques.contenido` es `true`.
- [ ] La sección `## Frontera con otras garantías` está rellena si
      `relaciones.garantias` no está vacío.
- [ ] Si `requiereVerificacionExterna` es `true`, `relaciones.procedimientos`
      referencia el procedimiento de verificación correspondiente.

---

## Ejemplo de referencia

`knowledge/coverages/danos-por-agua.md` — creada en este sprint, en estado
`borrador`.

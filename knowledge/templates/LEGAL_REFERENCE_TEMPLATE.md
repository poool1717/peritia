# LEGAL_REFERENCE_TEMPLATE — Plantilla maestra de Referencia Legal o Normativa

> Plantilla para fichas de tipo `legal` (marco jurídico) y `regulation`
> (norma técnica). Destino: `knowledge/legal/` y `knowledge/regulations/`
> respectivamente. Contrato común en [`README.md`](./README.md).
>
> ⚠ **Advertencia de validación reforzada.** Ninguna ficha de esta categoría
> puede alcanzar `estado: aprobado` sin revisión de una persona con
> competencia legal o técnica en la materia. Una IA **no** puede validar
> contenido normativo, ni siquiera cuando lo transcribe correctamente: la
> interpretación y la vigencia exigen criterio profesional. Es la regla ya
> fijada en `knowledge/legal/README.md` (Sprint 2).

---

## Front matter

```yaml
id: knowledge://legal/<slug>          # o knowledge://regulations/<slug>
tipo: legal                           # legal | regulation
version: 1
estado: borrador
idioma: es                            # puede ser distinto en normativa europea
confianza: sin_verificar

vigenciaDesde: <AAAA-MM-DD>           # entrada en vigor de la norma citada
vigenciaHasta: null                   # derogación, si la hay

ambito:
  ramo: []
  aseguradora: null
  provincia: null                     # relevante en normativa autonómica

# ── Específico de legal / regulation ─────────────────────────────
referenciaOficial: <texto>            # cita exacta y completa
organismoEmisor: <texto>
tipoNorma: <ley|reglamento|norma_tecnica|directiva|jurisprudencia>
articulo: null                        # apartado concreto, si la ficha es de un artículo
enlaceOficial: null                   # URL del boletín o repositorio oficial
esVinculante: true                    # false para recomendaciones o guías

relaciones:
  garantias: []                       # garantías afectadas (relación SE_RIGE_POR)
  subgarantias: []
  objetos: []
  materiales: []
  danos: []
  causas: []
  metodos: []
  normativa: []                       # normas que la desarrollan, modifican o derogan
  documentacion: []
  fotografias: []
  procedimientos: []

autor: null
revisadoPor: null                     # OBLIGATORIO: persona con competencia legal
fuentes: []
historial: []
```

---

## Cuerpo

```markdown
# <Referencia oficial abreviada>

## Definición
Qué regula esta norma o artículo, en una o dos frases.

## Texto de referencia
Transcripción literal del precepto relevante, entrecomillada y sin
parafrasear. Si es extenso, transcribir solo el fragmento aplicable e
indicar el corte con puntos suspensivos.

## Interpretación aplicada a la peritación
Qué implica en la práctica del oficio: qué obliga, qué permite, qué límite
impone. Esta sección es interpretación, no transcripción — debe quedar
claramente separada de la anterior y validada por quien tenga competencia
para interpretarla.

## Alcance
A qué garantías, ramos o supuestos aplica.

## Casos habituales
Situaciones periciales frecuentes en las que esta norma es determinante.

## Casos excepcionales
Supuestos de aplicación dudosa o discutida.

## Exclusiones
Qué queda fuera del ámbito de esta norma, especialmente cuando existe otra
norma que regula el supuesto vecino.

## Vigencia y modificaciones
Estado de vigencia, modificaciones sufridas y norma que la sustituye si está
derogada.

## Observaciones
```

---

## Reglas específicas de validación

- [ ] `referenciaOficial` permite localizar la norma sin ambigüedad.
- [ ] `enlaceOficial` apunta a una fuente oficial (boletín, organismo
      emisor), nunca a un blog, un resumen ni una recopilación privada.
- [ ] La sección `## Texto de referencia` es transcripción literal, no
      paráfrasis.
- [ ] `## Texto de referencia` y `## Interpretación aplicada a la peritación`
      están separadas y no se mezclan.
- [ ] **`revisadoPor` identifica a una persona con competencia legal o
      técnica** si `estado` es `aprobado`. Sin excepciones.
- [ ] `fuentes` incluye una entrada de tipo `normativa`.
- [ ] Si `vigenciaHasta` tiene valor, `relaciones.normativa` referencia la
      norma que la sustituye.

---

## Por qué esta categoría es distinta de las demás

En el resto de la biblioteca, un error se traduce en una valoración
imprecisa. Aquí, un error se traduce en un dictamen jurídicamente incorrecto
que puede sostener —o hundir— una reclamación. Por eso esta plantilla es la
única con `revisadoPor` obligatorio por perfil profesional, y la única que
exige separar de forma explícita la transcripción de la interpretación.

# CAUSE_TEMPLATE — Plantilla maestra de Causa

> Plantilla para fichas de tipo `cause`. Destino: `knowledge/causes/`.
> Contrato común en [`README.md`](./README.md).
>
> Entidad de dominio: `docs/domain/entities/CAUSE.md`.

---

## Front matter

```yaml
id: knowledge://causes/<slug>
tipo: cause
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

# ── Específico de cause ──────────────────────────────────────────
categoria: <texto>            # Atmosférica|Hídrica|Térmica|Eléctrica|Antrópica (TAXONOMY.md §9)
esSubita: true                # false si es un proceso continuado o progresivo
requiereVerificacionExterna: false
fuenteVerificacion: null      # p. ej. estación meteorológica, Catastro
requiereUmbral: false         # true si la cobertura depende de superar un valor medido

relaciones:
  garantias: []               # qué garantías activa (relación ACTIVA)
  subgarantias: []
  objetos: []
  materiales: []
  danos: []                   # qué daños produce (inversa de PUEDE_ESTAR_CAUSADO_POR)
  causas: []                  # causas concomitantes o encadenadas
  metodos: []
  normativa: []
  documentacion: []
  fotografias: []
  procedimientos: []          # procedimiento de verificación si lo requiere

autor: null
revisadoPor: null
fuentes: []
historial: []
```

---

## Cuerpo

```markdown
# <Nombre canónico de la causa>

## Definición
Qué hecho genera el siniestro.

## Garantías que activa
A qué garantías conduce esta causa, y bajo qué condición cuando puede
conducir a más de una. Una misma causa puede activar varias garantías a la
vez (BR-09).

## Acreditación
Cómo se demuestra que esta causa es la que ha originado el daño: qué
evidencia lo acredita, qué comprobaciones lo confirman y qué lo descartaría.

## Verificación externa
Si procede consultar una fuente oficial (datos meteorológicos, catastrales,
atestado), qué fuente y qué dato concreto se busca. Si no procede, indicarlo
expresamente.

## Umbrales
Si la cobertura depende de que un valor medido supere un umbral fijado por la
póliza, explicar qué magnitud se mide y con qué unidad.
⚠ Sin valores concretos: el umbral aplicable es siempre el de la póliza del
expediente, no un valor de catálogo.

## Daños que produce
Referencia a las fichas de `knowledge/damages/`.

## Causas concomitantes
Otras causas que suelen presentarse junto a esta, y cómo repartir la
imputación cuando concurren.

## Casos habituales
## Casos excepcionales

## Exclusiones
Supuestos que se parecen a esta causa pero constituyen una causa distinta, y
supuestos de esta causa habitualmente excluidos (típicamente, los derivados
de falta de mantenimiento).

## Documentación necesaria
## Fotografías recomendadas
## Observaciones
```

---

## Reglas específicas de validación

- [ ] `categoria` pertenece a la taxonomía de `TAXONOMY.md` §9.
- [ ] `relaciones.garantias` no está vacío: una causa que no activa ninguna
      garantía no es relevante para la peritación.
- [ ] `relaciones.danos` no está vacío.
- [ ] Si `requiereVerificacionExterna` es `true`, `fuenteVerificacion` tiene
      valor y `relaciones.procedimientos` referencia el procedimiento.
- [ ] Si `requiereUmbral` es `true`, la sección `## Umbrales` explica qué
      magnitud se compara — sin fijar el valor.
- [ ] La sección `## Acreditación` está rellena: es la que sostiene la
      trazabilidad del dictamen sobre la causa (BR-25).

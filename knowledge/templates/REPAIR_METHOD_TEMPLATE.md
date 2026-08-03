# REPAIR_METHOD_TEMPLATE — Plantilla maestra de Método de Reparación

> Plantilla para fichas de tipo `repair`. Destino: `knowledge/repairs/`.
> Contrato común en [`README.md`](./README.md).
>
> Entidad de dominio: `docs/domain/entities/REPAIR.md`.
> Es la categoría con mayor equivalente ya verificado en el sistema actual:
> las 47 partidas de `BAREMO` (`docs/CURRENT_IMPLEMENTATION.md` §5).

---

## Front matter

```yaml
id: knowledge://repairs/<slug>
tipo: repair
version: 1
estado: borrador
idioma: es
confianza: sin_verificar

vigenciaDesde: <AAAA-MM-DD>   # CRÍTICO: los precios tienen vigencia anual
vigenciaHasta: null

ambito:
  ramo: []
  aseguradora: null
  provincia: null             # si el precio varía por zona

# ── Específico de repair ─────────────────────────────────────────
oficio: <texto>               # ALBAÑILERÍA|PINTURA|LAMPISTERÍA|ELECTRICIDAD|
                              # CARPINTERÍA|CERRAJERÍA|LIMPIEZA|AUXILIARES
unidad: <m²|ml|u>
precioReferencia: null        # € sin IVA — NUNCA sin fuente documentada
rendimiento: null             # unidades/hora, null si no aplica
esIndirecto: false            # true solo para la partida de costes indirectos
condicionActivacion: <texto>  # cuándo se incluye esta partida
ordenEjecucion: null          # entero: posición en la secuencia lógica de obra

relaciones:
  garantias: []
  subgarantias: []
  objetos: []                 # sobre qué objetos se ejecuta
  materiales: []              # materiales que repone o sobre los que actúa
  danos: []                   # qué daños resuelve (inversa de PUEDE_REPARARSE_MEDIANTE)
  causas: []
  metodos: []                 # partidas que lo preceden o lo acompañan siempre
  normativa: []
  documentacion: []
  fotografias: []
  procedimientos: []

autor: null
revisadoPor: null
fuentes: []
historial: []
```

**`precioReferencia` es el campo más delicado de toda la biblioteca.** Un
precio sin `fuentes` documentada y sin `vigenciaDesde` correcta produce
valoraciones erróneas con efectos económicos reales. La validación lo trata
en consecuencia (ver más abajo).

---

## Cuerpo

```markdown
# <Nombre canónico de la partida>

## Definición
Qué trabajo comprende exactamente esta partida.

## Alcance de la partida
Qué está incluido en el precio y qué no. Es la sección que evita la doble
imputación: si el precio ya incluye el material, no procede añadir una
partida de suministro aparte.

## Condición de activación
Cuándo se incluye esta partida en una valoración y cuándo no. Debe ser lo
bastante preciso como para que dos peritos valoren igual el mismo daño.

## Daños que resuelve
Referencia a las fichas de `knowledge/damages/`.

## Secuencia de obra
Qué partidas la preceden y cuáles la siguen necesariamente. Una partida de
acabado sin su partida de preparación previa indica una valoración
incompleta.

## Medición
Cómo se mide la cantidad: criterio de medición de superficies, de longitudes
o de unidades. Determina el número que multiplica al precio.

## Casos habituales
## Casos excepcionales

## Exclusiones
Trabajos que se le parecen y tienen partida propia.

## Observaciones
```

---

## Reglas específicas de validación

- [ ] `oficio` pertenece al catálogo de oficios de `TAXONOMY.md` §10.
- [ ] `unidad` es coherente con la de los materiales referenciados.
- [ ] **Si `precioReferencia` tiene valor, `fuentes` incluye su origen y
      `vigenciaDesde` refleja el año del baremo del que procede.** Un precio
      sin ambos no puede pasar de `borrador`.
- [ ] `relaciones.danos` no está vacío.
- [ ] Si `esIndirecto` es `true`, `precioReferencia` es `null`: los costes
      indirectos se calculan como porcentaje del subtotal, no tienen precio
      unitario propio (BR-19).
- [ ] La sección `## Alcance de la partida` está rellena — es la que previene
      la doble imputación.
- [ ] La sección `## Medición` está rellena.

---

## Relación con el cálculo

Esta ficha aporta el **precio de referencia y el criterio de medición**. La
fórmula que convierte eso en un importe (`valor real = valor de reposición ×
(1 − % depreciación) + IVA`) vive en el motor único del sistema
(`docs/domain/entities/REPAIR.md`) y **no se replica aquí**: una ficha de
conocimiento no contiene lógica de cálculo (ver `README.md` §10).

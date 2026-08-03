# PROCEDURE_TEMPLATE — Plantilla maestra de Procedimiento

> Plantilla para fichas de tipo `procedure`. Destino: `knowledge/procedures/`.
> Contrato común en [`README.md`](./README.md).
>
> Un procedimiento explica **cómo se hace** algo en prosa ordenada. Su
> traducción a puntos verificables uno a uno es una ficha de tipo `checklist`
> (ver `CHECKLIST_TEMPLATE.md`) — son complementarias, no alternativas.

---

## Front matter

```yaml
id: knowledge://procedures/<slug>
tipo: procedure
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

# ── Específico de procedure ──────────────────────────────────────
fase: <texto>                 # Encargo|Verificación|Análisis|Valoración|Cierre
modalidad: []                 # [presencial], [documental] o ambas
duracionEstimadaMin: null     # orientativo, para planificación
requiereDesplazamiento: false
checklistAsociado: null       # knowledge://checklists/<slug>

relaciones:
  garantias: []               # garantías para las que este procedimiento aplica
  subgarantias: []
  objetos: []
  materiales: []
  danos: []
  causas: []                  # causas que lo hacen necesario
  metodos: []
  normativa: []               # normas que lo obligan o condicionan
  documentacion: []           # documentos que produce o consume
  fotografias: []             # guías fotográficas aplicables
  procedimientos: []          # procedimientos previos o posteriores

autor: null
revisadoPor: null
fuentes: []
historial: []
```

---

## Cuerpo

```markdown
# <Nombre canónico del procedimiento>

## Definición
Qué consigue este procedimiento y en qué momento del expediente se aplica.

## Cuándo aplica
Condiciones que lo hacen necesario, y condiciones bajo las que puede
omitirse. Si depende de la modalidad (presencial o documental), explicarlo.

## Requisitos previos
Qué debe existir antes de empezar: documentación, accesos, datos del
encargo, procedimientos anteriores completados.

## Pasos
1. Primer paso, con el criterio que lo da por completado.
2. Segundo paso…

Cada paso debe indicar **qué se hace** y **cómo se sabe que está bien hecho**.
Un paso sin criterio de finalización no es un paso, es una intención.

## Resultado esperado
Qué queda producido al terminar: qué datos, qué evidencia, qué sección del
informe queda en condiciones de completarse.

## Errores frecuentes
Qué sale mal habitualmente y cómo evitarlo. Sección de alto valor práctico:
recoge la experiencia acumulada que de otro modo se pierde.

## Casos habituales
## Casos excepcionales

## Exclusiones
Qué queda fuera de este procedimiento y corresponde a otro.

## Documentación necesaria
## Fotografías recomendadas
## Observaciones
```

---

## Reglas específicas de validación

- [ ] `fase` pertenece al ciclo de vida del expediente
      (`docs/domain/STATE_MACHINES.md` §1).
- [ ] `modalidad` no está vacío.
- [ ] La sección `## Pasos` tiene al menos dos pasos, cada uno con su criterio
      de finalización.
- [ ] La sección `## Resultado esperado` está rellena: un procedimiento que no
      produce nada verificable no puede auditarse.
- [ ] Si `checklistAsociado` tiene valor, la ficha de checklist existe y
      referencia de vuelta a este procedimiento.
- [ ] Si `requiereDesplazamiento` es `true`, `modalidad` incluye `presencial`.

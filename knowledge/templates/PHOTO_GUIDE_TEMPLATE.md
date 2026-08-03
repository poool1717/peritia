# PHOTO_GUIDE_TEMPLATE — Plantilla maestra de Guía Fotográfica

> Plantilla para fichas de tipo `photo_guide`. Destino: `knowledge/documents/`
> (subtipo de documentación, ver `TAXONOMY.md` §15). Contrato común en
> [`README.md`](./README.md).
>
> Una guía fotográfica define **qué fotografías hay que tomar** en un supuesto
> concreto y **qué debe verse en cada una** para que sirvan como evidencia
> (BR-25). No describe fotografías concretas de un expediente: describe el
> reportaje exigible.

---

## Front matter

```yaml
id: knowledge://documents/photo-guides/<slug>
tipo: photo_guide
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

# ── Específico de photo_guide ────────────────────────────────────
numeroMinimoFotografias: null
requiereReferenciaEscala: false   # si alguna toma exige objeto de referencia
requiereVistaGeneral: true        # si exige encuadre de contexto además del detalle
momentoCaptura: <texto>           # p. ej. "durante la inspección, antes de reparar"

relaciones:
  garantias: []                   # garantías que exigen este reportaje
  subgarantias: []
  objetos: []
  materiales: []
  danos: []                       # daños que documenta
  causas: []
  metodos: []
  normativa: []
  documentacion: []
  fotografias: []                 # otras guías complementarias
  procedimientos: []

autor: null
revisadoPor: null
fuentes: []
historial: []
```

---

## Cuerpo

```markdown
# <Nombre canónico de la guía>

## Definición
Qué supuesto documenta este reportaje fotográfico.

## Tomas exigibles

| # | Toma | Qué debe verse | Obligatoria |
|---|---|---|---|
| 1 | Vista general de la estancia | Contexto y ubicación del daño respecto al conjunto | Sí |
| 2 | Detalle del daño | Extensión y naturaleza del daño, con referencia de escala | Sí |
| 3 | … | … | … |

## Qué acredita cada toma
Qué afirmación del dictamen respalda cada fotografía. Es la sección que
conecta el reportaje con la trazabilidad: una fotografía que no respalda
ninguna afirmación es material sobrante.

## Errores frecuentes
Encuadres que invalidan la toma, ausencia de referencia de escala,
iluminación que oculta el daño, fotografías tomadas después de una
reparación provisional sin dejar constancia de ello.

## Casos habituales
## Casos excepcionales

## Exclusiones
Qué **no** debe fotografiarse: elementos ajenos al siniestro, y muy
especialmente datos personales visibles que no aporten valor pericial
(documentación personal, pantallas, objetos identificativos de terceros).

## Observaciones
```

---

## Reglas específicas de validación

- [ ] La tabla `## Tomas exigibles` tiene al menos una toma obligatoria.
- [ ] Cada toma indica qué debe verse, no solo qué fotografiar.
- [ ] La sección `## Qué acredita cada toma` cubre todas las tomas
      obligatorias.
- [ ] Si `requiereReferenciaEscala` es `true`, al menos una toma lo indica
      expresamente.
- [ ] La sección `## Exclusiones` menciona la limitación sobre datos
      personales visibles.

---

## Advertencia de privacidad

Las fotografías de un expediente pericial muestran el interior del domicilio
del asegurado: son el material más sensible que maneja el sistema. Toda guía
fotográfica debe incluir, en su sección de exclusiones, qué **no** debe
capturarse.

Esta advertencia es especialmente pertinente dado el estado actual del
sistema, donde las fotografías subidas quedan accesibles públicamente por URL
sin autenticación (`docs/TECHNICAL_DEBT.md`, DT-11; pendiente de decisión en
`docs/OPEN_QUESTIONS.md`, P-07). Minimizar lo que se captura reduce la
exposición mientras esa cuestión no se resuelva.

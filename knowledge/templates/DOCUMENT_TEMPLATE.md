# DOCUMENT_TEMPLATE — Plantilla maestra de Tipo de Documento

> Plantilla para fichas de tipo `document`. Destino: `knowledge/documents/`.
> Contrato común en [`README.md`](./README.md).
>
> Define un **tipo** de documento y qué se exige de él, no un documento
> concreto de un expediente. La instancia concreta de un documento dentro de
> un expediente es `docs/domain/entities/DOCUMENT.md`, otra cosa distinta.

---

## Front matter

```yaml
id: knowledge://documents/<slug>
tipo: document
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

# ── Específico de document ───────────────────────────────────────
categoria: <texto>            # Encargo|Póliza|Factura|Presupuesto|Informe oficial|Acreditativo
obligatoriedad: recomendado   # obligatorio | recomendado | opcional
formatoEsperado: []           # [pdf], [imagen], [pdf, imagen]
loAporta: <texto>             # asegurado | reparador | aseguradora | perito | fuente oficial
contieneDatosPersonales: true # relevante para tratamiento y retención
esExtraibleAutomaticamente: false  # si su contenido puede estructurarse por extracción

relaciones:
  garantias: []               # garantías que lo exigen (relación REQUIERE)
  subgarantias: []
  objetos: []
  materiales: []
  danos: []
  causas: []                  # causas cuya acreditación depende de este documento
  metodos: []
  normativa: []               # norma que obliga a aportarlo, si la hay
  documentacion: []           # documentos que lo sustituyen o complementan
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
# <Nombre canónico del tipo de documento>

## Definición
Qué documento es y qué función cumple en el expediente.

## Qué acredita
Qué hecho queda probado con este documento, y qué **no** queda probado
aunque pueda parecerlo.

## Datos que debe contener
Campos mínimos para que el documento sea válido a efectos periciales. Un
documento al que le falte un campo mínimo no acredita lo que pretende.

## Quién lo aporta y cuándo
Origen habitual y momento del expediente en que debe reunirse.

## Validación
Cómo se comprueba que el documento es válido y coherente: fechas, importes,
identificación del emisor, correspondencia con el siniestro peritado.

## Documentos alternativos
Qué otro documento puede sustituirlo cuando no es posible obtenerlo, y con
qué pérdida de fuerza acreditativa.

## Casos habituales
## Casos excepcionales

## Exclusiones
Documentos parecidos que no cumplen la misma función.

## Tratamiento de datos personales
Qué información sensible contiene habitualmente y qué precauciones exige su
conservación y su incorporación al informe.

## Observaciones
```

---

## Reglas específicas de validación

- [ ] `categoria` pertenece al catálogo de `CATALOGS.md` §6.
- [ ] `obligatoriedad` es coherente con las garantías de
      `relaciones.garantias`: un documento declarado `obligatorio` debe
      aparecer como exigido en las fichas de esas garantías.
- [ ] La sección `## Datos que debe contener` está rellena.
- [ ] La sección `## Validación` está rellena: sin criterio de validación, el
      documento se acepta sin comprobar y pierde valor acreditativo.
- [ ] Si `contieneDatosPersonales` es `true`, la sección `## Tratamiento de
      datos personales` está rellena.

---

## Nota sobre el estado actual

Dos de los documentos más importantes del expediente —el PDF de encargo y el
de la póliza— **no se conservan** hoy tras su extracción
(`docs/TECHNICAL_DEBT.md`, DT-12; `docs/OPEN_QUESTIONS.md`, P-17). Las fichas
de esos dos tipos deberán reflejarlo en su sección `## Observaciones` mientras
esa decisión siga pendiente, porque afecta directamente a qué puede
acreditarse a posteriori.

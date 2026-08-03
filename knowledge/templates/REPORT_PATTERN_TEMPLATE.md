# REPORT_PATTERN_TEMPLATE — Plantilla maestra de Patrón de Informe

> Plantilla para fichas de tipo `report_pattern`. Destino: `knowledge/reports/`.
> Contrato común en [`README.md`](./README.md).
>
> Un patrón de informe define **cómo se redacta** un apartado del informe
> pericial: qué debe contener, en qué orden, con qué registro y con qué
> variantes según el caso. Es el material que un servicio de IA de redacción
> debería consumir, en lugar de llevar esas instrucciones escritas dentro de
> su propio prompt.

---

## Front matter

```yaml
id: knowledge://reports/<slug>
tipo: report_pattern
version: 1
estado: borrador
idioma: es
confianza: sin_verificar

vigenciaDesde: <AAAA-MM-DD>
vigenciaHasta: null

ambito:
  ramo: []
  aseguradora: null           # null salvo que una compañía exija formato propio
  provincia: null

# ── Específico de report_pattern ─────────────────────────────────
seccionInforme: <texto>       # Encargo|S1 Verificación|S2 Causas|S3 Valoración|S4 Cobertura|Anexos
tipoEncargo: []               # [], [PERITACION], [INSTANT_PAYMENT]
modalidad: []                 # [presencial], [documental] o ambas
registro: tercera_persona     # registro obligatorio del oficio pericial
longitudOrientativa: null     # en párrafos; orientativo, nunca límite rígido
admiteRedaccionAsistida: true # si un servicio de IA puede proponer el texto

relaciones:
  garantias: []               # garantías para las que este patrón varía
  subgarantias: []
  objetos: []
  materiales: []
  danos: []
  causas: []
  metodos: []
  normativa: []
  documentacion: []           # documentos que alimentan este apartado
  fotografias: []
  procedimientos: []          # procedimiento que produce los datos del apartado

autor: null
revisadoPor: null
fuentes: []
historial: []
```

---

## Cuerpo

```markdown
# <Nombre canónico del patrón>

## Definición
Qué apartado del informe cubre este patrón y qué debe conseguir.

## Contenido obligatorio
Qué información no puede faltar en este apartado. Cada elemento debe poder
rastrearse a un dato concreto del expediente — un apartado que afirme algo
que no está en ningún dato del expediente está inventando (BR-26).

## Estructura
Orden en que se expone la información, con la función de cada parte.

## Registro y estilo
Tercera persona, tiempo verbal, tratamiento de las partes, uso de siglas.
El informe pericial tiene un registro propio del oficio que debe respetarse
con independencia de quién o qué redacte el texto.

## Variantes
Cómo cambia el patrón según garantía, tipo de encargo o modalidad. Una
variante que cambie sustancialmente el contenido debería ser un patrón
propio, no una variante.

## Datos de origen
Qué campos del expediente alimentan este apartado, y qué ocurre cuando
alguno falta: si se omite la frase, si se deja constancia de la ausencia, o
si el apartado no puede redactarse.

## Fórmulas de redacción frecuentes
Expresiones habituales del oficio, con hueco para las variables.
⚠ Son fórmulas de referencia, no texto obligatorio: el perito puede
apartarse de ellas si el caso lo exige.

## Errores frecuentes
Afirmaciones sin respaldo, valoraciones jurídicas fuera del alcance pericial,
conclusiones anticipadas en apartados descriptivos.

## Casos habituales
## Casos excepcionales

## Exclusiones
Qué **no** va en este apartado y corresponde a otro.

## Observaciones
```

---

## Reglas específicas de validación

- [ ] `seccionInforme` corresponde a una sección real
      (`docs/domain/entities/REPORT_SECTION.md`).
- [ ] La sección `## Contenido obligatorio` está rellena y cada elemento es
      rastreable a un dato del expediente.
- [ ] La sección `## Datos de origen` explica qué ocurre cuando falta un dato.
- [ ] Si `tipoEncargo` incluye `INSTANT_PAYMENT`, la sección `## Variantes`
      explica en qué se aparta del patrón ordinario.
- [ ] `registro` es `tercera_persona` salvo justificación expresa en
      `## Observaciones`.

---

## Relación con las tres plantillas de exportación existentes

El sistema actual compone el informe **tres veces de forma independiente**
(vista previa, Word y PDF), con una discrepancia real ya detectada entre
ellas (`docs/TECHNICAL_DEBT.md`, DT-07 y DT-08). Estas fichas describen el
contenido y la redacción esperados **con independencia del formato de salida**
— son, por diseño, el nivel que las tres implementaciones deberían compartir
si algún día se unifican (`docs/REFACTOR_BACKLOG.md`, R-13). Este sprint no
las unifica ni toca ninguna de las tres.

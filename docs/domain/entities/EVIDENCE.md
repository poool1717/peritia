# EVIDENCE

> Bounded context: Evidencia Documental · **Implementada como colección plana
> de anexos, sin relación explícita con lo que respalda**

## Objetivo

Representar cualquier elemento verificable que respalda una afirmación del
dictamen pericial, de forma que ninguna conclusión del informe quede sin
sustento comprobable.

## Descripción

La evidencia es el concepto paraguas bajo el que se agrupan `Document` y
`Photo`: cualquier pieza —un documento, una fotografía, una captura de una
fuente oficial— que un tercero pueda examinar para verificar lo que el
informe afirma. El principio "toda conclusión debe estar respaldada por
evidencia" (BR-25) es uno de los pilares explícitos del proyecto, y esta
entidad es su encarnación en el modelo de dominio.

## Responsabilidades

- Servir de prueba verificable de una afirmación del informe.
- Conservar su procedencia: quién la aportó o cómo se obtuvo, y cuándo.
- Vincularse, idealmente, al daño, la causa o la conclusión concreta que
  respalda.

## Atributos

| Atributo | Tipo | Implementado | Descripción |
|---|---|---|---|
| `id` | identificador | Sí | Clave del anexo |
| `claimId` | referencia | Sí (implícito, vive en el mismo expediente) | Siniestro al que pertenece |
| `tipo` | enumerado | Sí (por pestaña: fotos, catastro, meteosim, facturas, presupuestos) | Categoría de la evidencia |
| `origen` | enumerado | Parcial | `aportado_por_perito` \| `aportado_por_tercero` \| `capturado_automaticamente` |
| `url` | texto | Sí | Ubicación del archivo en almacenamiento |
| `caption` | texto | Sí | Descripción o pie de foto |
| `damageIds` / `conclusionIds` | lista | No | Qué afirmaciones respalda (conceptual) |
| `fechaCaptura` | fecha | No (solo `Date.now()` de subida, no de captura real) | Cuándo se obtuvo realmente |

## Relaciones

- N Evidence — 1 `CLAIM`
- N Evidence — N `DAMAGE` (conceptual)
- N Evidence — 0..1 `CONCLUSION` (conceptual)
- Evidence — `DOCUMENT` / `PHOTO` (especialización excluyente)

## Ciclo de vida

Ver `LIFECYCLES.md`, sección 6. Nace en el momento de la captura o
aportación, se incorpora al expediente por subida a almacenamiento, debería
vincularse a lo que respalda, y no caduca: permanece indefinidamente sin
política de retención definida (P-09) y, hoy, con acceso público sin
autenticación (Sprint 0, DT-11).

## Estados

`Capturada` → `Incorporada al expediente` → `Vinculada` (conceptual, a lo que
respalda) → `Archivada` (conceptual).

## Eventos

`EvidenciaAportada` · `EvidenciaCapturadaAutomaticamente` · `EvidenciaBorrada`.

## Reglas de negocio

- Toda conclusión debe estar respaldada por evidencia (BR-25).
- Una fotografía puede justificar varios daños, y un daño puede estar
  respaldado por varias fotografías (BR-29).
- Todo documento conserva siempre su versión original (BR-27).

## Validaciones

- Tamaño máximo de 10 MB por archivo (`ANEXOS_MAX_SIZE`, implementado).

## Permisos

Hoy, de lectura pública sin autenticación una vez subida (DT-11); de subida y
borrado, restringido al propietario del expediente.

## Casos de uso

- El perito fotografía la humedad en la pared durante la visita: la evidencia
  respalda directamente el daño descrito en la Sección 3.
- Se captura automáticamente el mapa de la estación meteorológica más
  cercana: la evidencia respalda la conclusión sobre si el siniestro supera
  los umbrales de cobertura de la póliza.

## Ejemplos

```
Evidence: "IMG_0234.jpg"
  tipo: foto
  origen: aportado_por_perito
  respalda (conceptual): Damage "Humedad en pared medianera"
```

## Posibles evoluciones

- Vínculo explícito evidencia-daño y evidencia-conclusión, hoy inexistente.
- Registro de fecha y dispositivo de captura real, no solo de subida.
- Acceso restringido en lugar de público (Sprint 0, R-05).

## Relación con el sistema actual

**Implementada como colección plana** (`informes.anexos`, cinco listas por
tipo), sin relación declarada con lo que cada pieza respalda. La asociación
entre una fotografía y el daño que justifica es hoy puramente visual e
implícita para quien lee el informe, no un dato del sistema.

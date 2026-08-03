# PHOTO

> Bounded context: Evidencia Documental · **Implementada**

## Objetivo

Representar la fotografía como pieza de evidencia visual del estado del
riesgo, del daño sufrido o del entorno del siniestro.

## Descripción

`Photo` es la especialización de `Evidence` para material gráfico. Es, junto
con `Document`, el tipo de evidencia más habitual del expediente: el
reportaje fotográfico es una de las cinco pestañas de Anexos, y las capturas
automáticas de mapa (meteorológico y catastral) se incorporan también como
fotografías, aunque generadas por el sistema y no tomadas por el perito.

## Responsabilidades

- Documentar visualmente el estado del riesgo antes o después del siniestro,
  el daño concreto, o el entorno relevante para el dictamen.
- Ilustrar el informe final con material que un lector pueda verificar
  visualmente.

## Atributos

| Atributo | Tipo | Implementado | Descripción |
|---|---|---|---|
| `id` | identificador | Sí | Clave de la fotografía |
| `claimId` | referencia | Sí (implícito) | Siniestro al que pertenece |
| `url` | texto | Sí | Ubicación en almacenamiento |
| `caption` | texto | Sí | Pie de foto |
| `categoria` | texto | Sí (`cat`, ej. "Daño general") | Clasificación libre |
| `origen` | enumerado | Parcial | `capturada_por_perito` \| `capturada_automaticamente` (mapas) |
| `numeroEnInforme` | número | Sí (calculado al exportar) | Orden de aparición en el documento final |

## Relaciones

- Photo *es-un* `EVIDENCE`
- N Photo — N `DAMAGE` (conceptual)
- N Photo — 1 `CLAIM`

## Ciclo de vida

Nace al capturarse (por el perito) o al generarse automáticamente (mapa
meteorológico o catastral). Se sube a almacenamiento. Se numera y se incorpora
al informe en el momento de exportar. Persiste indefinidamente sin política de
retención.

## Estados

`Capturada` → `Subida` → `Incorporada al informe`.

## Eventos

`FotografiaSubida` · `MapaCapturadoAutomaticamente` · `FotografiaBorrada`.

## Reglas de negocio

- Una fotografía puede justificar varios daños distintos, y un daño puede
  estar respaldado por varias fotografías (BR-29).

## Validaciones

- Tamaño máximo de 10 MB.
- Se distingue de un documento PDF por su tipo MIME, para decidir si se
  incrusta como imagen o como `iframe` en la exportación.

## Permisos

Acceso público sin autenticación una vez subida (Sprint 0, DT-11) — el riesgo
de privacidad más agudo aplicado a este tipo concreto de evidencia, porque
suele mostrar el interior del domicilio del asegurado.

## Casos de uso

- El perito fotografía la humedad en la pared, el estado general de la
  estancia y un detalle del punto de fuga: tres fotografías, un mismo daño.
- El sistema captura automáticamente un mapa con la estación XEMA más cercana
  y el lugar del siniestro: una fotografía generada, no tomada, que respalda
  la conclusión meteorológica.

## Ejemplos

```
Photo: "IMG_0234.jpg"
  categoria: Daño general
  origen: capturada_por_perito
  caption: "Vista general de la humedad en pared medianera"

Photo: "xema-estacio-15-07-2026.png"
  origen: capturada_automaticamente
  caption: (sin caption, generada por /api/meteocat)
```

## Posibles evoluciones

- Metadatos EXIF conservados (fecha y geolocalización reales de la captura),
  si el formato del archivo los incluye.
- Anotaciones sobre la propia imagen (marcado de la zona dañada).

## Relación con el sistema actual

**Implementada de forma sólida en cuanto a mecánica** (subida, numeración,
inclusión en ambas exportaciones), con la misma carencia de trazabilidad y de
control de acceso que el resto de `EVIDENCE`.

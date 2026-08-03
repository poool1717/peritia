# DOCUMENT

> Bounded context: Evidencia Documental · **Parcialmente implementada — se
> procesa pero no se conserva**

## Objetivo

Representar cualquier documento aportado o generado durante el expediente
—el PDF de encargo, la póliza, una factura, un presupuesto, un informe
catastral— como pieza de evidencia con identidad propia, procedencia y
posibilidad de consulta posterior.

## Descripción

`Document` es la especialización de `Evidence` para material textual o
estructurado, distinta de `Photo`. Es, en el sistema actual, el punto de
partida de casi todo: cinco de las nueve capacidades de IA del sistema
(IA-1, IA-2, IA-9, y los documentos catastral y meteorológico) trabajan sobre
un documento de entrada. Sin embargo, el documento fuente en sí —el PDF
completo— **no persiste** tras la extracción: se convierte a base64, se envía
a la IA y se descarta.

## Responsabilidades

- Ser la fuente de la que se extraen datos estructurados.
- Servir de prueba documental, consultable por un tercero que audite el
  informe.
- Conservar su versión original, con independencia de las correcciones
  posteriores a los datos extraídos de él.

## Atributos

| Atributo | Tipo | Implementado | Descripción |
|---|---|---|---|
| `id` | identificador | Sí (para los que sí se suben, en Anexos) | Clave del documento |
| `claimId` | referencia | Sí (implícito) | Siniestro al que pertenece |
| `tipo` | enumerado | Parcial | `encargo` \| `poliza` \| `factura` \| `presupuesto` \| `catastral` \| `otro` |
| `nombreArchivo` | texto | Sí | Nombre original |
| `url` | texto | Sí (solo para los subidos a Storage) | Ubicación del archivo |
| `contenidoConservado` | booleano | **No — el encargo y la póliza nunca se conservan** | Si el documento fuente persiste |
| `datosExtraidos` | estructura | Sí | Resultado de la extracción de IA |

## Relaciones

- N Document — 1 `CLAIM`
- Document *es-un* `EVIDENCE`
- 1 Document — 0..1 `POLICY` (cuando el documento es la póliza)
- 1 Document — 0..1 `ASSIGNMENT` (cuando el documento es el propio encargo)

## Ciclo de vida

**Este es el ciclo de vida más incompleto de todo el modelo.** Nace al
subirse. Se procesa (extracción de IA). Y, para los dos documentos más
importantes del expediente —el PDF de encargo y el de la póliza—, **termina
ahí**: no se conserva copia. Para las facturas y presupuestos subidos en la
pestaña de Anexos, sí persiste en Storage indefinidamente, sin política de
retención definida.

## Estados

`Subido` → `En procesamiento` → `Procesado` → (para encargo y póliza)
`Descartado` / (para el resto) `Conservado indefinidamente`.

## Eventos

`DocumentoSubido` · `ExtraccionIniciada` · `ExtraccionCompletada` ·
`DocumentoDescartado` (implícito, sin registro).

## Reglas de negocio

- Todo documento conserva siempre su versión original (BR-27) — **incumplida
  para encargo y póliza**.
- Nunca se sobrescriben datos extraídos por IA (BR-28) — cumplida solo
  parcialmente.

## Validaciones

- Tamaño máximo de 20 MB en el proxy de IA (`/api/claude`); sin guarda de
  tamaño específica en el cliente para encargo, póliza o facturas de Sección 3
  (Sprint 0, DT-22).

## Permisos

Los documentos que sí se conservan (Anexos) heredan el mismo acceso público
sin autenticación que el resto de evidencia (DT-11).

## Casos de uso

- El PDF de encargo se sube, se extraen 21 campos, y el propio PDF
  desaparece: si más adelante hay que verificar si la IA leyó bien un dato,
  no hay forma de volver al original.
- Una factura subida en la pestaña de Anexos sí se conserva y puede
  consultarse en cualquier momento posterior.

## Ejemplos

```
Document: "encargo_axa_sin2026-04521.pdf"
  tipo: encargo
  contenidoConservado: false
  datosExtraidos: {compania: "AXA Seguros", numReferencia: "...", …}
```

## Posibles evoluciones

- Conservar sistemáticamente todos los documentos fuente en almacenamiento,
  con acceso restringido — condicionado a resolver primero P-17 (si es
  aceptable conservarlos por motivos de minimización de datos personales) y
  P-09 (retención).
- Extracción de página de origen por dato extraído, no solo el documento en
  su conjunto.

## Relación con el sistema actual

**La brecha de trazabilidad más grave del sistema** (Sprint 0, DT-12). El
documento que da origen a la mayoría del contenido del informe es,
precisamente, el que no queda ningún rastro de haber existido, más allá de su
nombre de archivo en el momento de la subida.

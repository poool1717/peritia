# DB_MODEL.md

> Descripción del modelo de base de datos actual.
>
> **Fecha:** 1 de agosto de 2026
> **Fuentes:** `supabase/migrations/*.sql` y todas las llamadas a `sbDb` en
> `components/Peritia.jsx`.

---

## 1. Resumen

Motor: **PostgreSQL gestionado por Supabase**, con Row Level Security activo.

| Objeto | Cantidad |
|---|---|
| Tablas propias (`public`) | 2 |
| Buckets de Storage | 1 |
| Índices propios | 3 |
| Funciones | 2 |
| Triggers | 3 |
| Políticas RLS de tabla | 2 |
| Políticas de Storage | 3 |

Hay **dos proyectos Supabase con el mismo esquema**:

| Entorno | Proyecto | Contenido |
|---|---|---|
| Producción | `yrulaaxdusvmzohugmnc` | Datos reales |
| Test | `yvconlqtetxvyzxkhxib` | Vacío desde su creación |

**Regla vigente:** toda ampliación del esquema debe aplicarse a los dos, no solo
a uno.

---

## 2. Esquema

```
auth.users  (gestionada por Supabase)
    │
    ├──1:1──▶ public.perfiles
    │            id · email · nombre · dni · telefono · created_at · updated_at
    │
    └──1:N──▶ public.informes
                 id · user_id · num_referencia · compania · asegurado · estado
                 encargo · s1 · s2 · s3 · s4 · anexos   ← seis columnas JSONB
                 created_at · updated_at
                             │
                             └──(por URL)──▶ storage.objects (bucket "anexos")
```

---

## 3. `public.informes`

El expediente pericial. Es la tabla central del sistema.

| Columna | Tipo | Restricciones | Contenido |
|---|---|---|---|
| `id` | `uuid` | PK, `gen_random_uuid()` | Identificador |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE | Perito propietario |
| `num_referencia` | `text` | | Nº de siniestro, **duplicado** desde `encargo` |
| `compania` | `text` | | Aseguradora, **duplicada** desde `encargo` |
| `asegurado` | `text` | | Asegurado, **duplicado** desde `encargo` |
| `estado` | `text` | por defecto `'borrador'` | `borrador` · `completado` · `exportado` |
| `encargo` | `jsonb` | por defecto `{}` | Datos del encargo y de la póliza |
| `s1` | `jsonb` | por defecto `{}` | Sección 1 — verificación del riesgo |
| `s2` | `jsonb` | por defecto `{}` | Sección 2 — causas y circunstancias |
| `s3` | `jsonb` | por defecto `{}` | Sección 3 — valoración de daños |
| `s4` | `jsonb` | por defecto `{}` | Sección 4 — cobertura e indemnización |
| `anexos` | `jsonb` | por defecto `{}` | Referencias a los archivos de Storage |
| `created_at` | `timestamptz` | `now()` | |
| `updated_at` | `timestamptz` | `now()`, actualizado por trigger | |

### 3.1. Índices

```sql
idx_informes_user_id       (user_id)
idx_informes_updated_at    (updated_at DESC)
idx_informes_user_updated  (user_id, updated_at DESC)
```

⚠ Los tres están definidos, pero **la única consulta de listado que hace la
aplicación ordena por `created_at`**, no por `updated_at`
(`Peritia.jsx:4312`: `informes?select=*&order=created_at.desc`). Los dos índices
sobre `updated_at` no sirven hoy a ninguna consulta real.

⚠ `select=*` trae **las seis columnas JSONB completas de todos los expedientes**
para pintar la lista del dashboard, que solo necesita las columnas de cabecera y
el progreso. Un perito con 200 expedientes descarga todo su histórico en cada
login.

### 3.2. Estados

| Valor | Cuándo se asigna | Etiqueta en la interfaz |
|---|---|---|
| `borrador` | Al crear el expediente | "En curso" |
| `completado` | **Nunca se asigna desde el código** | — |
| `exportado` | Al exportar a PDF o Word (`markExported`) | "Finalizado" |

⚠ El valor `completado` está documentado en el esquema y en `CLAUDE.md`, pero
**ningún camino del código lo escribe**. La etiqueta "Pendiente revisión" del
dashboard no viene del estado, sino de un cálculo en vivo: se muestra cuando las
4 secciones están completas y el estado sigue siendo `borrador`
(`Peritia.jsx:979`). Es decir, **hay un estado en la base de datos que no se usa y
un estado en la interfaz que no está en la base de datos.**

### 3.3. Estructura de las columnas JSONB

Ninguna tiene esquema declarado. Su forma se deduce del código:

**`encargo`** — ~35 claves. Las principales: `compania`, `numReferencia`,
`numPoliza`, `ramo`, `garantia`, `productoContratado`, `fechaEncargo`,
`fechaSiniestro`, `lugarIntervencion`, `provincia`, `municipio`, `codigoPostal`,
`asegurado`, `nifAsegurado`, `causa`, `descripcionSiniestro`, `perito`,
`telPerito`, `capitalContinente`, `capitalContenido`, `franquicia`,
`franquicias{}` (por garantía), `primerRiesgo`, `fechaEfecto`, `tipoEncargo`,
`modalidadVisita`, `coberturaInferida`, `umbralViento`, `umbralLluvia`,
`tipoVivienda`, `usoVivienda`, `ubicacionVivienda`, `calidadPóliza`,
`descripciones{}`, `todosCapitalesContinente`.

⚠ La clave `calidadPóliza` **lleva tilde**. Es la única con carácter no ASCII, y
proviene literalmente del prompt de IA-2.

**`s1`** — `estado`, `superficieConstruida`, `tipoArqNivel1`, `tipoArqNivel2`,
`tipoArqKey`, `calidad`, `capContOverride`, `capCont2Override`, `vPreexContenido`,
`refCatastral`, `anoConstruccion`, `tipoRiesgo`, `usoVivienda`, `textoInstant`…

**`s2`** — `textoRaw`, `textoAI`, `aiApplied`, `meteo{}` (respuesta completa de
`/api/meteocat` más el párrafo redactado en `texto`).

**`s3`** — `textoRaw`, `textoAI`, `modoValoracion` (`baremo`|`presupuesto`|`factura`),
`partidas[]`, `reglaContinente`, `reglaContenido`, `franquiciaVal`,
`perceptorTipo`, `facturas[]`.

**`s4`** — `textoIntro`, `descripcionCobertura`, y los textos de propuesta.

**`anexos`** — cinco listas: `fotos`, `catastro`, `meteosim`, `facturas`,
`presupuestos`. Cada elemento: `{id, name, url, type, caption, cat}`.

### 3.4. Estructura de una partida (`s3.partidas[]`)

Es la unidad de cálculo del sistema:

| Campo | Tipo | Significado |
|---|---|---|
| `id` | número | `Date.now() + Math.random()` |
| `oficio` | texto | Albañilería, Pintura, Lampistería… |
| `desc` | texto | Descripción de la partida |
| `u` | texto | Unidad (m², ml, u) |
| `uds` | número | Cantidad |
| `p` | número | Precio unitario |
| `indirecto` | booleano | Si es cierto, su precio = 8 % del subtotal del resto |
| `ivaOn` / `iva` | booleano / número | IVA aplicado |
| `depr` / `pctDepr` | booleano / número | Depreciación (siempre manual) |
| `garantia` | texto | `continente` o `contenido` |
| `cobertura` | booleano | Si es falso, se excluye del cálculo |
| `perceptor` | texto | Asegurado, Perjudicado o Reparador |

⚠ `id` se genera con `Date.now() + Math.random()`. No hay garantía formal de
unicidad, aunque la colisión es muy improbable.

---

## 4. `public.perfiles`

| Columna | Tipo | Restricciones |
|---|---|---|
| `id` | `uuid` | PK, FK → `auth.users(id)` ON DELETE CASCADE |
| `email` | `text` | NOT NULL |
| `nombre` | `text` | |
| `dni` | `text` | |
| `telefono` | `text` | |
| `created_at` | `timestamptz` | `now()` |
| `updated_at` | `timestamptz` | `now()`, por trigger |

⚠ **`Peritia.jsx` no consulta nunca esta tabla mediante `sbDb`.** La fila la crea
sola el trigger `handle_new_user` al registrarse el usuario. El único campo que la
aplicación gestiona es el DNI del perito, a través de `ExportModal` y su callback
`onSaveDni`. Los campos `nombre` y `telefono` no se rellenan desde ninguna
pantalla.

---

## 5. Seguridad a nivel de fila (RLS)

RLS está **activo en las dos tablas**.

```sql
-- perfiles: cada usuario solo su propia fila
create policy "perfiles_own" on public.perfiles
  for all to authenticated
  using (id = auth.uid());

-- informes: cada perito solo sus expedientes
create policy "informes_own" on public.informes
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
```

**Valoración:** el aislamiento entre peritos es correcto y es la protección real
del sistema, dado que el navegador habla directamente con PostgREST.

⚠ Una asimetría a registrar: `perfiles_own` tiene `using` pero **no** `with
check`, mientras que `informes_own` tiene ambos. En la práctica no es explotable
—`id` es la clave primaria y referencia a `auth.users`— pero es una inconsistencia
entre las dos políticas.

---

## 6. Funciones y triggers

### `handle_updated_at()`
Refresca `updated_at` en cada `UPDATE`. Aplicada por dos triggers:
`perfiles_updated_at` e `informes_updated_at`.

### `handle_new_user()`
`SECURITY DEFINER`. Inserta la fila de `perfiles` al crearse un usuario, con
`on conflict (id) do nothing`. Aplicada por el trigger `on_auth_user_created`
sobre `auth.users`.

---

## 7. Storage — bucket `anexos`

Definido en `20260719120000_anexos_storage_bucket.sql`.

```sql
insert into storage.buckets (id, name, public) values ('anexos','anexos', true)
```

**Ruta de cada objeto:**
`{user_id}/{informe_id}/{pestaña}/{timestamp}-{aleatorio}-{nombre_saneado}`

El primer segmento debe coincidir con `auth.uid()`.

### 7.1. Políticas

| Política | Operación | Rol | Condición |
|---|---|---|---|
| `anexos_insert_own_folder` | INSERT | `authenticated` | Primer segmento de la ruta = `auth.uid()` |
| `anexos_select_public` | SELECT | **`public`** | `bucket_id = 'anexos'` |
| `anexos_delete_own_folder` | DELETE | `authenticated` | Primer segmento de la ruta = `auth.uid()` |

⚠ **El bucket es público en lectura.** Cualquiera con la URL puede ver
fotografías del interior del domicilio del asegurado, facturas con datos
personales y documentos del expediente, **sin sesión y sin dejar rastro**. La
migración documenta el motivo: *"necesaria para que los exports a PDF y Word
puedan cargar las imágenes sin sesión"*. Ver `TECHNICAL_DEBT.md`, DT-11.

La ruta incluye un sufijo aleatorio de 6 caracteres, lo que hace difícil
adivinarla, pero **no hay política de UPDATE**: los objetos no se pueden
sobrescribir, solo crear y borrar.

### 7.2. Historia

Antes de esta migración, los anexos se guardaban como `data:` URI en base64
dentro de `informes.anexos`. El cambio a Storage redujo el tamaño de la columna de
megabytes a kilobytes.

---

## 8. Ciclo de vida de un expediente

```
1. El perito sube el PDF del encargo
   └─ INSERT en informes (estado='borrador')
      ⚠ Guardado optimista: el editor se abre con un id local ('local_…')
        antes de saber si el INSERT ha funcionado

2. El perito edita cualquier campo
   └─ updateCase → 5 s de espera → PATCH informes?id=eq.{id}
      Reintento único a los 2 s si falla
      Si nada funciona: aviso del navegador al cerrar (beforeunload)

3. Sube anexos
   └─ POST a Storage + PATCH de informes.anexos

4. Exporta a PDF o Word
   └─ PATCH con estado='exportado'

5. Borra el expediente
   └─ DELETE informes?id=eq.{id}
      ⚠ Los archivos del bucket NO se borran: quedan huérfanos
```

---

## 9. Observaciones sobre el modelo

Registradas sin proponer cambio:

1. **El modelo es un contenedor, no un dominio.** Seis columnas JSONB sin esquema
   guardan toda la información pericial. La base de datos no puede validar nada,
   ni consultar por ningún dato interno, ni garantizar coherencia. Todo el
   significado vive en el código de JavaScript.

2. **Duplicación deliberada de tres campos.** `num_referencia`, `compania` y
   `asegurado` existen como columna y dentro de `encargo`. Es para poder listar el
   dashboard sin abrir el JSONB — aunque la consulta actual usa `select=*` y trae
   el JSONB de todos modos. La escritura las mantiene sincronizadas
   (`Peritia.jsx:4348-4349`), pero nada lo garantiza a nivel de base de datos.

3. **No hay tabla de partidas.** Las partidas —la unidad de cálculo del negocio—
   viven dentro de `s3.partidas` como un array de JSON. No se puede consultar
   "cuántas veces se ha usado la partida X" ni "precio medio de Y".

4. **No hay tablas de catálogo.** Baremo, módulos de arquitectura, compañías,
   garantías y provincias están en el código, no en la base de datos. Cambiar un
   precio del baremo exige volver a desplegar la aplicación.

5. **No hay auditoría.** No se sabe quién cambió qué ni cuándo, más allá de
   `updated_at` a nivel de fila completa.

6. **No hay borrado lógico.** El `DELETE` es definitivo y no borra los archivos
   asociados en Storage.

7. **Los documentos fuente no se guardan.** Los PDFs del encargo y de la póliza
   —la fuente de toda la extracción— se convierten a base64, se envían a la IA y
   se descartan. No queda copia en Storage.

8. **No hay política de retención documentada.** Los expedientes contienen datos
   personales sensibles y permanecen indefinidamente. Ver `OPEN_QUESTIONS.md`,
   P-09.

9. **El borrado del usuario arrastra todo.** Ambas claves foráneas son
   `ON DELETE CASCADE`: borrar la cuenta de un perito elimina todos sus
   expedientes de forma irreversible. Si es intencionado o no, no consta. Ver
   `OPEN_QUESTIONS.md`, P-10.

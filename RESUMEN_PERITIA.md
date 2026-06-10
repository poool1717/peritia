# PERIT.IA — Resumen del Proyecto

**Archivo principal:** `peritia.jsx` · ~2.960 líneas · React 18
**Versión desplegada:** Next.js 14 en Vercel · https://peritia-git-main-pol-myprojects.vercel.app

---

## Arquitectura

```
App (Root) — auth state (user, token, sidebarOpen)
├── LoginScreen            — Registro / inicio de sesión (Supabase Auth)
├── Dashboard              — Lista de encargos + sidebar colapsable
├── UploadEncargo          — Subida PDF encargo + póliza + extracción IA
└── ReportEditor           — Editor principal
    ├── TopBar             — Info encargo + toggle sidebar + tokens + Exportar
    ├── Sidebar            — Navegación colapsable (toggle ‹/›)
    ├── [Sec 0]            — Datos del Encargo (editable)
    ├── [Informe]          — Preview live del informe completo (con Anexos)
    ├── [Sec 1]            — Verificación del riesgo y póliza
    ├── [Sec 2]            — Causas y circunstancias
    ├── [Sec 3]            — Valoración de daños
    ├── [Sec 4]            — Cobertura e indemnización
    └── [Anexos]           — Fotos, catastro, Meteosim, facturas
```

---

## Infraestructura

| Servicio | Proyecto | Región | Estado |
|---|---|---|---|
| **Vercel** | `peritia` · `prj_FlGP4bJXDO8w52vUE2ahNzLcseoz` | US East | ✅ Activo |
| **Supabase** | `PeritIA` · `yrulaaxdusvmzohugmnc` | EU West 1 (Irlanda) | ✅ Activo |
| **Anthropic API** | `sk-ant-api03-uSjEaVJD...` | — | ✅ Configurada en Vercel env |
| **GitHub** | `poool1717/peritia` | — | ✅ Auto-deploy en push a main |

**Proxy seguro:** `pages/api/claude.js` — inyecta `ANTHROPIC_API_KEY`, añade `anthropic-beta: pdfs-2024-09-25` automáticamente si la petición contiene un PDF, garantiza `max_tokens` y modelo `claude-sonnet-4-6`.

**Proxy meteo:** `pages/api/meteocat.js` — consulta datos abiertos XEMA (Socrata: estaciones `yqwd-vj5e`, medidos `nzvn-apee`) + geocodificación Nominatim. Recibe dirección + fecha, devuelve estación más cercana y resumen del día (racha máx, viento medio, lluvia máx/h y total). Sin clave de pago. Solo Catalunya.

---

## Componentes base

`Spin` · `Inp` · `EuroInput` · `Sel` · `Txt` · `Btn` · `Card` · `SecTitle` · `SectionLabel` · `InfoRow` · `VoiceBox` · `NavBottom` · `Logo` · `DropZone` · `ExportModal` · `LoginScreen` · `SecEncargo` · `MeteoTabla`

---

## Llamadas a la IA (11 en total)

| # | Dónde | Qué hace | max_tokens |
|---|---|---|---|
| 1 | UploadEncargo | Extrae 24 campos del encargo PDF | 3000 |
| 2 | UploadEncargo | Extrae capitales, umbrales y coberturas de la póliza PDF | 3000 |
| 3 | Sec1 | Infiere datos del riesgo desde encargo | 1500 |
| 4 | Sec1 | Genera texto pericial sección 1 (PERITACION) | 1500 |
| 5 | Sec1 | Mejora texto documental (INSTANT PAYMENT) | 1500 |
| 6 | Sec2 | Mejora texto de causas y circunstancias | 1500 |
| 7 | Sec2 | Redacta párrafo pericial meteorológico desde datos XEMA | 1500 |
| 8 | Sec3 | Genera tabla de daños desde descripción + Baremo AXA | 2000 |
| 9 | Sec3 | Extrae partidas desde facturas/presupuestos PDF | 2000 |
| 10 | Sec4 | Genera análisis de cobertura e indemnización | 1500 |
| 11 | Sec4 | Genera descripción de cobertura desde póliza | 1500 |

---

## Lógica de negocio

**Extracción automática del encargo:** compañía, referencia, póliza, ramo, garantía, fechas, dirección, asegurado, perito, causas, capitales, tipo de encargo, modalidad de visita, cobertura inferida.

**Extracción automática de la póliza:** capitales por cobertura, franquicia, primer riesgo, umbrales meteorológicos, texto completo de coberturas, capitales del continente desglosados.

**Tipos de encargo:** `PERITACION` · `INSTANT_PAYMENT`
**Tipos de ramo:** `HOGAR` · `EMPRESA/PYME`

**Inferencia de cobertura vacía:**
```
Viento / Lluvia / Pedrisco / Nieve  →  RGEXT
Agua / Filtración                   →  DAGUA
Incendio                            →  INCEN
Robo                                →  ROBO
Eléctrico                           →  DELEC
```

**Cálculo del continente:**
```
Tipo "Obras de reforma / Primer riesgo"
  → Preexistente = Capital asegurado, infraseguro = 0%

Tipo "Continente completo"
  → Preexistente = calcVPreexCont(m², provCode, arqKey, calidad)
                 = m² × getModuloArq(provCode, arqKey, calidad) × getFactorArq(arqKey)
  → getModuloArq: TABLAS_ARQ[prov][tipo][calidadIdx] (€/m² CYPE 2025)
  → getFactorArq: 1.486 residencial · 1.618 no residencial · 1.366 urbanización
  → Infraseguro = (Preexistente − Asegurado) / Preexistente × 100
  → Regla proporcional = Asegurado / Preexistente
```

**Fórmula de valoración de daños (auditada y corregida):**
```
V.Repos     = Uds × V.Unitario
IVA €       = V.Repos × (IVA% por partida)
V.Real      = V.Repos × (1 − Depr%) + IVA €
V.Propuesto = V.Real
Subtotal    = Σ V.Propuesto (solo items con cobertura = Sí)
```

**Lógica de IVA por modo:**
- **Baremo AXA 2025** (sin factura) → IVA = 0% en todas las partidas
- **Factura / Presupuesto** → IVA del documento por partida (0%, 10% o 21%)

**Funciones de cálculo globales (fuente única de verdad):**
```javascript
calcPartida(p)                        → {vRepos, ivaAmt, vReal}  // p.iva??0
getPartidas(s3)                       → s3.partidas con cobertura (fuente única)
calcReglas(enc,s1)                    → {continente, contenido, capCont, vPreexCont, capCont2, vPreexContenido, infraCont, infraContenido}
calcRegla(enc,s1)                     → regla del continente (compat)
reglaPartida(p,reglas,s3)             → regla efectiva de la partida (según garantía y toggle del bloque)
sumAjustado(enc,s1,s3)                → Σ V.Real × regla por partida
calcIndemnizacion(enc,s1,s3)          → MAX(0, ajustado − franquicia)
fraseIndemn(s3,indemn)                → frase de propuesta según modo y perceptor
sumReal/sumRepos/sumIVA(rows)
getModuloArq(provCode, arqKey, cal)   → €/m² de TABLAS_ARQ
getFactorArq(arqKey)                  → 1.486 | 1.618 | 1.366
calcVPreexCont(m2, prov, arqKey, cal) → valor preexistente continente completo
```

**Modos de valoración Sec3 (orden):**
- **Por Baremo compañía** — IA selecciona partidas desde la descripción; IVA = 0%; sin frase de indemnización
- **Por Presupuesto** — adjuntar PDFs; columna IVA oculta; frase "a la espera de aportación de la factura…"
- **Por Factura** — adjuntar PDFs; la IA extrae líneas con IVA del documento; frase "…(IVA incl.)"

**Perceptor (presupuesto / factura):** checkbox exclusivo Particular / Reparador. Con Reparador no hay depreciación (columna oculta) y la frase usa "Reparador:".

**Regla proporcional por bloque (continente / contenido):**
```
Cada partida lleva garantia = "continente" | "contenido".
regla del bloque = capital asegurado del bloque / valor preexistente del bloque
                   (solo si hay infraseguro y el toggle del bloque está activo)
primerRiesgo / obrasReforma / esHogar → continente sin infraseguro → regla = 1
```

**Fórmula de indemnización:**
```
Valor ajustado = Σ por partida ( V.Real × regla del bloque de la partida )
Indemnización  = MAX(0, Valor ajustado − Franquicia)
```

**Verificado contra informes reales:**
| Caso | Resultado esperado | App |
|---|---|---|
| Case 1 — Empresa, obras reforma | 463,59 € | ✅ 463,59 € |
| Case 2 — Hogar, primer riesgo, IVA mixto | 1.291,47 € | ✅ 1.291,47 € |

---

## Exportación de documentos

**Modal "Exportar"** — accesible desde TopBar. DNI del perito se guarda en el perfil.

| Formato | Tecnología | Notas |
|---|---|---|
| **PDF** | `window.open + window.print()` nativo | CSP-safe. Abre nueva pestaña → imprimir/guardar como PDF |
| **Word (.doc)** | HTML-to-DOC via Blob | Editable en Word/LibreOffice, descarga directa |

Ambos incluyen: portada con grid de campos, Sec0–4 completas, tabla de valoración con 12 columnas, tabla de indemnización, cierre con espacio para firma, índice de anexos, fotos 2/página.

---

## Autenticación y persistencia (Supabase)

**Auth:** email + contraseña · confirmación de email desactivada · perfil creado automáticamente al registrarse.

**BD — tablas:**
```sql
public.informes (
  id UUID PK, user_id UUID FK,
  num_referencia, compania, asegurado, estado,
  encargo JSONB, s1 JSONB, s2 JSONB, s3 JSONB, s4 JSONB, anexos JSONB,
  created_at, updated_at
)
public.perfiles (
  id UUID PK, email, nombre, dni, telefono,
  created_at, updated_at
)
```

RLS activo. `handleDone` resiliente — abre el editor inmediatamente con datos extraídos; guardado Supabase en segundo plano.

---

## Datos de referencia integrados

**Baremo AXA 2025** — 22 partidas (IVA = 0%): Pintura, Albañilería, Fontanería, Electricidad, Carpintería, Cristalería, Loza, Otros.

**TABLAS_ARQ 2025** — 63 tipos de arquitectura × 6 provincias (Baleares, Barcelona, Girona, Lleida, Tarragona, Otras) × 3 calidades (Básica/Media/Alta). Fuente: Excel tablas_calculo_2025. "Otras" = media de las 5 provincias. Reemplaza el antiguo MOD_ARQ.

**Compañías aseguradoras** — 14 compatibles: AXA, Mapfre, Allianz, Generali, Zurich, Helvetia, Mutua Madrileña, Caser, Reale, Santalucía, Pelayo, BBVA Seguros, Catalana Occidente, Línea Directa.

---

## UX y navegación

- **Sidebar global** — estado `sidebarOpen` al nivel App, persiste entre Dashboard y Editor. Toggle `‹/›` visible en todas las pantallas.
- **Sec 0 "Datos del Encargo"** — primera sección del editor, todos los campos extraídos son editables.
- **Tick verde en sidebar** — S1: superficieConstruida o textoInstant · S2: textoAI/textoRaw · S3: partidas o pLibres · S4: aiText · Anexos: cualquier archivo.
- **Botón "Aplicar al informe"** — S1, S2 y S3 sincronizan texto IA con el preview.
- **Informe live** — usa `getPartidas(s3)` para mostrar tabla según modo activo.
- **Error handling** — errores de API visibles en alertas con mensaje exacto de Anthropic.

---

## Estado actual

| Módulo | Estado |
|---|---|
| Dashboard + sidebar toggle global | ✅ |
| Extracción IA encargo + póliza (24 campos) | ✅ |
| Sec 0 — Datos del Encargo (editable) | ✅ |
| Sec 1 — Riesgo + auto-fill póliza + arquitectura 3 niveles | ✅ |
| Sec 2–4 + Anexos | ✅ |
| Sec 3 — Regla proporcional por bloque (continente/contenido) | ✅ |
| Sec 3 — Modos Baremo / Presupuesto / Factura + perceptor | ✅ |
| Sec 3 — Frase de indemnización automática + drag & drop de filas | ✅ |
| Valor preexistente CYPE 2025 (TABLAS_ARQ) | ✅ |
| Fórmula de cálculo auditada y verificada | ✅ |
| Preview live del informe | ✅ |
| Exportación PDF + Word | ✅ |
| Login multiusuario (Supabase Auth) | ✅ |
| Base de datos persistente (Supabase) | ✅ |
| Despliegue en Vercel (Next.js) | ✅ |
| Proxy seguro API Anthropic | ✅ |
| Error handling con mensaje real de API | ✅ |

---

## Coste estimado

| Concepto | Coste |
|---|---|
| Por informe completo (IA) | ~0,30–0,55 € |
| Vercel (hobby plan) | 0 €/mes |
| Supabase (free tier) | 0 €/mes |

---

## URLs del proyecto

| Recurso | URL |
|---|---|
| App producción | `https://peritia-git-main-pol-myprojects.vercel.app` |
| GitHub | `https://github.com/poologii1717/peritia` |
| Vercel dashboard | `https://vercel.com/pol-myprojects/peritia` |
| Supabase | `https://supabase.com/dashboard/project/yrulaaxdusvmzohugmnc` |
| Artefacto referencia | `https://claude.ai/public/artifacts/ced45450-ed81-4101-8c46-39f79cf17ce7` |

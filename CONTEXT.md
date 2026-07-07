# PERIT.IA — CONTEXT.md
> Estado actual del proyecto y contexto acumulado. Actualizar al cerrar cada sesión.

**Última actualización:** 7 julio 2026 (sesión 9 — merge de `staging` a `main` + UX/UI Fase 2 y 3)

---

## Estado actual

La app está **desplegada y funcional en producción**. El flujo completo funciona:
login → subida PDFs → extracción IA → editor → guardar → exportar PDF/Word.

La extracción de datos desde PDFs estaba rota tras la migración a Vercel (errores 400, 400 max_tokens, créditos insuficientes). Todos resueltos. Actualmente en pruebas reales con el usuario.

`staging` (validación de inputs sesión previa + accesibilidad/responsive sesión 8) ya está fusionada en `main` (merge normal, sin squash, commit `903cf0f`). `main` incluye además el `<meta name="viewport">` (`pages/_app.js`, ya estaba resuelto desde el propio commit de accesibilidad) y, en esta sesión 9, la Fase 2 (sidebar como drawer/overlay en móvil + topbar del editor sin desbordamiento) y la Fase 3 (LoginScreen unificado con la paleta `C` y los helpers compartidos) del roadmap UX/UI.

**Sesión 6 (auditoría técnica):** revisión completa de seguridad, fiabilidad y mantenibilidad. Aplicados en producción los puntos 1–4 y 6: protección de contraseñas filtradas (Supabase), auth sin fallback inseguro, guardado verificado con reintento e indicador visible, avisos al usuario cuando la IA falla, keys estables en tablas de partidas y dependencias correctas en los `useEffect` de auto-relleno de Sec1. Queda pendiente para una sesión dedicada el punto 5 (dividir `Peritia.jsx`, 3.107 líneas, en módulos por sección — refactor grande).

**Sesión 7 (optimizaciones tras siniestros reales):** ronda de mejoras pedidas por el perito tras probar casos reales, repartidas por todas las secciones. Compila limpio (`next build` OK). Resumen:
- **Sec 0:** causas de empresa (humo, choque, vandalismo, atmosféricos, etc.) → garantía "Riesgos Extensivos" automática; campo "Nº exp. interno" renombrado a "Nº de Encargo"; "Franquicia general" renombrada a "Franquicia" y ahora toma el valor de la franquicia de la cobertura afectada (extracción por cobertura desde la póliza: `franquicias{}`); extracción de valor nuevo (continente/contenido) y % de depreciación de la póliza.
- **Sec 1:** estado del riesgo "Regular" → "Usado"; "tablas 2025" → "tablas"; redacción IA en viñetas cortas y simplificadas.
- **Sec 2:** la verificación meteorológica XEMA solo aparece si la garantía afectada es Atmosféricos o Riesgos Extensivos; el umbral se evalúa según la causa (viento/lluvia/pedrisco); tabla meteo nueva (Temperatura ºC, Humedad rel. %, Racha máx. diaria, Intensidad máx. precipitación; fuera Viento medio, Lluvia máx y Lluvia total); proxy `meteocat.js` devuelve tempMax/humitatMax (variables XEMA 32/33). Contenido a 0 € se muestra como 0,00 € sin alerta de "no detectado".
- **Sec 3:** baremos AXA sustituidos por los baremos por oficio (ALBAÑILERÍA, PINTURA, LAMPISTERÍA, ELECTRICIDAD, CARPINTERÍA, CERRAJERÍA, LIMPIEZA, AUXILIARES); la IA selecciona partidas por tipo de daño y condición de activación; "Costos indirectos" = 8% del subtotal (automático); columna nueva "Oficio" (mayúsculas); perceptores Asegurado/Reparador + perjudicados nombrados; bloque "¿Hay perjudicados?" (Sí/No + nombres); "Por baremo" → "A modo informativo"; depreciación de póliza aplicada a partidas si hay valor nuevo.
- **Sec 4:** "en base a baremo" → "a modo informativo"; descripción de cobertura copia el texto exacto de la póliza mapeando el nombre comercial al código (RGEXT = Riesgos Extensivos); propuesta de indemnización ahora se genera y actualiza automáticamente (también en modo informativo).
- **Informe:** foto de la cartografía catastral (primera imagen del anexo Info Catastral) tras la referencia catastral, en vista previa, Word y PDF.

**Sesión 8 (rama `staging` — validación de inputs + accesibilidad y responsive, PR1+PR2):** no toca las funciones de cálculo (`calcReglas`, `reglaPartida`, `sumAjustado`, `calcIndemnizacion`) ni `pages/api/claude.js`. Compila limpio (`next build` OK).
- **PR1 — Validación de inputs (evita indemnizaciones corruptas):** en Sec3, `clampNum`/`P_LIMITS`/`clampField`/`sanP` acotan uds y precio a ≥0, IVA y %depreciación a 0–100; `updP` pasa cada cambio por `clampField`; las partidas generadas por IA (`genFromBaremo`, `extractFromFacturas`) se sanean con `sanP` antes de guardarse; `InpCell` acepta `min`/`max` y los 4 campos numéricos de la tabla los usan; la depreciación de póliza se acota a 0–100 al extraerla del PDF y en `genFromBaremo`.
- **PR2 — Accesibilidad y responsive (desktop + móvil + tablet):** estado de foco visible (`:focus-visible`) y `touch-action:manipulation` en botones; `@media(max-width:767px)` evita el zoom automático de iOS en inputs (`font-size:16px`), reduce la fuente en celdas de tabla y activa scroll horizontal en las tablas de preview del informe (clase `.tbl-scroll`, con scrollbar más visible en móvil); el sidebar arranca cerrado en pantallas <1024px (`App`); `aria-label` añadido a los 6 botones de solo icono (toggles de menú, cerrar modal de exportación, eliminar factura/partida/encargo).

**Sesión 9 (merge `staging`→`main` + UX/UI Fase 2 y 3):** no toca `calcReglas`, `reglaPartida`, `sumAjustado`, `calcIndemnizacion` ni `pages/api/claude.js` (verificado con diff línea a línea). Compila limpio (`next build` OK).
- **Merge:** `staging` fusionada en `main` con merge normal (sin squash, commit `903cf0f`), conservando el historial de sus 3 commits.
- **Fase 2 — Sidebar como drawer/overlay en móvil:** por debajo de 1024px el sidebar (Dashboard y ReportEditor) pasa a `position:fixed` con `transform:translateX()` y un backdrop semitransparente que lo cierra al hacer clic fuera (clases `.app-sidebar`/`.sb-open`/`.sidebar-backdrop`), en vez de empujar el contenido como en desktop. La topbar (clase `.app-topbar`) sube su z-index por encima del sidebar para que Inicio/toggle sigan visibles con el drawer abierto.
- **Fase 2 — Topbar del editor sin desbordamiento:** `.editor-topbar`/`.editor-actions` con `flex-wrap` en `@media(max-width:767px)`; el bloque de acciones (guardado/consumo IA/contador/Exportar) pasa a una segunda línea en vez de desbordar horizontalmente. Verificado con un arnés de prueba aislado (mismo CSS) a 390px: sin cambios en desktop.
- **Fase 3 — `LoginScreen` unificado:** reemplazados los hex sueltos y el radio de borde propio (16) por la paleta `C` y los helpers ya usados en el resto de la app (`inpStyle`, `Btn`, mismo patrón de banners que `ExportModal`); panel a `borderRadius:12` (igual que `ExportModal`). Verificado visualmente con capturas a 1280px y 390px.

---

## Lo que está completado y funcionando

### Core
- [x] Extracción IA de 24 campos desde PDFs de encargo y póliza
- [x] Editor completo Sec 0–4 + Anexos
- [x] Preview live del informe
- [x] Cálculo de valoración auditado (calcPartida, getPartidas, calcRegla — fuente única)
- [x] Exportación PDF (window.print) y Word (Blob .doc)
- [x] Login/registro con Supabase Auth
- [x] Persistencia BD Supabase (informes + perfiles)
- [x] Sidebar colapsable global (App-level state, funciona en Dashboard y Editor)
- [x] Sección 0 "Datos del Encargo" editable en el editor
- [x] Sección 0 revisada: título "Datos del Encargo", campos Producto contratado y Código postal, lógica garantía desde póliza, campos perito movidos al modal de exportación, botón "Iniciar Informe"
- [x] Dashboard reconstruido con sidebar, user info, delete encargos
- [x] Sección 1 renovada: campos Tipo vivienda, Uso vivienda, Ubicación, selector tipo arquitectura 3 niveles
- [x] TABLAS_ARQ 2025: 63 tipos arquitectura × 6 provincias (Baleares, Barcelona, Girona, Lleida, Tarragona + Otras)
- [x] Fórmula correcta valor preexistente: PEM × factor (1.486 residencial / 1.618 no residencial / 1.366 urbanización)
- [x] Valor preexistente continente: primer riesgo detectado → = capital asegurado; si no → cálculo tablas
- [x] Valor preexistente contenido editable por el perito
- [x] Calidad de acabados: extraída de póliza primero, si no → selección manual
- [x] Botón Guardar eliminado de Sec1 (guardado automático)
- [x] handleDone resiliente (abre editor aunque Supabase falle)
- [x] Deploy en Vercel con proxy seguro (API key nunca en el cliente)
- [x] **Validación de inputs en Sec3 (sesión 8, `staging`):** `clampField`/`sanP` acotan uds, precio, IVA y %depreciación (0–100) tanto en la edición manual como en las partidas generadas por IA, para que un valor fuera de rango no corrompa la indemnización propuesta.
- [x] **Accesibilidad y responsive (sesión 8, `staging`):** foco visible por teclado, inputs sin zoom automático de iOS en móvil, tablas de preview con scroll horizontal en pantallas estrechas, sidebar cerrado por defecto en móvil/tablet, `aria-label` en los botones de solo icono.
- [x] **`<meta name="viewport">` (sesión 8, `pages/_app.js`):** el móvil ya renderiza al ancho real del dispositivo en vez de forzar ancho de escritorio.
- [x] **Sidebar como drawer/overlay en móvil + topbar del editor sin desbordamiento (sesión 9, Fase 2):** por debajo de 1024px el sidebar es un panel `fixed` con backdrop en vez de empujar el contenido; la topbar del editor envuelve sus acciones en vez de desbordar en pantallas <768px.
- [x] **`LoginScreen` unificado con la paleta `C` (sesión 9, Fase 3):** mismos colores, radios de borde e inputs/botones que el resto de la app.
- [x] **Auditoría técnica completa (sesión 6):** revisión de seguridad (Supabase RLS verificado activo, anon key pública por diseño), rendimiento y mantenibilidad. Aplicados 3 endurecimientos prioritarios:
  - **Auth segura:** `sbDb` ya no cae al anon key si falta el token de sesión; rechaza la operación (evita identidad anónima sin user_id).
  - **Guardado verificado:** `saveToSb` ahora confirma el resultado del PATCH y reintenta una vez ante fallo transitorio; nuevo estado `saveState` (idle/saving/saved/error) con indicador visible en la barra del editor. El botón "Guardar cambios" hace `flushSave` (guardado inmediato real) en vez de un spinner falso de 1,2 s.
  - **Avisos de IA:** `parseJSON` marca respuestas no interpretables con `_parseError` (en vez de `{}` silencioso); nuevo helper `iaError(parsed)`. Sec3 (generar partidas / extraer facturas) y Sec1 (texto descriptivo) avisan al usuario cuando la IA no devuelve datos válidos.
- [x] **Sección 2 — Verificación meteorológica automática (XEMA / Meteocat):** en siniestros atmosféricos, botón que localiza la estación XEMA más cercana al lugar del siniestro, consulta viento y lluvia del día del siniestro y los compara con los umbrales de la póliza. Genera tabla de datos + párrafo pericial redactado por IA. Tabla y texto se incrustan en el informe (preview, Word y PDF) y en el índice de anexos. Fuente: datos abiertos de la Generalitat (Socrata), gratis y sin clave de pago.
- [x] **Sección 3 — Valoración renovada (sesión 5):**
  - Parámetros de garantía en **dos bloques (Continente / Contenido)**, cada uno con capital asegurado, valor preexistente, infraseguro y toggle de regla proporcional.
  - **Regla proporcional por bloque** y por fila: `indemnización = valor del daño × (capital asegurado / valor preexistente)`. Cada partida se asigna a Continente o Contenido y aplica la regla de su bloque. Se auto-activa al detectar infraseguro (editable).
  - **Tres modos de valoración** (orden): Por Baremo compañía · Por Presupuesto · Por Factura.
  - **Frase de indemnización automática** según modo y perceptor (Particular/Reparador): presupuesto → "a la espera de aportación de la factura… Asegurado: €"; factura particular → "… Asegurado: € (IVA incl.)"; reparador → "… Reparador: €"; baremo → sin frase. Se incrusta en preview, Word y PDF.
  - **Checkbox exclusivo Particular / Reparador** (solo presupuesto/factura). Con Reparador no hay depreciación → columnas Depr ocultas.
  - **Columna IVA oculta** en modo Presupuesto.
  - **Columna Cobertura** muestra "Sí"/"No" (clic para alternar) en verde/rojo.
  - **Reordenar filas con drag & drop** (tirador ⠿ por fila).
  - **Subtotal corregido** (bug: en modo factura leía `pLibres` vacío; ahora `getPartidas` lee siempre `s3.partidas`).
  - **Auto-relleno de Concepto de garantía y Franquicia:** al abrir Sec3 se rellenan automáticamente desde el encargo (`enc.garantia`/`enc.causa`) y la póliza (`enc.franquicia`). Ambos campos siguen siendo editables.

### Fórmulas verificadas contra casos reales
- Case 1 (Empresa, obras reforma): 463,59 € ✅
- Case 2 (Hogar, primer riesgo, IVA mixto): 1.291,47 € ✅

### Lógica de IVA confirmada
- Modo baremo → IVA = 0% (los baremos GVP no llevan IVA)
- Modo factura → IVA del documento por partida

---

## Problemas resueltos en las últimas sesiones

| Problema | Causa | Solución |
|---|---|---|
| Login congelado | Sin try/catch + email confirmation activa | try/catch + desactivar email confirmation en Supabase |
| CSP bloquea fetch a Supabase | Claude.ai artifact sandbox | Migrar a Vercel (fetch desde browser, sin restricciones) |
| PDF export bloqueado | document.write bloqueado por CSP | Reemplazar con Blob URL + window.open |
| Extracción falla (400) | Modelo `claude-sonnet-4-20250514` deprecado | Actualizar a `claude-sonnet-4-6` |
| Extracción falla (max_tokens) | proxy no garantizaba max_tokens | Añadir `if(!body.max_tokens) body.max_tokens=1500` |
| Extracción falla (créditos) | Cuenta Anthropic sin saldo | Usuario añadió $5 en créditos |
| Trash2 not defined | Icono usado pero no importado | Añadir Trash2 a imports lucide-react |
| Dashboard sin toggle sidebar | Componente antiguo sin props sidebarOpen | Reconstruir Dashboard completo |
| pLibres invisible en Sec4/PDF | getPartidas solo leía `partidas`, no `pLibres` | getPartidas() detecta modo y lee el array correcto |
| IVA 0% → 21% (bug) | p.iva\|\|21 cambiaba 0 a 21 (falsy) | Cambiar a p.iva??21 (nullish coalescing) |
| Regla proporcional incorrecta | Sec4 ignoraba tipoContinente/primerRiesgo | calcRegla() global con lógica correcta |
| Disk IO excesivo (guardado por keystroke) | updateCase hacía PATCH a Supabase en cada cambio de campo | Debounce de 5s con useRef: el PATCH solo se ejecuta 5s después del último cambio |
| Garantía afectada no se cruzaba con póliza | Se usaba solo el campo literal del encargo | Nueva lógica: si hay póliza, cruzar causa contra garantiasActivas de la póliza para seleccionar la cobertura correcta |
| Valor preexistente incompleto | Sólo calculaba módulo × m², sin gastos generales, honorarios ni IVA | Fórmula completa: PEM × factor (1.486 residencial / 1.618 no residencial) según tablas CYPE 2025 |
| Tipos arquitectura insuficientes (solo hotel/local) | MOD_ARQ tenía 2 tipos × 7 provincias | TABLAS_ARQ con 63 tipos × 6 provincias extraídos del Excel tablas_calculo_2025 |
| Subtotal de la tabla de valoración no sumaba (modo factura) | `getPartidas` leía `s3.pLibres` (vacío) cuando el modo era factura, pero las partidas se guardaban en `s3.partidas` | `getPartidas` lee siempre `s3.partidas` (fuente única) |
| Regla proporcional no distinguía continente de contenido | `calcRegla` devolvía un único coeficiente del continente | Nuevo `calcReglas` devuelve regla por bloque; cada partida lleva su `garantia` y aplica la regla correspondiente |
| `sbDb` caía al anon key sin sesión válida (`token\|\|SB_KEY`) | Fallback inseguro: operaba como anónimo sin user_id | `sbDb` rechaza la operación si falta token |
| Guardado "optimista" que podía mentir | `saveToSb` no comprobaba el resultado; la UI mostraba "guardado" tras 1,2 s fijos | `saveToSb` confirma el PATCH, reintenta una vez y expone `saveState`; indicador real en la barra del editor |
| La IA fallaba en silencio (campo vacío sin explicación) | `parseJSON` devolvía `{}` al no poder interpretar la respuesta | `parseJSON` marca `_parseError`; helper `iaError` + alerts en Sec1/Sec3 |
| Auto-relleno de Sec1 no se aplicaba si la póliza llegaba tras el render | `useEffect` con deps `[]`/`[esInstant]` solo corría al montar | Deps basadas en los campos de origen `enc.*`; guardas `!data.X` evitan sobrescribir |
| `key={i}` en tabla de vista previa de partidas | Índice como key podía causar bugs al reordenar/borrar | `key={p.id||i}` |
| Propuesta de indemnización no se generaba automáticamente | El `useEffect` de Sec4 tenía deps `[]` (solo al montar) y en baremo devolvía `""` | Regenera con deps `[modoVal,indemn,perceptorTipo,partidas]` mientras no se edite a mano (`textoIndemnEdited`); el modo informativo también eleva propuesta |
| Descripción de cobertura no encontraba Riesgos Extensivos | Se buscaba `enc.descripciones[nombreComercial]` pero las claves son códigos (RGEXT, DAGUA…) | Mapeo nombre→código en Sec4 (Riesgos Extensivos → RGEXT) antes de copiar el texto exacto |
| Verificación meteo aparecía en siniestros no atmosféricos | `esSiniestroAtmosferico` miraba causa/descripción además de la garantía | Ahora se limita a la GARANTÍA afectada (Atmosféricos o Riesgos Extensivos); el umbral se evalúa según la causa |

---

## Arquitectura del componente Peritia.jsx

```
Líneas: ~3.277 · Balance llaves: 0
Modelo IA: claude-sonnet-4-6
Proxy: /api/claude (Vercel serverless)

Funciones globales clave:
  callClaude(system, content, onTokens, maxTok=1500)
  calcPartida(p) → {vRepos, ivaAmt, vReal}
  getPartidas(s3) → s3.partidas con cobertura (fuente única)
  calcReglas(enc, s1) → {continente, contenido, capCont, vPreexCont, capCont2, vPreexContenido, infraCont, infraContenido}
  calcRegla(enc, s1) → regla continente (compat)
  reglaPartida(p, reglas, s3) → regla efectiva de la partida según garantía y toggle
  sumAjustado(enc, s1, s3) → Σ V.Real × regla por partida
  calcIndemnizacion(enc, s1, s3) → max(0, ajustado − franquicia)
  fraseIndemn(s3, indemn) → frase de propuesta según modo y perceptor
  sumReal/sumRepos/sumIVA(rows)
  sbAuth(path, body) → Supabase Auth REST
  sbDb(path, method, body, token) → Supabase DB REST

Constantes:
  SB_URL = "https://yrulaaxdusvmzohugmnc.supabase.co"
  SB_KEY = "eyJhbGci...TOS0mgr0TdHxlC_kMhqOya_WNWyt2KTEn356USWKQFw"

Datos hardcodeados:
  BAREMO[] — 47 partidas por oficio (IVA=0%); campos oficio/desc/u/p/rend/dano/cond; "Costos indirectos" = 8% del total (indirecto:true)
  MOD_ARQ{} — módulos arquitectura por provincia y calidad
  PROVINCIAS[] — lista provincias con código
  COMPANIAS[] — 14 aseguradoras compatibles
```

---

## Próximos pasos pendientes (roadmap)

### Corto plazo (próxima sesión)
- [x] Auto-relleno de concepto de garantía y franquicia en Sec3 desde encargo/póliza
- [x] **Sección 4 renovada (sesión 5):**
  - Texto de valoración fijo según modo (baremo/presupuesto/factura), editable con botón Restaurar.
  - Descripción de cobertura extraída automáticamente de la póliza (garantías contratadas según causa/cobertura afectada). Editable.
  - Eliminado bloque "Redacción IA — Sección 4".
  - Propuesta de indemnización estructurada y automática: presupuesto → "A la espera de factura… Asegurado: €"; factura+particular → "Asegurado: € (IVA incl.)"; reparador → "Reparador: €"; sin cobertura → "NO se propone indemnización". Editable con botón Restaurar.
- [x] **Anexos renovados (sesión 5):** drag & drop real en la zona de carga (feedback visual al arrastrar); PDFs se cargan y muestran correctamente con iframe; imágenes muestran tamaño completo sin recorte (objectFit contain). Actualizado en editor, preview, exportación PDF y Word.
- [ ] Probar en producción la Sec3 y Sec4 renovadas con un caso real
- [x] **Auditoría sesión 6 — punto 1:** "Leaked Password Protection" activado en Supabase (Attack Protection)
- [x] **Auditoría sesión 6 — punto 6:** `key={p.id||i}` en la tabla de vista previa de Sec3 (la editable ya lo tenía); dependencias de los `useEffect` de auto-relleno de Sec1 ahora basadas en los campos de origen (`enc.*`) para reaccionar a la extracción asíncrona de la póliza sin bucles
- [ ] **Pendiente de la auditoría — opcional (sesión dedicada):** dividir `Peritia.jsx` (3.107 líneas) en módulos por sección (punto 5, refactor grande); validar respuestas de IA con esquema (zod) en más puntos
- [ ] Validar la frase de indemnización en los tres modos y con perceptor Particular/Reparador
- [ ] (Opcional) Ámbito fuera de Catalunya: integrar AEMET para el resto de España
- [ ] (Opcional) Sacar app token gratuito de Socrata si se llega a límites de peticiones
- [x] **Sesión 8 (`staging`) — validación de inputs (PR1):** uds/precio/IVA/%depreciación acotados en Sec3, tanto en edición manual como en partidas generadas por IA
- [x] **Sesión 8 (`staging`) — accesibilidad y responsive básico (PR2):** foco visible, sin zoom automático de iOS en inputs móviles, scroll horizontal en tablas de preview, sidebar cerrado por defecto en móvil/tablet, `aria-label` en botones de icono
- [x] **Sesión 8 — `<meta name="viewport">`** ya resuelto vía `pages/_app.js` (no hizo falta `pages/_document.js`)
- [x] Fusionar `staging` a `main` (sesión 9, merge normal sin squash, commit `903cf0f`)
- [x] **Sesión 9 — UX/UI Fase 2:** sidebar como drawer/overlay en móvil (backdrop + `position:fixed`) en vez de panel fijo que empuja el contenido; topbar del editor con `flex-wrap` para no desbordar en pantallas estrechas
- [x] **Sesión 9 — UX/UI Fase 3:** `LoginScreen` unificado con la paleta `C` y los helpers compartidos (`inpStyle`, `Btn`); radios de borde consistentes con el resto de la app
- [ ] Probar en dispositivo real (móvil/tablet) el drawer del sidebar y la topbar del editor antes de dar la Fase 2 por completamente cerrada

### Medio plazo (Fase 2)
- [ ] Multi-compañía: baremos propios por aseguradora (no solo AXA)
- [ ] Refinamiento de prompts de extracción con casos reales
- [ ] Panel de administración básico
- [ ] Métricas de uso (cuántos informes, tiempo por sección, etc.)

### Largo plazo (Fase 3–4)
- [ ] Sistema de facturación (Stripe) y planes de suscripción
- [ ] Multi-usuario por gabinete pericial
- [ ] Integración con plataformas de encargos (ISS, Seres)
- [ ] API para aseguradoras
- [ ] Módulo IA para valoración automática de fotos

---

## Datos de referencia — Baremo por oficio (sesión 7)

47 partidas con precio base por m²/ml/u. IVA siempre 0% en modo "a modo informativo".
Oficios: Albañilería, Pintura, Lampistería, Electricidad, Carpintería, Cerrajería, Limpieza, Auxiliares.
Cada partida lleva tipo de daño y condición de activación (la IA las usa para auto-seleccionar).
"Costos indirectos" (Auxiliares) = 8% del subtotal de las demás partidas (cálculo automático, `indirecto:true`).

## Datos de referencia — Módulos arquitectura

€/m² por provincia y tipología (Hotel/Local × Básica/Media/Alta).
Provincias: Baleares, Barcelona, Girona, Madrid, Málaga, Asturias, Las Palmas, Tenerife, Sevilla, Tarragona, Valencia, Otras.

---

## Notas importantes para Claude

1. **El usuario no es programador.** Siempre explicar qué hace cada cambio y por qué.
2. **Antes de aplicar cualquier cambio grande**, leer el archivo actual con bash y verificar el estado real del código — no asumir qué hay.
3. **Verificar balance de llaves** después de cada modificación con:
   ```bash
   node -e "const fs=require('fs');const c=fs.readFileSync('/mnt/user-data/outputs/peritia.jsx','utf8');let o=0,b=0;for(const x of c){if(x==='{')o++;if(x==='}')b++;}console.log('diff:',o-b);"
   ```
4. **El flujo de deploy es manual** — el usuario sube archivos a GitHub. Siempre indicar exactamente qué archivo(s) subir.
5. **Los Vercel MCP y Supabase MCP** están conectados y son funcionales para verificar deployments y BD.
6. **La extracción requiere créditos en Anthropic.** El usuario tiene ~$5 añadidos (suficiente para ~10 informes).
7. **Meteo XEMA:** nuevo proxy `pages/api/meteocat.js` (datos abiertos Socrata + geocodificación Nominatim). No requiere variables de entorno nuevas. Solo cubre Catalunya. Los datos se guardan en `s2.meteo` del informe. Helpers en Peritia.jsx: `esSiniestroAtmosferico`, `fetchMeteoXEMA`, `meteoSupera`, `MeteoTabla`, `meteoHTML`.

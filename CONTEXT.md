# PERIT.IA — CONTEXT.md
> Estado actual del proyecto y contexto acumulado. Actualizar al cerrar cada sesión.

**Última actualización:** 10 junio 2026 (sesión 5 — Mejoras en Anexos: drag & drop, PDFs, imágenes sin recorte)

---

## Estado actual

La app está **desplegada y funcional en producción**. El flujo completo funciona:
login → subida PDFs → extracción IA → editor → guardar → exportar PDF/Word.

La extracción de datos desde PDFs estaba rota tras la migración a Vercel (errores 400, 400 max_tokens, créditos insuficientes). Todos resueltos. Actualmente en pruebas reales con el usuario.

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

---

## Arquitectura del componente Peritia.jsx

```
Líneas: ~2.960 · Balance llaves: 0
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
  BAREMO[] — 22 partidas AXA 2025 (IVA=0%)
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
- [ ] Validar la frase de indemnización en los tres modos y con perceptor Particular/Reparador
- [ ] (Opcional) Ámbito fuera de Catalunya: integrar AEMET para el resto de España
- [ ] (Opcional) Sacar app token gratuito de Socrata si se llega a límites de peticiones

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

## Datos de referencia — Baremo AXA 2025

22 partidas con precio por m² o unidad. IVA siempre 0% en modo baremo.
Categorías: Pintura, Albañilería, Fontanería, Electricidad, Carpintería, Cristalería, Loza, Otros.

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

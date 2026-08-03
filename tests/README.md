# tests/ — Red de seguridad (Sprint 4, Fase 0)

Pruebas automatizadas del proyecto. Reglas del proyecto: toda regla de
negocio importante debe tener prueba, y todo error corregido debe generar
una prueba de regresión.

**Estado:** infraestructura creada en el Sprint 4 (Foundation Refactor,
Fase 0 — Safety Net). Cubre el motor de cálculo completo, extraído a
`lib/dominio/calculo.js` como librería independiente. No cubre la interfaz,
los proxys de API, ni la lógica meteorológica o de interpretación de IA que
se quedó en `components/Peritia.jsx` — deliberadamente fuera del alcance de
esta fase (ver `docs/migration/MIGRATION_MASTER_PLAN.md`, Fase 0, y la
decisión de alcance mínimo tomada durante esta fase, más abajo).

---

## Cómo ejecutar los tests

```bash
npm test              # ejecuta toda la batería una vez y termina
npm run test:watch    # modo interactivo: re-ejecuta al guardar un archivo
npm run test:coverage # ejecuta la batería y muestra el % de cobertura
```

Ejecutor: [Vitest](https://vitest.dev/). Configuración en `vitest.config.mjs`
(raíz del repositorio). No requiere navegador ni base de datos: las pruebas
importan `lib/dominio/calculo.js` directamente en Node y ejercitan sus
funciones exportadas con datos de entrada controlados.

---

## Qué cubre cada archivo

| Archivo | Qué prueba |
|---|---|
| `utilidades.test.js` | `fmt` (formato de importes), `parseCap` (interpretación de importes extraídos por IA), `norm` (normalización de texto) |
| `motor-calculo.test.js` | `calcPartida`, `resolvePartidas`, `getPartidas`, `sumRepos`/`sumIVA`/`sumReal`, `calcReglas`, `calcRegla`, `reglaPartida`, `sumAjustado`, `calcIndemnizacion`, `fraseIndemn` — el núcleo económico del sistema |
| `modulos-arquitectura.test.js` | `getModuloArq`, `getFactorArq`, `calcVPreexCont`, e integridad de `TABLAS_ARQ` |
| `matchbaremo.test.js` | `matchBaremo` en sus tres niveles de coincidencia, e integridad de `BAREMO` (47 partidas) |

---

## El motor de cálculo vive en `lib/dominio/calculo.js`

`components/Peritia.jsx` **no exporta nada** (salvo `export default function
App()`, como antes de este sprint). Las funciones puras del motor de cálculo
—y solo ellas— se extrajeron a `lib/dominio/calculo.js`, un módulo
independiente sin ningún vínculo con React, Supabase ni la API de Anthropic.
`Peritia.jsx` importa esas funciones desde ahí y las usa exactamente igual
que antes.

**Qué se movió** (19 funciones + 4 constantes de datos):
`BAREMO`, `PCT_INDIRECTO`, `TABLAS_ARQ`, `PROVINCIAS`, `getModuloArq`,
`getFactorArq`, `calcVPreexCont`, `fmt`, `norm`, `parseCap`, `calcPartida`,
`resolvePartidas`, `getPartidas`, `sumRepos`, `sumIVA`, `sumReal`,
`calcReglas`, `calcRegla`, `reglaPartida`, `sumAjustado`,
`calcIndemnizacion`, `fraseIndemn`, `matchBaremo`.

**Qué NO se movió, a propósito** (se quedó en `Peritia.jsx`, sin exportar):
`fmtE`, `fmtSmart`, `normCompania` (formateo de interfaz, no forman parte
del cálculo económico), `parseJSON`, `iaError` (interpretación de
respuestas de IA), `esSiniestroAtmosferico`, `causasMeteo`, `meteoSupera`
(verificación meteorológica), `COMPANIAS` (dato de interfaz, el desplegable
de aseguradoras). Ninguna de estas es, en sentido estricto, "el motor de
cálculo" — moverlas habría ampliado el alcance de esta fase más allá de lo
autorizado.

**Consecuencia de este alcance mínimo:** las 32 pruebas que en un primer
intento de esta fase cubrían `parseJSON`, `iaError`, `esSiniestroAtmosferico`,
`causasMeteo` y `meteoSupera` se han retirado (`interpretacion-ia.test.js`
y `meteo.test.js` ya no existen). Esas funciones dejaron de ser accesibles
desde fuera del archivo al revertirse su `export`, conforme a la instrucción
explícita de esta fase de no exportar nada desde `Peritia.jsx`. Quedan sin
cobertura hasta que una fase posterior decida extraerlas también (no está
autorizado hacerlo ahora).

**Verificación de que la extracción no cambia ningún comportamiento:** cada
línea de código de `lib/dominio/calculo.js` se comprobó, por script, que
existe de forma literal en la versión de `Peritia.jsx` anterior a esta
extracción — no se transcribió nada a mano. `next build` produce un
resultado idéntico antes y después.

---

## Qué NO cubre esta fase, a propósito

- **La interfaz** (los ~40 componentes de React). Probarla exigiría
  `@testing-library/react` y un entorno `jsdom`, fuera del alcance explícito
  de la Fase 0 (`docs/migration/MIGRATION_MASTER_PLAN.md`).
- **Los tres proxys de API** (`pages/api/claude.js`, `meteocat.js`,
  `catastro.js`). Requieren simular peticiones HTTP y servicios externos;
  se considera para una fase posterior.
- **La meteorología y la interpretación de respuestas de IA** — ver arriba.
- **Los "casos oráculo" históricos** (463,59 € y 1.291,47 €, citados en
  `CONTEXT.md` como validados por Pol). No existe en ningún documento del
  repositorio el detalle de los datos de entrada que producen esas cifras
  —solo el resultado final y una descripción muy general ("Empresa, obras
  reforma" / "Hogar, primer riesgo, IVA mixto")—, así que no se han podido
  reconstruir como test sin inventar los parámetros exactos. Los tests de
  `calcReglas`/`calcIndemnizacion` de este sprint verifican las mismas
  reglas (regla proporcional, primer riesgo, franquicia) con datos propios,
  verificables a mano, pero **no sustituyen** a una validación futura contra
  los casos oráculo reales si Pol puede aportar sus datos originales.

---

## Cobertura

Medida ahora sobre `lib/dominio/calculo.js` en solitario (no sobre
`Peritia.jsx` completo, que ya no contiene el motor de cálculo):

```
% Stmts   99.15
% Branch  93.44
% Funcs  100.00
% Lines  100.00
```

100 % de líneas y de funciones cubiertas. Las ramas sin cubrir (93,44 %) son,
sobre todo, combinaciones de argumentos por defecto poco frecuentes que no se
han considerado prioritarias para esta primera batería.

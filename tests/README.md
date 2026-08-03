# tests/ — Red de seguridad (Sprint 4, Fase 0)

Pruebas automatizadas del proyecto. Reglas del proyecto: toda regla de
negocio importante debe tener prueba, y todo error corregido debe generar
una prueba de regresión.

**Estado:** infraestructura creada en el Sprint 4 (Foundation Refactor,
Fase 0 — Safety Net). Cubre las funciones puras del motor de cálculo, sus
dependencias directas (módulos de arquitectura, emparejado de baremo) y la
lógica de verificación meteorológica. No cubre la interfaz ni los proxys de
API — deliberadamente fuera del alcance de esta fase (ver
`docs/migration/MIGRATION_MASTER_PLAN.md`, Fase 0).

---

## Cómo ejecutar los tests

```bash
npm test              # ejecuta toda la batería una vez y termina
npm run test:watch    # modo interactivo: re-ejecuta al guardar un archivo
npm run test:coverage # ejecuta la batería y muestra el % de cobertura
```

Ejecutor: [Vitest](https://vitest.dev/). Configuración en `vitest.config.mjs`
(raíz del repositorio). No requiere navegador ni base de datos: las pruebas
importan `components/Peritia.jsx` directamente en Node y ejercitan sus
funciones exportadas con datos de entrada controlados.

---

## Qué cubre cada archivo

| Archivo | Qué prueba |
|---|---|
| `utilidades.test.js` | `fmt`, `fmtE`, `fmtSmart` (formato de importes), `parseCap` (interpretación de importes extraídos por IA), `norm` (normalización de texto), `normCompania` |
| `motor-calculo.test.js` | `calcPartida`, `resolvePartidas`, `getPartidas`, `sumRepos`/`sumIVA`/`sumReal`, `calcReglas`, `calcRegla`, `reglaPartida`, `sumAjustado`, `calcIndemnizacion`, `fraseIndemn` — el núcleo económico del sistema |
| `modulos-arquitectura.test.js` | `getModuloArq`, `getFactorArq`, `calcVPreexCont`, e integridad de `TABLAS_ARQ` |
| `matchbaremo.test.js` | `matchBaremo` en sus tres niveles de coincidencia, e integridad de `BAREMO` (47 partidas) |
| `interpretacion-ia.test.js` | `parseJSON`, `iaError` — cómo se interpreta (o se rechaza) la respuesta de la IA |
| `meteo.test.js` | `esSiniestroAtmosferico`, `causasMeteo`, `meteoSupera` |

---

## Por qué las funciones bajo test están marcadas `export`

`components/Peritia.jsx` no exportaba, hasta este sprint, ninguna función
salvo el componente raíz (`export default function App()`). Sin exportar las
funciones puras no hay forma de importarlas desde un archivo de test —
JavaScript no permite acceder a bindings de módulo no exportados desde fuera.

Se ha añadido la palabra `export` delante de 27 funciones y 5 constantes de
datos (motor de cálculo, utilidades, catálogos de referencia). **Es el único
cambio hecho a `Peritia.jsx` en esta fase**: ninguna línea de lógica se ha
tocado, movido ni reescrito. Verificado con `git diff` línea a línea y con
`next build` antes y después, produciendo un resultado idéntico.

Este cambio es deliberadamente mínimo y no anticipa la Fase 2 del plan de
migración (extracción del motor de cálculo a su propio módulo en `lib/`):
las funciones siguen viviendo exactamente donde estaban, solo que ahora son
también accesibles desde fuera del archivo.

---

## Qué NO cubre esta fase, a propósito

- **La interfaz** (los ~40 componentes de React). Probarla exigiría
  `@testing-library/react` y un entorno `jsdom`, fuera del alcance explícito
  de la Fase 0 (`docs/migration/MIGRATION_MASTER_PLAN.md`).
- **Los tres proxys de API** (`pages/api/claude.js`, `meteocat.js`,
  `catastro.js`). Requieren simular peticiones HTTP y servicios externos;
  se considera para una fase posterior.
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

`npm run test:coverage` mide sobre el archivo completo (4.413 líneas), así
que el porcentaje global es bajo por diseño: la inmensa mayoría del archivo
es interfaz, fuera del alcance de esta fase. La cifra que importa es la del
bloque de datos, utilidades, motor de cálculo y verificación meteorológica
(aproximadamente las primeras 460 líneas): **80,4 % de líneas cubiertas**
en ese bloque a fecha de cierre de esta fase.

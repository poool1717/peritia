# `core/` — el núcleo puro de PERIT.IA

## Qué es esto, en cristiano

Piensa en la app como un edificio. Hasta ahora, los **cálculos** (cuánto vale
una reparación, cuánto se indemniza, cómo se aplica el infraseguro) estaban
mezclados con la **decoración**: botones, pantallas, colores. Todo en el mismo
archivo, `components/Peritia.jsx`, 4.400 líneas.

El problema no es la estética. Es que para comprobar si un cálculo está bien
había que **abrir la app, iniciar sesión, subir un PDF y mirar el resultado a
ojo**. Cada vez. Y si algo cambiaba sin querer, nadie se enteraba hasta que un
perito veía un número raro en un informe real.

`core/` es la **estructura** separada de la decoración. Aquí vive solo el
cálculo: sin pantallas, sin internet, sin base de datos. Eso permite que un
ordenador compruebe los números **solo, en dos segundos, en cada cambio**.

## Qué hay en cada archivo

| Archivo | Qué contiene |
|---|---|
| `formato.mjs` | Cómo se escriben los números y los euros, y cómo se leen las cifras que extrae la IA de un PDF |
| `baremo.mjs` | El baremo de precios de reparación y la búsqueda de la partida que corresponde a cada daño |
| `valoracion.mjs` | Módulos de arquitectura 2025 por provincia: cuánto vale construir un m². Incluye `findProvincia`, que reconoce la provincia venga como venga escrita |
| `calculo.mjs` | Partidas, costes indirectos, reglas proporcionales por infraseguro e indemnización final |
| `catalogos.mjs` | Compañías, tipos de uso y de garantía, y la normalización del nombre comercial |
| `ia.mjs` | Cómo se lee lo que devuelve la IA y cómo se detecta que no ha servido |
| `meteo.mjs` | Reglas de la verificación XEMA: si el siniestro es atmosférico y si se superan los umbrales de la póliza |
| `progreso.mjs` | Qué falta por rellenar en cada sección — el semáforo y el panel "Pendientes" |
| `index.mjs` | La única puerta de entrada. `Peritia.jsx` importa siempre desde aquí |

## Reglas de esta carpeta

1. **Nada de React, ni `fetch`, ni Supabase, ni `window`.** Si algo de eso hace
   falta, ese código no pertenece a `core/`, pertenece a `Peritia.jsx`.
2. **Todo lo que se exporta desde aquí tiene que tener test** en `tests/`.
3. **Cambiar un número del baremo o una fórmula es cambiar dinero real.**
   Si un test se pone en rojo, la primera pregunta no es "¿cómo arreglo el
   test?" sino "¿qué expediente acabo de cambiar sin querer?".

## Cómo comprobar que todo sigue bien

```bash
npm test
```

Tarda dos segundos (108 tests). Si sale todo en verde, el núcleo de cálculo se comporta
exactamente igual que antes. Si sale algo en rojo, dice qué fórmula ha cambiado
y qué valor esperaba.

GitHub lo ejecuta solo en cada Pull Request (`.github/workflows/ci.yml`), así
que nada llega a producción sin pasar por aquí.

## De dónde sale este código

Se extrajo de `components/Peritia.jsx` **sin cambiar la lógica**, moviendo los
bloques tal cual. La única corrección deliberada fue el fallo de `parseCap` con
el símbolo de euro (ver `tests/formato.test.mjs`). Esto corresponde a las
Fases 1 y 3 del plan de migración: red de seguridad y extracción del núcleo
puro, antes de tocar la interfaz.

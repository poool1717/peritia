# PERIT_EXPERT_SYSTEM.md — Especificación Oficial del Sistema Experto de PERIT.IA

> **Estado: EN CONSTRUCCIÓN.** Este documento es el "North Star" del
> proyecto: prevalece sobre cualquier decisión futura que entre en
> conflicto con él. Toda implementación futura debe alinearse con esta
> especificación.
>
> **Autoría y proceso editorial.** El contenido arquitectónico de cada
> sección lo redacta el Arquitecto Principal, externo a esta sesión de
> Claude Code. Claude Code participa como Lead Software Engineer —revisor
> técnico activo, no solo integrador—, evaluando cada bloque contra cinco
> criterios obligatorios:
>
> 1. **DDD** — límites de contexto, entidad vs. value object, agregados.
> 2. **Sistemas expertos / ingeniería del conocimiento** — reglas
>    declarativas y explicables, trazabilidad, nivel de confianza.
> 3. **Coherencia con KP-01/KP-02/KP-03** — contra el código real ya
>    construido y probado en `lib/knowledge/` (Knowledge Core, Coverage
>    Engine, Reasoning Model), no contra la intención.
> 4. **Redundancia y huecos** — conceptos solapados, relaciones cojas.
> 5. **Escalabilidad y evolución del conocimiento** — ¿el diseño sigue
>    siendo válido con decenas de miles de `KU`? ¿permite incorporar
>    ramos, aseguradoras, países, normativas y procedimientos nuevos sin
>    tocar código? ¿está orientado a datos y conocimiento, o desplaza
>    decisiones hacia el código? ¿puede mantenerlo un experto del dominio
>    sin conocimientos técnicos? ¿respeta que el conocimiento debe poder
>    evolucionar más rápido que el software? Se señala aunque la propuesta
>    funcione correctamente hoy — el objetivo no es solo verificar
>    consistencia puntual, es proteger la arquitectura del sistema
>    experto a varios años vista.
>
> Se señalan inconsistencias, redundancias, huecos del modelo y decisiones
> débiles con argumento técnico, y se proponen entidades o relaciones
> cuando faltan. Ningún contenido aprobado se modifica sin indicarlo
> explícitamente y sin acuerdo de quien lo redactó — discrepar se hace en
> la conversación, no reescribiendo el texto en silencio. Además se
> mantiene el archivo: se crea y actualiza el índice, se inserta cada
> bloque de forma literal salvo acuerdo explícito de cambio, se verifican
> referencias internas y numeración, y se generan los diagramas Mermaid
> que el propio texto describa.
>
> **Iniciado:** 4 de agosto de 2026 · Sprint 5

---

## Índice

_Pendiente — se completa a medida que se reciben las secciones._

---

## Registro de integración

Tabla de control para esta sesión: qué se ha recibido, cuándo, y qué
verificaciones se han hecho sobre cada bloque.

| # | Sección | Recibida | Verificación de coherencia | Notas |
|---|---|---|---|---|
| — | _(sin secciones todavía)_ | — | — | — |

---

<!-- A partir de aquí se insertan literalmente los bloques recibidos,
     en el orden en que completan el índice. No editar el contenido de
     cada bloque salvo corrección de numeración/referencias ya acordada
     con quien lo redactó. -->

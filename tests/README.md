# tests/

Pruebas automatizadas del proyecto.

Reglas del proyecto: toda regla de negocio importante debe tener prueba, y todo
error corregido debe generar una prueba de regresión.

**Estado actual: vacía y sin infraestructura.** `package.json` no declara ningún
script `test` ni ninguna dependencia de desarrollo; no hay ejecutor de pruebas
instalado ni integración continua en el repositorio. Toda la verificación es hoy
manual, contra dos casos oráculo de cálculo (463,59 € y 1.291,47 €) validados por
Pol y registrados en `CONTEXT.md`.

Instalar un ejecutor de pruebas es un cambio en `package.json` — un archivo
existente — y por tanto requiere aprobación previa. Ver `docs/REFACTOR_BACKLOG.md`,
ficha R-01.

# knowledge/rules/

Reglas de negocio en formato **consumible por un motor de reglas**: condición
→ acción, con su ámbito de aplicación (ramo, garantía, aseguradora) y su
referencia a la regla narrativa de la que proceden.

Distinto de `docs/domain/BUSINESS_RULES.md` (Sprint 1), que documenta las
reglas en prosa para lectura humana, clasificadas por su grado de certeza
(`[Verificada]` / `[Dominio]` / `[Abierta]`). Esta carpeta es su
traducción a una forma estructurada y evaluable automáticamente —el
puente entre la regla de negocio y su aplicación por software, sea un motor
de reglas explícito o una validación de esquema (ver
`docs/REFACTOR_BACKLOG.md`, R-09, diferida).

Vacía. No debe cargarse ninguna regla aquí que no tenga ya su contraparte
narrativa `[Verificada]` o `[Dominio]` en `docs/domain/BUSINESS_RULES.md` —
una regla `[Abierta]` no debe convertirse en regla ejecutable sin resolver
antes la pregunta que la mantiene abierta.

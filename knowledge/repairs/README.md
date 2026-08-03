# knowledge/repairs/

Catálogo de métodos de reparación (`Repair`, ver
`docs/domain/entities/REPAIR.md`): el equivalente estructurado y consultable
del `BAREMO` incrustado hoy en `components/Peritia.jsx` (47 partidas por
oficio, unidad y precio), más la relación de cada método con los tipos de
daño que resuelve (ver `knowledge/ontology/ONTOLOGY.md`, relación *Daño →
puede repararse mediante → Método*).

Sin carpeta equivalente en Sprint 0 — el baremo nunca se documentó allí como
catálogo, solo se auditó su ubicación en el código (`docs/TECHNICAL_DEBT.md`,
DT-06).

Vacía. El diseño de qué campos debe tener cada ficha de método de reparación
está en `knowledge/catalogs/CATALOGS.md`. Depende de resolver antes
`docs/OPEN_QUESTIONS.md`, P-01 (origen y vigencia del baremo).

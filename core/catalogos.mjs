// ─────────────────────────────────────────────────────────────────────────────
// Catálogos del dominio pericial
// Núcleo puro: sin React, sin red, sin acceso a base de datos. Se puede
// ejecutar y testear con `node --test`. Extraído de components/Peritia.jsx
// sin cambiar la lógica (ver core/README.md).
// ─────────────────────────────────────────────────────────────────────────────

export const COMPANIAS = ["AXA Seguros","Mapfre","Allianz","Generali","Zurich","Helvetia","Mutua Madrileña","Caser","Reale","Santalucía","Pelayo","BBVA Seguros","Catalana Occidente","Línea Directa"];
// AXA aparece en los documentos con muchos nombres (AXA, AXA Seguros, AXA Seguros Generales SA…);
// el nombre comercial en el informe debe ser siempre "AXA Seguros".
export const normCompania = c => /\bAXA\b/i.test(String(c||"")) ? "AXA Seguros" : (c||"");
export const TIPOS_USO = ["Hotel / Apart-hotel","Hostal / Pensión","Local comercial","Oficinas","Vivienda unifamiliar","Piso / Apartamento","Comunidad de propietarios","Industria / Nave","Restaurante / Bar","Otro"];
export const TIPOS_GARANTIA = ["Continente","Contenido","Terceros implicados"];

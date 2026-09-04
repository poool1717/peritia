// ─────────────────────────────────────────────────────────────────────────────
// Formato y normalización de texto y números
// Núcleo puro: sin React, sin red, sin acceso a base de datos. Se puede
// ejecutar y testear con `node --test`. Extraído de components/Peritia.jsx
// sin cambiar una coma de la lógica (ver core/README.md).
// ─────────────────────────────────────────────────────────────────────────────

export const fmt  = n => new Intl.NumberFormat("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2}).format(+n||0);
export const fmtE = n => `${fmt(n)} €`;
// Unidades y porcentajes: sin decimales si el valor es entero (p.ej. "3" o "21%"
// en vez de "3,00"/"21,00%"); con 2 decimales solo si de verdad los tiene.
export const fmtSmart = n => { const v=+n||0; return Number.isInteger(v) ? new Intl.NumberFormat("es-ES").format(v) : fmt(v); };

// Normaliza texto para comparar: sin tildes, en minúsculas y sin espacios
// sobrantes. "Daños por agua" y "DANOS  POR AGUA" pasan a ser iguales.
export const norm = s => String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"")
  .toLowerCase().replace(/\s+/g," ").trim();

// Normaliza valores monetarios extraídos por IA (6.000,00 → 6000 | 6000.00 → 6000)
export const parseCap = v => {
  if(!v && v!==0) return 0;
  // Se quitan primero el símbolo de moneda y los espacios (incluido el espacio
  // duro que meten muchos PDFs). Antes no se hacía, así que "6.000,00 €" no
  // encajaba con el patrón español de abajo, caía al caso genérico y devolvía
  // 6 en vez de 6000: el capital asegurado quedaba a 6 € y la regla
  // proporcional daba un infraseguro falso del 99,9%.
  const s = String(v).replace(/[€$\s ]/g, "").trim();
  // Spanish format: 6.000,00
  if(/^[\d.]+,\d{1,2}$/.test(s)) return parseFloat(s.replace(/\./g,"").replace(",","."));
  // Remove all non-numeric except dot/comma, then parse
  const clean = s.replace(/[^0-9.,]/g,"").replace(",",".");
  return parseFloat(clean)||0;
};


// ─── SUPABASE CLIENT ─────────────────────────────────────────────────────────
// La base de datos a la que apunta la app llega por variable de entorno, para
// que el entorno de test (rama `test` y previews de Vercel) escriba en su
// propia base y no en la de producción. Si no hay variables definidas se cae a
// producción, que es el comportamiento que había antes de separarlas.
// Ojo: en Next.js estas variables se resuelven al compilar, no al ejecutar —
// hay que escribir `process.env.NEXT_PUBLIC_X` literal, no por índice.

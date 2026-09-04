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
  // Primero se aísla la cifra del texto que la rodea, y solo después se decide
  // si está en formato español o anglosajón.
  //
  // Por qué: los importes no llegan limpios. Una póliza real escribe
  // "6.000,00 euros" con la palabra entera, un encargo escribe "6.000,00 €",
  // y un PDF mete espacios duros. Cuando ese texto sobraba, la cifra no
  // encajaba con el patrón español de abajo, caía al caso genérico y
  // "1.388.139,45 euros" se convertía en 1,388. Con un capital así la regla
  // proporcional inventa un infraseguro del 99,9 % y la indemnización
  // propuesta se desploma, sin ningún mensaje de error.
  //
  // Se coge el grupo de dígitos MÁS LARGO de la cadena, no el primero, para
  // que un "Pág. 11: 6.000,00 euros" siga dando 6000 y no 11.
  const trozos = String(v).match(/-?\d[\d.,\s\u00A0\u202F]*\d|-?\d/g);
  if(!trozos) return 0;
  const s = trozos
    .map(t => t.replace(/[\s\u00A0\u202F]/g, ""))
    .reduce((a, b) => (b.replace(/\D/g, "").length > a.replace(/\D/g, "").length ? b : a));
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

// Fecha y hora de última modificación, como se ve en el dashboard.
export const fmtUpdated = v => {
  if(!v) return "";
  const d = new Date(v);
  if(isNaN(d)) return "";
  return d.toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"})+" "+d.toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"});
};

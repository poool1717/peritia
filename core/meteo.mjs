// ─────────────────────────────────────────────────────────────────────────────
// Reglas meteorológicas (verificación XEMA)
// Núcleo puro: sin React, sin red, sin acceso a base de datos. Se puede
// ejecutar y testear con `node --test`. Extraído de components/Peritia.jsx
// sin cambiar la lógica (ver core/README.md).
// ─────────────────────────────────────────────────────────────────────────────

// Solo las REGLAS. La llamada al proxy /api/meteocat se queda en la interfaz,
// porque hace red y por tanto no es núcleo puro.

// Detecta si el siniestro es de tipo atmosférico (viento, lluvia, pedrisco, nieve…)
// Solo se considera atmosférico (y se muestra la verificación XEMA) cuando la
// GARANTÍA AFECTADA es Atmosféricos o Riesgos Extensivos (criterio del perito).
export const esSiniestroAtmosferico = enc => {
  const g = `${enc?.garantia||""} ${enc?.coberturaInferida||""}`.toLowerCase();
  return /atmosf|extensiv|rgext/.test(g);
};
// Causas atmosféricas presentes según el encargo (para evaluar el umbral correcto)
export const causasMeteo = enc => {
  const t = `${enc?.causa||""} ${enc?.descripcionSiniestro||""} ${enc?.garantia||""}`.toLowerCase();
  return {
    viento:   /viento|vent\b|r[aá]fag|ratxa|temporal|vendaval/.test(t),
    lluvia:   /lluvia|pluja|precipitaci|agua de lluvia|inundaci|tromba/.test(t),
    pedrisco: /pedrisco|granizo|calamarsa/.test(t),
  };
};

// ¿Los valores medidos superan los umbrales de la póliza? Se evalúa SOLO el
// umbral correspondiente a la causa del siniestro (viento / lluvia / pedrisco).
export const meteoSupera = (m, enc) => {
  const c = causasMeteo(enc);
  const anyCausa = c.viento||c.lluvia||c.pedrisco;
  const uv = parseFloat(enc?.umbralViento)||0, ul = parseFloat(enc?.umbralLluvia)||0;
  const evalViento = (anyCausa? c.viento : true) && uv>0;
  const evalLluvia = (anyCausa? (c.lluvia||c.pedrisco) : true) && ul>0;
  const sv = evalViento && (m?.rachaMax>=uv);
  const sl = evalLluvia && (m?.precipMaxHoraria>=ul);
  let label = "—";
  if(evalViento||evalLluvia) label = sv&&sl?"Sí (viento y lluvia)":sv?"Sí (viento)":sl?"Sí (lluvia)":"No";
  return {sv, sl, label, hayUmbral:(evalViento||evalLluvia)};
};

// ─────────────────────────────────────────────────────────────────────────────
// Lectura de las respuestas de la IA
// Núcleo puro: sin React, sin red, sin acceso a base de datos. Se puede
// ejecutar y testear con `node --test`. Extraído de components/Peritia.jsx
// sin cambiar la lógica (ver core/README.md).
// ─────────────────────────────────────────────────────────────────────────────

export const parseJSON = txt => {
  const patterns = [/```json\s*([\s\S]*?)```/,/```([\s\S]*?)```/,/([\s\S]*)/];
  for(const p of patterns){
    const m=txt.match(p);
    if(m){try{return JSON.parse(m[1]||m[0]);}catch{}}
  }
  // No se pudo interpretar como JSON: lo marcamos en vez de devolver {} en
  // silencio, para que quien llama pueda avisar al usuario.
  return {_parseError:true};
};

// Devuelve un mensaje para el usuario si la respuesta de la IA no es usable,
// o null si es válida. Cubre errores de API y respuestas no interpretables.
export const iaError = parsed => {
  if(!parsed || typeof parsed!=="object") return "La IA no devolvió una respuesta válida.";
  if(parsed._apiError) return `Error de la API de IA (${parsed._status||"?"}): ${parsed._msg||"sin detalle"}.`;
  if(parsed._parseError) return "La IA devolvió una respuesta que no se pudo interpretar. Vuelve a intentarlo.";
  return null;
};

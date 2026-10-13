// ─────────────────────────────────────────────────────────────────────────────
// Trazabilidad de las extracciones de la IA (I-10)
//
// Capa de dominio pura: sin React ni red. Se prueba en tests/trazabilidadIA.test.js.
//
// Para validar PERIT.IA con expedientes reales hay que poder comparar lo que
// propuso la IA con lo que dejó el perito. Antes, lo extraído se sobrescribía
// con las correcciones y no quedaba rastro.
//
// Qué se conserva (solo extracciones estructuradas; los textos que la IA
// "mejora" son borradores que el perito aplica o no, y quedan fuera):
//
//   encargo.trazaIA — al crear el expediente desde el PDF del encargo
//     { version, fecha, modelo,
//       documentos: { encargo: {nombre, tamano, sha256}, poliza: {…} | null },
//       encargoIA:  JSON tal como lo devolvió la IA para el encargo,
//       polizaIA:   JSON tal como lo devolvió la IA para la póliza (o null),
//       propuesta:  los campos del encargo que se enseñaron al perito para
//                   revisar, ya combinados (antes de cualquier corrección) }
//
//   s3.trazaIA.extracciones — cada "Extraer tabla" (facturas/presupuestos)
//   y cada "Generar tabla" (baremo) que llegó a aplicarse
//     [{ version, tipo: "facturas" | "baremo", fecha, modelo,
//        documentos: [{id, nombre, url}],   // facturas: ya están en Storage
//        partidas: [...],                   // tal como las propuso la IA
//        aplicada: true | false }]          // false: no sustituyó la tabla porque
//                                           // el perito la cambió durante la espera (P-28)
//
// Los documentos NO se duplican: el encargo y la póliza se identifican por su
// huella (nombre, tamaño y SHA-256), con la que se localiza el original en la
// carpeta del expediente; las facturas, por su dirección en Storage.
// Todo vive en las columnas JSON que ya existen: no hace falta migración.
// ─────────────────────────────────────────────────────────────────────────────

export const VERSION_TRAZA = 1;
export const MAX_EXTRACCIONES = 10; // por expediente; se descartan las más antiguas

// Campos de una partida que se comparan entre la IA y el resultado final.
export const CAMPOS_PARTIDA = ["oficio", "desc", "uds", "p", "iva", "ivaOn", "depr", "pctDepr", "garantia", "perceptor", "cobertura", "indirecto"];

const pick = (obj, campos) => Object.fromEntries(campos.filter(c => obj?.[c] !== undefined).map(c => [c, obj[c]]));

// Huella de un documento. `digest(buffer)` devuelve el SHA-256 en hexadecimal
// (en el navegador, con crypto.subtle). Si no se puede calcular, sha256 = null.
export const huellaDocumento = async (archivo, digest) => {
  if (!archivo) return null;
  let sha256 = null;
  try { if (digest && archivo.arrayBuffer) sha256 = await digest(await archivo.arrayBuffer()); } catch { sha256 = null; }
  return { nombre: archivo.name || "", tamano: archivo.size ?? null, sha256 };
};

export const registroExtraccionEncargo = ({ fecha, modelo, documentos, encargoIA, polizaIA, propuesta, campos }) => ({
  version: VERSION_TRAZA, fecha, modelo,
  documentos: { encargo: documentos?.encargo || null, poliza: documentos?.poliza || null },
  encargoIA: encargoIA || null,
  polizaIA: polizaIA && Object.keys(polizaIA).length ? polizaIA : null,
  propuesta: pick(propuesta || {}, campos || Object.keys(propuesta || {})),
});

export const registroExtraccionPartidas = ({ tipo, fecha, modelo, documentos, partidas }) => ({
  version: VERSION_TRAZA, tipo, fecha, modelo,
  documentos: (documentos || []).map(d => ({ id: d.id, nombre: d.name ?? d.nombre ?? "", url: d.url || null })),
  partidas: (partidas || []).map(p => ({ id: p.id, ...pick(p, CAMPOS_PARTIDA) })),
});

export const anadirExtraccion = (traza, registro, max = MAX_EXTRACCIONES) => {
  const previas = traza?.extracciones || [];
  return { ...(traza || {}), extracciones: [...previas, registro].slice(-max) };
};

// ── Comparación (para el análisis posterior; no hay pantalla todavía) ───────

const igual = (a, b) => {
  if (typeof a === "number" || typeof b === "number") {
    const na = Number(a), nb = Number(b);
    if (Number.isFinite(na) && Number.isFinite(nb)) return na === nb;
  }
  return String(a ?? "").trim() === String(b ?? "").trim();
};

// ¿Qué campos del encargo cambió el perito respecto a lo que propuso la IA?
export const compararEncargo = (propuesta = {}, final = {}, campos) =>
  (campos || Object.keys(propuesta || {}))
    .filter(c => !igual(propuesta?.[c], final?.[c]))
    .map(c => ({ campo: c, ia: propuesta?.[c] ?? null, final: final?.[c] ?? null }));

// Partidas de la IA frente a la tabla final, emparejadas por id.
export const compararPartidas = (iaPartidas = [], finales = []) => {
  const fin = new Map((finales || []).map(p => [p.id, p]));
  const ids = new Set((iaPartidas || []).map(p => p.id));
  const modificadas = [], sinCambios = [], eliminadas = [];
  for (const ia of iaPartidas || []) {
    const f = fin.get(ia.id);
    if (!f) { eliminadas.push(ia.id); continue; }
    const cambios = {};
    for (const c of CAMPOS_PARTIDA) if (!igual(ia[c], f[c])) cambios[c] = { ia: ia[c] ?? null, final: f[c] ?? null };
    if (Object.keys(cambios).length) modificadas.push({ id: ia.id, cambios }); else sinCambios.push(ia.id);
  }
  const anadidas = (finales || []).filter(p => !ids.has(p.id)).map(p => p.id);
  return { totalIA: (iaPartidas || []).length, sinCambios, modificadas, eliminadas, anadidas };
};

// Resumen de un expediente: lo que propuso la IA frente al estado actual.
// `camposEncargo` son los campos revisables del encargo.
export const resumenTrazabilidad = (caso, camposEncargo) => {
  const te = caso?.encargo?.trazaIA;
  // La última propuesta que llegó a la tabla. Las no aplicadas (P-28: el
  // perito había cambiado la tabla mientras la IA trabajaba) quedan en el
  // historial, pero no son el origen de la tabla actual.
  const ultima = (caso?.s3?.trazaIA?.extracciones || []).filter(e => e.aplicada !== false).slice(-1)[0] || null;
  return {
    encargo: te ? compararEncargo(te.propuesta, caso.encargo, camposEncargo || Object.keys(te.propuesta || {})) : null,
    partidas: ultima ? { tipo: ultima.tipo, fecha: ultima.fecha, ...compararPartidas(ultima.partidas, caso?.s3?.partidas || []) } : null,
  };
};

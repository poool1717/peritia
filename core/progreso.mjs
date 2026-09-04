// ─────────────────────────────────────────────────────────────────────────────
// Qué falta por rellenar en cada sección (semáforo y bloques)
// Núcleo puro: sin React, sin red, sin acceso a base de datos. Se puede
// ejecutar y testear con `node --test`. Extraído de components/Peritia.jsx
// sin cambiar la lógica (ver core/README.md).
// ─────────────────────────────────────────────────────────────────────────────

import { parseCap } from './formato.mjs';
import { esSiniestroAtmosferico } from './meteo.mjs';

// Estado (completo/pendiente) de cada bloque "Datos del perito" por sección,
// como array de booleanos — una función pura por sección, reutilizada tanto
// por el prop `done` de cada <Block> como por el semáforo de navegación de la
// topbar (que solo tiene cData, no el estado interno de cada componente de
// sección). Mantenerlas en un solo sitio evita que las dos lecturas diverjan.
export const encargoBlockStates = enc => [
  !!(enc.compania&&enc.numReferencia),
  !!(enc.asegurado&&enc.lugarIntervencion),
  parseCap(enc.capitalContinente)>0,
];
export const s1BlockStates = (data,enc) => {
  const capCont = data.capContOverride!=null ? parseCap(data.capContOverride) : parseCap(enc.capitalContinente);
  return [
    !!data.estado,
    !!(data.superficieConstruida&&data.tipoArqKey),
    capCont>0,
  ];
};
export const s2BlockStates = (data,enc) => {
  const states = [!!(data.textoRaw||data.textoAI)];
  if(esSiniestroAtmosferico(enc)) states.push(!!data.meteo);
  return states;
};
export const s3BlockStates = data => {
  const modoVal = data.modoValoracion||"baremo";
  const docMode = modoVal==="presupuesto"||modoVal==="factura";
  return [
    !!(data.textoRaw||data.textoAI),
    modoVal==="baremo" ? (data.partidas?.length>0) : (docMode&&!!data.perceptorTipo),
  ];
};
export const s4BlockStates = data => [
  !!data.textoIntro,
  !!data.descripcionCobertura,
];
export const anexosBlockStates = (anexos,s3) => {
  const a = anexos||{};
  return [
    !!a.fotos?.length,
    !!a.catastro?.length,
    !!a.meteosim?.length,
    !!(a.facturas?.length||s3?.facturas?.length),
  ];
};
// Verde: todo completo · Rojo: nada relleno (o algún bloque en estado "error",
// cuando exista esa validación) · Naranja: mezcla. "error" no lo produce hoy
// ningún bloque real — no hay validación de campos inválidos en la app — pero
// semaforoFromStates ya lo entiende si se añade en el futuro.
export const semaforoFromStates = states => {
  if(states.some(st=>st==="error")) return "red";
  if(!states.length) return "orange";
  const doneCount = states.filter(st=>st===true).length;
  if(doneCount===states.length) return "green";
  if(doneCount===0) return "red";
  return "orange";
};

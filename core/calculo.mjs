// ─────────────────────────────────────────────────────────────────────────────
// Cálculo de partidas, reglas proporcionales e indemnización
// Núcleo puro: sin React, sin red, sin acceso a base de datos. Se puede
// ejecutar y testear con `node --test`. Extraído de components/Peritia.jsx
// sin cambiar una coma de la lógica (ver core/README.md).
// ─────────────────────────────────────────────────────────────────────────────

import { fmt, parseCap } from './formato.mjs';
import { PCT_INDIRECTO } from './baremo.mjs';
import { findProvincia, calcVPreexCont } from './valoracion.mjs';

// ─── CÁLCULO DE PARTIDAS (fuente única de verdad) ────────────────────────────
// Baremo: sin IVA (iva=0). Factura/presupuesto: IVA del documento.
// V.Real = V.Repos × (1 − Depr%) + IVA €
export const calcPartida = p => {
  const vRepos = (p.uds||1)*(p.p||0);
  const ivaAmt = vRepos*((p.iva??0)/100);
  const vReal  = vRepos*(1-(p.depr?(p.pctDepr||0):0)/100)+ivaAmt;
  return {vRepos, ivaAmt, vReal};
};
// Resuelve el importe de las partidas de "costes indirectos" (indirecto:true):
// su precio = PCT_INDIRECTO % del subtotal de reposición de las demás partidas.
export const resolvePartidas = rows => {
  const baseRepos = rows.filter(p=>!p.indirecto).reduce((a,p)=>a+(p.uds||1)*(p.p||0),0);
  return rows.map(p=>p.indirecto?{...p,uds:1,p:+(baseRepos*PCT_INDIRECTO/100).toFixed(2)}:p);
};
// Partidas activas (con cobertura), con costes indirectos ya calculados. Fuente única: s3.partidas
export const getPartidas = s3 => resolvePartidas((s3?.partidas||[]).filter(p=>p.cobertura!==false));
export const sumRepos = rows => rows.reduce((a,p)=>a+(p.uds||1)*(p.p||0),0);
export const sumIVA   = rows => rows.reduce((a,p)=>a+calcPartida(p).ivaAmt,0);
export const sumReal  = rows => rows.reduce((a,p)=>a+calcPartida(p).vReal,0);
// Reglas proporcionales por bloque (continente / contenido)
//   regla = capital asegurado / valor preexistente  (solo si hay infraseguro)
export const calcReglas = (enc, s1) => {
  enc=enc||{}; s1=s1||{};
  const prov = findProvincia(enc.provincia);
  const arqKey = s1.tipoArqKey || "unif_aislada";
  const primerRiesgo = !!enc.primerRiesgo;
  // Continente
  const capCont = parseCap(s1.capContOverride!=null?s1.capContOverride:enc.capitalContinente);
  const vPreexCalc = calcVPreexCont(s1.superficieConstruida, prov?.v||"00", arqKey, s1.calidad||"Media");
  const vPreexCont = primerRiesgo ? capCont : vPreexCalc;
  const reglaCont = (!primerRiesgo && vPreexCont>0 && capCont>0 && capCont<vPreexCont) ? (capCont/vPreexCont) : 1;
  // Contenido
  const capCont2 = parseCap(s1.capCont2Override!=null?s1.capCont2Override:enc.capitalContenido);
  const vPreexContenido = s1.vPreexContenido!=null?parseCap(s1.vPreexContenido):capCont2;
  const reglaContenido = (vPreexContenido>0 && capCont2>0 && capCont2<vPreexContenido) ? (capCont2/vPreexContenido) : 1;
  return {continente:reglaCont, contenido:reglaContenido, capCont, vPreexCont, capCont2, vPreexContenido,
    infraCont:(reglaCont<1)?((vPreexCont-capCont)/vPreexCont*100):0,
    infraContenido:(reglaContenido<1)?((vPreexContenido-capCont2)/vPreexContenido*100):0};
};
// Compat: regla del continente (callers antiguos)
export const calcRegla = (enc, s1) => calcReglas(enc, s1).continente;
// Regla efectiva de una partida según su garantía y si el bloque tiene la regla activada
export const reglaPartida = (p, reglas, s3) => {
  const isCont = (p.garantia||"continente")==="contenido";
  const on = isCont ? !!s3?.reglaContenido : !!s3?.reglaContinente;
  return on ? (isCont?reglas.contenido:reglas.continente) : 1;
};
// Valor ajustado total (Σ V.Real × regla por partida) e indemnización
export const sumAjustado = (enc, s1, s3) => {
  const reglas = calcReglas(enc, s1);
  return getPartidas(s3).reduce((a,p)=>a+calcPartida(p).vReal*reglaPartida(p,reglas,s3),0);
};
export const calcIndemnizacion = (enc, s1, s3) => Math.max(0, sumAjustado(enc,s1,s3)-parseCap(s3?.franquiciaVal||enc?.franquicia));
// Frase de indemnización según modo de valoración y perceptor (asegurado/perjudicado/reparador)
export const fraseIndemn = (s3, indemn) => {
  const modo = s3?.modoValoracion||"baremo";
  if(modo==="baremo") return "";
  const eur = fmt(indemn)+" €";
  const perceptor = {reparador:"Reparador",perjudicado:"Perjudicado"}[s3?.perceptorTipo]||"Asegurado";
  if(s3?.perceptorTipo==="reparador") return `Se propone indemnización de la siguiente manera:\nINDEMNIZACION:\n${perceptor}: ${eur}`;
  if(modo==="presupuesto") return `A la espera de aportación de la factura, se propone indemnización a valor real sin IVA de la siguiente manera:\nINDEMNIZACION:\n${perceptor}: ${eur}`;
  return `Se propone indemnización de la siguiente manera:\nINDEMNIZACION:\n${perceptor}: ${eur} (IVA incl.)`;
};

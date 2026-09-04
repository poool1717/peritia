// ─────────────────────────────────────────────────────────────────────────────
// Baremo de reparaciones y emparejamiento de partidas
// Núcleo puro: sin React, sin red, sin acceso a base de datos. Se puede
// ejecutar y testear con `node --test`. Extraído de components/Peritia.jsx
// sin cambiar una coma de la lógica (ver core/README.md).
// ─────────────────────────────────────────────────────────────────────────────

import { norm } from './formato.mjs';

// Baremo de reparaciones (precios base sin IVA). Campos:
//   oficio · desc (partida) · u (unidad) · p (precio base €) · rend (rendimiento ud/h)
//   dano (tipo de daño) · cond (condición de activación) · det (descripción)
// La partida "Costos indirectos" lleva indirecto:true → su importe = 8% del subtotal.
export const BAREMO = [
  // ── ALBAÑILERÍA ──
  {oficio:"ALBAÑILERÍA",desc:"Demolición de pavimento existente",u:"m²",p:18,rend:8,dano:"Sustitución de baldosa",cond:"Siempre",det:"Retirada de pavimento hasta soporte"},
  {oficio:"ALBAÑILERÍA",desc:"Demolición de revestimiento vertical",u:"m²",p:16,rend:7,dano:"Humedad",cond:"Si hay azulejo",det:"Picado de azulejo en paredes"},
  {oficio:"ALBAÑILERÍA",desc:"Picado de enlucido",u:"m²",p:12,rend:10,dano:"Humedad",cond:"Siempre",det:"Retirada de yeso deteriorado"},
  {oficio:"ALBAÑILERÍA",desc:"Repicado y saneado",u:"m²",p:14,rend:8,dano:"Humedad",cond:"Siempre",det:"Saneado por humedad"},
  {oficio:"ALBAÑILERÍA",desc:"Enlucido con mortero",u:"m²",p:18,rend:6,dano:"Humedad / Rotura de tubería",cond:"Siempre",det:"Regularización de superficies"},
  {oficio:"ALBAÑILERÍA",desc:"Formación de pavimento",u:"m²",p:22,rend:5,dano:"Sustitución de baldosa",cond:"Si procede",det:"Capa de mortero y preparación"},
  {oficio:"ALBAÑILERÍA",desc:"Suministro baldosa cerámica",u:"m²",p:20,rend:null,dano:"Sustitución de baldosa",cond:"Siempre",det:"Material cerámico estándar"},
  {oficio:"ALBAÑILERÍA",desc:"Colocación baldosa cerámica",u:"m²",p:28,rend:5,dano:"Sustitución de baldosa",cond:"Siempre",det:"Instalación y rejuntado"},
  {oficio:"ALBAÑILERÍA",desc:"Reparación de agujero en pared",u:"u",p:25,rend:4,dano:"Daño menor",cond:"Si procede",det:"Pequeña reparación puntual"},
  {oficio:"ALBAÑILERÍA",desc:"Cierre de cata en pladur",u:"u",p:45,rend:2,dano:"Rotura de tubería",cond:"Si se abre pared",det:"Cierre de registro"},
  {oficio:"ALBAÑILERÍA",desc:"Gestión de escombros",u:"u",p:35,rend:null,dano:"Humedad / Baldosa / Tubería",cond:"Si hay retirada",det:"Retirada y transporte"},
  {oficio:"ALBAÑILERÍA",desc:"Protecciones previas",u:"u",p:20,rend:null,dano:"Cualquier siniestro",cond:"Siempre",det:"Plásticos, cintas, cubiertas"},
  {oficio:"ALBAÑILERÍA",desc:"Desplazamiento albañil",u:"u",p:25,rend:null,dano:"Cualquier siniestro",cond:"Siempre",det:"Desplazamiento del operario"},
  // ── PINTURA ──
  {oficio:"PINTURA",desc:"Preparación de superficies",u:"m²",p:6,rend:15,dano:"Humedad / Reparaciones",cond:"Siempre",det:"Lijado y masillado"},
  {oficio:"PINTURA",desc:"Pintura plástica en paredes",u:"m²",p:10,rend:18,dano:"Humedad / Tubería / Reparaciones",cond:"Siempre",det:"Dos manos"},
  {oficio:"PINTURA",desc:"Pintura en techo",u:"m²",p:11,rend:16,dano:"Humedad",cond:"Si afecta techo",det:"Dos manos"},
  {oficio:"PINTURA",desc:"Esmaltado de carpintería",u:"m²",p:22,rend:6,dano:"Daño carpintería",cond:"Si procede",det:"Puertas, marcos, rodapiés"},
  {oficio:"PINTURA",desc:"Pintura puerta de entrada",u:"u",p:45,rend:2,dano:"Daño carpintería",cond:"Si procede",det:"Interior/exterior"},
  {oficio:"PINTURA",desc:"Reparación de pequeñas fisuras",u:"u",p:18,rend:5,dano:"Daño menor",cond:"Si procede",det:"Masilla y retoque"},
  // ── LAMPISTERÍA ──
  {oficio:"LAMPISTERÍA",desc:"Localización de fuga",u:"u",p:45,rend:1,dano:"Rotura de tubería",cond:"Siempre",det:"Pruebas y detección"},
  {oficio:"LAMPISTERÍA",desc:"Sustitución de tubería",u:"ml",p:28,rend:3,dano:"Rotura de tubería",cond:"Siempre",det:"Tubería + accesorios"},
  {oficio:"LAMPISTERÍA",desc:"Reparación de sifón/desagüe",u:"u",p:35,rend:2,dano:"Daño fontanería",cond:"Si procede",det:"Sustitución parcial"},
  {oficio:"LAMPISTERÍA",desc:"Sustitución de grifo",u:"u",p:65,rend:2,dano:"Daño fontanería",cond:"Si procede",det:"Material e instalación"},
  {oficio:"LAMPISTERÍA",desc:"Prueba de estanqueidad",u:"u",p:25,rend:2,dano:"Rotura de tubería",cond:"Siempre",det:"Comprobación final"},
  {oficio:"LAMPISTERÍA",desc:"Desplazamiento fontanero",u:"u",p:25,rend:null,dano:"Cualquier siniestro",cond:"Siempre",det:"Desplazamiento del operario"},
  // ── ELECTRICIDAD ──
  {oficio:"ELECTRICIDAD",desc:"Sustitución de mecanismo eléctrico",u:"u",p:22,rend:6,dano:"Daño eléctrico",cond:"Siempre",det:"Interruptor o enchufe"},
  {oficio:"ELECTRICIDAD",desc:"Reparación punto de luz",u:"u",p:35,rend:3,dano:"Daño eléctrico",cond:"Si procede",det:"Cableado y conexión"},
  {oficio:"ELECTRICIDAD",desc:"Sustitución de luminaria",u:"u",p:55,rend:2,dano:"Daño eléctrico",cond:"Si procede",det:"Material e instalación"},
  {oficio:"ELECTRICIDAD",desc:"Revisión instalación eléctrica",u:"u",p:40,rend:2,dano:"Daño eléctrico",cond:"Si hay riesgo",det:"Comprobación general"},
  {oficio:"ELECTRICIDAD",desc:"Desplazamiento electricista",u:"u",p:25,rend:null,dano:"Cualquier siniestro",cond:"Siempre",det:"Desplazamiento del operario"},
  // ── CARPINTERÍA ──
  {oficio:"CARPINTERÍA",desc:"Desmontaje de puerta",u:"u",p:25,rend:3,dano:"Daño carpintería",cond:"Si se sustituye",det:"Retirada de hoja y herrajes"},
  {oficio:"CARPINTERÍA",desc:"Suministro de puerta",u:"u",p:95,rend:null,dano:"Daño carpintería",cond:"Si no es reparable",det:"Material estándar"},
  {oficio:"CARPINTERÍA",desc:"Montaje de puerta",u:"u",p:65,rend:2,dano:"Daño carpintería",cond:"Si se sustituye",det:"Instalación completa"},
  {oficio:"CARPINTERÍA",desc:"Reparación de marco",u:"u",p:35,rend:2,dano:"Daño carpintería",cond:"Si es reparable",det:"Ajustes y refuerzos"},
  {oficio:"CARPINTERÍA",desc:"Sustitución de cerradura",u:"u",p:55,rend:2,dano:"Daño carpintería",cond:"Si está dañada",det:"Cerradura completa + instalación"},
  {oficio:"CARPINTERÍA",desc:"Ajustes de carpintería",u:"u",p:25,rend:3,dano:"Daño carpintería",cond:"Si procede",det:"Revisión general"},
  {oficio:"CARPINTERÍA",desc:"Desplazamiento carpintero",u:"u",p:25,rend:null,dano:"Cualquier siniestro",cond:"Siempre",det:"Desplazamiento del operario"},
  // ── CERRAJERÍA ──
  {oficio:"CERRAJERÍA",desc:"Apertura de puerta",u:"u",p:65,rend:1,dano:"Apertura urgente",cond:"Siempre",det:"Intervención urgente"},
  {oficio:"CERRAJERÍA",desc:"Sustitución de bombín",u:"u",p:45,rend:2,dano:"Apertura urgente",cond:"Si se rompe",det:"Material e instalación"},
  {oficio:"CERRAJERÍA",desc:"Reparación de cierre",u:"u",p:30,rend:2,dano:"Daño cerrajería",cond:"Si procede",det:"Ajustes y engrase"},
  {oficio:"CERRAJERÍA",desc:"Desplazamiento cerrajero",u:"u",p:25,rend:null,dano:"Cualquier siniestro",cond:"Siempre",det:"Desplazamiento del operario"},
  // ── LIMPIEZA ──
  {oficio:"LIMPIEZA",desc:"Limpieza final de obra",u:"u",p:45,rend:null,dano:"Cualquier siniestro",cond:"Si procede",det:"Retirada de polvo y restos"},
  {oficio:"LIMPIEZA",desc:"Limpieza por siniestro",u:"u",p:55,rend:null,dano:"Siniestro con suciedad",cond:"Siempre",det:"Agua, barro, hollín"},
  {oficio:"LIMPIEZA",desc:"Desinfección",u:"u",p:35,rend:null,dano:"Aguas sucias",cond:"Si procede",det:"Tratamiento químico"},
  // ── AUXILIARES ──
  {oficio:"AUXILIARES",desc:"Desplazamiento general",u:"u",p:25,rend:null,dano:"Cualquier siniestro",cond:"Siempre",det:"Desplazamiento aplicable a cualquier oficio"},
  {oficio:"AUXILIARES",desc:"Medios auxiliares",u:"u",p:15,rend:null,dano:"Cualquier siniestro",cond:"Si procede",det:"Escaleras, herramientas, EPIs"},
  {oficio:"AUXILIARES",desc:"Costos indirectos",u:"u",p:0,rend:null,dano:"Cualquier siniestro",cond:"Siempre",det:"Gestión, coordinación (8% del total)",indirecto:true},
];
// % de costes indirectos sobre el subtotal de las demás partidas
export const PCT_INDIRECTO = 8;

// Busca en el BAREMO la partida que corresponde al texto devuelto por la IA.
// Antes se exigía una coincidencia casi literal, así que un cambio de tilde o
// una palabra de más dejaban la partida sin precio (aparecía a 0 €). Ahora:
//   1) coincidencia exacta ignorando tildes/mayúsculas
//   2) una contiene a la otra
//   3) la que más palabras significativas comparte (mínimo la mitad)
export const matchBaremo = txt => {
  const t = norm(txt);
  if(!t) return null;
  const exacta = BAREMO.find(b=>norm(b.desc)===t);
  if(exacta) return exacta;
  const contiene = BAREMO.find(b=>{const n=norm(b.desc);return n&&(t.includes(n)||n.includes(t));});
  if(contiene) return contiene;
  const pal = t.split(" ").filter(w=>w.length>3);
  if(!pal.length) return null;
  let mejor=null, max=0;
  for(const b of BAREMO){
    const nb = norm(b.desc);
    const hits = pal.filter(w=>nb.includes(w)).length;
    if(hits>max){ max=hits; mejor=b; }
  }
  return max>=Math.ceil(pal.length/2) ? mejor : null;
};

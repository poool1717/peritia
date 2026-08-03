import { useState, useRef, useEffect } from "react";
import {
  FileText, MapPin, AlertTriangle, List, FileCheck, DollarSign,
  Camera, Upload, Mic, MicOff, Loader2, Check, ChevronRight, ChevronLeft, ChevronDown,
  Plus, X, Search, Home, Sparkles, Shield, Building2, Image,
  FileImage, Receipt, Save, Eye, RefreshCw, Edit3, Trash2, GripVertical,
  ExternalLink, Mail, Info, FlaskConical,
} from "lucide-react";

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  bg:"#F4F1EA", white:"#FFFFFF", sidebar:"#161B22",
  accent:"#9B2226", accentLight:"#F7E7E7", accentMid:"#C1494E",
  ink:"#1B2430", muted:"#6B7480", border:"#E3DED3",
  plano:"#2C5F6B", planoLight:"#E7F0F1",
  green:"#0F7B4D", greenBg:"#E9F7F0",
  orange:"#B45309", orangeBg:"#FFFBEB",
  red:"#C0392B", redBg:"#FEF2F2",
  blue:"#1D4ED8", blueBg:"#EFF6FF",
  tag:"#F0EDE8",
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
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

// Tablas módulos arquitectura 2025 — [Básica, Media, Alta] €/m²
export const TABLAS_ARQ = {
  "17":{unif_aislada:[772.07,1148.06,1721.72],unif_hilera_menos10:[666.93,939.04,1387.21],unif_hilera_10_25:[639.69,894.93,1317.77],unif_hilera_mas25:[612.47,844.59,1243.31],unif_garaje:[383.18,449.09,581.68],unif_almacen:[357.22,397.58,550.83],unif_instalaciones:[369.25,382.18,514.37],pluri_bloque_menos16:[629.56,787.58,1089.77],pluri_bloque_16_40:[633.36,715.7,1002.62],pluri_bloque_mas40:[556.72,669.18,941.42],pluri_manzana_menos16:[608.03,730.85,961.9],pluri_manzana_16_40:[572.56,682.49,894.34],pluri_manzana_mas40:[537.73,630.21,818.42],pluri_garaje:[343.91,372.8,448.12],pluri_almacen:[338.21,365.28,459.98],pluri_instalaciones:[340.75,342.46,379.6],pluri_oficinas:[443.36,532.91,683.66],pluri_locales:[233.08,268.27,308.83],ofic_oficinas:[822.11,1003.79,1488.83],ofic_diafanas:[459.83,520.98,658.47],com_locales_resid:[362.28,410.46,562.62],com_comercio:[720.77,831.05,1176.3],ind_naves:[301.49,323.79,404.9],ind_edificios:[583.33,614.83,748.42],ind_cobertizos:[200.15,203.15,232.97],ind_almacenes_agric:[146.3,154.64,164.45],gar_planta_baja:[312.88,336.03,413.94],gar_semisotano:[389.51,418.34,515.33],gar_2_3_sotano:[443.36,476.16,586.56],gar_exterior:[232.44,249.65,307.52],sin_uso_local:[244.48,281.39,323.94],host_hostales:[734.7,796.42,1001.4],host_hoteles:[982.98,1133.38,1721.21],host_residencias:[789.8,894.85,1233.67],host_restaurantes:[877.84,1037.6,1589.78],host_cafeterias:[721.4,852.7,1306.46],host_camping:[570.03,617.91,776.95],dep_polideportivo:[810.07,822.22,1039.31],dep_piscina_cubierta:[825.9,870.5,1125.71],dep_pistas:[106.4,108,136.52],dep_piscinas_exterior:[422.45,437.24,567.35],dep_vestuarios:[668.2,704.28,910.75],dep_graderio_desc:[243.85,252.38,327.49],dep_graderio_cub:[376.85,390.04,506.11],esp_discotecas:[827.18,953.73,1308.59],esp_salas_fiestas:[1034.28,1232.86,1677.6],esp_centros_culturales:[1238.22,1695.13,2168.12],esp_stands:[1371.86,2067.4,2661.42],doc_universidades:[967.15,1076.44,1413.98],doc_colegios:[696.07,754.54,969.62],san_hospitales:[1277.49,1397.58,1651.8],san_ambulatorios:[985.52,1058.44,1244.71],san_dispensarios:[818.3,862.49,1001.6],rel_iglesias:[1067.85,1125.51,1466.15],rel_capillas:[800.57,896.64,1168.84],rel_seminarios:[730.27,795.99,1007.77],fun_nichos_sobre:[335.05,363.2,436.57],fun_nichos_bajo:[419.29,454.5,546.32],fun_panteon:[994.37,1371.25,1988.75],fun_tanatorio:[822.74,948.62,1285.12],tra_estacion:[1239.49,1343.6,1716.69],pen_carcel:[1131.18,1383.44,1598.36],urb_urbanizacion:[89.94,98.39,126.18]},
  "25":{unif_aislada:[751.99,1118.21,1676.93],unif_hilera_menos10:[649.58,914.61,1351.13],unif_hilera_10_25:[623.06,871.66,1283.49],unif_hilera_mas25:[596.54,822.62,1210.96],unif_garaje:[373.22,437.42,566.55],unif_almacen:[347.92,387.24,536.5],unif_instalaciones:[359.65,372.23,500.99],pluri_bloque_menos16:[613.19,767.1,1061.43],pluri_bloque_16_40:[616.89,697.08,976.54],pluri_bloque_mas40:[542.24,651.77,916.94],pluri_manzana_menos16:[592.21,711.84,936.88],pluri_manzana_16_40:[557.67,664.74,871.08],pluri_manzana_mas40:[523.74,613.82,797.13],pluri_garaje:[334.97,363.11,436.46],pluri_almacen:[329.42,355.78,448.01],pluri_instalaciones:[331.88,333.55,369.72],pluri_oficinas:[431.83,519.05,665.87],pluri_locales:[227.02,261.29,300.8],ofic_oficinas:[800.72,977.68,1450.11],ofic_diafanas:[447.86,507.43,641.34],com_locales_resid:[352.86,399.79,547.99],com_comercio:[702.02,809.43,1145.7],ind_naves:[293.64,315.37,394.37],ind_edificios:[568.16,598.84,728.95],ind_cobertizos:[194.94,197.87,226.91],ind_almacenes_agric:[142.5,150.62,160.17],gar_planta_baja:[304.74,327.29,403.17],gar_semisotano:[379.39,407.46,501.92],gar_2_3_sotano:[431.83,463.78,571.31],gar_exterior:[226.4,243.16,299.53],sin_uso_local:[238.12,274.08,315.51],host_hostales:[715.6,775.7,975.36],host_hoteles:[957.41,1103.9,1676.44],host_residencias:[769.26,871.57,1201.58],host_restaurantes:[855.01,1010.62,1548.42],host_cafeterias:[702.64,830.52,1272.48],host_camping:[555.2,601.85,756.74],dep_polideportivo:[789,800.83,1012.28],dep_piscina_cubierta:[804.42,847.86,1096.43],dep_pistas:[103.64,105.2,132.97],dep_piscinas_exterior:[411.47,425.87,552.59],dep_vestuarios:[650.81,685.96,887.06],dep_graderio_desc:[237.5,245.81,318.97],dep_graderio_cub:[367.04,379.89,492.95],esp_discotecas:[805.66,928.93,1274.56],esp_salas_fiestas:[1007.38,1200.8,1633.97],esp_centros_culturales:[1206.01,1651.04,2111.73],esp_stands:[1336.19,2013.63,2592.2],doc_universidades:[941.99,1048.44,1377.2],doc_colegios:[677.96,734.91,944.39],san_hospitales:[1244.26,1361.23,1608.84],san_ambulatorios:[959.88,1030.91,1212.33],san_dispensarios:[797.02,840.06,975.56],rel_iglesias:[1040.07,1096.24,1428.02],rel_capillas:[779.75,873.32,1138.43],rel_seminarios:[711.27,775.28,981.56],fun_nichos_sobre:[326.34,353.75,425.21],fun_nichos_bajo:[408.38,442.68,532.12],fun_panteon:[968.51,1335.59,1937.03],fun_tanatorio:[801.34,923.94,1251.69],tra_estacion:[1207.25,1308.65,1672.04],pen_carcel:[1101.76,1347.45,1556.79],urb_urbanizacion:[87.6,95.84,122.9]},
  "43":{unif_aislada:[794.23,1181.02,1771.13],unif_hilera_menos10:[686.07,965.99,1427.02],unif_hilera_10_25:[658.05,920.62,1355.59],unif_hilera_mas25:[630.04,868.82,1278.98],unif_garaje:[394.19,461.99,598.37],unif_almacen:[367.47,408.99,566.63],unif_instalaciones:[379.85,393.14,529.13],pluri_bloque_menos16:[647.63,810.19,1121.05],pluri_bloque_16_40:[651.54,736.24,1031.39],pluri_bloque_mas40:[572.7,688.39,968.45],pluri_manzana_menos16:[625.48,751.82,989.5],pluri_manzana_16_40:[588.99,702.08,920.01],pluri_manzana_mas40:[553.16,648.3,841.91],pluri_garaje:[353.78,383.5,460.98],pluri_almacen:[347.92,375.76,473.17],pluri_instalaciones:[350.53,352.28,390.49],pluri_oficinas:[456.08,548.21,703.28],pluri_locales:[239.77,275.97,317.69],ofic_oficinas:[845.69,1032.59,1531.56],ofic_diafanas:[473.02,535.93,677.36],com_locales_resid:[372.67,422.24,578.77],com_comercio:[741.46,854.9,1210.06],ind_naves:[310.14,333.08,416.51],ind_edificios:[600.07,632.47,769.89],ind_cobertizos:[205.89,208.98,239.65],ind_almacenes_agric:[150.5,159.08,169.16],gar_planta_baja:[321.86,345.67,425.82],gar_semisotano:[400.7,430.34,530.12],gar_2_3_sotano:[456.08,489.83,603.39],gar_exterior:[239.12,256.82,316.35],sin_uso_local:[251.5,289.47,333.23],host_hostales:[755.79,819.28,1030.14],host_hoteles:[1011.2,1165.91,1770.6],host_residencias:[812.47,920.53,1269.07],host_restaurantes:[903.04,1067.39,1635.4],host_cafeterias:[742.1,877.17,1343.96],host_camping:[586.39,635.65,799.25],dep_polideportivo:[833.32,845.81,1069.14],dep_piscina_cubierta:[849.6,895.49,1158.01],dep_pistas:[109.46,111.1,140.44],dep_piscinas_exterior:[434.57,449.78,583.64],dep_vestuarios:[687.38,724.49,936.89],dep_graderio_desc:[250.84,259.62,336.89],dep_graderio_cub:[387.66,401.23,520.63],esp_discotecas:[850.91,981.11,1346.15],esp_salas_fiestas:[1063.96,1268.24,1725.75],esp_centros_culturales:[1273.75,1743.78,2230.35],esp_stands:[1411.24,2126.73,2737.8],doc_universidades:[994.91,1107.33,1454.55],doc_colegios:[716.04,776.19,997.44],san_hospitales:[1314.16,1437.69,1699.21],san_ambulatorios:[1013.8,1088.82,1280.43],san_dispensarios:[841.79,887.25,1030.35],rel_iglesias:[1098.5,1157.81,1508.24],rel_capillas:[823.55,922.37,1202.38],rel_seminarios:[751.22,818.84,1036.69],fun_nichos_sobre:[344.67,373.62,449.1],fun_nichos_bajo:[431.32,467.54,562.01],fun_panteon:[1022.91,1410.6,2045.83],fun_tanatorio:[846.35,975.84,1322],tra_estacion:[1275.06,1382.16,1765.96],pen_carcel:[1163.65,1423.14,1644.23],urb_urbanizacion:[92.52,101.22,129.8]},
  "08":{unif_aislada:[818.46,1217.06,1825.17],unif_hilera_menos10:[707,995.46,1470.56],unif_hilera_10_25:[678.13,948.71,1396.95],unif_hilera_mas25:[649.27,895.34,1318.01],unif_garaje:[406.21,476.08,616.63],unif_almacen:[378.68,421.47,583.93],unif_instalaciones:[391.44,405.14,545.27],pluri_bloque_menos16:[667.4,834.91,1155.25],pluri_bloque_16_40:[671.42,758.7,1062.86],pluri_bloque_mas40:[590.17,709.4,998],pluri_manzana_menos16:[644.56,774.77,1019.7],pluri_manzana_16_40:[606.96,723.5,948.08],pluri_manzana_mas40:[570.04,668.09,867.59],pluri_garaje:[364.58,395.21,475.04],pluri_almacen:[358.54,387.23,487.61],pluri_instalaciones:[361.22,363.03,402.41],pluri_oficinas:[470,564.93,724.73],pluri_locales:[247.08,284.39,327.38],ofic_oficinas:[871.5,1064.1,1578.29],ofic_diafanas:[487.46,552.29,698.03],com_locales_resid:[384.04,435.13,596.43],com_comercio:[764.08,880.98,1246.98],ind_naves:[319.6,343.25,429.23],ind_edificios:[618.38,651.77,793.39],ind_cobertizos:[212.17,215.36,246.96],ind_almacenes_agric:[155.09,163.94,174.32],gar_planta_baja:[331.68,356.22,438.81],gar_semisotano:[412.92,443.48,546.29],gar_2_3_sotano:[470,504.77,621.8],gar_exterior:[246.41,264.65,326],sin_uso_local:[259.17,298.31,343.4],host_hostales:[778.85,844.28,1061.58],host_hoteles:[1042.05,1201.49,1824.63],host_residencias:[837.26,948.62,1307.8],host_restaurantes:[930.59,1099.96,1685.3],host_cafeterias:[764.75,903.94,1384.97],host_camping:[604.28,655.04,823.64],dep_polideportivo:[858.74,871.62,1101.76],dep_piscina_cubierta:[875.53,922.81,1193.35],dep_pistas:[112.8,114.49,144.72],dep_piscinas_exterior:[447.83,463.51,601.44],dep_vestuarios:[708.35,746.6,965.47],dep_graderio_desc:[258.5,267.55,347.17],dep_graderio_cub:[399.5,413.48,536.52],esp_discotecas:[876.88,1011.05,1387.22],esp_salas_fiestas:[1096.43,1306.94,1778.41],esp_centros_culturales:[1312.63,1796.99,2298.4],esp_stands:[1454.3,2191.63,2821.34],doc_universidades:[1025.26,1141.12,1498.94],doc_colegios:[737.89,799.88,1027.88],san_hospitales:[1354.26,1481.56,1751.05],san_ambulatorios:[1044.74,1122.04,1319.5],san_dispensarios:[867.47,914.33,1061.79],rel_iglesias:[1132.01,1193.14,1554.26],rel_capillas:[848.68,950.52,1239.07],rel_seminarios:[774.14,843.82,1068.32],fun_nichos_sobre:[355.19,385.02,462.8],fun_nichos_bajo:[444.48,481.81,579.15],fun_panteon:[1054.13,1453.64,2108.26],fun_tanatorio:[872.18,1005.62,1362.34],tra_estacion:[1313.97,1424.34,1819.85],pen_carcel:[1199.15,1466.57,1694.41],urb_urbanizacion:[95.34,104.3,133.76]},
  "07":{unif_aislada:[782.45,1163.51,1744.88],unif_hilera_menos10:[675.9,951.67,1405.87],unif_hilera_10_25:[648.3,906.97,1335.5],unif_hilera_mas25:[620.7,855.95,1260.03],unif_garaje:[388.34,455.14,589.5],unif_almacen:[362.02,402.92,558.24],unif_instalaciones:[374.22,387.31,521.29],pluri_bloque_menos16:[638.03,798.18,1104.44],pluri_bloque_16_40:[641.88,725.33,1016.1],pluri_bloque_mas40:[564.22,678.18,954.09],pluri_manzana_menos16:[616.21,740.68,974.84],pluri_manzana_16_40:[580.26,691.67,906.38],pluri_manzana_mas40:[544.96,638.69,829.43],pluri_garaje:[348.54,377.81,454.15],pluri_almacen:[342.77,370.19,466.16],pluri_instalaciones:[345.33,347.06,384.71],pluri_oficinas:[449.32,540.08,692.85],pluri_locales:[236.21,271.88,312.98],ofic_oficinas:[833.16,1017.29,1508.86],ofic_diafanas:[466.01,527.99,667.33],com_locales_resid:[367.16,415.99,570.19],com_comercio:[730.46,842.23,1192.12],ind_naves:[305.54,328.15,410.34],ind_edificios:[591.17,623.1,758.48],ind_cobertizos:[202.84,205.88,236.1],ind_almacenes_agric:[148.27,156.73,166.66],gar_planta_baja:[317.08,340.55,419.51],gar_semisotano:[394.76,423.97,522.26],gar_2_3_sotano:[449.32,482.56,594.45],gar_exterior:[235.57,253.01,311.66],sin_uso_local:[247.77,285.18,328.3],host_hostales:[744.59,807.14,1014.88],host_hoteles:[996.2,1148.63,1744.36],host_residencias:[800.43,906.89,1250.26],host_restaurantes:[889.65,1051.57,1611.16],host_cafeterias:[731.11,864.17,1324.04],host_camping:[577.69,626.23,787.4],dep_polideportivo:[820.96,833.27,1053.29],dep_piscina_cubierta:[837.01,882.21,1140.85],dep_pistas:[107.84,109.46,138.35],dep_piscinas_exterior:[428.13,443.12,574.98],dep_vestuarios:[677.18,713.75,923],dep_graderio_desc:[247.13,255.77,331.89],dep_graderio_cub:[381.92,395.29,512.92],esp_discotecas:[838.31,966.56,1326.2],esp_salas_fiestas:[1048.19,1249.45,1700.18],esp_centros_culturales:[1254.88,1717.94,2197.29],esp_stands:[1390.32,2095.22,2697.22],doc_universidades:[980.16,1090.92,1433],doc_colegios:[705.43,764.69,982.66],san_hospitales:[1294.68,1416.38,1674.02],san_ambulatorios:[998.77,1072.68,1261.45],san_dispensarios:[829.31,874.1,1015.08],rel_iglesias:[1082.21,1140.65,1485.88],rel_capillas:[811.34,908.7,1184.56],rel_seminarios:[740.09,806.69,1021.32],fun_nichos_sobre:[339.56,368.08,442.44],fun_nichos_bajo:[424.93,460.62,553.67],fun_panteon:[1007.75,1389.7,2015.51],fun_tanatorio:[833.81,961.37,1302.41],tra_estacion:[1256.16,1361.68,1739.78],pen_carcel:[1146.4,1402.04,1619.87],urb_urbanizacion:[91.15,99.72,127.88]},
  "00":{unif_aislada:[783.84,1165.57,1747.97],unif_hilera_menos10:[677.1,953.35,1408.36],unif_hilera_10_25:[649.45,908.58,1337.86],unif_hilera_mas25:[621.8,857.46,1262.26],unif_garaje:[389.03,455.94,590.55],unif_almacen:[362.66,403.64,559.23],unif_instalaciones:[374.88,388,522.21],pluri_bloque_menos16:[639.16,799.59,1106.39],pluri_bloque_16_40:[643.02,726.61,1017.9],pluri_bloque_mas40:[565.21,679.38,955.78],pluri_manzana_menos16:[617.3,741.99,976.56],pluri_manzana_16_40:[581.29,692.9,907.98],pluri_manzana_mas40:[545.93,639.82,830.9],pluri_garaje:[349.16,378.49,454.95],pluri_almacen:[343.37,370.85,466.99],pluri_instalaciones:[345.94,347.68,385.39],pluri_oficinas:[450.12,541.04,694.08],pluri_locales:[236.63,272.36,313.54],ofic_oficinas:[834.64,1019.09,1511.53],ofic_diafanas:[466.84,528.92,668.51],com_locales_resid:[367.8,416.72,571.2],com_comercio:[731.76,843.72,1194.23],ind_naves:[306.08,328.73,411.07],ind_edificios:[592.22,624.2,759.83],ind_cobertizos:[203.2,206.25,236.52],ind_almacenes_agric:[148.53,157,166.95],gar_planta_baja:[317.65,341.15,420.25],gar_semisotano:[395.46,424.72,523.18],gar_2_3_sotano:[450.12,483.42,595.5],gar_exterior:[235.99,253.46,312.21],sin_uso_local:[248.21,285.69,328.88],host_hostales:[745.91,808.56,1016.67],host_hoteles:[997.97,1150.66,1747.45],host_residencias:[801.84,908.49,1252.48],host_restaurantes:[891.23,1053.43,1614.01],host_cafeterias:[732.4,865.7,1326.38],host_camping:[578.72,627.34,788.8],dep_polideportivo:[822.42,834.75,1055.16],dep_piscina_cubierta:[838.49,883.77,1142.87],dep_pistas:[108.03,109.65,138.6],dep_piscinas_exterior:[428.89,443.9,576],dep_vestuarios:[678.38,715.02,924.63],dep_graderio_desc:[247.56,256.23,332.48],dep_graderio_cub:[382.59,395.99,513.83],esp_discotecas:[839.79,968.28,1328.54],esp_salas_fiestas:[1050.05,1251.66,1703.18],esp_centros_culturales:[1257.1,1720.98,2201.18],esp_stands:[1392.78,2098.92,2702],doc_universidades:[981.89,1092.85,1435.53],doc_colegios:[706.68,766.04,984.4],san_hospitales:[1296.97,1418.89,1676.98],san_ambulatorios:[1000.54,1074.58,1263.68],san_dispensarios:[830.78,875.65,1016.88],rel_iglesias:[1084.13,1142.67,1488.51],rel_capillas:[812.78,910.31,1186.66],rel_seminarios:[741.4,808.12,1023.13],fun_nichos_sobre:[340.16,368.73,443.22],fun_nichos_bajo:[425.68,461.43,554.65],fun_panteon:[1009.53,1392.16,2019.08],fun_tanatorio:[835.28,963.08,1304.71],tra_estacion:[1258.39,1364.09,1742.86],pen_carcel:[1148.43,1404.53,1622.73],urb_urbanizacion:[91.31,99.89,128.1]},
};
// Jerarquía de tipos arquitectura para la UI
const ARQ_N2 = {
  "Residencial":["Viviendas unifamiliares","Viviendas plurifamiliares"],
  "No residencial":["Uso oficinas","Uso comercial","Uso industrial y agropecuario","Uso garaje y aparcamiento","Sin uso","Uso hostelería","Uso deportivo","Uso espectáculos","Uso docente","Uso sanitario","Uso religioso","Uso funerario","Uso transportes","Uso penitenciario","Urbanización - Obra civil"],
};
const ARQ_N3 = {
  "Viviendas unifamiliares":[{k:"unif_aislada",l:"Unifamiliar aislada"},{k:"unif_hilera_menos10",l:"Unifamiliar en hilera (< 10 viviendas)"},{k:"unif_hilera_10_25",l:"Unifamiliar en hilera (10 a 25 viviendas)"},{k:"unif_hilera_mas25",l:"Unifamiliar en hilera (> 25 viviendas)"},{k:"unif_garaje",l:"Garaje en vivienda unifamiliar"},{k:"unif_almacen",l:"Almacenes y trasteros en vivienda unifamiliar"},{k:"unif_instalaciones",l:"Instalaciones y otros en vivienda unifamiliar"}],
  "Viviendas plurifamiliares":[{k:"pluri_bloque_menos16",l:"Bloque aislado (< 16 viviendas)"},{k:"pluri_bloque_16_40",l:"Bloque aislado (16 a 40 viviendas)"},{k:"pluri_bloque_mas40",l:"Bloque aislado (> 40 viviendas)"},{k:"pluri_manzana_menos16",l:"Manzana cerrada (< 16 viviendas)"},{k:"pluri_manzana_16_40",l:"Manzana cerrada (16 a 40 viviendas)"},{k:"pluri_manzana_mas40",l:"Manzana cerrada (> 40 viviendas)"},{k:"pluri_garaje",l:"Garaje en vivienda plurifamiliar"},{k:"pluri_almacen",l:"Almacenes y trasteros en vivienda plurifamiliar"},{k:"pluri_instalaciones",l:"Instalaciones y otros en vivienda plurifamiliar"},{k:"pluri_oficinas",l:"Oficinas en vivienda plurifamiliar"},{k:"pluri_locales",l:"Locales en edificio plurifamiliar (diáfanos)"}],
  "Uso oficinas":[{k:"ofic_oficinas",l:"Oficinas"},{k:"ofic_diafanas",l:"Oficinas diáfanas (sin distribución)"}],
  "Uso comercial":[{k:"com_locales_resid",l:"Locales comerciales en edificios residenciales"},{k:"com_comercio",l:"Comercio"}],
  "Uso industrial y agropecuario":[{k:"ind_naves",l:"Naves industriales"},{k:"ind_edificios",l:"Edificios industriales diáfanos en altura"},{k:"ind_cobertizos",l:"Cobertizos o naves sin cerramientos"},{k:"ind_almacenes_agric",l:"Almacenes agrícolas / Establos"}],
  "Uso garaje y aparcamiento":[{k:"gar_planta_baja",l:"Garajes en planta baja o en altura"},{k:"gar_semisotano",l:"Garajes en semisótano o 1er sótano"},{k:"gar_2_3_sotano",l:"Garajes en 2º o 3er sótano"},{k:"gar_exterior",l:"Aparcamientos exteriores"}],
  "Sin uso":[{k:"sin_uso_local",l:"Local sin uso"}],
  "Uso hostelería":[{k:"host_hostales",l:"Hostales / Pensiones"},{k:"host_hoteles",l:"Hoteles / Aparthoteles / Moteles"},{k:"host_residencias",l:"Residencias para la tercera edad"},{k:"host_restaurantes",l:"Restaurantes"},{k:"host_cafeterias",l:"Cafeterías"},{k:"host_camping",l:"Edificaciones de servicio / Camping"}],
  "Uso deportivo":[{k:"dep_polideportivo",l:"Polideportivo cubierto"},{k:"dep_piscina_cubierta",l:"Piscina cubierta"},{k:"dep_pistas",l:"Pistas descubiertas / Instalación exterior"},{k:"dep_piscinas_exterior",l:"Piscinas al aire libre"},{k:"dep_vestuarios",l:"Vestuarios / Servicios de apoyo deportivo"},{k:"dep_graderio_desc",l:"Graderío descubierto"},{k:"dep_graderio_cub",l:"Graderío cubierto"}],
  "Uso espectáculos":[{k:"esp_discotecas",l:"Discotecas / Casinos culturales / Cines"},{k:"esp_salas_fiestas",l:"Salas de fiestas / Teatros / Auditorios"},{k:"esp_centros_culturales",l:"Centros culturales"},{k:"esp_stands",l:"Stands de feria"}],
  "Uso docente":[{k:"doc_universidades",l:"Universidades / Centros de investigación / Museos / Bibliotecas"},{k:"doc_colegios",l:"Academias / Guarderías / Colegios / Institutos"}],
  "Uso sanitario":[{k:"san_hospitales",l:"Hospitales / Clínicas / Grandes centros sanitarios"},{k:"san_ambulatorios",l:"Ambulatorios / Centros médicos / Consultorios"},{k:"san_dispensarios",l:"Dispensarios / Botiquines"}],
  "Uso religioso":[{k:"rel_iglesias",l:"Centros de culto / Iglesias / Mezquitas"},{k:"rel_capillas",l:"Capillas / Ermitas"},{k:"rel_seminarios",l:"Seminarios / Conventos / Centros parroquiales"}],
  "Uso funerario":[{k:"fun_nichos_sobre",l:"Nichos sobre rasante"},{k:"fun_nichos_bajo",l:"Nichos bajo rasante"},{k:"fun_panteon",l:"Panteón familiar"},{k:"fun_tanatorio",l:"Tanatorio / Crematorio"}],
  "Uso transportes":[{k:"tra_estacion",l:"Estación de trenes / Buses / Metro / Intercambiador"}],
  "Uso penitenciario":[{k:"pen_carcel",l:"Cárcel / Prisión / Centro de menores"}],
  "Urbanización - Obra civil":[{k:"urb_urbanizacion",l:"Urbanización / Plaza / Parque / Cementerio"}],
};
export const getModuloArq = (provCode, key, calidad) => {
  const tbl = TABLAS_ARQ[provCode] || TABLAS_ARQ["00"];
  const ci = calidad==="Alta"?2:calidad==="Básica"?0:1;
  return tbl[key]?.[ci] || 0;
};
export const getFactorArq = key => {
  if(!key) return 1.486;
  if(key.startsWith("unif_")||key.startsWith("pluri_")) return 1.486;
  if(key.startsWith("urb_")) return 1.366;
  return 1.618;
};
export const calcVPreexCont = (m2, provCode, arqKey, calidad) =>
  parseFloat(m2||0) * getModuloArq(provCode, arqKey, calidad) * getFactorArq(arqKey);

export const PROVINCIAS = [
  {v:"07",l:"Baleares"},{v:"08",l:"Barcelona"},{v:"17",l:"Girona"},
  {v:"25",l:"Lleida"},{v:"28",l:"Madrid"},{v:"29",l:"Málaga"},{v:"33",l:"Asturias"},
  {v:"35",l:"Las Palmas"},{v:"38",l:"S.C.Tenerife"},{v:"41",l:"Sevilla"},
  {v:"43",l:"Tarragona"},{v:"46",l:"Valencia"},{v:"00",l:"Otras"},
];
export const COMPANIAS = ["AXA Seguros","Mapfre","Allianz","Generali","Zurich","Helvetia","Mutua Madrileña","Caser","Reale","Santalucía","Pelayo","BBVA Seguros","Catalana Occidente","Línea Directa"];
// AXA aparece en los documentos con muchos nombres (AXA, AXA Seguros, AXA Seguros Generales SA…);
// el nombre comercial en el informe debe ser siempre "AXA Seguros".
export const normCompania = c => /\bAXA\b/i.test(String(c||"")) ? "AXA Seguros" : (c||"");
const TIPOS_USO = ["Hotel / Apart-hotel","Hostal / Pensión","Local comercial","Oficinas","Vivienda unifamiliar","Piso / Apartamento","Comunidad de propietarios","Industria / Nave","Restaurante / Bar","Otro"];
const TIPOS_GARANTIA = ["Continente","Contenido","Terceros implicados"];

const SECCIONES = [
  {id:"encargo", label:"Datos del Encargo",         sub:"Encargo y póliza",   icon:FileCheck},
  {id:"s1",      label:"Verificación del Riesgo",   sub:"Sección 1",          icon:MapPin},
  {id:"s2",      label:"Causas y Circunstancias",   sub:"Sección 2",          icon:AlertTriangle},
  {id:"s3",      label:"Valoración de Daños",       sub:"Sección 3",          icon:List},
  {id:"s4",      label:"Cobertura-Indemnización",   sub:"Sección 4",          icon:FileCheck},
  {id:"anexos",  label:"Anexos",                    sub:"Fotos y documentos", icon:Camera},
  {id:"informe", label:"Informe",                  sub:"Vista previa",       icon:FileText},
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
export const fmt  = n => new Intl.NumberFormat("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2}).format(+n||0);
export const fmtE = n => `${fmt(n)} €`;
// Unidades y porcentajes: sin decimales si el valor es entero (p.ej. "3" o "21%"
// en vez de "3,00"/"21,00%"); con 2 decimales solo si de verdad los tiene.
export const fmtSmart = n => { const v=+n||0; return Number.isInteger(v) ? new Intl.NumberFormat("es-ES").format(v) : fmt(v); };

const callClaude = async (system, userContent, onTokens, maxTok=1500) => {
  const res = await fetch("/api/claude",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:maxTok,
      system, messages:[{role:"user",content:userContent}] })
  });
  const d = await res.json();
  if(!res.ok || d.error){
    const msg = d?.error?.message || d?.message || JSON.stringify(d).slice(0,200);
    console.error("Claude API error:", res.status, msg);
    return JSON.stringify({_apiError: true, _status: res.status, _msg: msg});
  }
  if(onTokens) onTokens(d.usage?.input_tokens||0, d.usage?.output_tokens||0);
  return (d.content||[]).map(b=>b.text||"").join("");
};

// Normaliza texto para comparar: sin tildes, en minúsculas y sin espacios
// sobrantes. "Daños por agua" y "DANOS  POR AGUA" pasan a ser iguales.
export const norm = s => String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"")
  .toLowerCase().replace(/\s+/g," ").trim();

// Normaliza valores monetarios extraídos por IA (6.000,00 → 6000 | 6000.00 → 6000)
export const parseCap = v => {
  if(!v && v!==0) return 0;
  const s = String(v).trim();
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
const SB_URL_PROD = "https://yrulaaxdusvmzohugmnc.supabase.co";
const SB_KEY_PROD = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlydWxhYXhkdXN2bXpvaHVnbW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NzQyMTUsImV4cCI6MjA5NjE1MDIxNX0.TOS0mgr0TdHxlC_kMhqOya_WNWyt2KTEn356USWKQFw";

const SB_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL      || SB_URL_PROD;
const SB_KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SB_KEY_PROD;

// Verdadero cuando la app NO está apuntando a la base de datos de producción.
// Se deduce de la propia URL en vez de con otra variable aparte, así no puede
// quedar desincronizado: si apunta a otra base, el aviso sale sí o sí.
const ES_TEST = SB_URL !== SB_URL_PROD;

const sbAuth = async (path, body) => {
  const r = await fetch(`${SB_URL}/auth/v1/${path}`, {
    method:'POST', headers:{'Content-Type':'application/json','apikey':SB_KEY},
    body: JSON.stringify(body)
  });
  return r.json();
};

const sbDb = async (path, method='GET', body=null, token='') => {
  // Sin sesión válida no se opera contra la BD: rechazamos en lugar de
  // caer al anon key, que daría una identidad anónima sin user_id.
  if(!token){ console.error("sbDb: sin token de sesión, operación cancelada"); return null; }
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method, headers:{
      'Content-Type':'application/json', 'apikey':SB_KEY,
      'Authorization':`Bearer ${token}`,
      'Prefer':'return=representation'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if(!r.ok) return null;
  const txt = await r.text();
  try { return JSON.parse(txt); } catch { return null; }
};

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
  const prov = PROVINCIAS.find(p=>p.l===enc.provincia||p.v===enc.provincia);
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

// ─── METEO XEMA (datos abiertos Meteocat) ────────────────────────────────────
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
// Llama al proxy /api/meteocat con los datos del encargo
const fetchMeteoXEMA = async enc => {
  const res = await fetch("/api/meteocat",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      direccion: enc?.lugarIntervencion||"", municipio: enc?.municipio||"",
      provincia: enc?.provincia||"", cp: enc?.codigoPostal||"", fecha: enc?.fechaSiniestro||"",
    })
  });
  return res.json();
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
// Tabla de datos meteo (React) — reutilizada en Sec2 y en el preview del informe
const MeteoTabla = ({m, enc}) => {
  if(!m) return null;
  const sup = meteoSupera(m, enc);
  const alerta = sup.sv||sup.sl;
  const dash = v => (v||v===0)?v:"—";
  const cols = [["Estación",m.estacio||"—"],["Dist.",`${m.distanciaKm} km`],
    ["Temperatura",`${dash(m.tempMax)} ºC`],["Humedad rel.",`${dash(m.humitatMax)} %`],
    ["Racha máx. diaria",`${m.rachaMax} km/h`],
    ["Int. máx. precip.",`${m.precipMaxHoraria} l/m²·h`],
    ["¿Supera umbral?",sup.label]];
  return (
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:14,marginTop:8}}>
      <thead><tr style={{background:C.accentLight}}>
        {cols.map(([h])=><th key={h} style={{padding:"5px 6px",textAlign:"left",color:C.accent,fontWeight:700,fontSize:12}}>{h}</th>)}
      </tr></thead>
      <tbody><tr style={{borderBottom:`1px solid ${C.border}`}}>
        {cols.map(([h,v])=>{
          const hl = h==="¿Supera umbral?"&&alerta;
          return <td key={h} style={{padding:"5px 6px",fontSize:13,fontWeight:hl?700:400,color:hl?C.red:C.ink}}>{v}</td>;
        })}
      </tr></tbody>
    </table>
  );
};
// Bloque meteo en HTML (para Word y PDF). cls = clase de tabla ("" Word · "data" PDF)
const meteoHTML = (m, enc, cls="") => {
  if(!m) return "";
  const sup = meteoSupera(m, enc);
  const td = (v,al="left") => `<td style="text-align:${al}">${v}</td>`;
  return `<h3>2.2. Verificación meteorológica (estación automática):</h3>
${m.texto?`<p>${String(m.texto).replace(/\n/g,'<br/>')}</p>`:''}
<table${cls?` class="${cls}"`:''}><thead><tr><th>Estación</th><th>Dist.</th><th>Temperatura</th><th>Humedad rel.</th><th>Racha máx. diaria</th><th>Int. máx. precip.</th><th>¿Supera umbral?</th></tr></thead><tbody>
<tr>${td(m.estacio||'—')}${td(m.distanciaKm+' km','right')}${td(((m.tempMax??'—'))+' ºC','right')}${td(((m.humitatMax??'—'))+' %','right')}${td(m.rachaMax+' km/h','right')}${td(m.precipMaxHoraria+' l/m²·h','right')}${td(sup.label,'center')}</tr>
</tbody></table>
<p style="font-style:italic;font-size:8pt;color:#666">Fuente: Servei Meteorològic de Catalunya — Xarxa d'Estacions Meteorològiques Automàtiques. Datos abiertos de la Generalitat de Catalunya${m.consultadoEl?`. Consulta: ${m.consultadoEl}`:''}.</p>`;
};

const getRiesgoIA = async (enc, onTokens) => {
  const raw = await callClaude(
    "Eres un perito de seguros español. Responde SOLO con JSON válido, sin markdown.",
    `Estima las características del inmueble asegurado basándote en los datos disponibles.
ASEGURADO: ${enc.asegurado||""}
DIRECCIÓN: ${enc.lugarIntervencion||""}
MUNICIPIO: ${enc.municipio||""}, PROVINCIA: ${enc.provincia||""}
CAUSA: ${enc.causa||""} — RAMO: ${enc.ramo||""}
DESCRIPCIÓN: ${enc.descripcionSiniestro||""}
TIPO VIVIENDA PÓLIZA: ${enc.tipoVivienda||""}
USO VIVIENDA PÓLIZA: ${enc.usoVivienda||""}
UBICACIÓN PÓLIZA: ${enc.ubicacionVivienda||""}
CALIDAD PÓLIZA: ${enc.calidadPóliza||""}

Devuelve SOLO este JSON:
{"tipoRiesgo":"tipo de uso (Hotel, Local, Vivienda...)","tipoVivienda":"tipo de vivienda del apartado descripción de la póliza si disponible, si no estima","usoVivienda":"uso de la vivienda (Habitual, Segunda residencia, Arrendamiento...) si disponible","ubicacion":"ubicación exacta del riesgo asegurado si disponible","anoConstruccion":"año numérico","superficieConstruida":"m2 numérico","refCatastral":"si la conoces","calidad":"Básica|Media|Alta","justificacionCalidad":"una frase técnica"}`,
    onTokens
  );
  return parseJSON(raw);
};

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

// ─── CSS ──────────────────────────────────────────────────────────────────────
const FONT = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap";
const css = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:${C.bg};color:${C.ink};font-size:16px}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .fade{animation:fadeIn .2s ease}
  /* El editor ocupa exactamente el alto de la pantalla: así el scroll ocurre
     dentro del panel de contenido y la barra lateral queda siempre fija.
     100dvh cubre el caso de móvil con barra de direcciones retráctil. */
  .editor-shell{height:100vh;height:100dvh;overflow:hidden}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#ccc;border-radius:2px}
  input,select,textarea{font-family:inherit;color:${C.ink}}
  input[type=number]::-webkit-inner-spin-button{opacity:.6}
  button{touch-action:manipulation}
  :focus-visible{outline:2px solid ${C.accentMid};outline-offset:2px;border-radius:4px}
  @media(max-width:767px){
    input,select,textarea{font-size:16px!important}
    td input,td select{font-size:13px!important}
    .tbl-scroll{display:block;overflow-x:auto}
    ::-webkit-scrollbar{width:8px}
    .editor-topbar{flex-wrap:wrap;height:auto;padding:8px 12px}
    .editor-actions{width:100%;justify-content:flex-end;margin-top:6px}
    .grid2,.grid3{grid-template-columns:1fr!important}
    .dash-table-wrap{display:none!important}
    .dash-cards{display:flex!important}
    .dash-mobile-filterbar{display:flex!important}
  }
  .sidebar-backdrop{display:none}
  .sidebar-close{display:none}
  @media(max-width:1023px){
    .app-sidebar{position:fixed!important;top:0;left:0;bottom:0;width:min(220px,85vw)!important;z-index:50;transform:translateX(-100%);transition:transform .2s ease}
    .app-sidebar.sb-open{transform:translateX(0);box-shadow:2px 0 20px rgba(0,0,0,.25)}
    .sidebar-backdrop{display:block;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:45}
    .sidebar-close{display:flex}
  }
`;

// ─── BASE UI ─────────────────────────────────────────────────────────────────
const Spin = () => <Loader2 size={14} style={{animation:"spin 1s linear infinite",color:C.accent}}/>;
const Lbl  = ({c,req}) => <div style={{fontSize:13,fontWeight:700,color:C.muted,marginBottom:5,letterSpacing:"0.05em",textTransform:"uppercase"}}>{c}{req&&<span style={{color:C.accent}}> *</span>}</div>;

const inpStyle = (dis) => ({
  width:"100%",padding:"9px 12px",border:`1px solid ${C.border}`,borderRadius:9,
  fontSize:16,background:dis?C.bg:C.white,outline:"none",fontFamily:"inherit",
  transition:"border-color .15s",
});

// Ajusta la altura del textarea a su contenido: la caja crece al escribir (o
// cuando la IA rellena el texto) y se encoge al borrar, sin scroll interno.
// Se reajusta también al cambiar el ancho de la ventana, porque el texto
// se reparte en más o menos líneas.
const useAutoGrow = (ref,value) => {
  useEffect(()=>{
    const el = ref.current;
    if(!el) return;
    const fit = () => { el.style.height="auto"; el.style.height=el.scrollHeight+"px"; };
    fit();
    window.addEventListener("resize",fit);
    return ()=>window.removeEventListener("resize",fit);
  },[ref,value]);
};

// Textarea que se adapta al volumen de texto. minRows fija el alto mínimo.
const AutoTextarea = ({value,onChange,minRows=3,disabled,style,inputRef,...rest}) => {
  const ownRef = useRef(null);
  const ref = inputRef||ownRef;
  useAutoGrow(ref,value);
  return (
    <textarea ref={ref} value={value||""} disabled={disabled}
      onChange={e=>onChange(e.target.value)}
      style={{...inpStyle(disabled),lineHeight:1.65,resize:"none",overflowY:"hidden",
        minHeight:`calc(${minRows} * 1.65em + 20px)`,...style}}
      {...rest}/>
  );
};

const Inp = ({label,value,onChange,placeholder,type="text",disabled,required,hint,mono}) => (
  <div style={{marginBottom:14}}>
    {label&&<Lbl c={label} req={required}/>}
    <input type={type} value={value||""} onChange={e=>onChange(e.target.value)}
      placeholder={placeholder} disabled={disabled}
      style={mono?{...inpStyle(disabled),fontWeight:600,fontVariantNumeric:"tabular-nums"}:inpStyle(disabled)}/>
    {hint&&<div style={{fontSize:13,color:C.muted,marginTop:3}}>{hint}</div>}
  </div>
);

const EuroInput = ({label,value,onChange,hint,required,disabled}) => {
  const [focused,setFocused] = useState(false);
  const display = focused?(value||""):(+value>0?fmt(+value)+" €":"");
  return (
    <div style={{marginBottom:14}}>
      {label&&<Lbl c={label} req={required}/>}
      <input type={focused?"number":"text"} value={display}
        onFocus={e=>{setFocused(true);setTimeout(()=>e.target.select(),10)}}
        onBlur={()=>setFocused(false)}
        onChange={e=>onChange(e.target.value)}
        placeholder="0,00 €" disabled={disabled}
        style={{...inpStyle(disabled),fontWeight:!focused&&+value>0?600:400}}/>
      {hint&&<div style={{fontSize:13,color:C.muted,marginTop:3}}>{hint}</div>}
    </div>
  );
};

const Sel = ({label,value,onChange,options,required,hint}) => (
  <div style={{marginBottom:14}}>
    {label&&<Lbl c={label} req={required}/>}
    <select value={value||""} onChange={e=>onChange(e.target.value)}
      style={{...inpStyle(false),cursor:"pointer"}}>
      <option value="">Seleccionar…</option>
      {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
    </select>
    {hint&&<div style={{fontSize:13,color:C.muted,marginTop:3}}>{hint}</div>}
  </div>
);

const Txt = ({label,value,onChange,placeholder,rows=4,disabled,hint}) => (
  <div style={{marginBottom:14}}>
    {label&&<Lbl c={label}/>}
    <AutoTextarea value={value} onChange={onChange}
      placeholder={placeholder} minRows={rows} disabled={disabled}/>
    {hint&&<div style={{fontSize:13,color:C.muted,marginTop:3}}>{hint}</div>}
  </div>
);

const Btn = ({onClick,children,primary,ghost,danger,disabled,sm,full,outline}) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding:sm?"6px 14px":"9px 20px",borderRadius:9,
    border:outline?`1.5px solid ${C.accent}`:"none",
    background:disabled?"#E5E0D8":primary?C.accent:danger?C.red:ghost||outline?"transparent":C.tag,
    color:disabled?C.muted:primary||danger?C.white:C.ink,
    fontSize:sm?14:15,fontWeight:600,display:"inline-flex",alignItems:"center",gap:6,
    fontFamily:"inherit",width:full?"100%":"auto",justifyContent:"center",
    cursor:disabled?"not-allowed":"pointer",opacity:disabled?.6:1,transition:"opacity .15s",
  }}>{children}</button>
);

const Card = ({children,s}) => (
  <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:20,transition:"box-shadow .15s",...s}}>{children}</div>
);

const SecTitle = ({n,label,sub}) => (
  <div style={{marginBottom:22,paddingBottom:12,borderBottom:`2px solid ${C.accent}`}}>
    {n&&<div style={{fontSize:12,fontWeight:700,color:C.accent,letterSpacing:".1em",textTransform:"uppercase",marginBottom:4}}>SECCIÓN {n}</div>}
    <h2 style={{fontFamily:"'DM Sans',sans-serif",fontSize:22,fontWeight:600,color:C.ink}}>{label}</h2>
    {sub&&<p style={{fontSize:15,color:C.muted,marginTop:4,lineHeight:1.5}}>{sub}</p>}
  </div>
);

// display:flex para poder alinear un icono de Lucide junto al texto del título.
const SectionLabel = ({children}) => (
  <div style={{fontSize:13,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:".06em",marginBottom:10,marginTop:4,
    display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>{children}</div>
);

const InfoRow = ({label,val}) => (
  <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`,fontSize:15}}>
    <span style={{color:C.muted}}>{label}</span>
    <span style={{fontWeight:600,color:C.ink,textAlign:"right",maxWidth:"60%"}}>{val||"—"}</span>
  </div>
);

// ─── SISTEMA DE 3 ZONAS (Contexto · Tu trabajo · Resultado) ───────────────────
// Divisor de zona: separa visualmente qué se consulta, qué se rellena y qué
// calcula la app dentro de una misma sección. Zona "resultado" con línea más
// gruesa en C.ink, a juego con la cabecera oscura de ResultZone.
const ZONE_COLOR = {contexto:C.muted, trabajo:C.accent, resultado:C.ink};
const ZoneLabel = ({zone,children}) => (
  <div style={{display:"flex",alignItems:"center",gap:9,margin:"18px 0 9px"}}>
    <span style={{fontSize:12,fontWeight:700,color:ZONE_COLOR[zone],textTransform:"uppercase",
      letterSpacing:".07em",whiteSpace:"nowrap"}}>{children}</span>
    <span style={{flex:1,height:zone==="resultado"?2:1,background:ZONE_COLOR[zone],opacity:zone==="resultado"?1:.4}}/>
  </div>
);

// Tira compacta de datos que el perito solo consulta (vienen del encargo, la
// póliza u otra sección). items: [{k,v,warn}]. onEdit (opcional) muestra un
// enlace "Editar" que el padre usa para desplegar el formulario completo
// debajo — no oculta ningún campo, solo pliega la vista de solo-lectura.
const ContextBar = ({items,onEdit,editing,editLabel}) => (
  <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",border:`1px solid ${C.border}`,
    borderRadius:9,background:C.white,padding:"2px 4px",marginBottom:14}}>
    {items.filter(Boolean).map((it,i)=>(
      <div key={it.k+i} style={{display:"flex",flexDirection:"column",gap:1,padding:"7px 13px",
        borderRight:i<items.filter(Boolean).length-1?`1px solid ${C.border}`:"none"}}>
        <span style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".05em"}}>{it.k}</span>
        <span style={{fontVariantNumeric:it.mono!==false?"tabular-nums":"normal",fontWeight:600,fontSize:14.5,
          color:it.warn?C.orange:C.ink}}>{it.v}</span>
      </div>
    ))}
    {onEdit&&<button onClick={onEdit} style={{marginLeft:"auto",fontSize:13,fontWeight:600,color:C.accent,
      background:"none",border:"none",cursor:"pointer",padding:"7px 12px",fontFamily:"inherit",whiteSpace:"nowrap"}}>
      {editing?"Ocultar":editLabel||"Editar"}
    </button>}
  </div>
);

// Envoltorio de la zona de resultado: línea superior gruesa + cabecera oscura
// reutilizada de la tabla del dashboard, para que "esto ya es salida" se lea
// igual en cualquier sección.
const ResultZone = ({children}) => <div>{children}</div>;

// Explica cómo se calcula un valor de la zona de resultado: fórmula general +
// un ejemplo resuelto con los números reales. children = el ejemplo (opcional).
const Formula = ({children}) => (
  <div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:8,padding:"10px 14px",
    fontSize:13.5,color:C.blue,marginBottom:14,lineHeight:1.6}}>
    {children}
  </div>
);

const ResultTable = ({cols,children}) => (
  <div style={{overflowX:"auto",border:`1px solid ${C.border}`,borderRadius:9,background:C.white}}>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
      <thead><tr>
        {cols.map((h,i)=>(
          <th key={h} style={{background:C.ink,color:"rgba(255,255,255,.85)",fontSize:12,fontWeight:700,
            textTransform:"uppercase",letterSpacing:".04em",padding:"7px 10px",
            textAlign:i===0?"left":"right",whiteSpace:"nowrap"}}>{h}</th>
        ))}
      </tr></thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

// Etiqueta de origen para texto que el perito no escribió: "Automático" o
// "De la póliza". Se coloca dentro de SectionLabel (que ya es flex).
const AutoBadge = ({children}) => (
  <span style={{marginLeft:"auto",fontSize:11,fontWeight:700,letterSpacing:".04em",padding:"2px 7px",
    borderRadius:5,background:C.planoLight,color:C.plano,textTransform:"none"}}>{children}</span>
);

// ─── ACORDEÓN DE BLOQUES ("Datos del perito") ──────────────────────────────
// Sustituye a Card+SectionLabel en los bloques donde el perito introduce datos.
// Empieza abierto si done=false (algo pendiente) y plegado si done=true (ya
// completo), para que se vea primero lo que falta. Al plegarse se estrecha
// (máx. 600px) y lee como una línea de lista; al abrirse vuelve a ancho
// completo para que quepan los campos de varias columnas.
const Block = ({title,badge,done,summary,children}) => {
  const [open,setOpen] = useState(!done);
  return (
    <div style={{marginBottom:14}}>
      <div style={{background:C.white,border:`1px solid ${open?"#D8CFC0":C.border}`,borderRadius:10,
        overflow:"hidden",maxWidth:open?"100%":600,transition:"border-color .15s,max-width .18s ease"}}>
        <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",
          padding:open?"13px 16px":"11px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left",
          fontFamily:"inherit",transition:"padding .18s ease"}}>
          <span style={{fontSize:open?13.5:12.5,fontWeight:700,color:C.accent,textTransform:"uppercase",
            letterSpacing:".05em",transition:"font-size .18s ease"}}>
            {title}
            {badge&&<span style={{marginLeft:8,fontSize:10.5,fontWeight:700,letterSpacing:".04em",padding:"2px 7px",
              borderRadius:5,background:C.planoLight,color:C.plano,textTransform:"none"}}>{badge}</span>}
          </span>
          <span style={{marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:4,
            fontSize:open?11:10,fontWeight:700,padding:open?"3px 8px":"2px 7px",borderRadius:20,
            flexShrink:0,whiteSpace:"nowrap",background:done?C.greenBg:C.orangeBg,color:done?C.green:C.orange}}>
            {done?<Check size={10}/>:<span style={{width:6,height:6,borderRadius:"50%",background:C.orange}}/>}
            {done?"Completo":"Pendiente"}
          </span>
          <ChevronDown size={16} style={{color:C.muted,flexShrink:0,transition:"transform .18s ease",
            transform:open?"rotate(180deg)":"none"}}/>
        </button>
        {open
          ? <div style={{padding:"0 16px 16px"}}>{children}</div>
          : <div style={{padding:"12px 16px 15px",borderTop:`1px solid ${C.border}`,fontSize:13.5,color:C.muted,lineHeight:1.6}}>{summary}</div>}
      </div>
    </div>
  );
};

// Estado (completo/pendiente) de cada bloque "Datos del perito" por sección,
// como array de booleanos — una función pura por sección, reutilizada tanto
// por el prop `done` de cada <Block> como por el semáforo de navegación de la
// topbar (que solo tiene cData, no el estado interno de cada componente de
// sección). Mantenerlas en un solo sitio evita que las dos lecturas diverjan.
const encargoBlockStates = enc => [
  !!(enc.compania&&enc.numReferencia),
  !!(enc.asegurado&&enc.lugarIntervencion),
  parseCap(enc.capitalContinente)>0,
];
const s1BlockStates = (data,enc) => {
  const capCont = data.capContOverride!=null ? parseCap(data.capContOverride) : parseCap(enc.capitalContinente);
  return [
    !!data.estado,
    !!(data.superficieConstruida&&data.tipoArqKey),
    capCont>0,
  ];
};
const s2BlockStates = (data,enc) => {
  const states = [!!(data.textoRaw||data.textoAI)];
  if(esSiniestroAtmosferico(enc)) states.push(!!data.meteo);
  return states;
};
const s3BlockStates = data => {
  const modoVal = data.modoValoracion||"baremo";
  const docMode = modoVal==="presupuesto"||modoVal==="factura";
  return [
    !!(data.textoRaw||data.textoAI),
    modoVal==="baremo" ? (data.partidas?.length>0) : (docMode&&!!data.perceptorTipo),
  ];
};
const s4BlockStates = data => [
  !!data.textoIntro,
  !!data.descripcionCobertura,
];
const anexosBlockStates = (anexos,s3) => {
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
const semaforoFromStates = states => {
  if(states.some(st=>st==="error")) return "red";
  if(!states.length) return "orange";
  const doneCount = states.filter(st=>st===true).length;
  if(doneCount===states.length) return "green";
  if(doneCount===0) return "red";
  return "orange";
};

// ─── AI VOICE INPUT ───────────────────────────────────────────────────────────
const VoiceBox = ({value,onChange,onImprove,improving,onApply,applied,placeholder,rows=5}) => {
  const [rec,setRec]   = useState(false);
  const recRef         = useRef();
  const supported      = !!(window.SpeechRecognition||window.webkitSpeechRecognition);

  const startRec = () => {
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR)return;
    const r=new SR(); r.lang="es-ES"; r.continuous=true; r.interimResults=true;
    let final="";
    r.onresult=e=>{let int="";for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)final+=e.results[i][0].transcript+" ";else int+=e.results[i][0].transcript;}onChange((value||"")+(final||int));};
    r.onend=()=>setRec(false);
    recRef.current=r; r.start(); setRec(true);
  };
  const stopRec = ()=>{recRef.current?.stop();setRec(false);};

  return (
    <div>
      <div style={{position:"relative"}}>
        <AutoTextarea value={value} onChange={onChange}
          placeholder={placeholder} minRows={rows}
          style={{paddingRight:46}}/>
        {supported&&(
          <button onClick={rec?stopRec:startRec} style={{
            position:"absolute",top:10,right:10,background:rec?C.red:C.accent,
            border:"none",borderRadius:"50%",width:30,height:30,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>
            {rec?<MicOff size={13} style={{color:"#fff"}}/>:<Mic size={13} style={{color:"#fff"}}/>}
          </button>
        )}
      </div>
      {rec&&<div style={{fontSize:13,color:C.red,marginTop:4,display:"flex",alignItems:"center",gap:5}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:C.red,display:"inline-block",animation:"pulse 1s infinite"}}/>
        Grabando — habla con claridad
      </div>}
      <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
        {value&&<Btn sm onClick={onImprove} disabled={improving} primary>
          {improving?<><Spin/>Mejorando…</>:<><Sparkles size={12}/>Mejorar</>}
        </Btn>}
        {value&&onApply&&<Btn sm onClick={onApply} outline>
          {applied?<><Check size={12}/>Aplicado</>:<><Check size={12}/>Aplicar al informe</>}
        </Btn>}
      </div>
    </div>
  );
};

// ─── NAV BOTTOM ──────────────────────────────────────────────────────────────
const NavBottom = ({onPrev,onNext,onSave,saving,saved,prevLabel,nextLabel}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
    marginTop:32,marginBottom:24,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
    <div>
      {onPrev&&<Btn ghost onClick={onPrev}><ChevronLeft size={14}/>{prevLabel||"Anterior"}</Btn>}
    </div>
    <div style={{display:"flex",gap:10}}>
      {onSave&&<Btn ghost onClick={onSave} disabled={saving}>
        {saving?<><Spin/>Guardando…</>:saved?<><Check size={13} style={{color:C.green}}/>Guardado</>:<><Save size={13}/>Guardar cambios</>}
      </Btn>}
      {onNext&&<Btn primary onClick={onNext}>{nextLabel||"Siguiente"}<ChevronRight size={14}/></Btn>}
    </div>
  </div>
);

// ─── LOGO ─────────────────────────────────────────────────────────────────────
const Logo = () => (
  <div style={{display:"flex",alignItems:"center",gap:9}}>
    <div style={{width:32,height:32,background:`linear-gradient(135deg,${C.accent},#C1494E)`,
      borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <Sparkles size={14} style={{color:"#fff"}}/>
    </div>
    <div style={{lineHeight:1}}>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,letterSpacing:"-0.02em",fontSize:18}}>
        <span style={{color:"#fff"}}>PERIT</span><span style={{color:"#C1494E"}}>.IA</span>
      </div>
      <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",letterSpacing:".08em",textTransform:"uppercase"}}>Informes Periciales</div>
    </div>
  </div>
);

// ─── LOGIN / REGISTRO ─────────────────────────────────────────────────────────
const LoginScreen = ({onAuth}) => {
  const [mode,setMode]   = useState('login');
  const [email,setEmail] = useState('');
  const [pass,setPass]   = useState('');
  const [err,setErr]     = useState('');
  const [load,setLoad]   = useState(false);

  const [emailSent,setEmailSent] = useState(false);

  const submit = async () => {
    if(!email||!pass){ setErr('Introduce email y contraseña'); return; }
    if(pass.length < 6){ setErr('La contraseña debe tener mínimo 6 caracteres'); return; }
    setLoad(true); setErr('');
    try {
      const res = mode==='login'
        ? await sbAuth('token?grant_type=password', {email, password:pass})
        : await sbAuth('signup', {email, password:pass});

      // Error explícito de Supabase
      if(res.error || res.error_code) {
        const msg = res.error_description || res.message || res.error || 'Error de acceso';
        setErr(msg === 'Invalid login credentials' ? 'Email o contraseña incorrectos' : msg);
        setLoad(false); return;
      }

      // Signup sin session = confirmación de email requerida
      if(mode==='signup' && !res.access_token) {
        setEmailSent(true); setLoad(false); return;
      }

      const token = res.access_token;
      const user  = res.user || res;
      if(!token) { setErr('No se pudo obtener la sesión. Inténtalo de nuevo.'); setLoad(false); return; }
      onAuth(user, token);
    } catch(e) {
      setErr('Error de conexión con el servidor. Verifica tu conexión.');
    } finally {
      setLoad(false);
    }
  };

  return (
    <div style={{minHeight:'100vh',background:C.bg,backgroundImage:'radial-gradient(circle at 1px 1px, rgba(27,36,48,.06) 1px, transparent 0)',backgroundSize:'22px 22px',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <link rel="stylesheet" href={FONT}/>
      <div style={{width:380,maxWidth:'calc(100vw - 32px)',background:C.white,borderRadius:4,borderTop:`3px solid ${C.accent}`,padding:40,boxShadow:'0 12px 32px rgba(27,36,48,.13)'}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:30,fontWeight:700,color:C.ink,letterSpacing:'-0.02em'}}>
            PERIT<span style={{color:C.accent}}>.IA</span>
          </div>
          <div style={{fontSize:14,color:C.muted,marginTop:4}}>
            {mode==='login'?'Accede a tu cuenta':'Crea tu cuenta'}
          </div>
        </div>

        <div style={{marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:600,color:C.muted,marginBottom:5,textTransform:'uppercase',letterSpacing:'.04em'}}>Email</div>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&submit()}
            placeholder="perito@ejemplo.com"
            style={inpStyle(false)}/>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:600,color:C.muted,marginBottom:5,textTransform:'uppercase',letterSpacing:'.04em'}}>Contraseña</div>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&submit()}
            placeholder="••••••••"
            style={inpStyle(false)}/>
        </div>

        {emailSent&&<div style={{background:C.greenBg,border:'1px solid #A7F3D0',borderRadius:7,padding:'10px 14px',fontSize:15,color:C.green,marginBottom:14,lineHeight:1.6}}>
          <b style={{display:"inline-flex",alignItems:"center",gap:6}}><Mail size={13}/>Revisa tu correo</b><br/>
          Te hemos enviado un email de confirmación a <b>{email}</b>.<br/>
          Confirma tu cuenta y luego <button onClick={()=>{setMode('login');setEmailSent(false);}} style={{background:'none',border:'none',color:C.accent,cursor:'pointer',fontWeight:600,fontSize:15,fontFamily:'inherit',padding:0}}>inicia sesión</button>.
        </div>}

        {err&&<div style={{background:C.redBg,border:'1px solid #FECACA',borderRadius:7,padding:'8px 12px',fontSize:14,color:C.red,marginBottom:14}}>{err}</div>}

        {!emailSent&&<Btn primary full disabled={load} onClick={submit}>
          {load?'Conectando…':mode==='login'?'Entrar':'Crear cuenta'}
        </Btn>}

        <div style={{textAlign:'center',marginTop:16,fontSize:15,color:C.muted}}>
          {mode==='login'?'¿No tienes cuenta? ':'¿Ya tienes cuenta? '}
          <button onClick={()=>{setMode(mode==='login'?'signup':'login');setErr('');}}
            style={{background:'none',border:'none',color:C.accent,cursor:'pointer',fontWeight:600,fontSize:15,fontFamily:'inherit',padding:0}}>
            {mode==='login'?'Regístrate':'Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const ESTADO_COLOR = {"En curso":[C.plano,C.planoLight],"Pendiente revisión":[C.orange,C.orangeBg],"Finalizado":[C.green,C.greenBg]};
const TIPO_LABEL = {PERITACION:"Peritación",INSTANT_PAYMENT:"Instant Payment"};
const fmtUpdated = v => {
  if(!v) return "";
  const d = new Date(v);
  if(isNaN(d)) return "";
  return d.toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"})+" "+d.toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"});
};
const DASH_FILTERS_EMPTY = {asegurado:"",compania:"",numReferencia:"",ramo:"",tipo:"",provincia:"",estado:"",progreso:"",updatedAt:""};

const Dashboard = ({cases,onNew,onOpen,onDelete,user,onSignOut,loading,sidebarOpen,setSidebarOpen}) => {
  const [dashView,setDashView] = useState("tabla");
  const [filters,setFilters] = useState(DASH_FILTERS_EMPTY);
  const [sortCol,setSortCol] = useState(null);
  const [sortDir,setSortDir] = useState("asc");
  const [mobileFiltersOpen,setMobileFiltersOpen] = useState(false);
  const setF = (k,v) => setFilters(p=>({...p,[k]:v}));
  const toggleSort = col => { if(sortCol===col) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortCol(col); setSortDir("asc"); } };

  const rows = cases.map(cas=>{
    const e=cas.encargo||{};
    const done=[cas.s1,cas.s2,cas.s3,cas.s4].filter(s=>s&&Object.keys(s).length>2).length;
    const estado = cas.estado==="exportado"?"Finalizado":(done===4?"Pendiente revisión":"En curso");
    return {cas,e,done,estado};
  });
  const compOptions = [...new Set(rows.map(r=>r.e.compania).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));
  const ramoOptions = [...new Set(rows.map(r=>r.e.ramo).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));
  const tipoOptions = [...new Set(rows.map(r=>r.e.tipoEncargo).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));

  const filtered = rows.filter(r=>{
    const f=filters;
    if(f.asegurado && !(r.e.asegurado||"").toLowerCase().includes(f.asegurado.toLowerCase())) return false;
    if(f.compania && r.e.compania!==f.compania) return false;
    if(f.numReferencia && !(r.e.numReferencia||"").toLowerCase().includes(f.numReferencia.toLowerCase())) return false;
    if(f.ramo && r.e.ramo!==f.ramo) return false;
    if(f.tipo && r.e.tipoEncargo!==f.tipo) return false;
    if(f.provincia && !(r.e.provincia||"").toLowerCase().includes(f.provincia.toLowerCase())) return false;
    if(f.estado && r.estado!==f.estado) return false;
    if(f.progreso && `${r.done}/4`!==f.progreso) return false;
    if(f.updatedAt && !fmtUpdated(r.cas.updatedAt).toLowerCase().includes(f.updatedAt.toLowerCase())) return false;
    return true;
  });
  const sortGetters = {
    asegurado:r=>r.e.asegurado||"", compania:r=>r.e.compania||"", numReferencia:r=>r.e.numReferencia||"",
    ramo:r=>r.e.ramo||"", tipo:r=>r.e.tipoEncargo||"", provincia:r=>r.e.provincia||"",
    estado:r=>r.estado||"", progreso:r=>r.done, updatedAt:r=>r.cas.updatedAt||"",
  };
  const sorted = sortCol ? [...filtered].sort((a,b)=>{
    const av=sortGetters[sortCol](a), bv=sortGetters[sortCol](b);
    const cmp = typeof av==="number"&&typeof bv==="number" ? av-bv : String(av).localeCompare(String(bv),"es");
    return sortDir==="asc"?cmp:-cmp;
  }) : filtered;
  const filtersActive = Object.values(filters).some(Boolean);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const SortTh = ({col,label,align}) => (
    <th onClick={()=>toggleSort(col)} style={{padding:"8px 10px",textAlign:align||"left",color:"rgba(255,255,255,.85)",
      fontWeight:700,fontSize:12.5,textTransform:"uppercase",letterSpacing:".04em",cursor:"pointer",whiteSpace:"nowrap",userSelect:"none"}}>
      {label} <span style={{opacity:sortCol===col?1:.3,fontSize:11}}>{sortCol===col?(sortDir==="asc"?"▲":"▼"):"▲"}</span>
    </th>
  );
  const FilterTd = ({children}) => <td style={{padding:"5px 8px",background:C.white,borderBottom:`2px solid ${C.border}`}}>{children}</td>;
  const filterInpStyle = {width:"100%",padding:"5px 7px",border:`1px solid ${C.border}`,borderRadius:6,fontSize:13.5,fontFamily:"inherit",outline:"none"};

  return (
    <div style={{minHeight:"100vh",display:"flex",background:C.bg}}>

      {/* SIDEBAR */}
      {sidebarOpen&&<div className="sidebar-backdrop" onClick={()=>setSidebarOpen(false)}/>}
      <div className={sidebarOpen?"app-sidebar sb-open":"app-sidebar"} style={{width:sidebarOpen?220:0,background:C.sidebar,flexShrink:0,overflow:"hidden",
        transition:"width .2s ease",display:"flex",flexDirection:"column"}}>
        {sidebarOpen&&<>
          <div style={{padding:"22px 16px 10px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <Logo/>
            <button className="sidebar-close" onClick={()=>setSidebarOpen(false)} aria-label="Cerrar menú"
              style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:6,padding:5,cursor:"pointer",color:"#fff",alignItems:"center",justifyContent:"center"}}>
              <X size={14}/>
            </button>
          </div>
          <div style={{height:1,background:"rgba(255,255,255,.07)",margin:"0 16px 10px"}}/>
          <div style={{padding:"4px 8px",flex:1}}>
            <button onClick={onNew} style={{width:"100%",display:"flex",alignItems:"center",gap:8,
              padding:"9px 12px",background:C.accent,color:"#fff",border:"none",borderRadius:9,
              cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"inherit",marginBottom:14}}>
              <Plus size={13}/>Nuevo encargo
            </button>
            <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6,padding:"0 2px"}}>Vista</div>
            <div style={{display:"flex",background:"rgba(255,255,255,.07)",borderRadius:9,padding:2,gap:2}}>
              {[["tabla","Tabla"],["tarjetas","Tarjetas"]].map(([v,l])=>(
                <button key={v} onClick={()=>setDashView(v)} style={{flex:1,padding:"6px 0",borderRadius:7,border:"none",cursor:"pointer",
                  background:dashView===v?C.accent:"transparent",color:dashView===v?"#fff":"rgba(255,255,255,.5)",
                  fontSize:13,fontWeight:600,fontFamily:"inherit"}}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,.07)",fontSize:13,color:"rgba(255,255,255,.4)"}}>
            <div style={{marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.email}</div>
            <button onClick={onSignOut} style={{background:"none",border:"none",cursor:"pointer",
              color:"rgba(255,255,255,.35)",fontSize:13,fontFamily:"inherit",padding:0}}>
              Cerrar sesión
            </button>
          </div>
        </>}
      </div>

      {/* MAIN */}
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>

        {/* TOPBAR */}
        <div style={{background:C.accent,padding:"9px 16px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          {!sidebarOpen&&<button onClick={()=>setSidebarOpen(true)} title="Mostrar menú" aria-label="Mostrar menú"
            style={{width:28,height:28,borderRadius:9,background:"rgba(255,255,255,.16)",border:"none",
              cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",
              flexShrink:0,transition:"background .15s"}}
            onMouseEnter={ev=>ev.currentTarget.style.background="rgba(255,255,255,.28)"}
            onMouseLeave={ev=>ev.currentTarget.style.background="rgba(255,255,255,.16)"}>
            <ChevronRight size={13}/>
          </button>}
          <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,letterSpacing:"-0.02em",fontSize:17,color:"rgba(255,255,255,.9)"}}>
            PERIT<span style={{color:"rgba(255,255,255,.55)"}}>.IA</span>
          </span>
          <div style={{flex:1}}/>
          {!sidebarOpen&&<>
            <span style={{fontSize:13,color:"rgba(255,255,255,.5)"}}>{user?.email}</span>
            <button onClick={onNew} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:6,
              padding:"5px 12px",cursor:"pointer",color:"#fff",fontSize:14,fontWeight:600,fontFamily:"inherit",
              display:"flex",alignItems:"center",gap:5}}>
              <Plus size={12}/>Nuevo
            </button>
            <button onClick={onSignOut} style={{background:"none",border:"none",cursor:"pointer",
              color:"rgba(255,255,255,.4)",fontSize:13,fontFamily:"inherit"}}>Salir</button>
          </>}
        </div>

        {/* CONTENT */}
        <div style={{maxWidth:dashView==="tabla"?1320:860,margin:"0 auto",padding:"28px 24px",width:"100%",boxSizing:"border-box"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
            <div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:2}}>Panel de control</div>
              <h1 style={{fontFamily:"'DM Sans',sans-serif",fontSize:28,fontWeight:600,color:C.ink,marginBottom:4}}>Mis Encargos</h1>
              <p style={{color:C.muted,fontSize:15}}>{cases.length} expediente{cases.length!==1?"s":""}</p>
            </div>
            <Btn primary onClick={onNew}><Plus size={14}/>Nuevo Encargo</Btn>
          </div>
          {loading&&<div style={{textAlign:"center",padding:40,color:C.muted,fontSize:15}}>Cargando encargos…</div>}
          {!loading&&cases.length===0&&
            <Card s={{textAlign:"center",padding:"60px 40px"}}>
              <Building2 size={44} style={{color:C.border,marginBottom:14}}/>
              <h3 style={{fontFamily:"'DM Sans',sans-serif",fontSize:22,fontWeight:600,marginBottom:8}}>Sin encargos todavía</h3>
              <p style={{color:C.muted,fontSize:15,marginBottom:20}}>Sube el PDF del encargo para comenzar</p>
              <Btn primary onClick={onNew}><Plus size={14}/>Crear primer encargo</Btn>
            </Card>
          }

          {/* VISTA TABLA (oculta en móvil vía CSS) */}
          {!loading&&cases.length>0&&<div className="dash-table-wrap" style={{display:dashView==="tabla"?"block":"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:14,color:C.muted}}>Mostrando <b style={{color:C.ink}}>{sorted.length}</b> de <b style={{color:C.ink}}>{cases.length}</b> expedientes</span>
              {filtersActive&&<button onClick={()=>setFilters(DASH_FILTERS_EMPTY)}
                style={{background:"none",border:`1px solid ${C.border}`,borderRadius:7,padding:"4px 11px",cursor:"pointer",
                  color:C.accent,fontSize:13,fontWeight:600,fontFamily:"inherit"}}>Limpiar filtros</button>}
            </div>
            <div style={{overflowX:"auto",border:`1px solid ${C.border}`,borderRadius:10}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:14,minWidth:1100,background:C.white}}>
                <thead>
                  <tr style={{background:C.ink}}>
                    <SortTh col="asegurado" label="Asegurado"/>
                    <SortTh col="compania" label="Compañía"/>
                    <SortTh col="numReferencia" label="Nº Referencia"/>
                    <SortTh col="ramo" label="Ramo"/>
                    <SortTh col="tipo" label="Tipo"/>
                    <SortTh col="provincia" label="Provincia"/>
                    <SortTh col="estado" label="Estado"/>
                    <SortTh col="progreso" label="Progreso" align="center"/>
                    <SortTh col="updatedAt" label="Últ. modificación"/>
                    <th style={{width:70}}/>
                  </tr>
                  <tr>
                    <FilterTd><input style={filterInpStyle} placeholder="Filtrar…" value={filters.asegurado} onChange={e=>setF("asegurado",e.target.value)}/></FilterTd>
                    <FilterTd>
                      <select style={{...filterInpStyle,cursor:"pointer"}} value={filters.compania} onChange={e=>setF("compania",e.target.value)}>
                        <option value="">Todas</option>{compOptions.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </FilterTd>
                    <FilterTd><input style={filterInpStyle} placeholder="Filtrar…" value={filters.numReferencia} onChange={e=>setF("numReferencia",e.target.value)}/></FilterTd>
                    <FilterTd>
                      <select style={{...filterInpStyle,cursor:"pointer"}} value={filters.ramo} onChange={e=>setF("ramo",e.target.value)}>
                        <option value="">Todos</option>{ramoOptions.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </FilterTd>
                    <FilterTd>
                      <select style={{...filterInpStyle,cursor:"pointer"}} value={filters.tipo} onChange={e=>setF("tipo",e.target.value)}>
                        <option value="">Todos</option>{tipoOptions.map(o=><option key={o} value={o}>{TIPO_LABEL[o]||o}</option>)}
                      </select>
                    </FilterTd>
                    <FilterTd><input style={filterInpStyle} placeholder="Filtrar…" value={filters.provincia} onChange={e=>setF("provincia",e.target.value)}/></FilterTd>
                    <FilterTd>
                      <select style={{...filterInpStyle,cursor:"pointer"}} value={filters.estado} onChange={e=>setF("estado",e.target.value)}>
                        <option value="">Todos</option>{Object.keys(ESTADO_COLOR).map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </FilterTd>
                    <FilterTd>
                      <select style={{...filterInpStyle,cursor:"pointer"}} value={filters.progreso} onChange={e=>setF("progreso",e.target.value)}>
                        <option value="">Todos</option>{["0/4","1/4","2/4","3/4","4/4"].map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </FilterTd>
                    <FilterTd><input style={filterInpStyle} placeholder="Filtrar…" value={filters.updatedAt} onChange={e=>setF("updatedAt",e.target.value)}/></FilterTd>
                    <FilterTd>{null}</FilterTd>
                  </tr>
                </thead>
                <tbody>
                  {sorted.length===0&&<tr><td colSpan={10} style={{padding:24,textAlign:"center",color:C.muted,fontSize:14}}>Ningún expediente coincide con los filtros.</td></tr>}
                  {sorted.map(({cas,e,done,estado},ri)=>{
                    const [ecolor,ebg] = ESTADO_COLOR[estado];
                    return (
                      <tr key={cas.id} onClick={()=>onOpen(cas)} style={{cursor:"pointer",borderBottom:`1px solid ${C.border}`,
                          background:ri%2===0?"transparent":"rgba(44,95,107,.03)"}}
                        onMouseEnter={ev=>ev.currentTarget.style.background=C.accentLight}
                        onMouseLeave={ev=>ev.currentTarget.style.background=ri%2===0?"transparent":"rgba(44,95,107,.03)"}>
                        <td style={{padding:"9px 10px",fontWeight:600,color:C.ink,boxShadow:`inset 4px 0 0 ${ecolor}`}}>{e.asegurado||"Sin asegurado"}</td>
                        <td style={{padding:"9px 10px",color:C.ink}}>{normCompania(e.compania)||"—"}</td>
                        <td style={{padding:"9px 10px",fontWeight:600,fontVariantNumeric:"tabular-nums",color:C.ink}}>{e.numReferencia||"—"}</td>
                        <td style={{padding:"9px 10px",color:C.ink}}>{e.ramo||"—"}</td>
                        <td style={{padding:"9px 10px",color:C.ink}}>{TIPO_LABEL[e.tipoEncargo]||e.tipoEncargo||"—"}</td>
                        <td style={{padding:"9px 10px",color:C.ink}}>{e.provincia||"—"}</td>
                        <td style={{padding:"9px 10px"}}>
                          <span style={{background:ebg,color:ecolor,borderRadius:20,padding:"3px 10px",fontSize:13,fontWeight:700,whiteSpace:"nowrap"}}>{estado}</span>
                        </td>
                        <td style={{padding:"9px 10px",textAlign:"center"}}>
                          <span style={{background:C.greenBg,color:C.green,borderRadius:20,padding:"3px 10px",fontSize:13,fontWeight:700}}>{done}/4</span>
                        </td>
                        <td style={{padding:"9px 10px",color:C.muted,fontSize:13,whiteSpace:"nowrap"}}>{fmtUpdated(cas.updatedAt)||"—"}</td>
                        <td style={{padding:"9px 10px",textAlign:"right"}}>
                          <div style={{display:"flex",gap:6,alignItems:"center",justifyContent:"flex-end"}}>
                            {onDelete&&<button onClick={ev=>{ev.stopPropagation();if(confirm("¿Eliminar este encargo?"))onDelete(cas.id);}}
                              aria-label="Eliminar encargo"
                              style={{background:"none",border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 7px",
                                cursor:"pointer",color:C.muted,fontFamily:"inherit",fontSize:13}}>
                              <Trash2 size={11}/>
                            </button>}
                            <ChevronRight size={14} style={{color:C.muted}}/>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>}

          {/* BARRA DE FILTROS MÓVIL (solo <768px, junto a la vista de tarjetas) */}
          {!loading&&cases.length>0&&<div className="dash-mobile-filterbar" style={{display:"none",justifyContent:"flex-end",marginBottom:10}}>
            <button onClick={()=>setMobileFiltersOpen(true)}
              style={{display:"flex",alignItems:"center",gap:7,padding:"8px 15px",borderRadius:9,
                border:`1px solid ${C.border}`,background:C.white,cursor:"pointer",fontSize:14.5,
                fontWeight:600,color:C.ink,fontFamily:"inherit"}}>
              <List size={14}/> Filtros
              {activeFilterCount>0&&<span style={{background:C.accent,color:"#fff",borderRadius:20,minWidth:16,
                height:16,fontSize:12,fontWeight:700,display:"inline-flex",alignItems:"center",justifyContent:"center",
                padding:"0 4px"}}>{activeFilterCount}</span>}
            </button>
          </div>}

          {/* VISTA TARJETAS (siempre visible en móvil, sin rediseñar) — usa la misma lista filtrada/ordenada que la tabla */}
          {!loading&&cases.length>0&&<div className="dash-cards" style={{display:dashView==="tarjetas"?"flex":"none",flexDirection:"column",gap:8}}>
            {sorted.length===0&&<div style={{textAlign:"center",padding:30,color:C.muted,fontSize:14}}>Ningún expediente coincide con los filtros.</div>}
            {sorted.map(({cas,e,done})=>{
              return (
                <div key={cas.id} onClick={()=>onOpen(cas)}
                  style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,
                    padding:"16px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,
                    transition:"box-shadow .15s"}}
                  onMouseEnter={ev=>ev.currentTarget.style.boxShadow="0 12px 32px rgba(27,36,48,.13)"}
                  onMouseLeave={ev=>ev.currentTarget.style.boxShadow="none"}>
                  <div style={{width:42,height:42,background:C.accentLight,borderRadius:9,display:"flex",
                    alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <FileText size={18} style={{color:C.accent}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:17,color:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {e.asegurado||"Sin asegurado"}
                    </div>
                    <div style={{fontSize:14,color:C.muted,marginTop:2}}>
                      {normCompania(e.compania)||"—"} · <span style={{fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{e.numReferencia||"—"}</span> · {e.lugarIntervencion||""}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
                    <div style={{background:C.greenBg,color:C.green,borderRadius:20,padding:"3px 11px",fontSize:13,fontWeight:700}}>{done}/4</div>
                    {onDelete&&<button onClick={ev=>{ev.stopPropagation();if(confirm("¿Eliminar este encargo?"))onDelete(cas.id);}}
                      aria-label="Eliminar encargo"
                      style={{background:"none",border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 7px",
                        cursor:"pointer",color:C.muted,fontFamily:"inherit",fontSize:13}}>
                      <Trash2 size={11}/>
                    </button>}
                    <ChevronRight size={15} style={{color:C.muted}}/>
                  </div>
                </div>
              );
            })}
          </div>}

          {/* DRAWER DE FILTROS MÓVIL */}
          {mobileFiltersOpen&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:200,
              display:"flex",alignItems:"flex-end"}}
            onClick={ev=>{if(ev.target===ev.currentTarget)setMobileFiltersOpen(false);}}>
            <div style={{background:C.white,width:"100%",borderRadius:"16px 16px 0 0",maxHeight:"85vh",
                overflowY:"auto",padding:"18px 18px 22px",boxSizing:"border-box"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                {/* TODO: definir texto eyebrow (drawer de filtros móvil, sin contexto de página claro para el eyebrow) */}
                <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:20,color:C.ink}}>Filtros</span>
                <button onClick={()=>setMobileFiltersOpen(false)} aria-label="Cerrar filtros"
                  style={{background:"none",border:"none",cursor:"pointer",color:C.muted,padding:4}}><X size={20}/></button>
              </div>
              <Inp label="Asegurado" value={filters.asegurado} onChange={v=>setF("asegurado",v)} placeholder="Filtrar…"/>
              <Sel label="Compañía" value={filters.compania} onChange={v=>setF("compania",v)} options={compOptions}/>
              <Inp label="Nº Referencia" value={filters.numReferencia} onChange={v=>setF("numReferencia",v)} placeholder="Filtrar…" mono/>
              <Sel label="Ramo" value={filters.ramo} onChange={v=>setF("ramo",v)} options={ramoOptions}/>
              <Sel label="Tipo" value={filters.tipo} onChange={v=>setF("tipo",v)} options={tipoOptions.map(o=>({v:o,l:TIPO_LABEL[o]||o}))}/>
              <Inp label="Provincia" value={filters.provincia} onChange={v=>setF("provincia",v)} placeholder="Filtrar…"/>
              <Sel label="Estado" value={filters.estado} onChange={v=>setF("estado",v)} options={Object.keys(ESTADO_COLOR)}/>
              <Sel label="Progreso" value={filters.progreso} onChange={v=>setF("progreso",v)} options={["0/4","1/4","2/4","3/4","4/4"]}/>
              <Inp label="Últ. modificación" value={filters.updatedAt} onChange={v=>setF("updatedAt",v)} placeholder="Filtrar…"/>
              <div style={{display:"flex",gap:10,marginTop:6}}>
                <Btn ghost full onClick={()=>setFilters(DASH_FILTERS_EMPTY)}>Limpiar</Btn>
                <Btn primary full onClick={()=>setMobileFiltersOpen(false)}>Ver resultados ({sorted.length})</Btn>
              </div>
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
};
// ─── DROPZONE ─────────────────────────────────────────────────────────────────
const DropZone = ({label,sublabel,icon:Icon,file,onFile,accept=".pdf",badge,isLoading,loadingMsg}) => {
  const ref=useRef(); const [drag,setDrag]=useState(false);
  return (
    <div onDragOver={e=>{e.preventDefault();if(!isLoading)setDrag(true)}}
      onDragLeave={()=>setDrag(false)}
      onDrop={e=>{e.preventDefault();setDrag(false);if(!isLoading){const f=e.dataTransfer.files[0];if(f)onFile(f);}}}
      onClick={()=>{if(!isLoading)ref.current.click()}}
      style={{border:`2px dashed ${drag?C.accent:isLoading?C.accent:file?C.green:C.border}`,borderRadius:10,padding:"24px 18px",
        textAlign:"center",cursor:isLoading?"default":"pointer",
        background:drag?C.accentLight:isLoading?C.accentLight:file?C.greenBg:C.bg,
        transition:"all .2s",position:"relative",minHeight:120,display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",gap:7}}>
      {badge&&<div style={{position:"absolute",top:8,left:8,background:C.accent,color:"#fff",borderRadius:4,fontSize:12,fontWeight:700,padding:"2px 7px"}}>{badge}</div>}
      {isLoading
        ?<><Loader2 size={26} style={{color:C.accent,animation:"spin 1s linear infinite"}}/><div style={{fontWeight:600,fontSize:15,color:C.accent}}>{loadingMsg||"Procesando…"}</div></>
        :file
          ?<><div style={{width:32,height:32,background:C.green,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}><Check size={16} style={{color:"#fff"}}/></div>
              <div style={{fontWeight:600,fontSize:15,color:C.green}}>{file.name}</div>
              <div style={{fontSize:13,color:C.muted}}>{(file.size/1024).toFixed(0)} KB · clic para cambiar</div></>
          :<><Icon size={24} style={{color:drag?C.accent:C.muted}}/><div style={{fontWeight:600,fontSize:15,color:C.ink}}>{label}</div><div style={{fontSize:13,color:C.muted}}>{sublabel}</div></>
      }
      <input ref={ref} type="file" accept={accept} style={{display:"none"}} onChange={e=>e.target.files[0]&&onFile(e.target.files[0])}/>
    </div>
  );
};

// ─── UPLOAD ENCARGO ───────────────────────────────────────────────────────────
const UploadEncargo = ({onDone,onCancel,onTokens}) => {
  const [step,setStep]     = useState("upload");
  const [data,setData]     = useState({});
  const [encFile,setEncFile] = useState(null);
  const [polFile,setPolFile] = useState(null);
  const [polLoading,setPolLoading] = useState(false);
  const [msg,setMsg]       = useState("");

  const toB64 = f => new Promise(r=>{const fr=new FileReader();fr.onload=e=>r(e.target.result.split(",")[1]);fr.readAsDataURL(f);});

  const handlePolFile = async f => { setPolLoading(true); await new Promise(r=>setTimeout(r,300)); setPolFile(f); setPolLoading(false); };

  const processAll = async () => {
    if(!encFile) return;
    setStep("extracting");
    setMsg("Leyendo hoja de encargo…");
    const b64 = await toB64(encFile);
    const encPrompt = `Extrae del documento todos los campos y devuelve SOLO este JSON (sin markdown):
{
  "compania": "nombre de la compania aseguradora",
  "numReferencia": "numero de siniestro o referencia",
  "numPoliza": "numero de poliza",
  "ramo": "ramo del seguro",
  "garantia": "coberturas afectadas separadas por coma. Usa nombres comerciales: Atmosféricos, Daños por agua, Incendio, Robo, Daños eléctricos, RC Explotación, RC Locatario",
  "fechaEncargo": "fecha del encargo dd/mm/aaaa",
  "fechaSiniestro": "fecha de ocurrencia dd/mm/aaaa",
  "numExpInterno": "numero de expediente interno",
  "lugarIntervencion": "direccion completa con numero municipio y codigo postal",
  "provincia": "provincia solo el nombre",
  "municipio": "municipio",
  "asegurado": "nombre completo del asegurado o tomador",
  "nifAsegurado": "NIF o CIF del asegurado",
  "causa": "causa del siniestro",
  "descripcionSiniestro": "descripcion completa del siniestro",
  "codigoPostal": "codigo postal del lugar de intervencion (5 digitos)",
  "perito": "nombre completo del perito",
  "telPerito": "telefono del perito",
  "capitalContinente": "capital asegurado del CONTINENTE EDIFICIO u OBRAS DE REFORMA en euros solo el numero. Busca en tabla de garantias o capitales asegurados. Si no aparece pon 0",
  "capitalContenido": "capital asegurado del CONTENIDO MOBILIARIO o MERCANCIAS en euros solo el numero. Si no aparece pon 0",
  "franquicia": "franquicia general en euros solo el numero. Si no hay pon 0",
  "fechaEfecto": "fecha de efecto o inicio de la poliza en formato dd/mm/aaaa. En encargos AXA aparece como Fecha de efecto en la seccion Poliza al final del documento. Ejemplo: 30/06/2021",
  "tipoEncargo": "INSTANT_PAYMENT si el tipo contiene Instant Payment, PERITACION para cualquier otro tipo",
  "modalidadVisita": "PRESENCIAL si el perito visita el riesgo fisicamente, DOCUMENTAL si se gestiona sin visita presencial",
  "coberturaInferida": "si cobertura afectada vacia deduce de causa: Viento/Pedrisco/Lluvia/Nieve=Atmosféricos Agua/Filtracion=Daños por agua Incendio=Incendio Robo=Robo Electrico=Daños eléctricos sino vacio"
}`;
    const raw = await callClaude(
      "Eres un extractor experto de documentos periciales y de seguros espanoles. Responde SOLO con JSON valido sin markdown.",
      [{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}},
       {type:"text",text:encPrompt}],
      onTokens, 4000).catch(()=>"{}");
    const rawParsed = parseJSON(raw);
    // Check for API error response
    if(rawParsed?._apiError) {
      setStep("upload"); setMsg("");
      alert("Error de la API ("+rawParsed._status+"): "+rawParsed._msg+"\n\nRevisa la configuración de la API key en Vercel.");
      return;
    }
    const enc = rawParsed||{};
    if(!enc.numReferencia && !enc.asegurado && !enc.compania) {
      setStep("upload");
      setMsg("");
      alert("No se pudieron extraer los datos del PDF.\nComprueba que el archivo es un encargo válido e inténtalo de nuevo.");
      return;
    }

    let pol = {};
    if(polFile){
      setMsg("Leyendo poliza de seguro...");
      const pb64 = await toB64(polFile);
      const cobEnc = (enc.garantia||"").toUpperCase();
      const polPrompt = "Eres un perito de seguros experto en polizas AXA y similares. Analiza esta poliza y extrae los capitales correctos para el siniestro.\n\nCOBERTURA AFECTADA: " + cobEnc + "\n\nINSTRUCCIONES CRITICAS:\n- La poliza puede tener MULTIPLES valores para el continente (Edificio, Edificio primer riesgo, Obras de reforma...)\n- Para DAGUA, RGEXT, INCEN: usa EDIFICIO PRIMER RIESGO si existe con valor>0. Si no, usa OBRAS DE REFORMA.\n- Para RCEXP, RCLOC: usa el capital de RC, no el de continente.\n- NUNCA sumes los valores, elige UNO solo el mas relevante.\n- Para contenido: usa el capital principal de Mobiliario y maquinaria, NO sublimites.\n- Para 'descripciones': copia el texto EXACTO y literal tal como aparece en la poliza, palabra por palabra, sin resumir ni parafrasear, separando SIEMPRE continente y contenido. Si esa garantia NO tiene cobertura para el continente o para el contenido, copia el texto EXACTO de la clausula de exclusion o \"no cubre\"/\"queda excluido\" tal cual figura en la poliza (no lo inventes ni lo resumas).\n\nDevuelve SOLO este JSON sin markdown:\n{\n  \"capitalContinente\": \"numero en euros sin simbolo. Capital del continente mas relevante para " + cobEnc + ". Si no existe 0\",\n  \"tipoContinente\": \"tipo elegido: Edificio primer riesgo / Obras de reforma / Edificio\",\n  \"capitalContenido\": \"numero en euros. Capital principal mobiliario o contenido. Si no existe 0\",\n  \"franquicia\": \"numero en euros. Franquicia general. Si no hay 0\",\n  \"franquicias\": {\n    \"INCEN\": \"franquicia de la cobertura incendio en euros, solo numero. Si no tiene 0\",\n    \"DAGUA\": \"franquicia danos por agua en euros\",\n    \"RGEXT\": \"franquicia riesgos extensivos en euros\",\n    \"ROBO\": \"franquicia robo en euros\",\n    \"DELEC\": \"franquicia danos electricos en euros\",\n    \"RCEXP\": \"franquicia responsabilidad civil explotacion en euros\",\n    \"RCLOC\": \"franquicia responsabilidad civil locatario en euros\"\n  },\n  \"valorNuevoContinente\": true si el continente se asegura a valor de reposicion a nuevo false si no,\n  \"valorNuevoContenido\": true si el contenido se asegura a valor de reposicion a nuevo false si no,\n  \"depreciacionPoliza\": \"porcentaje de depreciacion que la poliza aplica a los bienes en la valoracion, solo numero. Si no aparece 0\",\n  \"garantiasActivas\": \"coberturas contratadas separadas por coma\",\n  \"condicionesEspeciales\": \"resumen breve de condiciones relevantes para la peritacion\",\n  \"primerRiesgo\": true si el capital continente elegido es a primer riesgo false si es valor total,\n  \"fechaEfecto\": \"fecha de efecto de la poliza en formato dd/mm/aaaa. Busca en primera pagina o datos del contrato. Ejemplo: 30/06/2021\",\n  \"productoContratado\": \"nombre comercial del producto o modalidad contratada, ej: Multirriesgo Empresa, Hogar Plus, Comercios\",\n  \"todosCapitalesContinente\": \"lista de TODOS los valores de continente: Edificio:0 / Edificio PR:6000 / Obras reforma:1388139\",\n  \"umbralLluvia\": \"litros/m2/hora minimos lluvia segun poliza ej 40\",\n  \"umbralViento\": \"kmh minimos viento segun poliza ej 80\",\n  \"tipoVivienda\": \"tipo de vivienda del apartado descripcion de la vivienda asegurada, ej: Piso, Chalet, Unifamiliar aislada. Vacio si no aparece\",\n  \"usoVivienda\": \"uso de la vivienda del apartado descripcion, ej: Habitual, Segunda residencia, Arrendamiento. Vacio si no aparece\",\n  \"ubicacionVivienda\": \"direccion o ubicacion exacta del riesgo del apartado descripcion de la vivienda asegurada. Vacio si no aparece\",\n  \"calidadPóliza\": \"calidad de los acabados si aparece en la poliza: Básica, Media o Alta. Vacio si no aparece\",\n  \"descripciones\": {\n    \"INCEN\": {\"continente\":\"texto EXACTO y literal de la poliza sobre cobertura de incendio en el CONTINENTE/edificio, o el texto EXACTO de exclusion/no cubre si no la tiene\",\"contenido\":\"texto EXACTO y literal de la poliza sobre cobertura de incendio en el CONTENIDO/mobiliario, o el texto EXACTO de exclusion/no cubre si no la tiene\"},\n    \"DAGUA\": {\"continente\":\"idem para danos por agua, continente\",\"contenido\":\"idem para danos por agua, contenido\"},\n    \"RCEXP\": {\"continente\":\"idem para RC explotacion, continente\",\"contenido\":\"idem para RC explotacion, contenido\"},\n    \"RGEXT\": {\"continente\":\"idem para riesgos extensivos, continente\",\"contenido\":\"idem para riesgos extensivos, contenido\"},\n    \"ROBO\": {\"continente\":\"idem para robo, continente\",\"contenido\":\"idem para robo, contenido\"},\n    \"DELEC\": {\"continente\":\"idem para danos electricos, continente\",\"contenido\":\"idem para danos electricos, contenido\"},\n    \"RCLOC\": {\"continente\":\"idem para RC locatario, continente\",\"contenido\":\"idem para RC locatario, contenido\"}\n  }\n}";
      // 8000 tokens: el JSON de la poliza incluye el texto literal de cada
      // cobertura ("descripciones"), que es largo. Con un limite mas ajustado la
      // respuesta se cortaba a medias, el JSON quedaba invalido y se descartaban
      // TODOS los datos de la poliza en silencio.
      const praw = await callClaude(
        "Eres un extractor experto de polizas de seguro empresariales espanolas, especialmente AXA Multirriesgo Empresa. Responde SOLO con JSON valido sin markdown.",
        [{type:"document",source:{type:"base64",media_type:"application/pdf",data:pb64}},
         {type:"text",text:polPrompt}],
        onTokens, 8000
      ).catch(()=>"{}");
      pol = parseJSON(praw);
      // Si la poliza no se pudo leer, avisamos: antes fallaba sin decir nada y el
      // perito solo notaba que faltaban capitales y la descripcion de cobertura.
      const polErr = iaError(pol);
      if(polErr){
        pol = {};
        alert("No se pudieron extraer los datos de la póliza.\n\n"+polErr+"\n\nEl encargo sí se ha leído: podrás continuar e introducir a mano los capitales y la descripción de la cobertura.");
      }
    }

    // Poliza tiene prioridad sobre encargo
    const bestCap = (a, b) => {
      const vb = parseCap(b);
      if(vb > 0) return String(vb);
      const va = parseCap(a);
      if(va > 0) return String(va);
      return "";
    };

    const CAUSA_COB = {VIENTO:"Atmosféricos",PEDRISCO:"Atmosféricos",LLUVIA:"Atmosféricos",NIEVE:"Atmosféricos",ATMOSFER:"Atmosféricos",TEMPORAL:"Atmosféricos",AGUA:"Daños por agua",FILTRAC:"Daños por agua",INCENDIO:"Incendio",FUEGO:"Incendio",ROBO:"Robo",HURTO:"Robo",ELECTRIC:"Daños eléctricos",RAYO:"Daños eléctricos",RCEXP:"RC Explotación",RCLOC:"RC Locatario"};
    const COD_NOMBRE = {"RGEXT":"Atmosféricos","DAGUA":"Daños por agua","INCEN":"Incendio","ROBO":"Robo","DELEC":"Daños eléctricos","RCEXP":"RC Explotación","RCLOC":"RC Locatario"};
    const toNombreComercial = v => { const r = COD_NOMBRE[v?.toUpperCase?.()?.trim()] || v || ""; return r ? r.charAt(0).toUpperCase()+r.slice(1) : ""; };
    const causaU = (enc.causa||"").toUpperCase();
    const inferidaDeCausa = toNombreComercial(enc.coberturaInferida)||Object.entries(CAUSA_COB).find(([k])=>causaU.includes(k))?.[1]||"";
    // Si hay póliza, buscar la garantía más relevante en las coberturas activas según la causa
    let cobFinal2 = toNombreComercial(enc.garantia)||"";
    if(pol.garantiasActivas && inferidaDeCausa) {
      const garsPoliza = (pol.garantiasActivas||"").split(/[;, ]+/);
      const inferidaU = inferidaDeCausa.toUpperCase();
      const matchPoliza = garsPoliza.find(g=>toNombreComercial(g).toUpperCase()===inferidaU||g.toUpperCase().includes(inferidaU)||inferidaU.includes(g.toUpperCase()));
      if(matchPoliza) cobFinal2 = toNombreComercial(matchPoliza)||matchPoliza;
    }
    if(!cobFinal2) cobFinal2 = inferidaDeCausa;
    const ramoU = (enc.ramo||"").toUpperCase();
    const esHogarEnc = ramoU.includes("HOGAR")||ramoU.includes("VIVIENDA");
    // En pólizas de EMPRESA, estas causas se cubren bajo "Riesgos Extensivos".
    const RGEXT_RE = /humo|choque|veh[ií]cul|aeronave|ondas?\s*s[oó]nic|s[oó]nic|vandal|tumultuar|huelga|derrame|escape|material\s*fundido|lluvia|viento|pedrisco|granizo|nieve|inundaci|impacto|desperfecto/;
    const textoCausa = `${enc.causa||""} ${enc.descripcionSiniestro||""} ${enc.coberturaInferida||""}`.toLowerCase();
    if(!esHogarEnc && RGEXT_RE.test(textoCausa)) cobFinal2 = "Riesgos Extensivos";
    // Franquicia específica de la cobertura afectada (si la póliza la detalla)
    const NOMBRE_COD = {"riesgos extensivos":"RGEXT","atmosféricos":"RGEXT","atmosfericos":"RGEXT","daños por agua":"DAGUA","danos por agua":"DAGUA","incendio":"INCEN","robo":"ROBO","daños eléctricos":"DELEC","danos electricos":"DELEC","rc explotación":"RCEXP","rc explotacion":"RCEXP","responsabilidad civil":"RCEXP","rc locatario":"RCLOC"};
    const codGar = NOMBRE_COD[(cobFinal2||"").toLowerCase().trim()] || "";
    const franquiciaFinal = (codGar && pol.franquicias && (codGar in pol.franquicias) && pol.franquicias[codGar]!=="")
      ? parseCap(pol.franquicias[codGar])
      : (parseCap(pol.franquicia||enc.franquicia)||0);
    const capCPol = parseCap(pol.capitalContinente||enc.capitalContinente);
    const normD = r => { const m=(r||"").match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/); return m?m[1].padStart(2,"0")+"/"+m[2].padStart(2,"0")+"/"+m[3]:r||""; };
    const bestCap2 = (a,b) => { const vb=parseCap(b); if(vb>0)return String(vb); const va=parseCap(a); if(va>0)return String(va); return ""; };
    setData({...enc,
      compania:                 normCompania(enc.compania),
      capitalContinente:        esHogarEnc?(capCPol>0?String(capCPol):""):bestCap2(enc.capitalContinente,pol.capitalContinente),
      capitalContenido:         bestCap2(enc.capitalContenido, pol.capitalContenido),
      franquicia:               String(franquiciaFinal),
      franquicias:              pol.franquicias||{},
      valorNuevoContinente:     pol.valorNuevoContinente||false,
      valorNuevoContenido:      pol.valorNuevoContenido||false,
      depreciacionPoliza:       String(Math.min(100,Math.max(0,parseCap(pol.depreciacionPoliza)||0))),
      garantia:                 cobFinal2,
      garantiasActivas:         pol.garantiasActivas||enc.garantia||"",
      condicionesEspeciales:    pol.condicionesEspeciales||"",
      productoContratado:       pol.productoContratado||"",
      codigoPostal:             enc.codigoPostal||"",
      primerRiesgo:             !!pol.primerRiesgo,
      tipoContinentePoliza:     pol.tipoContinente||"",
      todosCapitalesContinente: esHogarEnc?"":(pol.todosCapitalesContinente||""),
      tipoEncargo:              enc.tipoEncargo||"PERITACION",
      modalidadVisita:          enc.modalidadVisita||"PRESENCIAL",
      esHogar:                  esHogarEnc,
      umbralLluvia:             pol.umbralLluvia||"",
      umbralViento:             pol.umbralViento||"",
      fechaEfecto:              normD(pol.fechaEfecto||enc.fechaEfecto||""),
      descripciones:            pol.descripciones||{},
      polizaAdjunta:            !!polFile,
      tipoVivienda:             pol.tipoVivienda||"",
      usoVivienda:              pol.usoVivienda||"",
      ubicacionVivienda:        pol.ubicacionVivienda||"",
      calidadPóliza:            pol.calidadPóliza||"",
    });;
    setStep("review");
  };

  const s = f => v => setData(p=>({...p,[f]:v}));

  if(step==="upload") return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg}}>
      <div style={{width:580,maxWidth:'calc(100vw - 32px)',background:C.white,borderRadius:14,padding:38,border:`1px solid ${C.border}`}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:48,height:48,background:`linear-gradient(135deg,${C.accent},#C1494E)`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
            <Sparkles size={22} style={{color:"#fff"}}/>
          </div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:2}}>Encargos</div>
          <h2 style={{fontFamily:"'DM Sans',sans-serif",fontSize:24,fontWeight:600,color:C.ink,marginBottom:6}}>Nuevo Encargo</h2>
          <p style={{color:C.muted,fontSize:15}}>Adjunta el encargo y la póliza. Los datos se extraerán automáticamente.</p>
        </div>
        <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.ink,marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>Hoja de Encargo <span style={{color:C.accent}}>*</span></div>
            <DropZone label="Adjuntar encargo" sublabel="PDF de la compañía" icon={FileText} file={encFile} onFile={setEncFile} badge="Obligatorio"/>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.ink,marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>Póliza de Seguro</div>
            <DropZone label="Adjuntar póliza" sublabel="Para extraer capitales y garantías" icon={Shield} file={polFile} onFile={handlePolFile} badge="Opcional" isLoading={polLoading} loadingMsg="Subiendo póliza…"/>
          </div>
        </div>
        {encFile&&<div style={{background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:7,padding:"9px 12px",fontSize:14,color:C.green,marginBottom:14,display:"flex",alignItems:"center",gap:7}}>
          <Check size={13}/>
          <span><b>Listo.</b> {polFile?"Encargo y póliza adjuntos — se extraerán datos de ambos.":"Encargo adjunto. Sin póliza, los capitales se rellenarán manualmente."}</span>
        </div>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={()=>{setData({});setStep("review");}} style={{background:"none",border:"none",color:C.muted,fontSize:14,cursor:"pointer",textDecoration:"underline"}}>Crear sin documentos</button>
          <div style={{display:"flex",gap:10}}>
            <Btn ghost onClick={onCancel}>Cancelar</Btn>
            <Btn primary onClick={processAll} disabled={!encFile}><Sparkles size={13}/>Extraer datos</Btn>
          </div>
        </div>
      </div>
    </div>
  );

  if(step==="extracting") return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg}}>
      <div style={{textAlign:"center",maxWidth:360}}>
        <Loader2 size={40} style={{color:C.accent,animation:"spin 1s linear infinite",marginBottom:16}}/>
        <h3 style={{fontFamily:"'DM Sans',sans-serif",fontSize:21,fontWeight:600,marginBottom:6}}>Extrayendo datos…</h3>
        <p style={{color:C.accent,fontSize:15,fontWeight:600}}>{msg}</p>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,padding:"36px 0",overflowY:"auto"}}>
      <div style={{maxWidth:680,margin:"0 auto",padding:"0 24px"}}>
        <div style={{marginBottom:22}}>
          <div style={{fontSize:12,color:C.accent,fontWeight:700,letterSpacing:".08em",marginBottom:3,textTransform:"uppercase"}}>Datos extraídos</div>
          <h2 style={{fontFamily:"'DM Sans',sans-serif",fontSize:24,fontWeight:600,color:C.ink}}>Datos del Encargo</h2>
          <p style={{color:C.muted,fontSize:14,marginTop:3}}>Revisa y corrige antes de continuar</p>
        </div>
        <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"}}>
          {encFile&&<div style={{background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:6,padding:"4px 11px",fontSize:13,color:C.green,display:"flex",alignItems:"center",gap:4}}><Check size={10}/>Encargo: {encFile.name}</div>}
          {polFile&&<div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:6,padding:"4px 11px",fontSize:13,color:C.blue,display:"flex",alignItems:"center",gap:4}}><Check size={10}/>Póliza: {polFile.name}</div>}
        </div>

        <Card s={{marginBottom:12}}>
          <SectionLabel><Building2 size={12}/>Compañía y Siniestro</SectionLabel>
          <div style={{marginBottom:14}}>
            <Lbl c="Compañía" req/>
            <select value={COMPANIAS.find(c=>data.compania&&data.compania.toUpperCase().includes(c.toUpperCase()))||data.compania||""}
              onChange={e=>s("compania")(e.target.value)}
              style={{...inpStyle(false),cursor:"pointer",border:`1px solid ${data.compania?C.border:C.accent}`}}>
              <option value="">Seleccionar…</option>
              {COMPANIAS.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            {data.compania&&!COMPANIAS.find(c=>data.compania&&data.compania.toUpperCase().includes(c.toUpperCase()))&&
              <div style={{fontSize:13,color:C.orange,marginTop:3}}>Valor extraído: "{data.compania}" — selecciona manualmente</div>
            }
          </div>
          <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Nº Siniestro / Referencia" value={data.numReferencia} onChange={s("numReferencia")} required mono/>
            <Inp label="Nº Póliza" value={data.numPoliza} onChange={s("numPoliza")}/>
          </div>
          <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Ramo" value={data.ramo} onChange={s("ramo")}/>
            <Inp label="Garantía afectada" value={data.garantia} onChange={s("garantia")}/>
          </div>
          <Inp label="Producto contratado" value={data.productoContratado} onChange={s("productoContratado")} placeholder="Ej: Multirriesgo Empresa" hint={data.polizaAdjunta?"Extraído de la póliza":"Adjunta la póliza para extraer automáticamente"}/>
          <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Causa" value={data.causa} onChange={s("causa")}/>
            <Inp label="Nº de Encargo" value={data.numExpInterno} onChange={s("numExpInterno")}/>
          </div>
          <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Fecha Encargo" value={data.fechaEncargo} onChange={s("fechaEncargo")} placeholder="dd/mm/aaaa"/>
            <Inp label="Fecha Siniestro" value={data.fechaSiniestro} onChange={s("fechaSiniestro")} placeholder="dd/mm/aaaa"/>
          </div>
        </Card>

        <Card s={{marginBottom:12}}>
          <SectionLabel><MapPin size={12}/>Asegurado y Localización</SectionLabel>
          <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Asegurado / Tomador" value={data.asegurado} onChange={s("asegurado")} required/>
            <Inp label="NIF / CIF" value={data.nifAsegurado} onChange={s("nifAsegurado")}/>
          </div>
          <Inp label="Lugar de intervención" value={data.lugarIntervencion} onChange={s("lugarIntervencion")} required/>
          <div className="grid3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <Inp label="Código postal" value={data.codigoPostal} onChange={s("codigoPostal")} placeholder="Ej: 17230"/>
            <Inp label="Municipio" value={data.municipio} onChange={s("municipio")} placeholder="Ej: Palamós"/>
            <Inp label="Provincia" value={data.provincia} onChange={s("provincia")} placeholder="Ej: Girona"/>
          </div>
        </Card>

        <Card s={{marginBottom:12}}>
          <SectionLabel><DollarSign size={12}/>Capitales Asegurados {data.polizaAdjunta&&<span style={{color:C.green,fontWeight:400}}>de la póliza</span>}</SectionLabel>
          <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <EuroInput label="Capital Continente" value={data.capitalContinente} onChange={s("capitalContinente")}
                hint={data.tipoContinentePoliza?"Tipo: "+data.tipoContinentePoliza:data.polizaAdjunta?"Extraído de la póliza":"Introduce el valor de la póliza"}/>
              {data.todosCapitalesContinente&&<div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:5,padding:"5px 9px",fontSize:12,color:C.blue,marginTop:-10,marginBottom:8}}>
                Todos los capitales en póliza: {data.todosCapitalesContinente}
              </div>}
            </div>
            <EuroInput label="Capital Contenido" value={data.capitalContenido} onChange={s("capitalContenido")}
              hint={data.polizaAdjunta?"Extraído de la póliza":"Introduce el valor de la póliza"}/>
          </div>
          <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <EuroInput label="Franquicia" value={data.franquicia} onChange={s("franquicia")} hint="0,00 € si no hay franquicia"/>
            <Inp label="Fecha efecto póliza" value={data.fechaEfecto} onChange={s("fechaEfecto")} placeholder="dd/mm/aaaa"/>
          </div>
        </Card>

        <div style={{display:"flex",justifyContent:"space-between",paddingBottom:32}}>
          <Btn ghost onClick={onCancel}><ChevronLeft size={14}/>Cancelar</Btn>
          <Btn primary onClick={()=>onDone(data)}>Iniciar Informe<ChevronRight size={14}/></Btn>
        </div>
      </div>
    </div>
  );
};

// ─── SEC INFORME (live preview) ───────────────────────────────────────────────
const SecInforme = ({enc,s1,s2,s3,s4,anexos,onGoTo}) => {
  const prov = PROVINCIAS.find(p=>p.l===enc.provincia||p.v===enc.provincia);
  const arqKeyPrev = s1?.tipoArqKey || "unif_aislada";
  const vReal = calcVPreexCont(s1?.superficieConstruida, prov?.v||"00", arqKeyPrev, s1?.calidad||"Media");
  const capCont = parseFloat(enc.capitalContinente||0);
  const infraCont = vReal>0&&capCont>0&&capCont<vReal?((vReal-capCont)/vReal*100):0;
  const regla = infraCont>0?(capCont/vReal):1;
  const partidas = s3?.partidas||[];
  const totalDano = sumReal(getPartidas(s3));
  const ajustado = sumAjustado(enc,s1,s3);
  const indemn = calcIndemnizacion(enc,s1,s3);
  const showIVAp  = (s3?.modoValoracion||"baremo")!=="presupuesto";
  const showDeprp = !((s3?.modoValoracion==="presupuesto"||s3?.modoValoracion==="factura")&&s3?.perceptorTipo==="reparador");
  const rowsContP  = getPartidas(s3).filter(p=>p.garantia!=="contenido");
  const rowsCont2P = getPartidas(s3).filter(p=>p.garantia==="contenido");
  const totNuevoContP  = sumRepos(rowsContP),  totRealContP  = sumReal(rowsContP);
  const totNuevoCont2P = sumRepos(rowsCont2P), totRealCont2P = sumReal(rowsCont2P);
  const s3Intro = s4?.textoIntro||sec4IntroAuto(s3?.modoValoracion||"baremo");

  const Section = ({n,title,children,id,done}) => (
    <div style={{marginBottom:22,paddingBottom:22,borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,fontWeight:600,color:C.ink,borderBottom:`2px solid ${C.accent}`,paddingBottom:5}}>
          {n&&<span style={{fontSize:12,color:C.accent,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",display:"block",marginBottom:2}}>SECCIÓN {n}</span>}
          {title}
        </div>
        {!done&&<Btn sm ghost onClick={()=>onGoTo(id)}>Completar<ChevronRight size={13}/></Btn>}
        {done&&<span style={{fontSize:13,color:C.green,display:"flex",alignItems:"center",gap:4}}><Check size={11}/>Completado</span>}
      </div>
      {children}
    </div>
  );

  const Empty = ({msg}) => <div style={{fontSize:14,color:C.border,fontStyle:"italic",padding:"12px 0"}}>{msg}</div>;

  return (
    <div className="fade">
      <SecTitle label="Informe Pericial" sub="Vista en tiempo real del informe — se actualiza automáticamente"/>

      {/* CABECERA */}
      <Card s={{marginBottom:18,borderLeft:`4px solid ${C.accent}`,padding:24}}>
        <div style={{textAlign:"center",marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:26,fontStyle:"italic",color:C.ink}}>INFORME PERICIAL</div>
        </div>
        <div className="grid3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:16}}>
          {[["Compañía",normCompania(enc.compania)],["Nº Referencia",enc.numReferencia],["Nº Póliza",enc.numPoliza],
            ["Ramo",enc.ramo],["Garantía",enc.garantia],["Importe líquido",totalDano>0?fmtE(totalDano):null],
            ["Fecha Encargo",enc.fechaEncargo],["Fecha Siniestro",enc.fechaSiniestro],["Nº de Encargo",enc.numExpInterno],
          ].map(([k,v])=>(
            <div key={k} style={{borderBottom:`1px solid ${C.border}`,paddingBottom:7}}>
              <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:2}}>{k}</div>
              <div style={{fontSize:15,fontWeight:600,color:v?C.ink:C.border,fontVariantNumeric:k==="Nº Referencia"?"tabular-nums":"normal"}}>{v||"—"}</div>
            </div>
          ))}
        </div>
        <InfoRow label="Lugar de intervención" val={enc.lugarIntervencion+(enc.provincia?`, ${enc.provincia}`:"")}/>
        <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:10}}>
          <InfoRow label="Asegurado" val={enc.asegurado}/>
          <InfoRow label="Perito" val={enc.perito?(enc.perito+(enc.telPerito?" · "+enc.telPerito:"")):null}/>
        </div>
        <div style={{marginTop:14,padding:11,background:C.bg,borderRadius:7,fontSize:13,color:C.muted,lineHeight:1.7,fontStyle:"italic"}}>
          Este informe ha sido emitido a tenor del siniestro declarado en el riesgo asegurado. El que suscribe manifiesta bajo promesa de decir verdad que ha actuado con la mayor objetividad posible.
        </div>
      </Card>

      {/* PROGRESO */}
      <div style={{display:"flex",gap:7,marginBottom:18,flexWrap:"wrap"}}>
        {[["Encargo",!!(enc.asegurado&&enc.numReferencia)],["Sec.1",!!(s1?.superficieConstruida)],
          ["Sec.2",!!(s2?.textoAI)],["Sec.3",partidas.length>0],["Sec.4",!!(s4?.textoIntro||s4?.descripcionCobertura||s4?.textoIndemn)||partidas.length>0]
        ].map(([l,done])=>(
          <div key={l} style={{background:done?C.greenBg:C.tag,border:`1px solid ${done?"#A7F3D0":C.border}`,
            borderRadius:20,padding:"3px 11px",fontSize:13,fontWeight:600,color:done?C.green:C.muted,
            display:"flex",alignItems:"center",gap:4}}>
            {done&&<Check size={10}/>}{l}
          </div>
        ))}
        {indemn>0&&<div style={{background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:20,padding:"3px 14px",fontSize:14,fontWeight:700,color:C.green,marginLeft:"auto"}}>
          Indemnización: {fmtE(indemn)}
        </div>}
      </div>

      {/* SECCIÓN 1 */}
      <Section n="1" title="Verificación del Riesgo y Póliza" id="s1" done={!!(s1?.superficieConstruida||s1?.textoInstant)}>
        {enc.tipoEncargo==="INSTANT_PAYMENT"
          ? <div style={{fontSize:15,color:C.ink,lineHeight:1.8}}>
              {s1?.textoInstant||(`Localización del riesgo: el riesgo está situado en ${enc.lugarIntervencion||"—"}. Este siniestro se ha gestionado documentalmente.`)}
            </div>
          : s1?.superficieConstruida
          ?<>
            <div style={{fontSize:15,color:C.ink,lineHeight:1.8,marginBottom:12}}>
              {[["Tipo de riesgo",s1.tipoRiesgo],["Año de construcción",s1.anoConstruccion],
                ["Superficie construida",s1.superficieConstruida?" m²":null],
                ["Calidad de acabados",s1.calidad],["Estado general",s1.estado||"—"],
                ["Ref. catastral",s1.refCatastral]
              ].filter(([,v])=>v).map(([k,v])=><InfoRow key={k} label={k} val={k==="Superficie construida"?s1.superficieConstruida+" m²":v}/>)}
            </div>
            {(()=>{
              const cat = (anexos?.catastro||[]).find(c=>!(c.type?.includes('pdf')||c.url?.startsWith('data:application/pdf')));
              return cat?<div style={{marginBottom:12}}>
                <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Cartografía catastral</div>
                <img src={cat.url} alt="Catastro" style={{maxWidth:"100%",maxHeight:260,objectFit:"contain",border:`1px solid ${C.border}`,borderRadius:6,display:"block"}}/>
                {cat.caption&&<div style={{fontSize:12,color:C.muted,marginTop:3}}>{cat.caption}</div>}
              </div>:null;
            })()}
            <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["CONTINENTE",capCont,vReal,infraCont],["CONTENIDO",parseFloat(enc.capitalContenido||0),parseFloat(enc.capitalContenido||0),0]].map(([t,aseg,prev,infra])=>(
                <div key={t} style={{background:infra>0?C.redBg:C.greenBg,border:`1px solid ${infra>0?"#FECACA":"#A7F3D0"}`,borderRadius:7,padding:12}}>
                  <div style={{fontSize:12,fontWeight:700,color:infra>0?C.red:C.green,marginBottom:7,textTransform:"uppercase"}}>{t}</div>
                  {[["Valor Asegurado",fmtE(aseg)],["Valor Preexistente",fmtE(prev)],["Infraseguro",`${fmt(infra)} %`]].map(([k,v])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:14,marginBottom:3}}>
                      <span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600}}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {s1.aiText&&<div style={{marginTop:12,fontSize:14,color:C.ink,lineHeight:1.8,background:C.bg,borderRadius:7,padding:12,whiteSpace:"pre-wrap"}}>{s1.aiText}</div>}
          </>
          :<Empty msg="Completa la Sección 1 para ver los datos del riesgo"/>
        }
      </Section>

      {/* SECCIÓN 2 */}
      <Section n="2" title="Causas y Circunstancias" id="s2" done={!!(s2?.textoAI||s2?.textoRaw||s2?.meteo)}>
        {(s2?.textoAI||s2?.textoRaw||s2?.meteo)
          ?<>
            {(s2?.textoAI||s2?.textoRaw)&&<div style={{fontSize:15,color:C.ink,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{s2.textoAI||s2.textoRaw}</div>}
            {s2?.meteo&&<div style={{marginTop:(s2?.textoAI||s2?.textoRaw)?14:0}}>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:15,color:C.ink,marginBottom:6}}>Verificación meteorológica</div>
              {s2.meteo.texto&&<div style={{fontSize:15,color:C.ink,lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:6}}>{s2.meteo.texto}</div>}
              <MeteoTabla m={s2.meteo} enc={enc}/>
            </div>}
          </>
          :<Empty msg="Completa la Sección 2 para ver las causas y circunstancias"/>}
      </Section>

      {/* SECCIÓN 3 */}
      <Section n="3" title="Valoración de Daños" id="s3" done={partidas.length>0}>
        {partidas.length>0
          ?<>
            <div style={{fontSize:15,color:C.ink,lineHeight:1.8,marginBottom:14}}>Evaluada con arreglo a los criterios que se establecen en las condiciones de la póliza, resumimos la tasación de daños.</div>
            {s3Intro&&<div style={{fontSize:15,color:C.ink,lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:14}}>{s3Intro}</div>}
            {s3?.textoAI&&<div style={{fontSize:15,color:C.ink,lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:14}}>{s3.textoAI}</div>}
            {[["Daños en Continente",rowsContP],["Daños en Contenido",rowsCont2P]].filter(([,rows])=>rows.length>0).map(([titulo,rows])=>(
              <div key={titulo} style={{marginBottom:16}}>
                <div style={{fontSize:13,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>{titulo}</div>
                <table className="tbl-scroll" style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
                  <thead><tr style={{background:C.ink}}>
                    {["Oficio","Descripción-concepto","Uds","V.Unit.€","V.Repos.€",...(showIVAp?["%IVA","IVA €"]:[]),...(showDeprp?["Depr","%Depr"]:[]),"V.Real €","Perceptor","Cob."].map((h,hi)=>(
                      <th key={hi} style={{padding:"6px 6px",textAlign:h==="Descripción-concepto"||h==="Oficio"?"left":"right",color:"rgba(255,255,255,.85)",fontWeight:700,fontSize:12}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {rows.map((p,i)=>{
                      const {vRepos:vr,ivaAmt,vReal:vreal}=calcPartida(p);
                      return (<tr key={p.id||i} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?"transparent":"rgba(44,95,107,.04)"}}>
                        <td style={{padding:"5px 6px",fontSize:13,fontWeight:600,fontVariantNumeric:"tabular-nums",textTransform:"uppercase"}}>{p.oficio||""}</td>
                        <td style={{padding:"5px 6px",fontSize:13}}>{p.desc}</td>
                        <td style={{padding:"5px 6px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmtSmart(p.uds||1)}</td>
                        <td style={{padding:"5px 6px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmt(p.p)}</td>
                        <td style={{padding:"5px 6px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmt(vr)}</td>
                        {showIVAp&&<td style={{padding:"5px 6px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{p.ivaOn?fmtSmart(p.iva||21)+"%":"—"}</td>}
                        {showIVAp&&<td style={{padding:"5px 6px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmt(ivaAmt)}</td>}
                        {showDeprp&&<td style={{padding:"5px 6px",textAlign:"right"}}>{p.depr?"SI":"NO"}</td>}
                        {showDeprp&&<td style={{padding:"5px 6px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{p.depr?fmtSmart(p.pctDepr||0)+"%":"0"}</td>}
                        <td style={{padding:"5px 6px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmt(vreal)}</td>
                        <td style={{padding:"5px 6px",textAlign:"right"}}>{p.perceptor||"Asegurado"}</td>
                        <td style={{padding:"5px 6px",textAlign:"center"}}>{p.cobertura!==false?"Sí":"No"}</td>
                      </tr>);
                    })}
                    <tr style={{background:C.accentLight,fontWeight:700,borderTop:`2px solid ${C.accent}`}}>
                      <td colSpan={4} style={{padding:"7px 6px",color:C.accent}}>Subtotal</td>
                      <td style={{padding:"7px 6px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmt(sumRepos(rows))} €</td>
                      {showIVAp&&<td/>}
                      {showIVAp&&<td style={{padding:"7px 6px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmt(sumIVA(rows))} €</td>}
                      {showDeprp&&<td colSpan={2}/>}
                      <td style={{padding:"7px 6px",textAlign:"right",color:C.accent,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmtE(sumReal(rows))}</td>
                      <td colSpan={2}/>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
            <div style={{fontSize:13,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>Resumen de Daños</div>
            <table className="tbl-scroll" style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
              <thead><tr style={{background:C.ink}}>
                {["Garantía","Valor a nuevo","Valor real"].map((h,hi)=>(
                  <th key={hi} style={{padding:"6px 8px",textAlign:hi===0?"left":"right",color:"rgba(255,255,255,.85)",fontWeight:700,fontSize:12}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                <tr style={{borderBottom:`1px solid ${C.border}`}}>
                  <td style={{padding:"6px 8px",fontWeight:600}}>Total Continente</td>
                  <td style={{padding:"6px 8px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmtE(totNuevoContP)}</td>
                  <td style={{padding:"6px 8px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmtE(totRealContP)}</td>
                </tr>
                <tr style={{borderBottom:`1px solid ${C.border}`}}>
                  <td style={{padding:"6px 8px",fontWeight:600}}>Total Contenido</td>
                  <td style={{padding:"6px 8px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmtE(totNuevoCont2P)}</td>
                  <td style={{padding:"6px 8px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmtE(totRealCont2P)}</td>
                </tr>
                <tr style={{background:C.accentLight,fontWeight:700,borderTop:`2px solid ${C.accent}`}}>
                  <td style={{padding:"7px 8px",color:C.accent}}>Total estimación de daños</td>
                  <td style={{padding:"7px 8px",textAlign:"right",color:C.accent,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmtE(totNuevoContP+totNuevoCont2P)}</td>
                  <td style={{padding:"7px 8px",textAlign:"right",color:C.accent,fontSize:15,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmtE(totalDano)}</td>
                </tr>
              </tbody>
            </table>
          </>
          :<Empty msg="Completa la Sección 3 para ver la valoración de daños"/>}
      </Section>

      {/* SECCIÓN 4 */}
      {(()=>{
        const s4Desc   = s4?.descripcionCobertura||"";
        const s4Indemn = s4?.textoIndemn||sec4IndemnAuto(s3,indemn);
        const s4Done   = !!(s4?.textoIntro||s4?.descripcionCobertura||s4?.textoIndemn)||totalDano>0;
        return (
        <Section n="4" title="Estudio de Cobertura-Indemnización" id="s4" done={s4Done}>
          {s4Done
          ?<>
            {s4Desc&&<>
              <div style={{fontSize:13,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>4.1 Cobertura</div>
              <div style={{fontSize:15,color:C.ink,lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:14,background:C.bg,borderRadius:7,padding:12}}>{s4Desc}</div>
            </>}
            {totalDano>0&&<>
              <div style={{fontSize:13,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>4.2 Resumen por garantías. Propuesta de indemnización</div>
              <table className="tbl-scroll" style={{width:"100%",borderCollapse:"collapse",fontSize:14,marginBottom:14}}>
                <thead><tr style={{background:C.accentLight}}>
                  {["Garantía Afectada","D.con cobertura","Límite aseg.","Regla proporcional","Valor ajustado","Franquicia","Indemnización"].map(h=>(
                    <th key={h} style={{padding:"6px 8px",textAlign:h==="Garantía Afectada"?"left":"right",color:C.accent,fontWeight:700,fontSize:13}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  <tr style={{borderBottom:`1px solid ${C.border}`}}>
                    <td style={{padding:"8px",fontWeight:600}}>{enc.garantia||"CONTINENTE"}</td>
                    <td style={{padding:"8px",textAlign:"right"}}>{fmtE(totalDano)}</td>
                    <td style={{padding:"8px",textAlign:"right"}}>{fmtE(capCont)}</td>
                    <td style={{padding:"8px",textAlign:"right"}}>{totalDano>0&&ajustado<totalDano?`${fmtSmart(ajustado/totalDano*100)}%`:"NO"}</td>
                    <td style={{padding:"8px",textAlign:"right",fontWeight:600}}>{fmtE(ajustado)}</td>
                    <td style={{padding:"8px",textAlign:"right"}}>{fmtE(parseCap(s3?.franquiciaVal||enc.franquicia))}</td>
                    <td style={{padding:"8px",textAlign:"right",fontWeight:700,color:C.green}}>{fmtE(indemn)}</td>
                  </tr>
                </tbody>
              </table>
            </>}
            {s4Indemn&&<div style={{fontSize:15,color:C.ink,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{s4Indemn}</div>}
          </>
          :<Empty msg="Completa la Sección 4 para ver el estudio de cobertura"/>}
        </Section>
        );
      })()}

      {/* ANEXOS */}
      {(()=>{
        const allFotos    = anexos?.fotos||[];
        const allCatastro = anexos?.catastro||[];
        const allMeteosim = anexos?.meteosim||[];
        const allFacturas = [...(anexos?.facturas||[]),...(s3?.facturas||[])];
        const anyAnex = allFotos.length||allCatastro.length||allMeteosim.length||allFacturas.length;
        if(!anyAnex) return null;
        return (
          <div style={{marginBottom:22,paddingBottom:22,borderBottom:`1px solid ${C.border}`}}>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,fontWeight:600,color:C.ink,borderBottom:`2px solid ${C.accent}`,paddingBottom:5,marginBottom:14}}>Anexos</div>
            {[{label:"Reportaje fotográfico",items:allFotos},{label:"Info catastral",items:allCatastro},{label:"Info Meteosim",items:allMeteosim},{label:"Factura",items:allFacturas}]
              .filter(g=>g.items.length>0).map(g=>(
              <div key={g.label} style={{marginBottom:10}}>
                <div style={{fontSize:14,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>- {g.label}.</div>
                {g.label==="Reportaje fotográfico"
                  ?<div style={{display:"flex",flexDirection:"column",gap:14}}>
                    {allFotos.map((f,i)=>{
                      const isp=!!(f.type?.includes('pdf')||f.url?.startsWith('data:application/pdf'));
                      return (
                      <div key={f.id} style={{borderRadius:6,overflow:"hidden",border:`1px solid ${C.border}`,background:"#f5f5f5"}}>
                        {isp
                          ?<iframe src={f.url} title={f.name} style={{width:"100%",height:400,border:"none",pointerEvents:"none",display:"block"}}/>
                          :<img src={f.url} alt={f.caption} style={{width:"100%",height:"auto",maxHeight:520,objectFit:"contain",display:"block"}}/>
                        }
                        <div style={{padding:"6px 10px",fontSize:13,fontWeight:700,color:C.ink}}>Foto {i+1}</div>
                        {f.caption&&<div style={{fontSize:12,padding:"0 10px 8px",color:C.muted}}>{f.caption}</div>}
                      </div>
                      );
                    })}
                  </div>
                  :<div style={{fontSize:14,color:C.muted}}>
                    {g.items.map(f=><div key={f.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                      <Receipt size={11} style={{color:C.muted,flexShrink:0}}/>{f.name}
                    </div>)}
                  </div>
                }
              </div>
            ))}
          </div>
        );
      })()}

      <div style={{textAlign:"center",color:C.muted,fontSize:14,fontStyle:"italic",paddingTop:8}}>
        Por nuestra parte damos por finalizada la intervención en el siniestro, quedando a su disposición ante cualquier aclaración que estimen oportuna.
      </div>
    </div>
  );
};

// ─── SECCIÓN 1 ────────────────────────────────────────────────────────────────
const Sec1 = ({data,onChange,enc,onTokens,onNext,onSave,onAutoAnexo,scrollRef}) => {
  const [calSug,setCalSug]     = useState("");
  const [aiLoad,setAiLoad]     = useState(false);
  const [catLoad,setCatLoad]   = useState(false);
  const [catErr,setCatErr]     = useState("");
  const [catOk,setCatOk]       = useState(false);
  const s = f => v => onChange({...data,[f]:v});
  const esInstant = enc.tipoEncargo==="INSTANT_PAYMENT";

  // Consulta automática al Catastro: dirección -> referencia, superficie, año + captura de cartografía
  const consultarCatastro = async () => {
    setCatErr(""); setCatOk(false);
    if(!enc.lugarIntervencion && !enc.municipio){ setCatErr("Falta la dirección del lugar de intervención en los Datos del Encargo."); return; }
    setCatLoad(true);
    const r = await fetch('/api/catastro', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({direccion:enc.lugarIntervencion||"",municipio:enc.municipio||"",provincia:enc.provincia||"",cp:enc.codigoPostal||""})
    }).then(r=>r.json()).catch(()=>({ok:false,error:"Error de conexión con el Catastro."}));
    setCatLoad(false);
    if(!r || (!r.ok && !r.imagen)){ setCatErr(r?.error||"No se pudieron obtener datos del Catastro."); return; }
    const patch = {};
    if(r.ok){
      if(r.refCatastral) patch.refCatastral = r.refCatastral;
      if(r.superficie) patch.superficieConstruida = String(r.superficie);
      if(r.anoConstruccion) patch.anoConstruccion = String(r.anoConstruccion);
    }
    if(Object.keys(patch).length) onChange({...data,...patch});
    if(!r.ok) setCatErr(r.error||"No se encontraron datos catastrales para esta dirección.");
    if(r.imagen && onAutoAnexo){
      try { await onAutoAnexo("catastro", r.imagen, `catastro-${(r.refCatastral||enc.numReferencia||'captura')}.png`, "Documento"); setCatOk(true); }
      catch(e){ setCatErr(prev=>[prev,"No se pudo adjuntar la captura a Anexos: "+e.message].filter(Boolean).join(' · ')); }
    } else if(r.ok){ setCatOk(true); }
  };

  // Auto-fill from póliza extraction on mount
  useEffect(()=>{
    const normTipo = raw => {
      if(!raw) return "";
      const r = raw.toLowerCase();
      if(r.includes("hotel")||r.includes("apart-hotel")||r.includes("aparthotel")) return "Hotel / Apart-hotel";
      if(r.includes("hostal")||r.includes("pensión")||r.includes("pension")) return "Hostal / Pensión";
      if(r.includes("local comercial")||r.includes("local")) return "Local comercial";
      if(r.includes("oficin")) return "Oficinas";
      if(r.includes("comunidad")) return "Comunidad de propietarios";
      if(r.includes("industria")||r.includes("nave")||r.includes("almac")) return "Industria / Nave";
      if(r.includes("restaurante")||r.includes("bar")||r.includes("cafet")) return "Restaurante / Bar";
      if(r.includes("unifamiliar")||r.includes("chalet")||r.includes("casa aislada")||r.includes("adosado")) return "Vivienda unifamiliar";
      if(r.includes("piso")||r.includes("apartamento")||r.includes("ático")||r.includes("atico")||r.includes("vivienda")) return "Piso / Apartamento";
      return "Otro";
    };
    const upd = {};
    if(!data.tipoRiesgo && enc.tipoVivienda){ const n=normTipo(enc.tipoVivienda); if(n) upd.tipoRiesgo = n; }
    if(!data.usoVivienda && enc.usoVivienda) upd.usoVivienda = enc.usoVivienda;
    if(!data.ubicacion && enc.ubicacionVivienda) upd.ubicacion = enc.ubicacionVivienda;
    if(!data.calidad && enc.calidadPóliza) upd.calidad = enc.calidadPóliza;
    if(Object.keys(upd).length > 0) onChange({...data,...upd});
    // Depende de los campos de origen de la póliza: si la extracción llega
    // después del primer render, el auto-relleno se dispara igualmente. Las
    // guardas !data.X evitan sobrescribir ediciones del perito.
  },[enc.tipoVivienda, enc.usoVivienda, enc.ubicacionVivienda, enc.calidadPóliza]);

  // Auto-init instant text
  useEffect(()=>{
    if(esInstant && !data.textoInstant){
      const loc = enc.lugarIntervencion||enc.municipio||"";
      onChange({...data, textoInstant: `Localización del riesgo: el riesgo está situado en ${loc}. Este siniestro se ha gestionado documentalmente.`});
    }
    // Incluye la localización de origen: si llega tras el primer render, el
    // texto se inicializa igualmente (la guarda !data.textoInstant evita repetir).
  },[esInstant, enc.lugarIntervencion, enc.municipio]);


  const prov = PROVINCIAS.find(p=>p.l===enc.provincia||p.v===enc.provincia);
  const arqKey   = data.tipoArqKey||"unif_aislada";
  const capCont  = data.capContOverride!=null ? parseCap(data.capContOverride)  : parseCap(enc.capitalContinente);
  const capCont2 = data.capCont2Override!=null ? parseCap(data.capCont2Override) : parseCap(enc.capitalContenido);
  const primerRiesgoDetectado = !!enc.primerRiesgo;
  const vPreexCalc = calcVPreexCont(data.superficieConstruida, prov?.v||"00", arqKey, data.calidad||"Media");
  const vPreex = primerRiesgoDetectado ? capCont : vPreexCalc;
  const modulo = getModuloArq(prov?.v||"00", arqKey, data.calidad||"Media");
  const factor = getFactorArq(arqKey);
  const infraCont = !primerRiesgoDetectado&&vPreexCalc>0&&capCont>0&&capCont<vPreexCalc ? ((vPreexCalc-capCont)/vPreexCalc*100) : 0;

  if(esInstant) return (
    <div className="fade">
      <SecTitle n="1" label="Verificación del Riesgo y Póliza" sub="Siniestro gestionado documentalmente — Instant Payment"/>

      <Card s={{marginBottom:14}}>
        <SectionLabel>Texto de la Sección 1</SectionLabel>
        <div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:7,padding:"8px 12px",fontSize:14,color:C.blue,marginBottom:10}}>
          <b>Instant Payment — gestión documental.</b> El texto se genera automáticamente con la dirección del encargo. Edítalo si necesitas ajustarlo.
        </div>
        <AutoTextarea value={data.textoInstant} onChange={v=>onChange({...data,textoInstant:v})}
          minRows={3} style={{lineHeight:1.7,fontSize:15,marginBottom:8}}/>
        <Btn sm primary onClick={async ()=>{
          setAiLoad(true);
          const t = await callClaude(
            "Perito de seguros. Redacta en tercera persona, estilo pericial, conciso. Sin título de apartado.",
            `Mejora este texto para la sección de verificación del riesgo de un informe Instant Payment. Debe incluir la localización del riesgo y que se ha gestionado documentalmente:
TEXTO: "${data.textoInstant||""}"
DIRECCIÓN: ${enc.lugarIntervencion||""}, ${enc.municipio||""}`,
            onTokens
          ).catch(()=>data.textoInstant||"");
          onChange({...data,textoInstant:t});
          setAiLoad(false);
        }} disabled={aiLoad}>
          {aiLoad?<><Spin/>Mejorando…</>:<><Sparkles size={12}/>Mejorar</>}
        </Btn>
      </Card>

      {(enc.umbralViento||enc.umbralLluvia)&&<Card s={{marginBottom:14}}>
        <SectionLabel>Umbrales de Cobertura (Póliza)</SectionLabel>
        {enc.umbralViento&&<InfoRow label="Umbral velocidad viento" val={enc.umbralViento+" km/h"}/>}
        {enc.umbralLluvia&&<InfoRow label="Umbral precipitación lluvia" val={enc.umbralLluvia+" l/m²/h"}/>}
      </Card>}

      <NavBottom onNext={onNext} nextLabel="Siguiente — Causas y Circunstancias"/>
    </div>
  );

  // Computed for tipo arquitectura selectors
  const n2opciones = ARQ_N2[data.tipoArqNivel1||"Residencial"]||[];
  const n3opciones = ARQ_N3[data.tipoArqNivel2||""]||[];
  const arqLabel = n3opciones.find(x=>x.k===arqKey)?.l||"";
  const vPCont = data.vPreexContenido!=null?parseCap(data.vPreexContenido):capCont2;
  const infraC2 = vPCont>0&&capCont2>0&&capCont2<vPCont?((vPCont-capCont2)/vPCont*100):0;
  const s1b = s1BlockStates(data,enc);

  return (
    <div className="fade">
      <SecTitle n="1" label="Verificación del Riesgo y Póliza" sub="Datos del inmueble asegurado, capitales y detección de infraseguro"/>

      <ContextBar items={[
        {k:"Cap. continente (póliza)",v:fmtE(parseCap(enc.capitalContinente))},
        {k:"Cap. contenido (póliza)",v:fmtE(parseCap(enc.capitalContenido))},
        {k:"Primer riesgo",v:primerRiesgoDetectado?"Sí":"No",mono:false},
      ]}/>

      <ZoneLabel zone="trabajo">Datos del perito</ZoneLabel>

      <Block title="Datos del Riesgo Asegurado" done={s1b[0]}
        summary={`${data.tipoRiesgo||"tipo sin definir"} · ${data.usoVivienda||"uso sin definir"} · ${data.estado||"estado pendiente de la visita"}`}>
        <Sel label="Tipo de vivienda" value={data.tipoRiesgo} onChange={s("tipoRiesgo")} options={TIPOS_USO}
          hint={data.tipoRiesgo?"Extraído de póliza — editable":""}/>
        <Inp label="Uso de vivienda" value={data.usoVivienda||""} onChange={s("usoVivienda")}
          placeholder="Ej: Habitual, Segunda residencia, Arrendamiento…"
          hint={data.usoVivienda?"Extraído de póliza — editable":"Extraer de la descripción de la vivienda en la póliza"}/>
        <Inp label="Ubicación" value={data.ubicacion||""} onChange={s("ubicacion")}
          placeholder="Dirección o ubicación del riesgo asegurado"
          hint={data.ubicacion?"Extraído de póliza — editable":"Extraer de la descripción de la vivienda en la póliza"}/>

        <div style={{marginBottom:14}}>
          <Lbl c="Calidad de acabados"/>
          {enc.calidadPóliza&&!data.calidad&&<div style={{fontSize:13,color:C.green,marginBottom:4}}>
            Detectado en póliza: <b>{enc.calidadPóliza}</b> — seleccionado automáticamente
          </div>}
          <select value={data.calidad||(enc.calidadPóliza||"")} onChange={e=>s("calidad")(e.target.value)}
            style={{...inpStyle(false),cursor:"pointer",border:`1.5px solid ${(data.calidad||enc.calidadPóliza)?"#A7F3D0":C.border}`}}>
            <option value="">Seleccionar…</option>
            {["Básica","Media","Alta"].map(o=><option key={o}>{o}</option>)}
          </select>
          {calSug&&<div style={{background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:5,padding:"7px 10px",marginTop:5,fontSize:13,color:C.green}}>
            <b>Sugerencia:</b> {data.calidad||enc.calidadPóliza} — {calSug}
          </div>}
        </div>
        <Sel label="Estado general del riesgo (rellenar tras visita)" value={data.estado} onChange={s("estado")}
          options={["Nuevo","Buen estado","Reformado","Usado","Deteriorado"]}/>
        {!data.estado&&<div style={{fontSize:13,color:C.orange,marginTop:-10,marginBottom:10,display:"flex",alignItems:"center",gap:5}}>
          <AlertTriangle size={12}/>Pendiente de rellenar tras la visita presencial</div>}
      </Block>

      {/* SUPERFICIE Y ARQUITECTURA — Catastro + Tipo de Arquitectura fusionados:
          las dos sirven para lo mismo, obtener superficie y módulo de cálculo. */}
      <Block title="Superficie y Arquitectura" done={s1b[1]}
        summary={`${data.superficieConstruida?data.superficieConstruida+" m²":"superficie sin indicar"} · ${arqLabel||"tipo de construcción sin seleccionar"}`}>
        <Btn primary full onClick={consultarCatastro} disabled={catLoad}>
          {catLoad?<><Spin/>Consultando Catastro…</>:<><FileImage size={13}/>Consultar Catastro</>}
        </Btn>
        {catErr&&<div style={{background:C.orangeBg,border:"1px solid #FED7AA",borderRadius:6,padding:"8px 10px",marginTop:8,fontSize:13,color:C.orange}}>{catErr}</div>}
        {catOk&&!catErr&&<div style={{background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:6,padding:"8px 10px",marginTop:8,fontSize:13,color:C.green,display:"flex",alignItems:"center",gap:6}}><Check size={12}/>Datos y captura del Catastro añadidos (revisa los campos y los Anexos).</div>}
        <a href={`https://www1.sedecatastro.gob.es/cartografia/mapa.aspx?buscar=S&del=&muni=&cp=${encodeURIComponent(enc.lugarIntervencion||"")}`}
          target="_blank" rel="noreferrer"
          style={{display:"flex",alignItems:"center",gap:8,background:C.white,color:C.blue,border:`1px solid ${C.border}`,borderRadius:7,
            padding:"8px 16px",fontSize:14,fontWeight:600,textDecoration:"none",margin:"12px 0",justifyContent:"center"}}>
          <ExternalLink size={13}/>Abrir Sede del Catastro (consulta manual)
        </a>
        <Inp label="Referencia Catastral" value={data.refCatastral} onChange={s("refCatastral")} placeholder="Ej: 0731107EG1303S0001UG"/>
        <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Superficie construida (m²)" value={data.superficieConstruida} onChange={s("superficieConstruida")} type="number"/>
          <Inp label="Año de construcción" value={data.anoConstruccion} onChange={s("anoConstruccion")} type="number"/>
        </div>

        <div style={{height:1,background:C.border,margin:"14px 0"}}/>
        <div style={{fontSize:14,color:C.muted,marginBottom:12}}>Selecciona el tipo para calcular el valor preexistente del continente.</div>

        {/* Nivel 1 */}
        <div style={{marginBottom:12}}>
          <Lbl c="Categoría principal"/>
          <div style={{display:"flex",gap:10,marginTop:4}}>
            {["Residencial","No residencial"].map(n1=>(
              <div key={n1} onClick={()=>onChange({...data,tipoArqNivel1:n1,tipoArqNivel2:"",tipoArqKey:""})}
                style={{flex:1,padding:"10px 12px",borderRadius:7,cursor:"pointer",textAlign:"center",
                  border:`2px solid ${(data.tipoArqNivel1||"Residencial")===n1?C.accent:C.border}`,
                  background:(data.tipoArqNivel1||"Residencial")===n1?C.accentLight:C.white,
                  fontWeight:700,fontSize:15,color:(data.tipoArqNivel1||"Residencial")===n1?C.accent:C.ink}}>
                {n1}
              </div>
            ))}
          </div>
        </div>

        {/* Nivel 2 */}
        <div style={{marginBottom:12}}>
          <Lbl c="Tipo de uso"/>
          <select value={data.tipoArqNivel2||""} onChange={e=>onChange({...data,tipoArqNivel2:e.target.value,tipoArqKey:""})}
            style={{...inpStyle(false),cursor:"pointer"}}>
            <option value="">Seleccionar tipo…</option>
            {n2opciones.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {/* Nivel 3 */}
        {n3opciones.length>0&&<div style={{marginBottom:12}}>
          <Lbl c="Subtipo específico"/>
          <select value={arqKey||""} onChange={e=>onChange({...data,tipoArqKey:e.target.value})}
            style={{...inpStyle(false),cursor:"pointer",border:`1.5px solid ${arqKey?"#A7F3D0":C.border}`}}>
            <option value="">Seleccionar subtipo…</option>
            {n3opciones.map(o=><option key={o.k} value={o.k}>{o.l}</option>)}
          </select>
        </div>}

        {/* Módulo €/m² resultante */}
        {arqKey&&data.superficieConstruida&&(
          <div style={{background:C.accentLight,border:"1px solid #F0C0C0",borderRadius:7,padding:"10px 13px",fontSize:14}}>
            <div style={{fontWeight:700,color:C.accent,marginBottom:4}}>Módulo de cálculo</div>
            <div style={{color:C.muted}}>
              {fmt(modulo)} €/m² × {fmt(parseFloat(data.superficieConstruida))} m² × {factor.toFixed(3)} (factor completo) = <b style={{color:C.ink,fontSize:15}}>{fmtE(vPreexCalc)}</b>
            </div>
            <div style={{fontSize:12,color:C.muted,marginTop:3}}>
              Factor incluye: gastos generales (13%), SS (1%), BI (6%), IVA, honorarios y tasas — según tablas
            </div>
          </div>
        )}
      </Block>

      {/* CAPITALES ASEGURADOS — los dos capitales editables, agrupados */}
      <Block title="Capitales Asegurados" done={s1b[2]}
        summary={`Continente ${fmtE(capCont)} · Contenido ${fmtE(capCont2)}`}>
        {capCont===0&&<div style={{background:"#FEF3C7",border:"1px solid #FCD34D",borderRadius:7,padding:"10px 13px",marginBottom:12,fontSize:14,color:"#92400E",lineHeight:1.6}}>
          <b style={{display:"inline-flex",alignItems:"center",gap:5}}><AlertTriangle size={12}/>Capital asegurado no detectado.</b> Introduce el valor manualmente desde la póliza.
        </div>}
        <EuroInput label="Capital asegurado continente (de la póliza)" value={data.capContOverride!=null?data.capContOverride:enc.capitalContinente}
          onChange={v=>onChange({...data,capContOverride:v})}
          hint="Introduce el valor que figura en la póliza"/>
        <EuroInput label="Capital asegurado contenido (de la póliza)" value={data.capCont2Override!=null?data.capCont2Override:(enc.capitalContenido||0)}
          onChange={v=>onChange({...data,capCont2Override:v})}
          hint="Si la póliza no asegura contenido, déjalo en 0,00 €"/>
        <div style={{marginBottom:0}}>
          <Lbl c="Valor preexistente del contenido (editable)"/>
          <div style={{fontSize:13,color:C.muted,marginBottom:6}}>Por defecto igual al capital asegurado. Puedes ajustarlo si es necesario.</div>
          <EuroInput label="" value={data.vPreexContenido!=null?data.vPreexContenido:enc.capitalContenido}
            onChange={v=>onChange({...data,vPreexContenido:v})}
            hint=""/>
        </div>
      </Block>

      <ZoneLabel zone="resultado">Resultado</ZoneLabel>

      {primerRiesgoDetectado&&<div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:7,padding:"9px 12px",fontSize:14,color:C.blue,marginBottom:10}}>
        <b style={{display:"inline-flex",alignItems:"center",gap:5}}><Info size={12}/>Continente a primer riesgo contratado en póliza.</b> El valor preexistente es igual al capital asegurado.
      </div>}

      {!primerRiesgoDetectado&&<Formula>
        <b style={{fontWeight:600,fontVariantNumeric:"tabular-nums"}}>V.Preexistente</b> = Módulo €/m² × Superficie × Factor &nbsp;·&nbsp; <b style={{fontWeight:600,fontVariantNumeric:"tabular-nums"}}>Infraseguro %</b> = (V.Preexistente − V.Asegurado) / V.Preexistente × 100
        {arqKey&&data.superficieConstruida&&<div style={{color:C.muted,marginTop:4}}>
          Continente: {fmt(modulo)} €/m² × {fmt(parseFloat(data.superficieConstruida))} m² × {factor.toFixed(3)} = <b>{fmtE(vPreexCalc)}</b>
          {infraCont>0&&<> &nbsp;→&nbsp; ({fmtE(vPreexCalc)} − {fmtE(capCont)}) / {fmtE(vPreexCalc)} × 100 = <b>{fmt(infraCont)} %</b></>}
        </div>}
      </Formula>}

      <ResultTable cols={["Bloque","Valor asegurado","Valor preexistente","Infraseguro"]}>
        <tr style={{borderBottom:`1px solid ${C.border}`,background:infraCont>0?C.redBg:"transparent"}}>
          <td style={{padding:"8px 10px",fontWeight:600}}>Continente</td>
          <td style={{padding:"8px 10px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmtE(capCont)}</td>
          <td style={{padding:"8px 10px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmtE(vPreex)}</td>
          <td style={{padding:"8px 10px",textAlign:"right",fontWeight:700,fontVariantNumeric:"tabular-nums",color:infraCont>0?C.red:C.green}}>{fmt(infraCont)} %</td>
        </tr>
        <tr style={{background:infraC2>0?C.redBg:"transparent"}}>
          <td style={{padding:"8px 10px",fontWeight:600}}>Contenido</td>
          <td style={{padding:"8px 10px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmtE(capCont2)}</td>
          <td style={{padding:"8px 10px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmtE(vPCont)}</td>
          <td style={{padding:"8px 10px",textAlign:"right",fontWeight:700,fontVariantNumeric:"tabular-nums",color:infraC2>0?C.red:C.green}}>{fmt(infraC2)} %</td>
        </tr>
      </ResultTable>

      {!primerRiesgoDetectado&&arqKey&&data.superficieConstruida&&(
        <div style={{fontSize:13,color:C.muted,marginTop:8}}>
          {fmt(parseFloat(data.superficieConstruida))} m² × {fmt(modulo)} €/m² × {factor.toFixed(3)} = {fmtE(vPreexCalc)} · {arqLabel}
        </div>
      )}
      {infraCont>0&&<div style={{background:C.orangeBg,border:"1px solid #FED7AA",borderRadius:6,padding:"8px 10px",marginTop:8,fontSize:13,color:C.orange}}>
        <b style={{display:"inline-flex",alignItems:"center",gap:5}}><AlertTriangle size={12}/>Infraseguro continente {fmt(infraCont)}%</b> — Regla proporcional: coeficiente {(capCont/vPreex).toFixed(4)}
      </div>}
      {infraC2>0&&<div style={{background:C.orangeBg,border:"1px solid #FED7AA",borderRadius:6,padding:"8px 10px",marginTop:8,fontSize:13,color:C.orange}}>
        <b style={{display:"inline-flex",alignItems:"center",gap:5}}><AlertTriangle size={12}/>Infraseguro contenido {fmt(infraC2)}%</b> — Regla proporcional: coeficiente {(capCont2/vPCont).toFixed(4)}
      </div>}

      <NavBottom onNext={onNext} nextLabel="Siguiente — Causas y Circunstancias"/>
    </div>
  );
};

// ─── SECCIÓN 2 ────────────────────────────────────────────────────────────────
const Sec2 = ({data,onChange,enc,onTokens,onNext,onPrev,onSave,onAutoAnexo,scrollRef}) => {
  const [improving,setImproving] = useState(false);
  const [saved,setSaved]         = useState(false);
  const [meteoLoad,setMeteoLoad] = useState(false);
  const [meteoErr,setMeteoErr]   = useState("");
  const s = f => v => onChange({...data,[f]:v});
  const esAtmosferico = esSiniestroAtmosferico(enc);

  // Consulta automática a la estación XEMA más cercana (datos abiertos Meteocat)
  const consultarMeteo = async () => {
    setMeteoErr("");
    if(!enc.fechaSiniestro){ setMeteoErr("Falta la fecha del siniestro en los Datos del Encargo. Complétala para poder consultar."); return; }
    setMeteoLoad(true);
    const d = await fetchMeteoXEMA(enc).catch(()=>({ok:false,error:"Error de conexión con el servicio meteorológico."}));
    if(!d || !d.ok){ setMeteoErr(d?.error||"No se pudieron obtener datos meteorológicos."); setMeteoLoad(false); return; }
    // Redacción pericial del párrafo a partir de los datos medidos
    const sup = meteoSupera(d, enc);
    const texto = await callClaude(
      "Perito de seguros. Redacta en tercera persona, estilo pericial, conciso, un único párrafo. Sin título de apartado.",
      `Redacta un párrafo pericial sobre las condiciones meteorológicas registradas el día del siniestro, citando la estación automática oficial y comparando con los umbrales de la póliza cuando existan.
ESTACIÓN: ${d.estacio} (${d.municipiEstacio||""}), a ${d.distanciaKm} km del riesgo
FECHA: ${d.fecha}
RACHA MÁXIMA DE VIENTO: ${d.rachaMax} km/h${d.rachaHora?` (registrada a las ${d.rachaHora} h)`:''}
VIENTO MEDIO MÁXIMO: ${d.vientoMedioMax} km/h
PRECIPITACIÓN MÁXIMA EN UNA HORA: ${d.precipMaxHoraria} l/m²
PRECIPITACIÓN TOTAL DEL DÍA: ${d.precipTotal} l/m²
UMBRAL VIENTO PÓLIZA: ${enc.umbralViento||"no especificado"} km/h · UMBRAL LLUVIA PÓLIZA: ${enc.umbralLluvia||"no especificado"} l/m²/h
CONCLUSIÓN UMBRALES: ${sup.hayUmbral?sup.label:"la póliza no fija umbrales"}
Fuente: Servei Meteorològic de Catalunya, datos abiertos. Menciona la fuente al final sin usar siglas ni acrónimos técnicos.`,
      onTokens
    ).catch(()=>"");
    const textoLimpio = (texto&&!texto.includes('"_apiError"'))?texto:"";
    onChange({...data, meteo:{...d, texto:textoLimpio}});
    setMeteoLoad(false);
    if(d.imagen && onAutoAnexo){
      onAutoAnexo("meteosim", d.imagen, `xema-${d.codiEstacio||'estacio'}-${(enc.fechaSiniestro||'').replace(/\//g,'-')}.png`, "Documento")
        .catch(e=>setMeteoErr(prev=>[prev,"No se pudo adjuntar la captura del mapa a Anexos: "+e.message].filter(Boolean).join(' · ')));
    }
  };

  const improve = async () => {
    if(!data.textoRaw) return;
    setImproving(true);
    const text = await callClaude(
      "Perito de seguros. Redacta en tercera persona, estilo pericial, conciso. Sin título de apartado.",
      `Mejora este texto para causas y circunstancias del siniestro. Tercera persona, técnico, conciso:
CONTEXTO: ${enc.causa||""} — ${enc.lugarIntervencion||""}
"${data.textoRaw}"`,
      onTokens
    ).catch(()=>"Error de conexión.");
    onChange({...data,textoAI:text,aiApplied:false});
    setImproving(false);
  };

  const handleSave = () => { onSave?.(); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  const hayResultado = !!(data.meteo||data.textoAI);
  const s2b = s2BlockStates(data,enc);
  return (
    <div className="fade">
      <SecTitle n="2" label="Causas y Circunstancias" sub="Describe el siniestro — por voz o texto."/>

      <ContextBar items={[
        {k:"Garantía",v:enc.garantia||enc.causa||"—",mono:false},
        (enc.umbralViento||enc.umbralLluvia)&&{k:"Umbral viento",v:enc.umbralViento?enc.umbralViento+" km/h":"—"},
        (enc.umbralViento||enc.umbralLluvia)&&{k:"Umbral lluvia",v:enc.umbralLluvia?enc.umbralLluvia+" l/m²/h":"—"},
      ]}/>

      <ZoneLabel zone="trabajo">Datos del perito</ZoneLabel>

      <Block title="Descripción del Siniestro" done={s2b[0]}
        summary={data.textoRaw||data.textoAI ? (data.textoRaw||data.textoAI).slice(0,140)+((data.textoRaw||data.textoAI).length>140?"…":"") : "Sin describir todavía"}>
        <VoiceBox value={data.textoRaw||""} onChange={s("textoRaw")}
          onImprove={improve} improving={improving}
          onApply={()=>onChange({...data,aiApplied:true})} applied={data.aiApplied}
          placeholder="Describe el siniestro: cómo ocurrió, qué daños encontraste, qué te dijeron los afectados…" rows={5}/>
      </Block>

      {/* CONSULTA METEOROLÓGICA — solo si el siniestro es atmosférico */}
      {esAtmosferico&&(
        <Block title="Verificación Meteorológica (Meteocat)" done={s2b[1]}
          summary={data.meteo?`Estación ${data.meteo.estacio} · ${data.meteo.distanciaKm} km`:"Sin consultar todavía"}>
          <div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:7,padding:"9px 12px",fontSize:14,color:C.blue,marginBottom:12}}>
            Consulta automática a la estación automática oficial más cercana al lugar del siniestro. Compara el viento y la lluvia registrados el día del siniestro con los umbrales de la póliza.
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <Btn outline onClick={consultarMeteo} disabled={meteoLoad}>
              {meteoLoad?<><Loader2 size={12} style={{animation:"spin 1s linear infinite"}}/>Consultando…</>:<><Search size={12}/>{data.meteo?"Volver a consultar":"Consultar datos meteorológicos"}</>}
            </Btn>
            {data.meteo&&<span style={{fontSize:13,color:C.green,display:"flex",alignItems:"center",gap:4}}><Check size={12}/>Estación {data.meteo.estacio} · {data.meteo.distanciaKm} km</span>}
          </div>
          {meteoErr&&<div style={{marginTop:10,background:C.orangeBg,border:"1px solid #FDE68A",borderRadius:7,padding:"8px 12px",fontSize:14,color:C.orange}}>{meteoErr}</div>}
        </Block>
      )}

      {hayResultado&&<ZoneLabel zone="resultado">Resultado</ZoneLabel>}

      {data.meteo&&(
        <Card s={{marginBottom:14}}>
          <MeteoTabla m={data.meteo} enc={enc}/>
          <div style={{marginTop:12}}>
            <SectionLabel>Texto pericial meteorológico<AutoBadge>Automático</AutoBadge></SectionLabel>
            <AutoTextarea value={data.meteo.texto} onChange={v=>onChange({...data,meteo:{...data.meteo,texto:v}})}
              minRows={4} style={{fontSize:15}}
              placeholder="El texto se genera automáticamente tras la consulta. Puedes editarlo."/>
            <div style={{fontSize:13,color:C.muted,marginTop:4}}>Este bloque (tabla + texto) se incluye en la Sección 2 del informe exportado.</div>
          </div>
        </Card>
      )}

      {data.textoAI&&(
        <Card s={{marginBottom:14}}>
          <SectionLabel>Texto Pericial<AutoBadge>Automático</AutoBadge></SectionLabel>
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            <Btn sm ghost onClick={improve} disabled={improving}><RefreshCw size={10}/>Regenerar</Btn>
            <Btn sm outline onClick={()=>onChange({...data,aiApplied:true})}>{data.aiApplied?<><Check size={10}/>Aplicado</>:<><Check size={10}/>Aplicar al informe</>}</Btn>
          </div>
          <AutoTextarea value={data.textoAI} onChange={v=>onChange({...data,textoAI:v,aiEdited:true})}
            minRows={6} style={{fontSize:15}}/>
          {data.aiEdited&&<div style={{fontSize:13,color:C.orange,marginTop:3}}>Texto editado manualmente</div>}
        </Card>
      )}


      <NavBottom onPrev={onPrev} onSave={handleSave} onNext={onNext} saved={saved}
        prevLabel="Verificación del Riesgo" nextLabel="Siguiente — Valoración de Daños"/>
    </div>
  );
};

// ─── SECCIÓN 3 ────────────────────────────────────────────────────────────────
// Definido a nivel de módulo (no dentro de Sec3): si se define dentro del componente,
// React lo trata como un tipo nuevo en cada render y desmonta/remonta el <input> en cada
// tecla, perdiendo el foco. A nivel de módulo su identidad es estable entre renders.
const InpCell = ({val,onChange:oc,type="text",w=60,min,max}) => (
  <input type={type} value={val||""} min={min} max={max} onChange={e=>oc(type==="number"?+e.target.value:e.target.value)}
    style={{width:w,padding:"2px 4px",border:`1px solid ${C.border}`,borderRadius:3,fontSize:12,
      fontVariantNumeric:type==="number"?"tabular-nums":"normal",fontWeight:type==="number"?600:400,textAlign:type==="number"?"right":"left"}}/>
);

const Sec3 = ({data,onChange,enc,s1,onTokens,onNext,onPrev,onSave,scrollRef}) => {
  const [improving,setImproving] = useState(false);
  const [genLoad,setGenLoad]     = useState(false);
  const [genMsg,setGenMsg]       = useState(null); // {tipo:"error"|"aviso", texto}
  const [editParams,setEditParams] = useState(false); // despliega Parámetros de Garantía bajo el contexto
  const [saved,setSaved]         = useState(false);
  const [dragIdx,setDragIdx]     = useState(null);
  const [overIdx,setOverIdx]     = useState(null);
  const facRef                   = useRef();
  const s = f => v => onChange({...data,[f]:v});

  const partidas  = data.partidas||[];
  const modoVal   = data.modoValoracion||"baremo";   // baremo | presupuesto | factura
  const facturas  = data.facturas||[];
  const esBaremo  = modoVal==="baremo";
  const esPresup  = modoVal==="presupuesto";
  const esFactura = modoVal==="factura";
  const docMode   = esPresup||esFactura;             // requiere adjuntar documento
  const reparador = data.perceptorTipo==="reparador";
  const showIVA   = !esPresup;                        // presupuesto: sin columna IVA
  const showDepr  = !(docMode&&reparador);           // reparador: sin depreciación

  // Usa la fuente única global calcPartida
  const calc = calcPartida;
  const rowsActivas = getPartidas(data);
  // Subtotal de reposición de las partidas con cobertura SIN los costes indirectos
  const baseReposCov = sumRepos((partidas||[]).filter(x=>!x.indirecto&&x.cobertura!==false));
  const totRepos = sumRepos(rowsActivas);
  const totIVA   = sumIVA(rowsActivas);
  const totReal  = sumReal(rowsActivas);
  // Partidas activas por garantía, para las tablas Continente/Contenido y el resumen de daños
  const esContenido = p => p.garantia==="contenido";
  const partidasCont  = partidas.filter(p=>!esContenido(p));
  const partidasCont2 = partidas.filter(esContenido);
  const activasCont   = rowsActivas.filter(p=>!esContenido(p));
  const activasCont2  = rowsActivas.filter(esContenido);
  const totNuevoCont  = sumRepos(activasCont),  totRealCont  = sumReal(activasCont);
  const totNuevoCont2 = sumRepos(activasCont2), totRealCont2 = sumReal(activasCont2);
  const reglas   = calcReglas(enc, s1);
  const totAjustado = sumAjustado(enc, s1, data);
  const indemn   = calcIndemnizacion(enc, s1, data);

  // Validación: sin negativos en uds/precio; IVA y depreciación acotados a 0–100.
  // Evita que valores fuera de rango (tecleados o extraídos por la IA) corrompan la indemnización.
  const clampNum = (v,min,max) => { const n=+v; if(!isFinite(n)) return min; return Math.min(max,Math.max(min,n)); };
  const P_LIMITS = {uds:[0,Infinity], p:[0,Infinity], iva:[0,100], pctDepr:[0,100]};
  const clampField = (f,v) => P_LIMITS[f]?clampNum(v,P_LIMITS[f][0],P_LIMITS[f][1]):v;
  const sanP = p => ({...p, uds:clampNum(p.uds,0,Infinity), p:clampNum(p.p,0,Infinity), iva:clampNum(p.iva??0,0,100), pctDepr:clampNum(p.pctDepr,0,100)});
  const updP = (i,f,v) => onChange({...data,partidas:partidas.map((p,idx)=>idx===i?{...p,[f]:clampField(f,v)}:p)});
  const delP = i => onChange({...data,partidas:partidas.filter((_,idx)=>idx!==i)});
  const addRow = garantia => onChange({...data,partidas:[...partidas,{id:Date.now()+Math.random(),oficio:"",desc:"",uds:1,p:0,ivaOn:false,iva:0,depr:false,pctDepr:0,perceptor:"Asegurado",garantia:garantia||"continente",cobertura:true}]});
  // Checkbox de IVA: al marcar aplica 21% por defecto (editable 10/21); al desmarcar, IVA=0
  const toggleIVA = (i,on) => onChange({...data,partidas:partidas.map((p,idx)=>idx===i?{...p,ivaOn:on,iva:on?(p.iva||21):0}:p)});
  // Reordenar filas manualmente (drag & drop)
  const moveRow = (from,to) => {
    if(from==null||to==null||from===to) return;
    const arr=[...partidas]; const [m]=arr.splice(from,1); arr.splice(to,0,m);
    onChange({...data,partidas:arr});
  };
  const setPerceptorTipo = t => onChange({...data,perceptorTipo:data.perceptorTipo===t?null:t});
  // Perjudicados (opcional): el perito los nombra y se añaden como perceptores
  const perjudicados = data.perjudicados||[];
  const addPerjudicado = () => onChange({...data,perjudicados:[...perjudicados,{id:Date.now()+Math.random(),nombre:""}]});
  const updPerjudicado = (id,v) => onChange({...data,perjudicados:perjudicados.map(p=>p.id===id?{...p,nombre:v}:p)});
  const delPerjudicado = id => onChange({...data,perjudicados:perjudicados.filter(p=>p.id!==id)});
  const setHayPerjudicados = v => onChange({...data,hayPerjudicados:v,perjudicados:v&&perjudicados.length===0?[{id:Date.now()+Math.random(),nombre:""}]:perjudicados});
  // Opciones del campo Perceptor: Asegurado · (perjudicados nombrados) · Reparador
  const perceptorOpciones = ["Asegurado",...(data.hayPerjudicados?perjudicados.map(p=>p.nombre).filter(Boolean):[]),"Reparador"];
  // Auto-activar regla proporcional cuando se detecta infraseguro (editable después)
  useEffect(()=>{
    const patch={};
    if(data.reglaContinente===undefined && reglas.infraCont>0) patch.reglaContinente=true;
    if(data.reglaContenido===undefined && reglas.infraContenido>0) patch.reglaContenido=true;
    if(Object.keys(patch).length) onChange({...data,...patch});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[reglas.infraCont,reglas.infraContenido]);

  // Auto-rellenar concepto de garantía y franquicia desde encargo/póliza (editable después)
  useEffect(()=>{
    const patch={};
    if(!data.conceptoGarantia && (enc?.garantia||enc?.causa))
      patch.conceptoGarantia = enc.garantia||enc.causa;
    if(!data.franquiciaVal && enc?.franquicia)
      patch.franquiciaVal = enc.franquicia;
    if(Object.keys(patch).length) onChange({...data,...patch});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[enc?.garantia,enc?.causa,enc?.franquicia]);

  const handleSave = () => { onSave?.(); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  // ── AI: mejorar texto descripción ────────────────────────────────────────
  const improveText = async () => {
    if(!data.textoRaw) return;
    setImproving(true);
    const text = await callClaude(
      "Perito de seguros. Redacta en tercera persona, estilo pericial, conciso. Sin título de apartado.",
      `Mejora este texto para el apartado de valoración de daños. Directo, técnico, sin redundancias:
CAUSA: ${enc.causa||""} | GARANTÍA: ${enc.garantia||""}
TEXTO: "${data.textoRaw}"`,
      onTokens
    ).catch(()=>"Error al conectar.");
    onChange({...data,textoAI:text});
    setImproving(false);
  };

  // ── AI: generar tabla desde descripción usando Baremo ────────────────────
  const genFromBaremo = async () => {
    const desc = data.textoAI||data.textoRaw;
    if(!desc){ setGenMsg({tipo:"aviso",texto:"Escribe primero la descripción de los daños: la tabla se genera a partir de ese texto."}); return; }
    setGenLoad(true); setGenMsg(null);
    const baremoCtx = BAREMO.map(b=>`${b.oficio}|${b.desc}|${b.u}|${b.indirecto?'8% del total':fmt(b.p)+'€'}|daño:${b.dano}|cond:${b.cond}`).join('\n');
    const raw = await callClaude(
      "Perito de seguros. SOLO JSON válido, sin markdown.",
      `Selecciona del baremo SOLO las partidas necesarias para reparar los daños descritos. Usa las columnas "daño" (tipo de daño cubierto) y "cond" (condición de activación) para decidir qué partidas aplican. Estima cantidades (uds) razonables.
DAÑOS: ${desc}
CAUSA: ${enc.causa||""} | RIESGO: ${enc.lugarIntervencion||""}

BAREMO (oficio|partida|unidad|precio|daño|condición):
${baremoCtx}

Devuelve SOLO, copiando EXACTAMENTE el texto de "partida" en el campo "desc" y su oficio:
{"partidas":[{"oficio":"","desc":"","uds":1,"garantia":"continente","cobertura":true}]}`,
      // 4000 tokens: con el límite anterior una tabla larga se cortaba a medias
      // y el JSON quedaba invalido, así que no aparecía ninguna partida.
      onTokens, 4000
    ).catch(()=>'{"partidas":[]}');
    const j = parseJSON(raw);
    const err = iaError(j);
    if(err){ setGenLoad(false); setGenMsg({tipo:"error",texto:err}); return; }
    if(j.partidas?.length>0){
      // Merge desde el BAREMO (precio, unidad, oficio) buscando por el texto de la partida
      let sinPrecio = 0;
      const rows = j.partidas.map(p=>{
        const ref = matchBaremo(p.desc);
        if(!ref) sinPrecio++;
        const garantia = p.garantia==="contenido"?"contenido":"continente";
        return {
          id:Date.now()+Math.random(),
          oficio: ref?ref.oficio:(p.oficio||""),
          desc: ref?ref.desc:p.desc,
          uds: p.uds||1,
          p: ref?(ref.indirecto?0:ref.p):(p.p||0),
          indirecto: ref?!!ref.indirecto:false,
          u: ref?ref.u:"",
          ivaOn:false, iva:0, depr:false, pctDepr:0,
          perceptor:"Asegurado", garantia, cobertura:true,
        };
      });
      onChange({...data,partidas:rows.map(sanP)});
      setGenMsg(sinPrecio>0
        ? {tipo:"aviso",texto:`Tabla generada. ${sinPrecio} ${sinPrecio===1?"partida no está":"partidas no están"} en el baremo: revisa su precio, se ${sinPrecio===1?"ha añadido":"han añadido"} a 0 €.`}
        : null);
    } else {
      setGenMsg({tipo:"aviso",texto:"La IA no ha encontrado partidas del baremo que encajen con esta descripción. Detalla más los daños (material, superficie, estancia) y vuelve a intentarlo."});
    }
    setGenLoad(false);
  };

  // ── AI: extraer tabla desde facturas/presupuestos ─────────────────────────
  const extractFromFacturas = async () => {
    if(!facturas.length) return;
    setGenLoad(true); setGenMsg(null);
    const toB64 = f=>new Promise(r=>{const fr=new FileReader();fr.onload=e=>r(e.target.result.split(',')[1]);fr.readAsDataURL(f);});
    let all=[];
    let hadError=false;
    for(const fac of facturas){
      if(!fac.file) continue;
      const b64 = await toB64(fac.file);
      const raw = await callClaude(
        "Extractor de facturas/presupuestos. SOLO JSON válido.",
        [{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}},
         {type:"text",text:`Extrae todas las líneas de esta factura o presupuesto. Devuelve SOLO:
{"partidas":[{"oficio":"","desc":"descripción","uds":1,"p":0.00,"iva":21,"perceptor":"Asegurado","cobertura":true}]}`}],
        onTokens, 2000
      ).catch(()=>'{"partidas":[]}');
      const j = parseJSON(raw);
      if(iaError(j)) hadError=true;
      // La depreciación nunca se aplica automáticamente: el perito la marca a mano en la tabla.
      else if(j.partidas?.length>0) all=[...all,...j.partidas.map(p=>({...p,id:Date.now()+Math.random(),ivaOn:(+p.iva||0)>0,depr:false,pctDepr:0}))];
    }
    if(all.length>0) onChange({...data,partidas:all.map(sanP)});
    else if(hadError) setGenMsg({tipo:"error",texto:"No se pudo leer alguna de las facturas. Comprueba que son PDF legibles e inténtalo de nuevo."});
    else setGenMsg({tipo:"aviso",texto:"No se encontraron líneas en las facturas adjuntas."});
    setGenLoad(false);
  };

  // ── Adjuntar facturas ────────────────────────────────────────────────────
  const addFactura = files => {
    const news = Array.from(files).map(f=>({id:Date.now()+Math.random(),name:f.name,size:f.size,file:f}));
    onChange({...data,facturas:[...facturas,...news]});
  };
  const delFactura = id => onChange({...data,facturas:facturas.filter(f=>f.id!==id)});
  const [facDrag,setFacDrag] = useState(false);
  const s3b = s3BlockStates(data);

  return (
    <div className="fade">
      <SecTitle n="3" label="Valoración de Daños" sub="Describe los daños y genera la tabla de valoración."/>

      <ContextBar
        onEdit={()=>setEditParams(v=>!v)} editing={editParams} editLabel="Editar parámetros"
        items={[
          {k:"Cap. continente",v:fmtE(reglas.capCont)},
          {k:"Cap. contenido",v:fmtE(reglas.capCont2)},
          {k:"Franquicia",v:fmtE(parseCap(data.franquiciaVal||enc.franquicia))},
          {k:"Infraseguro",v:`${fmt(Math.max(reglas.infraCont,reglas.infraContenido))} %`,warn:reglas.infraCont>0||reglas.infraContenido>0},
        ]}/>

      {/* PARÁMETROS DE GARANTÍA — dos bloques, plegado tras el contexto */}
      {editParams&&<Card s={{marginBottom:14}}>
        <SectionLabel>Parámetros de Garantía</SectionLabel>
        <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
          {[
            {tit:"Continente",cap:reglas.capCont,pre:reglas.vPreexCont,infra:reglas.infraCont,regla:reglas.continente,field:"reglaContinente",on:!!data.reglaContinente},
            {tit:"Contenido", cap:reglas.capCont2,pre:reglas.vPreexContenido,infra:reglas.infraContenido,regla:reglas.contenido,field:"reglaContenido",on:!!data.reglaContenido},
          ].map(b=>(
            <div key={b.tit} style={{border:`1px solid ${b.infra>0?"#FECACA":C.border}`,borderRadius:8,padding:13,background:b.infra>0?C.redBg:C.bg}}>
              <div style={{fontSize:13,fontWeight:700,color:b.infra>0?C.red:C.accent,marginBottom:9,textTransform:"uppercase",letterSpacing:".05em"}}>{b.tit}</div>
              {[["Capital asegurado",fmtE(b.cap)],["Valor preexistente",fmtE(b.pre)],["Infraseguro",`${fmt(b.infra)} %`]].map(([k,v],idx)=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:idx<2?`1px solid ${C.border}`:"none",fontSize:14}}>
                  <span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600,color:idx===2&&b.infra>0?C.red:C.ink}}>{v}</span>
                </div>
              ))}
              <label style={{display:"flex",alignItems:"center",gap:8,marginTop:10,cursor:"pointer"}}>
                <input type="checkbox" checked={b.on} onChange={e=>onChange({...data,[b.field]:e.target.checked})} style={{width:15,height:15,cursor:"pointer"}}/>
                <span style={{fontSize:14,color:b.on?C.orange:C.muted}}>Aplicar regla proporcional{b.on&&b.regla<1?` (${fmt(b.regla*100)} %)`:""}</span>
              </label>
            </div>
          ))}
        </div>
        <Inp label="Concepto de garantía" value={data.conceptoGarantia} onChange={s("conceptoGarantia")}
          placeholder={enc.causa||"Fenómenos atmosféricos"} hint="Del encargo — editable"/>
        <EuroInput label="Franquicia (€)" value={data.franquiciaVal||enc.franquicia||"0"} onChange={s("franquiciaVal")}
          hint="De la póliza — editable"/>
      </Card>}

      <ZoneLabel zone="trabajo">Datos del perito</ZoneLabel>

      {/* DESCRIPCIÓN DE DAÑOS */}
      <Block title="Descripción de los Daños" done={s3b[0]}
        summary={data.textoRaw||data.textoAI ? (data.textoRaw||data.textoAI).slice(0,140)+((data.textoRaw||data.textoAI).length>140?"…":"") : "Sin describir todavía"}>
        <VoiceBox value={data.textoRaw||""} onChange={s("textoRaw")}
          onImprove={improveText} improving={improving}
          placeholder="Describe los daños encontrados en la visita pericial…" rows={4}/>
        {data.textoAI&&(
          <div style={{marginTop:10}}>
            <div style={{display:"flex",gap:6,marginBottom:6}}>
              <Btn sm ghost onClick={improveText} disabled={improving}><RefreshCw size={10}/>Regenerar</Btn>
              <Btn sm outline onClick={()=>onChange({...data,aiApplied:true})}>{data.aiApplied?<><Check size={10}/>Aplicado al informe</>:<><Check size={10}/>Aplicar al informe</>}</Btn>
            </div>
            <AutoTextarea value={data.textoAI} onChange={v=>onChange({...data,textoAI:v})}
              minRows={4} style={{fontSize:15}}/>
          </div>
        )}
      </Block>

      {/* CÓMO SE VALORA — modo + la acción que ese modo necesita, en la misma tarjeta */}
      <Block title="Cómo se valora" done={s3b[1]}
        summary={`${esBaremo?"A modo informativo":esPresup?"Por presupuesto":"Por factura"}${data.perceptorTipo?" · Perceptor: "+(data.perceptorTipo==="asegurado"?"Asegurado":data.perceptorTipo==="perjudicado"?"Perjudicado":"Reparador"):""}${esBaremo?" · "+partidas.length+" partidas":""}`}>
        <div style={{display:"flex",gap:8,marginBottom:docMode||esBaremo?14:0}}>
          {[{v:"baremo",l:"A modo informativo"},{v:"presupuesto",l:"Por Presupuesto"},{v:"factura",l:"Por Factura"}].map(m=>(
            <button key={m.v} onClick={()=>onChange({...data,modoValoracion:m.v})}
              style={{padding:"7px 16px",borderRadius:7,border:`1.5px solid ${modoVal===m.v?C.accent:C.border}`,
                background:modoVal===m.v?C.accentLight:C.white,cursor:"pointer",fontSize:14,
                fontWeight:modoVal===m.v?700:400,color:modoVal===m.v?C.accent:C.ink,fontFamily:"inherit"}}>{m.l}
            </button>
          ))}
        </div>

        {esBaremo&&<div style={{paddingTop:14,borderTop:`1px dashed ${C.border}`}}>
          <p style={{fontSize:13,color:C.muted,marginBottom:8}}>La tabla se genera a partir del baremo interno de precios y la descripción de daños de arriba.</p>
          <Btn primary onClick={genFromBaremo} disabled={genLoad||(!data.textoRaw&&!data.textoAI)}>
            {genLoad?<><Spin/>Generando…</>:<><Sparkles size={13}/>Generar tabla de valoración</>}
          </Btn>
          {/* Resultado de "Generar tabla" a la vista: antes era un alert() del
              navegador, fácil de pasar por alto o de bloquear. */}
          {!data.textoRaw&&!data.textoAI&&
            <div style={{fontSize:13,color:C.muted,marginTop:8}}>
              Escribe la descripción de los daños para poder generar la tabla.
            </div>}
          {genMsg&&(
            <div style={{display:"flex",alignItems:"flex-start",gap:7,marginTop:10,padding:"8px 12px",borderRadius:7,fontSize:14,
              background:genMsg.tipo==="error"?C.redBg:C.orangeBg,
              border:`1px solid ${genMsg.tipo==="error"?"#FECACA":"#FDE68A"}`,
              color:genMsg.tipo==="error"?C.red:C.orange}}>
              <AlertTriangle size={13} style={{flexShrink:0,marginTop:1}}/>
              <span style={{flex:1}}>{genMsg.texto}</span>
              <button onClick={()=>setGenMsg(null)} aria-label="Cerrar aviso"
                style={{background:"none",border:"none",cursor:"pointer",color:"inherit",padding:0,flexShrink:0}}>
                <X size={13}/>
              </button>
            </div>
          )}
        </div>}

        {/* PERCEPTOR (solo presupuesto / factura) */}
        {docMode&&<div style={{paddingTop:14,borderTop:`1px dashed ${C.border}`}}>
          <div style={{fontSize:13,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>Perceptor de la indemnización</div>
          <div style={{display:"flex",gap:20}}>
            {[{v:"asegurado",l:"Asegurado"},{v:"perjudicado",l:"Perjudicado"},{v:"reparador",l:"Reparador"}].map(o=>(
              <label key={o.v} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:15,
                fontWeight:data.perceptorTipo===o.v?700:400,color:data.perceptorTipo===o.v?C.accent:C.ink}}>
                <input type="checkbox" checked={data.perceptorTipo===o.v} onChange={()=>setPerceptorTipo(o.v)} style={{width:16,height:16,cursor:"pointer"}}/>
                {o.l}
              </label>
            ))}
          </div>
          {reparador&&<div style={{fontSize:13,color:C.muted,marginTop:8}}>Con perceptor Reparador no se aplica depreciación (columna oculta en la tabla).</div>}

          <div style={{fontSize:13,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:".06em",margin:"16px 0 10px"}}>{esFactura?"Facturas":"Presupuestos"}</div>
          <div onClick={()=>facRef.current.click()}
            onDragOver={e=>{e.preventDefault();setFacDrag(true)}}
            onDragLeave={()=>setFacDrag(false)}
            onDrop={e=>{e.preventDefault();setFacDrag(false);if(e.dataTransfer.files?.length)addFactura(e.dataTransfer.files);}}
            style={{border:`2px dashed ${facDrag?C.accent:C.border}`,borderRadius:8,padding:"16px",textAlign:"center",
              cursor:"pointer",background:facDrag?C.accentLight:C.bg,marginBottom:10,transition:"all .15s"}}>
            <Upload size={20} style={{color:facDrag?C.accent:C.muted,marginBottom:6}}/>
            <div style={{fontSize:14,fontWeight:600,color:C.ink}}>Adjuntar o arrastrar {esFactura?"facturas":"presupuestos"}</div>
            <div style={{fontSize:13,color:C.muted}}>PDF · Se adjuntarán automáticamente al informe final</div>
            <input ref={facRef} type="file" multiple accept=".pdf" style={{display:"none"}}
              onChange={e=>addFactura(e.target.files)}/>
          </div>
          {facturas.map(f=>(
            <div key={f.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",
              background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:6,marginBottom:6,fontSize:14}}>
              <Receipt size={13} style={{color:C.green,flexShrink:0}}/>
              <span style={{flex:1,color:C.green,fontWeight:600}}>{f.name}</span>
              <span style={{color:C.muted,fontSize:13}}>{f.size?(f.size/1024).toFixed(0)+" KB":""}</span>
              <button onClick={()=>delFactura(f.id)} aria-label="Eliminar factura" style={{background:"none",border:"none",cursor:"pointer",color:C.muted}}><X size={12}/></button>
            </div>
          ))}
          {facturas.length>0&&<Btn primary full onClick={extractFromFacturas} disabled={genLoad}>
            {genLoad?<><Spin/>Extrayendo partidas…</>:<><Sparkles size={13}/>Extraer tabla desde {facturas.length} {esFactura?"factura":"presupuesto"}{facturas.length>1?"s":""}</>}
          </Btn>}
          {genMsg&&(
            <div style={{display:"flex",alignItems:"flex-start",gap:7,marginTop:10,padding:"8px 12px",borderRadius:7,fontSize:14,
              background:genMsg.tipo==="error"?C.redBg:C.orangeBg,
              border:`1px solid ${genMsg.tipo==="error"?"#FECACA":"#FDE68A"}`,
              color:genMsg.tipo==="error"?C.red:C.orange}}>
              <AlertTriangle size={13} style={{flexShrink:0,marginTop:1}}/>
              <span style={{flex:1}}>{genMsg.texto}</span>
              <button onClick={()=>setGenMsg(null)} aria-label="Cerrar aviso"
                style={{background:"none",border:"none",cursor:"pointer",color:"inherit",padding:0,flexShrink:0}}>
                <X size={13}/>
              </button>
            </div>
          )}
        </div>}
      </Block>

      <div>
      {/* PERJUDICADOS — plegado a una línea cuando la respuesta es "No" (lo habitual) */}
      {!data.hayPerjudicados&&<div style={{display:"flex",alignItems:"center",gap:8,background:C.white,
        border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",marginBottom:14,fontSize:14.5}}>
        <span style={{fontWeight:600}}>Perjudicados</span>
        <span style={{color:C.muted}}>— ninguno</span>
        <button onClick={()=>setHayPerjudicados(true)} style={{marginLeft:"auto",fontSize:13,fontWeight:600,
          color:C.accent,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>
          <Plus size={11} style={{verticalAlign:"-1px",marginRight:3}}/>Añadir
        </button>
      </div>}
      {data.hayPerjudicados&&<Card s={{marginBottom:14}}>
        <SectionLabel>¿Hay perjudicados?</SectionLabel>
        <div style={{display:"flex",gap:20,marginBottom:12}}>
          {[{v:true,l:"Sí"},{v:false,l:"No"}].map(o=>(
            <label key={String(o.v)} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:15,
              fontWeight:!!data.hayPerjudicados===o.v?700:400,color:!!data.hayPerjudicados===o.v?C.accent:C.ink}}>
              <input type="checkbox" checked={!!data.hayPerjudicados===o.v} onChange={()=>setHayPerjudicados(o.v)} style={{width:16,height:16,cursor:"pointer"}}/>
              {o.l}
            </label>
          ))}
        </div>
        <div style={{fontSize:13,color:C.muted,marginBottom:8}}>Nombra cada perjudicado para identificarlo. Aparecerán como opción en el campo «Perceptor» de la tabla.</div>
        {perjudicados.map((pj,idx)=>(
          <div key={pj.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <input value={pj.nombre||""} onChange={e=>updPerjudicado(pj.id,e.target.value)}
              placeholder={`Perjudicado ${idx+1} — nombre`}
              style={{...inpStyle(false),flex:1,marginBottom:0}}/>
            <button onClick={()=>delPerjudicado(pj.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,padding:4}}><X size={14}/></button>
          </div>
        ))}
        <Btn sm onClick={addPerjudicado}><Plus size={11}/>Añadir perjudicado</Btn>
      </Card>}
      </div>

      <ZoneLabel zone="resultado">Resultado</ZoneLabel>

      {/* TABLAS DE VALORACIÓN — Continente / Contenido */}
      <div style={{fontSize:13,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:".05em",marginBottom:8}}>
        {esBaremo?"Valoración — A modo informativo":esPresup?"Valoración — Presupuesto":"Valoración — Factura"}
      </div>
      <Formula>
        <b style={{fontWeight:600,fontVariantNumeric:"tabular-nums"}}>V.Real</b> = V.Repos × (1 − Depr%) + IVA importes &nbsp;·&nbsp; <b style={{fontWeight:600,fontVariantNumeric:"tabular-nums"}}>V.Repos</b> = Uds × V.Unitario
        &nbsp;·&nbsp; Arrastra <GripVertical size={11} style={{verticalAlign:"middle"}}/> para reordenar filas
        {(()=>{
          const ejemplo = rowsActivas.find(p=>p.ivaOn||p.depr);
          if(!ejemplo) return null;
          const {vRepos,ivaAmt,vReal} = calc(ejemplo);
          return <div style={{color:C.muted,marginTop:4}}>
            {ejemplo.desc||"Partida"}: {fmt(vRepos)} €{ejemplo.depr?` × (1 − ${fmt(ejemplo.pctDepr||0)}%)`:""}{ejemplo.ivaOn?` + ${fmt(ivaAmt)} € IVA`:""} = <b>{fmt(vReal)} €</b>
          </div>;
        })()}
      </Formula>

      {[{key:"continente",titulo:"Continente",rows:partidasCont,sub:{repos:sumRepos(activasCont),iva:sumIVA(activasCont),real:totRealCont}},
        {key:"contenido",titulo:"Contenido",rows:partidasCont2,sub:{repos:sumRepos(activasCont2),iva:sumIVA(activasCont2),real:totRealCont2}}].map(tabla=>(
        <Card key={tabla.key} s={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <SectionLabel>{tabla.titulo}</SectionLabel>
            <Btn sm onClick={()=>addRow(tabla.key)}><Plus size={11}/>Fila</Btn>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:C.ink}}>
                {["","Oficio","Descripción","Uds","V.Unit €","V.Repos €",...(showIVA?["IVA"]:[]),...(showDepr?["Depr"]:[]),"V.Real €","Perceptor","Cob.",""].map((h,hi)=>(
                  <th key={hi} style={{padding:"7px 6px",textAlign:h==="Descripción"||h==="Oficio"||h===""?"left":"center",color:"rgba(255,255,255,.85)",fontWeight:700,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {tabla.rows.length===0&&<tr><td colSpan={10+(showIVA?1:0)+(showDepr?1:0)} style={{padding:20,textAlign:"center",color:C.muted,fontSize:14}}>
                  Sin partidas de {tabla.titulo.toLowerCase()} todavía
                </td></tr>}
                {tabla.rows.map(p=>{
                  const i = partidas.indexOf(p);
                  const pr = p.indirecto?{...p,uds:1,p:+(baseReposCov*PCT_INDIRECTO/100).toFixed(2)}:p;
                  const {vRepos,ivaAmt,vReal}=calc(pr);
                  return (
                    <tr key={p.id}
                      onDragOver={e=>{if(dragIdx!=null){e.preventDefault();setOverIdx(i);}}}
                      onDrop={e=>{e.preventDefault();moveRow(dragIdx,i);setDragIdx(null);setOverIdx(null);}}
                      style={{borderBottom:`1px solid ${C.border}`,opacity:dragIdx===i?0.4:1,
                        background:overIdx===i&&dragIdx!=null&&dragIdx!==i?C.blueBg:"transparent"}}>
                      <td style={{padding:"4px 3px",textAlign:"center"}}>
                        <div draggable onDragStart={()=>setDragIdx(i)} onDragEnd={()=>{setDragIdx(null);setOverIdx(null);}}
                          style={{cursor:"grab",color:C.muted,display:"inline-flex"}} title="Arrastrar para reordenar"><GripVertical size={13}/></div>
                      </td>
                      <td style={{padding:"4px 5px",minWidth:90}}>
                        <input value={p.oficio||""} onChange={e=>updP(i,"oficio",e.target.value.toUpperCase())}
                          style={{width:"100%",padding:"3px 5px",border:`1px solid ${C.border}`,borderRadius:4,fontSize:13,fontWeight:600,fontVariantNumeric:"tabular-nums",textTransform:"uppercase"}}/>
                      </td>
                      <td style={{padding:"4px 5px",minWidth:170}}>
                        <input value={p.desc||""} onChange={e=>updP(i,"desc",e.target.value)}
                          style={{width:"100%",padding:"3px 5px",border:`1px solid ${C.border}`,borderRadius:4,fontSize:13,fontFamily:"inherit"}}/>
                      </td>
                      <td style={{padding:"4px 4px"}}>{p.indirecto?<span style={{display:"block",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>1</span>:<InpCell val={p.uds} onChange={v=>updP(i,"uds",v)} type="number" w={44} min={0}/>}</td>
                      <td style={{padding:"4px 4px",textAlign:"right"}}>{p.indirecto?<span title="8% del subtotal" style={{fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmt(pr.p)}</span>:<InpCell val={p.p} onChange={v=>updP(i,"p",v)} type="number" w={70} min={0}/>}</td>
                      <td style={{padding:"4px 5px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmt(vRepos)}</td>
                      {/* IVA: casilla + % (si está activa) + importe, todo en una columna en vez de 3 */}
                      {showIVA&&<td style={{padding:"4px 4px"}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                          <input type="checkbox" checked={!!p.ivaOn} onChange={e=>toggleIVA(i,e.target.checked)} style={{cursor:"pointer"}}/>
                          {p.ivaOn&&<select value={p.iva||21} onChange={e=>updP(i,"iva",+e.target.value)}
                            style={{fontSize:12,border:`1px solid ${C.border}`,borderRadius:3,padding:"2px",fontFamily:"inherit"}}>
                            <option value={10}>10%</option><option value={21}>21%</option>
                          </select>}
                        </div>
                        {p.ivaOn&&<div style={{textAlign:"center",fontSize:11.5,color:C.muted,fontWeight:600,fontVariantNumeric:"tabular-nums",marginTop:2}}>{fmt(ivaAmt)} €</div>}
                      </td>}
                      {/* Depreciación: casilla + % en una sola columna en vez de 2 */}
                      {showDepr&&<td style={{padding:"4px 4px"}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                          <input type="checkbox" checked={!!p.depr} onChange={e=>updP(i,"depr",e.target.checked)} style={{cursor:"pointer"}}/>
                          {p.depr&&<InpCell val={p.pctDepr} onChange={v=>updP(i,"pctDepr",v)} type="number" w={32} min={0} max={100}/>}
                        </div>
                      </td>}
                      <td style={{padding:"4px 5px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmt(vReal)}</td>
                      <td style={{padding:"4px 4px"}}>
                        <select value={p.perceptor||"Asegurado"} onChange={e=>updP(i,"perceptor",e.target.value)}
                          style={{fontSize:12,border:`1px solid ${C.border}`,borderRadius:3,padding:"2px",fontFamily:"inherit"}}>
                          {[...new Set([...perceptorOpciones,p.perceptor].filter(Boolean))].map(o=><option key={o} value={o}>{o}</option>)}
                        </select>
                      </td>
                      {/* Cobertura: punto de color en vez de botón de texto "Sí/No" — libera ancho */}
                      <td style={{padding:"4px 4px",textAlign:"center"}}>
                        <button onClick={()=>updP(i,"cobertura",p.cobertura===false)}
                          title={p.cobertura!==false?"Con cobertura":"Sin cobertura"}
                          style={{background:"none",border:"none",cursor:"pointer",padding:4,display:"inline-flex"}}>
                          <span style={{width:9,height:9,borderRadius:"50%",display:"inline-block",background:p.cobertura!==false?C.green:C.red}}/>
                        </button>
                      </td>
                      <td><button onClick={()=>delP(i)} aria-label="Eliminar partida" style={{background:"none",border:"none",cursor:"pointer",color:C.muted,padding:"2px"}}><X size={11}/></button></td>
                    </tr>
                  );
                })}
                {tabla.rows.length>0&&<tr style={{background:C.accentLight,fontWeight:700,borderTop:`2px solid ${C.accent}`}}>
                  <td/><td/>
                  <td style={{padding:"7px 5px",color:C.accent,fontSize:13}}>Subtotal</td>
                  <td/><td/>
                  <td style={{padding:"7px 5px",textAlign:"right",color:C.accent,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmt(tabla.sub.repos)} €</td>
                  {showIVA&&<td style={{padding:"7px 5px",textAlign:"right",color:C.accent,fontWeight:600,fontVariantNumeric:"tabular-nums",fontSize:13}}>{fmt(tabla.sub.iva)} €</td>}
                  {showDepr&&<td/>}
                  <td style={{padding:"7px 5px",textAlign:"right",color:C.accent,fontSize:14,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmt(tabla.sub.real)} €</td>
                  <td colSpan={3}/>
                </tr>}
              </tbody>
            </table>
          </div>
        </Card>
      ))}

      {/* RESUMEN DE DAÑOS */}
      {partidas.length>0&&<Card s={{marginBottom:14}}>
        <SectionLabel>Resumen de Daños</SectionLabel>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
            <thead><tr style={{background:C.ink}}>
              {["Garantía","Valor a nuevo","Valor real"].map((h,hi)=>(
                <th key={hi} style={{padding:"7px 8px",textAlign:hi===0?"left":"right",color:"rgba(255,255,255,.85)",fontWeight:700,fontSize:13}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              <tr style={{borderBottom:`1px solid ${C.border}`}}>
                <td style={{padding:"8px",fontWeight:600}}>Total Continente</td>
                <td style={{padding:"8px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmt(totNuevoCont)} €</td>
                <td style={{padding:"8px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmt(totRealCont)} €</td>
              </tr>
              <tr style={{borderBottom:`1px solid ${C.border}`}}>
                <td style={{padding:"8px",fontWeight:600}}>Total Contenido</td>
                <td style={{padding:"8px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmt(totNuevoCont2)} €</td>
                <td style={{padding:"8px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmt(totRealCont2)} €</td>
              </tr>
              <tr style={{background:C.accentLight,fontWeight:700,borderTop:`2px solid ${C.accent}`}}>
                <td style={{padding:"9px 8px",color:C.accent}}>Total estimación de daños</td>
                <td style={{padding:"9px 8px",textAlign:"right",color:C.accent,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmt(totRepos)} €</td>
                <td style={{padding:"9px 8px",textAlign:"right",color:C.accent,fontSize:15,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmt(totReal)} €</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FRASE DE INDEMNIZACIÓN */}
        {docMode&&fraseIndemn(data,indemn)&&(
          <div style={{marginTop:14,background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:8,padding:14,fontSize:15,color:C.ink,whiteSpace:"pre-wrap",lineHeight:1.7}}>
            {fraseIndemn(data,indemn)}
          </div>
        )}
      </Card>}

      <NavBottom onPrev={onPrev} onSave={handleSave} onNext={onNext} saved={saved}
        prevLabel="Causas y Circunstancias" nextLabel="Siguiente — Cobertura e Indemnización"/>
    </div>
  );
};

// ─── SECCIÓN 4 ────────────────────────────────────────────────────────────────
const SEC4_INTROS = [
  "Procedemos a realizar valoración correspondiente, en base al presupuesto aportado por el asegurado.",
  "Procedemos a realizar valoración correspondiente, en base a la factura aportada por el asegurado.",
  "A la espera de aportación de presupuestos o facturas procedemos a realizar valoración unilateral a modo informativo.",
];

const sec4IntroAuto = modo =>
  modo==="presupuesto" ? SEC4_INTROS[0]
  : modo==="factura"  ? SEC4_INTROS[1]
  : SEC4_INTROS[2];

const sec4IndemnAuto = (s3, indemn) => {
  const todaSinCob = (s3?.partidas?.length>0) && getPartidas(s3).length===0;
  if(todaSinCob) return "NO se propone indemnización.";
  const modo = s3?.modoValoracion||"baremo";
  const reparador = s3?.perceptorTipo==="reparador";
  const perceptor = {reparador:"Reparador",perjudicado:"Perjudicado"}[s3?.perceptorTipo]||"Asegurado";
  const eur = fmt(indemn)+" €";
  if(modo==="presupuesto")
    return `A la espera de aportación de la factura, se propone indemnización a valor real sin IVA de la siguiente manera:\n\nINDEMNIZACIÓN:\n${perceptor}: ${eur}`;
  if(modo==="factura"&&reparador)
    return `Se propone indemnización de la siguiente manera:\n\nINDEMNIZACIÓN:\nReparador: ${eur}`;
  if(modo==="factura")
    return `Se propone indemnización de la siguiente manera:\n\nINDEMNIZACIÓN:\n${perceptor}: ${eur} (IVA incl.)`;
  // Modo "a modo informativo" (baremo): también se eleva propuesta
  return `Se propone indemnización a modo informativo de la siguiente manera:\n\nINDEMNIZACIÓN:\n${perceptor}: ${eur}`;
};

const Sec4 = ({data,onChange,enc,s1,s3,onTokens,onNext,onPrev,onSave,scrollRef}) => {
  const [saved,setSaved] = useState(false);
  const s = f => v => onChange({...data,[f]:v});

  const partidas  = getPartidas(s3);
  const reglas    = calcReglas(enc, s1);
  const dañoCont  = partidas.filter(p=>(p.garantia||"continente")!=="contenido").reduce((a,p)=>a+calcPartida(p).vReal,0);
  const dañoCont2 = partidas.filter(p=>p.garantia==="contenido").reduce((a,p)=>a+calcPartida(p).vReal,0);
  const reglaCEf  = s3?.reglaContinente?reglas.continente:1;
  const reglaC2Ef = s3?.reglaContenido?reglas.contenido:1;
  const ajustCont  = dañoCont*reglaCEf;
  const ajustCont2 = dañoCont2*reglaC2Ef;
  const totalDano  = dañoCont+dañoCont2;
  const ajustado   = ajustCont+ajustCont2;
  const franq      = parseCap(s3?.franquiciaVal||enc.franquicia);
  const indemn     = Math.max(0,ajustado-franq);
  const modoVal    = s3?.modoValoracion||"baremo";

  // Los tres auto-rellenos de Sección 4 (cobertura, texto intro, propuesta de
  // indemnización) van en un ÚNICO useEffect que junta todo en un solo patch.
  // Antes eran 3 useEffect separados, cada uno con su propio onChange({...data,X}):
  // al montar el componente los tres disparaban en la misma pasada usando el
  // mismo `data` (todavía vacío) como base, así que cada onChange pisaba por
  // completo el resultado del anterior — solo sobrevivía el último. Era la causa
  // de que "Descripción de la Cobertura" pareciera no autorrellenarse nunca.
  useEffect(()=>{
    const patch = {};

    // Descripción de cobertura: copia el texto EXACTO de la cobertura afectada.
    // Mapea el nombre comercial al código de la póliza (RGEXT, etc.). La
    // comparación ignora tildes y mayúsculas ("Daños por agua" = "DANOS POR AGUA").
    if(!data.descripcionCobertura&&enc.descripciones){
      const COD = {"riesgos extensivos":"RGEXT","atmosfericos":"RGEXT","danos por agua":"DAGUA","incendio":"INCEN","robo":"ROBO","danos electricos":"DELEC","rc explotacion":"RCEXP","responsabilidad civil":"RCEXP","rc locatario":"RCLOC"};
      const claves = Object.keys(enc.descripciones);
      const gars = (enc.garantia||enc.causa||"").split(/[;,]+/).map(g=>g.trim()).filter(Boolean);
      const desc = gars.map(g=>{
        const gn = norm(g);
        const code = COD[gn];
        // 1) por código de póliza · 2) por nombre literal · 3) por coincidencia parcial
        const k = (code&&claves.find(x=>norm(x)===norm(code)))
          || claves.find(x=>norm(x)===gn)
          || claves.find(x=>gn&&(norm(x).includes(gn)||gn.includes(norm(x))));
        const v = k?enc.descripciones[k]:null;
        if(!v) return "";
        if(typeof v==="string") return v.trim();
        const partes = [];
        if(v.continente&&v.continente.trim()) partes.push(`Continente: ${v.continente.trim()}`);
        if(v.contenido&&v.contenido.trim()) partes.push(`Contenido: ${v.contenido.trim()}`);
        return partes.join("\n");
      }).filter(Boolean).join("\n\n");
      if(desc) patch.descripcionCobertura = desc;
    }

    // Texto intro: se actualiza mientras el perito no lo haya personalizado.
    if(!data.textoIntro||SEC4_INTROS.includes(data.textoIntro))
      patch.textoIntro = sec4IntroAuto(modoVal);

    // Propuesta de indemnización: se mantiene actualizada mientras el perito
    // no la edite a mano (textoIndemnEdited).
    if(!data.textoIndemnEdited) patch.textoIndemn = sec4IndemnAuto(s3,indemn);

    if(Object.keys(patch).length) onChange({...data,...patch});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[enc?.garantia,enc?.causa,enc?.descripciones,modoVal,indemn,s3?.perceptorTipo,s3?.partidas]);

  const handleSave = () => { onSave?.(); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  const RestoreBtn = ({onClick}) => (
    <button onClick={onClick} style={{fontSize:13,color:C.accent,background:"none",border:"none",cursor:"pointer",padding:"2px 6px",fontFamily:"inherit",
      display:"inline-flex",alignItems:"center",gap:5}}>
      <RefreshCw size={11}/>Restaurar
    </button>
  );
  const s4b = s4BlockStates(data);

  return (
    <div className="fade">
      <SecTitle n="4" label="Estudio de Cobertura-Indemnización" sub="Análisis de coberturas aplicables y propuesta de indemnización final"/>

      <ContextBar items={[
        {k:"Garantía",v:enc.garantia||enc.causa||"—",mono:false},
        {k:"Modo",v:modoVal==="baremo"?"Informativo":modoVal==="presupuesto"?"Presupuesto":"Factura",mono:false},
        {k:"Franquicia",v:fmtE(franq)},
      ]}/>

      <ZoneLabel zone="trabajo">Datos del perito</ZoneLabel>

      {/* TEXTO INTRO MODO VALORACIÓN */}
      <Block title="Texto de Valoración" badge="Automático" done={s4b[0]}
        summary={data.textoIntro?data.textoIntro.slice(0,140)+(data.textoIntro.length>140?"…":""):"Sin generar todavía"}>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:6}}>
          <RestoreBtn onClick={()=>onChange({...data,textoIntro:sec4IntroAuto(modoVal)})}/>
        </div>
        <div style={{fontSize:13,color:C.muted,marginBottom:8}}>Auto-generado según el modo de valoración (Baremo · Presupuesto · Factura). Editable.</div>
        <Txt value={data.textoIntro||sec4IntroAuto(modoVal)} onChange={s("textoIntro")} rows={2}/>
      </Block>

      {/* DESCRIPCIÓN COBERTURA */}
      <Block title="Descripción de la Cobertura" badge="De la póliza" done={s4b[1]}
        summary={data.descripcionCobertura?data.descripcionCobertura.slice(0,140)+(data.descripcionCobertura.length>140?"…":""):"Sin datos de póliza — pendiente de completar"}>
        <div style={{fontSize:13,color:C.muted,marginBottom:8}}>
          Extraída automáticamente de la póliza para la garantía afectada. Editable.
        </div>
        <Txt value={data.descripcionCobertura} onChange={s("descripcionCobertura")} rows={5}
          placeholder={enc.garantia?"Buscando cobertura para "+enc.garantia+"…":"Adjunta la póliza en el paso inicial para extraer automáticamente la descripción de la cobertura"}/>
        {!data.descripcionCobertura&&<div style={{fontSize:13,color:C.orange,marginTop:6,display:"flex",alignItems:"center",gap:5}}>
          <AlertTriangle size={12}/>Sin datos de póliza — introduce manualmente la descripción de la cobertura</div>}
      </Block>

      <ZoneLabel zone="resultado">Resultado</ZoneLabel>

      <Formula>
        <b style={{fontWeight:600,fontVariantNumeric:"tabular-nums"}}>Indemnización</b> = max(0, Valor ajustado − Franquicia) &nbsp;·&nbsp; <b style={{fontWeight:600,fontVariantNumeric:"tabular-nums"}}>Valor ajustado</b> = Daño con cobertura × Regla proporcional (si aplica)
      </Formula>

      {/* TABLA GARANTÍAS */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Resumen por Garantías</SectionLabel>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
            <thead><tr style={{background:C.accentLight}}>
              {["Garantía Afectada","Daño con cobertura","Límite aseg.","Regla proporcional","Valor ajustado","Franquicia","Indemnización"].map(h=>(
                <th key={h} style={{padding:"7px 8px",textAlign:h==="Garantía Afectada"?"left":"right",color:C.accent,fontWeight:700,fontSize:13}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {[
                {tit:"Continente",dano:dañoCont,lim:reglas.capCont,reglaOn:!!s3?.reglaContinente,regla:reglas.continente,ajust:ajustCont},
                {tit:"Contenido", dano:dañoCont2,lim:reglas.capCont2,reglaOn:!!s3?.reglaContenido,regla:reglas.contenido,ajust:ajustCont2},
              ].filter(b=>b.dano>0).map(b=>(
                <tr key={b.tit} style={{borderBottom:`1px solid ${C.border}`}}>
                  <td style={{padding:"8px",fontWeight:600}}>{b.tit} — {enc.garantia||enc.causa||""}</td>
                  <td style={{padding:"8px",textAlign:"right"}}>{fmtE(b.dano)}</td>
                  <td style={{padding:"8px",textAlign:"right"}}>{fmtE(b.lim)}</td>
                  <td style={{padding:"8px",textAlign:"right"}}>{b.reglaOn&&b.regla<1?`${fmt(b.regla*100)}%`:"NO"}</td>
                  <td style={{padding:"8px",textAlign:"right",fontWeight:600}}>{fmtE(b.ajust)}</td>
                  <td style={{padding:"8px",textAlign:"right"}}>—</td>
                  <td style={{padding:"8px",textAlign:"right",fontWeight:700,color:C.green}}>{fmtE(b.ajust)}</td>
                </tr>
              ))}
              <tr style={{background:C.accentLight,fontWeight:700}}>
                <td style={{padding:"8px",color:C.accent}}>Total</td>
                <td style={{padding:"8px",textAlign:"right"}}>{fmtE(totalDano)}</td>
                <td/><td/>
                <td style={{padding:"8px",textAlign:"right"}}>{fmtE(ajustado)}</td>
                <td style={{padding:"8px",textAlign:"right"}}>{fmtE(franq)}</td>
                <td style={{padding:"8px",textAlign:"right",color:C.accent,fontSize:16}}>{fmtE(indemn)}</td>
              </tr>
              <tr><td style={{padding:"6px 8px",fontSize:14,color:C.muted}}>Franquicia</td><td colSpan={5}/><td style={{padding:"6px 8px",textAlign:"right",fontSize:14}}>{fmtE(franq)}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Cadena de cálculo: de dónde sale la indemnización, paso a paso */}
        <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:8,background:C.white,
          border:`1px solid ${C.border}`,borderRadius:9,padding:"14px 16px",marginTop:12,fontSize:13.5}}>
          {[
            {k:"Daño con cobertura",v:fmtE(totalDano)},
            {k:"Regla proporcional",v:(s3?.reglaContinente||s3?.reglaContenido)?"Aplica":"No aplica"},
            {k:"Valor ajustado",v:fmtE(ajustado)},
            {k:"− Franquicia",v:fmtE(franq),bg:C.orangeBg,border:"#FED7AA",color:C.orange},
            {k:"Indemnización",v:fmtE(indemn),bg:C.greenBg,border:"#A7F3D0",color:C.green},
          ].map((step,idx,arr)=>(
            <div key={step.k} style={{display:"contents"}}>
              <div style={{display:"flex",flexDirection:"column",gap:2,padding:"6px 12px",borderRadius:7,
                background:step.bg||C.bg,border:step.border?`1px solid ${step.border}`:"none"}}>
                <span style={{fontSize:10.5,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".05em"}}>{step.k}</span>
                <span style={{fontWeight:700,fontVariantNumeric:"tabular-nums",fontSize:15,color:step.color||C.ink}}>{step.v}</span>
              </div>
              {idx<arr.length-1&&<span style={{color:C.border,fontSize:17}}>→</span>}
            </div>
          ))}
        </div>

        <div style={{background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:8,padding:16,marginTop:14,textAlign:"center"}}>
          <div style={{fontSize:12,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Total Propuesta de Indemnización</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontVariantNumeric:"tabular-nums",fontSize:32,color:C.green}}>{fmtE(indemn)}</div>
        </div>
      </Card>

      {/* PROPUESTA DE INDEMNIZACIÓN */}
      <Card s={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <SectionLabel>Propuesta de Indemnización</SectionLabel>
          <RestoreBtn onClick={()=>onChange({...data,textoIndemn:sec4IndemnAuto(s3,indemn),textoIndemnEdited:false})}/>
        </div>
        <div style={{fontSize:13,color:C.muted,marginBottom:8}}>Auto-generado según modo, perceptor y cobertura. Editable.</div>
        <Txt value={data.textoIndemn||sec4IndemnAuto(s3,indemn)} onChange={v=>onChange({...data,textoIndemn:v,textoIndemnEdited:true})}
          rows={sec4IndemnAuto(s3,indemn)==="NO se propone indemnización."?2:5}
          placeholder="Completar la Sección 3 para generar la propuesta automáticamente…"/>
      </Card>

      <NavBottom onPrev={onPrev} onSave={handleSave} onNext={onNext} saved={saved}
        prevLabel="Valoración de Daños" nextLabel="Siguiente — Anexos"/>
    </div>
  );
};

// ─── ANEXOS ──────────────────────────────────────────────────────────────────
const ANEXOS_MAX_SIZE = 10*1024*1024; // 10 MB
const ANEXOS_PUBLIC_PREFIX = `${SB_URL}/storage/v1/object/public/anexos/`;
const sanitizeAnexoName = n => (n||"archivo").normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-zA-Z0-9._-]/g,'_');
// Sube una captura automática (Catastro/XEMA, imagen data-URI) al mismo bucket que los anexos manuales.
const uploadAutoAnexo = async (dataUrl, {name, tab, cat, token, userId, informeId}) => {
  if(!token||!userId) throw new Error('Sesión no disponible.');
  const blob = await (await fetch(dataUrl)).blob();
  const path = `${userId}/${informeId||'sin-informe'}/${tab}/${Date.now()}-${Math.random().toString(36).slice(2,8)}-${sanitizeAnexoName(name)}`;
  const res = await fetch(`${SB_URL}/storage/v1/object/anexos/${path}`, {
    method:'POST',
    headers:{'Authorization':`Bearer ${token}`,'apikey':SB_KEY,'Content-Type':blob.type||'image/png'},
    body:blob
  });
  if(!res.ok) throw new Error(`Fallo al subir ${name} (${res.status})`);
  return {id:Date.now()+Math.random(), name, url:`${ANEXOS_PUBLIC_PREFIX}${path}`, type:blob.type||'image/png', caption:'', cat:cat||'Documento'};
};

const SecAnexos = ({data,onChange,s3,onPrev,onNext,onSave,token,userId,informeId,scrollRef}) => {
  // "Facturas" y "Presupuestos" van en pestañas separadas (antes compartían una
  // sola con un contador conjunto): son documentos distintos y así se ve de un
  // vistazo cuál de los dos falta sin tener que entrar a mirar.
  const tabs = [
    {id:"fotos",    icon:Camera,     label:"Reportaje Fotográfico"},
    {id:"catastro", icon:FileImage,  label:"Info Catastral"},
    {id:"meteosim", icon:Image,      label:"Info Meteosim"},
    {id:"facturas", icon:Receipt,    label:"Facturas"},
    {id:"presupuestos", icon:FileText, label:"Presupuestos"},
  ];
  const [tab,setTab]       = useState("fotos");
  const [saved,setSaved]   = useState(false);
  const [dragging,setDrag] = useState(false);
  const [uploading,setUploading] = useState([]); // nombres de archivo en curso
  const [uploadErr,setUploadErr] = useState('');
  const fRef = useRef();
  const bucket = data[tab]||[];

  const isPDF = item => !!(item.type?.includes('pdf') || item.url?.startsWith('data:application/pdf'));

  const addFiles = files => {
    const list = Array.from(files);
    if(!list.length) return;
    setUploadErr('');
    const tooBig = list.filter(f=>f.size>ANEXOS_MAX_SIZE);
    const valid  = list.filter(f=>f.size<=ANEXOS_MAX_SIZE);
    if(tooBig.length){
      setUploadErr(`${tooBig.map(f=>f.name).join(', ')}: supera el límite de 10 MB por archivo. No se ha subido.`);
    }
    if(!valid.length) return;
    if(!token||!userId){
      setUploadErr('No se puede subir: sesión no disponible. Recarga la página e inicia sesión de nuevo.');
      return;
    }
    setUploading(u=>[...u,...valid.map(f=>f.name)]);
    Promise.allSettled(valid.map(async f=>{
      const path = `${userId}/${informeId||'sin-informe'}/${tab}/${Date.now()}-${Math.random().toString(36).slice(2,8)}-${sanitizeAnexoName(f.name)}`;
      const res = await fetch(`${SB_URL}/storage/v1/object/anexos/${path}`, {
        method:'POST',
        headers:{'Authorization':`Bearer ${token}`,'apikey':SB_KEY,'Content-Type':f.type||'application/octet-stream'},
        body:f
      });
      if(!res.ok) throw new Error(`${f.name}: fallo al subir (${res.status})`);
      return {id:Date.now()+Math.random(),name:f.name,url:`${ANEXOS_PUBLIC_PREFIX}${path}`,type:f.type||"",caption:"",cat:"Daño general"};
    })).then(results=>{
      const okItems = results.filter(r=>r.status==='fulfilled').map(r=>r.value);
      const errs = results.filter(r=>r.status==='rejected').map(r=>r.reason?.message||'Error desconocido al subir');
      if(okItems.length) onChange({...data,[tab]:[...(data[tab]||[]),...okItems]});
      if(errs.length) setUploadErr(prev=>[prev,...errs].filter(Boolean).join(' · '));
      setUploading(u=>u.filter(n=>!valid.some(f=>f.name===n)));
    });
  };
  const updI=(id,k,v)=>onChange({...data,[tab]:bucket.map(i=>i.id===id?{...i,[k]:v}:i)});
  const delI = id => {
    const item = bucket.find(i=>i.id===id);
    onChange({...data,[tab]:bucket.filter(i=>i.id!==id)});
    if(item?.url?.startsWith(ANEXOS_PUBLIC_PREFIX) && token){
      const path = item.url.slice(ANEXOS_PUBLIC_PREFIX.length);
      fetch(`${SB_URL}/storage/v1/object/anexos/${path}`, {
        method:'DELETE',
        headers:{'Authorization':`Bearer ${token}`,'apikey':SB_KEY}
      }).then(res=>{
        if(!res.ok) console.error('No se pudo borrar el archivo de Storage:', res.status, path);
      }).catch(err=>console.error('No se pudo borrar el archivo de Storage:', err));
    }
  };
  const handleSave = () => { onSave?.(); setSaved(true); setTimeout(()=>setSaved(false),2500); };
  const total = tabs.reduce((a,t)=>a+(data[t.id]||[]).length,0);

  const handleDrop = e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); };

  return (
    <div className="fade">
      <SecTitle label="Anexos" sub="Reportaje fotográfico, datos catastrales, Meteosim, facturas y presupuestos"/>

      {/* Sin tira de contexto aparte: los contadores de cada pestaña ya cumplen esa función. */}
      <ZoneLabel zone="trabajo">Datos del perito</ZoneLabel>

      <div style={{display:"flex",gap:7,marginBottom:16,flexWrap:"wrap"}}>
        {tabs.map(t=>{
          const cnt=(data[t.id]||[]).length;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 16px",
              borderRadius:7,border:`1px solid ${tab===t.id?C.accent:C.border}`,
              background:tab===t.id?C.accentLight:C.white,cursor:"pointer",fontSize:15,
              fontWeight:tab===t.id?700:400,color:tab===t.id?C.accent:C.ink,fontFamily:"inherit"}}>
              <t.icon size={13}/>{t.label}
              {cnt>0&&<span style={{background:C.accent,color:"#fff",borderRadius:"50%",width:18,height:18,fontSize:12,display:"inline-flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{cnt}</span>}
            </button>
          );
        })}
      </div>

      <div
        onClick={()=>fRef.current.click()}
        onDragOver={e=>{e.preventDefault();setDrag(true);}}
        onDragEnter={e=>{e.preventDefault();setDrag(true);}}
        onDragLeave={()=>setDrag(false)}
        onDrop={handleDrop}
        style={{border:`2px dashed ${dragging?C.accent:C.border}`,borderRadius:10,padding:28,
          textAlign:"center",cursor:"pointer",background:dragging?C.accentLight:C.bg,
          marginBottom:14,transition:"background .12s,border-color .12s"}}>
        <Upload size={24} style={{color:dragging?C.accent:C.muted,marginBottom:7}}/>
        <div style={{fontSize:15,fontWeight:600,color:dragging?C.accent:C.ink}}>
          {dragging?"Suelta aquí para añadir":"Arrastra archivos o haz clic para seleccionar"}
        </div>
        <div style={{fontSize:14,color:C.muted,marginTop:2}}>Imágenes y PDFs</div>
        <input ref={fRef} type="file" multiple accept="image/*,.pdf" style={{display:"none"}} onChange={e=>addFiles(e.target.files)}/>
      </div>

      {uploading.length>0&&<div style={{display:"flex",alignItems:"center",gap:7,fontSize:14,color:C.muted,marginBottom:10}}>
        <Spin/>Subiendo {uploading.length} archivo{uploading.length>1?'s':''}…
      </div>}
      {uploadErr&&<div style={{background:C.redBg,border:'1px solid #FECACA',borderRadius:7,padding:'8px 12px',fontSize:14,color:C.red,marginBottom:14}}>{uploadErr}</div>}

      {bucket.length>0
        ?<div className="grid3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {bucket.map((item,idx)=>(
            <div key={item.id} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:9,overflow:"hidden"}}>
              <div style={{position:"relative",background:"#f5f5f5"}}>
                {isPDF(item)
                  ?<iframe src={item.url} title={item.name}
                      style={{width:"100%",height:200,border:"none",pointerEvents:"none",display:"block"}}/>
                  :<img src={item.url} alt={item.caption}
                      style={{width:"100%",height:"auto",maxHeight:260,objectFit:"contain",display:"block"}}/>
                }
                <button onClick={e=>{e.stopPropagation();delI(item.id);}} style={{position:"absolute",top:5,right:5,background:"rgba(0,0,0,.6)",border:"none",borderRadius:"50%",width:22,height:22,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2}}>
                  <X size={10}/>
                </button>
              </div>
              <div style={{padding:8}}>
                {tab==="fotos"&&<div style={{fontSize:13,fontWeight:700,color:C.accent,marginBottom:5}}>Foto {idx+1}</div>}
                <input value={item.caption} onChange={e=>updI(item.id,"caption",e.target.value)} placeholder="Pie de foto (opcional)…"
                  style={{width:"100%",padding:"4px 6px",border:`1px solid ${C.border}`,borderRadius:4,fontSize:12,fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
            </div>
          ))}
        </div>
        :<div style={{textAlign:"center",padding:28,color:C.muted,fontSize:15}}>Sin archivos en este apartado</div>
      }

      <NavBottom onPrev={onPrev} onSave={handleSave} onNext={onNext} saved={saved}
        prevLabel="Cobertura-Indemnización" nextLabel="Generar informe"/>
    </div>
  );
};

// ─── REPORT EDITOR ────────────────────────────────────────────────────────────
// ─── EXPORT HELPERS ──────────────────────────────────────────────────────────
const fmtPDF = n => new Intl.NumberFormat('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2}).format(+n||0);
const esPdfItem = f => !!(f.type?.includes('pdf')||f.url?.startsWith('data:application/pdf'));
// Todas las facturas/presupuestos del informe: los subidos en Anexos (URL real
// en Storage) más los adjuntados en Sec3 para la extracción por IA (Blob local,
// nunca subido). A los de Sec3 se les crea una URL de objeto para poder
// incrustarlos igualmente como una hoja más del informe.
const allFacturasOf = cData => {
  const anexos=cData.anexos||{}, s3=cData.s3||{};
  const tipoS3 = s3.modoValoracion==='presupuesto'?'Presupuesto':'Factura';
  return [
    ...(anexos.facturas||[]).map(f=>({...f,tipo:'Factura'})),
    ...(anexos.presupuestos||[]).map(f=>({...f,tipo:'Presupuesto'})),
    ...(s3.facturas||[]).map(f=>({...f,tipo:tipoS3,type:f.type||f.file?.type||'',url:f.url||(f.file?URL.createObjectURL(f.file):null)})),
  ];
};

const buildWordHTML = (cData) => {
  const enc=cData.encargo||{}, s1=cData.s1||{}, s2=cData.s2||{}, s3=cData.s3||{}, s4=cData.s4||{}, anexos=cData.anexos||{};
  const catastroImg=(anexos.catastro||[]).find(c=>!(c.type?.includes('pdf')||c.url?.startsWith('data:application/pdf')));
  const catastroHTML=catastroImg?`<p style='font-size:8.5pt;color:#666;margin:6pt 0 2pt'>Cartografía catastral:</p><img src='${catastroImg.url}' style='max-width:60%;max-height:240pt;border:1px solid #ccc'/>`:'';
  const partidas=getPartidas(s3);
  const totalDano=sumReal(partidas);
  const reglas=calcReglas(enc,s1);
  const franq=parseCap(s3.franquiciaVal||enc.franquicia);
  const capCont=reglas.capCont, vRealC=reglas.vPreexCont, capCont2=reglas.capCont2;
  const ajustado=sumAjustado(enc,s1,s3);
  const indemn=calcIndemnizacion(enc,s1,s3);
  const regla=totalDano>0?ajustado/totalDano:1;
  const modo=s3.modoValoracion||'baremo';
  const showIVAw=modo!=='presupuesto';
  const showDeprw=!((modo==='presupuesto'||modo==='factura')&&s3.perceptorTipo==='reparador');
  // Daño y valor ajustado por bloque
  const dCont=partidas.filter(p=>(p.garantia||'continente')!=='contenido').reduce((a,p)=>a+calcPartida(p).vReal,0);
  const dCont2=partidas.filter(p=>p.garantia==='contenido').reduce((a,p)=>a+calcPartida(p).vReal,0);
  const aCont=dCont*(s3.reglaContinente?reglas.continente:1);
  const aCont2=dCont2*(s3.reglaContenido?reglas.contenido:1);
  const riesgoLines=enc.tipoEncargo==='INSTANT_PAYMENT'
    ?[s1.textoInstant||('Localización del riesgo: el riesgo está situado en '+enc.lugarIntervencion+'. Este siniestro se ha gestionado documentalmente.')]
    :[`El riesgo asegurado se corresponde con: ${s1.tipoRiesgo||'—'}.`,
      `La fecha de construcción es del año ${s1.anoConstruccion||'—'}.`,
      `Cuenta con una superficie construida de ${s1.superficieConstruida||'—'} M2 en total`,
      `Acabados son de calidad: ${s1.calidad||'—'}`,
      `El estado general del riesgo asegurado se encuentra según nuestro criterio: ${s1.estado||'—'}`,
      `Localización del riesgo: el riesgo está situado en ${enc.lugarIntervencion||'—'}`,
      `Referencia catastral del inmueble: ${s1.refCatastral||''}`];
  const partidasContW  = partidas.filter(p=>(p.garantia||'continente')!=='contenido');
  const partidasCont2W = partidas.filter(p=>p.garantia==='contenido');
  const totNuevoContW=sumRepos(partidasContW),   totRealContW=sumReal(partidasContW);
  const totNuevoCont2W=sumRepos(partidasCont2W), totRealCont2W=sumReal(partidasCont2W);
  const wTh=['Oficio','Descripción-concepto','Uds','V.Unit.','V.Repos.',...(showIVAw?['%IVA','IVA']:[]),...(showDeprw?['Depr','%Depr']:[]),'V.Real','Perceptor','Cob.'].map(h=>`<th>${h}</th>`).join('');
  const wRows = rows => rows.map(p=>{
    const {vRepos:vr,ivaAmt:iv,vReal:vreal}=calcPartida(p);
    return `<tr><td>${(p.oficio||'').toUpperCase()}</td><td>${p.desc||''}</td><td>${fmtSmart(p.uds||1)}</td><td>${fmtPDF(p.p)}</td><td>${fmtPDF(vr)}</td>`
      +(showIVAw?`<td>${p.ivaOn?fmtSmart(p.iva||21):0}%</td><td>${fmtPDF(iv)}</td>`:'')
      +(showDeprw?`<td>${p.depr?'SI':'NO'}</td><td>${p.depr?fmtSmart(p.pctDepr||0)+'%':'0'}</td>`:'')
      +`<td>${fmtPDF(vreal)}</td><td>${p.perceptor||'Asegurado'}</td><td>${p.cobertura!==false?'Sí':'No'}</td></tr>`;
  }).join('');
  const wSubtotal = rows => `<tr class='subtotal'><td></td><td>Subtotal</td><td></td><td></td><td>${fmtPDF(sumRepos(rows))} €</td>`
    +(showIVAw?`<td></td><td>${fmtPDF(sumIVA(rows))} €</td>`:'')
    +(showDeprw?`<td></td><td></td>`:'')
    +`<td>${fmtPDF(sumReal(rows))} €</td><td></td><td></td></tr>`;
  const rowPartCont=wRows(partidasContW), subCont=wSubtotal(partidasContW);
  const rowPartCont2=wRows(partidasCont2W), subCont2=wSubtotal(partidasCont2W);
  const wGarRows=[
    {tit:'Continente',dano:dCont,lim:capCont,on:s3.reglaContinente,regla:reglas.continente,ajust:aCont},
    {tit:'Contenido', dano:dCont2,lim:capCont2,on:s3.reglaContenido,regla:reglas.contenido,ajust:aCont2},
  ].filter(b=>b.dano>0).map(b=>`<tr><td>${b.tit}.<br/>${enc.garantia||''}<br/>${enc.causa||''}</td><td>${fmtPDF(b.dano)} €</td><td>${fmtPDF(b.lim)} €</td><td>${b.on&&b.regla<1?fmtSmart(b.regla*100)+'%':'NO'}</td><td>${fmtPDF(b.ajust)} €</td><td>—</td><td>${fmtPDF(b.ajust)} €</td></tr>`).join('');
  const w3Intro=s4.textoIntro||sec4IntroAuto(modo);
  const w4Desc=s4.descripcionCobertura||'';
  const w4Indemn=s4.textoIndemn||sec4IndemnAuto(s3,indemn);
  const facturasW=cData._facturasResueltas||allFacturasOf(cData);
  // Word (el "filtro HTML" que usa para abrir un .doc que en realidad es
  // HTML) ignora flexbox y calc(), y además no siempre respeta el ancho
  // puesto por CSS en <td>/<img>: hay que usar también el atributo HTML
  // width (herencia de HTML4), que es lo que Word sí interpreta de forma
  // fiable. Se deja también el CSS para que en un navegador/LibreOffice
  // se vea igual de bien.
  const wFotos=anexos.fotos||[];
  const wFotoRow = (f,i) => {
    const isPdfItem=!!(f.type?.includes('pdf')||f.url?.startsWith('data:application/pdf'));
    return `<tr><td width="100%" valign="top" class='foto-cell'>${isPdfItem?`<p style='font-size:8pt;color:#666'>[Documento adjunto: ${f.name||''}]</p>`:`<img src='${f.url}' width="520" style='width:100%;max-width:520pt;height:auto;display:block' border="0"/>`}<div style='font-size:9pt;font-weight:bold;color:#333;margin-top:4pt'>Foto ${i+1}</div>${f.caption?`<div style='font-size:8pt;color:#666;margin-top:1pt'>${f.caption}</div>`:''}</td></tr>`;
  };
  const wFotosHTML=wFotos.length?`${facturasW.length?`<div class='page-break'></div>
<div class='header-gvp'><b style='color:#555'>GABINETE DE VALORACIONES PERICIALES</b><span style='color:#666'>expediente ${enc.numReferencia||''}</span></div>`:''}
<h3>Reportaje fotográfico.</h3>
<table class='foto-table' width="100%" cellpadding="4" cellspacing="0">${wFotos.map(wFotoRow).join('')}</table>`:'';
  const wFacturasHTML=facturasW.map((f,i)=>{
    const isPdfItem=!!(f.type?.includes('pdf')||f.url?.startsWith('data:application/pdf'));
    return `${i>0?`<div class='page-break'></div>
<div class='header-gvp'><b style='color:#555'>GABINETE DE VALORACIONES PERICIALES</b><span style='color:#666'>expediente ${enc.numReferencia||''}</span></div>`:''}
<h3>${f.tipo} ${i+1}${f.name?': '+f.name:''}</h3>
${f.url&&!isPdfItem?`<img src='${f.url}' width="520" style='width:100%;max-width:520pt;height:auto;display:block' border="0"/>`:`<p style='font-size:9pt;color:#666'>[Documento adjunto: ${f.name||''}]</p>`}`;
  }).join('');
  return `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'/><title>Informe Pericial ${enc.numReferencia||''}</title>
<style>
  @page Section1{size:21cm 29.7cm;margin:1.2cm 1.5cm 1.6cm 1.5cm;mso-header:h1;mso-footer:f1;mso-header-margin:.5cm;mso-footer-margin:.5cm}
  div.Section1{page:Section1}
  body{font-family:Arial,sans-serif;font-size:10pt;color:#000;margin:0}
  h1{font-size:18pt;font-style:italic;text-align:center;border-top:1px solid #888;border-bottom:1px solid #888;padding:6pt 0}
  h2{font-size:11pt;border-bottom:2px solid #888;padding-bottom:3pt;margin-top:38pt;page-break-after:avoid}
  h3{font-size:10pt;margin-top:12pt;page-break-after:avoid}
  .no-split{page-break-inside:avoid}
  table{border-collapse:collapse;width:100%;font-size:8pt;margin:6pt 0}
  thead{display:table-header-group}
  th{background:#555;color:#fff;padding:3pt 4pt;text-align:left;font-size:7.5pt}
  td{border:1px solid #ddd;padding:3pt 4pt;vertical-align:top}
  tr{page-break-inside:avoid}
  tr:nth-child(even) td{background:#fafafa}
  .subtotal td{background:#f2f2f2;font-weight:bold;color:#333;border-color:#999}
  .field-label{font-size:8pt;color:#666;display:block}
  .field-value{font-size:10pt;font-weight:bold;border-bottom:1px solid #ccc;padding-bottom:2pt;margin-bottom:8pt;display:block}
  .intro{font-style:italic;color:#555;font-size:9pt;margin:8pt 0;line-height:1.6}
  .header-gvp{border-bottom:1px solid #888;padding-bottom:4pt;margin-bottom:10pt;display:flex;justify-content:space-between}
  .bullet{margin-left:12pt;list-style:square}
  .bullet li{margin-bottom:4pt}
  .cap-table{width:200pt;margin-left:30pt}
  .cap-table th{background:#555}
  .firma-box{border:1px solid #ccc;width:150pt;height:50pt;display:inline-block}
  .page-break{page-break-before:always}
  .foto-table{table-layout:fixed}
  .foto-table tr{page-break-inside:avoid}
  .foto-table td.foto-cell{width:100%;border:none;background:none;padding:4pt;vertical-align:top}
</style></head>
<body>
<div style='mso-element:header' id=h1><p style='margin:0;font-size:7.5pt;color:#666'>GABINETE DE VALORACIONES PERICIALES · expediente ${enc.numReferencia||''}</p></div>
<div style='mso-element:footer' id=f1><p style='margin:0;text-align:center;font-size:7.5pt;color:#666'>Página <span style="mso-field-code:' PAGE '">1</span> de <span style="mso-field-code:' NUMPAGES '">1</span></p></div>
<div class=Section1>
<div class='header-gvp'><b style='color:#555'>GABINETE DE VALORACIONES PERICIALES</b><span style='color:#666'>expediente ${enc.numReferencia||''}</span></div>
<h1>INFORME PERICIAL</h1>
<table style='margin-top:16pt'><tr>
  <td><span class='field-label'>Compañía</span><span class='field-value'>${normCompania(enc.compania)||'—'}</span></td>
  <td><span class='field-label'>Nº Referencia</span><span class='field-value'>${enc.numReferencia||'—'}</span></td>
  <td><span class='field-label'>Nº Póliza</span><span class='field-value'>${enc.numPoliza||'—'}</span></td>
</tr><tr>
  <td><span class='field-label'>Ramo</span><span class='field-value'>${enc.ramo||'—'}</span></td>
  <td><span class='field-label'>Garantía</span><span class='field-value'>${enc.garantia||'—'}</span></td>
  <td><span class='field-label'>Importe líquido siniestro</span><span class='field-value'>${fmtPDF(totalDano)} €</span></td>
</tr><tr>
  <td><span class='field-label'>Fecha Encargo</span><span class='field-value'>${enc.fechaEncargo||'—'}</span></td>
  <td><span class='field-label'>Fecha Siniestro</span><span class='field-value'>${enc.fechaSiniestro||'—'}</span></td>
  <td><span class='field-label'>Nº de Encargo</span><span class='field-value'>${enc.numExpInterno||'—'}</span></td>
</tr></table>
<p><span class='field-label'>Lugar intervención (Provincia)</span><span class='field-value'>${enc.lugarIntervencion||'—'}</span></p>
<p><span class='field-label'>Asegurado</span><span class='field-value'>${enc.asegurado||'—'}</span></p>
<table><tr><td><span class='field-label'>Perito:</span><span class='field-value'>${enc.perito||'—'}</span></td><td><span class='field-label'>Teléfono Perito:</span><span class='field-value'>${enc.telPerito||'—'}</span></td></tr></table>
<p class='intro'>Este informe pericial ha sido emitido por el perito Don ${enc.perito||'—'}, ha sido solicitado por el departamento de siniestros de la aseguradora epigrafiada anteriormente, a tenor del siniestro declarado en el riesgo asegurado con póliza suscrita por la precitada aseguradora.</p>
<p class='intro'>En cumplimiento de lo requerido, se ha procedido a la comparecencia pericial en el Riesgo Asegurado, realizando la función pericial iniciando los trabajos que nos son propios, tendentes a la determinación de las causas y circunstancias del siniestro y a la valoración de los daños consecuentes al mismo, para finalmente elevar propuesta de indemnización a las partes, a tenor de la información conocida hasta la fecha.</p>
<p class='intro'>El que suscribe en cumplimiento del artículo 335.2 de la Ley 1/2000 de Enjuiciamiento Civil, manifiesta bajo promesa de decir verdad, que ha actuado y actuará con la mayor objetividad posible, tomando en consideración tanto lo que pueda favorecer como lo que sea susceptible de causar perjuicio a cualquiera de las partes.</p>
<p class='intro'>La valoración económica sugerida, así como cualquier observación relativa a coberturas, exclusiones y/o responsabilidad del presente informe, queda supeditada en todo caso a criterio de la Compañía en base de la póliza suscrita.</p>
<div class='page-break'></div>
<div class='header-gvp'><b style='color:#555'>GABINETE DE VALORACIONES PERICIALES</b><span style='color:#666'>expediente ${enc.numReferencia||''}</span></div>
<h2>1. VERIFICACIÓN DEL RIESGO Y PÓLIZA.</h2>
<h3>1.1. Descripción del riesgo:</h3>
<ul class='bullet'>${riesgoLines.map(l=>`<li>${l}</li>`).join('')}</ul>
${catastroHTML}
<br/>
<div class="no-split">
<b>CONTINENTE / OBRAS DE REFORMA</b>
<p style='font-style:italic;font-size:9pt'>1. La preexistencia ha sido estudiada en aplicación de los precios por m², teniendo en cuenta calidad de acabados y provincia.</p>
<table class='cap-table'><tr><th colspan='2'>CONTINENTE</th></tr>
<tr><td>VALOR ASEGURADO</td><td>${fmtPDF(capCont)} €</td></tr>
<tr><td>VALOR PREEXISTENTE</td><td>${fmtPDF(vRealC)} €</td></tr>
<tr><td><b>INFRASEGURO</b></td><td><b>${fmtPDF(reglas.infraCont)} %</b></td></tr></table>
</div>
<br/>
<div class="no-split">
<b>CONTENIDO:</b>
<p style='font-style:italic;font-size:9pt'>1. La preexistencia ES ESTIMADA atendiendo a los criterios de objetividad pericial.</p>
<table class='cap-table'><tr><th colspan='2'>CONTENIDO</th></tr>
<tr><td>VALOR ASEGURADO</td><td>${fmtPDF(capCont2)} €</td></tr>
<tr><td>VALOR PREEXISTENTE</td><td>${fmtPDF(reglas.vPreexContenido)} €</td></tr>
<tr><td><b>INFRASEGURO</b></td><td><b>${fmtPDF(reglas.infraContenido)} %</b></td></tr></table>
</div>
${s1.aiText?'<p>'+s1.aiText+'</p>':''}
<h2>2. CAUSAS Y CIRCUNSTANCIAS</h2>
<h3>2.1. Descripción del siniestro:</h3>
<p>${(s2.textoAI||s2.textoRaw||'').replace(/\n/g,'<br/>')}</p>
${meteoHTML(s2.meteo, enc, '')}
<h2>3. VALORACIÓN DE DAÑOS.</h2>
<p>Evaluada con arreglo a los criterios que se establecen en las condiciones de la póliza, resumimos la tasación de daños:</p>
${w3Intro?`<p>${w3Intro.replace(/\n/g,'<br/>')}</p>`:''}
${s3.textoAI?'<p>'+s3.textoAI+'</p>':''}
${partidas.length>0?`
${partidasContW.length>0?`<div class="no-split"><h3 style='text-align:left'>Daños en Continente</h3><table><tr>${wTh}</tr>${rowPartCont}${subCont}</table></div>`:''}
${partidasCont2W.length>0?`<div class="no-split"><h3 style='text-align:left'>Daños en Contenido</h3><table><tr>${wTh}</tr>${rowPartCont2}${subCont2}</table></div>`:''}
<div class="no-split">
<h3 style='text-align:left'>Resumen de Daños</h3>
<table><tr><th>Garantía</th><th>Valor a nuevo</th><th>Valor real</th></tr>
<tr><td>Total Continente</td><td>${fmtPDF(totNuevoContW)} €</td><td>${fmtPDF(totRealContW)} €</td></tr>
<tr><td>Total Contenido</td><td>${fmtPDF(totNuevoCont2W)} €</td><td>${fmtPDF(totRealCont2W)} €</td></tr>
<tr class='subtotal'><td><b>Total estimación de daños</b></td><td><b>${fmtPDF(totNuevoContW+totNuevoCont2W)} €</b></td><td><b>${fmtPDF(totalDano)} €</b></td></tr></table>
</div>`:''}
<h2>4. ESTUDIO DE COBERTURA-INDEMNIZACIÓN.</h2>
${w4Desc?`<h3 style='text-align:left'>4.1 Cobertura</h3><p style='white-space:pre-wrap'>${w4Desc.replace(/\n/g,'<br/>')}</p>`:''}
${partidas.length>0?`<div class="no-split">
<h3 style='text-align:left'>4.2 Resumen por garantías. Propuesta de indemnización</h3>
<table><tr><th>Garantía Afectada</th><th>D. con cobertura</th><th>Límite aseg.</th><th>Regla proporcional</th><th>Valor ajustado</th><th>Franquicia</th><th>Indemnización</th></tr>
${wGarRows}
<tr class='subtotal'><td>Total</td><td>${fmtPDF(totalDano)} €</td><td></td><td></td><td>${fmtPDF(ajustado)} €</td><td>${fmtPDF(franq)} €</td><td>${fmtPDF(indemn)} €</td></tr>
<tr><td>Franquicia</td><td></td><td></td><td></td><td></td><td></td><td>${fmtPDF(franq)} €</td></tr></table>
</div>`:''}
${w4Indemn?`<p style='white-space:pre-wrap'>${w4Indemn.replace(/\n/g,'<br/>')}</p>`:''}
<br/><br/>
<div class="no-split">
<p>Por nuestra parte damos por finalizada la intervención en el siniestro, quedando a su disposición ante cualquier aclaración que estimen oportuna.</p>
<p style='margin-top:16pt'>En ${enc.municipio||enc.lugarIntervencion||'—'}, a ${new Date().toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'})}</p>
<table style='margin-top:20pt;width:100%'><tr>
<td style='width:50%;vertical-align:top'><p style='font-style:italic'>VºBº técnico GVP</p><div class='firma-box'>&nbsp;</div></td>
<td style='width:50%;text-align:right;vertical-align:top'>
<p style='font-style:italic'>Perito: ${enc.perito||'—'}</p>
<p style='font-style:italic'>Telef: ${enc.telPerito||'—'}</p>
<p style='font-style:italic'>Firma perito:</p>
<div class='firma-box'>&nbsp;</div></td>
</tr></table>
</div>
${(facturasW.length||wFotos.length)?`<div class='page-break'></div>
<div class='header-gvp'><b style='color:#555'>GABINETE DE VALORACIONES PERICIALES</b><span style='color:#666'>expediente ${enc.numReferencia||''}</span></div>
<h2>Anexos.</h2>`:''}
${wFacturasHTML}
${wFotosHTML}
</div>
</body></html>`;
};

// Word (formato HTML disfrazado de .doc) no siempre descarga imágenes
// enlazadas por URL remota al abrir el documento; las incrustamos como
// base64 en el momento de exportar para garantizar que se vean siempre.
const wordImgCache = new Map();
const urlToDataURI = url => {
  if(wordImgCache.has(url)) return wordImgCache.get(url);
  const p = fetch(url).then(r=>r.blob()).then(blob=>new Promise((resolve,reject)=>{
    const fr=new FileReader();
    fr.onload=()=>resolve(fr.result);
    fr.onerror=()=>reject(new Error('No se pudo leer la imagen'));
    fr.readAsDataURL(blob);
  })).catch(err=>{ console.error('No se pudo incrustar imagen en el Word:', url, err); return url; });
  wordImgCache.set(url,p);
  return p;
};
const resolveAnexosImgs = async anexos => {
  const out = {...anexos};
  for(const t of ['fotos','catastro']){
    const items = anexos[t]||[];
    out[t] = await Promise.all(items.map(async it=>
      (!it.url||it.url.startsWith('data:')) ? it : {...it, url: await urlToDataURI(it.url)}
    ));
  }
  return out;
};

const exportWord = async (cData) => {
  const enc=cData.encargo||{};
  const anexosResueltos = await resolveAnexosImgs(cData.anexos||{});
  const facturasResueltas = await Promise.all(allFacturasOf(cData).map(async f=>
    f.url ? {...f, url: await urlToDataURI(f.url)} : f
  ));
  const html=buildWordHTML({...cData, anexos:anexosResueltos, _facturasResueltas:facturasResueltas});
  const blob=new Blob(['﻿'+html],{type:'application/msword'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download=`Informe_${enc.numExpInterno||enc.numReferencia||'pericial'}.doc`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url),1000);
};

const exportPDF = (cData, dniPerito='') => {
  const enc=cData.encargo||{}, s1=cData.s1||{}, s2=cData.s2||{}, s3=cData.s3||{}, s4=cData.s4||{}, anexos=cData.anexos||{};
  const partidas=getPartidas(s3);
  const totalDano=sumReal(partidas);
  const prov=PROVINCIAS.find(p=>p.l===enc.provincia||p.v===enc.provincia);
  const reglas=calcReglas(enc,s1);
  const capC=reglas.capCont, capC2=reglas.capCont2, vRC=reglas.vPreexCont;
  const ajustado=sumAjustado(enc,s1,s3);
  const ind=calcIndemnizacion(enc,s1,s3);
  const reg=totalDano>0?ajustado/totalDano:1;
  const inf=reglas.infraCont;
  const fr=parseCap(s3.franquiciaVal||enc.franquicia);
  const modo=s3.modoValoracion||'baremo';
  const showIVAd=modo!=='presupuesto';
  const showDeprd=!((modo==='presupuesto'||modo==='factura')&&s3.perceptorTipo==='reparador');
  const today=new Date().toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'});
  const allFotos=anexos?.fotos||[];
  const catastroImg=(anexos?.catastro||[]).find(c=>!(c.type?.includes('pdf')||c.url?.startsWith('data:application/pdf')));
  const catastroHTML=catastroImg?`<p style="font-size:8.5pt;color:#666;margin:6pt 0 2pt">Cartografía catastral:</p><img src="${catastroImg.url}" style="max-width:60%;max-height:240pt;border:0.3pt solid #ccc;display:block" onerror="this.style.display='none'"/>`:'';
  // Daño y valor ajustado por bloque
  const dC=partidas.filter(p=>(p.garantia||'continente')!=='contenido').reduce((a,p)=>a+calcPartida(p).vReal,0);
  const dC2=partidas.filter(p=>p.garantia==='contenido').reduce((a,p)=>a+calcPartida(p).vReal,0);
  const aC=dC*(s3.reglaContinente?reglas.continente:1);
  const aC2=dC2*(s3.reglaContenido?reglas.contenido:1);

  const partidasContD  = partidas.filter(p=>(p.garantia||'continente')!=='contenido');
  const partidasCont2D = partidas.filter(p=>p.garantia==='contenido');
  const totNuevoContD=sumRepos(partidasContD),   totRealContD=sumReal(partidasContD);
  const totNuevoCont2D=sumRepos(partidasCont2D), totRealCont2D=sumReal(partidasCont2D);
  const dTh=['Oficio','Descripción-concepto','Uds','V.Unit.','V.Repos.',...(showIVAd?['%IVA','IVA']:[]),...(showDeprd?['Depr','%Depr']:[]),'V.Real','Perceptor','Cob.'].map(h=>`<th>${h}</th>`).join('');
  const dRows = rows => rows.map(p=>{
    const {vRepos:vr,ivaAmt:iv,vReal:vreal}=calcPartida(p);
    return `<tr><td>${(p.oficio||'').toUpperCase()}</td><td>${p.desc||''}</td><td style="text-align:right">${fmtSmart(p.uds||1)}</td><td style="text-align:right">${fmtPDF(p.p)}</td><td style="text-align:right">${fmtPDF(vr)}</td>`
      +(showIVAd?`<td style="text-align:right">${p.ivaOn?fmtSmart(p.iva||21):0}%</td><td style="text-align:right">${fmtPDF(iv)}</td>`:'')
      +(showDeprd?`<td style="text-align:center">${p.depr?'SI':'NO'}</td><td style="text-align:right">${p.depr?fmtSmart(p.pctDepr||0)+'%':'0'}</td>`:'')
      +`<td style="text-align:right">${fmtPDF(vreal)}</td><td>${p.perceptor||'Asegurado'}</td><td style="text-align:center">${p.cobertura!==false?'Sí':'No'}</td></tr>`;
  }).join('');
  const dSubtotal = rows => `<tr class="subtotal"><td></td><td>Subtotal</td><td></td><td></td><td style="text-align:right">${fmtPDF(sumRepos(rows))} €</td>`
    +(showIVAd?`<td></td><td style="text-align:right">${fmtPDF(sumIVA(rows))} €</td>`:'')
    +(showDeprd?`<td></td><td></td>`:'')
    +`<td style="text-align:right">${fmtPDF(sumReal(rows))} €</td><td></td><td></td></tr>`;
  const rowPartContD=dRows(partidasContD), subContD=dSubtotal(partidasContD);
  const rowPartCont2D=dRows(partidasCont2D), subCont2D=dSubtotal(partidasCont2D);
  const dGarRows=[
    {tit:'Continente',dano:dC,lim:capC,on:s3.reglaContinente,regla:reglas.continente,ajust:aC},
    {tit:'Contenido', dano:dC2,lim:capC2,on:s3.reglaContenido,regla:reglas.contenido,ajust:aC2},
  ].filter(b=>b.dano>0).map(b=>`<tr><td>${b.tit}. ${enc.garantia||''}. ${enc.causa||''}</td><td style="text-align:right">${fmtPDF(b.dano)} €</td><td style="text-align:right">${fmtPDF(b.lim)} €</td><td style="text-align:right">${b.on&&b.regla<1?fmtSmart(b.regla*100)+'%':'NO'}</td><td style="text-align:right">${fmtPDF(b.ajust)} €</td><td style="text-align:right">—</td><td style="text-align:right">${fmtPDF(b.ajust)} €</td></tr>`).join('');
  const d3Intro=s4.textoIntro||sec4IntroAuto(modo);
  const d4Desc=s4.descripcionCobertura||'';
  const d4Indemn=s4.textoIndemn||sec4IndemnAuto(s3,ind);
  const facturasD=allFacturasOf(cData);

  const rLines=enc.tipoEncargo==='INSTANT_PAYMENT'
    ?[s1.textoInstant||('Localización del riesgo: el riesgo está situado en '+enc.lugarIntervencion+'. Este siniestro se ha gestionado documentalmente.')]
    :['El riesgo asegurado se corresponde con: '+(s1.tipoRiesgo||'—')+'.','La fecha de construcción es del año '+(s1.anoConstruccion||'—')+'.','Cuenta con una superficie construida de '+(s1.superficieConstruida||'—')+' M2 en total','Acabados son de calidad: '+(s1.calidad||'—'),'El estado general del riesgo asegurado se encuentra según nuestro criterio: '+(s1.estado||'—'),'Localización del riesgo: el riesgo está situado en '+(enc.lugarIntervencion||'—'),'Referencia catastral del inmueble: '+(s1.refCatastral||'')];

  const html=`<!DOCTYPE html><html>
<head><meta charset="utf-8"/><title>Informe Pericial ${enc.numReferencia||''}</title>
<style>
  @page{
    size:A4;margin:12mm 15mm 18mm 15mm;
    @bottom-center{
      content:"Avda. Josep Tarradellas, 38 · 08029 Barcelona · Tel: 93.118.51.38 — Página " counter(page) " de " counter(pages);
      font-family:Arial,sans-serif;font-size:7.5pt;color:#666;
    }
  }
  *{box-sizing:border-box}
  body{font-family:Arial,sans-serif;font-size:9.5pt;color:#000;margin:0;line-height:1.4}
  .hdr{border-bottom:0.4pt solid #888;padding-bottom:3pt;margin-bottom:8pt;display:flex;justify-content:space-between;align-items:baseline}
  .hdr-left{font-weight:bold;color:#555;font-size:8pt}
  .hdr-right{font-size:8pt;color:#666}
  h1{font-size:18pt;font-style:italic;text-align:center;border-top:0.5pt solid #888;border-bottom:0.5pt solid #888;padding:6pt 0;margin:12pt 0 16pt}
  h2{font-size:10.5pt;font-weight:bold;border-bottom:1.5pt solid #888;padding-bottom:2pt;margin-top:38pt;margin-bottom:8pt;page-break-after:avoid;break-after:avoid}
  h3{font-size:9.5pt;font-weight:bold;margin:10pt 0 4pt;page-break-after:avoid;break-after:avoid}
  .no-split{page-break-inside:avoid;break-inside:avoid}
  .grid3{display:table;width:100%;margin-bottom:8pt}
  .grid3-row{display:table-row}
  .grid3-cell{display:table-cell;width:33.3%;padding:0 4pt 6pt 0}
  .fl{font-size:7.5pt;color:#666;display:block;margin-bottom:1pt}
  .fv{font-size:10pt;font-weight:bold;border-bottom:0.3pt solid #ccc;padding-bottom:2pt;display:block}
  p.intro{font-style:italic;color:#555;font-size:8.5pt;margin:6pt 0;line-height:1.6}
  ul.viñetas{margin:4pt 0 4pt 12pt;padding:0}
  ul.viñetas li{margin-bottom:3pt;font-size:9.5pt}
  table.data{border-collapse:collapse;width:100%;margin:6pt 0;font-size:7.5pt}
  table.data thead{display:table-header-group}
  table.data th{background:#555;color:#fff;padding:3pt 3pt;text-align:left;font-weight:bold}
  table.data td{border:0.3pt solid #ddd;padding:2.5pt 3pt;vertical-align:top}
  table.data tr:nth-child(even) td{background:#fafafa}
  table.data tr{page-break-inside:avoid;break-inside:avoid}
  table.cap{border-collapse:collapse;width:180pt;margin-left:20pt;font-size:9pt}
  table.cap th{background:#555;color:#fff;padding:3pt;text-align:center}
  table.cap td{border:0.5pt solid #ccc;padding:3pt 5pt}
  .subtotal td{background:#f2f2f2!important;font-weight:bold;color:#333;border-color:#999!important}
  .page-break{page-break-before:always;margin-top:0}
  .firma-box{border:0.5pt solid #bbb;width:140pt;height:45pt;display:inline-block;margin-top:4pt}
  .firma-table{width:100%;margin-top:20pt}
  .firma-table td{vertical-align:top;font-style:italic;font-size:9pt}
  .anex-foto{display:flex;flex-direction:column;gap:14pt}
  .anex-foto-item{page-break-inside:avoid;break-inside:avoid}
  .anex-foto-item img{width:100%;height:auto;max-height:300pt;object-fit:contain;border:0.3pt solid #ddd;display:block}
  .anex-foto-item iframe{width:100%;height:300pt;border:none;display:block}
  .anex-foto-item .cap{font-size:8pt;color:#666;margin-top:3pt}
  .anex-foto-item .num{font-size:9pt;font-weight:bold;color:#333;margin-top:5pt}
  @media print{
    .hdr{position:fixed;top:0;left:0;right:0;background:white;padding:3mm 15mm 2mm}
    body{padding-top:14mm}
    .no-print{display:none}
  }
</style></head>
<body>
<div class="hdr"><span class="hdr-left">GABINETE DE VALORACIONES PERICIALES</span><span class="hdr-right">expediente ${enc.numReferencia||''}</span></div>
<h1>INFORME PERICIAL</h1>
<div class="grid3"><div class="grid3-row"><div class="grid3-cell"><span class="fl">Compañía</span><span class="fv">${normCompania(enc.compania)||'—'}</span></div><div class="grid3-cell"><span class="fl">Nº Referencia</span><span class="fv">${enc.numReferencia||'—'}</span></div><div class="grid3-cell"><span class="fl">Nº Póliza</span><span class="fv">${enc.numPoliza||'—'}</span></div></div></div>
<div class="grid3"><div class="grid3-row"><div class="grid3-cell"><span class="fl">Ramo</span><span class="fv">${enc.ramo||'—'}</span></div><div class="grid3-cell"><span class="fl">Garantía</span><span class="fv">${enc.garantia||'—'}</span></div><div class="grid3-cell"><span class="fl">Importe líquido siniestro</span><span class="fv">${fmtPDF(totalDano)} €</span></div></div></div>
<div class="grid3"><div class="grid3-row"><div class="grid3-cell"><span class="fl">Fecha Encargo</span><span class="fv">${enc.fechaEncargo||'—'}</span></div><div class="grid3-cell"><span class="fl">Fecha Siniestro</span><span class="fv">${enc.fechaSiniestro||'—'}</span></div><div class="grid3-cell"><span class="fl">Nº de Encargo</span><span class="fv">${enc.numExpInterno||'—'}</span></div></div></div>
<div style="margin-bottom:6pt"><span class="fl">Lugar intervención (Provincia)</span><span class="fv">${enc.lugarIntervencion||'—'}</span></div>
<div style="margin-bottom:6pt"><span class="fl">Asegurado</span><span class="fv">${enc.asegurado||'—'}</span></div>
<div class="grid3"><div class="grid3-row"><div class="grid3-cell"><span class="fl">Perito:</span><span class="fv">${enc.perito||'—'}</span></div><div class="grid3-cell"><span class="fl">Teléfono Perito:</span><span class="fv">${enc.telPerito||'—'}</span></div></div></div>
<p class="intro">Este informe pericial ha sido emitido por el perito Don ${enc.perito||'—'}, ha sido solicitado por el departamento de siniestros de la aseguradora epigrafiada anteriormente, a tenor del siniestro declarado en el riesgo asegurado con póliza suscrita por la precitada aseguradora.</p>
<p class="intro">En cumplimiento de lo requerido, se ha procedido a la comparecencia pericial en el Riesgo Asegurado, realizando la función pericial iniciando los trabajos que nos son propios, tendentes a la determinación de las causas y circunstancias del siniestro y a la valoración de los daños consecuentes al mismo, para finalmente elevar propuesta de indemnización a las partes.</p>
<p class="intro">El que suscribe en cumplimiento del artículo 335.2 de la Ley 1/2000 de Enjuiciamiento Civil, manifiesta bajo promesa de decir verdad, que ha actuado y actuará con la mayor objetividad posible, tomando en consideración tanto lo que pueda favorecer como lo que sea susceptible de causar perjuicio a cualquiera de las partes.</p>
<p class="intro">La valoración económica sugerida, así como cualquier observación relativa a coberturas, exclusiones y/o responsabilidad del presente informe, queda supeditada en todo caso a criterio de la Compañía en base de la póliza suscrita.</p>
<div class="page-break"></div>
<div class="hdr"><span class="hdr-left">GABINETE DE VALORACIONES PERICIALES</span><span class="hdr-right">expediente ${enc.numReferencia||''}</span></div>
<h2>1.&nbsp;&nbsp;&nbsp;VERIFICACIÓN DEL RIESGO Y PÓLIZA.</h2>
<h3>1.1. Descripción del riesgo:</h3>
<ul class="viñetas">${rLines.filter(Boolean).map(l=>`<li>${l}</li>`).join('')}</ul>
${catastroHTML}
<h3>Estudios de los capitales Asegurados:</h3>
<div class="no-split">
<p style="font-weight:bold">CONTINENTE / OBRAS DE REFORMA</p>
<p style="font-style:italic;font-size:8.5pt">1. La preexistencia ha sido estudiada en aplicación de los precios por m², teniendo en cuenta calidad de acabados y provincia.</p>
<table class="cap"><tr><th colspan="2">CONTINENTE</th></tr><tr><td>VALOR ASEGURADO</td><td><strong>${fmtPDF(capC)} €</strong></td></tr><tr><td>VALOR PREEXISTENTE</td><td><strong>${fmtPDF(vRC)} €</strong></td></tr><tr><td><strong>INFRASEGURO</strong></td><td><strong>${fmtPDF(inf)} %</strong></td></tr></table>
</div>
<br/>
<div class="no-split">
<p style="font-weight:bold">CONTENIDO:</p>
<p style="font-style:italic;font-size:8.5pt">1. La preexistencia ES ESTIMADA atendiendo a los criterios de objetividad pericial teniendo en cuenta criterios objetivos.</p>
<table class="cap"><tr><th colspan="2">CONTENIDO</th></tr><tr><td>VALOR ASEGURADO</td><td><strong>${fmtPDF(capC2)} €</strong></td></tr><tr><td>VALOR PREEXISTENTE</td><td><strong>${fmtPDF(reglas.vPreexContenido)} €</strong></td></tr><tr><td><strong>INFRASEGURO</strong></td><td><strong>${fmtPDF(reglas.infraContenido)} %</strong></td></tr></table>
</div>
${s1.aiText?`<p style="margin-top:10pt">${s1.aiText.replace(/\n/g,'<br/>')}</p>`:''}
<h2>2.&nbsp;&nbsp;&nbsp;CAUSAS Y CIRCUNSTANCIAS</h2>
<h3>2.1. Descripción del siniestro:</h3>
<p>${(s2.textoAI||s2.textoRaw||'').replace(/\n/g,'<br/>')}</p>
${meteoHTML(s2.meteo, enc, 'data')}
<h2>3.&nbsp;&nbsp;&nbsp;VALORACIÓN DE DAÑOS.</h2>
<p>Evaluada con arreglo a los criterios que se establecen en las condiciones de la póliza, resumimos la tasación de daños:</p>
${d3Intro?`<p>${d3Intro.replace(/\n/g,'<br/>')}</p>`:''}
${s3.textoAI?`<p>${s3.textoAI.replace(/\n/g,'<br/>')}</p>`:''}
${partidas.length>0?`
${partidasContD.length>0?`<div class="no-split"><h3 style="text-align:left">Daños en Continente</h3><table class="data"><thead><tr>${dTh}</tr></thead><tbody>${rowPartContD}${subContD}</tbody></table></div>`:''}
${partidasCont2D.length>0?`<div class="no-split"><h3 style="text-align:left">Daños en Contenido</h3><table class="data"><thead><tr>${dTh}</tr></thead><tbody>${rowPartCont2D}${subCont2D}</tbody></table></div>`:''}
<div class="no-split">
<h3 style="text-align:left">Resumen de Daños</h3>
<table class="data"><thead><tr><th>Garantía</th><th>Valor a nuevo</th><th>Valor real</th></tr></thead><tbody>
<tr><td>Total Continente</td><td style="text-align:right">${fmtPDF(totNuevoContD)} €</td><td style="text-align:right">${fmtPDF(totRealContD)} €</td></tr>
<tr><td>Total Contenido</td><td style="text-align:right">${fmtPDF(totNuevoCont2D)} €</td><td style="text-align:right">${fmtPDF(totRealCont2D)} €</td></tr>
<tr class="subtotal"><td>Total estimación de daños</td><td style="text-align:right">${fmtPDF(totNuevoContD+totNuevoCont2D)} €</td><td style="text-align:right">${fmtPDF(totalDano)} €</td></tr>
</tbody></table>
</div>`:''}
<h2>4.&nbsp;&nbsp;&nbsp;ESTUDIO DE COBERTURA-INDEMNIZACIÓN.</h2>
${d4Desc?`<h3 style="text-align:left">4.1 Cobertura</h3><p style="white-space:pre-wrap">${d4Desc.replace(/\n/g,'<br/>')}</p>`:''}
${partidas.length>0?`<div class="no-split">
<h3 style="text-align:left">4.2 Resumen por garantías. Propuesta de indemnización</h3>
<table class="data"><thead><tr><th>Garantía Afectada</th><th>D. con cobertura</th><th>Límite aseg.</th><th>Regla proporcional</th><th>Valor ajustado</th><th>Franquicia</th><th>Indemnización</th></tr></thead><tbody>
${dGarRows}
<tr class="subtotal"><td>Total</td><td style="text-align:right">${fmtPDF(totalDano)} €</td><td></td><td></td><td style="text-align:right">${fmtPDF(ajustado)} €</td><td style="text-align:right">${fmtPDF(fr)} €</td><td style="text-align:right">${fmtPDF(ind)} €</td></tr>
<tr><td colspan="6">Franquicia</td><td style="text-align:right">${fmtPDF(fr)} €</td></tr></tbody></table>
</div>`:''}
${d4Indemn?`<p style="white-space:pre-wrap;margin-top:8pt">${d4Indemn.replace(/\n/g,'<br/>')}</p>`:''}
<br/><br/>
<div class="no-split">
<p>Por nuestra parte damos por finalizada la intervención en el siniestro, quedando a su disposición ante cualquier aclaración que estimen oportuna.</p>
<p style="margin-top:12pt">En ${enc.municipio||enc.lugarIntervencion||'—'}, a ${today}</p>
<table class="firma-table"><tr>
<td style="width:50%"><p>VºBº técnico GVP</p><div class="firma-box"></div></td>
<td style="width:50%;text-align:right"><p>Perito: ${enc.perito||'—'}</p><p>Telef: ${enc.telPerito||'—'}</p><p>DNI: ${dniPerito||'—'}</p><p>Firma perito:</p><div class="firma-box"></div></td>
</tr></table>
</div>
${(facturasD.length||allFotos.length)?`
<div class="page-break"></div>
<div class="hdr"><span class="hdr-left">GABINETE DE VALORACIONES PERICIALES</span><span class="hdr-right">expediente ${enc.numReferencia||''}</span></div>
<h2 style="text-align:left">Anexos.</h2>
${facturasD.map((f,i)=>`${i>0?`<div class="page-break"></div>
<div class="hdr"><span class="hdr-left">GABINETE DE VALORACIONES PERICIALES</span><span class="hdr-right">expediente ${enc.numReferencia||''}</span></div>`:''}
<h3>${f.tipo} ${i+1}${f.name?': '+f.name:''}</h3>
${f.url?(esPdfItem(f)?`<iframe src="${f.url}" style="width:100%;height:230mm;border:none"></iframe>`:`<img src="${f.url}" style="width:100%;height:auto" onerror="this.style.display='none'"/>`):`<p>[Documento adjunto: ${f.name||''}]</p>`}`).join('')}
${allFotos.length?`${facturasD.length?`<div class="page-break"></div>
<div class="hdr"><span class="hdr-left">GABINETE DE VALORACIONES PERICIALES</span><span class="hdr-right">expediente ${enc.numReferencia||''}</span></div>`:''}
<h3>Reportaje fotográfico.</h3>
<div class="anex-foto">${allFotos.map((f,i)=>`<div class="anex-foto-item">${esPdfItem(f)?`<iframe src="${f.url}" style="width:100%;height:420pt;border:none;display:block"></iframe>`:`<img src="${f.url}" onerror="this.style.display='none'"/>`}<div class="num">Foto ${i+1}</div>${f.caption?`<div class="cap">${f.caption}</div>`:''}</div>`).join('')}</div>`:''}
`:''}
</body></html>`;

  // Impresión en un iframe oculto en vez de abrir una pestaña nueva con una URL
  // blob: — el diálogo de impresión aparece sobre la propia app (sin pestañas ni
  // ventanas adicionales que el perito tenga que cerrar) y arranca en cuanto las
  // imágenes están listas, sin esperar a que el navegador abra un proceso nuevo.
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  const waitImg = img => img.complete ? (img.decode?img.decode().catch(()=>{}):Promise.resolve()) : new Promise(res=>{ img.addEventListener('load',res); img.addEventListener('error',res); });
  const withTimeout = (p,ms) => Promise.race([p, new Promise(res=>setTimeout(res,ms))]);
  const imgs = Array.prototype.slice.call(doc.images);
  withTimeout(Promise.all(imgs.map(waitImg)), 8000).then(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  });
};


const ExportModal = ({cData, onClose, user, token, onSaveDni, onExported}) => {
  const [dni,setDni]         = useState(cData.encargo?.dniPerito||'');
  const [perito,setPerito]   = useState(cData.encargo?.perito||'');
  const [telPerito,setTel]   = useState(cData.encargo?.telPerito||'');
  const [pdfLoad,setPdfLoad] = useState(false);
  const [wrdLoad,setWrdLoad] = useState(false);
  const [pdfOk,setPdfOk]   = useState(false);
  const [wrdOk,setWrdOk]   = useState(false);
  const [err,setErr]       = useState('');

  const cDataWithPerito = () => ({...cData, encargo:{...cData.encargo, perito, telPerito, dniPerito:dni}});

  const handlePDF = () => {
    setErr('');
    try{ exportPDF(cDataWithPerito(), dni); setPdfOk(true); setTimeout(()=>setPdfOk(false),3000); onSaveDni?.(dni,perito,telPerito); onExported?.(); }
    catch(e){ setErr('Error al generar PDF. Activa las ventanas emergentes del navegador.'); console.error(e); }
  };
  const handleWord = async () => {
    setWrdLoad(true); setErr('');
    try{ await exportWord(cDataWithPerito()); setWrdOk(true); setTimeout(()=>setWrdOk(false),3000); onExported?.(); }
    catch(e){ setErr('Error al generar Word.'); console.error(e); }
    setWrdLoad(false);
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:C.white,borderRadius:12,padding:30,width:420,maxWidth:'calc(100vw - 32px)',boxShadow:'0 20px 60px rgba(0,0,0,.3)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:2,fontVariantNumeric:"tabular-nums"}}>{cData.encargo?.numReferencia||"Nuevo informe"}</div>
            <h3 style={{fontFamily:"'DM Sans',sans-serif",fontSize:20,fontWeight:600,color:C.ink}}>Exportar Informe</h3>
          </div>
          <button onClick={onClose} aria-label="Cerrar" style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:4}}><X size={18}/></button>
        </div>
        <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
          <div>
            <Lbl c="Nombre del Perito"/>
            <input value={perito} onChange={e=>setPerito(e.target.value)} placeholder="Nombre completo"
              style={{...inpStyle(false)}}/>
          </div>
          <div>
            <Lbl c="Teléfono"/>
            <input value={telPerito} onChange={e=>setTel(e.target.value)} placeholder="Ej: 93 118 51 38"
              style={{...inpStyle(false)}}/>
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <Lbl c="DNI del Perito (para la página de firma)"/>
          <input value={dni} onChange={e=>setDni(e.target.value)} placeholder="Ej: B13809660"
            style={{...inpStyle(false),marginBottom:4}}/>
          <div style={{fontSize:13,color:C.muted}}>Datos del perito para el documento exportado</div>
        </div>
        {err&&<div style={{background:C.redBg,border:'1px solid #FECACA',borderRadius:7,padding:'8px 12px',fontSize:14,color:C.red,marginBottom:14}}>{err}</div>}
        <div style={{display:'flex',gap:10}}>
          <button onClick={handlePDF} disabled={pdfLoad||wrdLoad}
            style={{flex:1,padding:'11px 0',borderRadius:8,border:'none',background:pdfLoad?'#E5E0D8':pdfOk?C.green:C.accent,color:'#fff',fontSize:15,fontWeight:700,cursor:pdfLoad||wrdLoad?'not-allowed':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:7,transition:'background .2s'}}>
            {pdfOk?<><Check size={15}/>Abierto en nueva pestaña</>:<><FileText size={15}/>Generar PDF</>}
          </button>
          <button onClick={handleWord} disabled={pdfLoad||wrdLoad}
            style={{flex:1,padding:'11px 0',borderRadius:8,border:`1.5px solid ${C.accent}`,background:wrdOk?C.green:'transparent',color:wrdOk?'#fff':C.accent,fontSize:15,fontWeight:700,cursor:pdfLoad||wrdLoad?'not-allowed':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:7,transition:'all .2s'}}>
            {wrdLoad?<><Loader2 size={15} style={{animation:'spin 1s linear infinite'}}/>Generando…</>:wrdOk?<><Check size={15}/>Word descargado</>:<><FileText size={15}/>Generar Word</>}
          </button>
        </div>
        <div style={{fontSize:13,color:C.muted,textAlign:'center',marginTop:12}}>
          PDF · fiel a la plantilla GVP &nbsp;·&nbsp; Word · editable en Microsoft Word
        </div>
      </div>
    </div>
  );
};

// Los 22 campos editables de la Sección 0 (para el contador de "extraídos").
const CAMPOS_ENCARGO = ["compania","numReferencia","numPoliza","ramo","garantia","productoContratado",
  "causa","numExpInterno","fechaEncargo","fechaSiniestro","asegurado","nifAsegurado","lugarIntervencion",
  "codigoPostal","municipio","provincia","capitalContinente","capitalContenido","franquicia","fechaEfecto",
  "tipoEncargo","modalidadVisita"];
// Los 4 marcados con asterisco en el formulario (obligatorios "de verdad" para el informe).
const CAMPOS_OBLIGATORIOS = ["compania","numReferencia","asegurado","lugarIntervencion"];

// ─── SECCIÓN DATOS DEL ENCARGO (editable dentro del informe) ────────────────
const SecEncargo = ({enc, onUpdate, onNext, onSave, scrollRef}) => {
  const [saved, setSaved] = useState(false);
  const s = f => v => onUpdate({...enc, [f]:v});
  const handleSave = () => { onSave?.(); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  const extraidos = CAMPOS_ENCARGO.filter(f=>enc[f]!=null&&enc[f]!=="").length;
  const faltanObl = CAMPOS_OBLIGATORIOS.filter(f=>!enc[f]).length;
  const eb = encargoBlockStates(enc);

  return (
    <div className="fade">
      <SecTitle n="0" label="Datos del Encargo" sub="Revisa y edita los datos extraídos"/>

      <ContextBar items={[
        {k:"Origen",v:enc.polizaAdjunta?"Encargo + póliza":"Solo encargo",mono:false},
        {k:"Extraídos",v:`${extraidos} / ${CAMPOS_ENCARGO.length} campos`},
        faltanObl>0&&{k:"Obligatorios (*) pendientes",v:String(faltanObl),warn:true},
      ]}/>

      <ZoneLabel zone="trabajo">Datos del perito</ZoneLabel>

      <Block title={<><Building2 size={12} style={{verticalAlign:"-2px",marginRight:5}}/>Compañía y Siniestro</>}
        done={eb[0]} summary={`${normCompania(enc.compania)||"Compañía sin definir"} · ${enc.numReferencia||"sin referencia"}`}>
        <div style={{marginBottom:14}}>
          <Lbl c="Compañía" req/>
          <select value={COMPANIAS.find(c=>enc.compania&&normCompania(enc.compania).toUpperCase().includes(c.toUpperCase()))||normCompania(enc.compania)||""}
            onChange={e=>s("compania")(e.target.value)}
            style={{...inpStyle(false),cursor:"pointer"}}>
            <option value="">Seleccionar…</option>
            {COMPANIAS.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Nº Referencia / Siniestro" value={enc.numReferencia} onChange={s("numReferencia")} required mono/>
          <Inp label="Nº Póliza" value={enc.numPoliza} onChange={s("numPoliza")}/>
        </div>
        <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Ramo" value={enc.ramo} onChange={s("ramo")}/>
          <Inp label="Garantía afectada" value={enc.garantia} onChange={s("garantia")}/>
        </div>
        <Inp label="Producto contratado" value={enc.productoContratado} onChange={s("productoContratado")} placeholder="Ej: Multirriesgo Empresa"/>
        <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Causa" value={enc.causa} onChange={s("causa")}/>
          <Inp label="Nº de Encargo" value={enc.numExpInterno} onChange={s("numExpInterno")}/>
        </div>
        <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Fecha Encargo" value={enc.fechaEncargo} onChange={s("fechaEncargo")} placeholder="dd/mm/aaaa"/>
          <Inp label="Fecha Siniestro" value={enc.fechaSiniestro} onChange={s("fechaSiniestro")} placeholder="dd/mm/aaaa"/>
        </div>
      </Block>

      <Block title={<><MapPin size={12} style={{verticalAlign:"-2px",marginRight:5}}/>Asegurado y Localización</>}
        done={eb[1]} summary={`${enc.asegurado||"Asegurado sin definir"} · ${enc.lugarIntervencion||"ubicación sin definir"}`}>
        <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Asegurado / Tomador" value={enc.asegurado} onChange={s("asegurado")} required/>
          <Inp label="NIF / CIF" value={enc.nifAsegurado} onChange={s("nifAsegurado")}/>
        </div>
        <Inp label="Lugar de intervención" value={enc.lugarIntervencion} onChange={s("lugarIntervencion")} required/>
        <div className="grid3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <Inp label="Código postal" value={enc.codigoPostal} onChange={s("codigoPostal")} placeholder="Ej: 17230"/>
          <Inp label="Municipio" value={enc.municipio} onChange={s("municipio")}/>
          <Inp label="Provincia" value={enc.provincia} onChange={s("provincia")}/>
        </div>
      </Block>

      <Block title={<><DollarSign size={12} style={{verticalAlign:"-2px",marginRight:5}}/>Capitales Asegurados</>}
        badge={enc.polizaAdjunta?"De la póliza":undefined}
        done={eb[2]} summary={`Continente ${fmtE(parseCap(enc.capitalContinente))} · Contenido ${fmtE(parseCap(enc.capitalContenido))}`}>
        <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <EuroInput label="Capital Continente" value={enc.capitalContinente} onChange={s("capitalContinente")}
              hint={enc.tipoContinentePoliza?"Tipo: "+enc.tipoContinentePoliza:enc.polizaAdjunta?"Extraído de la póliza":""}/>
            {enc.todosCapitalesContinente&&<div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:5,padding:"5px 9px",fontSize:12,color:C.blue,marginTop:-10,marginBottom:8}}>
              Capitales en póliza: {enc.todosCapitalesContinente}
            </div>}
          </div>
          <EuroInput label="Capital Contenido" value={enc.capitalContenido} onChange={s("capitalContenido")}
            hint={enc.polizaAdjunta?"Extraído de la póliza":""}/>
        </div>
        <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <EuroInput label="Franquicia" value={enc.franquicia} onChange={s("franquicia")} hint="0,00 € si no hay"/>
          <Inp label="Fecha efecto póliza" value={enc.fechaEfecto} onChange={s("fechaEfecto")} placeholder="dd/mm/aaaa"/>
        </div>
        <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <Lbl c="Tipo de encargo"/>
            <select value={enc.tipoEncargo||"PERITACION"} onChange={e=>s("tipoEncargo")(e.target.value)}
              style={{...inpStyle(false),cursor:"pointer"}}>
              <option value="PERITACION">Peritación</option>
              <option value="INSTANT_PAYMENT">Instant Payment</option>
            </select>
          </div>
          <div>
            <Lbl c="Modalidad de visita"/>
            <select value={enc.modalidadVisita||"PRESENCIAL"} onChange={e=>s("modalidadVisita")(e.target.value)}
              style={{...inpStyle(false),cursor:"pointer"}}>
              <option value="PRESENCIAL">Presencial</option>
              <option value="DOCUMENTAL">Documental</option>
            </select>
          </div>
        </div>
      </Block>

      <NavBottom onSave={handleSave} onNext={onNext} saved={saved} nextLabel="Siguiente — Verificación del Riesgo"/>
    </div>
  );
};

const ReportEditor = ({cData,onUpdate,onBack,user,token,sidebarOpen,setSidebarOpen,onFlushSave,saveState,onExported}) => {
  const [sec,setSec]         = useState("encargo");
  const [saving,setSaving]   = useState(false);
  const [exportOpen,setExportOpen]   = useState(false);
  const [pendingOpen,setPendingOpen] = useState(false);
  const [pendingBanner,setPendingBanner] = useState(false);
  const tokens = cData.tokenStats||{i:0,o:0};
  const costEur = ((tokens.i||0)/1e6*3+(tokens.o||0)/1e6*15)*1.08;
  const addTokens = (i,o) => onUpdate({...cData,tokenStats:{i:(tokens.i||0)+i,o:(tokens.o||0)+o}});
  const upd = (key,val) => onUpdate({...cData,[key]:val});
  // Sube una captura automática (Catastro/XEMA) y la añade a Anexos sin pasar por el editor de esa sección.
  const addAutoAnexo = async (tab,dataUrl,name,cat) => {
    const item = await uploadAutoAnexo(dataUrl,{name,tab,cat,token,userId:user?.id,informeId:cData._sbId||cData.id});
    onUpdate({...cData,anexos:{...(cData.anexos||{}),[tab]:[...((cData.anexos||{})[tab]||[]),item]}});
    return item;
  };

  const secIds = SECCIONES.map(s=>s.id);
  const curIdx = secIds.indexOf(sec);
  const goNext = () => { if(curIdx<secIds.length-1) setSec(secIds[curIdx+1]); };
  const goPrev = () => { if(curIdx>0) setSec(secIds[curIdx-1]); };

  // Al cambiar de sección (botones Anterior/Siguiente o menú lateral) se vuelve
  // al principio: si no, la nueva sección se abre a la altura de scroll anterior.
  const contentRef = useRef(null);
  useEffect(()=>{ contentRef.current?.scrollTo({top:0,behavior:"auto"}); },[sec]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if(onFlushSave) await onFlushSave();
    } finally {
      setSaving(false);
    }
  };

  const commonProps = {onNext:goNext,onPrev:goPrev,onSave:handleSave,onTokens:addTokens,scrollRef:contentRef};

  const renderSec = () => {
    switch(sec){
      case "informe": return <SecInforme enc={cData.encargo||{}} s1={cData.s1||{}} s2={cData.s2||{}} s3={cData.s3||{}} s4={cData.s4||{}} anexos={cData.anexos||{}} onGoTo={setSec}/>;
      case "encargo": return <SecEncargo enc={cData.encargo||{}} onUpdate={enc=>onUpdate({...cData,encargo:enc})} onNext={()=>setSec("s1")} onSave={handleSave} scrollRef={contentRef}/>;
      case "s1": return <Sec1 data={cData.s1||{}} onChange={v=>upd("s1",v)} enc={cData.encargo||{}} onAutoAnexo={addAutoAnexo} {...commonProps}/>;
      case "s2": return <Sec2 data={cData.s2||{}} onChange={v=>upd("s2",v)} enc={cData.encargo||{}} onAutoAnexo={addAutoAnexo} {...commonProps}/>;
      case "s3": return <Sec3 data={cData.s3||{}} onChange={v=>upd("s3",v)} enc={cData.encargo||{}} s1={cData.s1||{}} {...commonProps}/>;
      case "s4": return <Sec4 data={cData.s4||{}} onChange={v=>upd("s4",v)} enc={cData.encargo||{}} s1={cData.s1||{}} s3={cData.s3||{}} {...commonProps}/>;
      case "anexos": return <SecAnexos data={cData.anexos||{}} onChange={v=>upd("anexos",v)} s3={cData.s3||{}} onPrev={goPrev} onNext={goNext} onSave={handleSave} token={token} userId={user?.id} informeId={cData._sbId||cData.id} scrollRef={contentRef}/>;
      default: return null;
    }
  };

  // Semáforo por pantalla para la franja de accesos rápidos de la topbar:
  // verde = todos los bloques completos, rojo = ninguno relleno (o algún bloque
  // en estado "error", cuando exista esa validación), naranja = mezcla.
  // Reutiliza las mismas funciones de estado que alimentan el prop `done` de
  // cada <Block>, para que topbar y bloques nunca puedan contar cosas distintas.
  const secSemaforo = id => {
    if(id==="encargo") return semaforoFromStates(encargoBlockStates(cData.encargo||{}));
    if(id==="s1") return semaforoFromStates(s1BlockStates(cData.s1||{},cData.encargo||{}));
    if(id==="s2") return semaforoFromStates(s2BlockStates(cData.s2||{},cData.encargo||{}));
    if(id==="s3") return semaforoFromStates(s3BlockStates(cData.s3||{}));
    if(id==="s4") return semaforoFromStates(s4BlockStates(cData.s4||{}));
    if(id==="anexos") return semaforoFromStates(anexosBlockStates(cData.anexos,cData.s3));
    if(id==="informe"){
      // Informe no tiene campos propios (es la vista previa): resume el estado de las otras 6.
      const otros = ["encargo","s1","s2","s3","s4","anexos"].map(secSemaforo);
      if(otros.every(x=>x==="green")) return "green";
      if(otros.every(x=>x==="red")) return "red";
      return "orange";
    }
    return "orange";
  };
  const SEM_COLORS = {green:[C.greenBg,C.green],orange:[C.orangeBg,C.orange],red:[C.redBg,C.red]};

  // Lista de bloques pendientes para la revisión antes de exportar — mismos
  // nombres de bloque que ven las 5 pantallas con formulario (Encargo + Sec1-4);
  // Anexos e Informe se quedan fuera porque no usan el acordeón. Reutiliza otra
  // vez las mismas funciones xBlockStates, así que nunca puede desalinearse de
  // lo que muestra cada <Block> o el semáforo de arriba.
  const BLOCK_LABELS = {
    encargo: ["Compañía y Siniestro","Asegurado y Localización","Capitales Asegurados"],
    s1: ["Datos del Riesgo Asegurado","Superficie y Arquitectura","Capitales Asegurados"],
    s3: ["Descripción de los Daños","Cómo se valora"],
    s4: ["Texto de Valoración","Descripción de la Cobertura"],
  };
  const s2Labels = esSiniestroAtmosferico(cData.encargo||{})
    ? ["Descripción del Siniestro","Verificación Meteorológica"]
    : ["Descripción del Siniestro"];
  const SECTION_TITLES = {encargo:"Datos del Encargo",s1:"Verificación del Riesgo",s2:"Causas y Circunstancias",s3:"Valoración de Daños",s4:"Cobertura-Indemnización"};
  const pendingList = [];
  [
    ["encargo",encargoBlockStates(cData.encargo||{}),BLOCK_LABELS.encargo],
    ["s1",s1BlockStates(cData.s1||{},cData.encargo||{}),BLOCK_LABELS.s1],
    ["s2",s2BlockStates(cData.s2||{},cData.encargo||{}),s2Labels],
    ["s3",s3BlockStates(cData.s3||{}),BLOCK_LABELS.s3],
    ["s4",s4BlockStates(cData.s4||{}),BLOCK_LABELS.s4],
  ].forEach(([id,states,labels])=>{
    states.forEach((st,i)=>{ if(st!==true) pendingList.push({secId:id,secTitle:SECTION_TITLES[id],label:labels[i]}); });
  });
  const goToPending = secId => { setSec(secId); setPendingOpen(false); };
  const handleExportClick = () => {
    if(pendingList.length>0){ setPendingBanner(true); setPendingOpen(true); }
    else setExportOpen(true);
  };

  return (
    <div className="editor-shell" style={{display:"flex",flexDirection:"column"}}>
      {/* TOP BAR */}
      <div className="editor-topbar" style={{background:C.sidebar,height:50,display:"flex",alignItems:"center",padding:"0 16px",gap:12,flexShrink:0}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:6,padding:"5px 10px",cursor:"pointer",color:"rgba(255,255,255,.7)",fontSize:14,fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>
          <Home size={12}/>Inicio
        </button>
        <button onClick={()=>setSidebarOpen(v=>!v)} title={sidebarOpen?"Ocultar menú":"Mostrar menú"} aria-label={sidebarOpen?"Ocultar menú":"Mostrar menú"}
          style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer",color:"rgba(255,255,255,.7)",fontSize:14,fontFamily:"inherit",display:"flex",alignItems:"center",gap:3}}>
          {sidebarOpen?<ChevronLeft size={13}/>:<ChevronRight size={13}/>}
        </button>
        <div style={{width:1,height:22,background:"rgba(255,255,255,.1)"}}/>
        <div style={{flex:1,minWidth:0,textAlign:"right"}}>
          <div style={{color:"#fff",fontWeight:600,fontSize:15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontVariantNumeric:"tabular-nums"}}>{cData.encargo?.numReferencia||"Nuevo informe"}</div>
          <div style={{color:"rgba(255,255,255,.4)",fontSize:12}}>{normCompania(cData.encargo?.compania)||""}</div>
        </div>
        <div className="editor-actions" style={{display:"flex",gap:12,alignItems:"center",flexShrink:0}}>
          {saveState==="saving" && <div style={{color:"rgba(255,255,255,.6)",fontSize:13,display:"flex",alignItems:"center",gap:5}}><Spin/>Guardando…</div>}
          {saveState==="saved" && <div style={{color:C.green,fontSize:13,display:"flex",alignItems:"center",gap:5}}><Check size={12}/>Guardado</div>}
          {saveState==="error" && <div title="No se pudo guardar en la nube. Revisa tu conexión; reintentará en el próximo cambio." style={{color:"#f7b267",fontSize:13,display:"flex",alignItems:"center",gap:5,cursor:"help"}}><AlertTriangle size={12}/>Sin guardar</div>}
          <div style={{textAlign:"right"}}>
            <div style={{color:"rgba(255,255,255,.35)",fontSize:11,textTransform:"uppercase",letterSpacing:".06em"}}>Consumo API</div>
            <div style={{color:"rgba(255,255,255,.75)",fontSize:13,fontWeight:600}}>{((tokens.i||0)+(tokens.o||0)).toLocaleString("es-ES")} tokens · {costEur.toFixed(4)} €</div>
          </div>
          <button onClick={()=>{setPendingBanner(false);setPendingOpen(true);}}
            style={{border:"none",borderRadius:7,padding:"6px 12px",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit",
              display:"flex",alignItems:"center",gap:6,
              background:pendingList.length===0?"rgba(15,123,77,.3)":"rgba(180,83,9,.3)",
              color:pendingList.length===0?"#6EE7B7":"#FDBA74"}}>
            {pendingList.length===0?<Check size={12}/>:<AlertTriangle size={12}/>}
            {pendingList.length===0?"Todo listo":"Pendientes"}
            {pendingList.length>0&&<span style={{background:"rgba(0,0,0,.22)",borderRadius:20,padding:"1px 7px",fontVariantNumeric:"tabular-nums",fontSize:11.5}}>{pendingList.length}</span>}
          </button>
          <button onClick={handleExportClick}
            style={{background:"rgba(155,34,38,.8)",border:"none",borderRadius:7,padding:"6px 14px",cursor:"pointer",color:"#fff",fontSize:14,fontWeight:700,fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
            <FileText size={13}/>Exportar
          </button>
        </div>
      </div>

      {/* ACCESOS RÁPIDOS — franja fija bajo la topbar, con semáforo por pantalla.
          Convive con el menú lateral (no lo sustituye): la pantalla activa se ve
          en granate por encima del color de estado, para que no haya duda de
          dónde estás. */}
      <div style={{background:"#1C222B",borderTop:"1px solid rgba(255,255,255,.06)",display:"flex",gap:6,
        padding:"7px 16px",overflowX:"auto",flexShrink:0}}>
        {SECCIONES.map(item=>{
          const isActive = sec===item.id;
          const [bg,fg] = SEM_COLORS[secSemaforo(item.id)];
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={()=>setSec(item.id)} style={{display:"flex",alignItems:"center",gap:6,
              padding:"5px 12px 5px 8px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12.5,fontWeight:600,
              whiteSpace:"nowrap",fontFamily:"inherit",flexShrink:0,
              background:isActive?C.accent:bg,color:isActive?"#fff":fg}}>
              <span style={{width:20,height:20,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",
                background:isActive?"rgba(255,255,255,.22)":"rgba(0,0,0,.07)",flexShrink:0}}>
                <Icon size={11}/>
              </span>
              {item.label}
            </button>
          );
        })}
      </div>

      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        {/* SIDEBAR */}
        {sidebarOpen&&<div className="sidebar-backdrop" onClick={()=>setSidebarOpen(false)}/>}
        <div className={sidebarOpen?"app-sidebar sb-open":"app-sidebar"} style={{width:sidebarOpen?216:0,background:C.sidebar,display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto",paddingTop:sidebarOpen?6:0,overflow:"hidden",transition:"width .2s ease"}}>
          {sidebarOpen&&<>
          <div className="sidebar-close" style={{justifyContent:"flex-end",padding:"0 10px 6px"}}>
            <button onClick={()=>setSidebarOpen(false)} aria-label="Cerrar menú"
              style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:6,padding:5,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <X size={14}/>
            </button>
          </div>
          {SECCIONES.map((item,idx)=>{
            const isActive=sec===item.id;
            const isDone=(()=>{
              if(item.id==="s1") return !!(cData.s1?.superficieConstruida||cData.s1?.textoInstant);
              if(item.id==="s2") return !!(cData.s2?.textoAI||cData.s2?.textoRaw||cData.s2?.meteo);
              if(item.id==="s3") return !!(cData.s3?.partidas?.length>0||cData.s3?.pLibres?.length>0);
              if(item.id==="s4") return !!(cData.s4?.textoIntro||cData.s4?.descripcionCobertura||cData.s4?.textoIndemn||cData.s3?.partidas?.length>0);
              if(item.id==="anexos"){
                const a=cData.anexos||{};
                return !!(a.fotos?.length||a.catastro?.length||a.meteosim?.length||a.facturas?.length||(cData.s3?.facturas?.length));
              }
              return false;
            })();
            return (
              <div key={item.id} onClick={()=>setSec(item.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 13px",cursor:"pointer",
                borderLeft:`3px solid ${isActive?C.accent:"transparent"}`,background:isActive?"rgba(155,34,38,.2)":"transparent",marginBottom:1}}>
                <div style={{width:26,height:26,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                  background:isActive?C.accent:isDone?"rgba(15,123,77,.3)":"rgba(255,255,255,.08)"}}>
                  {isDone&&!isActive
                    ?<Check size={12} style={{color:"#6EE7B7"}}/>
                    :<span style={{fontWeight:600,fontVariantNumeric:"tabular-nums",fontSize:13,color:isActive?"#fff":"rgba(255,255,255,.45)"}}>{String(idx).padStart(2,"0")}</span>}
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:isActive?600:400,color:isActive?"#fff":"rgba(255,255,255,.55)",lineHeight:1.3}}>{item.label}</div>
                  <div style={{fontSize:11.5,color:"rgba(255,255,255,.32)",marginTop:1,textTransform:"uppercase",letterSpacing:".04em"}}>{item.sub}</div>
                </div>
              </div>
            );
          })}
          <div style={{height:12}}/>
          </>}
        </div>

        {/* CONTENT — single column, max width for readability.
            Único elemento con scroll: la barra lateral y la cabecera quedan fijas. */}
        <div ref={contentRef} style={{flex:1,minWidth:0,overflowY:"auto",background:C.bg,display:"flex",justifyContent:"center",alignItems:"flex-start"}}>
          <div style={{width:"100%",maxWidth:1180,padding:"28px 28px 48px"}}>
            {renderSec()}
          </div>
        </div>
      </div>

      {/* REVISIÓN ANTES DE EXPORTAR — panel lateral con los bloques pendientes de
          las 5 pantallas con formulario. Es un aviso, no un bloqueo: el perito
          puede exportar igualmente si decide que quiere mandar un borrador. */}
      {pendingOpen&&<div onClick={()=>setPendingOpen(false)} style={{position:"fixed",inset:0,background:"rgba(15,18,23,.42)",zIndex:120}}/>}
      <div style={{position:"fixed",top:0,right:0,height:"100%",width:380,maxWidth:"88vw",background:C.bg,
        boxShadow:"-8px 0 32px rgba(0,0,0,.22)",transform:pendingOpen?"translateX(0)":"translateX(100%)",
        transition:"transform .22s ease",zIndex:121,display:"flex",flexDirection:"column"}}>
        <div style={{background:C.sidebar,color:"#fff",padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <h3 style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:17,margin:0}}>Revisión antes de exportar</h3>
            <div style={{fontSize:12,color:"rgba(255,255,255,.5)",marginTop:2,fontVariantNumeric:"tabular-nums"}}>{cData.encargo?.numReferencia||"Nuevo informe"} · {normCompania(cData.encargo?.compania)||""}</div>
          </div>
          <button onClick={()=>setPendingOpen(false)} aria-label="Cerrar" style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:6,width:26,height:26,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <X size={14}/>
          </button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
          {pendingList.length===0
            ? <div style={{textAlign:"center",padding:"50px 20px"}}>
                <div style={{width:52,height:52,borderRadius:"50%",background:C.greenBg,color:C.green,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
                  <Check size={24}/>
                </div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:18,color:C.ink,marginBottom:6}}>Todo completo</div>
                <div style={{fontSize:13.5,color:C.muted}}>Los 5 apartados con formulario están rellenados. Listo para exportar.</div>
              </div>
            : <>
                {pendingBanner&&<div style={{background:C.orangeBg,border:"1px solid #FDE68A",borderRadius:8,padding:"10px 12px",fontSize:13,color:C.orange,marginBottom:14,display:"flex",gap:8,alignItems:"flex-start"}}>
                  <AlertTriangle size={14} style={{flexShrink:0,marginTop:1}}/>
                  <span>Antes de exportar, revisa estos {pendingList.length} apartados.</span>
                </div>}
                <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>{pendingList.length} apartados pendientes</div>
                {pendingList.map((it,i)=>(
                  <div key={it.secId+i} onClick={()=>goToPending(it.secId)} style={{display:"flex",alignItems:"flex-start",gap:10,
                    background:C.white,border:`1px solid ${C.border}`,borderRadius:9,padding:"11px 13px",marginBottom:7,cursor:"pointer"}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:C.orange,marginTop:5,flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13.5,fontWeight:600,color:C.ink}}>{it.secTitle} — {it.label}</div>
                    </div>
                    <ChevronRight size={14} style={{color:C.muted,flexShrink:0,marginTop:3}}/>
                  </div>
                ))}
              </>}
        </div>
        {pendingBanner&&pendingList.length>0&&<div style={{borderTop:`1px solid ${C.border}`,padding:"14px 18px",flexShrink:0}}>
          <button onClick={()=>{setPendingOpen(false);setExportOpen(true);}}
            style={{width:"100%",background:"none",border:"none",color:C.muted,fontSize:12.5,fontFamily:"inherit",cursor:"pointer",textDecoration:"underline"}}>
            Exportar igualmente, sin revisar
          </button>
        </div>}
      </div>

      {exportOpen&&<ExportModal cData={cData} onClose={()=>setExportOpen(false)} user={user} token={token} onSaveDni={async (dni,perito,telPerito)=>{ if(token&&user?.id) await sbDb(`perfiles?id=eq.${user.id}`,"PATCH",{dni},token); onUpdate({...cData,encargo:{...cData.encargo,perito,telPerito,dniPerito:dni}}); }} onExported={onExported}/>}
      <link rel="stylesheet" href={FONT}/>
      <style>{css}</style>
    </div>
  );
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────
// Aviso permanente de que la app NO está sobre la base de datos real. Es lo que
// evita el fallo caro: confundir un informe de pruebas con uno de un cliente.
// No se renderiza nada en producción.
const TestBadge = () => ES_TEST ? (
  <div style={{
    position:"fixed", left:12, bottom:12, zIndex:10000,
    display:"flex", alignItems:"center", gap:8,
    padding:"8px 14px", borderRadius:999,
    background:C.orangeBg, border:`1.5px solid ${C.orange}`,
    color:C.orange, fontSize:13, fontWeight:700, letterSpacing:.3,
    boxShadow:"0 4px 14px rgba(0,0,0,.14)", pointerEvents:"none"
  }}>
    <FlaskConical size={15}/> ENTORNO DE PRUEBAS
  </div>
) : null;

export default function App(){
  const [user,setUser]   = useState(null);
  const [token,setToken] = useState(null);
  const [view,setView]   = useState("dashboard");
  const [cases,setCases] = useState([]);
  const [active,setActive] = useState(null);
  const [sbLoading,setSbLoading]   = useState(false);
  const [sidebarOpen,setSidebarOpen] = useState(true);
  useEffect(()=>{ if(window.innerWidth<1024) setSidebarOpen(false); },[]);
  const [saveState,setSaveState]   = useState("idle"); // idle | saving | saved | error
  const sbSaveTimer = useRef(null);
  const dirtyRef = useRef(false); // true = hay cambios pendientes de guardar en Supabase

  // Aviso del navegador si se cierra la pestaña con cambios sin guardar
  // (ventana del debounce o guardado fallido).
  useEffect(()=>{
    const h = e => { if(dirtyRef.current){ e.preventDefault(); e.returnValue=""; } };
    window.addEventListener("beforeunload",h);
    return ()=>window.removeEventListener("beforeunload",h);
  },[]);

  // Cargar informes del usuario desde Supabase
  const loadCases = async (tk) => {
    setSbLoading(true);
    const rows = await sbDb('informes?select=*&order=created_at.desc', 'GET', null, tk);
    if(rows) setCases(rows.map(r=>({id:r.id,_sbId:r.id,encargo:r.encargo||{},s1:r.s1||{},s2:r.s2||{},s3:r.s3||{},s4:r.s4||{},anexos:r.anexos||{},tokenStats:{i:0,o:0},estado:r.estado,updatedAt:r.updated_at||null})));
    setSbLoading(false);
  };

  const handleAuth = (u, tk) => { setUser(u); setToken(tk); loadCases(tk); };
  const handleSignOut = () => { setUser(null); setToken(null); setCases([]); setActive(null); setView('dashboard'); };

  const handleDone = async enc => {
    // Always open editor immediately with extracted data
    const localCase = {id:'local_'+Date.now(),encargo:enc,s1:{},s2:{},s3:{},s4:{},anexos:{},tokenStats:{i:0,o:0},estado:'borrador'};
    setActive(localCase); setView("editor");
    // Then try to save to Supabase in background
    if(token && user?.id) {
      const newRow = {user_id:user.id, num_referencia:enc.numReferencia||'', compania:enc.compania||'', asegurado:enc.asegurado||'', estado:'borrador', encargo:enc, s1:{}, s2:{}, s3:{}, s4:{}, anexos:{}};
      const saved = await sbDb('informes', 'POST', newRow, token);
      const row = Array.isArray(saved)?saved[0]:saved;
      if(row) {
        const savedCase = {...localCase, id:row.id, _sbId:row.id};
        setCases(p=>[savedCase,...p.filter(x=>x.id!==localCase.id)]);
        setActive(savedCase);
      } else {
        setCases(p=>[localCase,...p]);
      }
    }
  };

  const openCase  = c => { setActive(c); setView("editor"); };

  // Guarda en Supabase y confirma el resultado. Reintenta una vez ante un
  // fallo transitorio (red/servidor). Devuelve true si se guardó de verdad.
  const saveToSb = async (u) => {
    if(!u._sbId||!token) return false;
    const payload = {
      encargo:u.encargo||{}, s1:u.s1||{}, s2:u.s2||{}, s3:u.s3||{}, s4:u.s4||{},
      anexos:u.anexos||{}, estado:u.estado||'borrador',
      num_referencia:u.encargo?.numReferencia||'',
      compania:u.encargo?.compania||'', asegurado:u.encargo?.asegurado||''
    };
    setSaveState("saving");
    let res = await sbDb(`informes?id=eq.${u._sbId}`, 'PATCH', payload, token);
    if(!res){
      await new Promise(r=>setTimeout(r,2000));
      res = await sbDb(`informes?id=eq.${u._sbId}`, 'PATCH', payload, token);
    }
    const ok = !!res;
    if(ok) dirtyRef.current = false;
    setSaveState(ok?"saved":"error");
    if(ok) setTimeout(()=>setSaveState(s=>s==="saved"?"idle":s),2500);
    return ok;
  };

  const updateCase = u => {
    setActive(u); setCases(p=>p.map(c=>c.id===u.id?u:c));
    if(u._sbId&&token){
      dirtyRef.current = true;
      clearTimeout(sbSaveTimer.current);
      sbSaveTimer.current = setTimeout(() => saveToSb(u), 5000);
    }
  };

  // Guardado inmediato (botón "Guardar cambios"): cancela el debounce y
  // persiste ya, devolviendo el resultado real para reflejarlo en la UI.
  const flushSave = () => {
    clearTimeout(sbSaveTimer.current);
    return saveToSb(active);
  };

  // Marca el expediente como exportado (PDF o Word, cualquiera de las dos)
  // reutilizando el mismo mecanismo de guardado que el autosave (saveToSb
  // sobre informes.estado). Un fallo de red no interrumpe la exportación:
  // el documento ya se generó en el cliente antes de llamar a esta función;
  // aquí solo queda reflejado en saveState ("error"), igual que el autosave.
  const markExported = async () => {
    if(!active) return;
    const updated = {...active, estado:'exportado'};
    setActive(updated);
    setCases(p=>p.map(c=>c.id===updated.id?updated:c));
    if(updated._sbId&&token){
      clearTimeout(sbSaveTimer.current);
      dirtyRef.current = true;
      await saveToSb(updated);
    }
  };

  const deleteCase = async id => {
    const cas = cases.find(c=>c.id===id);
    if(cas?._sbId&&token) await sbDb(`informes?id=eq.${cas._sbId}`,'DELETE',null,token);
    setCases(p=>p.filter(c=>c.id!==id));
    if(active?.id===id){ setActive(null); setView('dashboard'); }
  };

  if(!user) return <><LoginScreen onAuth={handleAuth}/><TestBadge/><link rel="stylesheet" href={FONT}/><style>{css}</style></>;
  if(view==="upload") return <><UploadEncargo onDone={handleDone} onCancel={()=>setView("dashboard")} onTokens={()=>{}}/><TestBadge/><link rel="stylesheet" href={FONT}/><style>{css}</style></>;
  if(view==="editor"&&active) return <><ReportEditor cData={active} onUpdate={updateCase} onBack={()=>setView("dashboard")} user={user} token={token} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onFlushSave={flushSave} saveState={saveState} onExported={markExported}/><TestBadge/></>;
  return <>
    <Dashboard cases={cases} onNew={()=>setView("upload")} onOpen={openCase} onDelete={deleteCase} user={user} onSignOut={handleSignOut} loading={sbLoading} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
    <TestBadge/>
    <link rel="stylesheet" href={FONT}/>
    <style>{css}</style>
  </>;
}

import { useState, useRef, useEffect } from "react";
import {
  FileText, MapPin, AlertTriangle, List, FileCheck, DollarSign,
  Camera, Upload, Mic, MicOff, Loader2, Check, ChevronRight, ChevronLeft,
  Plus, X, Search, Home, Sparkles, Shield, Building2, Image,
  FileImage, Receipt, Save, Eye, RefreshCw, Edit3, Trash2,
} from "lucide-react";

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  bg:"#F7F5F2", white:"#FFFFFF", sidebar:"#181C23",
  accent:"#9B2226", accentLight:"#FDF0F0", accentMid:"#C1494E",
  ink:"#1A2332", muted:"#6B7480", border:"#E8E4DE",
  green:"#0F7B4D", greenBg:"#EDFAF3",
  orange:"#B45309", orangeBg:"#FFFBEB",
  red:"#C0392B", redBg:"#FEF2F2",
  blue:"#1D4ED8", blueBg:"#EFF6FF",
  tag:"#F0EDE8",
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const BAREMO = [
  {g:"Pintura",      cod:"PIN-01",desc:"Pintado paramentos verticales",      u:"m²", p:8.50},
  {g:"Pintura",      cod:"PIN-02",desc:"Pintado de techos",                   u:"m²", p:10.20},
  {g:"Pintura",      cod:"PIN-03",desc:"Papel pintado — colocación",          u:"m²", p:15.80},
  {g:"Albañilería",  cod:"ALB-01",desc:"Tabique ladrillo hueco sencillo",     u:"m²", p:38.50},
  {g:"Albañilería",  cod:"ALB-02",desc:"Guarnecido y enlucido de yeso",       u:"m²", p:12.40},
  {g:"Albañilería",  cod:"ALB-03",desc:"Solado baldosa cerámica",             u:"m²", p:32.00},
  {g:"Albañilería",  cod:"ALB-04",desc:"Alicatado azulejo",                   u:"m²", p:35.00},
  {g:"Albañilería",  cod:"ALB-05",desc:"Falso techo de escayola",             u:"m²", p:28.00},
  {g:"Fontanería",   cod:"FON-01",desc:"Localización y reparación de fuga",   u:"ud", p:185.00},
  {g:"Fontanería",   cod:"FON-02",desc:"Sustitución tubería cobre (ml)",      u:"ml", p:22.50},
  {g:"Fontanería",   cod:"FON-03",desc:"Grifo monomando — sustitución",       u:"ud", p:95.00},
  {g:"Electricidad", cod:"ELE-01",desc:"Punto de luz completo",               u:"ud", p:65.00},
  {g:"Electricidad", cod:"ELE-02",desc:"Toma de corriente doble",             u:"ud", p:55.00},
  {g:"Electricidad", cod:"ELE-03",desc:"Cuadro eléctrico — sustitución",      u:"ud", p:380.00},
  {g:"Carpintería",  cod:"CAR-01",desc:"Puerta de paso interior",             u:"ud", p:285.00},
  {g:"Carpintería",  cod:"CAR-02",desc:"Ventana aluminio RPT 100×120cm",      u:"ud", p:320.00},
  {g:"Cristalería",  cod:"CRI-01",desc:"Vidrio simple hasta 1m²",             u:"ud", p:55.00},
  {g:"Cristalería",  cod:"CRI-02",desc:"Doble acristalamiento 100×120cm",     u:"ud", p:145.00},
  {g:"Loza",         cod:"LOZ-01",desc:"Inodoro — sustitución completa",      u:"ud", p:320.00},
  {g:"Loza",         cod:"LOZ-02",desc:"Lavabo — sustitución completa",       u:"ud", p:185.00},
  {g:"Otros",        cod:"OTR-01",desc:"Cuadro / obra de arte — reposición",  u:"ud", p:150.00},
  {g:"Otros",        cod:"OTR-02",desc:"Persiana enrollable — sustitución",   u:"ud", p:165.00},
];

// Tablas módulos arquitectura 2025 — [Básica, Media, Alta] €/m²
const TABLAS_ARQ = {
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
const getModuloArq = (provCode, key, calidad) => {
  const tbl = TABLAS_ARQ[provCode] || TABLAS_ARQ["00"];
  const ci = calidad==="Alta"?2:calidad==="Básica"?0:1;
  return tbl[key]?.[ci] || 0;
};
const getFactorArq = key => {
  if(!key) return 1.486;
  if(key.startsWith("unif_")||key.startsWith("pluri_")) return 1.486;
  if(key.startsWith("urb_")) return 1.366;
  return 1.618;
};
const calcVPreexCont = (m2, provCode, arqKey, calidad) =>
  parseFloat(m2||0) * getModuloArq(provCode, arqKey, calidad) * getFactorArq(arqKey);

const PROVINCIAS = [
  {v:"07",l:"Baleares"},{v:"08",l:"Barcelona"},{v:"17",l:"Girona"},
  {v:"25",l:"Lleida"},{v:"28",l:"Madrid"},{v:"29",l:"Málaga"},{v:"33",l:"Asturias"},
  {v:"35",l:"Las Palmas"},{v:"38",l:"S.C.Tenerife"},{v:"41",l:"Sevilla"},
  {v:"43",l:"Tarragona"},{v:"46",l:"Valencia"},{v:"00",l:"Otras"},
];
const COMPANIAS = ["AXA","Mapfre","Allianz","Generali","Zurich","Helvetia","Mutua Madrileña","Caser","Reale","Santalucía","Pelayo","BBVA Seguros","Catalana Occidente","Línea Directa"];
const TIPOS_USO = ["Hotel / Apart-hotel","Hostal / Pensión","Local comercial","Oficinas","Vivienda unifamiliar","Piso / Apartamento","Comunidad de propietarios","Industria / Nave","Restaurante / Bar","Otro"];
const TIPOS_GARANTIA = ["Continente","Contenido","Terceros implicados"];

const SECCIONES = [
  {id:"informe", label:"Informe",                    icon:FileText},
  {id:"encargo", label:"Datos del Encargo",           icon:FileCheck},
  {id:"s1",      label:"1. Verificación del Riesgo",  icon:MapPin},
  {id:"s2",      label:"2. Causas y Circunstancias",  icon:AlertTriangle},
  {id:"s3",      label:"3. Valoración de Daños",      icon:List},
  {id:"s4",      label:"4. Cobertura-Indemnización",  icon:FileCheck},
  {id:"anexos",  label:"Anexos",                      icon:Camera},
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmt  = n => new Intl.NumberFormat("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2}).format(+n||0);
const fmtE = n => `${fmt(n)} €`;

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

// Normaliza valores monetarios extraídos por IA (6.000,00 → 6000 | 6000.00 → 6000)
const parseCap = v => {
  if(!v && v!==0) return 0;
  const s = String(v).trim();
  // Spanish format: 6.000,00
  if(/^[\d.]+,\d{1,2}$/.test(s)) return parseFloat(s.replace(/\./g,"").replace(",","."));
  // Remove all non-numeric except dot/comma, then parse
  const clean = s.replace(/[^0-9.,]/g,"").replace(",",".");
  return parseFloat(clean)||0;
};


// ─── SUPABASE CLIENT ─────────────────────────────────────────────────────────
const SB_URL  = "https://yrulaaxdusvmzohugmnc.supabase.co";
const SB_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlydWxhYXhkdXN2bXpvaHVnbW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NzQyMTUsImV4cCI6MjA5NjE1MDIxNX0.TOS0mgr0TdHxlC_kMhqOya_WNWyt2KTEn356USWKQFw";

const sbAuth = async (path, body) => {
  const r = await fetch(`${SB_URL}/auth/v1/${path}`, {
    method:'POST', headers:{'Content-Type':'application/json','apikey':SB_KEY},
    body: JSON.stringify(body)
  });
  return r.json();
};

const sbDb = async (path, method='GET', body=null, token='') => {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method, headers:{
      'Content-Type':'application/json', 'apikey':SB_KEY,
      'Authorization':`Bearer ${token||SB_KEY}`,
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
const calcPartida = p => {
  const vRepos = (p.uds||1)*(p.p||0);
  const ivaAmt = vRepos*((p.iva??0)/100);
  const vReal  = vRepos*(1-(p.depr?(p.pctDepr||0):0)/100)+ivaAmt;
  return {vRepos, ivaAmt, vReal};
};
// Partidas activas según modo, excluyendo las sin cobertura
const getPartidas = s3 => {
  const rows = (s3?.modoValoracion==="factura") ? (s3?.pLibres||[]) : (s3?.partidas||[]);
  return rows.filter(p=>p.cobertura!==false);
};
const sumRepos = rows => rows.reduce((a,p)=>a+(p.uds||1)*(p.p||0),0);
const sumIVA   = rows => rows.reduce((a,p)=>a+calcPartida(p).ivaAmt,0);
const sumReal  = rows => rows.reduce((a,p)=>a+calcPartida(p).vReal,0);
// Regla proporcional: 1 si primer riesgo u obras de reforma; si no, infraseguro
const calcRegla = (enc, s1) => {
  if(enc?.primerRiesgo || s1?.tipoContinente==="obrasReforma" || enc?.esHogar) return 1;
  const capCont = parseCap(enc?.capitalContinente);
  const prov = PROVINCIAS.find(p=>p.l===enc?.provincia||p.v===enc?.provincia);
  const arqKey = s1?.tipoArqKey || "unif_aislada";
  const vReal = calcVPreexCont(s1?.superficieConstruida, prov?.v||"00", arqKey, s1?.calidad||"Media");
  return vReal>0&&capCont>0&&capCont<vReal ? (capCont/vReal) : 1;
};

const parseJSON = txt => {
  const patterns = [/```json\s*([\s\S]*?)```/,/```([\s\S]*?)```/,/([\s\S]*)/];
  for(const p of patterns){
    const m=txt.match(p);
    if(m){try{return JSON.parse(m[1]||m[0]);}catch{}}
  }
  return {};
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

// ─── CSS ──────────────────────────────────────────────────────────────────────
const FONT = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap";
const css = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:${C.bg};color:${C.ink};font-size:14px}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .fade{animation:fadeIn .2s ease}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#ccc;border-radius:2px}
  input,select,textarea{font-family:inherit;color:${C.ink}}
  input[type=number]::-webkit-inner-spin-button{opacity:.6}
`;

// ─── BASE UI ─────────────────────────────────────────────────────────────────
const Spin = () => <Loader2 size={14} style={{animation:"spin 1s linear infinite",color:C.accent}}/>;
const Lbl  = ({c,req}) => <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:5,letterSpacing:"0.05em",textTransform:"uppercase"}}>{c}{req&&<span style={{color:C.accent}}> *</span>}</div>;

const inpStyle = (dis) => ({
  width:"100%",padding:"9px 12px",border:`1px solid ${C.border}`,borderRadius:7,
  fontSize:14,background:dis?C.bg:C.white,outline:"none",fontFamily:"inherit",
  transition:"border-color .15s",
});

const Inp = ({label,value,onChange,placeholder,type="text",disabled,required,hint}) => (
  <div style={{marginBottom:14}}>
    {label&&<Lbl c={label} req={required}/>}
    <input type={type} value={value||""} onChange={e=>onChange(e.target.value)}
      placeholder={placeholder} disabled={disabled} style={inpStyle(disabled)}/>
    {hint&&<div style={{fontSize:11,color:C.muted,marginTop:3}}>{hint}</div>}
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
      {hint&&<div style={{fontSize:11,color:C.muted,marginTop:3}}>{hint}</div>}
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
    {hint&&<div style={{fontSize:11,color:C.muted,marginTop:3}}>{hint}</div>}
  </div>
);

const Txt = ({label,value,onChange,placeholder,rows=4,disabled,hint}) => (
  <div style={{marginBottom:14}}>
    {label&&<Lbl c={label}/>}
    <textarea value={value||""} onChange={e=>onChange(e.target.value)}
      placeholder={placeholder} rows={rows} disabled={disabled}
      style={{...inpStyle(disabled),resize:"vertical",lineHeight:1.65}}/>
    {hint&&<div style={{fontSize:11,color:C.muted,marginTop:3}}>{hint}</div>}
  </div>
);

const Btn = ({onClick,children,primary,ghost,danger,disabled,sm,full,outline}) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding:sm?"6px 14px":"9px 20px",borderRadius:7,
    border:outline?`1.5px solid ${C.accent}`:"none",
    background:disabled?"#E5E0D8":primary?C.accent:danger?C.red:ghost||outline?"transparent":C.tag,
    color:disabled?C.muted:primary||danger?C.white:C.ink,
    fontSize:sm?12:13,fontWeight:600,display:"inline-flex",alignItems:"center",gap:6,
    fontFamily:"inherit",width:full?"100%":"auto",justifyContent:"center",
    cursor:disabled?"not-allowed":"pointer",opacity:disabled?.6:1,transition:"opacity .15s",
  }}>{children}</button>
);

const Card = ({children,s}) => (
  <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:20,...s}}>{children}</div>
);

const SecTitle = ({n,label,sub}) => (
  <div style={{marginBottom:22,paddingBottom:12,borderBottom:`2px solid ${C.accent}`}}>
    {n&&<div style={{fontSize:10,fontWeight:700,color:C.accent,letterSpacing:".1em",textTransform:"uppercase",marginBottom:4}}>SECCIÓN {n}</div>}
    <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,fontWeight:400,color:C.ink}}>{label}</h2>
    {sub&&<p style={{fontSize:13,color:C.muted,marginTop:4,lineHeight:1.5}}>{sub}</p>}
  </div>
);

const SectionLabel = ({children}) => (
  <div style={{fontSize:11,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:".06em",marginBottom:10,marginTop:4}}>{children}</div>
);

const InfoRow = ({label,val}) => (
  <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
    <span style={{color:C.muted}}>{label}</span>
    <span style={{fontWeight:600,color:C.ink,textAlign:"right",maxWidth:"60%"}}>{val||"—"}</span>
  </div>
);

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
        <textarea value={value||""} onChange={e=>onChange(e.target.value)}
          placeholder={placeholder} rows={rows}
          style={{...inpStyle(false),resize:"vertical",lineHeight:1.65,paddingRight:46}}/>
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
      {rec&&<div style={{fontSize:11,color:C.red,marginTop:4,display:"flex",alignItems:"center",gap:5}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:C.red,display:"inline-block",animation:"pulse 1s infinite"}}/>
        Grabando — habla con claridad
      </div>}
      <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
        {value&&<Btn sm onClick={onImprove} disabled={improving} primary>
          {improving?<><Spin/>Mejorando…</>:<><Sparkles size={12}/>Mejorar con IA</>}
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
    marginTop:32,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
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
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16}}>
        <span style={{color:"#fff"}}>PERIT</span><span style={{color:"#C1494E"}}>.IA</span>
      </div>
      <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:".08em",textTransform:"uppercase"}}>Informes Periciales</div>
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
    <div style={{minHeight:'100vh',background:'#F8F5F0',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <link rel="stylesheet" href={FONT}/>
      <div style={{width:380,background:'#fff',borderRadius:16,padding:40,boxShadow:'0 8px 40px rgba(0,0,0,.1)'}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:28,fontWeight:400,color:'#1A1714',letterSpacing:'-.02em'}}>
            PERIT<span style={{color:'#9B2226'}}>.IA</span>
          </div>
          <div style={{fontSize:12,color:'#888',marginTop:4}}>
            {mode==='login'?'Accede a tu cuenta':'Crea tu cuenta'}
          </div>
        </div>

        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:600,color:'#555',marginBottom:5,textTransform:'uppercase',letterSpacing:'.04em'}}>Email</div>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&submit()}
            placeholder="perito@ejemplo.com"
            style={{width:'100%',padding:'10px 13px',border:'1px solid #ddd',borderRadius:8,fontSize:14,fontFamily:'inherit',boxSizing:'border-box',outline:'none'}}/>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:600,color:'#555',marginBottom:5,textTransform:'uppercase',letterSpacing:'.04em'}}>Contraseña</div>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&submit()}
            placeholder="••••••••"
            style={{width:'100%',padding:'10px 13px',border:'1px solid #ddd',borderRadius:8,fontSize:14,fontFamily:'inherit',boxSizing:'border-box',outline:'none'}}/>
        </div>

        {emailSent&&<div style={{background:'#F0FDF4',border:'1px solid #A7F3D0',borderRadius:7,padding:'10px 14px',fontSize:13,color:'#065F46',marginBottom:14,lineHeight:1.6}}>
          <b>✉️ Revisa tu correo</b><br/>
          Te hemos enviado un email de confirmación a <b>{email}</b>.<br/>
          Confirma tu cuenta y luego <button onClick={()=>{setMode('login');setEmailSent(false);}} style={{background:'none',border:'none',color:'#9B2226',cursor:'pointer',fontWeight:600,fontSize:13,fontFamily:'inherit',padding:0}}>inicia sesión</button>.
        </div>}

        {err&&<div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:7,padding:'8px 12px',fontSize:12,color:'#B91C1C',marginBottom:14}}>{err}</div>}

        {!emailSent&&<button onClick={submit} disabled={load}
          style={{width:'100%',padding:'11px 0',background:load?'#ccc':'#9B2226',color:'#fff',border:'none',borderRadius:9,fontSize:14,fontWeight:700,cursor:load?'not-allowed':'pointer',fontFamily:'inherit',transition:'background .2s'}}>
          {load?'Conectando…':mode==='login'?'Entrar':'Crear cuenta'}
        </button>}

        <div style={{textAlign:'center',marginTop:16,fontSize:13,color:'#888'}}>
          {mode==='login'?'¿No tienes cuenta? ':'¿Ya tienes cuenta? '}
          <button onClick={()=>{setMode(mode==='login'?'signup':'login');setErr('');}}
            style={{background:'none',border:'none',color:'#9B2226',cursor:'pointer',fontWeight:600,fontSize:13,fontFamily:'inherit',padding:0}}>
            {mode==='login'?'Regístrate':'Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = ({cases,onNew,onOpen,onDelete,user,onSignOut,loading,sidebarOpen,setSidebarOpen}) => {
  return (
    <div style={{minHeight:"100vh",display:"flex",background:C.bg}}>

      {/* SIDEBAR */}
      <div style={{width:sidebarOpen?220:0,background:C.sidebar,flexShrink:0,overflow:"hidden",
        transition:"width .2s ease",display:"flex",flexDirection:"column"}}>
        {sidebarOpen&&<>
          <div style={{padding:"22px 16px 10px"}}><Logo/></div>
          <div style={{height:1,background:"rgba(255,255,255,.07)",margin:"0 16px 10px"}}/>
          <div style={{padding:"4px 8px",flex:1}}>
            <button onClick={onNew} style={{width:"100%",display:"flex",alignItems:"center",gap:8,
              padding:"9px 12px",background:C.accent,color:"#fff",border:"none",borderRadius:8,
              cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>
              <Plus size={13}/>Nuevo encargo
            </button>
          </div>
          <div style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,.07)",fontSize:11,color:"rgba(255,255,255,.4)"}}>
            <div style={{marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.email}</div>
            <button onClick={onSignOut} style={{background:"none",border:"none",cursor:"pointer",
              color:"rgba(255,255,255,.35)",fontSize:11,fontFamily:"inherit",padding:0}}>
              Cerrar sesión
            </button>
          </div>
        </>}
      </div>

      {/* MAIN */}
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>

        {/* TOPBAR */}
        <div style={{background:C.accent,padding:"9px 16px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <button onClick={()=>setSidebarOpen(v=>!v)} title={sidebarOpen?"Ocultar menú":"Mostrar menú"}
            style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:6,padding:"5px 8px",
              cursor:"pointer",color:"#fff",display:"flex",alignItems:"center"}}>
            {sidebarOpen?<ChevronLeft size={14}/>:<ChevronRight size={14}/>}
          </button>
          <span style={{fontFamily:"'DM Serif Display',serif",fontSize:15,color:"rgba(255,255,255,.9)"}}>
            PERIT<span style={{color:"rgba(255,255,255,.55)"}}>.IA</span>
          </span>
          <div style={{flex:1}}/>
          {!sidebarOpen&&<>
            <span style={{fontSize:11,color:"rgba(255,255,255,.5)"}}>{user?.email}</span>
            <button onClick={onNew} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:6,
              padding:"5px 12px",cursor:"pointer",color:"#fff",fontSize:12,fontWeight:600,fontFamily:"inherit",
              display:"flex",alignItems:"center",gap:5}}>
              <Plus size={12}/>Nuevo
            </button>
            <button onClick={onSignOut} style={{background:"none",border:"none",cursor:"pointer",
              color:"rgba(255,255,255,.4)",fontSize:11,fontFamily:"inherit"}}>Salir</button>
          </>}
        </div>

        {/* CONTENT */}
        <div style={{maxWidth:860,margin:"0 auto",padding:"28px 24px",width:"100%",boxSizing:"border-box"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
            <div>
              <h1 style={{fontFamily:"'DM Serif Display',serif",fontSize:26,fontWeight:400,color:C.ink,marginBottom:4}}>Mis Encargos</h1>
              <p style={{color:C.muted,fontSize:13}}>{cases.length} expediente{cases.length!==1?"s":""}</p>
            </div>
            <Btn primary onClick={onNew}><Plus size={14}/>Nuevo Encargo</Btn>
          </div>
          {loading&&<div style={{textAlign:"center",padding:40,color:C.muted,fontSize:13}}>Cargando encargos…</div>}
          {!loading&&(cases.length===0
            ?<Card s={{textAlign:"center",padding:"60px 40px"}}>
              <Building2 size={44} style={{color:C.border,marginBottom:14}}/>
              <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,fontWeight:400,marginBottom:8}}>Sin encargos todavía</h3>
              <p style={{color:C.muted,fontSize:13,marginBottom:20}}>Sube el PDF del encargo para comenzar</p>
              <Btn primary onClick={onNew}><Plus size={14}/>Crear primer encargo</Btn>
            </Card>
            :<div style={{display:"flex",flexDirection:"column",gap:8}}>
              {cases.map(cas=>{
                const e=cas.encargo||{};
                const done=[cas.s1,cas.s2,cas.s3,cas.s4].filter(s=>s&&Object.keys(s).length>2).length;
                return (
                  <div key={cas.id} onClick={()=>onOpen(cas)}
                    style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,
                      padding:"16px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,
                      transition:"box-shadow .15s"}}
                    onMouseEnter={ev=>ev.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,.07)"}
                    onMouseLeave={ev=>ev.currentTarget.style.boxShadow="none"}>
                    <div style={{width:42,height:42,background:C.accentLight,borderRadius:9,display:"flex",
                      alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <FileText size={18} style={{color:C.accent}}/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:15,color:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {e.asegurado||"Sin asegurado"}
                      </div>
                      <div style={{fontSize:12,color:C.muted,marginTop:2}}>
                        {e.compania||"—"} · {e.numReferencia||"—"} · {e.lugarIntervencion||""}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
                      <div style={{background:C.greenBg,color:C.green,borderRadius:20,padding:"3px 11px",fontSize:11,fontWeight:700}}>{done}/4</div>
                      {onDelete&&<button onClick={ev=>{ev.stopPropagation();if(confirm("¿Eliminar este encargo?"))onDelete(cas.id);}}
                        style={{background:"none",border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 7px",
                          cursor:"pointer",color:C.muted,fontFamily:"inherit",fontSize:11}}>
                        <Trash2 size={11}/>
                      </button>}
                      <ChevronRight size={15} style={{color:C.muted}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
      {badge&&<div style={{position:"absolute",top:8,left:8,background:C.accent,color:"#fff",borderRadius:4,fontSize:10,fontWeight:700,padding:"2px 7px"}}>{badge}</div>}
      {isLoading
        ?<><Loader2 size={26} style={{color:C.accent,animation:"spin 1s linear infinite"}}/><div style={{fontWeight:600,fontSize:13,color:C.accent}}>{loadingMsg||"Procesando…"}</div></>
        :file
          ?<><div style={{width:32,height:32,background:C.green,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}><Check size={16} style={{color:"#fff"}}/></div>
              <div style={{fontWeight:600,fontSize:13,color:C.green}}>{file.name}</div>
              <div style={{fontSize:11,color:C.muted}}>{(file.size/1024).toFixed(0)} KB · clic para cambiar</div></>
          :<><Icon size={24} style={{color:drag?C.accent:C.muted}}/><div style={{fontWeight:600,fontSize:13,color:C.ink}}>{label}</div><div style={{fontSize:11,color:C.muted}}>{sublabel}</div></>
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
      onTokens
    , onTokens, 3000).catch(()=>"{}");
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
      const polPrompt = "Eres un perito de seguros experto en polizas AXA y similares. Analiza esta poliza y extrae los capitales correctos para el siniestro.\n\nCOBERTURA AFECTADA: " + cobEnc + "\n\nINSTRUCCIONES CRITICAS:\n- La poliza puede tener MULTIPLES valores para el continente (Edificio, Edificio primer riesgo, Obras de reforma...)\n- Para DAGUA, RGEXT, INCEN: usa EDIFICIO PRIMER RIESGO si existe con valor>0. Si no, usa OBRAS DE REFORMA.\n- Para RCEXP, RCLOC: usa el capital de RC, no el de continente.\n- NUNCA sumes los valores, elige UNO solo el mas relevante.\n- Para contenido: usa el capital principal de Mobiliario y maquinaria, NO sublimites.\n\nDevuelve SOLO este JSON sin markdown:\n{\n  \"capitalContinente\": \"numero en euros sin simbolo. Capital del continente mas relevante para " + cobEnc + ". Si no existe 0\",\n  \"tipoContinente\": \"tipo elegido: Edificio primer riesgo / Obras de reforma / Edificio\",\n  \"capitalContenido\": \"numero en euros. Capital principal mobiliario o contenido. Si no existe 0\",\n  \"franquicia\": \"numero en euros. Franquicia general. Si no hay 0\",\n  \"garantiasActivas\": \"coberturas contratadas separadas por coma\",\n  \"condicionesEspeciales\": \"resumen breve de condiciones relevantes para la peritacion\",\n  \"primerRiesgo\": true si el capital continente elegido es a primer riesgo false si es valor total,\n  \"fechaEfecto\": \"fecha de efecto de la poliza en formato dd/mm/aaaa. Busca en primera pagina o datos del contrato. Ejemplo: 30/06/2021\",\n  \"productoContratado\": \"nombre comercial del producto o modalidad contratada, ej: Multirriesgo Empresa, Hogar Plus, Comercios\",\n  \"todosCapitalesContinente\": \"lista de TODOS los valores de continente: Edificio:0 / Edificio PR:6000 / Obras reforma:1388139\",\n  \"umbralLluvia\": \"litros/m2/hora minimos lluvia segun poliza ej 40\",\n  \"umbralViento\": \"kmh minimos viento segun poliza ej 80\",\n  \"tipoVivienda\": \"tipo de vivienda del apartado descripcion de la vivienda asegurada, ej: Piso, Chalet, Unifamiliar aislada. Vacio si no aparece\",\n  \"usoVivienda\": \"uso de la vivienda del apartado descripcion, ej: Habitual, Segunda residencia, Arrendamiento. Vacio si no aparece\",\n  \"ubicacionVivienda\": \"direccion o ubicacion exacta del riesgo del apartado descripcion de la vivienda asegurada. Vacio si no aparece\",\n  \"calidadPóliza\": \"calidad de los acabados si aparece en la poliza: Básica, Media o Alta. Vacio si no aparece\",\n  \"descripciones\": {\n    \"INCEN\": \"texto cobertura incendio\",\n    \"DAGUA\": \"texto cobertura danos por agua\",\n    \"RCEXP\": \"texto cobertura RC explotacion\",\n    \"RGEXT\": \"texto riesgos extensivos\"\n  }\n}";
      const praw = await callClaude(
        "Eres un extractor experto de polizas de seguro empresariales espanolas, especialmente AXA Multirriesgo Empresa. Responde SOLO con JSON valido sin markdown.",
        [{type:"document",source:{type:"base64",media_type:"application/pdf",data:pb64}},
         {type:"text",text:polPrompt}],
        onTokens, 3000
      ).catch(()=>"{}");
      pol = parseJSON(praw);
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
    const capCPol = parseCap(pol.capitalContinente||enc.capitalContinente);
    const normD = r => { const m=(r||"").match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/); return m?m[1].padStart(2,"0")+"/"+m[2].padStart(2,"0")+"/"+m[3]:r||""; };
    const bestCap2 = (a,b) => { const vb=parseCap(b); if(vb>0)return String(vb); const va=parseCap(a); if(va>0)return String(va); return ""; };
    setData({...enc,
      capitalContinente:        esHogarEnc?(capCPol>0?String(capCPol):""):bestCap2(enc.capitalContinente,pol.capitalContinente),
      capitalContenido:         bestCap2(enc.capitalContenido, pol.capitalContenido),
      franquicia:               String(parseCap(pol.franquicia||enc.franquicia)||0),
      garantia:                 cobFinal2,
      garantiasActivas:         pol.garantiasActivas||enc.garantia||"",
      condicionesEspeciales:    pol.condicionesEspeciales||"",
      productoContratado:       pol.productoContratado||"",
      codigoPostal:             enc.codigoPostal||"",
      primerRiesgo:             pol.primerRiesgo||esHogarEnc||false,
      tipoContinentePoliza:     esHogarEnc?"Primer riesgo (Hogar)":(pol.tipoContinente||""),
      todosCapitalesContinente: esHogarEnc?"":(pol.todosCapitalesContinente||""),
      tipoEncargo:              enc.tipoEncargo||"PERITACION",
      modalidadVisita:          enc.modalidadVisita||"PRESENCIAL",
      esHogar:                  esHogarEnc,
      umbralLluvia:             pol.umbralLluvia||"",
      umbralViento:             pol.umbralViento||"",
      fechaEfecto:              normD(pol.fechaEfecto||enc.fechaEfecto||""),
      descripciones:            pol.descripciones||{},
      polizaAdjunta:            !!polFile,
    });;
    setStep("review");
  };

  const s = f => v => setData(p=>({...p,[f]:v}));

  if(step==="upload") return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg}}>
      <div style={{width:580,background:C.white,borderRadius:14,padding:38,border:`1px solid ${C.border}`}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:48,height:48,background:`linear-gradient(135deg,${C.accent},#C1494E)`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
            <Sparkles size={22} style={{color:"#fff"}}/>
          </div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:22,fontWeight:400,color:C.ink,marginBottom:6}}>Nuevo Encargo</h2>
          <p style={{color:C.muted,fontSize:13}}>Adjunta el encargo y la póliza. La IA extraerá todos los datos automáticamente.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:C.ink,marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>Hoja de Encargo <span style={{color:C.accent}}>*</span></div>
            <DropZone label="Adjuntar encargo" sublabel="PDF de la compañía" icon={FileText} file={encFile} onFile={setEncFile} badge="Obligatorio"/>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:C.ink,marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>Póliza de Seguro</div>
            <DropZone label="Adjuntar póliza" sublabel="Para extraer capitales y garantías" icon={Shield} file={polFile} onFile={handlePolFile} badge="Opcional" isLoading={polLoading} loadingMsg="Subiendo póliza…"/>
          </div>
        </div>
        {encFile&&<div style={{background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:7,padding:"9px 12px",fontSize:12,color:C.green,marginBottom:14,display:"flex",alignItems:"center",gap:7}}>
          <Check size={13}/>
          <span><b>Listo.</b> {polFile?"Encargo y póliza adjuntos — la IA extraerá datos de ambos.":"Encargo adjunto. Sin póliza, los capitales se rellenarán manualmente."}</span>
        </div>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={()=>{setData({});setStep("review");}} style={{background:"none",border:"none",color:C.muted,fontSize:12,cursor:"pointer",textDecoration:"underline"}}>Crear sin documentos</button>
          <div style={{display:"flex",gap:10}}>
            <Btn ghost onClick={onCancel}>Cancelar</Btn>
            <Btn primary onClick={processAll} disabled={!encFile}><Sparkles size={13}/>Extraer con IA</Btn>
          </div>
        </div>
      </div>
    </div>
  );

  if(step==="extracting") return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg}}>
      <div style={{textAlign:"center",maxWidth:360}}>
        <Loader2 size={40} style={{color:C.accent,animation:"spin 1s linear infinite",marginBottom:16}}/>
        <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:19,fontWeight:400,marginBottom:6}}>Extrayendo datos…</h3>
        <p style={{color:C.accent,fontSize:13,fontWeight:600}}>{msg}</p>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,padding:"36px 0",overflowY:"auto"}}>
      <div style={{maxWidth:680,margin:"0 auto",padding:"0 24px"}}>
        <div style={{marginBottom:22}}>
          <div style={{fontSize:10,color:C.accent,fontWeight:700,letterSpacing:".08em",marginBottom:3,textTransform:"uppercase"}}>Datos extraídos ✨</div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:22,fontWeight:400,color:C.ink}}>Datos del Encargo</h2>
          <p style={{color:C.muted,fontSize:12,marginTop:3}}>Revisa y corrige antes de continuar</p>
        </div>
        <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"}}>
          {encFile&&<div style={{background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:6,padding:"4px 11px",fontSize:11,color:C.green,display:"flex",alignItems:"center",gap:4}}><Check size={10}/>Encargo: {encFile.name}</div>}
          {polFile&&<div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:6,padding:"4px 11px",fontSize:11,color:C.blue,display:"flex",alignItems:"center",gap:4}}><Check size={10}/>Póliza: {polFile.name}</div>}
        </div>

        <Card s={{marginBottom:12}}>
          <SectionLabel>🏢 Compañía y Siniestro</SectionLabel>
          <div style={{marginBottom:14}}>
            <Lbl c="Compañía ✨" req/>
            <select value={COMPANIAS.find(c=>data.compania&&data.compania.toUpperCase().includes(c.toUpperCase()))||data.compania||""}
              onChange={e=>s("compania")(e.target.value)}
              style={{...inpStyle(false),cursor:"pointer",border:`1px solid ${data.compania?C.border:C.accent}`}}>
              <option value="">Seleccionar…</option>
              {COMPANIAS.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            {data.compania&&!COMPANIAS.find(c=>data.compania&&data.compania.toUpperCase().includes(c.toUpperCase()))&&
              <div style={{fontSize:11,color:C.orange,marginTop:3}}>Valor extraído: "{data.compania}" — selecciona manualmente</div>
            }
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Nº Siniestro / Referencia ✨" value={data.numReferencia} onChange={s("numReferencia")} required/>
            <Inp label="Nº Póliza ✨" value={data.numPoliza} onChange={s("numPoliza")}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Ramo ✨" value={data.ramo} onChange={s("ramo")}/>
            <Inp label="Garantía afectada ✨" value={data.garantia} onChange={s("garantia")}/>
          </div>
          <Inp label="Producto contratado ✨" value={data.productoContratado} onChange={s("productoContratado")} placeholder="Ej: Multirriesgo Empresa" hint={data.polizaAdjunta?"Extraído de la póliza":"Adjunta la póliza para extraer automáticamente"}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Causa ✨" value={data.causa} onChange={s("causa")}/>
            <Inp label="Nº Exp. Interno ✨" value={data.numExpInterno} onChange={s("numExpInterno")}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Fecha Encargo ✨" value={data.fechaEncargo} onChange={s("fechaEncargo")} placeholder="dd/mm/aaaa"/>
            <Inp label="Fecha Siniestro ✨" value={data.fechaSiniestro} onChange={s("fechaSiniestro")} placeholder="dd/mm/aaaa"/>
          </div>
        </Card>

        <Card s={{marginBottom:12}}>
          <SectionLabel>📍 Asegurado y Localización</SectionLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Asegurado / Tomador ✨" value={data.asegurado} onChange={s("asegurado")} required/>
            <Inp label="NIF / CIF ✨" value={data.nifAsegurado} onChange={s("nifAsegurado")}/>
          </div>
          <Inp label="Lugar de intervención ✨" value={data.lugarIntervencion} onChange={s("lugarIntervencion")} required/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <Inp label="Código postal ✨" value={data.codigoPostal} onChange={s("codigoPostal")} placeholder="Ej: 17230"/>
            <Inp label="Municipio ✨" value={data.municipio} onChange={s("municipio")} placeholder="Ej: Palamós"/>
            <Inp label="Provincia ✨" value={data.provincia} onChange={s("provincia")} placeholder="Ej: Girona"/>
          </div>
        </Card>

        <Card s={{marginBottom:12}}>
          <SectionLabel>💰 Capitales Asegurados {data.polizaAdjunta&&<span style={{color:C.green,fontWeight:400}}>✨ de la póliza</span>}</SectionLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <EuroInput label="Capital Continente" value={data.capitalContinente} onChange={s("capitalContinente")}
                hint={data.tipoContinentePoliza?"Tipo: "+data.tipoContinentePoliza:data.polizaAdjunta?"Extraído de la póliza":"Introduce el valor de la póliza"}/>
              {data.todosCapitalesContinente&&<div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:5,padding:"5px 9px",fontSize:10,color:C.blue,marginTop:-10,marginBottom:8}}>
                Todos los capitales en póliza: {data.todosCapitalesContinente}
              </div>}
            </div>
            <EuroInput label="Capital Contenido" value={data.capitalContenido} onChange={s("capitalContenido")}
              hint={data.polizaAdjunta?"Extraído de la póliza":"Introduce el valor de la póliza"}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <EuroInput label="Franquicia general" value={data.franquicia} onChange={s("franquicia")} hint="0,00 € si no hay franquicia"/>
            <Inp label="Fecha efecto póliza ✨" value={data.fechaEfecto} onChange={s("fechaEfecto")} placeholder="dd/mm/aaaa"/>
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
  const indemn = Math.max(0,totalDano*regla-parseCap(s3?.franquiciaVal||enc.franquicia));

  const Section = ({n,title,children,id,done}) => (
    <div style={{marginBottom:22,paddingBottom:22,borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:15,fontWeight:400,color:C.ink,borderBottom:`2px solid ${C.accent}`,paddingBottom:5}}>
          {n&&<span style={{fontSize:10,color:C.accent,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",display:"block",marginBottom:2}}>SECCIÓN {n}</span>}
          {title}
        </div>
        {!done&&<Btn sm ghost onClick={()=>onGoTo(id)}>Completar →</Btn>}
        {done&&<span style={{fontSize:11,color:C.green,display:"flex",alignItems:"center",gap:4}}><Check size={11}/>Completado</span>}
      </div>
      {children}
    </div>
  );

  const Empty = ({msg}) => <div style={{fontSize:12,color:C.border,fontStyle:"italic",padding:"12px 0"}}>{msg}</div>;

  return (
    <div className="fade">
      <SecTitle label="Informe Pericial" sub="Vista en tiempo real del informe — se actualiza automáticamente"/>

      {/* CABECERA */}
      <Card s={{marginBottom:18,borderLeft:`4px solid ${C.accent}`,padding:24}}>
        <div style={{textAlign:"center",marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,fontStyle:"italic",color:C.ink}}>INFORME PERICIAL</div>
          <div style={{fontSize:11,color:C.muted,letterSpacing:".1em",textTransform:"uppercase",marginTop:3}}>Intervención Pericial No Auto</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:16}}>
          {[["Compañía",enc.compania],["Nº Referencia",enc.numReferencia],["Nº Póliza",enc.numPoliza],
            ["Ramo",enc.ramo],["Garantía",enc.garantia],["Importe líquido",totalDano>0?fmtE(totalDano):null],
            ["Fecha Encargo",enc.fechaEncargo],["Fecha Siniestro",enc.fechaSiniestro],["Nº Exp. Interno",enc.numExpInterno],
          ].map(([k,v])=>(
            <div key={k} style={{borderBottom:`1px solid ${C.border}`,paddingBottom:7}}>
              <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:2}}>{k}</div>
              <div style={{fontSize:13,fontWeight:600,color:v?C.ink:C.border}}>{v||"—"}</div>
            </div>
          ))}
        </div>
        <InfoRow label="Lugar de intervención" val={enc.lugarIntervencion+(provincia?`, ${provincia}`:"")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:10}}>
          <InfoRow label="Asegurado" val={enc.asegurado}/>
          <InfoRow label="Perito" val={enc.perito?(enc.perito+(enc.telPerito?" · "+enc.telPerito:"")):null}/>
        </div>
        <div style={{marginTop:14,padding:11,background:C.bg,borderRadius:7,fontSize:11,color:C.muted,lineHeight:1.7,fontStyle:"italic"}}>
          Este informe ha sido emitido a tenor del siniestro declarado en el riesgo asegurado. El que suscribe manifiesta bajo promesa de decir verdad que ha actuado con la mayor objetividad posible.
        </div>
      </Card>

      {/* PROGRESO */}
      <div style={{display:"flex",gap:7,marginBottom:18,flexWrap:"wrap"}}>
        {[["Encargo",!!(enc.asegurado&&enc.numReferencia)],["Sec.1",!!(s1?.superficieConstruida)],
          ["Sec.2",!!(s2?.textoAI)],["Sec.3",partidas.length>0],["Sec.4",!!(s4?.aiText)]
        ].map(([l,done])=>(
          <div key={l} style={{background:done?C.greenBg:C.tag,border:`1px solid ${done?"#A7F3D0":C.border}`,
            borderRadius:20,padding:"3px 11px",fontSize:11,fontWeight:600,color:done?C.green:C.muted,
            display:"flex",alignItems:"center",gap:4}}>
            {done&&<Check size={10}/>}{l}
          </div>
        ))}
        {indemn>0&&<div style={{background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:20,padding:"3px 14px",fontSize:12,fontWeight:700,color:C.green,marginLeft:"auto"}}>
          Indemnización: {fmtE(indemn)}
        </div>}
      </div>

      {/* SECCIÓN 1 */}
      <Section n="1" title="Verificación del Riesgo y Póliza" id="s1" done={!!(s1?.superficieConstruida||s1?.textoInstant)}>
        {enc.tipoEncargo==="INSTANT_PAYMENT"
          ? <div style={{fontSize:13,color:C.ink,lineHeight:1.8}}>
              {s1?.textoInstant||(`Localización del riesgo: el riesgo está situado en ${enc.lugarIntervencion||"—"}. Este siniestro se ha gestionado documentalmente.`)}
            </div>
          : s1?.superficieConstruida
          ?<>
            <div style={{fontSize:13,color:C.ink,lineHeight:1.8,marginBottom:12}}>
              {[["Tipo de riesgo",s1.tipoRiesgo],["Año de construcción",s1.anoConstruccion],
                ["Superficie construida",s1.superficieConstruida?" m²":null],
                ["Calidad de acabados",s1.calidad],["Estado general",s1.estado||"—"],
                ["Ref. catastral",s1.refCatastral]
              ].filter(([,v])=>v).map(([k,v])=><InfoRow key={k} label={k} val={k==="Superficie construida"?s1.superficieConstruida+" m²":v}/>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["CONTINENTE",capCont,vReal,infraCont],["CONTENIDO",parseFloat(enc.capitalContenido||0),parseFloat(enc.capitalContenido||0),0]].map(([t,aseg,prev,infra])=>(
                <div key={t} style={{background:infra>0?C.redBg:C.greenBg,border:`1px solid ${infra>0?"#FECACA":"#A7F3D0"}`,borderRadius:7,padding:12}}>
                  <div style={{fontSize:10,fontWeight:700,color:infra>0?C.red:C.green,marginBottom:7,textTransform:"uppercase"}}>{t}</div>
                  {[["Valor Asegurado",fmtE(aseg)],["Valor Preexistente",fmtE(prev)],["Infraseguro",`${fmt(infra)} %`]].map(([k,v])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                      <span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600}}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {s1.aiText&&<div style={{marginTop:12,fontSize:12,color:C.ink,lineHeight:1.8,background:C.bg,borderRadius:7,padding:12,whiteSpace:"pre-wrap"}}>{s1.aiText}</div>}
          </>
          :<Empty msg="Completa la Sección 1 para ver los datos del riesgo"/>
        }
      </Section>

      {/* SECCIÓN 2 */}
      <Section n="2" title="Causas y Circunstancias" id="s2" done={!!(s2?.textoAI||s2?.textoRaw)}>
        {(s2?.textoAI||s2?.textoRaw)
          ?<div style={{fontSize:13,color:C.ink,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{s2.textoAI||s2.textoRaw}</div>
          :<Empty msg="Completa la Sección 2 para ver las causas y circunstancias"/>}
      </Section>

      {/* SECCIÓN 3 */}
      <Section n="3" title="Valoración de Daños" id="s3" done={partidas.length>0}>
        {partidas.length>0
          ?<>
            {s3?.textoAI&&<div style={{fontSize:13,color:C.ink,lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:14}}>{s3.textoAI}</div>}
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:14,fontWeight:400,color:C.ink,marginBottom:8,textAlign:"center"}}>{s3?.tipoGarantia||"Fenómenos atmosféricos"} — {s3?.tipoGarantiaVal||"CONTINENTE"}</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:C.accentLight}}>
                {["Descripción-concepto","Uds","V.Unit.€","V.Repos.€","%IVA","IVA €","Depr","%Depr","V.Real €","V.Prop.€","Perceptor","Cob."].map(h=>(
                  <th key={h} style={{padding:"5px 6px",textAlign:h==="Descripción-concepto"?"left":"right",color:C.accent,fontWeight:700,fontSize:10}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {getPartidas(s3).map((p,i)=>{
                  const {vRepos:vr,ivaAmt,vReal:vreal}=calcPartida(p);
                  return (<tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>
                    <td style={{padding:"5px 6px",fontSize:11}}>{p.desc}</td>
                    <td style={{padding:"5px 6px",textAlign:"right"}}>{p.uds||1}</td>
                    <td style={{padding:"5px 6px",textAlign:"right"}}>{fmt(p.p)}</td>
                    <td style={{padding:"5px 6px",textAlign:"right"}}>{fmt(vr)}</td>
                    <td style={{padding:"5px 6px",textAlign:"right"}}>{p.iva??21}%</td>
                    <td style={{padding:"5px 6px",textAlign:"right"}}>{fmt(ivaAmt)}</td>
                    <td style={{padding:"5px 6px",textAlign:"right"}}>{p.depr?"SI":"NO"}</td>
                    <td style={{padding:"5px 6px",textAlign:"right"}}>{p.depr?(p.pctDepr||0)+"%":"0,00"}</td>
                    <td style={{padding:"5px 6px",textAlign:"right"}}>{fmt(vreal)}</td>
                    <td style={{padding:"5px 6px",textAlign:"right",fontWeight:700,color:C.green}}>{fmt(vreal)}</td>
                    <td style={{padding:"5px 6px",textAlign:"right"}}>{p.perceptor||"Asegurado 1"}</td>
                    <td style={{padding:"5px 6px",textAlign:"center"}}>{p.cobertura?"Sí":"No"}</td>
                  </tr>);
                })}
                <tr style={{background:C.accentLight,fontWeight:700}}>
                  <td colSpan={3} style={{padding:"7px 6px",color:C.accent}}>Subtotal</td>
                  <td style={{padding:"7px 6px",textAlign:"right"}}>{fmt(sumRepos(getPartidas(s3)))} €</td>
                  <td/><td style={{padding:"7px 6px",textAlign:"right"}}>{fmt(sumIVA(getPartidas(s3)))} €</td>
                  <td colSpan={2}/>
                  <td style={{padding:"7px 6px",textAlign:"right",color:C.accent}}>{fmtE(totalDano)}</td>
                  <td style={{padding:"7px 6px",textAlign:"right",color:C.accent,fontSize:13}}>{fmtE(totalDano)}</td>
                  <td colSpan={2}/>
                </tr>
              </tbody>
            </table>
          </>
          :<Empty msg="Completa la Sección 3 para ver la valoración de daños"/>}
      </Section>

      {/* SECCIÓN 4 */}
      <Section n="4" title="Estudio de Cobertura-Indemnización" id="s4" done={!!(s4?.aiText)}>
        {s4?.aiText
          ?<>
            <div style={{fontSize:13,color:C.ink,lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:14}}>{s4.aiText}</div>
            {totalDano>0&&<>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:14,textAlign:"center",marginBottom:8}}>Resumen por garantías — Propuesta de indemnización</div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:14}}>
                <thead><tr style={{background:C.accentLight}}>
                  {["Garantía Afectada","D.con cobertura","Límite aseg.","Regla proporcional","Valor ajustado","Franquicia","Indemnización"].map(h=>(
                    <th key={h} style={{padding:"6px 8px",textAlign:h==="Garantía Afectada"?"left":"right",color:C.accent,fontWeight:700,fontSize:11}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  <tr style={{borderBottom:`1px solid ${C.border}`}}>
                    <td style={{padding:"8px",fontWeight:600}}>{enc.garantia||"CONTINENTE"}</td>
                    <td style={{padding:"8px",textAlign:"right"}}>{fmtE(totalDano)}</td>
                    <td style={{padding:"8px",textAlign:"right"}}>{fmtE(capCont)}</td>
                    <td style={{padding:"8px",textAlign:"right"}}>{regla<1?`${fmt(regla*100)}%`:"NO"}</td>
                    <td style={{padding:"8px",textAlign:"right",fontWeight:600}}>{fmtE(totalDano*regla)}</td>
                    <td style={{padding:"8px",textAlign:"right"}}>{fmtE(parseFloat(enc.franquicia||0))}</td>
                    <td style={{padding:"8px",textAlign:"right",fontWeight:700,color:C.green}}>{fmtE(indemn)}</td>
                  </tr>
                  <tr style={{background:C.accentLight,fontWeight:700}}>
                    <td colSpan={6} style={{padding:"8px",textAlign:"right",color:C.accent}}>TOTAL PROPUESTA DE INDEMNIZACIÓN</td>
                    <td style={{padding:"8px",textAlign:"right",color:C.accent,fontSize:14}}>{fmtE(indemn)}</td>
                  </tr>
                </tbody>
              </table>
            </>}
          </>
          :<Empty msg="Completa la Sección 4 para ver el estudio de cobertura"/>}
      </Section>

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
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:15,fontWeight:400,color:C.ink,borderBottom:`2px solid ${C.accent}`,paddingBottom:5,marginBottom:14}}>Anexos</div>
            {[{label:"Reportaje fotográfico",items:allFotos},{label:"Info catastral",items:allCatastro},{label:"Info Meteosim",items:allMeteosim},{label:"Factura",items:allFacturas}]
              .filter(g=>g.items.length>0).map(g=>(
              <div key={g.label} style={{marginBottom:10}}>
                <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>- {g.label}. {g.label}</div>
                {g.label==="Reportaje fotográfico"
                  ?<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                    {allFotos.map(f=>(
                      <div key={f.id} style={{borderRadius:6,overflow:"hidden",border:`1px solid ${C.border}`}}>
                        <img src={f.url} alt={f.caption} style={{width:"100%",height:80,objectFit:"cover",display:"block"}}/>
                        {f.caption&&<div style={{fontSize:9,padding:"3px 5px",color:C.muted,textAlign:"center"}}>{f.caption}</div>}
                      </div>
                    ))}
                  </div>
                  :<div style={{fontSize:12,color:C.muted}}>
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

      <div style={{textAlign:"center",color:C.muted,fontSize:12,fontStyle:"italic",paddingTop:8}}>
        Por nuestra parte damos por finalizada la intervención en el siniestro, quedando a su disposición ante cualquier aclaración que estimen oportuna.
      </div>
    </div>
  );
};

// ─── SECCIÓN 1 ────────────────────────────────────────────────────────────────
const Sec1 = ({data,onChange,enc,onTokens,onNext,onSave}) => {
  const [calSug,setCalSug]     = useState("");
  const [aiLoad,setAiLoad]     = useState(false);
  const s = f => v => onChange({...data,[f]:v});
  const esHogar  = enc.esHogar||((enc.ramo||"").toUpperCase().includes("HOGAR"));
  const esInstant = enc.tipoEncargo==="INSTANT_PAYMENT";

  // Auto-init instant text
  useEffect(()=>{
    if(esInstant && !data.textoInstant){
      const loc = enc.lugarIntervencion||enc.municipio||"";
      onChange({...data, textoInstant: `Localización del riesgo: el riesgo está situado en ${loc}. Este siniestro se ha gestionado documentalmente.`});
    }
  },[esInstant]);

  const genTexto = async () => {
    setAiLoad(true);
    const prov = PROVINCIAS.find(p=>p.l===enc.provincia||p.v===enc.provincia);
    const arqKey = data.tipoArqKey||"unif_aislada";
    const vPre = calcVPreexCont(data.superficieConstruida, prov?.v||"00", arqKey, data.calidad||"Media");
    const capCont = parseCap(data.capContOverride!=null?data.capContOverride:enc.capitalContinente);
    const text = await callClaude(
      "Perito de seguros. Redacta en estilo técnico pericial, conciso. Sin título de apartado.",
      `Sección 1.1 "Descripción del Riesgo" de un informe pericial:
TIPO VIVIENDA: ${data.tipoVivienda||data.tipoRiesgo||""} · USO: ${data.usoVivienda||""} · UBICACIÓN: ${data.ubicacion||enc.lugarIntervencion||""}, ${enc.provincia||""}
SUPERFICIE: ${data.superficieConstruida||"—"} m² · AÑO: ${data.anoConstruccion||"—"} · CALIDAD: ${data.calidad||"Media"} · ESTADO: ${data.estado||"—"}
REF.CATASTRAL: ${data.refCatastral||"No aportada"}
CONTINENTE: Asegurado ${fmtE(capCont)} / Preexistente ${fmtE(vPre)} / Infraseguro ${vPre>capCont&&capCont>0?((vPre-capCont)/vPre*100).toFixed(2):"0,00"}%
Redacta en viñetas, siguiendo el estilo de un informe pericial real.`,
      onTokens
    ).catch(()=>"Error al conectar con la IA.");
    onChange({...data,aiText:text,aiEdited:false,aiApplied:false});
    setAiLoad(false);
  };

  const prov = PROVINCIAS.find(p=>p.l===enc.provincia||p.v===enc.provincia);
  const arqKey   = data.tipoArqKey||"unif_aislada";
  const capCont  = data.capContOverride!=null ? parseCap(data.capContOverride)  : parseCap(enc.capitalContinente);
  const capCont2 = data.capCont2Override!=null ? parseCap(data.capCont2Override) : parseCap(enc.capitalContenido);
  const primerRiesgoDetectado = enc.primerRiesgo||esHogar||false;
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
        <div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:7,padding:"8px 12px",fontSize:12,color:C.blue,marginBottom:10}}>
          📋 <b>Instant Payment — gestión documental.</b> El texto se genera automáticamente con la dirección del encargo. Edítalo si necesitas ajustarlo.
        </div>
        <textarea value={data.textoInstant||""} onChange={e=>onChange({...data,textoInstant:e.target.value})}
          rows={3} style={{...inpStyle(false),resize:"vertical",lineHeight:1.7,fontSize:13,marginBottom:8}}/>
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
          {aiLoad?<><Spin/>Mejorando…</>:<><Sparkles size={12}/>Mejorar con IA</>}
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

  return (
    <div className="fade">
      <SecTitle n="1" label="Verificación del Riesgo y Póliza" sub="Datos del inmueble asegurado, capitales y detección de infraseguro"/>

      {/* DATOS DEL RIESGO */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Datos del Riesgo Asegurado</SectionLabel>
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
          {enc.calidadPóliza&&!data.calidad&&<div style={{fontSize:11,color:C.green,marginBottom:4}}>
            ✨ Detectado en póliza: <b>{enc.calidadPóliza}</b> — seleccionado automáticamente
          </div>}
          <select value={data.calidad||(enc.calidadPóliza||"")} onChange={e=>s("calidad")(e.target.value)}
            style={{...inpStyle(false),cursor:"pointer",border:`1.5px solid ${(data.calidad||enc.calidadPóliza)?"#A7F3D0":C.border}`}}>
            <option value="">Seleccionar…</option>
            {["Básica","Media","Alta"].map(o=><option key={o}>{o}</option>)}
          </select>
          {calSug&&<div style={{background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:5,padding:"7px 10px",marginTop:5,fontSize:11,color:C.green}}>
            <b>✨ Sugerencia IA:</b> {data.calidad||enc.calidadPóliza} — {calSug}
          </div>}
        </div>
        <Sel label="Estado general del riesgo ✏️ (rellenar tras visita)" value={data.estado} onChange={s("estado")}
          options={["Nuevo","Buen estado","Reformado","Regular","Deteriorado"]}/>
        {!data.estado&&<div style={{fontSize:11,color:C.orange,marginTop:-10,marginBottom:10}}>⚠ Pendiente de rellenar tras la visita presencial</div>}
      </Card>

      {/* TIPO DE ARQUITECTURA */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Tipo de Arquitectura</SectionLabel>
        <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Selecciona el tipo para calcular el valor preexistente del continente.</div>

        {/* Nivel 1 */}
        <div style={{marginBottom:12}}>
          <Lbl c="Categoría principal"/>
          <div style={{display:"flex",gap:10,marginTop:4}}>
            {["Residencial","No residencial"].map(n1=>(
              <div key={n1} onClick={()=>onChange({...data,tipoArqNivel1:n1,tipoArqNivel2:"",tipoArqKey:""})}
                style={{flex:1,padding:"10px 12px",borderRadius:7,cursor:"pointer",textAlign:"center",
                  border:`2px solid ${(data.tipoArqNivel1||"Residencial")===n1?C.accent:C.border}`,
                  background:(data.tipoArqNivel1||"Residencial")===n1?C.accentLight:C.white,
                  fontWeight:700,fontSize:13,color:(data.tipoArqNivel1||"Residencial")===n1?C.accent:C.ink}}>
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
          <div style={{background:C.accentLight,border:"1px solid #F0C0C0",borderRadius:7,padding:"10px 13px",fontSize:12}}>
            <div style={{fontWeight:700,color:C.accent,marginBottom:4}}>Módulo de cálculo</div>
            <div style={{color:C.muted}}>
              {fmt(modulo)} €/m² × {fmt(parseFloat(data.superficieConstruida))} m² × {factor.toFixed(3)} (factor completo) = <b style={{color:C.ink,fontSize:13}}>{fmtE(vPreexCalc)}</b>
            </div>
            <div style={{fontSize:10,color:C.muted,marginTop:3}}>
              Factor incluye: gastos generales (13%), SS (1%), BI (6%), IVA, honorarios y tasas — según tablas 2025
            </div>
          </div>
        )}
      </Card>

      {/* CATASTRO */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Consulta Catastral</SectionLabel>
        <div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:7,padding:"10px 13px",marginBottom:12,fontSize:12,color:C.blue,lineHeight:1.6}}>
          <b>ℹ Cómo obtener los datos:</b> Abre la Sede del Catastro, busca el inmueble por la dirección del encargo e introduce los datos manualmente en los campos de abajo.
        </div>
        <a href={`https://www1.sedecatastro.gob.es/cartografia/mapa.aspx?buscar=S&del=&muni=&cp=${encodeURIComponent(enc.lugarIntervencion||"")}`}
          target="_blank" rel="noreferrer"
          style={{display:"flex",alignItems:"center",gap:8,background:C.blue,color:"#fff",borderRadius:7,
            padding:"10px 16px",fontSize:13,fontWeight:600,textDecoration:"none",marginBottom:12,justifyContent:"center"}}>
          🗺️ Abrir Catastro — buscar inmueble
        </a>
        <Inp label="Referencia Catastral" value={data.refCatastral} onChange={s("refCatastral")} placeholder="Ej: 0731107EG1303S0001UG" hint="Cópiala del Catastro (20 caracteres)"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Superficie construida (m²)" value={data.superficieConstruida} onChange={s("superficieConstruida")} type="number" hint="Del Catastro"/>
          <Inp label="Año de construcción" value={data.anoConstruccion} onChange={s("anoConstruccion")} type="number" hint="Del Catastro"/>
        </div>
      </Card>

      {/* CONTINENTE */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Continente</SectionLabel>
        {primerRiesgoDetectado&&<div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:7,padding:"9px 12px",fontSize:12,color:C.blue,marginBottom:12}}>
          <b>ℹ Continente a primer riesgo detectado en póliza.</b> El valor preexistente es igual al capital asegurado.
        </div>}
        {capCont===0&&<div style={{background:"#FEF3C7",border:"1px solid #FCD34D",borderRadius:7,padding:"10px 13px",marginBottom:12,fontSize:12,color:"#92400E",lineHeight:1.6}}>
          <b>⚠ Capital asegurado no detectado.</b> Introduce el valor manualmente desde la póliza.
        </div>}
        <EuroInput label="Capital asegurado continente (de la póliza)" value={data.capContOverride!=null?data.capContOverride:enc.capitalContinente}
          onChange={v=>onChange({...data,capContOverride:v})}
          hint="Introduce el valor que figura en la póliza"/>
        <div style={{background:infraCont>0?C.redBg:C.greenBg,border:`1px solid ${infraCont>0?"#FECACA":"#A7F3D0"}`,borderRadius:8,padding:14,marginTop:4}}>
          <div style={{fontSize:11,fontWeight:700,color:infraCont>0?C.red:C.green,marginBottom:10,textTransform:"uppercase"}}>CONTINENTE</div>
          {[["Valor Asegurado",fmtE(capCont)],["Valor Preexistente",fmtE(vPreex)],["Infraseguro",`${fmt(infraCont)} %`]].map(([k,v],i)=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${i<2?C.border:"transparent"}`,fontSize:13}}>
              <span style={{color:C.muted,fontWeight:i===2?700:400}}>{k}</span>
              <span style={{fontWeight:700,color:i===2&&infraCont>0?C.red:i===2?C.green:C.ink}}>{v}</span>
            </div>
          ))}
          {!primerRiesgoDetectado&&arqKey&&data.superficieConstruida&&(
            <div style={{fontSize:10,color:C.muted,marginTop:6}}>
              {fmt(parseFloat(data.superficieConstruida))} m² × {fmt(modulo)} €/m² × {factor.toFixed(3)} = {fmtE(vPreexCalc)} · {arqLabel}
            </div>
          )}
          {infraCont>0&&<div style={{background:C.orangeBg,border:"1px solid #FED7AA",borderRadius:6,padding:"8px 10px",marginTop:8,fontSize:11,color:C.orange}}>
            <b>⚠ Infraseguro {fmt(infraCont)}%</b> — Regla proporcional: coeficiente {(capCont/vPreex).toFixed(4)}
          </div>}
        </div>
      </Card>

      {/* CONTENIDO */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Contenido</SectionLabel>
        {capCont2===0&&<div style={{background:"#FEF3C7",border:"1px solid #FCD34D",borderRadius:7,padding:"10px 13px",marginBottom:12,fontSize:12,color:"#92400E",lineHeight:1.6}}>
          <b>⚠ Capital asegurado no detectado.</b> Introduce el valor manualmente desde la póliza.
        </div>}
        <EuroInput label="Capital asegurado contenido (de la póliza)" value={data.capCont2Override!=null?data.capCont2Override:enc.capitalContenido}
          onChange={v=>onChange({...data,capCont2Override:v})}
          hint="Introduce el valor que figura en la póliza"/>
        <div style={{marginBottom:12}}>
          <Lbl c="Valor preexistente del contenido (editable)"/>
          <div style={{fontSize:11,color:C.muted,marginBottom:6}}>Por defecto igual al capital asegurado. Puedes ajustarlo si es necesario.</div>
          <EuroInput label="" value={data.vPreexContenido!=null?data.vPreexContenido:enc.capitalContenido}
            onChange={v=>onChange({...data,vPreexContenido:v})}
            hint=""/>
        </div>
        {(()=>{
          const vPCont = data.vPreexContenido!=null?parseCap(data.vPreexContenido):capCont2;
          const infraC2 = vPCont>0&&capCont2>0&&capCont2<vPCont?((vPCont-capCont2)/vPCont*100):0;
          return (
            <div style={{background:infraC2>0?C.redBg:C.greenBg,border:`1px solid ${infraC2>0?"#FECACA":"#A7F3D0"}`,borderRadius:8,padding:14,marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,color:infraC2>0?C.red:C.green,marginBottom:10,textTransform:"uppercase"}}>CONTENIDO</div>
              {[["Valor Asegurado",fmtE(capCont2)],["Valor Preexistente",fmtE(vPCont)],["Infraseguro",`${fmt(infraC2)} %`]].map(([k,v],i)=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${i<2?C.border:"transparent"}`,fontSize:13}}>
                  <span style={{color:C.muted,fontWeight:i===2?700:400}}>{k}</span>
                  <span style={{fontWeight:700,color:i===2&&infraC2>0?C.red:i===2?C.green:C.ink}}>{v}</span>
                </div>
              ))}
            </div>
          );
        })()}
      </Card>

      {/* IA TEXTO */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Redacción IA — Sección 1</SectionLabel>
        {!data.estado&&<div style={{fontSize:11,color:C.orange,marginBottom:8}}>⚠ Rellena primero el estado general del riesgo</div>}
        <Btn primary onClick={genTexto} disabled={aiLoad||!data.superficieConstruida}>
          {aiLoad?<><Spin/>Generando…</>:<><Sparkles size={13}/>Generar texto pericial</>}
        </Btn>
        {(data.aiText||aiLoad)&&<div style={{background:C.accentLight,border:"1px solid #F0C0C0",borderRadius:8,padding:13,marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:11,fontWeight:700,color:C.accent,display:"flex",alignItems:"center",gap:5}}><Sparkles size={11}/>TEXTO IA {data.aiEdited&&<span style={{color:C.orange}}>(editado)</span>}</span>
            <div style={{display:"flex",gap:6}}>
              <Btn sm ghost onClick={genTexto} disabled={aiLoad}><RefreshCw size={10}/></Btn>
              {data.aiText&&<Btn sm outline onClick={()=>onChange({...data,aiApplied:true})}>{data.aiApplied?<><Check size={10}/>Aplicado al informe</>:<><Check size={10}/>Aplicar al informe</>}</Btn>}
            </div>
          </div>
          {aiLoad?<div style={{display:"flex",gap:8,alignItems:"center",color:C.muted,fontSize:12}}><Spin/>Generando…</div>
            :<textarea value={data.aiText||""} onChange={e=>onChange({...data,aiText:e.target.value,aiEdited:true})}
              rows={6} style={{...inpStyle(false),resize:"vertical",lineHeight:1.65,fontSize:13}}/>}
        </div>}
      </Card>

      <NavBottom onNext={onNext} nextLabel="Siguiente — Causas y Circunstancias"/>
    </div>
  );
};

// ─── SECCIÓN 2 ────────────────────────────────────────────────────────────────
const Sec2 = ({data,onChange,enc,onTokens,onNext,onPrev,onSave}) => {
  const [improving,setImproving] = useState(false);
  const [saved,setSaved]         = useState(false);
  const s = f => v => onChange({...data,[f]:v});

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

  return (
    <div className="fade">
      <SecTitle n="2" label="Causas y Circunstancias" sub="Describe el siniestro — por voz o texto. La IA adaptará el lenguaje al vocabulario pericial."/>

      <Card s={{marginBottom:14}}>
        <SectionLabel>Descripción del Siniestro</SectionLabel>
        <div style={{background:C.accentLight,border:"1px solid #F0C0C0",borderRadius:7,padding:"9px 12px",fontSize:12,color:C.accent,marginBottom:12}}>
          Habla o escribe con tus propias palabras. La IA transformará el texto al lenguaje técnico pericial.
        </div>
        {(enc.umbralViento||enc.umbralLluvia)&&<div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:7,padding:"8px 12px",fontSize:11,color:C.blue,marginBottom:10,display:"flex",gap:14,flexWrap:"wrap"}}>
          <b>Umbrales póliza:</b>{enc.umbralViento&&<span> 🌬️ Viento: <b>{enc.umbralViento} km/h</b></span>}{enc.umbralLluvia&&<span> 🌧️ Lluvia: <b>{enc.umbralLluvia} l/m²/h</b></span>}
        </div>}
        <VoiceBox value={data.textoRaw||""} onChange={s("textoRaw")}
          onImprove={improve} improving={improving}
          onApply={()=>onChange({...data,aiApplied:true})} applied={data.aiApplied}
          placeholder="Describe el siniestro: cómo ocurrió, qué daños encontraste, qué te dijeron los afectados…" rows={5}/>
      </Card>

      {data.textoAI&&(
        <Card s={{marginBottom:14}}>
          <SectionLabel>Texto Pericial — Editable</SectionLabel>
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            <Btn sm ghost onClick={improve} disabled={improving}><RefreshCw size={10}/>Regenerar</Btn>
            <Btn sm outline onClick={()=>onChange({...data,aiApplied:true})}>{data.aiApplied?<><Check size={10}/>Aplicado</>:<><Check size={10}/>Aplicar al informe</>}</Btn>
          </div>
          <textarea value={data.textoAI} onChange={e=>onChange({...data,textoAI:e.target.value,aiEdited:true})}
            rows={6} style={{...inpStyle(false),resize:"vertical",lineHeight:1.65,fontSize:13}}/>
          {data.aiEdited&&<div style={{fontSize:11,color:C.orange,marginTop:3}}>Texto editado manualmente</div>}
        </Card>
      )}


      <NavBottom onPrev={onPrev} onSave={handleSave} onNext={onNext} saved={saved}
        prevLabel="Verificación del Riesgo" nextLabel="Siguiente — Valoración de Daños"/>
    </div>
  );
};

// ─── SECCIÓN 3 ────────────────────────────────────────────────────────────────
const Sec3 = ({data,onChange,enc,onTokens,onNext,onPrev,onSave}) => {
  const [improving,setImproving] = useState(false);
  const [genLoad,setGenLoad]     = useState(false);
  const [saved,setSaved]         = useState(false);
  const facRef                   = useRef();
  const s = f => v => onChange({...data,[f]:v});

  const partidas  = data.partidas||[];
  const modoVal   = data.modoValoracion||"baremo";
  const facturas  = data.facturas||[];

  // Usa la fuente única global calcPartida
  const calc = calcPartida;
  const rowsActivas = getPartidas(data);
  const totRepos = sumRepos(rowsActivas);
  const totIVA   = sumIVA(rowsActivas);
  const totReal  = sumReal(rowsActivas);

  const updP = (i,f,v) => onChange({...data,partidas:partidas.map((p,idx)=>idx===i?{...p,[f]:v}:p)});
  const delP = i => onChange({...data,partidas:partidas.filter((_,idx)=>idx!==i)});
  const addRow = () => { const ivaDef=modoVal==="factura"?21:0; onChange({...data,partidas:[...partidas,{id:Date.now()+Math.random(),desc:"",uds:1,p:0,iva:ivaDef,depr:false,pctDepr:0,perceptor:"Asegurado 1",cobertura:true}]}); };

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
    if(!desc) return;
    setGenLoad(true);
    const baremoCtx = BAREMO.map(b=>`${b.cod}|${b.g}|${b.desc}|${b.u}|${fmt(b.p)}€`).join('\n');
    const raw = await callClaude(
      "Perito de seguros. SOLO JSON válido, sin markdown.",
      `Selecciona partidas del baremo según los daños descritos y estima cantidades razonables.
DAÑOS: ${desc}
CAUSA: ${enc.causa||""} | RIESGO: ${enc.lugarIntervencion||""}

BAREMO AXA 2025 (cod|grupo|descripción|ud|precio):
${baremoCtx}

Devuelve SOLO:
{"partidas":[{"cod":"","desc":"","uds":1,"p":0,"iva":21,"depr":false,"pctDepr":0,"perceptor":"Asegurado 1","cobertura":true}]}`,
      onTokens, 2000
    ).catch(()=>'{"partidas":[]}');
    const j = parseJSON(raw);
    if(j.partidas?.length>0){
      // Merge baremo price from BAREMO array
      const rows = j.partidas.map(p=>{
        const ref = BAREMO.find(b=>b.cod===p.cod);
        return {...p, id:Date.now()+Math.random(), p:ref?ref.p:p.p, desc:ref?ref.desc:p.desc, iva:0, depr:p.depr||false, pctDepr:p.pctDepr||0, cobertura:p.cobertura!==false};
      });
      onChange({...data,partidas:rows});
    }
    setGenLoad(false);
  };

  // ── AI: extraer tabla desde facturas/presupuestos ─────────────────────────
  const extractFromFacturas = async () => {
    if(!facturas.length) return;
    setGenLoad(true);
    const toB64 = f=>new Promise(r=>{const fr=new FileReader();fr.onload=e=>r(e.target.result.split(',')[1]);fr.readAsDataURL(f);});
    let all=[];
    for(const fac of facturas){
      if(!fac.file) continue;
      const b64 = await toB64(fac.file);
      const raw = await callClaude(
        "Extractor de facturas/presupuestos. SOLO JSON válido.",
        [{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}},
         {type:"text",text:`Extrae todas las líneas de esta factura o presupuesto. Devuelve SOLO:
{"partidas":[{"desc":"descripción","uds":1,"p":0.00,"iva":21,"depr":false,"pctDepr":0,"perceptor":"Asegurado 1","cobertura":true}]}`}],
        onTokens, 2000
      ).catch(()=>'{"partidas":[]}');
      const j = parseJSON(raw);
      if(j.partidas?.length>0) all=[...all,...j.partidas.map(p=>({...p,id:Date.now()+Math.random()}))];
    }
    if(all.length>0) onChange({...data,partidas:all});
    setGenLoad(false);
  };

  // ── Adjuntar facturas ────────────────────────────────────────────────────
  const addFactura = files => {
    const news = Array.from(files).map(f=>({id:Date.now()+Math.random(),name:f.name,size:f.size,file:f}));
    onChange({...data,facturas:[...facturas,...news]});
  };
  const delFactura = id => onChange({...data,facturas:facturas.filter(f=>f.id!==id)});

  const InpCell = ({val,onChange:oc,type="text",w=60}) => (
    <input type={type} value={val||""} onChange={e=>oc(type==="number"?+e.target.value:e.target.value)}
      style={{width:w,padding:"2px 4px",border:`1px solid ${C.border}`,borderRadius:3,fontSize:10,fontFamily:"inherit",textAlign:type==="number"?"right":"left"}}/>
  );

  return (
    <div className="fade">
      <SecTitle n="3" label="Valoración de Daños" sub="Describe los daños y la IA creará la tabla de valoración automáticamente."/>

      {/* PARÁMETROS DE GARANTÍA */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Parámetros de Garantía</SectionLabel>
        <Sel label="Tipo de garantía" value={data.tipoGarantiaVal} onChange={v=>{
          const lim=v==="Continente"?(enc.capitalContinente||"0"):v==="Contenido"?(enc.capitalContenido||"0"):"0";
          onChange({...data,tipoGarantiaVal:v,limiteGarantia:data.limiteGarantia||lim});
        }} options={TIPOS_GARANTIA}/>
        <Inp label="Concepto de garantía" value={data.conceptoGarantia} onChange={s("conceptoGarantia")}
          placeholder={enc.causa||"Fenómenos atmosféricos"} hint="Del encargo — editable"/>
        <EuroInput label="Límite de garantía (€)" value={data.limiteGarantia||enc.capitalContinente} onChange={s("limiteGarantia")}/>
        <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:14}}>
          <div>
            <Lbl c="Regla proporcional"/>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
              <input type="checkbox" checked={!!data.reglaProporcionl} onChange={e=>onChange({...data,reglaProporcionl:e.target.checked})} style={{width:16,height:16,cursor:"pointer"}}/>
              <span style={{fontSize:12,color:data.reglaProporcionl?C.orange:C.muted}}>{data.reglaProporcionl?"Activada":"Desactivada"}</span>
            </div>
          </div>
        </div>
        <EuroInput label="Franquicia (€)" value={data.franquiciaVal||enc.franquicia||"0"} onChange={s("franquiciaVal")}
          hint="De la póliza — editable"/>
      </Card>

      {/* DESCRIPCIÓN DE DAÑOS */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Descripción de los Daños</SectionLabel>
        <VoiceBox value={data.textoRaw||""} onChange={s("textoRaw")}
          onImprove={improveText} improving={improving}
          placeholder="Describe los daños encontrados en la visita pericial…" rows={4}/>
        {data.textoAI&&(
          <div style={{marginTop:10}}>
            <div style={{display:"flex",gap:6,marginBottom:6}}>
              <Btn sm ghost onClick={improveText} disabled={improving}><RefreshCw size={10}/>Regenerar</Btn>
              <Btn sm outline onClick={()=>onChange({...data,aiApplied:true})}>{data.aiApplied?<><Check size={10}/>Aplicado al informe</>:<><Check size={10}/>Aplicar al informe</>}</Btn>
            </div>
            <textarea value={data.textoAI} onChange={e=>onChange({...data,textoAI:e.target.value})}
              rows={4} style={{...inpStyle(false),resize:"vertical",lineHeight:1.65,fontSize:13}}/>
          </div>
        )}
      </Card>

      {/* MODO DE VALORACIÓN */}
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[{v:"baremo",l:"📋 Por Baremo AXA 2025"},{v:"factura",l:"🧾 Por Factura / Presupuesto"}].map(m=>(
          <button key={m.v} onClick={()=>onChange({...data,modoValoracion:m.v})}
            style={{padding:"7px 16px",borderRadius:7,border:`1.5px solid ${modoVal===m.v?C.accent:C.border}`,
              background:modoVal===m.v?C.accentLight:C.white,cursor:"pointer",fontSize:12,
              fontWeight:modoVal===m.v?700:400,color:modoVal===m.v?C.accent:C.ink,fontFamily:"inherit"}}>{m.l}
          </button>
        ))}
      </div>

      {/* FACTURAS / PRESUPUESTOS */}
      {modoVal==="factura"&&<Card s={{marginBottom:14}}>
        <SectionLabel>Facturas / Presupuestos</SectionLabel>
        <div onClick={()=>facRef.current.click()}
          style={{border:`2px dashed ${C.border}`,borderRadius:8,padding:"16px",textAlign:"center",
            cursor:"pointer",background:C.bg,marginBottom:10}}>
          <Upload size={20} style={{color:C.muted,marginBottom:6}}/>
          <div style={{fontSize:12,fontWeight:600,color:C.ink}}>Adjuntar facturas o presupuestos</div>
          <div style={{fontSize:11,color:C.muted}}>PDF · Se adjuntarán automáticamente al informe final</div>
          <input ref={facRef} type="file" multiple accept=".pdf" style={{display:"none"}}
            onChange={e=>addFactura(e.target.files)}/>
        </div>
        {facturas.map(f=>(
          <div key={f.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",
            background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:6,marginBottom:6,fontSize:12}}>
            <Receipt size={13} style={{color:C.green,flexShrink:0}}/>
            <span style={{flex:1,color:C.green,fontWeight:600}}>{f.name}</span>
            <span style={{color:C.muted,fontSize:11}}>{f.size?(f.size/1024).toFixed(0)+" KB":""}</span>
            <button onClick={()=>delFactura(f.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted}}><X size={12}/></button>
          </div>
        ))}
        {facturas.length>0&&<Btn primary full onClick={extractFromFacturas} disabled={genLoad}>
          {genLoad?<><Spin/>Extrayendo partidas…</>:<><Sparkles size={13}/>Extraer tabla desde {facturas.length} factura{facturas.length>1?"s":""}</>}
        </Btn>}
      </Card>}

      {/* TABLA DE VALORACIÓN */}
      <Card s={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <SectionLabel>{modoVal==="baremo"?"Tabla de Valoración — Baremo AXA 2025":"Tabla de Valoración — Factura/Presupuesto"}</SectionLabel>
          <div style={{display:"flex",gap:6}}>
            {modoVal==="baremo"&&<Btn sm primary onClick={genFromBaremo} disabled={genLoad||(!data.textoRaw&&!data.textoAI)}>
              {genLoad?<><Spin/>Generando…</>:<><Sparkles size={11}/>Generar tabla con IA</>}
            </Btn>}
            <Btn sm onClick={addRow}><Plus size={11}/>Fila</Btn>
          </div>
        </div>

        <div style={{fontSize:11,color:C.blue,background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:6,padding:"6px 10px",marginBottom:10}}>
          <b>Fórmula:</b> V.Real = V.Repos × (1 − Depr%) + IVA importes
        </div>

        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:10,minWidth:900}}>
            <thead><tr style={{background:C.accentLight}}>
              {["Descripción-concepto","Uds","V.Unitario €","V.Repos €","%IVA","IVA €","Depr","%Depr","V.Real €","V.Propuesto €","Perceptor","Cob.",""].map(h=>(
                <th key={h} style={{padding:"5px 5px",textAlign:h==="Descripción-concepto"||h===""?"left":"right",color:C.accent,fontWeight:700,whiteSpace:"nowrap",borderBottom:`2px solid ${C.accent}`}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {partidas.length===0&&<tr><td colSpan={13} style={{padding:20,textAlign:"center",color:C.muted,fontSize:12}}>
                {modoVal==="baremo"?"Describe los daños y pulsa «Generar tabla con IA»":"Adjunta facturas y extrae las partidas automáticamente"}
              </td></tr>}
              {partidas.map((p,i)=>{
                const {vRepos,ivaAmt,vReal}=calc(p);
                return (
                  <tr key={p.id||i} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?"transparent":C.bg}}>
                    <td style={{padding:"4px 5px",minWidth:180}}>
                      <input value={p.desc||""} onChange={e=>updP(i,"desc",e.target.value)}
                        style={{width:"100%",padding:"2px 4px",border:`1px solid ${C.border}`,borderRadius:3,fontSize:10,fontFamily:"inherit"}}/>
                    </td>
                    <td style={{padding:"3px 4px"}}><InpCell val={p.uds} onChange={v=>updP(i,"uds",v)} type="number" w={44}/></td>
                    <td style={{padding:"3px 4px"}}><InpCell val={p.p} onChange={v=>updP(i,"p",v)} type="number" w={70}/></td>
                    <td style={{padding:"4px 5px",textAlign:"right",fontWeight:600}}>{fmt(vRepos)}</td>
                    <td style={{padding:"3px 4px"}}><InpCell val={p.iva??21} onChange={v=>updP(i,"iva",v)} type="number" w={36}/></td>
                    <td style={{padding:"4px 5px",textAlign:"right"}}>{fmt(ivaAmt)}</td>
                    <td style={{padding:"3px 4px",textAlign:"center"}}>
                      <input type="checkbox" checked={!!p.depr} onChange={e=>updP(i,"depr",e.target.checked)} style={{cursor:"pointer"}}/>
                    </td>
                    <td style={{padding:"3px 4px"}}>{p.depr&&<InpCell val={p.pctDepr} onChange={v=>updP(i,"pctDepr",v)} type="number" w={36}/>}</td>
                    <td style={{padding:"4px 5px",textAlign:"right"}}>{fmt(vReal)}</td>
                    <td style={{padding:"4px 5px",textAlign:"right",fontWeight:700,color:C.green}}>{fmt(vReal)}</td>
                    <td style={{padding:"3px 4px"}}>
                      <select value={p.perceptor||"Asegurado 1"} onChange={e=>updP(i,"perceptor",e.target.value)}
                        style={{fontSize:9,border:`1px solid ${C.border}`,borderRadius:3,padding:"2px",fontFamily:"inherit"}}>
                        <option>Asegurado 1</option><option>Asegurado 2</option><option>Perjudicado 1</option><option>Perjudicado 2</option>
                      </select>
                    </td>
                    <td style={{padding:"3px 4px",textAlign:"center"}}>
                      <input type="checkbox" checked={p.cobertura!==false} onChange={e=>updP(i,"cobertura",e.target.checked)} style={{cursor:"pointer"}}/>
                    </td>
                    <td><button onClick={()=>delP(i)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,padding:"2px"}}><X size={11}/></button></td>
                  </tr>
                );
              })}
              {partidas.length>0&&<tr style={{background:C.accentLight,fontWeight:700}}>
                <td style={{padding:"6px 5px",color:C.accent,fontSize:11}}>Subtotal</td>
                <td/>
                <td/>
                <td style={{padding:"6px 5px",textAlign:"right",color:C.accent}}>{fmt(totRepos)} €</td>
                <td/>
                <td style={{padding:"6px 5px",textAlign:"right",color:C.accent}}>{fmt(totIVA)} €</td>
                <td colSpan={2}/>
                <td style={{padding:"6px 5px",textAlign:"right",color:C.accent,fontSize:12}}>{fmt(totReal)} €</td>
                <td style={{padding:"6px 5px",textAlign:"right",color:C.accent,fontSize:13}}>{fmt(totReal)} €</td>
                <td colSpan={3}/>
              </tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <NavBottom onPrev={onPrev} onSave={handleSave} onNext={onNext} saved={saved}
        prevLabel="Causas y Circunstancias" nextLabel="Siguiente — Cobertura e Indemnización"/>
    </div>
  );
};

// ─── SECCIÓN 4 ────────────────────────────────────────────────────────────────
const Sec4 = ({data,onChange,enc,s1,s3,onTokens,onNext,onPrev,onSave}) => {
  const [aiLoad,setAiLoad] = useState(false);
  const [saved,setSaved]   = useState(false);
  const s = f => v => onChange({...data,[f]:v});

  const partidas = getPartidas(s3);
  const totalDano = sumReal(partidas);
  const capCont = parseCap(enc.capitalContinente);
  const regla = calcRegla(enc, s1);
  const franq = parseCap(s3?.franquiciaVal||enc.franquicia);
  const indemn = Math.max(0,totalDano*regla-franq);

  // Auto-fill descripción cobertura from policy
  useEffect(()=>{
    if(!data.descripcionCobertura&&enc.descripciones){
      const gars = (enc.garantia||"").split(/[;, ]+/);
      const desc = gars.map(g=>enc.descripciones[g]).filter(Boolean).join("\n\n");
      if(desc) onChange({...data,descripcionCobertura:desc});
    }
  },[]);

  const genAI = async () => {
    setAiLoad(true);
    const text = await callClaude(
      "Perito de seguros. Redacta en estilo pericial, conciso y técnico. Sin título de apartado.",
      `Sección "Estudio de Cobertura-Indemnización" del informe:
CAUSA: ${enc.causa||""} · GARANTÍA: ${enc.garantia||""} · PÓLIZA: ${enc.numPoliza||""}
DAÑO VALORADO: ${fmtE(totalDano)} · REGLA PROPORCIONAL: ${regla<1?`Sí, coeficiente ${regla.toFixed(4)}`:"No aplicable"}
FRANQUICIA: ${fmtE(franq)} · INDEMNIZACIÓN: ${fmtE(indemn)}
COBERTURA PÓLIZA: ${data.descripcionCobertura||enc.garantia||""}
Analiza coberturas aplicables, posibles exclusiones y justifica la propuesta de indemnización. Sin redundancias.`,
      onTokens
    ).catch(()=>"Error.");
    onChange({...data,aiText:text,aiApplied:false});
    setAiLoad(false);
  };

  const handleSave = () => { onSave?.(); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  return (
    <div className="fade">
      <SecTitle n="4" label="Estudio de Cobertura-Indemnización" sub="Análisis de coberturas aplicables y propuesta de indemnización final"/>

      {/* DESCRIPCIÓN COBERTURA */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Descripción de la Cobertura</SectionLabel>
        <div style={{fontSize:11,color:C.muted,marginBottom:8}}>
          Texto extraído automáticamente de la póliza para la garantía afectada. Editable.
        </div>
        <Txt value={data.descripcionCobertura} onChange={s("descripcionCobertura")} rows={5}
          placeholder={enc.garantia?"Buscando cobertura para "+enc.garantia+"…":"Adjunta la póliza en el paso inicial para extraer automáticamente la descripción de la cobertura"}/>
        {!data.descripcionCobertura&&<div style={{fontSize:11,color:C.orange}}>⚠ Sin póliza adjunta — introduce manualmente la descripción de la cobertura</div>}
      </Card>

      {/* TABLA GARANTÍAS */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Resumen por Garantías</SectionLabel>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{background:C.accentLight}}>
              {["Garantía Afectada","D.con cobertura","Límite aseg.","Regla proporcional","Valor ajustado","Franquicia","Indemnización"].map(h=>(
                <th key={h} style={{padding:"7px 8px",textAlign:h==="Garantía Afectada"?"left":"right",color:C.accent,fontWeight:700,fontSize:11}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              <tr style={{borderBottom:`1px solid ${C.border}`}}>
                <td style={{padding:"8px",fontWeight:600}}>{enc.garantia||"CONTINENTE"} — {enc.causa||""}</td>
                <td style={{padding:"8px",textAlign:"right"}}>{fmtE(totalDano)}</td>
                <td style={{padding:"8px",textAlign:"right"}}>{fmtE(parseFloat(s3?.limiteGarantia||capCont))}</td>
                <td style={{padding:"8px",textAlign:"right"}}>{regla<1?`${fmt(regla*100)}%`:"NO"}</td>
                <td style={{padding:"8px",textAlign:"right",fontWeight:600}}>{fmtE(totalDano*regla)}</td>
                <td style={{padding:"8px",textAlign:"right"}}>{fmtE(franq)}</td>
                <td style={{padding:"8px",textAlign:"right",fontWeight:700,color:C.green}}>{fmtE(indemn)}</td>
              </tr>
              <tr style={{background:C.accentLight,fontWeight:700}}>
                <td style={{padding:"8px",color:C.accent}}>Total</td>
                <td style={{padding:"8px",textAlign:"right"}}>{fmtE(totalDano)}</td>
                <td/><td/>
                <td style={{padding:"8px",textAlign:"right"}}>{fmtE(totalDano*regla)}</td>
                <td/>
                <td style={{padding:"8px",textAlign:"right",color:C.accent,fontSize:14}}>{fmtE(indemn)}</td>
              </tr>
              <tr><td style={{padding:"6px 8px",fontSize:12,color:C.muted}}>Franquicia general</td><td colSpan={5}/><td style={{padding:"6px 8px",textAlign:"right",fontSize:12}}>{fmtE(franq)}</td></tr>
            </tbody>
          </table>
        </div>
        <div style={{background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:8,padding:16,marginTop:14,textAlign:"center"}}>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Total Propuesta de Indemnización</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:30,color:C.green}}>{fmtE(indemn)}</div>
        </div>
      </Card>

      {/* IA */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Redacción IA — Sección 4</SectionLabel>
        <Btn primary onClick={genAI} disabled={aiLoad} full>
          {aiLoad?<><Spin/>Generando análisis…</>:<><Sparkles size={13}/>Generar análisis de cobertura e indemnización</>}
        </Btn>
        {(data.aiText||aiLoad)&&<div style={{background:C.accentLight,border:"1px solid #F0C0C0",borderRadius:8,padding:13,marginTop:12}}>
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            <Btn sm ghost onClick={genAI} disabled={aiLoad}><RefreshCw size={10}/>Regenerar</Btn>
            <Btn sm outline onClick={()=>onChange({...data,aiApplied:true})}>{data.aiApplied?<><Check size={10}/>Aplicado</>:<><Check size={10}/>Aplicar</>}</Btn>
          </div>
          {aiLoad?<div style={{display:"flex",gap:8,alignItems:"center",color:C.muted,fontSize:12}}><Spin/>Generando…</div>
            :<textarea value={data.aiText||""} onChange={e=>onChange({...data,aiText:e.target.value})}
              rows={6} style={{...inpStyle(false),resize:"vertical",lineHeight:1.65,fontSize:13}}/>}
        </div>}
      </Card>

      <NavBottom onPrev={onPrev} onSave={handleSave} onNext={onNext} saved={saved}
        prevLabel="Valoración de Daños" nextLabel="Siguiente — Anexos"/>
    </div>
  );
};

// ─── ANEXOS ──────────────────────────────────────────────────────────────────
const SecAnexos = ({data,onChange,s3,onPrev,onSave}) => {
  const tabs = [
    {id:"fotos",    icon:Camera,     label:"Reportaje Fotográfico"},
    {id:"catastro", icon:FileImage,  label:"Info Catastral"},
    {id:"meteosim", icon:Image,      label:"Info Meteosim"},
    {id:"facturas", icon:Receipt,    label:"Facturas / Presupuestos"},
  ];
  const [tab,setTab] = useState("fotos");
  const [saved,setSaved] = useState(false);
  const fRef = useRef();
  const bucket = data[tab]||[];
  const CATS = ["Daño general","Zona afectada","Vista exterior","Vista interior","Daño específico","Estado previo","Documento"];

  const addFiles = files => {
    Promise.all(Array.from(files).map(f=>new Promise(r=>{const fr=new FileReader();fr.onload=e=>r({id:Date.now()+Math.random(),name:f.name,url:e.target.result,caption:"",cat:"Daño general"});fr.readAsDataURL(f);}))).then(news=>onChange({...data,[tab]:[...bucket,...news]}));
  };
  const updI=(id,k,v)=>onChange({...data,[tab]:bucket.map(i=>i.id===id?{...i,[k]:v}:i)});
  const delI=id=>onChange({...data,[tab]:bucket.filter(i=>i.id!==id)});
  const handleSave = () => { onSave?.(); setSaved(true); setTimeout(()=>setSaved(false),2500); };
  const total = tabs.reduce((a,t)=>a+(data[t.id]||[]).length,0);

  return (
    <div className="fade">
      <SecTitle label="Anexos" sub="Reportaje fotográfico, datos catastrales, Meteosim y facturas"/>

      <div style={{display:"flex",gap:7,marginBottom:16,flexWrap:"wrap"}}>
        {tabs.map(t=>{
          const cnt=(data[t.id]||[]).length;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 16px",
              borderRadius:7,border:`1px solid ${tab===t.id?C.accent:C.border}`,
              background:tab===t.id?C.accentLight:C.white,cursor:"pointer",fontSize:13,
              fontWeight:tab===t.id?700:400,color:tab===t.id?C.accent:C.ink,fontFamily:"inherit"}}>
              <t.icon size={13}/>{t.label}
              {cnt>0&&<span style={{background:C.accent,color:"#fff",borderRadius:"50%",width:18,height:18,fontSize:10,display:"inline-flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{cnt}</span>}
            </button>
          );
        })}
      </div>

      <div onClick={()=>fRef.current.click()} style={{border:`2px dashed ${C.border}`,borderRadius:10,padding:28,
        textAlign:"center",cursor:"pointer",background:C.bg,marginBottom:14}}>
        <Upload size={24} style={{color:C.muted,marginBottom:7}}/>
        <div style={{fontSize:13,fontWeight:600,color:C.ink}}>Arrastra archivos o haz clic para seleccionar</div>
        <div style={{fontSize:12,color:C.muted,marginTop:2}}>Imágenes y PDFs</div>
        <input ref={fRef} type="file" multiple accept="image/*,.pdf" style={{display:"none"}} onChange={e=>addFiles(e.target.files)}/>
      </div>

      {bucket.length>0
        ?<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {bucket.map(item=>(
            <div key={item.id} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:9,overflow:"hidden"}}>
              <div style={{position:"relative"}}>
                <img src={item.url} alt={item.caption} style={{width:"100%",height:120,objectFit:"cover",display:"block"}}/>
                <button onClick={()=>delI(item.id)} style={{position:"absolute",top:5,right:5,background:"rgba(0,0,0,.6)",border:"none",borderRadius:"50%",width:22,height:22,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <X size={10}/>
                </button>
              </div>
              <div style={{padding:8}}>
                {tab==="fotos"&&<select value={item.cat} onChange={e=>updI(item.id,"cat",e.target.value)}
                  style={{width:"100%",padding:"3px 6px",border:`1px solid ${C.border}`,borderRadius:4,fontSize:10,marginBottom:5,fontFamily:"inherit"}}>
                  {CATS.map(c=><option key={c}>{c}</option>)}
                </select>}
                <input value={item.caption} onChange={e=>updI(item.id,"caption",e.target.value)} placeholder="Pie de foto…"
                  style={{width:"100%",padding:"4px 6px",border:`1px solid ${C.border}`,borderRadius:4,fontSize:10,fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
            </div>
          ))}
        </div>
        :<div style={{textAlign:"center",padding:28,color:C.muted,fontSize:13}}>Sin archivos en este apartado</div>
      }

      <NavBottom onPrev={onPrev} onSave={handleSave} saved={saved}
        prevLabel="Cobertura-Indemnización" nextLabel={null}/>
    </div>
  );
};

// ─── REPORT EDITOR ────────────────────────────────────────────────────────────
// ─── EXPORT HELPERS ──────────────────────────────────────────────────────────
const fmtPDF = n => new Intl.NumberFormat('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2}).format(+n||0);

const buildWordHTML = (cData) => {
  const enc=cData.encargo||{}, s1=cData.s1||{}, s2=cData.s2||{}, s3=cData.s3||{}, s4=cData.s4||{};
  const partidas=s3.partidas||[];
  const totalDano=partidas.reduce((a,p)=>{const v=(p.uds||1)*(p.p||0);return a+v*(1-(p.depr?p.pctDepr||0:0)/100)+v*((p.iva||21)/100);},0);
  const capCont=parseFloat(enc.capitalContinente||0);
  const franq=parseFloat(s3.franquiciaVal||enc.franquicia||0);
  const prov=PROVINCIAS.find(p=>p.l===enc.provincia||p.v===enc.provincia);
  const arqKeyW=s1.tipoArqKey||'unif_aislada';
  const vRealC=enc.primerRiesgo?capCont:calcVPreexCont(s1.superficieConstruida,prov?.v||'00',arqKeyW,s1.calidad||'Media');
  const regla=!enc.primerRiesgo&&vRealC>0&&capCont>0&&capCont<vRealC?(capCont/vRealC):1;
  const indemn=Math.max(0,totalDano*regla-franq);
  const capCont2=parseFloat(enc.capitalContenido||0);
  const riesgoLines=enc.tipoEncargo==='INSTANT_PAYMENT'
    ?[s1.textoInstant||('Localización del riesgo: el riesgo está situado en '+enc.lugarIntervencion+'. Este siniestro se ha gestionado documentalmente.')]
    :[`El riesgo asegurado se corresponde con: ${s1.tipoRiesgo||'—'}.`,
      `La fecha de construcción es del año ${s1.anoConstruccion||'—'}.`,
      `Cuenta con una superficie construida de ${s1.superficieConstruida||'—'} M2 en total`,
      `Acabados son de calidad: ${s1.calidad||'—'}`,
      `El estado general del riesgo asegurado se encuentra según nuestro criterio: ${s1.estado||'—'}`,
      `Localización del riesgo: el riesgo está situado en ${enc.lugarIntervencion||'—'}`,
      `Referencia catastral del inmueble: ${s1.refCatastral||''}`];
  const rowPart=partidas.map(p=>{
    const vr=(p.uds||1)*(p.p||0);const iv=vr*((p.iva||21)/100);const vreal=vr*(1-(p.depr?p.pctDepr||0:0)/100)+iv;
    return `<tr><td>${p.desc||''}</td><td>${p.uds||1}</td><td>${fmtPDF(p.p)}</td><td>${fmtPDF(vr)}</td><td>${p.iva??21}%</td><td>${fmtPDF(iv)}</td><td>${p.depr?'SI':'NO'}</td><td>${p.depr?fmtPDF(p.pctDepr||0)+'%':'0,00'}</td><td>${fmtPDF(vreal)}</td><td>${fmtPDF(vreal)}</td><td>${p.perceptor||'Asegurado 1'}</td><td>${p.cobertura!==false?'Si':'No'}</td></tr>`;
  }).join('');
  return `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'/><title>Informe Pericial ${enc.numReferencia||''}</title>
<style>
  @page{size:A4;margin:2cm 2cm 2.5cm 2cm;}
  body{font-family:Arial,sans-serif;font-size:10pt;color:#000;margin:0}
  h1{font-size:18pt;font-style:italic;text-align:center;border-top:1px solid #9B2226;border-bottom:1px solid #9B2226;padding:6pt 0}
  h2{font-size:11pt;border-bottom:2px solid #9B2226;padding-bottom:3pt;margin-top:18pt}
  h3{font-size:10pt;margin-top:12pt}
  table{border-collapse:collapse;width:100%;font-size:8pt;margin:6pt 0}
  th{background:#9B2226;color:#fff;padding:3pt 4pt;text-align:left;font-size:7.5pt}
  td{border:1px solid #ddd;padding:3pt 4pt;vertical-align:top}
  tr:nth-child(even) td{background:#fafafa}
  .subtotal td{background:#fdf0f0;font-weight:bold;color:#9B2226;border-color:#9B2226}
  .total-box{border:2px solid #9B2226;background:#fdf0f0;padding:8pt;text-align:right;font-size:13pt;font-weight:bold;color:#9B2226;margin-top:10pt}
  .field-label{font-size:8pt;color:#666;display:block}
  .field-value{font-size:10pt;font-weight:bold;border-bottom:1px solid #ccc;padding-bottom:2pt;margin-bottom:8pt;display:block}
  .intro{font-style:italic;color:#555;font-size:9pt;margin:8pt 0;line-height:1.6}
  .header-gvp{border-bottom:1px solid #9B2226;padding-bottom:4pt;margin-bottom:10pt;display:flex;justify-content:space-between}
  .bullet{margin-left:12pt;list-style:square}
  .bullet li{margin-bottom:4pt}
  .cap-table{width:200pt;margin-left:30pt}
  .cap-table th{background:#9B2226}
  .firma-box{border:1px solid #ccc;width:150pt;height:50pt;display:inline-block}
  .page-break{page-break-before:always}
</style></head>
<body>
<div class='header-gvp'><b style='color:#9B2226'>GABINETE DE VALORACIONES PERICIALES</b><span style='color:#666'>expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h1>INFORME PERICIAL</h1>
<table style='margin-top:16pt'><tr>
  <td><span class='field-label'>Compañía</span><span class='field-value'>${enc.compania||'—'}</span></td>
  <td><span class='field-label'>Nº Referencia</span><span class='field-value'>${enc.numReferencia||'—'}</span></td>
  <td><span class='field-label'>Nº Póliza</span><span class='field-value'>${enc.numPoliza||'—'}</span></td>
</tr><tr>
  <td><span class='field-label'>Ramo</span><span class='field-value'>${enc.ramo||'—'}</span></td>
  <td><span class='field-label'>Garantía</span><span class='field-value'>${enc.garantia||'—'}</span></td>
  <td><span class='field-label'>Importe líquido siniestro</span><span class='field-value'>${fmtPDF(totalDano)} €</span></td>
</tr><tr>
  <td><span class='field-label'>Fecha Encargo</span><span class='field-value'>${enc.fechaEncargo||'—'}</span></td>
  <td><span class='field-label'>Fecha Siniestro</span><span class='field-value'>${enc.fechaSiniestro||'—'}</span></td>
  <td><span class='field-label'>Nº Exp interno</span><span class='field-value'>${enc.numExpInterno||'—'}</span></td>
</tr></table>
<p><span class='field-label'>Lugar intervención (Provincia)</span><span class='field-value'>${enc.lugarIntervencion||'—'}</span></p>
<p><span class='field-label'>Asegurado</span><span class='field-value'>${enc.asegurado||'—'}</span></p>
<table><tr><td><span class='field-label'>Perito:</span><span class='field-value'>${enc.perito||'—'}</span></td><td><span class='field-label'>Teléfono Perito:</span><span class='field-value'>${enc.telPerito||'—'}</span></td></tr></table>
<p class='intro'>Este informe pericial ha sido emitido por el perito Don ${enc.perito||'—'}, ha sido solicitado por el departamento de siniestros de la aseguradora epigrafiada anteriormente, a tenor del siniestro declarado en el riesgo asegurado con póliza suscrita por la precitada aseguradora.</p>
<p class='intro'>En cumplimiento de lo requerido, se ha procedido a la comparecencia pericial en el Riesgo Asegurado, realizando la función pericial iniciando los trabajos que nos son propios, tendentes a la determinación de las causas y circunstancias del siniestro y a la valoración de los daños consecuentes al mismo, para finalmente elevar propuesta de indemnización a las partes, a tenor de la información conocida hasta la fecha.</p>
<p class='intro'>El que suscribe en cumplimiento del artículo 335.2 de la Ley 1/2000 de Enjuiciamiento Civil, manifiesta bajo promesa de decir verdad, que ha actuado y actuará con la mayor objetividad posible, tomando en consideración tanto lo que pueda favorecer como lo que sea susceptible de causar perjuicio a cualquiera de las partes.</p>
<p class='intro'>La valoración económica sugerida, así como cualquier observación relativa a coberturas, exclusiones y/o responsabilidad del presente informe, queda supeditada en todo caso a criterio de la Compañía en base de la póliza suscrita.</p>
<div class='page-break'></div>
<div class='header-gvp'><b style='color:#9B2226'>GABINETE DE VALORACIONES PERICIALES</b><span style='color:#666'>expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h2>1. VERIFICACIÓN DEL RIESGO Y PÓLIZA.</h2>
<h3>1.1. Descripción del riesgo:</h3>
<ul class='bullet'>${riesgoLines.map(l=>`<li>${l}</li>`).join('')}</ul>
<br/>
<b>CONTINENTE / OBRAS DE REFORMA</b>
<p style='font-style:italic;font-size:9pt'>1. La preexistencia ha sido estudiada en aplicación de los precios por m², teniendo en cuenta calidad de acabados y provincia.</p>
<table class='cap-table'><tr><th colspan='2'>CONTINENTE</th></tr>
<tr><td>VALOR ASEGURADO</td><td>${fmtPDF(capCont)} €</td></tr>
<tr><td>VALOR PREEXISTENTE</td><td>${fmtPDF(vRealC)} €</td></tr>
<tr><td><b>INFRASEGURO</b></td><td><b>${fmtPDF(regla<1?((vRealC-capCont)/vRealC*100):0)} %</b></td></tr></table>
<br/>
<b>CONTENIDO:</b>
<p style='font-style:italic;font-size:9pt'>1. La preexistencia ES ESTIMADA atendiendo a los criterios de objetividad pericial.</p>
<table class='cap-table'><tr><th colspan='2'>CONTENIDO</th></tr>
<tr><td>VALOR ASEGURADO</td><td>${fmtPDF(capCont2)} €</td></tr>
<tr><td>VALOR PREEXISTENTE</td><td>${fmtPDF(capCont2)} €</td></tr>
<tr><td><b>INFRASEGURO</b></td><td><b>0,00 %</b></td></tr></table>
${s1.aiText?'<p>'+s1.aiText+'</p>':''}
<div class='page-break'></div>
<div class='header-gvp'><b style='color:#9B2226'>GABINETE DE VALORACIONES PERICIALES</b><span style='color:#666'>expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h2>2. CAUSAS Y CIRCUNSTANCIAS</h2>
<h3>2.1. Descripción del siniestro:</h3>
<p>${(s2.textoAI||s2.textoRaw||'').replace(/\n/g,'<br/>')}</p>
<div class='page-break'></div>
<div class='header-gvp'><b style='color:#9B2226'>GABINETE DE VALORACIONES PERICIALES</b><span style='color:#666'>expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h2>3. VALORACIÓN DE DAÑOS.</h2>
<p>Evaluada con arreglo a los criterios que se establecen en las condiciones de la póliza, resumimos la tasación de daños:</p>
${s3.textoAI?'<p>'+s3.textoAI+'</p>':''}
${partidas.length>0?`<h3 style='text-align:center'>${s3.conceptoGarantia||enc.garantia||'Fenómenos atmosféricos'}. ${s3.tipoGarantiaVal||'CONTINENTE'}</h3>
<table><tr><th>Descripción-concepto</th><th>Uds</th><th>V.Unit.</th><th>V.Repos.</th><th>%IVA</th><th>IVA</th><th>Depr</th><th>%Depr</th><th>V.Real</th><th>V.Prop.</th><th>Perceptor</th><th>Cob.</th></tr>
${rowPart}
<tr class='subtotal'><td>Subtotal</td><td></td><td></td><td>${fmtPDF(sumRepos(partidas))} €</td><td></td><td>${fmtPDF(sumIVA(partidas))} €</td><td></td><td></td><td>${fmtPDF(totalDano)} €</td><td>${fmtPDF(totalDano)} €</td><td></td><td></td></tr></table>`:''}
<div class='page-break'></div>
<div class='header-gvp'><b style='color:#9B2226'>GABINETE DE VALORACIONES PERICIALES</b><span style='color:#666'>expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h2>4. ESTUDIO DE COBERTURA-INDEMNIZACIÓN.</h2>
<p>${(s4.aiText||'').replace(/\n/g,'<br/>')}</p>
${partidas.length>0?`<h3 style='text-align:center'>Resumen por garantías. Propuesta de indemnización</h3>
<table><tr><th>Garantía Afectada</th><th>D. con cobertura</th><th>Límite aseg.</th><th>Regla proporcional</th><th>Valor ajustado</th><th>Franquicia</th><th>Indemnización</th></tr>
<tr><td>${s3.tipoGarantiaVal||'CONTINENTE'}.<br/>${enc.garantia||''}<br/>${enc.causa||''}</td><td>${fmtPDF(totalDano)} €</td><td>${fmtPDF(capCont)} €</td><td>${regla<1?fmtPDF(regla*100)+'%':'NO'}</td><td>${fmtPDF(totalDano*regla)} €</td><td>${fmtPDF(franq)} €</td><td>${fmtPDF(indemn)} €</td></tr>
<tr class='subtotal'><td>Total</td><td>${fmtPDF(totalDano)} €</td><td></td><td></td><td>${fmtPDF(totalDano*regla)} €</td><td></td><td>${fmtPDF(indemn)} €</td></tr>
<tr><td>Franquicia general</td><td></td><td></td><td></td><td></td><td></td><td>${fmtPDF(franq)} €</td></tr></table>
<div class='total-box'>Total propuesta de indemnización &nbsp;&nbsp;${fmtPDF(indemn)} €</div>`:''}
<br/><br/>
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
</body></html>`;
};

const exportWord = (cData) => {
  const enc=cData.encargo||{};
  const html=buildWordHTML(cData);
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
  const capC=parseCap(enc.capitalContinente), capC2=parseCap(enc.capitalContenido);
  const vRC=(enc.primerRiesgo||s1.tipoContinente==='obrasReforma'||enc.esHogar)?capC:calcVPreexCont(s1.superficieConstruida,prov?.v||'00',s1.tipoArqKey||'unif_aislada',s1.calidad||'Media');
  const reg=calcRegla(enc,s1);
  const inf=reg<1?((vRC-capC)/vRC*100):0;
  const fr=parseCap(s3.franquiciaVal||enc.franquicia);
  const ind=Math.max(0,totalDano*reg-fr);
  const today=new Date().toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'});
  const allFotos=anexos?.fotos||[];
  const allFac=[...(anexos?.facturas||[]),...(s3?.facturas||[])];

  const rowPart=partidas.map(p=>{
    const {vRepos:vr,ivaAmt:iv,vReal:vreal}=calcPartida(p);
    return `<tr><td>${p.desc||''}</td><td style="text-align:right">${p.uds||1}</td><td style="text-align:right">${fmtPDF(p.p)}</td><td style="text-align:right">${fmtPDF(vr)}</td><td style="text-align:right">${p.iva??0}%</td><td style="text-align:right">${fmtPDF(iv)}</td><td style="text-align:center">${p.depr?'SI':'NO'}</td><td style="text-align:right">${p.depr?fmtPDF(p.pctDepr||0)+'%':'0,00'}</td><td style="text-align:right">${fmtPDF(vreal)}</td><td style="text-align:right">${fmtPDF(vreal)}</td><td>${p.perceptor||'Asegurado 1'}</td><td style="text-align:center">${p.cobertura!==false?'Si':'No'}</td></tr>`;
  }).join('');

  const rLines=enc.tipoEncargo==='INSTANT_PAYMENT'
    ?[s1.textoInstant||('Localización del riesgo: el riesgo está situado en '+enc.lugarIntervencion+'. Este siniestro se ha gestionado documentalmente.')]
    :['El riesgo asegurado se corresponde con: '+(s1.tipoRiesgo||'—')+'.','La fecha de construcción es del año '+(s1.anoConstruccion||'—')+'.','Cuenta con una superficie construida de '+(s1.superficieConstruida||'—')+' M2 en total','Acabados son de calidad: '+(s1.calidad||'—'),'El estado general del riesgo asegurado se encuentra según nuestro criterio: '+(s1.estado||'—'),'Localización del riesgo: el riesgo está situado en '+(enc.lugarIntervencion||'—'),'Referencia catastral del inmueble: '+(s1.refCatastral||'')];

  const fotoImgs=allFotos.map((f,i)=>`<div style="display:inline-block;width:47%;margin:${i%2===0?'0 2% 10px 0':'0 0 10px 2%'};vertical-align:top"><img src="${f.url}" style="width:100%;height:160px;object-fit:cover;border:1px solid #ddd"/>${f.caption?'<div style="font-size:7pt;text-align:center;color:#666;margin-top:2pt">'+f.caption+'</div>':''}</div>`).join('');

  const html=`<!DOCTYPE html><html>
<head><meta charset="utf-8"/><title>Informe Pericial ${enc.numReferencia||''}</title>
<style>
  @page{size:A4;margin:20mm 20mm 25mm 20mm}
  *{box-sizing:border-box}
  body{font-family:Arial,sans-serif;font-size:9.5pt;color:#000;margin:0;line-height:1.4}
  .hdr{border-bottom:0.4pt solid #9B2226;padding-bottom:4pt;margin-bottom:10pt;display:flex;justify-content:space-between;align-items:baseline}
  .hdr-left{font-weight:bold;color:#9B2226;font-size:8pt}
  .hdr-right{font-size:8pt;color:#666}
  .ftr{position:fixed;bottom:15mm;left:20mm;right:20mm;border-top:0.3pt solid #ccc;padding-top:3pt;font-size:7pt;color:#666;text-align:center}
  h1{font-size:18pt;font-style:italic;text-align:center;border-top:0.5pt solid #9B2226;border-bottom:0.5pt solid #9B2226;padding:6pt 0;margin:20pt 0 16pt}
  h2{font-size:10.5pt;font-weight:bold;border-bottom:1.5pt solid #9B2226;padding-bottom:2pt;margin-top:18pt;margin-bottom:8pt}
  h3{font-size:9.5pt;font-weight:bold;margin:10pt 0 4pt}
  .grid3{display:table;width:100%;margin-bottom:8pt}
  .grid3-row{display:table-row}
  .grid3-cell{display:table-cell;width:33.3%;padding:0 4pt 6pt 0}
  .fl{font-size:7.5pt;color:#666;display:block;margin-bottom:1pt}
  .fv{font-size:10pt;font-weight:bold;border-bottom:0.3pt solid #ccc;padding-bottom:2pt;display:block}
  p.intro{font-style:italic;color:#555;font-size:8.5pt;margin:6pt 0;line-height:1.6}
  ul.viñetas{margin:4pt 0 4pt 12pt;padding:0}
  ul.viñetas li{margin-bottom:3pt;font-size:9.5pt}
  table.data{border-collapse:collapse;width:100%;margin:6pt 0;font-size:7.5pt}
  table.data th{background:#9B2226;color:#fff;padding:3pt 3pt;text-align:left;font-weight:bold}
  table.data td{border:0.3pt solid #ddd;padding:2.5pt 3pt;vertical-align:top}
  table.data tr:nth-child(even) td{background:#fafafa}
  table.cap{border-collapse:collapse;width:180pt;margin-left:20pt;font-size:9pt}
  table.cap th{background:#9B2226;color:#fff;padding:3pt;text-align:center}
  table.cap td{border:0.5pt solid #ccc;padding:3pt 5pt}
  .subtotal td{background:#fdf0f0!important;font-weight:bold;color:#9B2226;border-color:#9B2226!important}
  .total-box{border:1.5pt solid #9B2226;background:#fdf0f0;padding:7pt;text-align:right;font-size:12pt;font-weight:bold;color:#9B2226;margin-top:8pt}
  .page-break{page-break-before:always;margin-top:0}
  .firma-box{border:0.5pt solid #bbb;width:140pt;height:45pt;display:inline-block;margin-top:4pt}
  .firma-table{width:100%;margin-top:20pt}
  .firma-table td{vertical-align:top;font-style:italic;font-size:9pt}
  .anex-foto{display:flex;flex-wrap:wrap;gap:8pt}
  .anex-foto-item{width:calc(50% - 4pt)}
  .anex-foto-item img{width:100%;height:150pt;object-fit:cover;border:0.3pt solid #ddd}
  .anex-foto-item .cap{font-size:7pt;text-align:center;color:#666;margin-top:2pt}
  @media print{
    .hdr{position:fixed;top:0;left:0;right:0;background:white;padding:5mm 20mm 3mm}
    body{padding-top:20mm}
    .no-print{display:none}
  }
</style></head>
<body>
<div class="hdr"><span class="hdr-left">GABINETE DE VALORACIONES PERICIALES</span><span class="hdr-right">expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<div class="ftr">Avda. Josep Tarradellas, 38 · 08029 Barcelona · Teléfono: 93.118.51.38 · @: asesoria@gvperitos.es</div>
<h1>INFORME PERICIAL</h1>
<div class="grid3"><div class="grid3-row"><div class="grid3-cell"><span class="fl">Compañía</span><span class="fv">${enc.compania||'—'}</span></div><div class="grid3-cell"><span class="fl">Nº Referencia</span><span class="fv">${enc.numReferencia||'—'}</span></div><div class="grid3-cell"><span class="fl">Nº Póliza</span><span class="fv">${enc.numPoliza||'—'}</span></div></div></div>
<div class="grid3"><div class="grid3-row"><div class="grid3-cell"><span class="fl">Ramo</span><span class="fv">${enc.ramo||'—'}</span></div><div class="grid3-cell"><span class="fl">Garantía</span><span class="fv">${enc.garantia||'—'}</span></div><div class="grid3-cell"><span class="fl">Importe líquido siniestro</span><span class="fv">${fmtPDF(totalDano)} €</span></div></div></div>
<div class="grid3"><div class="grid3-row"><div class="grid3-cell"><span class="fl">Fecha Encargo</span><span class="fv">${enc.fechaEncargo||'—'}</span></div><div class="grid3-cell"><span class="fl">Fecha Siniestro</span><span class="fv">${enc.fechaSiniestro||'—'}</span></div><div class="grid3-cell"><span class="fl">Nº Exp interno</span><span class="fv">${enc.numExpInterno||'—'}</span></div></div></div>
<div style="margin-bottom:6pt"><span class="fl">Lugar intervención (Provincia)</span><span class="fv">${enc.lugarIntervencion||'—'}</span></div>
<div style="margin-bottom:6pt"><span class="fl">Asegurado</span><span class="fv">${enc.asegurado||'—'}</span></div>
<div class="grid3"><div class="grid3-row"><div class="grid3-cell"><span class="fl">Perito:</span><span class="fv">${enc.perito||'—'}</span></div><div class="grid3-cell"><span class="fl">Teléfono Perito:</span><span class="fv">${enc.telPerito||'—'}</span></div></div></div>
<p class="intro">Este informe pericial ha sido emitido por el perito Don ${enc.perito||'—'}, ha sido solicitado por el departamento de siniestros de la aseguradora epigrafiada anteriormente, a tenor del siniestro declarado en el riesgo asegurado con póliza suscrita por la precitada aseguradora.</p>
<p class="intro">En cumplimiento de lo requerido, se ha procedido a la comparecencia pericial en el Riesgo Asegurado, realizando la función pericial iniciando los trabajos que nos son propios, tendentes a la determinación de las causas y circunstancias del siniestro y a la valoración de los daños consecuentes al mismo, para finalmente elevar propuesta de indemnización a las partes.</p>
<p class="intro">El que suscribe en cumplimiento del artículo 335.2 de la Ley 1/2000 de Enjuiciamiento Civil, manifiesta bajo promesa de decir verdad, que ha actuado y actuará con la mayor objetividad posible, tomando en consideración tanto lo que pueda favorecer como lo que sea susceptible de causar perjuicio a cualquiera de las partes.</p>
<p class="intro">La valoración económica sugerida, así como cualquier observación relativa a coberturas, exclusiones y/o responsabilidad del presente informe, queda supeditada en todo caso a criterio de la Compañía en base de la póliza suscrita.</p>
<div class="page-break"></div>
<div class="hdr"><span class="hdr-left">GABINETE DE VALORACIONES PERICIALES</span><span class="hdr-right">expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h2>1.&nbsp;&nbsp;&nbsp;VERIFICACIÓN DEL RIESGO Y PÓLIZA.</h2>
<h3>1.1. Descripción del riesgo:</h3>
<ul class="viñetas">${rLines.filter(Boolean).map(l=>`<li>${l}</li>`).join('')}</ul>
<h3>Estudios de los capitales Asegurados:</h3>
<p style="font-weight:bold">CONTINENTE / OBRAS DE REFORMA</p>
<p style="font-style:italic;font-size:8.5pt">1. La preexistencia ha sido estudiada en aplicación de los precios por m², teniendo en cuenta calidad de acabados y provincia.</p>
<table class="cap"><tr><th colspan="2">CONTINENTE</th></tr><tr><td>VALOR ASEGURADO</td><td><strong>${fmtPDF(capC)} €</strong></td></tr><tr><td>VALOR PREEXISTENTE</td><td><strong>${fmtPDF(vRC)} €</strong></td></tr><tr><td><strong>INFRASEGURO</strong></td><td><strong>${fmtPDF(inf)} %</strong></td></tr></table>
<br/>
<p style="font-weight:bold">CONTENIDO:</p>
<p style="font-style:italic;font-size:8.5pt">1. La preexistencia ES ESTIMADA atendiendo a los criterios de objetividad pericial teniendo en cuenta criterios objetivos.</p>
<table class="cap"><tr><th colspan="2">CONTENIDO</th></tr><tr><td>VALOR ASEGURADO</td><td><strong>${fmtPDF(capC2)} €</strong></td></tr><tr><td>VALOR PREEXISTENTE</td><td><strong>${fmtPDF(capC2)} €</strong></td></tr><tr><td><strong>INFRASEGURO</strong></td><td><strong>0,00 %</strong></td></tr></table>
${s1.aiText?`<p style="margin-top:10pt">${s1.aiText.replace(/\n/g,'<br/>')}</p>`:''}
<div class="page-break"></div>
<div class="hdr"><span class="hdr-left">GABINETE DE VALORACIONES PERICIALES</span><span class="hdr-right">expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h2>2.&nbsp;&nbsp;&nbsp;CAUSAS Y CIRCUNSTANCIAS</h2>
<h3>2.1. Descripción del siniestro:</h3>
<p>${(s2.textoAI||s2.textoRaw||'').replace(/\n/g,'<br/>')}</p>
<div class="page-break"></div>
<div class="hdr"><span class="hdr-left">GABINETE DE VALORACIONES PERICIALES</span><span class="hdr-right">expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h2>3.&nbsp;&nbsp;&nbsp;VALORACIÓN DE DAÑOS.</h2>
<p>Evaluada con arreglo a los criterios que se establecen en las condiciones de la póliza, resumimos la tasación de daños:</p>
${s3.textoAI?`<p>${s3.textoAI.replace(/\n/g,'<br/>')}</p>`:''}
${partidas.length>0?`<h3 style="text-align:center">${s3.conceptoGarantia||enc.garantia||'Fenómenos atmosféricos'}. ${s3.tipoGarantiaVal||'CONTINENTE'}</h3>
<table class="data"><thead><tr><th>Descripción-concepto</th><th>Uds</th><th>V.Unit.</th><th>V.Repos.</th><th>%IVA</th><th>IVA</th><th>Depr</th><th>%Depr</th><th>V.Real</th><th>V.Prop.</th><th>Perceptor</th><th>Cob.</th></tr></thead><tbody>
${rowPart}
<tr class="subtotal"><td>Subtotal</td><td></td><td></td><td>${fmtPDF(sumRepos(partidas))} €</td><td></td><td>${fmtPDF(sumIVA(partidas))} €</td><td></td><td></td><td>${fmtPDF(totalDano)} €</td><td>${fmtPDF(totalDano)} €</td><td></td><td></td></tr></tbody></table>`:''}
<div class="page-break"></div>
<div class="hdr"><span class="hdr-left">GABINETE DE VALORACIONES PERICIALES</span><span class="hdr-right">expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h2>4.&nbsp;&nbsp;&nbsp;ESTUDIO DE COBERTURA-INDEMNIZACIÓN.</h2>
${s4.aiText?`<p>${s4.aiText.replace(/\n/g,'<br/>')}</p>`:''}
${partidas.length>0?`<h3 style="text-align:center">Resumen por garantías. Propuesta de indemnización</h3>
<table class="data"><thead><tr><th>Garantía Afectada</th><th>D. con cobertura</th><th>Límite aseg.</th><th>Regla proporcional</th><th>Valor ajustado</th><th>Franquicia</th><th>Indemnización</th></tr></thead><tbody>
<tr><td>${(s3.tipoGarantiaVal||'CONTINENTE')+'. '+(enc.garantia||'')+'. '+(enc.causa||'')}</td><td style="text-align:right">${fmtPDF(totalDano)} €</td><td style="text-align:right">${fmtPDF(capC)} €</td><td style="text-align:right">${reg<1?fmtPDF(reg*100)+'%':'NO'}</td><td style="text-align:right">${fmtPDF(totalDano*reg)} €</td><td style="text-align:right">${fmtPDF(fr)} €</td><td style="text-align:right"><strong>${fmtPDF(ind)} €</strong></td></tr>
<tr class="subtotal"><td>Total</td><td style="text-align:right">${fmtPDF(totalDano)} €</td><td></td><td></td><td style="text-align:right">${fmtPDF(totalDano*reg)} €</td><td></td><td style="text-align:right">${fmtPDF(ind)} €</td></tr>
<tr><td colspan="6">Franquicia general</td><td style="text-align:right">${fmtPDF(fr)} €</td></tr></tbody></table>
<div class="total-box">Total propuesta de indemnización &nbsp;&nbsp;${fmtPDF(ind)} €</div>`:''}
<br/><br/>
<p>Por nuestra parte damos por finalizada la intervención en el siniestro, quedando a su disposición ante cualquier aclaración que estimen oportuna.</p>
<p style="margin-top:12pt">En ${enc.municipio||enc.lugarIntervencion||'—'}, a ${today}</p>
<table class="firma-table"><tr>
<td style="width:50%"><p>VºBº técnico GVP</p><div class="firma-box"></div></td>
<td style="width:50%;text-align:right"><p>Perito: ${enc.perito||'—'}</p><p>Telef: ${enc.telPerito||'—'}</p><p>DNI: ${dniPerito||'—'}</p><p>Firma perito:</p><div class="firma-box"></div></td>
</tr></table>
${(anexos?.catastro?.length||anexos?.meteosim?.length||allFac.length||allFotos.length)?`
<div class="page-break"></div>
<div class="hdr"><span class="hdr-left">GABINETE DE VALORACIONES PERICIALES</span><span class="hdr-right">expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h2 style="text-align:center">Anexos.</h2>
${allFotos.length?'<p>- Reportaje fotográfico. Reportaje fotográfico</p>':''}
${anexos?.catastro?.length?'<p>- Info catastral.</p>':''}
${anexos?.meteosim?.length?'<p>- Info Meteosim.</p>':''}
${allFac.length?'<p>- Factura.</p>':''}
${allFotos.length?`<div class="page-break"></div>
<div class="hdr"><span class="hdr-left">GABINETE DE VALORACIONES PERICIALES</span><span class="hdr-right">expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h2 style="text-align:center">Reportaje fotográfico.</h2>
<div class="anex-foto">${allFotos.map(f=>`<div class="anex-foto-item"><img src="${f.url}" onerror="this.style.display='none'"/>${f.caption?`<div class="cap">${f.caption}</div>`:''}</div>`).join('')}</div>`:''}
`:''}
<script>window.onload=()=>{window.print();}</script>
</body></html>`;

  // Blob URL approach: reliable across all browsers, no document.write
  const blob = new Blob([html], {type:'text/html;charset=utf-8'});
  const url  = URL.createObjectURL(blob);
  const w    = window.open(url, '_blank');
  if(!w){
    // Popup blocked - fallback: download as HTML and let browser print it
    const a = document.createElement('a');
    a.href = url; a.download = 'informe_peritia.html';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    alert('Se ha descargado el informe como HTML. Ábrelo en el navegador y usa Ctrl+P para imprimir como PDF.');
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};


const ExportModal = ({cData, onClose, user, token, onSaveDni}) => {
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
    try{ exportPDF(cDataWithPerito(), dni); setPdfOk(true); setTimeout(()=>setPdfOk(false),3000); onSaveDni?.(dni,perito,telPerito); }
    catch(e){ setErr('Error al generar PDF. Activa las ventanas emergentes del navegador.'); console.error(e); }
  };
  const handleWord = () => {
    setWrdLoad(true); setErr('');
    try{ exportWord(cDataWithPerito()); setWrdOk(true); setTimeout(()=>setWrdOk(false),3000); }
    catch(e){ setErr('Error al generar Word.'); console.error(e); }
    setWrdLoad(false);
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:C.white,borderRadius:12,padding:30,width:420,boxShadow:'0 20px 60px rgba(0,0,0,.3)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:18,fontWeight:400,color:C.ink}}>Exportar Informe</h3>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:4}}><X size={18}/></button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
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
          <div style={{fontSize:11,color:C.muted}}>Datos del perito para el documento exportado</div>
        </div>
        {err&&<div style={{background:C.redBg,border:'1px solid #FECACA',borderRadius:7,padding:'8px 12px',fontSize:12,color:C.red,marginBottom:14}}>{err}</div>}
        <div style={{display:'flex',gap:10}}>
          <button onClick={handlePDF} disabled={wrdLoad}
            style={{flex:1,padding:'11px 0',borderRadius:8,border:'none',background:pdfLoad?'#E5E0D8':pdfOk?C.green:C.accent,color:'#fff',fontSize:13,fontWeight:700,cursor:pdfLoad||wrdLoad?'not-allowed':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:7,transition:'background .2s'}}>
            {pdfOk?<><Check size={15}/>Abierto en nueva pestaña</>:<><FileText size={15}/>Generar PDF</>}
          </button>
          <button onClick={handleWord} disabled={pdfLoad||wrdLoad}
            style={{flex:1,padding:'11px 0',borderRadius:8,border:`1.5px solid ${C.accent}`,background:wrdOk?C.green:'transparent',color:wrdOk?'#fff':C.accent,fontSize:13,fontWeight:700,cursor:pdfLoad||wrdLoad?'not-allowed':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:7,transition:'all .2s'}}>
            {wrdLoad?<><Loader2 size={15} style={{animation:'spin 1s linear infinite'}}/>Generando…</>:wrdOk?<><Check size={15}/>Word descargado</>:<><FileText size={15}/>Generar Word</>}
          </button>
        </div>
        <div style={{fontSize:11,color:C.muted,textAlign:'center',marginTop:12}}>
          PDF · fiel a la plantilla GVP &nbsp;·&nbsp; Word · editable en Microsoft Word
        </div>
      </div>
    </div>
  );
};

// ─── SECCIÓN DATOS DEL ENCARGO (editable dentro del informe) ────────────────
const SecEncargo = ({enc, onUpdate, onNext, onSave}) => {
  const [saved, setSaved] = useState(false);
  const s = f => v => onUpdate({...enc, [f]:v});
  const handleSave = () => { onSave?.(); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  return (
    <div className="fade">
      <SecTitle n="0" label="Datos del Encargo" sub="Revisa y edita los datos extraídos por la IA"/>

      <Card s={{marginBottom:12}}>
        <SectionLabel>🏢 Compañía y Siniestro</SectionLabel>
        <div style={{marginBottom:14}}>
          <Lbl c="Compañía" req/>
          <select value={COMPANIAS.find(c=>enc.compania&&enc.compania.toUpperCase().includes(c.toUpperCase()))||enc.compania||""}
            onChange={e=>s("compania")(e.target.value)}
            style={{...inpStyle(false),cursor:"pointer"}}>
            <option value="">Seleccionar…</option>
            {COMPANIAS.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Nº Referencia / Siniestro" value={enc.numReferencia} onChange={s("numReferencia")} required/>
          <Inp label="Nº Póliza" value={enc.numPoliza} onChange={s("numPoliza")}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Ramo" value={enc.ramo} onChange={s("ramo")}/>
          <Inp label="Garantía afectada" value={enc.garantia} onChange={s("garantia")}/>
        </div>
        <Inp label="Producto contratado" value={enc.productoContratado} onChange={s("productoContratado")} placeholder="Ej: Multirriesgo Empresa"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Causa" value={enc.causa} onChange={s("causa")}/>
          <Inp label="Nº Exp. Interno" value={enc.numExpInterno} onChange={s("numExpInterno")}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Fecha Encargo" value={enc.fechaEncargo} onChange={s("fechaEncargo")} placeholder="dd/mm/aaaa"/>
          <Inp label="Fecha Siniestro" value={enc.fechaSiniestro} onChange={s("fechaSiniestro")} placeholder="dd/mm/aaaa"/>
        </div>
      </Card>

      <Card s={{marginBottom:12}}>
        <SectionLabel>📍 Asegurado y Localización</SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Asegurado / Tomador" value={enc.asegurado} onChange={s("asegurado")} required/>
          <Inp label="NIF / CIF" value={enc.nifAsegurado} onChange={s("nifAsegurado")}/>
        </div>
        <Inp label="Lugar de intervención" value={enc.lugarIntervencion} onChange={s("lugarIntervencion")} required/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <Inp label="Código postal" value={enc.codigoPostal} onChange={s("codigoPostal")} placeholder="Ej: 17230"/>
          <Inp label="Municipio" value={enc.municipio} onChange={s("municipio")}/>
          <Inp label="Provincia" value={enc.provincia} onChange={s("provincia")}/>
        </div>
      </Card>

      <Card s={{marginBottom:12}}>
        <SectionLabel>💰 Capitales Asegurados {enc.polizaAdjunta&&<span style={{color:C.green,fontWeight:400,fontSize:11}}>✨ de la póliza</span>}</SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <EuroInput label="Capital Continente" value={enc.capitalContinente} onChange={s("capitalContinente")}
              hint={enc.tipoContinentePoliza?"Tipo: "+enc.tipoContinentePoliza:enc.polizaAdjunta?"Extraído de la póliza":""}/>
            {enc.todosCapitalesContinente&&<div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:5,padding:"5px 9px",fontSize:10,color:C.blue,marginTop:-10,marginBottom:8}}>
              Capitales en póliza: {enc.todosCapitalesContinente}
            </div>}
          </div>
          <EuroInput label="Capital Contenido" value={enc.capitalContenido} onChange={s("capitalContenido")}
            hint={enc.polizaAdjunta?"Extraído de la póliza":""}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <EuroInput label="Franquicia general" value={enc.franquicia} onChange={s("franquicia")} hint="0,00 € si no hay"/>
          <Inp label="Fecha efecto póliza" value={enc.fechaEfecto} onChange={s("fechaEfecto")} placeholder="dd/mm/aaaa"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
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
      </Card>

      <NavBottom onSave={handleSave} onNext={onNext} saved={saved} nextLabel="Siguiente — Verificación del Riesgo"/>
    </div>
  );
};

const ReportEditor = ({cData,onUpdate,onBack,user,token,sidebarOpen,setSidebarOpen}) => {
  const [sec,setSec]         = useState("informe");
  const [saving,setSaving]   = useState(false);
  const [exportOpen,setExportOpen]   = useState(false);
  const tokens = cData.tokenStats||{i:0,o:0};
  const costEur = ((tokens.i||0)/1e6*3+(tokens.o||0)/1e6*15)*1.08;
  const addTokens = (i,o) => onUpdate({...cData,tokenStats:{i:(tokens.i||0)+i,o:(tokens.o||0)+o}});
  const upd = (key,val) => onUpdate({...cData,[key]:val});

  const secIds = SECCIONES.map(s=>s.id);
  const curIdx = secIds.indexOf(sec);
  const goNext = () => { if(curIdx<secIds.length-1) setSec(secIds[curIdx+1]); };
  const goPrev = () => { if(curIdx>0) setSec(secIds[curIdx-1]); };

  const handleSave = () => { setSaving(true); setTimeout(()=>setSaving(false),1200); };

  const commonProps = {onNext:goNext,onPrev:goPrev,onSave:handleSave,onTokens:addTokens};

  const renderSec = () => {
    switch(sec){
      case "informe": return <SecInforme enc={cData.encargo||{}} s1={cData.s1||{}} s2={cData.s2||{}} s3={cData.s3||{}} s4={cData.s4||{}} anexos={cData.anexos||{}} onGoTo={setSec}/>;
      case "encargo": return <SecEncargo enc={cData.encargo||{}} onUpdate={enc=>onUpdate({...cData,encargo:enc})} onNext={()=>setSec("s1")} onSave={handleSave}/>;
      case "s1": return <Sec1 data={cData.s1||{}} onChange={v=>upd("s1",v)} enc={cData.encargo||{}} {...commonProps}/>;
      case "s2": return <Sec2 data={cData.s2||{}} onChange={v=>upd("s2",v)} enc={cData.encargo||{}} {...commonProps}/>;
      case "s3": return <Sec3 data={cData.s3||{}} onChange={v=>upd("s3",v)} enc={cData.encargo||{}} {...commonProps}/>;
      case "s4": return <Sec4 data={cData.s4||{}} onChange={v=>upd("s4",v)} enc={cData.encargo||{}} s1={cData.s1||{}} s3={cData.s3||{}} {...commonProps}/>;
      case "anexos": return <SecAnexos data={cData.anexos||{}} onChange={v=>upd("anexos",v)} s3={cData.s3||{}} onPrev={goPrev} onSave={handleSave}/>;
      default: return null;
    }
  };

  const doneSecs = ["s1","s2","s3","s4"].filter(k=>cData[k]&&Object.keys(cData[k]).length>2).length;

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      {/* TOP BAR */}
      <div style={{background:C.sidebar,height:50,display:"flex",alignItems:"center",padding:"0 16px",gap:12,flexShrink:0}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:6,padding:"5px 10px",cursor:"pointer",color:"rgba(255,255,255,.7)",fontSize:12,fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>
          <Home size={12}/>Inicio
        </button>
        <button onClick={()=>setSidebarOpen(v=>!v)} title={sidebarOpen?"Ocultar menú":"Mostrar menú"}
          style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer",color:"rgba(255,255,255,.7)",fontSize:12,fontFamily:"inherit",display:"flex",alignItems:"center",gap:3}}>
          {sidebarOpen?<ChevronLeft size={13}/>:<ChevronRight size={13}/>}
        </button>
        <div style={{width:1,height:22,background:"rgba(255,255,255,.1)"}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{color:"#fff",fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cData.encargo?.asegurado||"Nuevo informe"}</div>
          <div style={{color:"rgba(255,255,255,.4)",fontSize:10}}>{cData.encargo?.compania||""} · {cData.encargo?.numReferencia||""}</div>
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center",flexShrink:0}}>
          <div style={{textAlign:"right"}}>
            <div style={{color:"rgba(255,255,255,.35)",fontSize:9,textTransform:"uppercase",letterSpacing:".06em"}}>Consumo IA</div>
            <div style={{color:"rgba(255,255,255,.75)",fontSize:11,fontWeight:600}}>{((tokens.i||0)+(tokens.o||0)).toLocaleString("es-ES")} tokens · {costEur.toFixed(4)} €</div>
          </div>
          <div style={{background:"rgba(15,123,77,.3)",borderRadius:5,padding:"4px 10px",color:"rgba(255,255,255,.75)",fontSize:11,display:"flex",alignItems:"center",gap:4}}>
            <Check size={10}/>{doneSecs}/4
          </div>
          <button onClick={()=>setExportOpen(true)}
            style={{background:"rgba(155,34,38,.8)",border:"none",borderRadius:7,padding:"6px 14px",cursor:"pointer",color:"#fff",fontSize:12,fontWeight:700,fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
            <FileText size={13}/>Exportar
          </button>
        </div>
      </div>

      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        {/* SIDEBAR */}
        <div style={{width:sidebarOpen?216:0,background:C.sidebar,display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto",paddingTop:sidebarOpen?6:0,overflow:"hidden",transition:"width .2s ease"}}>
          {sidebarOpen&&<>
          {SECCIONES.map(item=>{
            const Icon=item.icon;
            const isActive=sec===item.id;
            const isDone=(()=>{
              if(item.id==="s1") return !!(cData.s1?.superficieConstruida||cData.s1?.textoInstant);
              if(item.id==="s2") return !!(cData.s2?.textoAI||cData.s2?.textoRaw);
              if(item.id==="s3") return !!(cData.s3?.partidas?.length>0||cData.s3?.pLibres?.length>0);
              if(item.id==="s4") return !!(cData.s4?.aiText);
              if(item.id==="anexos"){
                const a=cData.anexos||{};
                return !!(a.fotos?.length||a.catastro?.length||a.meteosim?.length||a.facturas?.length||(cData.s3?.facturas?.length));
              }
              return false;
            })();
            return (
              <div key={item.id} onClick={()=>setSec(item.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 13px",cursor:"pointer",
                borderLeft:`3px solid ${isActive?C.accent:"transparent"}`,background:isActive?"rgba(155,34,38,.2)":"transparent",marginBottom:1}}>
                <div style={{width:23,height:23,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                  background:isActive?C.accent:isDone?"rgba(15,123,77,.3)":"rgba(255,255,255,.08)"}}>
                  {isDone&&!isActive?<Check size={11} style={{color:"#6EE7B7"}}/>:<Icon size={11} style={{color:isActive?"#fff":"rgba(255,255,255,.45)"}}/>}
                </div>
                <span style={{fontSize:12,fontWeight:isActive?600:400,color:isActive?"#fff":"rgba(255,255,255,.5)",lineHeight:1.3}}>{item.label}</span>
              </div>
            );
          })}
          <div style={{height:12}}/>
          </>}
        </div>

        {/* CONTENT — single column, max width for readability */}
        <div style={{flex:1,overflowY:"auto",background:C.bg,display:"flex",justifyContent:"center"}}>
          <div style={{width:"100%",maxWidth:760,padding:"28px 28px 48px"}}>
            {renderSec()}
          </div>
        </div>
      </div>

      {exportOpen&&<ExportModal cData={cData} onClose={()=>setExportOpen(false)} user={user} token={token} onSaveDni={async (dni,perito,telPerito)=>{ if(token&&user?.id) await sbDb(`perfiles?id=eq.${user.id}`,"PATCH",{dni},token); onUpdate({...cData,encargo:{...cData.encargo,perito,telPerito,dniPerito:dni}}); }}/>}
      <link rel="stylesheet" href={FONT}/>
      <style>{css}</style>
    </div>
  );
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App(){
  const [user,setUser]   = useState(null);
  const [token,setToken] = useState(null);
  const [view,setView]   = useState("dashboard");
  const [cases,setCases] = useState([]);
  const [active,setActive] = useState(null);
  const [sbLoading,setSbLoading]   = useState(false);
  const [sidebarOpen,setSidebarOpen] = useState(true);
  const sbSaveTimer = useRef(null);

  // Cargar informes del usuario desde Supabase
  const loadCases = async (tk) => {
    setSbLoading(true);
    const rows = await sbDb('informes?select=*&order=created_at.desc', 'GET', null, tk);
    if(rows) setCases(rows.map(r=>({id:r.id,_sbId:r.id,encargo:r.encargo||{},s1:r.s1||{},s2:r.s2||{},s3:r.s3||{},s4:r.s4||{},anexos:r.anexos||{},tokenStats:{i:0,o:0},estado:r.estado})));
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

  const saveToSb = (u) => {
    if(!u._sbId||!token) return;
    sbDb(`informes?id=eq.${u._sbId}`, 'PATCH', {
      encargo:u.encargo||{}, s1:u.s1||{}, s2:u.s2||{}, s3:u.s3||{}, s4:u.s4||{},
      anexos:u.anexos||{}, estado:u.estado||'borrador',
      num_referencia:u.encargo?.numReferencia||'',
      compania:u.encargo?.compania||'', asegurado:u.encargo?.asegurado||''
    }, token);
  };

  const updateCase = u => {
    setActive(u); setCases(p=>p.map(c=>c.id===u.id?u:c));
    if(u._sbId&&token){
      clearTimeout(sbSaveTimer.current);
      sbSaveTimer.current = setTimeout(() => saveToSb(u), 5000);
    }
  };

  const deleteCase = async id => {
    const cas = cases.find(c=>c.id===id);
    if(cas?._sbId&&token) await sbDb(`informes?id=eq.${cas._sbId}`,'DELETE',null,token);
    setCases(p=>p.filter(c=>c.id!==id));
    if(active?.id===id){ setActive(null); setView('dashboard'); }
  };

  if(!user) return <LoginScreen onAuth={handleAuth}/>;
  if(view==="upload") return <UploadEncargo onDone={handleDone} onCancel={()=>setView("dashboard")} onTokens={()=>{}}/>;
  if(view==="editor"&&active) return <ReportEditor cData={active} onUpdate={updateCase} onBack={()=>setView("dashboard")} user={user} token={token} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>;
  return <>
    <Dashboard cases={cases} onNew={()=>setView("upload")} onOpen={openCase} onDelete={deleteCase} user={user} onSignOut={handleSignOut} loading={sbLoading} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
    <link rel="stylesheet" href={FONT}/>
    <style>{css}</style>
  </>;
}

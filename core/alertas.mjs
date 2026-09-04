// ─────────────────────────────────────────────────────────────────────────────
// Avisos: cuando un número calculado es tan raro que casi seguro es un error
// Núcleo puro: sin React, sin red, sin acceso a base de datos. Se puede
// ejecutar y testear con `node --test`.
// ─────────────────────────────────────────────────────────────────────────────
import { fmt, fmtE } from './formato.mjs';
import { calcReglas } from './calculo.mjs';

// Por encima de este porcentaje, un infraseguro deja de ser plausible.
//
// De dónde sale el número: en un expediente real (ver tests/caso-real-01) la
// app calculó un infraseguro del 99,89 % y propuso 0,52 € donde el perito
// propuso 463,59 €. La causa era que el capital estaba asegurado a primer
// riesgo y esa casilla no se había marcado. Un asegurado puede estar
// realmente infrasegurado un 60 % o un 80 %; por encima del 90 % lo normal es
// que falte un dato, no que el riesgo esté así de mal asegurado.
//
// Es un aviso, nunca un bloqueo: si el perito confirma que el infraseguro es
// real, sigue adelante igual.
export const UMBRAL_INFRASEGURO_SOSPECHOSO = 90;

export const infraseguroSospechoso = infra => (+infra || 0) >= UMBRAL_INFRASEGURO_SOSPECHOSO;

// Devuelve el aviso, o null si el infraseguro es plausible. El texto vive aquí
// y no en la interfaz para que se pueda probar igual que cualquier cálculo.
export const avisoInfraseguro = ({ bloque = "continente", infra = 0, capital = 0, preexistente = 0 } = {}) => {
  if (!infraseguroSospechoso(infra)) return null;
  const esContinente = bloque !== "contenido";
  return {
    bloque,
    infra: +infra || 0,
    titulo: `Infraseguro del ${fmt(infra)} % en ${esContinente ? "continente" : "contenido"} — revísalo antes de seguir`,
    detalle: "Un infraseguro tan alto casi siempre significa que falta un dato, no que el riesgo esté realmente así de mal asegurado. Con este coeficiente la indemnización propuesta se desploma.",
    motivos: esContinente
      ? [
          "¿La póliza asegura este capital a PRIMER RIESGO? Es la causa más frecuente. Si lo es, marca la casilla: el valor preexistente pasa a ser el propio capital y el infraseguro desaparece.",
          `¿El capital asegurado se ha leído bien de la póliza? Ahora consta ${fmtE(capital)}.`,
          `¿La superficie construida y el tipo de edificio son los correctos? De ahí sale el valor preexistente de ${fmtE(preexistente)}.`,
        ]
      : [
          `¿El capital de contenido se ha leído bien de la póliza? Ahora consta ${fmtE(capital)}.`,
          `¿El valor preexistente estimado del contenido es correcto? Ahora consta ${fmtE(preexistente)}.`,
        ],
  };
};

// Todos los avisos del riesgo, a partir del encargo y de la sección 1.
export const avisosDelRiesgo = (enc, s1) => {
  const r = calcReglas(enc, s1);
  return [
    avisoInfraseguro({ bloque: "continente", infra: r.infraCont, capital: r.capCont, preexistente: r.vPreexCont }),
    avisoInfraseguro({ bloque: "contenido", infra: r.infraContenido, capital: r.capCont2, preexistente: r.vPreexContenido }),
  ].filter(Boolean);
};

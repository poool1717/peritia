// ─────────────────────────────────────────────────────────────────────────────
// Escrituras que llegan tarde al expediente
//
// Capa de dominio pura: sin React. Se prueba en tests/escrituraTardia.test.js.
//
// Una subida a Storage o una llamada a la IA terminan segundos después de
// empezar. Cuando terminan, su resultado debe aplicarse:
//   - sobre el expediente MÁS RECIENTE, no sobre la copia del momento en que
//     empezaron (si no, se pisan los cambios hechos mientras tanto);
//   - solo mientras el editor sigue abierto (si no, la pantalla saltaría a un
//     expediente que el perito ya cerró);
//   - y solo si sigue siendo EL MISMO expediente en el que empezaron. Si el
//     perito ha pasado a otro, el resultado de la factura del expediente A no
//     puede acabar dentro del expediente B.
//
// Devuelve el expediente nuevo, o null si la escritura debe descartarse. `fn`
// solo se ejecuta si la escritura se aplica: quien llama puede usarlo para
// saber qué se aplicó de verdad (ver adjuntarUrlsSubidas en facturas.js).
//
// Límite conocido: el expediente recién creado cambia de identificador al
// guardarse por primera vez en la base de datos (de "local_…" al definitivo),
// alrededor de un segundo después de abrirse. Una escritura que empiece en ese
// segundo y termine después se descarta. Se prefiere descartar a arriesgar
// escribir en el expediente equivocado.
// ─────────────────────────────────────────────────────────────────────────────
export const aplicarEscrituraTardia = ({ actual, idOrigen, editorAbierto, clave, fn }) => {
  if (!editorAbierto) return null;
  if (!actual || actual.id == null || actual.id !== idOrigen) return null;
  return { ...actual, [clave]: fn(actual[clave] || {}) };
};

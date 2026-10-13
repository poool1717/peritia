// ─────────────────────────────────────────────────────────────────────────────
// Tabla de partidas propuesta por la IA en la Sección 3 (P-28)
//
// Capa de dominio pura: sin React ni red. Se prueba en tests/tablaIA.test.js.
//
// "Extraer tabla" (facturas/presupuestos) y "Generar tabla" (baremo) tardan
// segundos. Mientras, la tabla sigue siendo editable. Antes, al volver la IA,
// la tabla se sustituía siempre: lo que el perito había corregido durante la
// espera se perdía sin aviso.
//
// Ahora, al pulsar el botón se toma la huella de la tabla. Al volver la IA:
//   - si la tabla no ha cambiado → se sustituye, como siempre;
//   - si ha cambiado → NO se toca: se conservan los cambios del perito, la
//     propuesta de la IA queda en la trazabilidad (I-10) marcada como no
//     aplicada, y se avisa de que puede volver a pulsar para sustituirla.
//
// No se mezclan la tabla de la IA y la del perito: eso es una decisión de
// producto pendiente (P-28 en docs/OPEN_QUESTIONS.md).
// ─────────────────────────────────────────────────────────────────────────────
import { anadirExtraccion, CAMPOS_PARTIDA } from "./trazabilidadIA.js";

// Huella del contenido de la tabla: qué partidas hay, en qué orden y con qué
// valores. Si el perito cambia algo y lo deja como estaba, la huella es la
// misma: no se ha perdido nada y la tabla de la IA se puede aplicar.
export const huellaTabla = partidas =>
  JSON.stringify((partidas || []).map(p => [p?.id ?? null, ...CAMPOS_PARTIDA.map(c => p?.[c] ?? null)]));

// Aplica (o no) la tabla de la IA sobre el estado más reciente de la Sección 3.
// Devuelve { s3, aplicada }.
export const aplicarTablaIA = ({ s3, huellaAntes, partidas, registro }) => {
  const base = s3 || {};
  const aplicada = huellaTabla(base.partidas) === huellaAntes;
  const trazaIA = anadirExtraccion(base.trazaIA, { ...registro, aplicada });
  return aplicada
    ? { s3: { ...base, partidas, trazaIA }, aplicada }
    : { s3: { ...base, trazaIA }, aplicada };
};

const BOTON = { facturas: "Extraer tabla", baremo: "Generar tabla de valoración" };

// Aviso cuando la tabla no se ha sustituido. `extra`: otros avisos de la misma
// operación (facturas perdidas o demasiado grandes).
export const avisoTablaNoSustituida = (tipo, extra = "") => ({
  tipo: "aviso",
  texto: `La tabla no se ha sustituido porque la modificaste mientras la IA trabajaba. Tus cambios se conservan. Si quieres sustituirla por la propuesta de la IA, pulsa de nuevo «${BOTON[tipo] || "Extraer tabla"}».${extra ? " " + extra : ""}`,
});

// Mensaje que ve el perito al terminar la operación. `aplicada`:
//   true      → el mensaje normal de la operación (puede ser null)
//   false     → aviso de que la tabla no se ha sustituido
//   undefined → la escritura se descartó (otro expediente o editor cerrado):
//               no hay nada que decir en esta pantalla
export const mensajeTrasTablaIA = ({ aplicada, tipo, mensajeNormal = null, extra = "" }) =>
  aplicada === false ? avisoTablaNoSustituida(tipo, extra) : aplicada === true ? mensajeNormal : null;

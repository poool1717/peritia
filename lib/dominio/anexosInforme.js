// ─────────────────────────────────────────────────────────────────────────────
// Documentos (facturas y presupuestos) en los anexos del informe — E7
//
// Capa de dominio pura: sin React ni red. Se prueba en tests/anexosInforme.test.js.
//
// En el informe de prueba los dos presupuestos (PDF) salían en el PDF como
// páginas en blanco: se insertaban con un <iframe>, y la impresión del
// navegador no pinta el contenido de un PDF dentro de un iframe. En Word salía
// "[Documento adjunto: …]", que da a entender que su contenido está incluido.
// Cada documento ocupaba además una página propia.
//
// Lo que se puede reproducir dentro del informe (imágenes) se sigue
// reproduciendo, una por página. Lo que no (PDF, o un documento cuyo archivo
// ya no existe) se cita en una lista con su estado, sin páginas vacías.
//
// No se quitan duplicados: dos documentos con el mismo nombre pueden ser dos
// archivos distintos. Solo se avisa al perito para que lo revise.
// ─────────────────────────────────────────────────────────────────────────────

import { facturaPerdida } from "./facturas.js";

export const ESTADO_DOC = {
  IMAGEN: "imagen",           // se reproduce en el informe
  NO_REPRODUCIBLE: "pdf",     // existe, pero su contenido no se puede incrustar (PDF u otro formato)
  NO_DISPONIBLE: "no_disponible", // no hay archivo: se perdió o no se llegó a guardar
};

const esPdf = d => !!(
  String(d?.type || "").toLowerCase().includes("pdf")
  || String(d?.url || "").startsWith("data:application/pdf")
  || /\.pdf$/i.test(String(d?.name || ""))
);
const esImagen = d => !!(
  String(d?.type || "").toLowerCase().startsWith("image/")
  || String(d?.url || "").startsWith("data:image/")
  || /\.(png|jpe?g|gif|webp|bmp)$/i.test(String(d?.name || ""))
);

export const estadoDocumento = d => {
  if (!d?.url || d?.perdida) return ESTADO_DOC.NO_DISPONIBLE;
  if (esPdf(d)) return ESTADO_DOC.NO_REPRODUCIBLE;
  // Sin tipo ni extensión reconocible se trata como imagen, que es lo único
  // que acepta la subida además de PDF (accept="image/*,.pdf").
  if (esImagen(d) || (!d?.type && !/\.[a-z0-9]{2,5}$/i.test(String(d?.name || "")))) return ESTADO_DOC.IMAGEN;
  return ESTADO_DOC.NO_REPRODUCIBLE;
};

// Lista numerada ("Presupuesto 1", "Presupuesto 2"…) con el estado de cada
// documento y, si comparte nombre y tamaño (o la misma dirección) con otro
// anterior, el número de ese otro.
export const clasificarDocumentos = (docs = []) => {
  const out = [];
  (docs || []).forEach((d, i) => {
    const previo = out.find(o =>
      (o.url && d?.url && o.url === d.url)
      || (o.name && o.name === d?.name && o.size != null && o.size === d?.size));
    out.push({ ...d, numero: i + 1, estado: estadoDocumento(d), duplicadoDe: previo ? previo.numero : null });
  });
  return out;
};

// Frase que acompaña a un documento que no se reproduce en el informe.
export const notaDocumento = d => d.estado === ESTADO_DOC.NO_DISPONIBLE
  ? "documento no disponible: el archivo no se conserva en el expediente"
  : "documento PDF que consta en el expediente; su contenido no se reproduce en este informe";

// E4. ¿Consta algún presupuesto o factura aportado (con archivo)? Se usa para
// no escribir "a la espera de presupuestos o facturas" cuando ya están, ni
// "en base al presupuesto aportado" cuando no hay ninguno.
export const hayDocumentosAportados = (anexos = {}, s3 = {}) =>
  [...(anexos?.facturas || []), ...(anexos?.presupuestos || []), ...(s3?.facturas || [])]
    .some(d => d && !facturaPerdida(d));

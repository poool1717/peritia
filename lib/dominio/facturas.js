// ─────────────────────────────────────────────────────────────────────────────
// Facturas y presupuestos adjuntados en la Sección 3
//
// Capa de dominio pura: sin React, sin red. Se prueba en tests/facturas.test.js.
//
// DT-13. Hasta la sesión 29 estas facturas vivían solo en la memoria del
// navegador, como objetos `File`. Al guardar el expediente en la base de
// datos, un `File` se convierte en `{}` y el documento se pierde. Peor: al
// exportar después de recargar, el código tomaba ese `{}` por un archivo
// (un objeto vacío es "verdadero" en JavaScript), intentaba abrirlo y la
// exportación a PDF/Word fallaba entera.
//
// Ahora cada factura se sube a Storage al adjuntarla y se guarda su `url`.
// Estas funciones deciden, para cada factura, de dónde sale su contenido:
//   1. su `url` en Storage, si la tiene (lo normal desde la sesión 29);
//   2. el archivo en memoria, si se acaba de adjuntar y aún está ahí;
//   3. ninguno: la factura está PERDIDA (se guardó antes de la sesión 29, o
//      la subida falló y luego se recargó la página). Hay que decírselo al
//      perito para que la vuelva a adjuntar; nunca tratarla como si estuviera.
// ─────────────────────────────────────────────────────────────────────────────

// Un archivo de verdad, no el `{}` que queda de un `File` tras guardar y
// recargar. Se comprueba el tipo, no si "existe", porque `{}` existe.
export const tieneArchivoEnMemoria = f =>
  typeof Blob !== "undefined" && f?.file instanceof Blob;

export const facturaPerdida = f => !f?.url && !tieneArchivoEnMemoria(f);

// Cómo se presenta una factura de la Sección 3 en la exportación.
// `crearUrl` es URL.createObjectURL en el navegador; se inyecta para poder
// probar sin navegador. Nunca se llama con algo que no sea un Blob.
export const facturaSec3ParaExportar = (f, tipo, crearUrl) => {
  const enMemoria = tieneArchivoEnMemoria(f);
  const url = f?.url || (enMemoria ? crearUrl(f.file) : null);
  return {
    ...f,
    tipo,
    type: f?.type || (enMemoria ? f.file.type : "") || "",
    url,
    perdida: !url,
  };
};

// Para la extracción por IA: cómo conseguir el contenido de cada factura.
// Devuelve { disponibles: [{factura, fuente: "memoria"|"url"}], perdidas: [factura] }.
// Separa las perdidas en vez de saltárselas en silencio: antes, una factura
// sin archivo se ignoraba y el perito leía "No se encontraron líneas", un
// mensaje falso.
export const fuentesDeFacturas = facturas => {
  const disponibles = [], perdidas = [];
  for (const f of facturas || []) {
    if (tieneArchivoEnMemoria(f)) disponibles.push({ factura: f, fuente: "memoria" });
    else if (f?.url) disponibles.push({ factura: f, fuente: "url" });
    else perdidas.push(f);
  }
  return { disponibles, perdidas };
};

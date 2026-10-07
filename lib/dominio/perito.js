// ─────────────────────────────────────────────────────────────────────────────
// Datos del perito que firma el informe (I-2)
//
// Capa de dominio pura: sin React ni red. Se prueba en tests/perito.test.js.
//
// Antes el nombre y el teléfono del perito se extraían del PDF del encargo.
// En los encargos reales de AXA ese campo trae el gabinete ("GABINETE DE
// VALORACIONES PERICIA", recortado) y ningún teléfono del perito, así que el
// informe podía decir "emitido por el perito Don GABINETE DE VALORACIONES…".
//
// Ahora salen del perfil del perito (tabla `perfiles`: nombre, telefono, dni,
// que ya existían). Al exportar, el perito los confirma y se guardan:
//   - en su perfil, para los siguientes informes;
//   - en el expediente (encargo.perito / telPerito / dniPerito), como
//     constancia de quién firmó ese informe.
// ─────────────────────────────────────────────────────────────────────────────

const limpio = v => String(v ?? "").trim();

// Datos con los que se abre la ventana de exportación: los del perfil.
// Nunca los del encargo, que vienen de la extracción del PDF.
export const peritoDesdePerfil = (perfil = {}) => ({
  nombre: limpio(perfil?.nombre),
  telefono: limpio(perfil?.telefono),
  dni: limpio(perfil?.dni),
});

// Qué columnas del perfil hay que actualizar tras exportar. Vacío = nada.
export const cambiosPerfil = (perfil = {}, datos = {}) => {
  const antes = peritoDesdePerfil(perfil), ahora = peritoDesdePerfil(datos);
  const patch = {};
  for (const k of ["nombre", "telefono", "dni"]) if (ahora[k] !== antes[k]) patch[k] = ahora[k];
  return patch;
};

// Constancia en el expediente de quién firmó el informe exportado. Son los
// campos que leen las plantillas de Word y PDF.
export const firmarEncargo = (encargo = {}, datos = {}) => {
  const d = peritoDesdePerfil(datos);
  return { ...encargo, perito: d.nombre, telPerito: d.telefono, dniPerito: d.dni };
};

// La extracción del encargo ya no pide el perito, pero si la IA lo devuelve
// igualmente no se guarda: no es un dato del encargo.
export const sinDatosDePerito = (extraido = {}) => {
  const { perito, telPerito, ...resto } = extraido || {};
  return resto;
};

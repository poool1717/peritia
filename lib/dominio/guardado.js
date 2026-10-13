// ─────────────────────────────────────────────────────────────────────────────
// Guardado de un expediente en la base de datos (C-3)
//
// Sin React y sin red: la red se inyecta (`crear`, `actualizar`). Se prueba en
// tests/guardado.test.js.
//
// Problema que resuelve. Un expediente nuevo se abre al momento en el editor
// con un id local ("local_…") y se crea en la base de datos en segundo plano.
// Antes:
//   - si esa creación fallaba, el expediente se quedaba sin id de base de datos
//     y el autoguardado no volvía a intentarlo NUNCA, sin ningún aviso: el
//     perito podía trabajar una hora en algo que desaparecía al recargar;
//   - si salía bien, el expediente abierto se sustituía por la copia del
//     momento de crearlo, así que lo hecho mientras tanto (por ejemplo, una
//     factura adjuntada) se perdía, y el cambio de id hacía descartar las
//     subidas y respuestas de IA que estaban en curso.
//
// Ahora el expediente conserva su id local toda la sesión y solo gana `_sbId`
// cuando de verdad existe en la base de datos. Cada intento de guardado de un
// expediente sin `_sbId` vuelve a intentar crearlo.
// ─────────────────────────────────────────────────────────────────────────────

// Columnas de la tabla `informes` a partir del expediente en memoria.
export const filaInforme = caso => ({
  encargo: caso?.encargo || {}, s1: caso?.s1 || {}, s2: caso?.s2 || {}, s3: caso?.s3 || {}, s4: caso?.s4 || {},
  anexos: caso?.anexos || {}, estado: caso?.estado || "borrador",
  num_referencia: caso?.encargo?.numReferencia || "",
  compania: caso?.encargo?.compania || "", asegurado: caso?.encargo?.asegurado || "",
});

// Devuelve `guardar(caso)` → Promise<{ ok, sbId }>.
//   crear(fila)            → Promise<id | null>   (null o rechazo = fallo)
//   actualizar(sbId, fila) → Promise<boolean>     (false o rechazo = fallo)
//
// Si llegan varios guardados de un expediente que todavía se está creando, se
// crea UNA sola vez y los demás guardan sus datos (más recientes) encima.
// Una creación fallida no se recuerda: el siguiente guardado la reintenta.
export const crearGuardador = ({ crear, actualizar }) => {
  const creaciones = new Map(); // id local → Promise<sbId | null>
  const actualizarSeguro = (sbId, fila) => Promise.resolve().then(() => actualizar(sbId, fila)).then(r => !!r, () => false);

  return async caso => {
    if (!caso || caso.id == null) return { ok: false, sbId: null };
    if (caso._sbId) return { ok: await actualizarSeguro(caso._sbId, filaInforme(caso)), sbId: caso._sbId };

    let propia = false;
    if (!creaciones.has(caso.id)) {
      propia = true;
      creaciones.set(caso.id, Promise.resolve().then(() => crear(filaInforme(caso))).then(id => id || null, () => null));
    }
    const sbId = await creaciones.get(caso.id);
    if (!sbId) {
      creaciones.delete(caso.id); // que el próximo intento vuelva a crear
      return { ok: false, sbId: null };
    }
    // Quien esperó a una creación ajena trae datos más recientes que los de
    // la fila con la que se creó: se guardan encima.
    if (!propia) return { ok: await actualizarSeguro(sbId, filaInforme(caso)), sbId };
    return { ok: true, sbId };
  };
};

// Marca como guardado el expediente abierto, sin pisar lo que el perito haya
// hecho mientras se creaba. Solo toca el expediente con ese id local.
export const marcarPersistido = (caso, idLocal, sbId) =>
  caso && caso.id === idLocal && sbId ? { ...caso, _sbId: sbId } : caso;

// Proxy de datos meteorológicos XEMA (Servei Meteorològic de Catalunya).
// Usa los datos abiertos de la Generalitat de Catalunya (Socrata) — gratis, sin clave de pago.
//   - Estaciones (metadatos + coordenadas): yqwd-vj5e
//   - Datos medidos semihorarios:            nzvn-apee
// Geocodificación de la dirección: Nominatim (OpenStreetMap).
//
// Flujo: dirección -> coordenadas -> estación XEMA más cercana -> lecturas del día
//        -> resumen (racha máx, viento medio, lluvia máx/hora, lluvia total).

export const config = { api: { bodyParser: { sizeLimit: '1mb' } }, maxDuration: 30 };

const SOCRATA = 'https://analisi.transparenciacatalunya.cat/resource';
const DS_ESTACIONS = 'yqwd-vj5e';
const DS_MESURADES = 'nzvn-apee';

// Códigos de variable XEMA (estándar del Servei Meteorològic de Catalunya)
const VAR_VENT_MITJA = '30';  // Velocitat del vent a 10 m (mitjana) — m/s
const VAR_PRECIP     = '35';  // Precipitació — mm (= l/m²)
const VAR_RATXA      = '50';  // Ratxa màxima del vent a 10 m — m/s
const VAR_TEMP       = '32';  // Temperatura — ºC
const VAR_HUMITAT    = '33';  // Humitat relativa — %

// Cache de estaciones en memoria (se conserva mientras la lambda está caliente)
let _estacionsCache = null;
let _estacionsTs = 0;

const fetchJSON = async (url, opts = {}, ms = 12000) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { ...opts, signal: ctrl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally { clearTimeout(t); }
};

const toRad = d => d * Math.PI / 180;
const haversineKm = (la1, lo1, la2, lo2) => {
  const dLa = toRad(la2 - la1), dLo = toRad(lo2 - lo1);
  const a = Math.sin(dLa / 2) ** 2 + Math.cos(toRad(la1)) * Math.cos(toRad(la2)) * Math.sin(dLo / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
const r1 = n => Math.round(n * 10) / 10;

// Captura de un mapa estático (estación XEMA + lugar del siniestro) — servicio público sin clave,
// basado en teselas OpenStreetMap. Si no está disponible, se omite sin bloquear la consulta meteo.
const capturaMapa = async (lat1, lng1, lat2, lng2) => {
  const dist = haversineKm(lat1, lng1, lat2, lng2);
  const zoom = dist < 2 ? 14 : dist < 5 ? 13 : dist < 10 ? 12 : dist < 20 ? 11 : dist < 40 ? 10 : 9;
  const centerLat = (lat1 + lat2) / 2, centerLng = (lng1 + lng2) / 2;
  const url = `https://staticmap.openstreetmap.de/staticmap.php?center=${centerLat},${centerLng}&zoom=${zoom}&size=900x650&maptype=mapnik` +
    `&markers=${lat1},${lng1},red-pushpin|${lat2},${lng2},lightblue1`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) return null;
    const ct = r.headers.get('content-type') || '';
    if (!ct.includes('image')) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    return `data:image/png;base64,${buf.toString('base64')}`;
  } catch { return null; }
  finally { clearTimeout(t); }
};

// "DD/MM/AAAA" -> "AAAA-MM-DD" (o null si no es válida)
const parseFecha = f => {
  const m = (f || '').match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (!m) return null;
  let [, d, mo, y] = m;
  if (y.length === 2) y = '20' + y;
  const yyyy = +y, mm = +mo, dd = +d;
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
};

// ¿La ubicación cae dentro del ámbito de la red XEMA (Catalunya)?
const esCatalunya = (cp, provincia) => {
  const cp2 = (cp || '').replace(/\D/g, '').slice(0, 2);
  const p = (provincia || '').toLowerCase();
  return ['08', '17', '25', '43'].includes(cp2) ||
    /barcelona|girona|gerona|lleida|l[eé]rida|tarragona|catalu/.test(p);
};

const geocodificar = async (q) => {
  // 1) Nominatim (OpenStreetMap)
  const nom = await fetchJSON(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=es&q=${encodeURIComponent(q)}`,
    { headers: { 'User-Agent': 'PeritIA/1.0 (informes periciales)' } }
  ).catch(() => null);
  if (Array.isArray(nom) && nom.length && nom[0].lat) {
    return { lat: parseFloat(nom[0].lat), lng: parseFloat(nom[0].lon) };
  }
  // 2) Photon (komoot) — más permisivo desde servidores
  const ph = await fetchJSON(
    `https://photon.komoot.io/api/?limit=1&lang=default&q=${encodeURIComponent(q)}`
  ).catch(() => null);
  const c = ph?.features?.[0]?.geometry?.coordinates;
  if (Array.isArray(c) && c.length === 2) return { lat: c[1], lng: c[0] };
  return null;
};

const getEstacions = async () => {
  if (_estacionsCache && Date.now() - _estacionsTs < 6 * 3600 * 1000) return _estacionsCache;
  // Sin $select: se evita un 400 por nombre de columna y se leen los campos de forma defensiva.
  const arr = await fetchJSON(`${SOCRATA}/${DS_ESTACIONS}.json?$limit=2000`);
  const list = (arr || [])
    .map(s => ({
      codi: s.codi_estacio || s.codi || '',
      nom: s.nom_estacio || s.nom || '',
      lat: parseFloat(s.latitud), lng: parseFloat(s.longitud),
      municipi: s.nom_municipi || s.municipi || '',
      comarca: s.nom_comarca || s.comarca || '',
      baixa: s.data_baixa || s.data_baixa_ema || '',
    }))
    .filter(s => s.codi && !s.baixa && !isNaN(s.lat) && !isNaN(s.lng));
  _estacionsCache = list; _estacionsTs = Date.now();
  return list;
};

// Resumen de las lecturas de un día para una estación
const resumirDia = async (codi, fecha) => {
  const sel = encodeURIComponent('codi_variable,data_lectura,valor_lectura');
  const where = encodeURIComponent(`codi_estacio='${codi}' AND data_lectura between '${fecha}T00:00:00' and '${fecha}T23:59:59'`);
  const url = `${SOCRATA}/${DS_MESURADES}.json?$select=${sel}&$where=${where}&$order=data_lectura&$limit=5000`;
  const rows = await fetchJSON(url).catch(() => []);
  if (!rows || !rows.length) return null;

  const vMitja = [], vRatxa = [], temps = [], humitats = [], precipPorHora = {};
  let precipTotal = 0, ratxaHora = null, ratxaMax = -1, nVent = 0, nPrecip = 0;

  for (const r of rows) {
    const val = parseFloat(r.valor_lectura);
    if (isNaN(val)) continue;
    const cv = String(r.codi_variable);
    if (cv === VAR_VENT_MITJA) { vMitja.push(val); nVent++; }
    else if (cv === VAR_RATXA) {
      vRatxa.push(val); nVent++;
      if (val > ratxaMax) { ratxaMax = val; ratxaHora = (r.data_lectura || '').slice(11, 16); }
    }
    else if (cv === VAR_PRECIP) {
      precipTotal += val; nPrecip++;
      const h = (r.data_lectura || '').slice(0, 13); // agrupa por hora natural
      precipPorHora[h] = (precipPorHora[h] || 0) + val;
    }
    else if (cv === VAR_TEMP) temps.push(val);
    else if (cv === VAR_HUMITAT) humitats.push(val);
  }
  if (nVent === 0 && nPrecip === 0) return null;

  const msToKmh = v => v * 3.6;
  const maxRatxa = vRatxa.length ? Math.max(...vRatxa) : 0;
  const maxMitja = vMitja.length ? Math.max(...vMitja) : 0;
  const precipMaxHoraria = Object.values(precipPorHora).length ? Math.max(...Object.values(precipPorHora)) : 0;

  return {
    rachaMax: r1(msToKmh(maxRatxa)),
    rachaHora: ratxaHora || '',
    vientoMedioMax: r1(msToKmh(maxMitja)),
    precipTotal: r1(precipTotal),
    precipMaxHoraria: r1(precipMaxHoraria),
    tempMax: temps.length ? r1(Math.max(...temps)) : null,
    tempMin: temps.length ? r1(Math.min(...temps)) : null,
    humitatMax: humitats.length ? r1(Math.max(...humitats)) : null,
    tieneVent: nVent > 0,
    tienePrecip: nPrecip > 0,
  };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  try {
    const { direccion = '', municipio = '', provincia = '', cp = '', fecha = '' } = req.body || {};

    const fechaISO = parseFecha(fecha);
    if (!fechaISO) return res.status(200).json({ ok: false, error: 'Falta la fecha del siniestro o no es válida (formato dd/mm/aaaa).' });

    if (!esCatalunya(cp, provincia)) {
      return res.status(200).json({ ok: false, error: 'La consulta automática XEMA solo cubre Catalunya. Para esta ubicación, adjunta el informe meteorológico manualmente.' });
    }

    // 1) Dirección -> coordenadas
    const consultas = [
      [direccion, cp, municipio, provincia].filter(Boolean).join(', '),
      [municipio, provincia].filter(Boolean).join(', '),
      [cp, 'España'].filter(Boolean).join(' '),
    ].filter(Boolean);
    let punto = null;
    for (const q of consultas) { punto = await geocodificar(q + ', España'); if (punto) break; }

    const estacions = await getEstacions();
    if (!estacions.length) return res.status(200).json({ ok: false, error: 'No se pudo obtener la lista de estaciones XEMA.' });

    // Si no se pudo geocodificar, intenta centrar en una estación del mismo municipio
    if (!punto) {
      const muni = municipio.toLowerCase().trim();
      const enMuni = muni && estacions.find(s => {
        const m = s.municipi.toLowerCase();
        return m === muni || m.includes(muni) || muni.includes(m);
      });
      if (enMuni) punto = { lat: enMuni.lat, lng: enMuni.lng };
    }
    if (!punto) return res.status(200).json({ ok: false, error: 'No se pudo localizar la dirección. Revisa el lugar de intervención o el código postal.' });

    // 2) Estaciones ordenadas por cercanía
    const ordenadas = estacions
      .map(s => ({ ...s, dist: haversineKm(punto.lat, punto.lng, s.lat, s.lng) }))
      .sort((a, b) => a.dist - b.dist);

    // 3) Primera estación (de las más cercanas) con lecturas ese día
    let elegida = null, resumen = null;
    for (const s of ordenadas.slice(0, 6)) {
      const r = await resumirDia(s.codi, fechaISO);
      if (r) { elegida = s; resumen = r; break; }
    }
    if (!resumen) {
      return res.status(200).json({ ok: false, error: `Ninguna estación cercana tiene datos registrados para el ${fecha}. Es posible que la fecha sea demasiado reciente o las estaciones estuvieran sin servicio.` });
    }

    const imagen = await capturaMapa(elegida.lat, elegida.lng, punto.lat, punto.lng);

    return res.status(200).json({
      ok: true,
      estacio: elegida.nom,
      codiEstacio: elegida.codi,
      municipiEstacio: elegida.municipi,
      comarca: elegida.comarca,
      distanciaKm: r1(elegida.dist),
      fecha,
      ...resumen,
      imagen,
      fuente: "Servei Meteorològic de Catalunya — XEMA (dades obertes)",
      consultadoEl: new Date().toISOString().slice(0, 10),
    });
  } catch (err) {
    console.error('[meteocat] Exception:', err.message);
    return res.status(200).json({ ok: false, error: 'Error al consultar los datos meteorológicos: ' + err.message });
  }
}

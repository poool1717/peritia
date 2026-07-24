// Proxy de consulta catastral (Sede Electrónica del Catastro — Dirección General del Catastro).
// Servicios web oficiales, públicos y gratuitos (sin API key):
//   - OVCCoordenadas · Consulta_RCCOOR: coordenadas -> referencia catastral
//   - OVCCallejero · Consulta_DNPRC: referencia catastral -> datos del inmueble (superficie, año, uso)
//   - WMS Cartografía: imagen PNG de la parcela (captura de la cartografía catastral)
// Geocodificación de la dirección: Nominatim / Photon (mismo patrón que pages/api/meteocat.js).
//
// Solo cubre España (ámbito del Catastro; País Vasco y Navarra tienen catastro foral propio
// y no responden a este servicio — se devuelve el error tal cual lo indique el Catastro).

export const config = { api: { bodyParser: { sizeLimit: '1mb' } }, maxDuration: 30 };

const CATASTRO_BASE = 'https://ovc.catastro.meh.es';
const WMS_URL = `${CATASTRO_BASE}/Cartografia/WMS/ServidorWMS.aspx`;

const fetchText = async (url, ms = 12000) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'PeritIA/1.0 (informes periciales)' } });
    const txt = await r.text();
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return txt;
  } finally { clearTimeout(t); }
};

const fetchJSON = async (url, ms = 12000) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'PeritIA/1.0 (informes periciales)' } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally { clearTimeout(t); }
};

// Extrae el contenido de la primera etiqueta <tag>...</tag> de un XML (tolerante, sin dependencias).
const xmlTag = (xml, tag) => {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i'));
  return m ? m[1].trim() : '';
};

const geocodificar = async (q) => {
  const nom = await fetchJSON(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=es&q=${encodeURIComponent(q)}`
  ).catch(() => null);
  if (Array.isArray(nom) && nom.length && nom[0].lat) {
    return { lat: parseFloat(nom[0].lat), lng: parseFloat(nom[0].lon) };
  }
  const ph = await fetchJSON(
    `https://photon.komoot.io/api/?limit=1&lang=default&q=${encodeURIComponent(q)}`
  ).catch(() => null);
  const c = ph?.features?.[0]?.geometry?.coordinates;
  if (Array.isArray(c) && c.length === 2) return { lat: c[1], lng: c[0] };
  return null;
};

// Coordenadas (lat/lng, EPSG:4326) -> referencia catastral más próxima
const consultaRCCOOR = async (lat, lng) => {
  const url = `${CATASTRO_BASE}/ovcservweb/OVCSWLocalizacionRC/OVCCoordenadas.asmx/Consulta_RCCOOR?SRS=EPSG:4326&Coordenada_X=${lng}&Coordenada_Y=${lat}`;
  const xml = await fetchText(url).catch(() => '');
  if (!xml) return { ok: false, error: 'No se pudo contactar con el servicio de coordenadas del Catastro.' };
  const errDes = xmlTag(xml, 'des');
  const pc1 = xmlTag(xml, 'pc1'), pc2 = xmlTag(xml, 'pc2');
  if (!pc1 || !pc2) {
    return { ok: false, error: errDes || 'El Catastro no encontró ninguna parcela en esas coordenadas (fuera de ámbito o dirección imprecisa).' };
  }
  return { ok: true, refCatastral: pc1 + pc2 };
};

// Referencia catastral -> datos del inmueble (superficie construida, año, uso, dirección catastral)
const consultaDNPRC = async (rc) => {
  const url = `${CATASTRO_BASE}/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.asmx/Consulta_DNPRC?Provincia=&Municipio=&RC=${encodeURIComponent(rc)}`;
  const xml = await fetchText(url).catch(() => '');
  if (!xml) return { ok: false };
  const errDes = xmlTag(xml, 'des');
  const sfc = xmlTag(xml, 'sfc'); // superficie construida (m²)
  const ant = xmlTag(xml, 'ant'); // año de construcción / antigüedad
  const luso = xmlTag(xml, 'luso'); // uso principal
  if (!sfc && !ant && !luso) return { ok: false, error: errDes || '' };
  return { ok: true, superficie: sfc ? parseInt(sfc, 10) : null, anoConstruccion: ant || null, uso: luso || null };
};

// Captura de la cartografía catastral (imagen PNG) centrada en el punto, como base64
const capturaWMS = async (lat, lng) => {
  const d = 0.0012; // ~130 m de radio aprox., a escala de parcela
  const bbox = [lat - d, lng - d, lat + d, lng + d].join(',');
  const url = `${WMS_URL}?service=WMS&version=1.3.0&request=GetMap&layers=Catastro&styles=&crs=EPSG:4326&bbox=${bbox}&width=900&height=650&format=image/png`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) return null;
    const ct = r.headers.get('content-type') || '';
    if (!ct.includes('image')) return null; // el WMS devuelve XML de error como texto si algo falla
    const buf = Buffer.from(await r.arrayBuffer());
    return `data:image/png;base64,${buf.toString('base64')}`;
  } catch { return null; }
  finally { clearTimeout(t); }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  try {
    const { direccion = '', municipio = '', provincia = '', cp = '' } = req.body || {};
    if (!direccion && !municipio) {
      return res.status(200).json({ ok: false, error: 'Falta la dirección del lugar de intervención en los Datos del Encargo.' });
    }

    const consultas = [
      [direccion, cp, municipio, provincia].filter(Boolean).join(', '),
      [municipio, provincia].filter(Boolean).join(', '),
    ].filter(Boolean);
    let punto = null;
    for (const q of consultas) { punto = await geocodificar(q + ', España'); if (punto) break; }
    if (!punto) {
      return res.status(200).json({ ok: false, error: 'No se pudo localizar la dirección. Revisa el lugar de intervención en Datos del Encargo.' });
    }

    const rccoor = await consultaRCCOOR(punto.lat, punto.lng);
    if (!rccoor.ok) {
      // Aun sin referencia catastral, se intenta al menos la captura de la cartografía por coordenadas.
      const imagen = await capturaWMS(punto.lat, punto.lng);
      return res.status(200).json({ ok: false, error: rccoor.error, imagen: imagen || null });
    }

    const datos = await consultaDNPRC(rccoor.refCatastral).catch(() => ({ ok: false }));
    const imagen = await capturaWMS(punto.lat, punto.lng);

    return res.status(200).json({
      ok: true,
      refCatastral: rccoor.refCatastral,
      superficie: datos.ok ? datos.superficie : null,
      anoConstruccion: datos.ok ? datos.anoConstruccion : null,
      uso: datos.ok ? datos.uso : null,
      imagen: imagen || null,
      fuente: 'Sede Electrónica del Catastro (ovc.catastro.meh.es)',
    });
  } catch (err) {
    console.error('[catastro] Exception:', err.message);
    return res.status(200).json({ ok: false, error: 'Error al consultar el Catastro: ' + err.message });
  }
}

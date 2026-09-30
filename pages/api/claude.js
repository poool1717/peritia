export const config = {
  api: {
    bodyParser: { sizeLimit: '20mb' },
    responseLimit: false,
  },
  maxDuration: 60,
};

// Supabase: URL y clave pública (anon). Son los mismos valores que ya usa el
// frontend; no son secretos. Se pueden sobrescribir con variables de entorno.
const SB_URL = process.env.SUPABASE_URL || 'https://yrulaaxdusvmzohugmnc.supabase.co';
const SB_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlydWxhYXhkdXN2bXpvaHVnbW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NzQyMTUsImV4cCI6MjA5NjE1MDIxNX0.TOS0mgr0TdHxlC_kMhqOya_WNWyt2KTEn356USWKQFw';

// Precio por millón de tokens (USD), tarifa estándar de Anthropic.
// Si se cambia de modelo, añadir aquí su precio.
const PRECIOS = {
  'claude-sonnet-4-6': { in: 3, out: 15 },
};
const PRECIO_DEFECTO = PRECIOS['claude-sonnet-4-6'];

const sbHeaders = token => ({
  'Content-Type': 'application/json',
  apikey: SB_KEY,
  Authorization: `Bearer ${token}`,
});

const fail = (res, status, type, message) => res.status(status).json({ error: { type, message } });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.ANTHROPIC_API_KEY) {
    return fail(res, 500, 'config_error', 'ANTHROPIC_API_KEY no configurada en Vercel');
  }

  // ── 1. Solo usuarios con sesión iniciada ───────────────────────────────────
  // Antes el proxy atendía a cualquiera que conociera la URL, a costa de los
  // créditos de Anthropic. Ahora se valida el token de Supabase del usuario.
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return fail(res, 401, 'auth_error', 'Inicia sesión para usar la IA.');

  let userId;
  try {
    const u = await fetch(`${SB_URL}/auth/v1/user`, { headers: sbHeaders(token) });
    if (!u.ok) return fail(res, 401, 'auth_error', 'Tu sesión ha caducado. Vuelve a iniciar sesión.');
    userId = (await u.json())?.id;
    if (!userId) return fail(res, 401, 'auth_error', 'Tu sesión ha caducado. Vuelve a iniciar sesión.');
  } catch (e) {
    console.error('[proxy] auth check failed:', e.message);
    return fail(res, 503, 'auth_error', 'No se pudo comprobar la sesión. Inténtalo de nuevo.');
  }

  // ── 2. Peritos bloqueados desde el panel de administración ─────────────────
  // Si la migración del admin aún no está aplicada, la función no existe y se
  // deja pasar (mismo comportamiento que antes, pero ya con sesión obligatoria).
  try {
    const c = await fetch(`${SB_URL}/rest/v1/rpc/mi_cuenta`, {
      method: 'POST', headers: sbHeaders(token), body: '{}',
    });
    if (c.ok) {
      const cuenta = await c.json();
      if (cuenta?.bloqueado) {
        return fail(res, 403, 'blocked', 'Tu cuenta está desactivada. Contacta con PERIT.IA.');
      }
    }
  } catch (e) {
    console.error('[proxy] mi_cuenta failed:', e.message);
  }

  try {
    const { _seccion, ...rest } = req.body || {};
    const body = { ...rest };
    const seccion = typeof _seccion === 'string' ? _seccion.slice(0, 40) : 'otros';

    // Ensure required fields are always present
    if (!body.model || body.model.includes('20250514')) body.model = 'claude-sonnet-4-6';
    if (!body.max_tokens) body.max_tokens = 1500;
    if (!body.messages || !body.messages.length) {
      return res.status(400).json({ error: { message: 'messages array is required' } });
    }

    const hasPDF = JSON.stringify(body).includes('"application/pdf"');
    console.log(`[proxy] user=${userId} seccion=${seccion} model=${body.model} max_tokens=${body.max_tokens} hasPDF=${hasPDF}`);

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    };
    if (hasPDF) headers['anthropic-beta'] = 'pdfs-2024-09-25';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message || JSON.stringify(data).slice(0, 300);
      console.error(`[proxy] Anthropic ${response.status}:`, errMsg);
      return res.status(response.status).json(data);
    }

    const inTok = data.usage?.input_tokens || 0;
    const outTok = data.usage?.output_tokens || 0;
    console.log(`[proxy] OK tokens=${inTok}/${outTok}`);

    // ── 3. Registro del coste para el panel de administración ────────────────
    // Se guarda con el token del propio usuario (la tabla solo le deja
    // insertar filas a su nombre). Un fallo aquí nunca bloquea la respuesta.
    const precio = PRECIOS[body.model] || PRECIO_DEFECTO;
    const costeUsd = (inTok * precio.in + outTok * precio.out) / 1e6;
    try {
      const r = await fetch(`${SB_URL}/rest/v1/uso_ia`, {
        method: 'POST',
        headers: { ...sbHeaders(token), Prefer: 'return=minimal' },
        body: JSON.stringify({
          user_id: userId, seccion, modelo: body.model,
          input_tokens: inTok, output_tokens: outTok, coste_usd: +costeUsd.toFixed(6),
        }),
      });
      if (!r.ok) console.error('[proxy] uso_ia insert', r.status, (await r.text()).slice(0, 200));
    } catch (e) {
      console.error('[proxy] uso_ia insert failed:', e.message);
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error('[proxy] Exception:', err.message);
    return res.status(500).json({ error: { type: 'proxy_error', message: err.message } });
  }
}

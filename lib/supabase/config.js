// ─────────────────────────────────────────────────────────────────────────────
// ¿A qué base de datos se conecta este despliegue?
//
// Una sola respuesta para toda la aplicación: la usan el frontend
// (components/Peritia.jsx) y el proxy de IA (pages/api/claude.js). Antes la
// misma regla estaba escrita dos veces y se desincronizó: el frontend de la
// rama `test` iniciaba sesión en la base de pruebas y el proxy comprobaba esa
// sesión contra la de producción, así que toda llamada a la IA fallaba con
// "Tu sesión ha caducado".
//
// Función pura: no lee `process.env` por su cuenta. En el navegador Next.js
// solo sustituye las variables si se escriben literalmente
// (`process.env.NEXT_PUBLIC_X`), así que quien llama le pasa los valores.
// Se prueba en tests/supabase-config.test.js.
// ─────────────────────────────────────────────────────────────────────────────

// Proyecto de producción. La clave `anon` es pública por diseño: la protección
// real de los datos es RLS. El riesgo nunca fue que se viera, sino que un
// despliegue de pruebas escribiera aquí sin darse cuenta (DT-02).
export const SB_URL_PROD = "https://yrulaaxdusvmzohugmnc.supabase.co";
export const SB_KEY_PROD = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlydWxhYXhkdXN2bXpvaHVnbW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NzQyMTUsImV4cCI6MjA5NjE1MDIxNX0.TOS0mgr0TdHxlC_kMhqOya_WNWyt2KTEn356USWKQFw";

// DT-02. La caída a producción cuando faltan las variables solo se permite en
// el despliegue de producción de Vercel y en desarrollo local. En un preview
// (la rama `test`, cualquier rama de trabajo) sin variables no hay base de
// datos: mejor que la app se plante y lo diga que corromper datos reales.
export const resolverSupabase = ({ url, key, vercelEnv } = {}) => {
  const esPreview = vercelEnv === "preview";
  const u = url || (esPreview ? "" : SB_URL_PROD);
  const k = key || (esPreview ? "" : SB_KEY_PROD);
  const sinBD = !u || !k;
  return {
    url: u,
    key: k,
    sinBD,
    // Verdadero cuando NO se apunta a producción. Se deduce de la propia URL,
    // así el aviso "ENTORNO DE PRUEBAS" no puede desincronizarse.
    esTest: !sinBD && u !== SB_URL_PROD,
  };
};

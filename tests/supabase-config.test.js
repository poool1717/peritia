import { describe, it, expect } from "vitest";
import { resolverSupabase, SB_URL_PROD, SB_KEY_PROD } from "../lib/supabase/config.js";

const URL_TEST = "https://yvconlqtetxvyzxkhxib.supabase.co";
const KEY_TEST = "clave-anon-de-test";

describe("resolverSupabase — a qué base se conecta cada despliegue", () => {
  it("en producción sin variables usa la base de producción", () => {
    const r = resolverSupabase({ vercelEnv: "production" });
    expect(r.url).toBe(SB_URL_PROD);
    expect(r.key).toBe(SB_KEY_PROD);
    expect(r.sinBD).toBe(false);
    expect(r.esTest).toBe(false);
  });

  it("en desarrollo local sin variables también usa producción", () => {
    const r = resolverSupabase({});
    expect(r.url).toBe(SB_URL_PROD);
    expect(r.sinBD).toBe(false);
  });

  it("aguanta que no le pasen nada", () => {
    expect(resolverSupabase().url).toBe(SB_URL_PROD);
  });

  // DT-02: esto es lo que evita que la rama `test` escriba en producción.
  it("en un preview sin variables NO cae a producción: no hay base", () => {
    const r = resolverSupabase({ vercelEnv: "preview" });
    expect(r.url).toBe("");
    expect(r.sinBD).toBe(true);
    expect(r.esTest).toBe(false);
  });

  it("un preview con solo la URL y sin clave tampoco se conecta", () => {
    expect(resolverSupabase({ url: URL_TEST, vercelEnv: "preview" }).sinBD).toBe(true);
  });

  it("en un preview con las variables de test usa la base de test", () => {
    const r = resolverSupabase({ url: URL_TEST, key: KEY_TEST, vercelEnv: "preview" });
    expect(r.url).toBe(URL_TEST);
    expect(r.key).toBe(KEY_TEST);
    expect(r.sinBD).toBe(false);
    expect(r.esTest).toBe(true);
  });

  it("las variables explícitas mandan siempre, también en producción", () => {
    const r = resolverSupabase({ url: URL_TEST, key: KEY_TEST, vercelEnv: "production" });
    expect(r.url).toBe(URL_TEST);
    expect(r.esTest).toBe(true);
  });
});

// Regresión del 30 de septiembre de 2026. El proxy de IA leía `SUPABASE_URL`
// y el frontend `NEXT_PUBLIC_SUPABASE_URL`. En la rama `test` solo existía la
// segunda: el frontend iniciaba sesión en la base de test y el proxy validaba
// esa sesión contra producción → 401 en cada llamada a la IA.
//
// Aquí se reproduce cómo construye cada uno sus entradas a partir del mismo
// entorno, y se exige que lleguen a la misma base.
describe("frontend y proxy eligen siempre la misma base", () => {
  const frontend = env => resolverSupabase({
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    key: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    vercelEnv: env.NEXT_PUBLIC_VERCEL_ENV,
  });
  const proxy = env => resolverSupabase({
    url: env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL,
    key: env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    vercelEnv: env.VERCEL_ENV || env.NEXT_PUBLIC_VERCEL_ENV,
  });

  const entornos = {
    "rama test (preview con variables de test)": {
      NEXT_PUBLIC_SUPABASE_URL: URL_TEST, NEXT_PUBLIC_SUPABASE_ANON_KEY: KEY_TEST,
      VERCEL_ENV: "preview", NEXT_PUBLIC_VERCEL_ENV: "preview",
    },
    "producción sin variables": { VERCEL_ENV: "production", NEXT_PUBLIC_VERCEL_ENV: "production" },
    "preview mal configurado, sin variables": { VERCEL_ENV: "preview", NEXT_PUBLIC_VERCEL_ENV: "preview" },
    "desarrollo local": {},
  };

  for (const [nombre, env] of Object.entries(entornos)) {
    it(nombre, () => {
      expect(proxy(env).url).toBe(frontend(env).url);
      expect(proxy(env).sinBD).toBe(frontend(env).sinBD);
    });
  }
});

import { defineConfig } from "vitest/config";

// Configuración mínima de Fase 0 (Sprint 4 — Foundation Refactor).
//
// Se importa components/Peritia.jsx directamente para probar sus funciones
// puras exportadas (motor de cálculo, utilidades). El archivo usa JSX sin
// `import React` explícito porque Next.js lo compila con el runtime
// automático de React 17+. Vitest 4 transforma con oxc por defecto y ya
// reconoce el runtime automático sin configuración adicional — verificado:
// el módulo completo (con sus ~40 componentes JSX) importa y se ejecuta sin
// error bajo esta configuración.
//
// entorno "node": ninguna de las funciones bajo test toca window/document
// (verificado en components/Peritia.jsx: sin referencias a window/document
// en ámbito de módulo, solo dentro de cuerpos de función que no se invocan
// en estos tests).
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.{js,jsx}"],
    coverage: {
      provider: "v8",
      include: ["components/Peritia.jsx"],
      reporter: ["text", "text-summary"],
    },
  },
});

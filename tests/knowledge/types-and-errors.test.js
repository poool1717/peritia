import { describe, it, expect } from "vitest";
import { KU_TYPES, KU_TYPE_FOLDERS, KU_FOLDER_TYPES, ESTADOS, CONFIANZA, FUENTE_TIPOS } from "../../lib/knowledge/types.js";
import {
  KnowledgeError, InvalidIdentifierError, SchemaValidationError,
  NotFoundError, DuplicateIdentifierError, AmbiguousReferenceError,
} from "../../lib/knowledge/errors.js";

describe("types.js — taxonomía cerrada", () => {
  it("tiene los 22 tipos documentados en KNOWLEDGE_ARCHITECTURE.md §2", () => {
    expect(KU_TYPES).toHaveLength(22);
  });
  it("catalog_entry no tiene carpeta propia (vive dentro de cada catálogo)", () => {
    expect(KU_TYPE_FOLDERS.catalog_entry).toBeNull();
  });
  it("cada tipo con carpeta resuelve en ambas direcciones", () => {
    for (const [tipo, plural] of Object.entries(KU_TYPE_FOLDERS)) {
      if (plural === null) continue;
      expect(KU_FOLDER_TYPES[plural]).toBe(tipo);
    }
  });
  it("los 4 estados y los 4 niveles de confianza son los documentados", () => {
    expect(ESTADOS).toEqual(["borrador", "en_revision", "aprobado", "deprecado"]);
    expect(CONFIANZA).toEqual(["alta", "media", "baja", "sin_verificar"]);
  });
  it("FUENTE_TIPOS incluye los 4 del documento más codigo_actual (hallazgo de este EPIC)", () => {
    expect(FUENTE_TIPOS).toContain("elaboracion_propia");
    expect(FUENTE_TIPOS).toContain("codigo_actual");
  });
});

describe("errors.js — jerarquía y códigos", () => {
  it("todos heredan de KnowledgeError y de Error", () => {
    const errores = [
      new InvalidIdentifierError("x"),
      new SchemaValidationError(["y"]),
      new NotFoundError("z"),
      new DuplicateIdentifierError("z", 1),
      new AmbiguousReferenceError("z", ["a", "b"]),
    ];
    for (const e of errores) {
      expect(e).toBeInstanceOf(KnowledgeError);
      expect(e).toBeInstanceOf(Error);
      expect(e.code).toBeTruthy();
      expect(e.name).toBe(e.constructor.name);
    }
  });

  it("cada código es distinto (permite distinguir por e.code sin comparar texto)", () => {
    const codigos = [
      new InvalidIdentifierError("x").code,
      new SchemaValidationError(["y"]).code,
      new NotFoundError("z").code,
      new DuplicateIdentifierError("z", 1).code,
      new AmbiguousReferenceError("z", ["a"]).code,
    ];
    expect(new Set(codigos).size).toBe(codigos.length);
  });
});

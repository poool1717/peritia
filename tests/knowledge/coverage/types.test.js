import { describe, it, expect } from "vitest";
import { EXCLUSION_TIPOS, LIMIT_TIPOS } from "../../../lib/knowledge/coverage/types.js";

describe("EXCLUSION_TIPOS / LIMIT_TIPOS — taxonomía de TAXONOMY.md §13", () => {
  it("los 3 tipos de exclusión documentados", () => {
    expect(EXCLUSION_TIPOS).toEqual(["total", "parcial", "por_franquicia_especial"]);
  });
  it("los 3 tipos de límite documentados", () => {
    expect(LIMIT_TIPOS).toEqual(["capital", "temporal", "geografico"]);
  });
});

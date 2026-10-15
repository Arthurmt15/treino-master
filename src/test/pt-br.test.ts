// Testes do dicionario PT-BR (labels da API em ingles).
// Garante traducao conhecida e fallback sem tela vazia.

import { describe, expect, it } from "vitest";
import { BODY_PARTS_PT, EQUIPMENT_PT, WORKOUT_PT, pt } from "@/lib/pt-br";

describe("pt-br", () => {
  it("traduz musculos e equipamentos conhecidos", () => {
    // Casos principais usados nos filtros e badges.
    expect(pt(BODY_PARTS_PT, "chest")).toBe("Peito");
    expect(pt(EQUIPMENT_PT, "barbell")).toBe("Barra");
  });

  it("ignora maiusculas/minusculas da chave", () => {
    expect(pt(BODY_PARTS_PT, "Chest")).toBe("Peito");
  });

  it("devolve o original quando nao ha traducao", () => {
    // Evita label vazia para valores novos da API.
    expect(pt(BODY_PARTS_PT, "glutes")).toBe("glutes");
  });

  it("expoe os rotulos da ficha de treino", () => {
    // Campos que o editor de treino renderiza.
    expect(WORKOUT_PT.sets).toBe("Séries");
    expect(WORKOUT_PT.weight).toBe("Peso (kg)");
  });
});

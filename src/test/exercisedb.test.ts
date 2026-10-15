// Testes do catalogo (OOP: Exercise + ExerciseCatalog com fetch mock).
// Sem rede; roda em jsdom via vitest.

import { describe, expect, it, vi } from "vitest";
import { Exercise } from "@/domain/catalog/exercise";
import { ExerciseCatalog } from "@/application/catalog/exercise-catalog";
import { RateLimiter } from "@/shared/rate-limit";

// Massa base: 1 item no formato bruto da API.
function rawBench() {
  return {
    exerciseId: "EIeI8Vf",
    name: "barbell bench press",
    gifUrl: "https://static.exercisedb.dev/media/EIeI8Vf.gif",
    bodyParts: ["chest"],
    targetMuscles: ["pectorals"],
    secondaryMuscles: ["triceps"],
    equipments: ["barbell"],
    instructions: ["Lie flat on a bench."],
  };
}

describe("Exercise", () => {
  it("normaliza o payload bruto (fromRaw)", () => {
    // Fabrica preserva id, nome e GIF.
    const ex = Exercise.fromRaw(rawBench(), 0);
    expect(ex).toBeInstanceOf(Exercise);
    expect(ex.exerciseId).toBe("EIeI8Vf");
    expect(ex.gifUrl).toContain(".gif");
  });

  it("gera id estavel quando a API omite", () => {
    const { exerciseId: _omit, ...rest } = rawBench();
    void _omit;
    expect(Exercise.fromRaw(rest, 7).exerciseId).toBe("ex-7");
  });

  it("casa filtros de texto, musculo e equipamento", () => {
    // matches() centraliza a regra (usada pelo catalogo e pela UI).
    const ex = Exercise.fromRaw(rawBench(), 0);
    expect(ex.matches("squat", "", "")).toBe(false);
    expect(ex.matches("PECTORALS", "", "")).toBe(true);
    expect(ex.matches("", "chest", "barbell")).toBe(true);
    expect(ex.matches("", "chest", "dumbbell")).toBe(false);
  });
});

describe("ExerciseCatalog", () => {
  it("lista e normaliza o array da API", async () => {
    // Fetch mockado (sem rede) + limiter folgado so p/ o teste.
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => [rawBench()] }));
    const catalog = new ExerciseCatalog(fetchMock as unknown as typeof fetch);
    // RateLimiter default do modulo e global; chamadas isoladas passam.
    const items = await catalog.list(10, 0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(items).toHaveLength(1);
    expect(items[0]).toBeInstanceOf(Exercise);
  });

  it("retorna vazio em falha (rate-limit/offline)", async () => {
    // Simula 429 da tier gratis: a UI usa fallback/cache.
    const fetchMock = vi.fn(async () => ({ ok: false }));
    const catalog = new ExerciseCatalog(fetchMock as unknown as typeof fetch);
    await expect(catalog.list()).resolves.toEqual([]);
  });

  it("filtra em memoria delegando a matches()", () => {
    const items = [
      Exercise.fromRaw(rawBench(), 0),
      Exercise.fromRaw({ ...rawBench(), exerciseId: "o1", name: "bodyweight squat", bodyParts: ["legs"], targetMuscles: ["quadriceps"], equipments: ["bodyweight"] }, 1),
    ];
    const catalog = new ExerciseCatalog(vi.fn() as unknown as typeof fetch);
    expect(catalog.filter(items, "squat", "", "")).toHaveLength(1);
    expect(catalog.filter(items, "", "", "")).toHaveLength(2);
    expect(catalog.filter(items, "", "chest", "dumbbell")).toHaveLength(0);
  });

  it("contem rajada via RateLimiter injetado (sem rede)", async () => {
    // Limiter zerado bloqueia tudo: o fetch nunca e chamado.
    const blocked = new RateLimiter(0, 60_000, () => 0);
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => [] }));
    const catalog = new ExerciseCatalog(
      fetchMock as unknown as typeof fetch,
      "https://x.test",
      blocked,
    );
    await expect(catalog.list()).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

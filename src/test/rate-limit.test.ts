// Testes do RateLimiter (OOP: instancia com relogio injetavel).
// Sem timers falsos: o `now` e uma funcao controlada pelo teste.

import { describe, expect, it } from "vitest";
import { RateLimiter } from "@/shared/rate-limit";

// Relogio manual (o teste avanca o tempo a vontade).
function clock() {
  let t = 0;
  return { now: () => t, advance: (ms: number) => { t += ms; } };
}

describe("RateLimiter", () => {
  it("libera ate o maximo e bloqueia o excedente", () => {
    const { now } = clock();
    const limiter = new RateLimiter(3, 60_000, now);
    // Cota de 3: as 3 primeiras passam, a 4a e contida.
    expect(limiter.allow("api")).toBe(true);
    expect(limiter.allow("api")).toBe(true);
    expect(limiter.allow("api")).toBe(true);
    expect(limiter.allow("api")).toBe(false);
  });

  it("reabre a janela apos expirar", () => {
    const c = clock();
    const limiter = new RateLimiter(1, 60_000, c.now);
    limiter.allow("k");
    expect(limiter.allow("k")).toBe(false);
    // Avanca alem da janela: libera de novo.
    c.advance(61_000);
    expect(limiter.allow("k")).toBe(true);
  });

  it("isola chaves diferentes", () => {
    const { now } = clock();
    const limiter = new RateLimiter(1, 60_000, now);
    // Estouro em "a" nao afeta "b".
    limiter.allow("a");
    expect(limiter.allow("a")).toBe(false);
    expect(limiter.allow("b")).toBe(true);
  });

  it("reset limpa os baldes", () => {
    const { now } = clock();
    const limiter = new RateLimiter(1, 60_000, now);
    limiter.allow("a");
    limiter.reset();
    expect(limiter.allow("a")).toBe(true);
  });
});

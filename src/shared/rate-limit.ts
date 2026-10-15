// Shared kernel (DDD): RateLimiter usado pelos contextos.
// Puro e sem I/O: pode ser importado por qualquer camada.

// Janela de contagem de uma chave (inicio + usos na janela).
type Window = { start: number; count: number };

/**
 * Limitador por janela fixa, isolado por chave.
 * Relogio injetavel no construtor (testes deterministas, sem fake timers).
 */
export class RateLimiter {
  // Baldes em memoria (ex: "exercisedb:list", "supabase:rest").
  private buckets = new Map<string, Window>();

  constructor(
    private readonly max = 10, // chamadas por janela
    private readonly windowMs = 60_000, // tamanho da janela (1 min)
    private readonly now = () => Date.now(), // relogio (injetavel)
  ) {}

  /** Diz se a chamada pode seguir (true) ou deve ser contida (false). */
  allow(key: string): boolean {
    const at = this.now();
    const current = this.buckets.get(key);
    // Sem registro ou janela expirada: abre janela nova com 1 uso.
    if (!current || at - current.start >= this.windowMs) {
      this.buckets.set(key, { start: at, count: 1 });
      return true;
    }
    // Janela cheia: bloqueia (o chamador usa cache/fallback).
    if (current.count >= this.max) return false;
    // Dentro da cota: conta e libera.
    current.count += 1;
    return true;
  }

  /** Limpa os baldes (uso em testes e no logout). */
  reset(): void {
    this.buckets.clear();
  }
}

// Instancia compartilhada pelo app (10 chamadas/min por chave).
export const rateLimiter = new RateLimiter();

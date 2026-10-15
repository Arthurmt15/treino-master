// Aplicacao: Catalogo — servico ExerciseCatalog (DDD: caso de uso).
// Orquestra fetch + RateLimiter e devolve entidades do dominio.
// Fonte: ExerciseDB Free OSS (1500 exercicios, GIF 180p, sem API key).

import { Exercise, type RawExercise } from "@/domain/catalog/exercise";
import { rateLimiter, type RateLimiter } from "@/shared/rate-limit";

// URL base da API gratuita.
export const EXERCISEDB_BASE = "https://oss.exercisedb.dev/api/v1";

// URL base do fallback estatico (1323 exercicios via CDN).
export const FALLBACK_BASE =
  "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0";

// Chave do limitador p/ a listagem (contem cliques rapidos/loops).
const LIST_GUARD_KEY = "exercisedb:list";

// Tipo do fetch injetavel (testes passam um mock sem rede).
export type FetchFn = typeof fetch;

/**
 * Servico do catalogo: lista, detalha e filtra exercicios.
 * Dependencias injetaveis (fetch, base, limiter): testavel sem rede.
 */
export class ExerciseCatalog {
  constructor(
    private readonly fetchFn?: FetchFn,
    private readonly baseUrl = EXERCISEDB_BASE,
    private readonly limiter: Pick<RateLimiter, "allow"> = rateLimiter,
  ) {}

  // Resolve o fetch na hora da chamada (respeita mocks de teste).
  private http(): FetchFn {
    return this.fetchFn ?? fetch;
  }

  /** Lista paginada (limitada pelo anti-rajada; vazio = usar cache). */
  async list(limit = 48, offset = 0): Promise<Exercise[]> {
    // Rajada contida: a UI usa o cache do React Query em vez de rede.
    if (!this.limiter.allow(LIST_GUARD_KEY)) return [];
    const res = await this.http()(`${this.baseUrl}/exercises?limit=${limit}&offset=${offset}`);
    // Falha de rede/rate-limit: vazio e a UI usa fallback.
    if (!res.ok) return [];
    const data: unknown = await res.json();
    // A API retorna array direto ou { data: [...] }.
    const arr: RawExercise[] = Array.isArray(data)
      ? (data as RawExercise[])
      : ((data as { data?: RawExercise[] }).data ?? []);
    return arr.map((raw, i) => Exercise.fromRaw(raw, i));
  }

  /** Detalhe por id (GIF grande + instrucoes). */
  async getById(id: string): Promise<Exercise | null> {
    const res = await this.http()(`${this.baseUrl}/exercises/${id}`);
    if (!res.ok) return null;
    return Exercise.fromRaw((await res.json()) as RawExercise, 0);
  }

  /** Filtra em memoria (evita novas requisicoes e o rate-limit). */
  filter(items: Exercise[], query: string, bodyPart: string, equipment: string): Exercise[] {
    return items.filter((ex) => ex.matches(query, bodyPart, equipment));
  }
}

// Instancia compartilhada pelo app (fetch real + base oficial).
export const exerciseCatalog = new ExerciseCatalog();

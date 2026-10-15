// Catalogo de exercicios (OOP: entidade Exercise + servico ExerciseCatalog).
// Fonte: ExerciseDB Free OSS (1500 exercicios, GIF 180p, sem API key).
// Base publica: https://oss.exercisedb.dev/api/v1

import { rateLimiter, type RateLimiter } from "@/lib/rate-limit";

// URL base da API gratuita.
export const EXERCISEDB_BASE = "https://oss.exercisedb.dev/api/v1";

// URL base do fallback estatico (1323 exercicios via CDN).
export const FALLBACK_BASE =
  "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0";

// Chave do limitador p/ a listagem (contem cliques rapidos/loops).
const LIST_GUARD_KEY = "exercisedb:list";

// Resposta bruta da ExerciseDB v1 (campos podem variar).
export type RawExercise = Partial<{
  exerciseId: string;
  name: string;
  gifUrl: string;
  bodyParts: string[];
  targetMuscles: string[];
  secondaryMuscles: string[];
  equipments: string[];
  instructions: string[];
}>;

/** Entidade: um exercicio normalizado (independe da fonte dos dados). */
export class Exercise {
  constructor(
    public readonly exerciseId: string, // id unico (ex: "EIeI8Vf")
    public readonly name = "Unnamed exercise", // nome em ingles (v1)
    public readonly gifUrl = "", // animacao do movimento (vazio esconde)
    public readonly bodyParts: string[] = [], // ex: ["chest"]
    public readonly targetMuscles: string[] = [], // musculo principal
    public readonly secondaryMuscles: string[] = [], // musculos de apoio
    public readonly equipments: string[] = [], // ex: ["barbell"]
    public readonly instructions: string[] = [], // passo a passo
  ) {}

  /** Fabrica: normaliza o payload bruto da API (gera id se faltar). */
  static fromRaw(raw: RawExercise, index: number): Exercise {
    return new Exercise(
      raw.exerciseId ?? `ex-${index}`,
      raw.name ?? "Unnamed exercise",
      raw.gifUrl ?? "",
      raw.bodyParts ?? [],
      raw.targetMuscles ?? [],
      raw.secondaryMuscles ?? [],
      raw.equipments ?? [],
      raw.instructions ?? [],
    );
  }

  /** Diz se o exercicio passa nos filtros (busca + musculo + equipamento). */
  matches(query: string, bodyPart: string, equipment: string): boolean {
    // Busca sem case-sensitive (nome ou musculo alvo).
    const q = query.trim().toLowerCase();
    const matchQ =
      !q ||
      this.name.toLowerCase().includes(q) ||
      this.targetMuscles.join(" ").toLowerCase().includes(q);
    // Regiao corporal (ex: chest) e equipamento (ex: barbell).
    const matchB = !bodyPart || this.bodyParts.includes(bodyPart);
    const matchE = !equipment || this.equipments.includes(equipment);
    return matchQ && matchB && matchE;
  }
}

// Tipo do fetch injetavel (testes passam um mock sem rede).
export type FetchFn = typeof fetch;

/**
 * Servico do catalogo: busca na API, detalha e filtra em memoria.
 * Fetch e limitador injetaveis (testavel sem rede nem estado global).
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

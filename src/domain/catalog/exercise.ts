// Dominio: Catalogo — entidade Exercise (DDD: camada pura, sem I/O).
// Nao importa nada de fora: regra de normalizacao e filtro mora aqui.

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

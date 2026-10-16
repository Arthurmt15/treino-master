// Dominio: Treino — entidades WorkoutItem e Workout (DDD: puras, sem I/O).
// Regras de ficha (duplicata soma serie, volume) moram aqui, nao na UI.

// Dados para criar um item (sem `position`, definida pela ficha).
export type NewWorkoutItem = {
  exerciseId: string; // id da ExerciseDB (ex: "EIeI8Vf")
  name: string; // nome exibido (EN na v1)
  gifUrl: string; // demo animada do movimento
  sets: number; // ex: 3
  reps: string; // "10" | "10-12" | "30s" (texto p/ cardio)
  weightKg: number; // 0 = peso corporal
  restSec: number; // descanso entre series
};

/** Entidade: um exercicio configurado (series x reps x peso). */
export class WorkoutItem {
  constructor(
    public exerciseId: string,
    public name: string,
    public gifUrl = "",
    public sets = 3,
    public reps = "10-12",
    public weightKg = 0,
    public restSec = 60,
    public position = 0,
  ) {}

  /** Fabrica a partir de dados de entrada + posicao na ficha. */
  static fromData(data: NewWorkoutItem, position: number): WorkoutItem {
    return new WorkoutItem(
      data.exerciseId,
      data.name,
      data.gifUrl,
      data.sets,
      data.reps,
      data.weightKg,
      data.restSec,
      position,
    );
  }

  /** Reconstroi apos JSON.parse (metodos se perdem na serializacao). */
  static revive(raw: NewWorkoutItem & { position: number }): WorkoutItem {
    return WorkoutItem.fromData(raw, raw.position);
  }

  /** Aplica edicao parcial (series/peso/reps/descanso). */
  patch(data: Partial<NewWorkoutItem>): void {
    Object.assign(this, data);
  }

  /** Volume do item: series x reps(numerico) x peso. */
  volume(): number {
    // Extrai o 1o numero de "10-12"/"30s" para o calculo.
    const repsNum = parseInt(this.reps, 10) || 0;
    return this.sets * repsNum * (this.weightKg || 0);
  }
}

// Formato serializado da ficha (o que vai para o storage).
export type RawWorkout = {
  id: string;
  name: string;
  updatedAt: string;
  items: (NewWorkoutItem & { position: number })[];
};

/** Entidade: ficha completa (A/B/C ou rascunho) com seus itens. */
export class Workout {
  constructor(
    public readonly id: string, // uuid local (ou id do Supabase depois)
    public name: string, // ex: "A - Peito"
    public items: WorkoutItem[] = [],
    public updatedAt: string = new Date().toISOString(),
  ) {}

  /** Reconstroi apos JSON.parse (revive cada item). */
  static revive(raw: RawWorkout): Workout {
    return new Workout(raw.id, raw.name, raw.items.map(WorkoutItem.revive), raw.updatedAt);
  }

  /** Adiciona exercicio (duplicado soma +1 serie em vez de repetir). */
  addItem(data: NewWorkoutItem): void {
    const found = this.items.find((i) => i.exerciseId === data.exerciseId);
    if (found) found.sets += 1;
    else this.items.push(WorkoutItem.fromData(data, this.items.length));
    this.touch();
  }

  /** Edita series/reps/peso/descanso de um item. */
  updateItem(exerciseId: string, data: Partial<NewWorkoutItem>): void {
    this.items.find((i) => i.exerciseId === exerciseId)?.patch(data);
    this.touch();
  }

  /** Remove um exercicio da ficha. */
  removeItem(exerciseId: string): void {
    this.items = this.items.filter((i) => i.exerciseId !== exerciseId);
    this.touch();
  }

  /** Volume total estimado da ficha (soma dos itens). */
  totalVolume(): number {
    return this.items.reduce((acc, i) => acc + i.volume(), 0);
  }

  // Marca alteracao (p/ ordenar recentes).
  private touch(): void {
    this.updatedAt = new Date().toISOString();
  }
}

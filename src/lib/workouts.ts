// Treinos (OOP: entidades WorkoutItem/Workout + repositorio WorkoutStore).
// V1: persiste em localStorage por usuario; fase 2 troca o repositorio
// pelo Supabase sem mudar as entidades (mesma interface).
// Guarda referencia da API (exerciseId/gifUrl), nao baixa midia.

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
      data.exerciseId, data.name, data.gifUrl, data.sets,
      data.reps, data.weightKg, data.restSec, position,
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

/** Entidade: ficha completa (A/B/C ou rascunho) com seus itens. */
export class Workout {
  constructor(
    public readonly id: string, // uuid local (ou id do Supabase depois)
    public name: string, // ex: "A - Peito"
    public items: WorkoutItem[] = [],
    public updatedAt: string = new Date().toISOString(),
  ) {}

  /** Reconstroi apos JSON.parse (revive cada item). */
  static revive(raw: { id: string; name: string; updatedAt: string; items: (NewWorkoutItem & { position: number })[] }): Workout {
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

// Gera id local unico (substitui uuid sem dependencia).
function uid(): string {
  return `w_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6)}`;
}

// Armazenamento minimo (localStorage no browser, memoria fora dele).
function defaultStorage(): Storage | Map<string, string> {
  // SSR/testes sem window: cai no Map em memoria.
  if (typeof localStorage !== "undefined") return localStorage;
  return new Map<string, string>();
}

/**
 * Repositorio: CRUD das fichas por usuario (chave isolada por conta).
 * Trocar esta classe pelo Supabase nao afeta entidades nem telas.
 */
export class WorkoutStore {
  constructor(
    private readonly user = "anon", // "anon" ate o login (depois email/uid)
    private readonly storage: Storage | Map<string, string> = defaultStorage(),
  ) {}

  // Chave isolada por usuario.
  private key(): string {
    return `treino:workouts:${this.user}`;
  }

  // Le do storage (nunca quebra: erro retorna []).
  private readRaw(): string | null {
    try {
      return this.storage instanceof Map ? (this.storage.get(this.key()) ?? null) : this.storage.getItem(this.key());
    } catch {
      return null;
    }
  }

  // Grava a lista serializada.
  private write(list: Workout[]): void {
    const json = JSON.stringify(list);
    if (this.storage instanceof Map) this.storage.set(this.key(), json);
    else {
      try {
        this.storage.setItem(this.key(), json);
      } catch {
        // Storage cheio/bloqueado: ignora (sessao segue em memoria).
      }
    }
  }

  /** Lista todas as fichas do usuario. */
  load(): Workout[] {
    const raw = this.readRaw();
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw) as Parameters<typeof Workout.revive>[0][];
      return arr.map(Workout.revive);
    } catch {
      return [];
    }
  }

  /** Persiste a lista completa. */
  save(list: Workout[]): void {
    this.write(list);
  }

  /** Cria ficha vazia e retorna ela. */
  create(name: string): Workout {
    const created = new Workout(uid(), name);
    this.save([created, ...this.load()]);
    return created;
  }

  // Aplica mutacao numa ficha e persiste (base do add/update/remove).
  private mutate(workoutId: string, fn: (w: Workout) => void): Workout[] {
    const next = this.load();
    const target = next.find((w) => w.id === workoutId);
    if (target) fn(target);
    this.save(next);
    return next;
  }

  /** Adiciona exercicio a ficha (retorna a lista atualizada). */
  addItem(workoutId: string, data: NewWorkoutItem): Workout[] {
    return this.mutate(workoutId, (w) => w.addItem(data));
  }

  /** Edita um item da ficha (retorna a lista atualizada). */
  updateItem(workoutId: string, exerciseId: string, data: Partial<NewWorkoutItem>): Workout[] {
    return this.mutate(workoutId, (w) => w.updateItem(exerciseId, data));
  }

  /** Remove um item da ficha (retorna a lista atualizada). */
  removeItem(workoutId: string, exerciseId: string): Workout[] {
    return this.mutate(workoutId, (w) => w.removeItem(exerciseId));
  }
}

// Instancia compartilhada (usuario anonimo ate o login com Google).
export const workoutStore = new WorkoutStore();

// Aplicacao: Treino — repositorio WorkoutStore (DDD: persistencia).
// V1: localStorage por usuario; fase 2 troca esta classe pelo Supabase
// sem mudar dominio nem telas (mesma interface publica).
// Guarda referencia da API (exerciseId/gifUrl), nao baixa midia.

import { Workout, type NewWorkoutItem, type RawWorkout } from "@/domain/training/workout";

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
 * Storage injetavel (testes usam Map isolado, sem tocar no browser).
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

  // Le o JSON bruto (nunca quebra: erro retorna null).
  private readRaw(): string | null {
    try {
      return this.storage instanceof Map
        ? (this.storage.get(this.key()) ?? null)
        : this.storage.getItem(this.key());
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

  /** Lista todas as fichas do usuario (revividas como entidades). */
  load(): Workout[] {
    const raw = this.readRaw();
    if (!raw) return [];
    try {
      return (JSON.parse(raw) as RawWorkout[]).map(Workout.revive);
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

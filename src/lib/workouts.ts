// Store de treinos: tipos + CRUD (localStorage v1, Supabase fase 2).
// Guarda referencia da API (exerciseId/gifUrl), nao baixa midia.

// Item configuravel: series x repeticoes x peso + descanso.
export type WorkoutItem = {
  exerciseId: string; // id da ExerciseDB (ex: "EIeI8Vf")
  name: string; // nome exibido (EN na v1)
  gifUrl: string; // demo animada do movimento
  sets: number; // ex: 3
  reps: string; // "10" | "10-12" | "30s" (texto p/ cardio)
  weightKg: number; // 0 = peso corporal
  restSec: number; // descanso entre series
  position: number; // ordem no treino
};

// Ficha completa (A/B/C ou rascunho atual).
export type Workout = {
  id: string; // uuid local (ou id do Supabase depois)
  name: string; // ex: "A - Peito"
  items: WorkoutItem[];
  updatedAt: string; // ISO (p/ ordenar recentes)
};

// Chave por usuario (quando logar, troca "anon" pelo email/uid).
function keyFor(user = "anon"): string {
  return `treino:workouts:${user}`;
}

// Gera id local unico (substitui uuid sem dependencia).
function uid(): string {
  return `w_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6)}`;
}

// Le todas as fichas do aparelho (nunca quebra: retorna []).
export function loadWorkouts(user = "anon"): Workout[] {
  try {
    const raw = localStorage.getItem(keyFor(user));
    if (!raw) return [];
    return JSON.parse(raw) as Workout[];
  } catch {
    return [];
  }
}

// Persiste a lista completa (chamado apos cada alteracao).
export function saveWorkouts(list: Workout[], user = "anon"): void {
  localStorage.setItem(keyFor(user), JSON.stringify(list));
}

// Cria ficha vazia e retorna ela.
export function createWorkout(name: string, user = "anon"): Workout {
  const list = loadWorkouts(user);
  // Monta o registro com timestamp atual.
  const w: Workout = { id: uid(), name, items: [], updatedAt: new Date().toISOString() };
  saveWorkouts([w, ...list], user);
  return w;
}

// Adiciona exercicio (ou soma +1 serie se ja existir).
export function addItem(workoutId: string, item: Omit<WorkoutItem, "position">, user = "anon"): Workout[] {
  const list = loadWorkouts(user);
  const next = list.map((w) => {
    if (w.id !== workoutId) return w;
    // Evita duplicar: incrementa series do item existente.
    const found = w.items.find((i) => i.exerciseId === item.exerciseId);
    const items = found
      ? w.items.map((i) => (i.exerciseId === item.exerciseId ? { ...i, sets: i.sets + 1 } : i))
      : [...w.items, { ...item, position: w.items.length }];
    return { ...w, items, updatedAt: new Date().toISOString() };
  });
  saveWorkouts(next, user);
  return next;
}

// Atualiza series/reps/peso/descanso de um item.
export function updateItem(workoutId: string, exerciseId: string, patch: Partial<WorkoutItem>, user = "anon"): Workout[] {
  const list = loadWorkouts(user);
  const next = list.map((w) =>
    w.id !== workoutId
      ? w
      : { ...w, items: w.items.map((i) => (i.exerciseId === exerciseId ? { ...i, ...patch } : i)), updatedAt: new Date().toISOString() },
  );
  saveWorkouts(next, user);
  return next;
}

// Remove um exercicio da ficha.
export function removeItem(workoutId: string, exerciseId: string, user = "anon"): Workout[] {
  const list = loadWorkouts(user);
  const next = list.map((w) =>
    w.id !== workoutId ? w : { ...w, items: w.items.filter((i) => i.exerciseId !== exerciseId) },
  );
  saveWorkouts(next, user);
  return next;
}

// Volume total estimado: soma(sets * reps_num * peso).
export function totalVolume(w: Workout): number {
  return w.items.reduce((acc, i) => {
    // Extrai o primeiro numero de "10-12"/"30s" para o calculo.
    const repsNum = parseInt(i.reps, 10) || 0;
    return acc + i.sets * repsNum * (i.weightKg || 0);
  }, 0);
}

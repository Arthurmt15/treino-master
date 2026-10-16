// Infraestrutura: fichas de treino no Supabase (workouts + workout_items).
// DDD: persistencia real (sincroniza entre celular e PC via RLS).
import { getSupabase } from "@/infrastructure/supabase/client";
import { Workout, type NewWorkoutItem, type RawWorkout } from "@/domain/training/workout";

// Linha crua de workout_items.
type ItemRow = {
  id: string;
  exercise_id: string;
  name: string;
  gif_url: string | null;
  sets: number;
  reps: string;
  weight_kg: number;
  rest_sec: number;
  position: number;
};

// Linha crua de workouts com itens embutidos (select aninhado).
type WorkoutRow = {
  id: string;
  name: string;
  created_at: string | null;
  workout_items: ItemRow[] | null;
};

// Converte uma linha do banco na entidade de dominio Workout.
function toWorkout(row: WorkoutRow): Workout {
  const items = (row.workout_items ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((it) => ({
      exerciseId: it.exercise_id,
      name: it.name,
      gifUrl: it.gif_url ?? "",
      sets: it.sets,
      reps: it.reps,
      weightKg: Number(it.weight_kg),
      restSec: it.rest_sec,
      position: it.position,
    }));
  const raw: RawWorkout = {
    id: row.id,
    name: row.name,
    updatedAt: row.created_at ?? new Date().toISOString(),
    items,
  };
  return Workout.revive(raw);
}

// Le todas as fichas do usuario (com itens) e revividas como entidades.
export async function fetchWorkouts(userId: string): Promise<Workout[]> {
  const sb = await getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("workouts")
    .select(
      "id,name,created_at,workout_items(id,exercise_id,name,gif_url,sets,reps,weight_kg,rest_sec,position)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as WorkoutRow[]).map(toWorkout);
}

// Cria uma ficha vazia e devolve a entidade (null se falhar).
export async function insertWorkout(userId: string, name: string): Promise<Workout | null> {
  const sb = await getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("workouts")
    .insert({ user_id: userId, name })
    .select("id,name,created_at")
    .single();
  if (error || !data) return null;
  return new Workout(data.id, data.name, [], data.created_at ?? new Date().toISOString());
}

// Adiciona exercicio a ficha (duplicado soma +1 serie, como no dominio).
export async function insertWorkoutItem(workoutId: string, data: NewWorkoutItem): Promise<void> {
  const sb = await getSupabase();
  if (!sb) return;
  const { data: existing } = await sb
    .from("workout_items")
    .select("id,sets")
    .eq("workout_id", workoutId)
    .eq("exercise_id", data.exerciseId)
    .maybeSingle();
  if (existing) {
    await sb
      .from("workout_items")
      .update({ sets: (existing.sets as number) + 1 })
      .eq("id", existing.id as string);
    return;
  }
  const { count } = await sb
    .from("workout_items")
    .select("id", { count: "exact", head: true })
    .eq("workout_id", workoutId);
  await sb.from("workout_items").insert({
    workout_id: workoutId,
    exercise_id: data.exerciseId,
    name: data.name,
    gif_url: data.gifUrl || null,
    sets: data.sets,
    reps: data.reps,
    weight_kg: data.weightKg,
    rest_sec: data.restSec,
    position: count ?? 0,
  });
}

// Apaga uma ficha inteira (itens caem por cascade).
export async function deleteWorkoutById(workoutId: string): Promise<void> {
  const sb = await getSupabase();
  if (!sb) return;
  await sb.from("workouts").delete().eq("id", workoutId);
}

// Renomeia a ficha.
export async function renameWorkout(workoutId: string, name: string): Promise<void> {
  const sb = await getSupabase();
  if (!sb) return;
  await sb.from("workouts").update({ name }).eq("id", workoutId);
}

// Monta apenas as colunas presentes no patch (camel -> snake).
function patchColumns(patch: Partial<NewWorkoutItem>): Record<string, unknown> {
  const cols: Record<string, unknown> = {};
  if (patch.name !== undefined) cols["name"] = patch.name;
  if (patch.gifUrl !== undefined) cols["gif_url"] = patch.gifUrl || null;
  if (patch.sets !== undefined) cols["sets"] = patch.sets;
  if (patch.reps !== undefined) cols["reps"] = patch.reps;
  if (patch.weightKg !== undefined) cols["weight_kg"] = patch.weightKg;
  if (patch.restSec !== undefined) cols["rest_sec"] = patch.restSec;
  return cols;
}

// Edita um item da ficha (series/reps/peso/descanso/nome).
export async function updateWorkoutItem(
  workoutId: string,
  exerciseId: string,
  patch: Partial<NewWorkoutItem>,
): Promise<void> {
  const sb = await getSupabase();
  if (!sb) return;
  await sb
    .from("workout_items")
    .update(patchColumns(patch))
    .eq("workout_id", workoutId)
    .eq("exercise_id", exerciseId);
}

// Remove um item da ficha.
export async function deleteWorkoutItem(workoutId: string, exerciseId: string): Promise<void> {
  const sb = await getSupabase();
  if (!sb) return;
  await sb.from("workout_items").delete().eq("workout_id", workoutId).eq("exercise_id", exerciseId);
}

// Cria ou atualiza um item com os valores exatos (editor de ficha).
export async function upsertWorkoutItem(workoutId: string, data: NewWorkoutItem): Promise<void> {
  const sb = await getSupabase();
  if (!sb) return;
  const { data: existing } = await sb
    .from("workout_items")
    .select("id")
    .eq("workout_id", workoutId)
    .eq("exercise_id", data.exerciseId)
    .maybeSingle();
  if (existing) {
    await sb
      .from("workout_items")
      .update(patchColumns(data))
      .eq("id", existing.id as string);
    return;
  }
  const { count } = await sb
    .from("workout_items")
    .select("id", { count: "exact", head: true })
    .eq("workout_id", workoutId);
  await sb.from("workout_items").insert({
    workout_id: workoutId,
    exercise_id: data.exerciseId,
    name: data.name,
    gif_url: data.gifUrl || null,
    sets: data.sets,
    reps: data.reps,
    weight_kg: data.weightKg,
    rest_sec: data.restSec,
    position: count ?? 0,
  });
}

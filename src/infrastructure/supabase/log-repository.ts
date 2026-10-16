// Infraestrutura: historico de treinos e evolucao de peso no Supabase.
// DDD: detalhe tecnico; a UI ve titulos formatados.
import { getSupabase } from "@/infrastructure/supabase/client";

// Entrada de historico exibida na UI.
export type WorkoutLog = {
  id: string;
  title: string;
  date: string; // data ja formatada (ex: "15 out")
  finishedAt: string | null; // ISO cru (streak/meta usam a data real)
  duration: string; // ex: "55 min"
  durationMin: number; // minutos numericos (soma nos stats)
  exercises: number;
};

// Linha crua de workout_logs.
type LogRow = {
  id: string;
  title: string | null;
  exercises: number | null;
  duration_min: number | null;
  finished_at: string | null;
};

// Ponto do grafico de peso.
export type WeightPoint = { date: string; weight: number };

// Linha crua de weight_logs.
type WeightRow = { weighed_on: string; weight_kg: number };

// Formata data (pt-BR) para exibicao no historico.
function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(d);
}

// Formata "MM/DD" curto para o eixo do grafico.
function shortDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(d);
}

// Le o historico do usuario (mais recentes primeiro).
export async function fetchWorkoutLogs(userId: string): Promise<WorkoutLog[]> {
  const sb = await getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("workout_logs")
    .select("id,title,exercises,duration_min,finished_at")
    .eq("user_id", userId)
    .order("finished_at", { ascending: false });
  if (error || !data) return [];
  return (data as LogRow[]).map((row) => ({
    id: row.id,
    title: row.title ?? "Treino",
    date: formatDate(row.finished_at),
    finishedAt: row.finished_at,
    duration: row.duration_min ? `${row.duration_min} min` : "—",
    durationMin: row.duration_min ?? 0,
    exercises: row.exercises ?? 0,
  }));
}

// Registra um treino concluido.
export async function insertWorkoutLog(
  userId: string,
  input: { title: string; durationMin: number; exercises: number; workoutId?: string | null },
): Promise<void> {
  const sb = await getSupabase();
  if (!sb) return;
  await sb.from("workout_logs").insert({
    user_id: userId,
    workout_id: input.workoutId ?? null,
    title: input.title,
    duration_min: input.durationMin,
    exercises: input.exercises,
  });
}

// Le a evolucao de peso (cronologica p/ o grafico).
export async function fetchWeightLogs(userId: string): Promise<WeightPoint[]> {
  const sb = await getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("weight_logs")
    .select("weighed_on,weight_kg")
    .eq("user_id", userId)
    .order("weighed_on", { ascending: true });
  if (error || !data) return [];
  return (data as WeightRow[]).map((row) => ({
    date: shortDate(row.weighed_on),
    weight: Number(row.weight_kg),
  }));
}

// Grava o peso do dia (atualiza se ja existir no mesmo dia).
export async function upsertWeightLog(userId: string, weightKg: number): Promise<void> {
  const sb = await getSupabase();
  if (!sb) return;
  const today = new Date().toISOString().slice(0, 10);
  await sb
    .from("weight_logs")
    .upsert(
      { user_id: userId, weighed_on: today, weight_kg: weightKg },
      { onConflict: "user_id,weighed_on" },
    );
}

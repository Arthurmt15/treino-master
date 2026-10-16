// Utilidades do painel: data atual, semana, streak e meta (dados reais).
// Mantem a UI "burra": so formata/computa, sem acessar banco.

import type { WorkoutLog } from "@/infrastructure/supabase/log-repository";

// Rotulos curtos da semana (segunda a domingo).
export const WEEK_LABELS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"] as const;

// Data longa em pt-BR: "Quinta-feira, 15 de outubro".
export function formatLongDate(now: Date = new Date()): string {
  const text = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Data ISO (yyyy-mm-dd) do log, sem fuso.
export function isoDay(value: string | null): string | null {
  if (!value) return null;
  return value.slice(0, 10);
}

// Segunda-feira (ISO) da semana que contem a data informada.
export function mondayOf(now: Date = new Date()): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const offset = (d.getDay() + 6) % 7; // 0 = segunda.
  d.setDate(d.getDate() - offset);
  return d;
}

// Sete dias da semana atual (label + numero + ISO), para o painel.
export function weekDates(now: Date = new Date()) {
  const monday = mondayOf(now);
  return WEEK_LABELS.map((label, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { label, day: d.getDate(), iso, isToday: iso === toISO(now) };
  });
}

// ISO (yyyy-mm-dd) de uma Date local.
function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Dias com treino concluido (Set de ISO) a partir do historico.
export function trainedDays(logs: WorkoutLog[]): Set<string> {
  const days = new Set<string>();
  for (const log of logs) {
    const day = isoDay(log.finishedAt);
    if (day) days.add(day);
  }
  return days;
}

// Quantos treinos nesta semana (segunda a domingo).
export function weeklyCount(logs: WorkoutLog[], now: Date = new Date()): number {
  const days = trainedDays(logs);
  return weekDates(now).filter((d) => days.has(d.iso)).length;
}

// Rotulo do intervalo da semana (ex.: "12 – 18 out").
export function weekRangeLabel(now: Date = new Date()): string {
  const dates = weekDates(now);
  const first = dates[0]!.day;
  const last = dates[6]!.day;
  const month = new Intl.DateTimeFormat("pt-BR", { month: "short" })
    .format(mondayOf(now))
    .replace(".", "");
  return `${first} – ${last} ${month}`;
}

// Sequencia de dias treinados ate hoje (ou ontem, se hoje ainda nao treinou).
export function currentStreak(logs: WorkoutLog[], now: Date = new Date()): number {
  const days = trainedDays(logs);
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Se hoje nao treinou, a sequencia ainda vale ate ontem.
  if (!days.has(toISO(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(toISO(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Meta mensal estimada (4 semanas x meta semanal).
export function monthlyTarget(weeklyTarget: number): number {
  return Math.max(1, weeklyTarget * 4);
}

// Conquistas calculadas a partir do historico e do peso real.
export function achievements(
  logs: WorkoutLog[],
  weeklyTarget: number,
  weightDelta: number,
): { title: string; text: string }[] {
  const total = logs.length;
  const streak = currentStreak(logs);
  const month = weeklyCount(logs);
  return [
    {
      title: "Primeiro passo",
      text: total > 0 ? `${total} treino(s) no total` : "Conclua seu primeiro treino",
    },
    {
      title: "No ritmo",
      text: streak > 0 ? `${streak} dia(s) em sequência` : "Comece uma sequência hoje",
    },
    { title: "Consistência", text: `${month} de ${weeklyTarget} treinos nesta semana` },
    {
      title: "Evolução de peso",
      text:
        weightDelta === 0
          ? "Registre seu peso"
          : `${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(1).replace(".", ",")} kg`,
    },
  ];
}

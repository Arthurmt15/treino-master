// Infraestrutura: perfil do usuario no Supabase (Postgres + RLS).
// DDD: detalhe tecnico fora do dominio; a UI so ve ProfileInput.
import { getSupabase } from "@/infrastructure/supabase/client";

// Linha crua da tabela profiles (snake_case do banco).
export type ProfileRow = {
  id: string;
  name: string | null;
  email: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  goal: string | null;
  weekly_target: number | null;
};

// Perfil editavel pela UI (camelCase, sem detalhes do banco).
export type ProfileInput = {
  name: string;
  email: string | null;
  weightKg: number | null;
  heightCm: number | null;
  goal: string;
  weeklyTarget: number;
};

// Le o perfil do usuario logado (null se nao existir ou sem config).
export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const sb = await getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) return null;
  return (data as ProfileRow | null) ?? null;
}

// Cria o perfil se ainda nao existir (nao sobrescreve dados do usuario).
export async function ensureProfile(
  userId: string,
  email: string | null,
  name: string | null,
): Promise<void> {
  const sb = await getSupabase();
  if (!sb) return;
  await sb
    .from("profiles")
    .upsert({ id: userId, email, name }, { onConflict: "id", ignoreDuplicates: true });
}

// Cria/atualiza o perfil do usuario logado (upsert pela chave id).
export async function saveProfile(userId: string, input: ProfileInput): Promise<void> {
  const sb = await getSupabase();
  if (!sb) return;
  await sb.from("profiles").upsert({
    id: userId,
    name: input.name || null,
    email: input.email,
    weight_kg: input.weightKg,
    height_cm: input.heightCm,
    goal: input.goal || "Hipertrofia",
    weekly_target: input.weeklyTarget || 5,
    updated_at: new Date().toISOString(),
  });
}

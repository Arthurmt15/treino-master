// Infraestrutura: cliente Supabase (DDD: detalhe tecnico, fora do dominio).
// Banco (Postgres + RLS) + Auth Google via Supabase Auth.
// Usa lazy import para nao obrigar a dependencia antes do install.
// Env esperadas: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.

import type { SupabaseClient } from "@supabase/supabase-js";
import { authErrorMessage } from "@/shared/auth-errors"; // Erros de auth -> pt-BR.

// URL publica do projeto (dashboard Supabase > Settings > API).
const URL = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
// Chave anonima (pode expor no front; RLS protege os dados).
const ANON = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

// Singleton em memoria (evita multiplas sessoes no HMR).
let cached: SupabaseClient | null = null;

// Cria (ou reutiliza) o client; retorna null se .env faltar.
export async function getSupabase(): Promise<SupabaseClient | null> {
  // Sem env configurada: modo demonstracao (dados locais).
  if (!URL || !ANON) return null;
  if (cached) return cached;
  // Import dinamico: o build nao quebra sem o pacote instalado.
  const { createClient } = await import("@supabase/supabase-js");
  cached = createClient(URL, ANON);
  return cached;
}

// Atalho: true quando o banco esta configurado.
export function hasSupabase(): boolean {
  return Boolean(URL && ANON);
}

// Inicia o login com Google (OAuth via Supabase Auth).
// Pre-requisito: Client ID/Secret cadastrados no dashboard.
export async function signInWithGoogle(next = "/treinos"): Promise<void> {
  const sb = await getSupabase();
  // Sem Supabase: avisa em vez de quebrar a tela.
  if (!sb) throw new Error("Supabase nao configurado (.env).");
  const { error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}${next}` },
  });
  // Converte o erro do backend em mensagem amigável em pt-BR.
  if (error) throw new Error(authErrorMessage(error.message));
}

// Encerra a sessao atual.
export async function signOut(): Promise<void> {
  const sb = await getSupabase();
  if (sb) await sb.auth.signOut();
}

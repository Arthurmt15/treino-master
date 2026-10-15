// Hook de autenticação: expõe sessão, usuário e ações de login/logout via Supabase.
import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  getSupabase,
  hasSupabase,
  signInWithGoogle,
  signOut,
} from "@/infrastructure/supabase/client";

// Estados possíveis da sessão (inclui "unconfigured" sem Supabase no .env).
export type AuthStatus = "loading" | "authenticated" | "anonymous" | "unconfigured";

// Assina a sessão atual e atualiza o estado a cada login/logout.
export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");

  // Carrega a sessão inicial e escuta mudanças de auth em tempo real.
  useEffect(() => {
    let active = true;
    if (!hasSupabase()) {
      setStatus("unconfigured");
      return;
    }
    getSupabase()
      .then(async (sb) => {
        if (!sb || !active) return;
        const { data } = await sb.auth.getSession();
        if (!active) return;
        setUser(data.session?.user ?? null);
        setStatus(data.session ? "authenticated" : "anonymous");
        const { data: listener } = sb.auth.onAuthStateChange(
          (_event: string, session: Session | null) => {
            setUser(session?.user ?? null);
            setStatus(session ? "authenticated" : "anonymous");
          },
        );
        return () => listener.subscription.unsubscribe();
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar sessão.");
        setStatus("anonymous");
      });
    return () => {
      active = false;
    };
  }, []);

  // Inicia o login com Google (redireciona para o OAuth do Supabase).
  async function login(next = "/treinos"): Promise<void> {
    setError("");
    try {
      await signInWithGoogle(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível iniciar o login.");
      throw err;
    }
  }

  // Encerra a sessão e limpa o usuário do estado local.
  async function logout(): Promise<void> {
    setError("");
    await signOut();
    setUser(null);
    setStatus(hasSupabase() ? "anonymous" : "unconfigured");
  }

  return { status, user, error, login, logout, configured: hasSupabase() };
}

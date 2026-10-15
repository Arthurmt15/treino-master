// Hook: perfil do usuario no Supabase (carrega ao logar e salva no banco).
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  ensureProfile,
  fetchProfile,
  saveProfile,
  type ProfileInput,
} from "@/infrastructure/supabase/profile-repository";

// Perfil vazio (conta nova comeca do zero).
export const EMPTY_PROFILE: ProfileInput = {
  name: "",
  email: null,
  weightKg: null,
  heightCm: null,
  goal: "Hipertrofia",
  weeklyTarget: 5,
};

// Assina o perfil da conta logada e expoe o save.
export function useProfile() {
  const { user, status } = useAuth();
  const [profile, setProfile] = useState<ProfileInput>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(false);

  // Carrega o perfil quando a sessao fica autenticada.
  useEffect(() => {
    if (status !== "authenticated" || !user) {
      setProfile(EMPTY_PROFILE);
      return;
    }
    let active = true;
    setLoading(true);
    const fallbackName = (user.user_metadata?.["full_name"] as string | undefined) ?? "";
    // Garante a linha do perfil antes de ler (evita FK quebrada).
    ensureProfile(user.id, user.email ?? null, fallbackName || null)
      .then(() => fetchProfile(user.id))
      .then((row) => {
        if (!active) return;
        setProfile(
          row
            ? {
                name: row.name ?? fallbackName,
                email: row.email ?? user.email ?? null,
                weightKg: row.weight_kg,
                heightCm: row.height_cm,
                goal: row.goal ?? "Hipertrofia",
                weeklyTarget: row.weekly_target ?? 5,
              }
            : { ...EMPTY_PROFILE, name: fallbackName, email: user.email ?? null },
        );
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status, user]);

  // Salva no banco o perfil editado.
  const save = useCallback(
    async (input: ProfileInput) => {
      if (!user) return;
      setProfile(input);
      await saveProfile(user.id, input);
    },
    [user],
  );

  return { profile, setProfile, save, loading, userId: user?.id ?? null };
}

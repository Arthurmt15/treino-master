// Hook de treinos próprios: CRUD das fichas do usuário no Supabase.
// Sincroniza entre dispositivos (RLS garante isolamento por conta).
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ensureProfile } from "@/infrastructure/supabase/profile-repository";
import {
  deleteWorkoutById,
  deleteWorkoutItem,
  fetchWorkouts,
  insertWorkout,
  insertWorkoutItem,
  renameWorkout as renameWorkoutRow,
  updateWorkoutItem,
  upsertWorkoutItem,
} from "@/infrastructure/supabase/workout-repository";
import type { NewWorkoutItem, Workout } from "@/domain/training/workout";

// Liga o hook à conta logada e expõe as operações de ficha.
export function useCustomWorkouts() {
  const { user, status } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);

  // Recarrega as fichas ao logar ou trocar de conta.
  useEffect(() => {
    if (status !== "authenticated" || !user) {
      setWorkouts([]);
      return;
    }
    let active = true;
    setLoading(true);
    fetchWorkouts(user.id)
      .then((rows) => {
        if (active) setWorkouts(rows);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status, user]);

  // Recarrega a lista do banco (após inserir itens, por exemplo).
  const reload = useCallback(async () => {
    if (!user) return;
    setWorkouts(await fetchWorkouts(user.id));
  }, [user]);

  // Cria ficha no banco e devolve a entidade criada.
  const createWorkout = useCallback(
    async (name: string): Promise<Workout | null> => {
      if (!user) return null;
      // Garante a linha do perfil (PK/FK das fichas).
      await ensureProfile(
        user.id,
        user.email ?? null,
        (user.user_metadata?.["full_name"] as string | undefined) ?? null,
      );
      const created = await insertWorkout(user.id, name.trim() || "Meu treino");
      if (created) setWorkouts((prev) => [created, ...prev]);
      return created;
    },
    [user],
  );

  // Adiciona exercício à ficha (duplicado soma série no banco).
  const addExercise = useCallback(
    async (workoutId: string, data: NewWorkoutItem): Promise<void> => {
      await insertWorkoutItem(workoutId, data);
    },
    [],
  );

  // Apaga a ficha inteira do banco.
  const deleteWorkout = useCallback(async (workoutId: string): Promise<void> => {
    await deleteWorkoutById(workoutId);
    setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
  }, []);

  // Edita um exercicio da ficha e recarrega.
  const updateExercise = useCallback(
    async (
      workoutId: string,
      exerciseId: string,
      patch: Partial<NewWorkoutItem>,
    ): Promise<void> => {
      await updateWorkoutItem(workoutId, exerciseId, patch);
    },
    [],
  );

  // Remove um exercicio da ficha e recarrega.
  const removeExercise = useCallback(
    async (workoutId: string, exerciseId: string): Promise<void> => {
      await deleteWorkoutItem(workoutId, exerciseId);
    },
    [],
  );

  // Cria/atualiza um exercicio com valores exatos (editor de ficha).
  const upsertExercise = useCallback(
    async (workoutId: string, data: NewWorkoutItem): Promise<void> => {
      await upsertWorkoutItem(workoutId, data);
    },
    [],
  );

  // Renomeia a ficha.
  const renameWorkout = useCallback(async (workoutId: string, name: string): Promise<void> => {
    await renameWorkoutRow(workoutId, name.trim() || "Meu treino");
  }, []);

  return {
    workouts,
    createWorkout,
    addExercise,
    deleteWorkout,
    updateExercise,
    removeExercise,
    upsertExercise,
    renameWorkout,
    reload,
    loading,
  };
}

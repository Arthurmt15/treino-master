// Hook de treinos próprios: CRUD das fichas do usuário (localStorage por conta).
// Usa o WorkoutStore existente; troca a chave quando o login muda de conta.
import { useCallback, useEffect, useMemo, useState } from "react";
import { WorkoutStore } from "@/application/training/workout-store";
import type { NewWorkoutItem, Workout } from "@/domain/training/workout";
import { useAuth } from "@/hooks/use-auth";

// Liga o hook à conta logada (ou "anon" sem login).
export function useCustomWorkouts() {
  const { user, status } = useAuth();
  // Chave isolada por conta: cada login vê só as próprias fichas.
  const storeKey = user?.id ?? user?.email ?? "anon";
  // Recria o store ao trocar de conta (evita vazar fichas entre logins).
  const store = useMemo(() => new WorkoutStore(storeKey), [storeKey]);
  // Lista de fichas exibida na tela.
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  // Recarrega ao trocar de conta ou ao terminar o loading da sessão.
  useEffect(() => {
    if (status !== "loading") setWorkouts(store.load());
  }, [store, status]);

  // Cria ficha vazia com nome (ex.: "Meu treino de pernas").
  const createWorkout = useCallback(
    (name: string): Workout => {
      const created = store.create(name.trim() || "Meu treino");
      setWorkouts(store.load());
      return created;
    },
    [store],
  );

  // Adiciona exercício à ficha (nome + séries/reps/peso/descanso).
  const addExercise = useCallback(
    (workoutId: string, data: NewWorkoutItem): void => {
      setWorkouts(store.addItem(workoutId, data));
    },
    [store],
  );

  // Remove exercício da ficha.
  const removeExercise = useCallback(
    (workoutId: string, exerciseId: string): void => {
      setWorkouts(store.removeItem(workoutId, exerciseId));
    },
    [store],
  );

  // Apaga a ficha inteira.
  const deleteWorkout = useCallback(
    (workoutId: string): void => {
      store.save(store.load().filter((w) => w.id !== workoutId));
      setWorkouts(store.load());
    },
    [store],
  );

  return { workouts, createWorkout, addExercise, removeExercise, deleteWorkout };
}

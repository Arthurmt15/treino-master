// Hook: historico de treinos do usuario no Supabase (/historico e stats).
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchWorkoutLogs,
  insertWorkoutLog,
  type WorkoutLog,
} from "@/infrastructure/supabase/log-repository";

// Le e registra treinos concluidos da conta logada.
export function useWorkoutLogs() {
  const { user, status } = useAuth();
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Recarrega o historico ao logar/trocar de conta.
  useEffect(() => {
    if (status !== "authenticated" || !user) {
      setLogs([]);
      return;
    }
    let active = true;
    setLoading(true);
    fetchWorkoutLogs(user.id)
      .then((rows) => {
        if (active) setLogs(rows);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status, user]);

  // Registra um treino concluido e recarrega a lista.
  const addLog = useCallback(
    async (input: {
      title: string;
      durationMin: number;
      exercises: number;
      workoutId?: string | null;
    }) => {
      if (!user) return;
      await insertWorkoutLog(user.id, input);
      setLogs(await fetchWorkoutLogs(user.id));
    },
    [user],
  );

  return { logs, addLog, loading };
}

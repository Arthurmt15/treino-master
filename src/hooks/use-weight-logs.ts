// Hook: evolucao de peso do usuario no Supabase (grafico em /evolucao).
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchWeightLogs,
  upsertWeightLog,
  type WeightPoint,
} from "@/infrastructure/supabase/log-repository";

// Le e registra os pesos da conta logada (1 registro por dia).
export function useWeightLogs() {
  const { user, status } = useAuth();
  const [points, setPoints] = useState<WeightPoint[]>([]);

  // Recarrega os pesos ao logar/trocar de conta.
  useEffect(() => {
    if (status !== "authenticated" || !user) {
      setPoints([]);
      return;
    }
    let active = true;
    fetchWeightLogs(user.id).then((rows) => {
      if (active) setPoints(rows);
    });
    return () => {
      active = false;
    };
  }, [status, user]);

  // Grava o peso de hoje e atualiza o grafico.
  const addWeight = useCallback(
    async (weightKg: number) => {
      if (!user || Number.isNaN(weightKg)) return;
      await upsertWeightLog(user.id, weightKg);
      setPoints(await fetchWeightLogs(user.id));
    },
    [user],
  );

  return { points, addWeight };
}

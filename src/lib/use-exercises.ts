// Hook de exercicios com React Query (cache 1h, evita rate-limit).
// Fonte: ExerciseDB Free OSS; fallback silencioso para lista vazia.

import { useQuery } from "@tanstack/react-query";
import { exerciseCatalog, type Exercise } from "@/lib/exercisedb";

// Chave do cache (compartilhada entre telas).
export const EXERCISES_KEY = ["exercises"];

// Lista paginada (default 60 itens para o mobile nao pesar).
export function useExercises(limit = 60, offset = 0) {
  return useQuery<Exercise[]>({
    queryKey: [...EXERCISES_KEY, limit, offset],
    // Busca via catalogo (entidade normalizada, ver lib/exercisedb.ts).
    queryFn: () => exerciseCatalog.list(limit, offset),
    // Cache longo: dados de exercicio mudam pouco.
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    // Nao retenta em 429 (rate-limit da tier gratis).
    retry: 1,
  });
}

// Apresentacao: hook de exercicios (React Query, cache 1h).
// Consome o servico da camada de aplicacao; a UI nao conhece a API.

import { useQuery } from "@tanstack/react-query";
import { exerciseCatalog } from "@/application/catalog/exercise-catalog";
import type { Exercise } from "@/domain/catalog/exercise";

// Chave do cache (compartilhada entre telas).
export const EXERCISES_KEY = ["exercises"];

// Lista paginada (default 60 itens para o mobile nao pesar).
export function useExercises(limit = 60, offset = 0) {
  return useQuery<Exercise[]>({
    queryKey: [...EXERCISES_KEY, limit, offset],
    // Busca via catalogo (entidades normalizadas, anti-rajada interno).
    queryFn: () => exerciseCatalog.list(limit, offset),
    // Cache longo: dados de exercicio mudam pouco.
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    // Nao retenta em 429 (rate-limit da tier gratis).
    retry: 1,
  });
}

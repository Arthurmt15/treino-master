// Ponte /exercicios -> /treinos: guarda o exercicio escolhido para a ficha.
// Usa sessionStorage (transitorio, sem persistir no banco).

import type { NewWorkoutItem } from "@/domain/training/workout";

// Chave unica do rascunho pendente.
const KEY = "forma:draft-seed";

// Guarda o exercicio que deve entrar na ficha em montagem.
export function stashDraftSeed(item: NewWorkoutItem): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(item));
}

// Le e limpa o rascunho pendente (consumido uma unica vez).
export function takeDraftSeed(): NewWorkoutItem | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  sessionStorage.removeItem(KEY);
  try {
    return JSON.parse(raw) as NewWorkoutItem;
  } catch {
    return null;
  }
}

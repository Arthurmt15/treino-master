// Seletor de exercicios do catalogo (API) reutilizavel no builder.
// Busca + filtros em memoria e grade 2 colunas com botao "Adicionar".

import { useMemo, useState } from "react";
import { ExerciseCard } from "@/components/fitness/exercise-card";
import { useExercises } from "@/presentation/catalog/use-exercises";
import { exerciseCatalog } from "@/application/catalog/exercise-catalog";
import type { Exercise } from "@/domain/catalog/exercise";

// Opcoes curtas p/ os chips (espelham a API em EN).
export const BODY_PARTS = ["", "chest", "back", "legs", "shoulders", "arms", "waist"];
export const EQUIPMENTS = ["", "barbell", "dumbbell", "cable", "machine", "bodyweight"];

// Props: avisa a ficha qual exercicio foi escolhido.
export function ExercisePicker({ onPick }: { onPick: (exercise: Exercise) => void }) {
  // Filtros locais (frontend-only).
  const [query, setQuery] = useState("");
  const [bodyPart, setBodyPart] = useState("");
  const [equipment, setEquipment] = useState("");
  // Dados da API com cache de 1h (ver use-exercises.ts).
  const { data, isLoading, isError } = useExercises(60, 0);
  // Filtragem em memoria (evita novas requisicoes).
  const items = useMemo(
    () => exerciseCatalog.filter(data ?? [], query, bodyPart, equipment),
    [data, query, bodyPart, equipment],
  );
  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar exercício (ex: bench press)"
        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
        aria-label="Buscar exercício"
      />
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        role="group"
        aria-label="Filtrar por músculo"
      >
        {BODY_PARTS.map((b) => (
          <button
            key={b || "all"}
            type="button"
            onClick={() => setBodyPart(b)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs capitalize ${bodyPart === b ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
          >
            {b || "Todos"}
          </button>
        ))}
      </div>
      <select
        value={equipment}
        onChange={(e) => setEquipment(e.target.value)}
        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
        aria-label="Filtrar por equipamento"
      >
        {EQUIPMENTS.map((e) => (
          <option key={e || "all"} value={e}>
            {e || "Todos os equipamentos"}
          </option>
        ))}
      </select>
      {isLoading && <p className="text-sm text-muted-foreground">Carregando exercícios da API…</p>}
      {isError && (
        <p className="text-sm text-destructive">API indisponível agora. Tente de novo.</p>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((ex) => (
          <ExerciseCard key={ex.exerciseId} exercise={ex} onAdd={() => onPick(ex)} />
        ))}
      </div>
    </div>
  );
}

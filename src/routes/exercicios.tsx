// Tela /exercicios: catalogo da API com busca + filtros + grade.
// Mobile-first: search sticky, chips horizontais, grid 2 colunas.

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FitnessApp } from "@/components/fitness/app";
import { ExerciseCard } from "@/components/fitness/exercise-card";
import { BottomNav } from "@/components/fitness/bottom-nav";
import { useExercises } from "@/presentation/catalog/use-exercises";
import { exerciseCatalog } from "@/application/catalog/exercise-catalog";

// Metadados p/ SEO e preview (padrao do projeto).
export const Route = createFileRoute("/exercicios")({
  head: () => ({
    meta: [
      { title: "Exercícios — forma." },
      { name: "description", content: "Catálogo com GIF, filtro por músculo e busca." },
      { property: "og:title", content: "Exercícios — forma." },
    ],
  }),
  component: ExerciciosPage,
});

// Opcoes curtas p/ os chips (espelham a API em EN).
const BODY_PARTS = ["", "chest", "back", "legs", "shoulders", "arms", "waist"];
const EQUIPMENTS = ["", "barbell", "dumbbell", "cable", "machine", "bodyweight"];

// Pagina do catalogo (usa o shell FitnessApp p/ manter tema).
function ExerciciosPage() {
  // Estado local dos filtros (frontend-only, sem persistencia).
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
    <FitnessApp view="workouts">
      <div className="space-y-3 pb-20">
        {/* Busca por nome ou musculo (debounce natural pelo estado). */}
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar exercício (ex: bench press)" className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" aria-label="Buscar exercício" />
        {/* Chips de regiao corporal (scroll horizontal no mobile). */}
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por músculo">
          {BODY_PARTS.map((b) => (
            <button key={b || "all"} onClick={() => setBodyPart(b)} className={`shrink-0 rounded-full border px-3 py-1 text-xs capitalize ${bodyPart === b ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
              {b || "Todos"}
            </button>
          ))}
        </div>
        {/* Seletor de equipamento. */}
        <select value={equipment} onChange={(e) => setEquipment(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" aria-label="Filtrar por equipamento">
          {EQUIPMENTS.map((e) => (
            <option key={e || "all"} value={e}>{e || "Todos os equipamentos"}</option>
          ))}
        </select>
        {/* Estados: carregando / erro / grade de resultados. */}
        {isLoading && <p className="text-sm text-muted-foreground">Carregando exercícios da API…</p>}
        {isError && <p className="text-sm text-destructive">API indisponível agora. Tente de novo.</p>}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {items.map((ex) => (
            <ExerciseCard key={ex.exerciseId} exercise={ex} onAdd={() => {}} />
          ))}
        </div>
        {/* Tab-bar mobile (desktop usa a sidebar existente). */}
        <BottomNav />
      </div>
    </FitnessApp>
  );
}

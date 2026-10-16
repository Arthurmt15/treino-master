// Tela /exercicios: catalogo da API com busca + filtros + grade.
// "Adicionar" leva o exercicio escolhido para a montagem da ficha em /treinos.

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FitnessApp } from "@/components/fitness/app";
import { ExercisePicker } from "@/components/fitness/exercise-picker";
import { BottomNav } from "@/components/fitness/bottom-nav";
import { stashDraftSeed } from "@/components/fitness/draft-seed";
import type { Exercise } from "@/domain/catalog/exercise";

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

// Pagina do catalogo (usa o shell FitnessApp p/ manter tema).
function ExerciciosPage() {
  const navigate = useNavigate();
  // Encaminha o exercicio para a ficha em montagem e vai para /treinos.
  function addToWorkout(exercise: Exercise) {
    stashDraftSeed({
      exerciseId: exercise.exerciseId,
      name: exercise.name,
      gifUrl: exercise.gifUrl,
      sets: 3,
      reps: "10-12",
      weightKg: 0,
      restSec: 60,
    });
    void navigate({ to: "/treinos" });
  }
  return (
    <FitnessApp view="catalog">
      <div className="space-y-3 pb-20">
        <ExercisePicker onPick={addToWorkout} />
        {/* Tab-bar mobile (desktop usa a sidebar existente). */}
        <BottomNav />
      </div>
    </FitnessApp>
  );
}

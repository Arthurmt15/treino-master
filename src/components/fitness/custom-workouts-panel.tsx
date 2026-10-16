// Painel "Meus treinos": lista fichas próprias, cria, edita, apaga e inicia.
// Concentra o hook useCustomWorkouts; o app só recebe o treino a executar.

import { useEffect, useState } from "react";
import { Pencil, Play, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/fitness/dashboard-widgets";
import {
  CustomWorkoutBuilder,
  type DraftWorkout,
} from "@/components/fitness/custom-workout-builder";
import { WorkoutEditor, type EditedWorkout } from "@/components/fitness/workout-editor";
import { takeDraftSeed } from "@/components/fitness/draft-seed";
import { useCustomWorkouts } from "@/hooks/use-custom-workouts";
import type { NewWorkoutItem, Workout } from "@/domain/training/workout";
import { PLANS } from "@/components/fitness/plans";

// Props: avisa a tela qual ficha iniciar + exibe mensagens.
type Props = {
  onStart: (workout: Workout) => void;
  onNotify: (text: string) => void;
  onStartPlan: (index: number) => void;
};

// Lista e gerencia as fichas próprias do usuário.
export function CustomWorkoutsPanel({ onStart, onNotify, onStartPlan }: Props) {
  const {
    workouts,
    createWorkout,
    addExercise,
    deleteWorkout,
    upsertExercise,
    removeExercise,
    renameWorkout,
    reload,
  } = useCustomWorkouts();
  const [building, setBuilding] = useState(false); // Builder aberto?
  const [seed, setSeed] = useState<NewWorkoutItem[] | undefined>(); // Item vindo do catálogo.
  const [editing, setEditing] = useState<Workout | null>(null); // Ficha em edição.

  // Ao montar, consome o exercício escolhido em /exercicios (abre o builder).
  useEffect(() => {
    const item = takeDraftSeed();
    if (item) {
      setSeed([item]);
      setBuilding(true);
      onNotify(`${item.name} pronto para entrar na sua ficha.`);
    }
  }, [onNotify]);

  // Cria a ficha e persiste os itens montados.
  async function saveDraft(draft: DraftWorkout): Promise<void> {
    const created = await createWorkout(draft.name);
    if (!created) {
      onNotify("Não foi possível criar a ficha agora.");
      return;
    }
    for (const item of draft.items) await addExercise(created.id, item);
    await reload();
    setBuilding(false);
    setSeed(undefined);
    onNotify("Treino criado. Bora treinar!");
  }

  // Persiste as alterações de edição (renomear, atualizar e remover itens).
  async function saveEdited(workout: Workout, edited: EditedWorkout): Promise<void> {
    await renameWorkout(workout.id, edited.name);
    for (const item of edited.items) await upsertExercise(workout.id, item);
    for (const exerciseId of edited.removed) await removeExercise(workout.id, exerciseId);
    await reload();
    setEditing(null);
    onNotify("Treino atualizado.");
  }

  // Confirma e apaga a ficha.
  function confirmDelete(workout: Workout): void {
    if (!window.confirm(`Apagar "${workout.name}"?`)) return;
    void deleteWorkout(workout.id);
    onNotify("Ficha apagada.");
  }

  return (
    <>
      <div className="stat mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <strong className="text-sm">Meus treinos</strong>
          <p className="text-xs text-muted-foreground mt-1">
            {workouts.length === 0
              ? "Monte sua própria ficha e treine do seu jeito."
              : `${workouts.length} ficha(s) criada(s) por você.`}
          </p>
        </div>
        <Button type="button" onClick={() => setBuilding((v) => !v)}>
          <Plus size={14} />
          {building ? "Fechar" : "Montar meu treino"}
        </Button>
      </div>
      {building && (
        <div className="plan-grid mb-5">
          <CustomWorkoutBuilder
            initialItems={seed}
            onSave={(draft) => void saveDraft(draft)}
            onCancel={() => {
              setBuilding(false);
              setSeed(undefined);
            }}
          />
        </div>
      )}
      {editing && (
        <div className="plan-grid mb-5">
          <WorkoutEditor
            workout={editing}
            onSave={(edited) => void saveEdited(editing, edited)}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}
      {workouts.length > 0 && (
        <div className="plan-grid mb-5">
          {workouts.map((w) => (
            <article className="plan-card" key={w.id}>
              <span className="plan-letter">★</span>
              <h2>{w.name}</h2>
              <p>
                {w.items.length} exercício(s) · ~{w.items.length * 5} min
              </p>
              <ul>
                {w.items.map((item) => (
                  <li key={item.exerciseId}>
                    {item.name} · {item.sets}x{item.reps}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <Button onClick={() => onStart(w)}>
                  <Play />
                  Iniciar treino
                </Button>
                <Button
                  variant="outline"
                  aria-label={`Editar ${w.name}`}
                  onClick={() => setEditing(w)}
                >
                  <Pencil />
                </Button>
                <Button
                  variant="outline"
                  aria-label={`Apagar ${w.name}`}
                  onClick={() => confirmDelete(w)}
                >
                  <Trash2 />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
      <SectionTitle title="Treinos prontos" aside="Para começar já" />
      <div className="plan-grid">
        {PLANS.map((plan, index) => (
          <article className="plan-card" key={plan.letter}>
            <span className="plan-letter">{plan.letter}</span>
            <h2>{plan.title}</h2>
            <p>{plan.desc}</p>
            <div className="hero-meta text-muted-foreground">
              <span>{plan.duration} min</span>
              <span>{plan.exercises.length} exercícios</span>
            </div>
            <ul>
              {plan.exercises.map((ex) => (
                <li key={ex}>{ex}</li>
              ))}
            </ul>
            <Button onClick={() => onStartPlan(index)}>
              <Play />
              Iniciar treino
            </Button>
          </article>
        ))}
      </div>
    </>
  );
}

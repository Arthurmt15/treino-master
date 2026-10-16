// Editor de uma ficha existente: renomear, ajustar itens e remover.
// Trabalha num rascunho local e entrega tudo no salvar (quem persiste é o painel).

import { useState } from "react";
import { Check, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkoutItemRow } from "@/components/fitness/workout-item-row";
import { ExercisePicker } from "@/components/fitness/exercise-picker";
import { Workout, WorkoutItem, type NewWorkoutItem } from "@/domain/training/workout";
import type { Exercise } from "@/domain/catalog/exercise";

// Resultado do editor: nome novo, itens finais e ids removidos.
export type EditedWorkout = { name: string; items: NewWorkoutItem[]; removed: string[] };
// Props: ficha + salvar/cancelar.
type Props = {
  workout: Workout;
  onSave: (edited: EditedWorkout) => void;
  onCancel: () => void;
};

// Converte uma entidade WorkoutItem nos dados editáveis.
function toData(item: WorkoutItem): NewWorkoutItem {
  return {
    exerciseId: item.exerciseId,
    name: item.name,
    gifUrl: item.gifUrl,
    sets: item.sets,
    reps: item.reps,
    weightKg: item.weightKg,
    restSec: item.restSec,
  };
}

// Adiciona somando série se o id já existir.
function mergeItem(prev: NewWorkoutItem[], item: NewWorkoutItem): NewWorkoutItem[] {
  const found = prev.find((i) => i.exerciseId === item.exerciseId);
  if (found)
    return prev.map((i) => (i.exerciseId === item.exerciseId ? { ...i, sets: i.sets + 1 } : i));
  return [...prev, item];
}

// Formulário de edição da ficha.
export function WorkoutEditor({ workout, onSave, onCancel }: Props) {
  const [name, setName] = useState(workout.name); // Nome editável.
  const [items, setItems] = useState<NewWorkoutItem[]>(workout.items.map(toData)); // Itens do rascunho.
  const [removed, setRemoved] = useState<string[]>([]); // Ids marcados para excluir.
  const [showCatalog, setShowCatalog] = useState(false); // Picker do catálogo aberto?

  // Aplica um patch parcial (séries/peso/reps) em um item.
  function patchItem(exerciseId: string, patch: Partial<NewWorkoutItem>): void {
    setItems((prev) => prev.map((i) => (i.exerciseId === exerciseId ? { ...i, ...patch } : i)));
  }

  // Remove do rascunho e marca para excluir no banco.
  function removeItem(exerciseId: string): void {
    setItems((prev) => prev.filter((i) => i.exerciseId !== exerciseId));
    setRemoved((prev) => [...prev, exerciseId]);
  }

  // Adiciona um exercício do catálogo ao rascunho.
  function addFromCatalog(exercise: Exercise): void {
    setRemoved((prev) => prev.filter((id) => id !== exercise.exerciseId)); // Reverte remoção pendente.
    setItems((prev) =>
      mergeItem(prev, {
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        gifUrl: exercise.gifUrl,
        sets: 3,
        reps: "10-12",
        weightKg: 0,
        restSec: 60,
      }),
    );
  }

  return (
    <article className="plan-card">
      <span className="plan-letter">✎</span>
      <h2>Editar treino</h2>
      <div className="profile-fields" style={{ gridTemplateColumns: "1fr" }}>
        <label>
          Nome do treino
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
      </div>
      {/* Itens atuais com steppers de edição */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <WorkoutItemRow
            key={item.exerciseId}
            item={WorkoutItem.fromData(item, index)}
            onChange={(patch) => patchItem(item.exerciseId, patch)}
            onRemove={() => removeItem(item.exerciseId)}
          />
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" type="button" onClick={() => setShowCatalog((v) => !v)}>
          <Search size={14} /> {showCatalog ? "Fechar catálogo" : "Adicionar do catálogo"}
        </Button>
      </div>
      {showCatalog && <ExercisePicker onPick={addFromCatalog} />}
      <div className="flex gap-3 mt-4">
        <Button
          type="button"
          onClick={() => onSave({ name: name.trim(), items, removed })}
          disabled={!name.trim() || items.length === 0}
        >
          <Check size={14} /> Salvar alterações
        </Button>
        <Button variant="ghost" type="button" onClick={onCancel}>
          <Trash2 size={14} /> Cancelar
        </Button>
      </div>
    </article>
  );
}

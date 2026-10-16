// Builder de treino próprio: nome da ficha + exercícios (manual ou catálogo).
// Entrega nome + itens ao salvar; quem persiste é o hook use-custom-workouts.
import { useState } from "react";
import { Check, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExercisePicker } from "@/components/fitness/exercise-picker";
import type { NewWorkoutItem } from "@/domain/training/workout";
import type { Exercise } from "@/domain/catalog/exercise";

// Dados que o builder devolve ao salvar a ficha.
export type DraftWorkout = { name: string; items: NewWorkoutItem[] };
// Props: salvar/cancelar + itens iniciais (vindos do catálogo).
type Props = {
  onSave: (draft: DraftWorkout) => void;
  onCancel: () => void;
  initialItems?: NewWorkoutItem[] | undefined;
};
// Campos do formulário de um exercício digitado à mão.
type ExerciseForm = { name: string; sets: string; reps: string; weightKg: string; restSec: string };
// Valores iniciais do formulário (3x10-12, peso corporal, 60s).
const EMPTY_EXERCISE: ExerciseForm = {
  name: "",
  sets: "3",
  reps: "10-12",
  weightKg: "0",
  restSec: "60",
};

// Gera id único p/ exercício digitado à mão (não deduplica por nome).
function customId(): string {
  return `custom_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6)}`;
}

// Adiciona somando série se o id já existir (evita item duplicado).
function mergeItem(prev: NewWorkoutItem[], item: NewWorkoutItem): NewWorkoutItem[] {
  const found = prev.find((i) => i.exerciseId === item.exerciseId);
  if (found)
    return prev.map((i) => (i.exerciseId === item.exerciseId ? { ...i, sets: i.sets + 1 } : i));
  return [...prev, item];
}

// Monta o formulário de criação da ficha própria.
export function CustomWorkoutBuilder({ onSave, onCancel, initialItems = [] }: Props) {
  const [name, setName] = useState(""); // Nome da ficha.
  const [items, setItems] = useState<NewWorkoutItem[]>(initialItems); // Exercícios da ficha.
  const [form, setForm] = useState<ExerciseForm>(EMPTY_EXERCISE); // Exercício sendo digitado.
  const [showCatalog, setShowCatalog] = useState(false); // Picker do catálogo aberto?
  const [hint, setHint] = useState(""); // Aviso curto (ex.: exercício somado).

  // Adiciona o exercício digitado à lista (exige nome).
  function addItem(): void {
    if (!form.name.trim()) return;
    setItems((prev) =>
      mergeItem(prev, {
        exerciseId: customId(),
        name: form.name.trim(),
        gifUrl: "",
        sets: Math.max(1, parseInt(form.sets, 10) || 3),
        reps: form.reps.trim() || "10-12",
        weightKg: Math.max(0, parseFloat(form.weightKg.replace(",", ".")) || 0),
        restSec: Math.max(0, parseInt(form.restSec, 10) || 60),
      }),
    );
    setForm(EMPTY_EXERCISE);
  }

  // Adiciona um exercício escolhido no catálogo (id real => deduplica).
  function addFromCatalog(exercise: Exercise): void {
    const already = items.some((i) => i.exerciseId === exercise.exerciseId);
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
    setHint(
      already ? "Exercício já estava na ficha — somei 1 série." : `${exercise.name} adicionado.`,
    );
  }

  // Remove exercício da lista pelo id.
  function removeItem(exerciseId: string): void {
    setItems((prev) => prev.filter((i) => i.exerciseId !== exerciseId));
  }

  // Salva a ficha (exige nome + ao menos 1 exercício).
  function save(): void {
    if (!name.trim() || items.length === 0) return;
    onSave({ name: name.trim(), items });
  }

  return (
    <article className="plan-card">
      <span className="plan-letter">+</span>
      <h2>Novo treino</h2>
      <p>Monte sua própria ficha: nomeie e adicione os exercícios.</p>
      {/* Nome da ficha */}
      <div className="profile-fields" style={{ gridTemplateColumns: "1fr" }}>
        <label>
          Nome do treino
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Meu treino de pernas"
            required
          />
        </label>
      </div>
      {/* Exercícios já incluídos */}
      {items.length > 0 && (
        <ul>
          {items.map((item) => (
            <li key={item.exerciseId} className="flex items-center justify-between gap-2">
              <span>
                {item.name} · {item.sets}x{item.reps}
                {item.weightKg > 0 ? ` · ${item.weightKg} kg` : ""} · {item.restSec}s
              </span>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                aria-label={`Remover ${item.name}`}
                onClick={() => removeItem(item.exerciseId)}
              >
                <Trash2 size={14} />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {/* Alterna a busca no catálogo da API. */}
      <div className="flex gap-3">
        <Button variant="secondary" type="button" onClick={() => setShowCatalog((v) => !v)}>
          <Search size={14} /> {showCatalog ? "Fechar catálogo" : "Buscar no catálogo"}
        </Button>
      </div>
      {showCatalog && <ExercisePicker onPick={addFromCatalog} />}
      {/* Formulário do próximo exercício (digitação manual) */}
      <div className="profile-fields">
        <label>
          Exercício
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex.: Agachamento livre"
          />
        </label>
        <label>
          Séries
          <input
            type="number"
            min={1}
            value={form.sets}
            onChange={(e) => setForm({ ...form, sets: e.target.value })}
          />
        </label>
        <label>
          Reps
          <input
            value={form.reps}
            onChange={(e) => setForm({ ...form, reps: e.target.value })}
            placeholder="10-12"
          />
        </label>
        <label>
          Peso (kg)
          <input
            type="number"
            min={0}
            step={0.5}
            value={form.weightKg}
            onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
          />
        </label>
        <label>
          Descanso (s)
          <input
            type="number"
            min={0}
            step={10}
            value={form.restSec}
            onChange={(e) => setForm({ ...form, restSec: e.target.value })}
          />
        </label>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" type="button" onClick={addItem} disabled={!form.name.trim()}>
          <Plus size={14} /> Adicionar exercício
        </Button>
      </div>
      <div className="flex gap-3 mt-4">
        <Button type="button" onClick={save} disabled={!name.trim() || items.length === 0}>
          <Check size={14} /> Salvar treino
        </Button>
        <Button variant="ghost" type="button" onClick={onCancel}>
          <X size={14} /> Cancelar
        </Button>
      </div>
    </article>
  );
}

// Linha editavel da ficha: GIF + steppers series/reps/peso + excluir.
// Mobile-first: controles grandes (44px) e layout compacto.

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WORKOUT_PT } from "@/shared/pt-br";
import type { NewWorkoutItem, WorkoutItem } from "@/domain/training/workout";

// Props: item atual + callbacks de edicao/exclusao.
type Props = {
  item: WorkoutItem;
  onChange: (patch: Partial<NewWorkoutItem>) => void;
  onRemove: () => void;
};

// Stepper numerico reutilizavel (series, peso, descanso).
function Stepper({ value, min, step, onChange, label }: { value: number; min: number; step: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center gap-1" aria-label={label}>
      {/* Decrementa respeitando o minimo. */}
      <Button size="icon" variant="outline" onClick={() => onChange(Math.max(min, +(value - step).toFixed(1)))} aria-label={`Diminuir ${label}`}>
        <Minus size={12} />
      </Button>
      <strong className="w-10 text-center text-xs">{value}</strong>
      {/* Incrementa pelo passo (0.5 p/ peso fracionado). */}
      <Button size="icon" variant="outline" onClick={() => onChange(+(value + step).toFixed(1))} aria-label={`Aumentar ${label}`}>
        <Plus size={12} />
      </Button>
    </div>
  );
}

// Linha completa do exercicio dentro do treino.
export function WorkoutItemRow({ item, onChange, onRemove }: Props) {
  return (
    <article className="flex gap-2 rounded-xl border border-border bg-card p-2">
      {/* Miniatura do movimento (GIF da API). */}
      {item.gifUrl ? <img src={item.gifUrl} alt={item.name} loading="lazy" className="size-16 shrink-0 rounded-lg object-cover" /> : null}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-1">
          {/* Nome + botao excluir. */}
          <h3 className="truncate text-xs font-semibold capitalize">{item.name}</h3>
          <Button size="icon" variant="ghost" onClick={onRemove} aria-label={`Remover ${item.name}`}>
            <Trash2 size={14} />
          </Button>
        </div>
        {/* Series (inteiro, min 1). */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{WORKOUT_PT.sets}</span>
          <Stepper value={item.sets} min={1} step={1} onChange={(v) => onChange({ sets: Math.round(v) })} label="Séries" />
        </div>
        {/* Peso em kg (0 = peso corporal). */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{WORKOUT_PT.weight}</span>
          <Stepper value={item.weightKg} min={0} step={2.5} onChange={(v) => onChange({ weightKg: v })} label="Peso" />
        </div>
        {/* Reps como texto ("10-12", "30s") p/ cardio e faixas. */}
        <label className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          {WORKOUT_PT.reps}
          <input value={item.reps} onChange={(e) => onChange({ reps: e.target.value })} className="w-20 rounded-md border border-border bg-background px-2 py-1 text-right text-xs" inputMode="text" />
        </label>
      </div>
    </article>
  );
}

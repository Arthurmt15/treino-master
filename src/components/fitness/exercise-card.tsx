// Card de exercicio (mobile-first): GIF lazy + nome + badges.
// Usado na grade de /exercicios e na busca.

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pt, BODY_PARTS_PT, EQUIPMENT_PT } from "@/shared/pt-br";
import type { Exercise } from "@/domain/catalog/exercise";

// Props do card (exercicio + acao de adicionar ao treino).
type Props = {
  exercise: Exercise;
  onAdd: (exercise: Exercise) => void;
};

// Cartao compacto 2-col no mobile (leve p/ economizar dados).
export function ExerciseCard({ exercise, onAdd }: Props) {
  // Primeiro equipamento/musculo para o resumo do card.
  const equip = exercise.equipments[0] ?? "";
  const muscle = exercise.targetMuscles[0] ?? exercise.bodyParts[0] ?? "";
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card">
      {/* GIF demonstrativo (lazy, sem autoplay forcado na lista). */}
      {exercise.gifUrl ? (
        <img
          src={exercise.gifUrl}
          alt={exercise.name}
          loading="lazy"
          className="aspect-square w-full object-cover"
        />
      ) : (
        <div className="flex aspect-square items-center justify-center text-xs text-muted-foreground">
          Sem imagem
        </div>
      )}
      <div className="space-y-1 p-2">
        {/* Nome original da API (EN na v1). */}
        <h3 className="line-clamp-2 text-xs font-semibold capitalize">{exercise.name}</h3>
        {/* Badges traduzidas (musculo + equipamento). */}
        <p className="text-[11px] text-muted-foreground">
          {muscle ? pt(BODY_PARTS_PT, muscle) : "—"} · {equip ? pt(EQUIPMENT_PT, equip) : "Livre"}
        </p>
        {/* Adiciona a ficha ativa (abre bottom-sheet na pagina). */}
        <Button
          size="sm"
          variant="secondary"
          className="w-full"
          onClick={() => onAdd(exercise)}
          aria-label={`Adicionar ${exercise.name}`}
        >
          <Plus size={14} /> Adicionar
        </Button>
      </div>
    </article>
  );
}

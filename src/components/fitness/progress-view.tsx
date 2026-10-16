// Aba "Evolução": gráfico de peso e conquistas calculadas dos dados reais.

import { Flame, Target, Trophy, Weight } from "lucide-react";
import { SectionTitle } from "@/components/fitness/dashboard-widgets";
import { WeightChart } from "@/components/fitness/weight-chart";
import { achievements } from "@/components/fitness/dashboard-data";
import type { WorkoutLog, WeightPoint } from "@/infrastructure/supabase/log-repository";

// Props: histórico, pesos e meta semanal.
type Props = {
  logs: WorkoutLog[];
  weightPoints: WeightPoint[];
  weightKg: number | null;
  weeklyTarget: number;
};

// Ícones fixos das conquistas (mesma ordem do helper).
const ICONS = [Trophy, Flame, Target, Weight];

// Painel de evolução e conquistas.
export function ProgressView({ logs, weightPoints, weightKg, weeklyTarget }: Props) {
  // Variação de peso no período registrado.
  const delta =
    weightPoints.length > 1
      ? weightPoints[weightPoints.length - 1]!.weight - weightPoints[0]!.weight
      : 0;
  const cards = achievements(logs, weeklyTarget, delta);
  return (
    <>
      <SectionTitle title="Peso corporal" aside="Seu progresso nos últimos 30 dias" />
      <WeightChart points={weightPoints} current={weightKg} />
      <div className="mt-8">
        <SectionTitle title="Suas conquistas" />
        <div className="stats-grid">
          {cards.map(({ title, text }, index) => {
            const Icon = ICONS[index] ?? Trophy;
            return (
              <article className="stat" key={title}>
                <Icon className="text-primary mb-4" />
                <strong className="text-sm">{title}</strong>
                <p className="text-xs text-muted-foreground mt-2">{text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}

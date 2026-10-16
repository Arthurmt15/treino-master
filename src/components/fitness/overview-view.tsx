// Aba "Visão geral": treino de hoje, painel da semana, evolução e últimos treinos.
// Usa dados reais (semana/streak) + estado local da água.

import {
  Activity,
  ArrowRight,
  Check,
  Clock3,
  Dumbbell,
  GlassWater,
  Play,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionTitle, RecentList } from "@/components/fitness/dashboard-widgets";
import { WeightChart } from "@/components/fitness/weight-chart";
import { PLANS } from "@/components/fitness/plans";
import {
  trainedDays,
  weekDates,
  weekRangeLabel,
  weeklyCount,
} from "@/components/fitness/dashboard-data";
import gymBanner from "@/assets/gym-banner.jpg";
import type { WorkoutLog, WeightPoint } from "@/infrastructure/supabase/log-repository";

// Props: dados do banco + estado local de água + iniciar treino pronto.
type Props = {
  logs: WorkoutLog[];
  weightKg: number | null;
  weightPoints: WeightPoint[];
  weeklyTarget: number;
  water: number;
  onAddWater: () => void;
  onStartPlan: (index: number) => void;
};

// Painel inicial do aluno.
export function OverviewView({
  logs,
  weightKg,
  weightPoints,
  weeklyTarget,
  water,
  onAddWater,
  onStartPlan,
}: Props) {
  const days = trainedDays(logs); // Dias com treino (para marcar a semana).
  const week = weekDates(); // Sete dias da semana atual.
  const done = weeklyCount(logs); // Treinos concluídos nesta semana.
  const goal = Math.max(1, weeklyTarget);
  const pct = Math.min(100, Math.round((done / goal) * 100));
  const plan = PLANS[0]!; // Treino em destaque no hero.

  return (
    <>
      <div className="middle-grid">
        <section className="workout-hero">
          <img
            src={gymBanner}
            alt="Halteres e equipamentos de uma academia"
            width={1536}
            height={1024}
          />
          <div className="hero-content">
            <div className="eyebrow">
              <span className="size-1.5 rounded-full bg-primary" /> SEU TREINO DE HOJE
            </div>
            <h2>{plan.title}</h2>
            <p>Construa força. Supere seus limites.</p>
            <div className="hero-meta">
              <span>
                <Dumbbell />
                Treino {plan.letter}
              </span>
              <span>
                <Clock3 />
                {plan.duration} min
              </span>
              <span>
                <Activity />
                {plan.exercises.length} exercícios
              </span>
            </div>
            <Button onClick={() => onStartPlan(0)}>
              <Play size={14} fill="currentColor" />
              Iniciar treino
              <ArrowRight size={14} />
            </Button>
          </div>
        </section>
        <section className="week-panel">
          <SectionTitle title="Sua semana" aside={weekRangeLabel()} />
          <div className="week-days">
            {week.map((d) => (
              <div key={d.label} className={`day ${d.isToday ? "today" : ""}`}>
                <small>{d.label}</small>
                <strong>{d.day}</strong>
                {days.has(d.iso) ? <Check /> : <span className="day-dot" />}
              </div>
            ))}
          </div>
          <div className="week-progress">
            <span>Meta semanal</span>
            <strong>
              {done} de {goal} treinos
            </strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="water">
            <div className="water-top">
              <div className="water-title">
                <GlassWater />
                Hidratação
              </div>
              <span className="water-value">
                <strong>{(water * 0.25).toFixed(1).replace(".", ",")} L</strong> / 2,5 L
              </span>
            </div>
            <div className="water-bottom">
              <div className="water-glasses">
                {Array.from({ length: 10 }, (_, i) => (
                  <GlassWater key={i} className={i < water ? "filled" : ""} />
                ))}
              </div>
              <Button
                variant="secondary"
                aria-label="Adicionar 250 ml de água"
                disabled={water >= 10}
                onClick={onAddWater}
              >
                <Plus size={12} />
                250 ml
              </Button>
            </div>
          </div>
        </section>
      </div>
      <div className="bottom-grid">
        <section>
          <SectionTitle title="Sua evolução" to="/evolucao" />
          <WeightChart points={weightPoints} current={weightKg} />
        </section>
        <section>
          <SectionTitle title="Últimos treinos" to="/historico" />
          <RecentList rows={logs.slice(0, 3)} />
        </section>
      </div>
    </>
  );
}

// Widgets compartilhados do painel: marca, titulos, stats, lista e modal.
// Extraidos do app.tsx para manter cada arquivo pequeno e focado.

import { Link } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { ArrowRight, Check, Clock3, Dumbbell, Target, Weight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { monthlyTarget } from "@/components/fitness/dashboard-data";
import type { WorkoutLog } from "@/infrastructure/supabase/log-repository";

// Marca "forma." usada na sidebar e no topo mobile.
export function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">
        <Dumbbell size={21} />
      </span>
      <span className="brand-name">
        forma<span className="brand-dot">.</span>
      </span>
    </div>
  );
}

// Cabecalho de secao com link "Ver tudo" ou um texto secundario.
export function SectionTitle({
  title,
  to,
  aside,
}: {
  title: string;
  to?: "/evolucao" | "/historico";
  aside?: string;
}) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {to ? (
        <Link to={to}>
          Ver tudo
          <ArrowRight size={12} />
        </Link>
      ) : (
        <span className="text-[10px] text-muted-foreground">{aside}</span>
      )}
    </div>
  );
}

// Cartoes de estatistica (treinos, tempo, peso e meta do mes).
export function Stats({
  history,
  weightKg,
  weeklyTarget,
}: {
  history: WorkoutLog[];
  weightKg: number | null;
  weeklyTarget: number;
}) {
  const minutes = history.reduce((sum, row) => sum + row.durationMin, 0);
  const hours = (minutes / 60).toFixed(1).replace(".", ",");
  const weight = weightKg ? weightKg.toFixed(1).replace(".", ",") : "—";
  const month = new Date().getMonth();
  const thisMonth = history.filter((row) => {
    const d = row.finishedAt ? new Date(row.finishedAt) : null;
    return d ? d.getMonth() === month : false;
  }).length;
  const goal = monthlyTarget(weeklyTarget);
  const meta = Math.min(100, Math.round((thisMonth / goal) * 100));
  const cards = [
    {
      label: "Treinos no mês",
      value: String(thisMonth),
      unit: "treinos",
      icon: Dumbbell,
      change: `${thisMonth}`,
      detail: "neste mês",
    },
    {
      label: "Tempo de treino",
      value: hours,
      unit: "horas",
      icon: Clock3,
      change: `${minutes} min`,
      detail: "no total",
    },
    {
      label: "Peso atual",
      value: weight,
      unit: "kg",
      icon: Weight,
      change: weight === "—" ? "—" : "atual",
      detail: "último registro",
    },
    {
      label: "Meta mensal",
      value: String(meta),
      unit: "%",
      icon: Target,
      change: `${thisMonth} de ${goal}`,
      detail: "treinos concluídos",
    },
  ];
  return (
    <div className="stats-grid">
      {cards.map(({ label, value, unit, icon: Icon, change, detail }) => (
        <article className="stat" key={label}>
          <div className="stat-top">
            <span>{label}</span>
            <Icon />
          </div>
          <div className="stat-value">
            {value} <span>{unit}</span>
          </div>
          <div className="stat-footer">
            <em>{change}</em>
            {detail}
          </div>
        </article>
      ))}
    </div>
  );
}

// Lista de treinos concluidos (historico e resumo do inicio).
export function RecentList({ rows }: { rows: WorkoutLog[] }) {
  if (rows.length === 0)
    return (
      <p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Nenhum treino registrado ainda. Conclua um treino para ver seu histórico aqui.
      </p>
    );
  return (
    <div className="recent-list">
      {rows.map((item, index) => (
        <article className="recent-item" key={`${item.date}-${index}`}>
          <span className="workout-icon">
            <Dumbbell />
          </span>
          <div className="recent-info">
            <h3>{item.title}</h3>
            <p>
              {item.date} <span className="mx-1">·</span> {item.duration}{" "}
              <span className="mx-1">·</span> {item.exercises} exercícios
            </p>
          </div>
          <Check className="completed" aria-label="Concluído" />
        </article>
      ))}
    </div>
  );
}

// Modal generico (fecha com Esc ou clique no fundo).
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    function close(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", close);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", close);
      document.body.style.overflow = old;
    };
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <Button variant="ghost" size="icon" aria-label="Fechar" onClick={onClose} autoFocus>
            <X />
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}

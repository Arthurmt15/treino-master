// Grafico de evolucao de peso (Recharts) com filtro de periodo.
// Recebe os pontos do banco; nao faz I/O.

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeightPoint } from "@/infrastructure/supabase/log-repository";

// Painel com numero atual, variacao e area chart.
export function WeightChart({
  points,
  current,
}: {
  points: WeightPoint[];
  current: number | null;
}) {
  const [period, setPeriod] = useState("30");
  const data = period === "7" ? points.slice(-3) : points;
  const currentLabel = current ? current.toFixed(1).replace(".", ",") : "—";
  const change = data.length > 1 ? data[data.length - 1]!.weight - data[0]!.weight : 0;
  const changeLabel = `${change <= 0 ? "↘" : "↗"} ${Math.abs(change).toFixed(1).replace(".", ",")} kg`;
  const values = data.map((d) => d.weight);
  const domain: [number, number] = values.length
    ? [Math.floor(Math.min(...values) - 1), Math.ceil(Math.max(...values) + 1)]
    : [0, 100];
  return (
    <div className="chart-panel">
      <div className="chart-heading">
        <div>
          <h3>Peso corporal</h3>
          <div className="flex items-center">
            <strong className="chart-number">
              {currentLabel} <span>kg</span>
            </strong>
            {data.length > 1 && <span className="chart-change">{changeLabel}</span>}
          </div>
        </div>
        <select
          className="chart-select"
          aria-label="Período da evolução"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="30">Últimos 30 dias</option>
          <option value="7">Últimos 7 dias</option>
        </select>
      </div>
      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Registre seu peso no perfil para ver a evolução.
        </p>
      ) : (
        <div className="chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="weight-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.17} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 9 }}
                minTickGap={20}
                dy={7}
              />
              <YAxis
                domain={domain}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 9 }}
              />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="rounded-md border border-border bg-card p-2 text-xs">
                      {payload[0]?.value} kg
                    </div>
                  ) : null
                }
              />
              <Area
                dataKey="weight"
                type="monotone"
                stroke="var(--chart-line)"
                strokeWidth={2}
                fill="url(#weight-fill)"
                dot={false}
                activeDot={{ r: 4, fill: "var(--primary)" }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="chart-caption">
        <i />
        Peso registrado <span className="ml-auto">Atualizado hoje</span>
      </div>
    </div>
  );
}

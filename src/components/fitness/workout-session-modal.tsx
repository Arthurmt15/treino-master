// Modal de execução do treino: check por exercício + timer de descanso.
// Não faz I/O: recebe as linhas prontas e avisa quando concluir.

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/fitness/dashboard-widgets";

// Linha exibida no modal (já formatada pela tela).
export type SessionRow = { key: string; title: string; sub: string; restSec: number };

// Props: título, resumo, linhas e callbacks.
type Props = {
  title: string;
  summary: string;
  rows: SessionRow[];
  onFinish: () => void;
  onClose: () => void;
};

// Conta os segundos do descanso e libera ao chegar em zero.
export function WorkoutSessionModal({ title, summary, rows, onFinish, onClose }: Props) {
  const [checked, setChecked] = useState<number[]>([]); // Índices concluídos.
  const [rest, setRest] = useState<{ seconds: number } | null>(null); // Descanso ativo.

  // Marca/desmarca um exercício; ao marcar, inicia o descanso do item.
  function toggle(index: number, on: boolean): void {
    setChecked((prev) => (on ? [...prev, index] : prev.filter((i) => i !== index)));
    if (on && rows[index] && rows[index]!.restSec > 0) setRest({ seconds: rows[index]!.restSec });
  }

  // Decrementa o descanso a cada segundo até zerar.
  useEffect(() => {
    if (!rest) return;
    if (rest.seconds <= 0) {
      setRest(null);
      return;
    }
    const id = window.setTimeout(() => setRest({ seconds: rest.seconds - 1 }), 1000);
    return () => window.clearTimeout(id);
  }, [rest]);

  const allDone = rows.length > 0 && checked.length === rows.length;
  return (
    <Modal title={title} onClose={onClose}>
      <p>
        {checked.length} de {rows.length} concluídos · {summary}
      </p>
      {/* Faixa de descanso (aparece após marcar um exercício). */}
      {rest && (
        <div className="rest-timer" role="status">
          <span>
            Descanso: <strong>{rest.seconds}s</strong>
          </span>
          <Button variant="secondary" size="sm" onClick={() => setRest(null)}>
            Pular
          </Button>
        </div>
      )}
      {rows.map((row, index) => (
        <label className="exercise-row" key={row.key}>
          <input
            type="checkbox"
            checked={checked.includes(index)}
            onChange={(e) => toggle(index, e.target.checked)}
          />
          <div>
            <strong>{row.title}</strong>
            <small>{row.sub}</small>
          </div>
        </label>
      ))}
      <Button className="modal-action" disabled={!allDone} onClick={onFinish}>
        <Check />
        Concluir treino
      </Button>
    </Modal>
  );
}

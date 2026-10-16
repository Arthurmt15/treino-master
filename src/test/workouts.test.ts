// Testes das entidades de treino (WorkoutItem/Workout) — camada de dominio.
// Sem I/O: exercitamos as regras puras (volume, duplicata, revive).

import { describe, expect, it } from "vitest";
import { Workout, WorkoutItem, type NewWorkoutItem } from "@/domain/training/workout";

// Item padrao (supino 3x10-12 com 20kg).
function bench(): NewWorkoutItem {
  return {
    exerciseId: "EIeI8Vf",
    name: "barbell bench press",
    gifUrl: "https://static.exercisedb.dev/media/EIeI8Vf.gif",
    sets: 3,
    reps: "10-12",
    weightKg: 20,
    restSec: 60,
  };
}

describe("WorkoutItem", () => {
  it("calcula volume (sets x reps x peso)", () => {
    // 3 series x 10 reps x 20kg = 600.
    expect(WorkoutItem.fromData(bench(), 0).volume()).toBe(600);
  });

  it("peso corporal (0kg) zera o volume", () => {
    const item = WorkoutItem.fromData({ ...bench(), weightKg: 0 }, 0);
    expect(item.volume()).toBe(0);
  });

  it("aplica patch parcial", () => {
    const item = WorkoutItem.fromData(bench(), 0);
    item.patch({ weightKg: 25 });
    expect(item.weightKg).toBe(25);
    expect(item.sets).toBe(3);
  });
});

describe("Workout", () => {
  it("duplicata soma serie em vez de repetir item", () => {
    // Adiciona o supino 2x: 1 item com 4 series (3+1).
    const workout = new Workout("w1", "A");
    workout.addItem(bench());
    workout.addItem(bench());
    expect(workout.items).toHaveLength(1);
    expect(workout.items[0]?.sets).toBe(4);
  });

  it("edita peso e remove item", () => {
    const workout = new Workout("w2", "B");
    workout.addItem(bench());
    workout.updateItem("EIeI8Vf", { weightKg: 25 });
    expect(workout.items[0]?.weightKg).toBe(25);
    workout.removeItem("EIeI8Vf");
    expect(workout.items).toHaveLength(0);
  });

  it("totalVolume soma os itens (peso corporal nao soma)", () => {
    const workout = new Workout("w3", "C");
    workout.addItem(bench()); // 3x10x20 = 600
    workout.addItem({ ...bench(), exerciseId: "x2", name: "plank", reps: "30s", weightKg: 0 }); // 0
    expect(workout.totalVolume()).toBe(600);
  });

  it("sobrevive a serializacao (revive apos JSON)", () => {
    const workout = new Workout("w4", "D");
    workout.addItem(bench());
    // Simula reload: serializa e revive como entidade.
    const raw = JSON.parse(JSON.stringify(workout));
    const reloaded = Workout.revive(raw);
    expect(reloaded).toBeInstanceOf(Workout);
    expect(reloaded.totalVolume()).toBe(600);
  });
});

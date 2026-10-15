// Testes das entidades de treino (OOP: WorkoutItem/Workout/WorkoutStore).
// jsdom ja fornece localStorage; usamos Map isolado por teste.

import { beforeEach, describe, expect, it } from "vitest";
import { Workout, WorkoutItem, WorkoutStore } from "@/lib/workouts";

// Item padrao (supino 3x10-12 com 20kg).
function bench() {
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

// Store novo com memoria isolada a cada caso.
let store: WorkoutStore;
beforeEach(() => {
  store = new WorkoutStore("teste", new Map<string, string>());
});

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

describe("Workout + WorkoutStore", () => {
  it("cria ficha vazia e lista", () => {
    const created = store.create("A - Peito");
    expect(created).toBeInstanceOf(Workout);
    expect(store.load()).toHaveLength(1);
  });

  it("duplicata soma serie em vez de repetir item", () => {
    // Adiciona o supino 2x: 1 item com 4 series (3+1).
    const created = store.create("A");
    store.addItem(created.id, bench());
    const next = store.addItem(created.id, bench());
    const saved = next.find((w) => w.id === created.id) as Workout;
    expect(saved.items).toHaveLength(1);
    expect(saved.items[0]?.sets).toBe(4);
  });

  it("edita peso e remove item", () => {
    const created = store.create("B");
    store.addItem(created.id, bench());
    const edited = store.updateItem(created.id, "EIeI8Vf", { weightKg: 25 });
    expect(edited[0]?.items[0]?.weightKg).toBe(25);
    const removed = store.removeItem(created.id, "EIeI8Vf");
    expect(removed[0]?.items).toHaveLength(0);
  });

  it("totalVolume soma os itens (peso corporal nao soma)", () => {
    const created = store.create("C");
    store.addItem(created.id, bench()); // 3x10x20 = 600
    store.addItem(created.id, { ...bench(), exerciseId: "x2", name: "plank", reps: "30s", weightKg: 0 }); // 0
    const [saved] = store.load();
    expect(saved?.totalVolume()).toBe(600);
  });

  it("sobrevive a serializacao (revive apos JSON)", () => {
    // Simula reload: nova instancia lendo o mesmo storage.
    const created = store.create("D");
    store.addItem(created.id, bench());
    const raw = (store as unknown as { storage: Map<string, string> }).storage;
    const reloaded = new WorkoutStore("teste", raw).load();
    expect(reloaded[0]).toBeInstanceOf(Workout);
    expect(reloaded[0]?.totalVolume()).toBe(600);
  });
});

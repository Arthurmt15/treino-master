// Shared kernel (DDD): dicionario PT-BR das labels da API (em ingles).
// V1: traduz filtros e campos; nomes/instrucoes seguem em EN.

export const BODY_PARTS_PT: Record<string, string> = {
  chest: "Peito",
  back: "Costas",
  legs: "Pernas",
  shoulders: "Ombros",
  arms: "Braços",
  waist: "Abdômen",
  cardio: "Cardio",
  neck: "Pescoço",
  // Valores compostos que a API tambem retorna.
  "upper legs": "Pernas (superior)",
  "lower legs": "Panturrilha",
  "upper arms": "Braços (superior)",
  "lower arms": "Antebraço",
};

// Equipamentos traduzidos para o filtro e o detalhe.
export const EQUIPMENT_PT: Record<string, string> = {
  barbell: "Barra",
  dumbbell: "Halter",
  cable: "Cabo",
  machine: "Máquina",
  bodyweight: "Peso corporal",
  band: "Faixa",
  kettlebell: "Kettlebell",
  smith: "Smith",
  "ez-bar": "Barra W",
  lever: "Alavanca",
  other: "Outro",
  none: "Sem equipamento",
};

// Campos da ficha de treino (series/reps/peso/descanso).
export const WORKOUT_PT = {
  sets: "Séries",
  reps: "Reps",
  weight: "Peso (kg)",
  rest: "Descanso (s)",
  save: "Salvar treino",
  clear: "Limpar",
  add: "Adicionar",
  empty: "Nenhum exercício ainda. Toque + para montar.",
} as const;

// Traduz com fallback para o original (evita tela vazia).
export function pt(map: Record<string, string>, key: string): string {
  return map[key.toLowerCase()] ?? key;
}

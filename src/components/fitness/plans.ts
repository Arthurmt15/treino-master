// Fichas prontas (demonstrativas) exibidas em "Treinos prontos".
// A/B/C basicas para quem ainda nao montou o proprio treino.

// Modelo de uma ficha pronta.
export type Plan = {
  letter: string;
  title: string;
  desc: string;
  exercises: string[];
  duration: number;
};

// Lista fixa de treinos prontos.
export const PLANS: Plan[] = [
  {
    letter: "A",
    title: "Peito & tríceps",
    desc: "Um passo mais perto da sua melhor versão.",
    exercises: [
      "Supino reto com barra",
      "Supino inclinado com halteres",
      "Crucifixo na máquina",
      "Tríceps na polia",
      "Tríceps francês",
      "Flexão de braços",
    ],
    duration: 55,
  },
  {
    letter: "B",
    title: "Costas & bíceps",
    desc: "Força e controle em cada repetição.",
    exercises: [
      "Puxada frontal",
      "Remada curvada",
      "Remada unilateral",
      "Rosca direta",
      "Rosca martelo",
    ],
    duration: 50,
  },
  {
    letter: "C",
    title: "Pernas & ombros",
    desc: "Uma base forte para ir mais longe.",
    exercises: [
      "Agachamento livre",
      "Leg press",
      "Cadeira extensora",
      "Mesa flexora",
      "Desenvolvimento",
      "Elevação lateral",
    ],
    duration: 60,
  },
];

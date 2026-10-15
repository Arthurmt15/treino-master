// Cliente da ExerciseDB Free OSS (GIFs de exercicios).
// Base publica, sem API key: https://oss.exercisedb.dev/api/v1
// Fallback estatico: ExerciseGymGifsDB via jsDelivr (sem key).

// URL base da API gratuita (1500 exercicios, GIF 180p).
export const EXERCISEDB_BASE = "https://oss.exercisedb.dev/api/v1";

// URL base do fallback estatico (1323 exercicios via CDN).
export const FALLBACK_BASE =
  "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0";

// Formato normalizado usado pelo app (independe da fonte).
export type Exercise = {
  exerciseId: string; // id unico (ex: "EIeI8Vf")
  name: string; // nome em ingles (traduzimos labels depois)
  gifUrl: string; // animacao demonstrativa do movimento
  bodyParts: string[]; // ex: ["chest"]
  targetMuscles: string[]; // musculo principal
  secondaryMuscles: string[]; // musculos de apoio
  equipments: string[]; // ex: ["barbell"]
  instructions: string[]; // passo a passo
};

// Resposta bruta da ExerciseDB v1 (campos podem variar).
type RawV1 = Partial<{
  exerciseId: string;
  name: string;
  gifUrl: string;
  bodyParts: string[];
  targetMuscles: string[];
  secondaryMuscles: string[];
  equipments: string[];
  instructions: string[];
}>;

// Normaliza um item bruto para o formato do app.
function normalize(raw: RawV1, index: number): Exercise {
  // Gera id estavel quando a API nao envia um.
  const id = raw.exerciseId ?? `ex-${index}`;
  return {
    exerciseId: id,
    name: raw.name ?? "Unnamed exercise",
    // GIF e obrigatorio no card; string vazia esconde a imagem.
    gifUrl: raw.gifUrl ?? "",
    bodyParts: raw.bodyParts ?? [],
    targetMuscles: raw.targetMuscles ?? [],
    secondaryMuscles: raw.secondaryMuscles ?? [],
    equipments: raw.equipments ?? [],
    instructions: raw.instructions ?? [],
  };
}

// Busca a lista principal na ExerciseDB (com paginacao simples).
export async function listExercises(limit = 48, offset = 0): Promise<Exercise[]> {
  // Tenta a API oficial primeiro (gratis, sem key).
  const url = `${EXERCISEDB_BASE}/exercises?limit=${limit}&offset=${offset}`;
  const res = await fetch(url);
  // Falha de rede/rate-limit: retorna vazio e a UI usa fallback.
  if (!res.ok) return [];
  const data = await res.json();
  // A API retorna array direto ou { data: [...] }.
  const arr: RawV1[] = Array.isArray(data) ? data : (data.data ?? []);
  return arr.map(normalize);
}

// Busca um exercicio pelo id (detalhe com instrucoes).
export async function getExercise(id: string): Promise<Exercise | null> {
  // Endpoint de detalhe da v1 gratuita.
  const res = await fetch(`${EXERCISEDB_BASE}/exercises/${id}`);
  if (!res.ok) return null;
  const data: RawV1 = await res.json();
  return normalize(data, 0);
}

// Filtra em memoria (evita novas requisicoes e o rate-limit).
export function filterExercises(
  items: Exercise[],
  query: string,
  bodyPart: string,
  equipment: string,
): Exercise[] {
  // Normaliza a busca para comparar sem case-sensitive.
  const q = query.trim().toLowerCase();
  return items.filter((ex) => {
    // Filtro de texto: nome ou musculo alvo.
    const matchQ =
      !q ||
      ex.name.toLowerCase().includes(q) ||
      ex.targetMuscles.join(" ").toLowerCase().includes(q);
    // Filtro por regiao corporal (chest, back, legs...).
    const matchB = !bodyPart || ex.bodyParts.includes(bodyPart);
    // Filtro por equipamento (barbell, dumbbell, bodyweight...).
    const matchE = !equipment || ex.equipments.includes(equipment);
    return matchQ && matchB && matchE;
  });
}

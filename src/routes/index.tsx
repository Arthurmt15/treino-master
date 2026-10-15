// Rota inicial: porta de entrada do app (login vira o início).
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { FitnessApp } from "@/components/fitness/app";
import { useAuth } from "@/hooks/use-auth";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "forma. — Seu espaço de treino" },
      {
        name: "description",
        content: "Seu app pessoal de academia. Acompanhe seus treinos, sua evolução e suas metas.",
      },
      { property: "og:title", content: "forma. — Seu espaço de treino" },
      {
        property: "og:description",
        content: "Cada treino conta. Acompanhe seu progresso com forma.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IndexPage,
});

// Decide a primeira tela: logado entra no ambiente; anônimo começa no login.
function IndexPage() {
  const { status } = useAuth();
  // Sessão ainda carregando: espera sem piscar a tela.
  if (status === "loading")
    return (
      <p className="notice" role="status">
        Carregando…
      </p>
    );
  // Autenticado: entra direto no seu ambiente.
  if (status === "authenticated") return <FitnessApp />;
  // Qualquer visitante (anônimo ou sem config): o início é o login com Google.
  return <Navigate to="/login" />;
}

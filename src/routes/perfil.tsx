import { createFileRoute } from "@tanstack/react-router";
import { FitnessApp } from "@/components/fitness/app";
export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — forma." },
      { name: "description", content: "Seu perfil, objetivos e preferências de treino." },
      { property: "og:title", content: "Meu perfil — forma." },
      { property: "og:description", content: "Seu perfil, objetivos e preferências de treino." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <FitnessApp view="profile" />,
});

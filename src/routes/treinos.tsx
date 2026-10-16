import { createFileRoute } from "@tanstack/react-router";
import { FitnessApp } from "@/components/fitness/app";
export const Route = createFileRoute("/treinos")({
  head: () => ({
    meta: [
      { title: "Meus treinos — forma." },
      { name: "description", content: "Seu plano de academia com exercícios e séries." },
      { property: "og:title", content: "Meus treinos — forma." },
      { property: "og:description", content: "Seu plano de academia com exercícios e séries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <FitnessApp view="workouts" />,
});

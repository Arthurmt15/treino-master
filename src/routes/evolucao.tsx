import { createFileRoute } from "@tanstack/react-router";
import { FitnessApp } from "@/components/fitness/app";
export const Route = createFileRoute("/evolucao")({
  head: () => ({
    meta: [
      { title: "Minha evolução — forma." },
      { name: "description", content: "Acompanhe seu peso, suas metas e conquistas." },
      { property: "og:title", content: "Minha evolução — forma." },
      { property: "og:description", content: "Acompanhe seu peso, suas metas e conquistas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <FitnessApp view="progress" />,
});

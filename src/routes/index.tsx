import { createFileRoute } from '@tanstack/react-router';
import { FitnessApp } from '@/components/fitness/app';
export const Route = createFileRoute('/')({
  head: () => ({meta: [{title:'forma. — Seu espaço de treino'},{name:'description',content:'Seu app pessoal de academia. Acompanhe seus treinos, sua evolução e suas metas.'},{property:'og:title',content:'forma. — Seu espaço de treino'},{property:'og:description',content:'Cada treino conta. Acompanhe seu progresso com forma.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component: () => <FitnessApp />,
});

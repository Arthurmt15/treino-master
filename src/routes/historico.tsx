import { createFileRoute } from '@tanstack/react-router';
import { FitnessApp } from '@/components/fitness/app';
export const Route = createFileRoute('/historico')({
 head: () => ({meta: [{title:'Histórico de treinos — forma.'},{name:'description',content:'Todos os seus treinos e resultados em um só lugar.'},{property:'og:title',content:'Histórico de treinos — forma.'},{property:'og:description',content:'Todos os seus treinos e resultados em um só lugar.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component: () => <FitnessApp view="history" />,
});

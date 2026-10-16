// Shell do app (sidebar + topo) e roteamento das abas.
// Delega cada aba para um componente próprio; orquestra treino e modais.

import { useEffect, useState, type ReactNode } from "react";
import { Flame, GlassWater, Heart } from "lucide-react";
import { Sidebar } from "@/components/fitness/sidebar";
import { Topbar } from "@/components/fitness/topbar";
import { useAuth } from "@/hooks/use-auth"; // Sessão Google (nome/avatar/entrar/sair).
import { useProfile } from "@/hooks/use-profile"; // Perfil da conta no banco.
import { useWorkoutLogs } from "@/hooks/use-workout-logs"; // Histórico no banco.
import { useWeightLogs } from "@/hooks/use-weight-logs"; // Evolução de peso no banco.
import { Modal, RecentList, SectionTitle, Stats } from "@/components/fitness/dashboard-widgets";
import { OverviewView } from "@/components/fitness/overview-view";
import { ProgressView } from "@/components/fitness/progress-view";
import { ProfileView } from "@/components/fitness/profile-view";
import { CustomWorkoutsPanel } from "@/components/fitness/custom-workouts-panel";
import { WorkoutSessionModal, type SessionRow } from "@/components/fitness/workout-session-modal";
import { currentStreak } from "@/components/fitness/dashboard-data";
import { PLANS } from "@/components/fitness/plans";
import type { Workout } from "@/domain/training/workout";

// Chave da aba atual (inclui o catálogo de exercícios).
type View = "overview" | "workouts" | "progress" | "history" | "profile" | "catalog";

// Casca visual do app de treino.
export function FitnessApp({ view = "overview", children }: { view?: View; children?: ReactNode }) {
  const [dark, setDark] = useState(true);
  const [water, setWater] = useState(6);
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState(false);
  const [activePlan, setActivePlan] = useState<number | null>(null); // Índice do treino pronto.
  const [activeCustom, setActiveCustom] = useState<Workout | null>(null); // Ficha própria em execução.
  const { status: authStatus, user, logout } = useAuth(); // Estado da conta Google logada.
  const { profile, setProfile, save: saveProfile } = useProfile(); // Perfil da conta (banco).
  const { logs, addLog } = useWorkoutLogs(); // Histórico da conta (banco).
  const { points: weightPoints, addWeight } = useWeightLogs(); // Pesos da conta (banco).
  const streak = currentStreak(logs); // Sequência real de dias treinados.

  // Edição local de um campo do perfil (persiste no salvar).
  function updateProfile(patch: Partial<typeof profile>) {
    setProfile({ ...profile, ...patch });
  }
  // Prefere o nome salvo; cai no nome do Google, e-mail ou genérico.
  const displayName =
    profile.name ||
    (user?.user_metadata?.["full_name"] as string | undefined) ||
    user?.email ||
    "Atleta";
  const initials = displayName
    .trim()
    .split(/\s+/)
    .map((p: string) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Carrega o tema salvo (claro/escuro) ao abrir.
  useEffect(() => {
    const theme = localStorage.getItem("forma-theme");
    if (theme) setDark(theme === "dark");
  }, []);
  function changeTheme(value: boolean) {
    setDark(value);
    localStorage.setItem("forma-theme", value ? "dark" : "light");
  }
  function notify(text: string) {
    setMessage(text);
  }
  // Inicia um treino pronto (A/B/C) ou uma ficha própria.
  function startPlan(index: number) {
    setActivePlan(index);
    setActiveCustom(null);
  }
  function startCustom(workout: Workout) {
    setActiveCustom(workout);
    setActivePlan(null);
  }
  // Registra o treino concluído no histórico e fecha a sessão.
  function finishWorkout() {
    if (activeCustom) {
      void addLog({
        title: activeCustom.name,
        durationMin: activeCustom.items.length * 5,
        exercises: activeCustom.items.length,
        workoutId: activeCustom.id,
      });
      setActiveCustom(null);
      notify("Treino concluído. Mandou bem!");
      return;
    }
    if (activePlan === null) return;
    const plan = PLANS[activePlan];
    if (!plan) return;
    void addLog({
      title: plan.title,
      durationMin: plan.duration,
      exercises: plan.exercises.length,
    });
    setActivePlan(null);
    notify("Treino concluído. Mandou bem!");
  }
  // Salva o perfil e o peso atual na nuvem.
  function saveProfileAndWeight() {
    void saveProfile(profile);
    if (profile.weightKg) void addWeight(profile.weightKg);
    notify("Preferências salvas na nuvem.");
  }

  const titles: Record<View, string> = {
    overview: "Visão geral",
    workouts: "Meus treinos",
    progress: "Evolução",
    history: "Histórico",
    profile: "Meu perfil",
    catalog: "Exercícios",
  };
  const subheadings: Record<View, string> = {
    overview: "Cada treino conta. Hoje é mais uma chance de evoluir.",
    workouts: "Seu plano, seu ritmo. O próximo passo começa aqui.",
    progress: "Pequenos avanços. Grandes mudanças.",
    history: "Todo esforço faz parte da sua história.",
    profile: "Seu espaço, do seu jeito.",
    catalog: "Explore o catálogo e monte sua ficha.",
  };
  // Linhas da sessão de treino (plano pronto ou ficha própria).
  const plan = activePlan !== null ? PLANS[activePlan] : undefined;
  const sessionTitle = activeCustom
    ? activeCustom.name
    : plan
      ? `Treino ${plan.letter} · ${plan.title}`
      : "";
  const sessionSummary = activeCustom
    ? `${activeCustom.items.length} exercícios · ~${activeCustom.items.length * 5} min`
    : plan
      ? `${plan.exercises.length} exercícios · ${plan.duration} min`
      : "";
  const sessionRows: SessionRow[] = activeCustom
    ? activeCustom.items.map((item) => ({
        key: item.exerciseId,
        title: item.name,
        sub: `${item.sets} séries · ${item.reps} repetições · ${item.restSec}s de descanso`,
        restSec: item.restSec,
      }))
    : (plan?.exercises ?? []).map((exercise) => ({
        key: exercise,
        title: exercise,
        sub: "3 séries · 10–12 repetições · 60s de descanso",
        restSec: 60,
      }));

  return (
    <div className={`app ${dark ? "dark" : "light"}`}>
      <Sidebar
        displayName={displayName}
        initials={initials}
        email={user?.email ?? null}
        authenticated={authStatus === "authenticated"}
        dark={dark}
        onChangeTheme={changeTheme}
        onLogout={() => logout()}
      />
      <div className="main">
        <Topbar
          title={titles[view]}
          initials={initials}
          dark={dark}
          onToggleTheme={() => changeTheme(!dark)}
          onNotifications={() => setNotifications(true)}
        />
        <main className="content">
          <div className="page-heading">
            <div>
              <h1>
                {view === "overview" ? `Vamos pra cima, ${displayName}` : titles[view]}
                {view === "overview" && <span className="text-primary">.</span>}
              </h1>
              <p className="subheading">{subheadings[view]}</p>
            </div>
            {view === "overview" && (
              <div className="streak">
                <Flame size={16} />
                <strong>
                  {streak > 0 ? `${streak} dia(s) em sequência` : "Comece sua sequência"}
                </strong>
              </div>
            )}
          </div>
          {message && (
            <p className="notice" role="status">
              {message}
            </p>
          )}
          {(view === "overview" || view === "progress") && (
            <Stats history={logs} weightKg={profile.weightKg} weeklyTarget={profile.weeklyTarget} />
          )}
          {view === "overview" && (
            <OverviewView
              logs={logs}
              weightKg={profile.weightKg}
              weightPoints={weightPoints}
              weeklyTarget={profile.weeklyTarget}
              water={water}
              onAddWater={() => setWater(Math.min(10, water + 1))}
              onStartPlan={startPlan}
            />
          )}
          {view === "workouts" && (
            <CustomWorkoutsPanel onStart={startCustom} onNotify={notify} onStartPlan={startPlan} />
          )}
          {view === "progress" && (
            <ProgressView
              logs={logs}
              weightPoints={weightPoints}
              weightKg={profile.weightKg}
              weeklyTarget={profile.weeklyTarget}
            />
          )}
          {view === "history" && (
            <div className="history-full">
              <SectionTitle title="Histórico" aside={`${logs.length} treinos registrados`} />
              <RecentList rows={logs} />
            </div>
          )}
          {view === "profile" && (
            <ProfileView
              profile={profile}
              onField={updateProfile}
              onSave={saveProfileAndWeight}
              displayName={displayName}
              initials={initials || "AM"}
              authenticated={authStatus === "authenticated"}
              email={user?.email ?? null}
              onLogout={() => logout()}
              dark={dark}
              onTheme={changeTheme}
            />
          )}
          {children}
          <footer className="footer">
            <span>
              <Heart size={11} />
              Feito para a sua melhor versão.
            </span>
            <span>O progresso é pessoal. Continue.</span>
          </footer>
        </main>
      </div>
      {(activePlan !== null || activeCustom) && (
        <WorkoutSessionModal
          title={sessionTitle}
          summary={sessionSummary}
          rows={sessionRows}
          onFinish={finishWorkout}
          onClose={() => {
            setActivePlan(null);
            setActiveCustom(null);
          }}
        />
      )}
      {notifications && (
        <Modal title="Notificações" onClose={() => setNotifications(false)}>
          <div className="exercise-row">
            <Flame className="text-primary" />
            <div>
              <strong>Você está no ritmo!</strong>
              <small>
                {streak > 0
                  ? `${streak} dia(s) de treino em sequência. Continue assim.`
                  : "Faça um treino hoje e comece sua sequência."}
              </small>
            </div>
          </div>
          <div className="exercise-row">
            <GlassWater className="text-sky" />
            <div>
              <strong>Hora de se hidratar</strong>
              <small>Sua meta de hoje é beber 2,5 litros de água.</small>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

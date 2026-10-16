// Barra lateral fixa: marca, navegacao, tema, conta e atalho de preferencias.

import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  ChevronRight,
  Dumbbell,
  LayoutGrid,
  LogIn,
  LogOut,
  Moon,
  Settings2,
  Sun,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/fitness/dashboard-widgets";

// Itens de navegacao principal (ordem exibida).
const navigation = [
  { to: "/", label: "Visão geral", icon: LayoutGrid },
  { to: "/treinos", label: "Meus treinos", icon: Dumbbell },
  { to: "/evolucao", label: "Evolução", icon: TrendingUp },
  { to: "/historico", label: "Histórico", icon: CalendarDays },
  { to: "/perfil", label: "Meu perfil", icon: UserRound },
] as const;

// Props: dados da conta + ações de tema/login.
type Props = {
  displayName: string;
  initials: string;
  email: string | null;
  authenticated: boolean;
  dark: boolean;
  onChangeTheme: (dark: boolean) => void;
  onLogout: () => void;
};

// Coluna lateral do app.
export function Sidebar({
  displayName,
  initials,
  email,
  authenticated,
  dark,
  onChangeTheme,
  onLogout,
}: Props) {
  return (
    <aside className="sidebar">
      <Brand />
      <div className="nav-caption">SEU ESPAÇO</div>
      <nav aria-label="Navegação principal">
        {navigation.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="nav-link"
            activeProps={{ className: "nav-link active" }}
            activeOptions={{ exact: true }}
          >
            <Icon />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <Link to="/perfil" className="nav-link">
          <Settings2 />
          <span>Preferências</span>
        </Link>
        {authenticated ? (
          <button type="button" className="nav-link w-full" onClick={onLogout}>
            <LogOut />
            <span>Sair</span>
          </button>
        ) : (
          <Link to="/login" className="nav-link">
            <LogIn />
            <span>Entrar com Google</span>
          </Link>
        )}
        <div className="theme-switch" aria-label="Aparência">
          <Button
            variant="ghost"
            className={!dark ? "selected" : ""}
            onClick={() => onChangeTheme(false)}
            aria-label="Modo claro"
          >
            <Sun />
            <span>Claro</span>
          </Button>
          <Button
            variant="ghost"
            className={dark ? "selected" : ""}
            onClick={() => onChangeTheme(true)}
            aria-label="Modo escuro"
          >
            <Moon />
            <span>Escuro</span>
          </Button>
        </div>
        <Link to="/perfil" className="sidebar-user">
          <div className="avatar">{initials || "AM"}</div>
          <div>
            <strong>{displayName}</strong>
            <small>
              {authenticated ? (email ?? "Conta Google conectada.") : "Um dia de cada vez."}
            </small>
          </div>
          <ChevronRight size={14} />
        </Link>
      </div>
    </aside>
  );
}

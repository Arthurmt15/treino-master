// Barra superior: breadcrumb, data real, notificações, tema e avatar.

import { Link } from "@tanstack/react-router";
import { Bell, CalendarDays, ChevronRight, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/fitness/dashboard-widgets";
import { formatLongDate } from "@/components/fitness/dashboard-data";

// Props: titulo da aba + ações.
type Props = {
  title: string;
  initials: string;
  dark: boolean;
  onToggleTheme: () => void;
  onNotifications: () => void;
};

// Cabecalho do conteudo.
export function Topbar({ title, initials, dark, onToggleTheme, onNotifications }: Props) {
  return (
    <header className="topbar">
      <div className="breadcrumb">
        Meu espaço
        <ChevronRight size={12} />
        <strong>{title}</strong>
      </div>
      <div className="mobile-brand">
        <Brand />
      </div>
      <div className="top-actions">
        <span className="date">
          <CalendarDays size={14} />
          {formatLongDate()}
        </span>
        <Button
          className="relative"
          size="icon"
          variant="ghost"
          aria-label="Notificações"
          onClick={onNotifications}
        >
          <Bell size={18} />
          <i className="notification-dot" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label={dark ? "Modo claro" : "Modo escuro"}
          title={dark ? "Modo claro" : "Modo escuro"}
          onClick={onToggleTheme}
        >
          {dark ? <Sun /> : <Moon />}
        </Button>
        <Link to="/perfil" className="avatar" aria-label="Meu perfil">
          {initials || "AM"}
        </Link>
      </div>
    </header>
  );
}

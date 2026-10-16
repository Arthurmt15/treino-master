// Navegacao inferior mobile (sobe em telas <md).
// Rotas: inicio, exercicios (API), treinos, perfil.

import { Link } from "@tanstack/react-router";
import { Dumbbell, LayoutGrid, Search, UserRound } from "lucide-react";

// Itens fixos da tab-bar (icone + rota + rotulo PT).
const TABS = [
  { to: "/", label: "Início", Icon: LayoutGrid },
  { to: "/exercicios", label: "Buscar", Icon: Search },
  { to: "/treinos", label: "Treinos", Icon: Dumbbell },
  { to: "/perfil", label: "Perfil", Icon: UserRound },
] as const;

// Barra fixa com safe-area (iPhone sem botao home).
export function BottomNav() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <div className="grid grid-cols-4">
        {TABS.map(({ to, label, Icon }) => (
          // Estado ativo destacado via cor primaria.
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground"
            activeProps={{
              className: "flex flex-col items-center gap-1 py-2 text-[11px] text-primary",
            }}
            activeOptions={{ exact: to === "/" }}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

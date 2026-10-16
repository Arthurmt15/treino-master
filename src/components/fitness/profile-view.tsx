// Aba "Meu perfil": conta Google, dados, objetivo, meta e aparência.
// Formulário controlado; o app persiste no salvar.

import { Link } from "@tanstack/react-router";
import { Check, LogIn, LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/fitness/dashboard-widgets";
import type { ProfileInput } from "@/infrastructure/supabase/profile-repository";

// Props: perfil + ações (editar, salvar, tema, logout).
type Props = {
  profile: ProfileInput;
  onField: (patch: Partial<ProfileInput>) => void;
  onSave: () => void;
  displayName: string;
  initials: string;
  authenticated: boolean;
  email: string | null;
  onLogout: () => void;
  dark: boolean;
  onTheme: (dark: boolean) => void;
};

// Formulário de perfil e preferências.
export function ProfileView({
  profile,
  onField,
  onSave,
  displayName,
  initials,
  authenticated,
  email,
  onLogout,
  dark,
  onTheme,
}: Props) {
  return (
    <>
      <div className="stat mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <strong className="text-sm">Conta Google</strong>
          <p className="text-xs text-muted-foreground mt-1">
            {authenticated ? `Conectada como ${email}` : "Entre para salvar seus treinos na nuvem."}
          </p>
        </div>
        {authenticated ? (
          <Button variant="outline" type="button" onClick={onLogout}>
            <LogOut />
            Sair
          </Button>
        ) : (
          <Button type="button" asChild>
            <Link to="/login">
              <LogIn />
              Entrar com Google
            </Link>
          </Button>
        )}
      </div>
      <form
        className="profile-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
      >
        <div className="flex items-center gap-4">
          <div className="avatar size-16 text-lg">{initials || "AM"}</div>
          <div>
            <strong>{displayName}</strong>
            <p className="text-xs text-muted-foreground mt-1">Membro desde setembro de 2026</p>
          </div>
        </div>
        <div className="profile-fields">
          <label>
            Nome
            <input
              value={profile.name}
              onChange={(e) => onField({ name: e.target.value })}
              required
            />
          </label>
          <label>
            Peso atual (kg)
            <input
              type="number"
              step="0.1"
              min="20"
              max="300"
              value={profile.weightKg ?? ""}
              onChange={(e) =>
                onField({ weightKg: e.target.value === "" ? null : Number(e.target.value) })
              }
            />
          </label>
          <label>
            Altura (cm)
            <input
              type="number"
              min="80"
              max="250"
              value={profile.heightCm ?? ""}
              onChange={(e) =>
                onField({ heightCm: e.target.value === "" ? null : Number(e.target.value) })
              }
            />
          </label>
          <label>
            Objetivo
            <select value={profile.goal} onChange={(e) => onField({ goal: e.target.value })}>
              <option>Hipertrofia</option>
              <option>Emagrecimento</option>
              <option>Condicionamento</option>
            </select>
          </label>
          <label>
            Meta semanal
            <select
              value={String(profile.weeklyTarget)}
              onChange={(e) => onField({ weeklyTarget: Number(e.target.value) })}
            >
              <option value="3">3 treinos</option>
              <option value="4">4 treinos</option>
              <option value="5">5 treinos</option>
              <option value="6">6 treinos</option>
            </select>
          </label>
        </div>
        <SectionTitle title="Aparência" />
        <div className="flex gap-3 mb-7">
          <Button
            variant={dark ? "outline" : "default"}
            onClick={() => onTheme(false)}
            type="button"
          >
            <Sun />
            Claro
          </Button>
          <Button
            variant={dark ? "default" : "outline"}
            onClick={() => onTheme(true)}
            type="button"
          >
            <Moon />
            Escuro
          </Button>
        </div>
        <Button type="submit">
          <Check />
          Salvar preferências
        </Button>
      </form>
    </>
  );
}

// Rota /login: entrada do app via conta Google (Supabase Auth).
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Dumbbell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — forma." },
      {
        name: "description",
        content: "Entre com sua conta Google para salvar treinos e evolução.",
      },
      { property: "og:title", content: "Entrar — forma." },
      {
        property: "og:description",
        content: "Entre com sua conta Google para salvar treinos e evolução.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

// Ícone "G" do Google desenhado em SVG (evita dependência extra).
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.4 3.4 2.7.2.1c2.2-2 3.4-5 3.4-9.2z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-.4.1-3.3 2.6-.1.3C3.4 21.5 7.4 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.4-3.3-2.6-.1.1C.6 8.9 0 10.4 0 12s.6 3.1 1.7 4.4l3.5-2z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.4 0 3.4 2.5 1.7 6.4l3.5 2.7c1-2.9 3.7-4.4 6.8-4.4z"
      />
    </svg>
  );
}

// Tela de login: botão Google + avisos de erro e de Supabase ausente.
function LoginPage() {
  const { status, user, error, login } = useAuth();
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");
  const navigate = useNavigate();

  // Dispara o OAuth e trata falha sem redirecionar.
  async function handleGoogle() {
    setBusy(true);
    setLocalError("");
    try {
      await login("/treinos");
      // O Supabase redireciona para o Google; se voltar com sessão, vai para /treinos.
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Falha no login.");
      setBusy(false);
    }
  }

  // Quem já está logado vê atalho direto para os treinos.
  if (status === "authenticated" && user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Você já está logado como</p>
          <p className="mt-1 font-semibold">{user.email}</p>
          <Button className="mt-6 w-full" onClick={() => navigate({ to: "/treinos" })}>
            Ir para meus treinos
          </Button>
        </div>
      </div>
    );
  }

  const message = localError || error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8">
        <div className="mb-6 flex items-center gap-2 text-2xl font-extrabold">
          <span className="brand-mark">
            <Dumbbell size={20} />
          </span>
          forma<span className="brand-dot">.</span>
        </div>
        <h1 className="text-xl font-bold">Entrar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use sua conta Google para salvar treinos e evolução.
        </p>

        {status === "unconfigured" && (
          <p
            className="mt-4 rounded-md border border-border bg-secondary p-3 text-xs text-muted-foreground"
            role="alert"
          >
            Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no
            .env.local e cadastre o Client ID no Supabase Auth &gt; Providers &gt; Google.
          </p>
        )}

        <Button className="mt-6 w-full" variant="outline" onClick={handleGoogle} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" size={18} /> : <GoogleIcon />}
          {busy ? "Redirecionando…" : "Continuar com Google"}
        </Button>

        {message && (
          <p className="mt-4 text-xs text-destructive" role="alert">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="underline underline-offset-2">
            Voltar ao início
          </Link>
        </p>
      </div>
    </div>
  );
}

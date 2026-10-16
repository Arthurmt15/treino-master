// Shared kernel: traduz erros de autenticação (Supabase Auth) para pt-BR.
// Evita mostrar mensagens cruas do backend (ex.: "provider is not enabled").

// Converte a mensagem crua do Supabase numa orientação clara em português.
export function authErrorMessage(raw: string): string {
  const msg = (raw ?? "").toLowerCase();
  // Provider desativado no projeto (mais comum em produção).
  if (msg.includes("provider is not enabled") || msg.includes("unsupported provider")) {
    return "O login com Google ainda não está ativo. No Supabase: Authentication > Providers > Google, ative e cole o Client ID e o Client Secret.";
  }
  // Domínio de retorno fora da allowlist.
  if (msg.includes("redirect") && (msg.includes("not allowed") || msg.includes("invalid"))) {
    return "Endereço de retorno não autorizado. Adicione este domínio em Supabase: Authentication > URL Configuration > Redirect URLs.";
  }
  // Chave/URL do Supabase ausente ou errada.
  if (msg.includes("api key") || msg.includes("invalid url") || msg.includes("failed to fetch")) {
    return "Não foi possível falar com o Supabase. Confira VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.";
  }
  // Usuário fechou a janela do Google.
  if (msg.includes("cancel") || msg.includes("popup")) {
    return "Login cancelado. Toque em “Continuar com Google” para tentar de novo.";
  }
  // Sem regra conhecida: mantém a mensagem original.
  return raw;
}

// Testes da traducao de erros de auth (Supabase) para pt-BR.
import { describe, expect, it } from "vitest";
import { authErrorMessage } from "@/shared/auth-errors";

describe("authErrorMessage", () => {
  it("explica provider Google desativado", () => {
    const msg = authErrorMessage("Unsupported provider: provider is not enabled");
    expect(msg).toContain("Providers > Google");
  });

  it("avisa sobre redirect nao autorizado", () => {
    const msg = authErrorMessage("redirect_uri not allowed");
    expect(msg).toContain("URL Configuration");
  });

  it("mantem a mensagem original quando nao conhece o erro", () => {
    expect(authErrorMessage("erro exotico")).toBe("erro exotico");
  });
});

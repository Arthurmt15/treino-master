<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Git workflow (priority — always apply, no need to repeat)
- Sempre commite e faça push direto na branch `main`, automaticamente, ao terminar uma tarefa. Nunca reescreva histórico já publicado (sem force push/rebase/amend de commits enviados).

## Frontend architecture
- Fitness content routes compose the shared FitnessApp presentation module. A sessão de demonstração (tema, água, estado transitório) fica frontend-only, mas os dados do usuário (perfil, fichas, histórico, peso) são persistidos no Supabase (banco + RLS) para sincronizar entre dispositivos.
- Define all theme colors in src/styles.css and use semantic tokens so both appearance modes stay consistent.
- Use leaf route head metadata for each content page so navigation and social previews identify the page.

## Code conventions (priority — always apply, no need to repeat)
- Sempre comente o código em pt-BR: cada arquivo novo ou editado deve ter comentários curtos explicando o que cada bloco faz (1 linha por função/bloco, sem textos longos).
- Nunca crie arquivos com mais de 300 linhas: se passar disso, divida em módulos menores (ex.: extrair componentes, hooks ou utils para arquivos próprios).

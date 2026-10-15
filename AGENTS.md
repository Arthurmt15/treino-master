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

## Frontend architecture
- Fitness content routes compose the shared FitnessApp presentation module; keep demo session state frontend-only because this project requests a frontend, not persistence.
- Define all theme colors in src/styles.css and use semantic tokens so both appearance modes stay consistent.
- Use leaf route head metadata for each content page so navigation and social previews identify the page.

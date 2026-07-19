# Feature Module Architecture

Each feature module follows a consistent internal structure:

```
features/
  <feature>/
    api/          — TanStack Query hooks + Axios API calls
    components/   — Feature-specific UI components
    hooks/        — Feature-specific custom hooks
    store/        — Redux slice (only if global state is needed)
    types/        — Feature-specific TypeScript types
    utils/        — Feature-specific utilities
    schemas/      — Zod validation schemas
    index.ts      — Public barrel export (API surface)
```

## Rules

1. **Feature barrels** — Only export what other features need via `index.ts`.
2. **No cross-feature imports** — Features should NEVER import from another feature's internals. Use shared `components/`, `types/`, `hooks/`, etc. for shared code.
3. **API data in TanStack Query** — Never duplicate server state in Redux.
4. **Redux for UI state only** — Theme, sidebar, auth tokens — not API data.
5. **Co-locate** — Keep feature logic close to the feature. Don't extract to shared until it's used in 2+ features.

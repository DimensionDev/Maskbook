# @masknet/book

A lightweight component gallery ("book") for Maskbook's shared UI packages. Plain Vite + React SPA — no Storybook.

## Run

```bash
pnpm book          # dev server (from repo root)
pnpm book:build    # static build → apps/book/dist
```

Or from this folder: `pnpm dev` / `pnpm build` / `pnpm preview`.

## How it works

- Components are imported from source (`@masknet/theme`, `@masknet/icons`, …) via the `mask-src`
  export condition, set in `vite.config.ts` (`resolve.conditions`). This mirrors
  `packages/mask/.webpack/config.ts`.
- Global providers (`MaskThemeProvider`, snackbar, dialog stacking) live in `src/providers.tsx`.
- Routing is a ~20-line hash router (`src/router.ts`) — deploys anywhere with no rewrite config.

## Add a demo

Create `src/demos/<section>/<Name>.demo.tsx`:

```tsx
import { ActionButton } from '@masknet/theme'

export const meta = { title: 'ActionButton', description: 'optional one-liner' }

export default function Demo() {
    return <ActionButton variant="contained">Confirm</ActionButton>
}
```

`import.meta.glob` in `src/registry.ts` picks it up automatically. The first path segment
under `demos/` is the sidebar section (`foundation`, `components`, `icons`, `shared`, …).

## Deploy (Vercel)

- Root Directory: `apps/book`
- Build / install commands come from `apps/book/vercel.json` (they `cd` to the repo root so
  the pnpm workspace resolves). Enable "Include source files outside of the Root Directory".

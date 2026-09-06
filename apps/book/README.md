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

A section can have sub-categories one level deep: `demos/<section>/<group>/<name>.demo.tsx`
(e.g. `demos/injection/twitter/Banner.demo.tsx`) renders under a "Twitter" sub-header inside the
"Injection" section. `injection` is the only section that currently uses this.

### Injection and Popups

- `injection` demos the components each site adaptor (`packages/mask/content-script/site-adaptors/*`)
  injects into a social platform's own page, one sub-category per platform. Most of the real
  injection code is tightly coupled to the extension runtime (background RPC via the `#services`
  subpath import, the live `activatedSiteAdaptorUI` global, DOM watchers) and can't run standalone
  here. Where a component's pure-UI part could be cleanly separated from that coupling, it was
  moved into `packages/injected-ui` — a small package with **one export per component, no barrel
  `index.ts`** — and both the real injection code and this book import the same file from there
  (see e.g. `packages/mask/content-script/components/GuideStep/index.tsx`, which now just computes
  props from the real guide-progress state and renders `@masknet/injected-ui/GuideStep`). Only a
  handful of components have been split out so far; the rest are left for follow-up.
- `popups` demos a few self-contained presentational components from
  `packages/mask/popups/components/*` (imported directly by relative path, since that package isn't
  set up to be depended on by name). Anything that needs live wallet/RPC state, or that pulls in a
  barrel file with unrelated modules, was left out — see the note in the PR that added this section.

## Deploy (Vercel)

- Root Directory: `apps/book`
- Build / install commands come from `apps/book/vercel.json` (they `cd` to the repo root so
  the pnpm workspace resolves). Enable "Include source files outside of the Root Directory".

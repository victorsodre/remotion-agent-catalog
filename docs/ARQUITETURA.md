# Repository architecture

This is the canonical architecture guide for people arriving from X, cloning the repository, or contributing. Keep its three responsibilities separate:

```
Official Agent Skills        → how to write Remotion
catalog.json + static viewer → what exists, where it came from, and when to use it
AGENTS.md                    → where it fails and how the defect appears
src/marketing                → authored Marketing BR code
src/remotion/brasil          → authored Brazil vertical code
src/remotion + compositions  → RemotionUI installed by its CLI, not authored code
src/demos                    → 1080×1080 Studio wrappers
```

## What this repository is

A production index of 102 components, a static viewer, and Studio compositions at `http://localhost:3000`.

| Path | Purpose |
|---|---|
| `catalog.json` | Index generated in the source project; read-only here. |
| `AGENTS.md` | Six general and three 3D failure modes to copy into a Remotion project. |
| `web/` | Static viewer: search, filtering, pagination, and previews. |
| `src/marketing/` | Authored Marketing BR components. |
| `src/remotion/brasil/` | Authored Brazil vertical components using `escala`, not `useVideoConfig()`. |
| `src/remotion/`, `src/compositions/` | RemotionUI installed through `npx remotion-ui add`; see `src/remotion/ORIGIN.md`. |
| `src/demos/` | Studio wrappers for text, scenes, transitions, and authored 3D work. |
| `web/previews/` | Real `.webm` previews when available; otherwise the viewer shows a labelled illustrative preview. |

## What is deliberately not copied here

- **remocn:** SoftBlurIn, ShimmerSweep, and Confetti are installed with `npx shadcn add @remocn/…`. The remocn Typewriter remains a card because `TextoDigitado::Typewriter` already resolves to the RemotionUI Typewriter.
- **remotion-bits (10):** MIT package imports from `src/demos/bits.tsx`; source is not copied. MatrixRain, particles, Scene3D, and StaggeredMotion run in Studio.

The 12 Brazil vertical components are authored in `src/remotion/brasil/`; they use `escala`, not `useVideoConfig()` font sizing. RemotionUI's 68 components are installed by its CLI. Do not mark either library code as authored: `catalog.json.lib` is authoritative. `npm run libs` reinstalls RemotionUI and restores `src/Root.tsx`, which its CLI may inject into.

## Using the three layers in another project

1. Run `npx skills add remotion-dev/skills`.
2. Copy `AGENTS.md` and `catalog.json` into the root of the target Remotion project.
3. Install the component named by `importa` through RemotionUI, Bits, or remocn in that project.

## Commands

| Command | Purpose |
|---|---|
| `npm run studio` | Studio at `http://localhost:3000`, with 102 square components. |
| `npm run libs` | Reinstalls catalogued RemotionUI components and restores `src/Root.tsx`. |
| `npm run web` | Static viewer at `http://localhost:8080/web/`. |
| `npm run validate` | Schema and invariant checks for `catalog.json`. |
| `npm test` | Catalog, validator, CLI, MCP, and server tests. |
| `npx remotion-catalog find "…"` | Intent search. |
| `npm run previews:render` | Renders 540×540 `.webm` previews to `web/previews/`. |
| `node scripts/link-previews.mjs` | Links previews to the optional `preview` field. |

The public viewer is English-first and offers pt-BR. Its localization layer never changes generated IDs, import paths, source-library labels, or preview provenance.

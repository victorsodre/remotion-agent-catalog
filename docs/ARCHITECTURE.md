# Repository architecture

This repository keeps three responsibilities separate:

```
Official Agent Skills        → how to write Remotion
catalog.json + static viewer → what exists, where it came from, and when to use it
AGENTS.md                    → failure modes and their observable symptoms
src/marketing                → authored Marketing BR code
src/remotion/brasil          → authored Brazil vertical code
src/remotion + compositions  → RemotionUI installed by its CLI (not authored)
src/demos                    → 1080×1080 Studio wrappers
```

## What is included

The repository contains a production index, a static viewer, and a local Remotion Studio composition for each catalog component.

| Path | Purpose |
|---|---|
| `catalog.json` | Generated index; read-only in this repository. |
| `AGENTS.md` | Six general and three 3D failure modes to copy into a Remotion project. |
| `web/` | Static viewer with search, library filtering, pagination, previews, and English/pt-BR presentation. |
| `web/i18n.js` | Presentation-only localization. It does not alter generated data or provenance. |
| `src/marketing/` | Authored Marketing BR components. |
| `src/remotion/brasil/` | Authored Brazil vertical components using `escala`, not `useVideoConfig()`-derived font sizing. |
| `src/remotion/`, `src/compositions/` | RemotionUI components installed through `npx remotion-ui add`. |
| `src/demos/` | Studio wrappers for text, scenes, transitions, Bits, and authored components. |
| `web/previews/` | Real `.webm` previews when available. |

## Deliberate boundaries

- `catalog.json` is generated in the source project. Do not edit it manually here. `scripts/link-previews.mjs` only maintains the optional `preview` field through the documented workflow.
- The viewer may translate labels and provide concise English presentation text, but it preserves component names, IDs, `importa` values, library labels, preview URLs, and source provenance.
- RemotionUI, remocn, and remotion-bits are not claimed as authored work. The `lib` field is authoritative.
- The bundled Typewriter key is intentionally duplicated across RemotionUI and remocn; the validator recognizes this as a valid distinction.

## Commands

| Command | Purpose |
|---|---|
| `npm run studio` | Opens Remotion Studio at `http://localhost:3000`. |
| `npm run web` | Serves the static viewer at `http://localhost:8080/web/`. |
| `npm run validate` | Validates the catalog schema and its invariants. |
| `npm test` | Runs catalog, CLI, MCP, and server tests. |
| `npm run typecheck` | Type-checks TypeScript source. |
| `npm run previews:render` | Renders missing 540×540 VP8 previews. |
| `node scripts/link-previews.mjs` | Links available preview files to catalog items. |

For implementation and rendering constraints, read [AGENTS.md](../AGENTS.md). The canonical architecture guide is maintained at [docs/ARQUITETURA.md](./ARQUITETURA.md) so existing links remain valid.

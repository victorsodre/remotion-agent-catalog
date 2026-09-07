# remotion-agent-catalog

**A practical catalog for agents and teams building video with Remotion.**

[Live catalog](https://victorsodre.github.io/remotion-agent-catalog/) · [Architecture](./docs/ARCHITECTURE.md) · [Operational guidance](./AGENTS.md)

The official [Remotion Agent Skills](https://www.remotion.dev/docs/ai/skills) explain how to use the framework. This repository adds the project-level context an agent needs before it starts writing:

```
Agent Skills   → how to write Remotion correctly
catalog.json   → what already exists and where each component came from
AGENTS.md      → where it breaks and how the failure appears
```

The viewer is English-first and includes a pt-BR interface option. `catalog.json` remains the generated, canonical Portuguese data source; the viewer localizes its presentation without changing component IDs, import paths, library attribution, or preview provenance.

## Start here

```bash
npm install
npm run web             # static viewer at http://localhost:8080/web/
npm run studio          # Remotion Studio at http://localhost:3000
npm run validate && npm test
```

To bring the catalog into another Remotion project:

```bash
curl -O https://raw.githubusercontent.com/victorsodre/remotion-agent-catalog/main/AGENTS.md
curl -O https://raw.githubusercontent.com/victorsodre/remotion-agent-catalog/main/catalog.json
npx skills add remotion-dev/skills
```

Install the component indicated by `importa` through its source library's CLI. The `lib` field in `catalog.json` is the source of truth for provenance.

## Contents

| Origin | In the catalog | Available in Studio |
|---|---:|---|
| [RemotionUI](https://remotionui.com) | 68 | Yes — CLI-installed under `src/remotion/` and `src/compositions/` |
| Authored | 20 | Marketing BR, four 3D/motion demos, and 12 Brazil vertical components |
| [remotion-bits](https://www.npmjs.com/package/remotion-bits) (MIT) | 10 | Yes — imported from the npm package |
| [remocn](https://remocn.dev) | 4 | Three components run in Studio; Typewriter is documented as a card |

The count is verified from `catalog.json` by `npm run validate`. Components from a library are catalogued and tested here; they are not claimed as authored work.

## Previews

The static viewer uses the real `.webm` file named by an item's optional `preview` field. When no file is available, it displays a clearly labelled illustrative CSS preview. Previews are paginated so the browser does not load the entire catalog at once.

To render a single preview in this repository:

```bash
npx remotion render PixQr-Autoral web/previews/PixQr-Autoral.webm --codec=vp8 --scale=0.5
node scripts/link-previews.mjs
```

See [origin-templates](./origin-templates/README.md) for the source-project workflow. The generated catalog is read-only here, except for the `preview` field maintained by the documented linking script.

## Scope and licensing

This repository is MIT-licensed for its catalog, viewer, CLI, MCP server, validator, and components marked `Autoral` in `catalog.json`. RemotionUI, remocn, and remotion-bits retain their own licenses and attribution. Remotion uses a two-tier license; assess its terms for your production use.

Made by [@ovictor](https://x.com/ovictor).

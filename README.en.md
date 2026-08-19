# remotion-agent-catalog

> 🇧🇷 [Versão em português](./README.md)
>
> **Live catalog:** [victorsodre.github.io/remotion-agent-catalog](https://victorsodre.github.io/remotion-agent-catalog/)
> · real previews only: […/?reais=1](https://victorsodre.github.io/remotion-agent-catalog/?reais=1)

**The missing layer between an agent and a real Remotion project.**

The [official Agent Skills](https://www.remotion.dev/docs/ai/skills) teach an agent **how** to use the
framework. This repo answers the other two questions **before** the first line:

```
Agent Skills   →  how to write Remotion correctly
catalog.json   →  what already exists, and where each piece came from
AGENTS.md      →  where it breaks, and how the defect shows up
```

Nothing here replaces the official skills. Install both. Repo map: [`docs/ARQUITETURA.md`](./docs/ARQUITETURA.md) (PT).

---

## Use it in your project (30 seconds)

Agents that read `AGENTS.md` (Claude Code, Cursor, Codex) will consult the catalog before writing.

```bash
# at the root of YOUR Remotion project
curl -O https://raw.githubusercontent.com/victorsodre/remotion-agent-catalog/main/AGENTS.md
curl -O https://raw.githubusercontent.com/victorsodre/remotion-agent-catalog/main/catalog.json

npx skills add remotion-dev/skills
```

`catalog.json` points at `importa`. Library pieces land in *your* project via each lib's CLI
(RemotionUI, remocn, remotion-bits) — this repo **does not republish** that code.

---

## What's in this repo

| origin | in the index | source here? |
|---|---|---|
| [RemotionUI](https://remotionui.com) | 68 | no (lib CLI) |
| **authored** | 20 | **Marketing BR yes** (`src/marketing/`) · Brazil vertical (Pix, boleto…) still index-only |
| [remotion-bits](https://www.npmjs.com/package/remotion-bits) (MIT) | 10 | no (npm package) |
| [remocn](https://remocn.dev) | 4 | no (lib CLI) |

Sixty-eight of a hundred and two came from a library. The point isn't having written everything; it's
having **tested, catalogued and documented where it breaks**.

```bash
npm install
npm run studio          # Studio: 4 Marketing BR compositions (authored)
npm run web             # viewer at http://localhost:8080/web/
npx remotion-catalog find "transition"
npm run validate && npm test
```

This repo's Studio will **not** show BlurFocusIn / PixQr / etc. You **will** see `MktPrecoAncorado`,
`MktSeloRegressiva`, `MktProvaSocial`, `MktCtaBrasil`.

---

## Honesty

- **I don't republish third-party code.** RemotionUI and remocn follow their own licenses and install
  via their CLIs. Here: the index, the docs, and the authored pieces that are already public.
- **The numbers are counted.** 102 = unique names in `catalog.json`. `npm run validate` checks.
- **The skills check** read the official repo at commit `9f0faa5` (2026-08-14), not the marketing page.

MIT for this repo's content. [Remotion](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)
uses a two-tier license — check your situation before production.

---

Made by [@ovictor](https://x.com/ovictor). Method, not hype.

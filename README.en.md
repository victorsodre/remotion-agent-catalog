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

`catalog.json` points at `importa`. In *your* project, library pieces land via each lib's CLI.
This repo's Studio already installs the 68 RemotionUI pieces with `npx remotion-ui add`
(shadcn model: source lives in `src/remotion/` and `src/compositions/`). The `lib` field stays
the source of truth — none of that is `AUTORAL`.

---

## What's in this repo

| origin | in the index | in Studio (`localhost:3000`) |
|---|---|---|
| [RemotionUI](https://remotionui.com) | 68 | **yes** — CLI-installed under `src/remotion/` + `src/compositions/` |
| **authored** | 20 | Marketing BR + 4 3D/motion demos + **12 Brazil vertical** (`src/remotion/brasil/`) |
| [remotion-bits](https://www.npmjs.com/package/remotion-bits) (MIT) | 10 | **yes** — MatrixRain, particles, Scene3D, StaggeredMotion from the npm package |
| [remocn](https://remocn.dev) | 4 | SoftBlurIn, ShimmerSweep and **Confetti** in Studio; remocn Typewriter still a card |

Sixty-eight of a hundred and two came from a library. The point isn't having written everything; it's
having **tested, catalogued and documented where it breaks**.

```bash
npm install
npm run studio          # Studio at http://localhost:3000 — 102 pieces 1:1
npm run web             # viewer at http://localhost:8080/web/
npx remotion-catalog find "transition"
npm run validate && npm test
```

Studio folders match the catalog. RemotionUI, Bits, remocn (except Typewriter), Marketing BR, Brazil vertical, and the 4 authored 3D/motion demos
**run React**. remocn Typewriter (same live key as RemotionUI Typewriter) still shows the name+intent card (plus `.webm`
when it exists). Restart Studio after `git pull` — `Root.tsx` is read at boot only.

Extract a `.webm` preview from this repo (540×540 VP8):

```bash
npx remotion render PixQr-Autoral web/previews/PixQr-Autoral.webm --codec=vp8 --scale=0.5
node scripts/link-previews.mjs

npm run previews:render                 # every piece still missing a file
npm run previews:render -- --only=PixQr
```

**If Studio opens to a blank-looking canvas:** not a crash. The theme is light paper (`#F3F5F9`) and entrance springs start at frame 0, so `00:00.00` is a white square. Press **Space** or scrub the playhead. Also: `git checkout main && git pull`, `npm install`, then `npm run studio` (not `npm run web`, not the GitHub Pages site). `localhost:3000` only answers on the machine where Studio is running.

---

## Honesty

- **I don't claim library authorship.** RemotionUI and remocn follow their licenses and install via
  CLI. The `lib` field in `catalog.json` is the source of truth. This repo's Studio installs
  RemotionUI under `src/remotion/` so pieces play on `localhost:3000` — that does not make them `AUTORAL`.
- **The numbers are counted.** 102 = unique names in `catalog.json`. `npm run validate` checks.
- **The skills check** read the official repo at commit `9f0faa5` (2026-08-14), not the marketing page.

MIT for this repo's content. [Remotion](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)
uses a two-tier license — check your situation before production.

---

Made by [@ovictor](https://x.com/ovictor). Method, not hype.

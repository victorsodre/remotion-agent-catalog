# remotion-agent-catalog

> 🇧🇷 [Versão em português](./README.md)

**The missing layer between an agent and a real Remotion project.**

The [official Agent Skills](https://www.remotion.dev/docs/ai/skills) teach an agent **how** to use the
framework. This repo answers the two other questions it asks before writing the first line:
**what already exists** and **where it breaks**.

```
Agent Skills  →  how to write Remotion correctly
catalog.json  →  what already exists in this project, and where each piece came from
AGENTS.md     →  where it breaks, and how the defect shows up
```

Nothing here replaces the official skills. Install both.

---

## What's here

**`catalog.json`** — an index of **102 pieces** used in production, each with provenance, import path
and a one-line *when to use it*. It's the file the agent reads before writing, so it stops
reinventing what already exists.

| origin | pieces |
|---|---|
| [RemotionUI](https://remotionui.com) | 68 |
| **authored** (written here) | 20 |
| [remotion-bits](https://www.npmjs.com/package/remotion-bits) (MIT) | 10 |
| [remocn](https://remocn.dev) | 4 |

Sixty-eight of a hundred and two came from a library. That number is the point: the value isn't in
having written everything, it's in having **tested, catalogued and documented where it breaks**.
RemotionUI alone has 200 components — the 68 here are the ones that survived real use.

**`AGENTS.md`** — the six Remotion pitfalls this project discovered by breaking something. None of
them throws a clear error; most fail silently. It includes the check of which ones the official
skills already cover (one covered, three partial, one uncovered, one out of scope).

---

## Tooling

`catalog.json` is not just a file to read — it's queryable and validated.

```bash
npm install

# query by intent (this is the point: describe what you want, get the import path)
npx remotion-catalog find "transition"
npx remotion-catalog show Typewriter
npx remotion-catalog stats
npx remotion-catalog libs Remocn
npx remotion-catalog recipes

# validate catalog.json against the JSON Schema + the invariants the docs promise
npm run validate

# run the tests (library, validator, CLI, MCP server)
npm test
```

### MCP server

An agent can query the catalog through the [Model Context Protocol](https://modelcontextprotocol.io)
instead of reading the whole JSON. Tools: `find_by_intent`, `show_piece`, `catalog_stats`.

```jsonc
// e.g. Cursor / Claude Desktop MCP config
{
  "mcpServers": {
    "remotion-catalog": { "command": "npx", "args": ["-y", "remotion-catalog-mcp"] }
  }
}
```

### Validation (CI)

`npm run validate` checks, on every push and PR, that `catalog.json`:

- is valid against [`schema/catalog.schema.json`](./schema/catalog.schema.json);
- has exactly **102** unique piece names and the per-lib table above (68/20/10/4);
- keeps at most **4 items per page** (the fixed grid);
- keeps `import path → lib` a well-defined function (a path never points to two libs);
- introduces **no new name collision** beyond the one known and legitimate case (`Typewriter`, which
  exists in both RemotionUI and Remocn);
- has **no dangling recipe track reference**.

This is what turns the honesty claim ("the numbers are counted, not estimated") into something a
machine enforces.

---

## How to use

Drop both files at the root of your Remotion project. Agents that read `AGENTS.md` automatically
(Claude Code, Cursor, Codex) will start consulting the catalog before writing.

```bash
curl -O https://raw.githubusercontent.com/victorsodre/remotion-agent-catalog/main/AGENTS.md
curl -O https://raw.githubusercontent.com/victorsodre/remotion-agent-catalog/main/catalog.json
```

Also install the official skills — they cover the lower layer:

```bash
npx skills add remotion-dev/skills
```

### Adapting to your project

`catalog.json` is **generated**, never hand-edited: it derives from the catalog pages in code
(`npm run catalog`, in the source project). If you reuse it elsewhere, what matters is the **format**:

```json
{
  "nome": "FrostedGlassWipe",
  "lib": "RemotionUI",
  "importa": "@/remotion/primitives/frosted-glass-wipe",
  "quando": "transition between scenes — the glass blurs what's behind",
  "ciclo": 90
}
```

Four fields and one line of intent. The `quando` field pays off the most: it's how the agent picks
the right piece, not by the name.

The `lib` field is not decoration — it's what stops an agent (or you) from misattributing authorship.
When memory and catalog disagree, **the catalog wins**.

---

## The Brazil vertical

Twenty of the 102 pieces are authored, and twelve of them exist for a specific reason: **the
component libraries for Remotion are all from the US market.** RemotionUI's 200 components have no
PIX, boleto, installments, free shipping, CDC, CNPJ/invoice or WhatsApp — which is where the
Brazilian sale actually happens.

`PixQr` · `BoletoPix` · `Parcelamento` · `CarrinhoResumo` · `FreteGratis` · `Cupom` ·
`EstoqueRestante` · `PrazoEntrega` · `AvaliacaoNota` · `SeloGarantia` · `SeloEmpresa` ·
`WhatsappConversa`

Details that only show up when the piece is written by someone who sells here: `Parcelamento`
computes real compound interest above the interest-free limit (the line with interest **must** look
visibly worse); `SeloGarantia` cites article 49 of the CDC by number, because in Brazil the 7 days
aren't the store's courtesy, they're the law — and citing the law converts better than "full
guarantee", besides being true.

---

## Honesty

- **I don't republish third-party code.** RemotionUI and remocn pieces are copied into the project
  by each one's CLI (shadcn model) and follow the original licenses. Only the index and the docs go
  here — written by me.
- **The numbers are counted, not estimated.** 102 pieces = unique names in `catalog.json`. Check it
  yourself with `npm run validate`.
- **The skills check** was done by reading the actual content of the official repo at commit
  `9f0faa5` (2026-08-14), not the marketing page. If Remotion covers pitfall 4 in a future version,
  this table goes stale — open an issue.

## License

MIT for the content of this repo (`AGENTS.md`, `catalog.json`, `README.md`). The libraries cited have
their own licenses: [Remotion](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) uses a
two-tier license (free for individuals and small organizations, company license above that). Check
your situation before using in production.

---

Made by [@ovictor](https://x.com/ovictor). Method, not hype.

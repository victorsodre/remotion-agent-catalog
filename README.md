# remotion-agent-catalog

> 🇬🇧 [English version](./README.en.md)
>
> **Catálogo ao vivo:** [victorsodre.github.io/remotion-agent-catalog](https://victorsodre.github.io/remotion-agent-catalog/)

**A camada que falta entre um agente e um projeto Remotion de verdade.**

As [Agent Skills oficiais](https://www.remotion.dev/docs/ai/skills) ensinam um agente **como** usar o
framework. Este repositório responde as outras duas perguntas, **antes** da primeira linha:

```
Agent Skills   →  como escrever Remotion corretamente
catalog.json   →  o que já existe, e de onde veio cada peça
AGENTS.md      →  onde quebra, e como o defeito se manifesta
```

Nada aqui substitui as skills oficiais. Instale as duas coisas. Mapa do repo: [`docs/ARQUITETURA.md`](./docs/ARQUITETURA.md).

---

## Usar no seu projeto (30 segundos)

Agentes que leem `AGENTS.md` (Claude Code, Cursor, Codex) passam a consultar o catálogo antes de escrever.

```bash
# na raiz do SEU projeto Remotion
curl -O https://raw.githubusercontent.com/victorsodre/remotion-agent-catalog/main/AGENTS.md
curl -O https://raw.githubusercontent.com/victorsodre/remotion-agent-catalog/main/catalog.json

npx skills add remotion-dev/skills
```

O `catalog.json` aponta o `importa`. No **seu** projeto as peças de lib entram pelo CLI delas
(RemotionUI, remocn, remotion-bits). Neste repo o Studio já puxa as 68 do RemotionUI via
`npx remotion-ui add` (modelo shadcn: o fonte fica em `src/remotion/` e `src/compositions/`).
O campo `lib` do catálogo continua sendo a fonte da verdade — nada disso é `AUTORAL`.

---

## O que tem neste repo

| origem | no índice | no Studio (`localhost:3000`) |
|---|---|---|
| [RemotionUI](https://remotionui.com) | 68 | **sim** — instaladas pelo CLI em `src/remotion/` + `src/compositions/` |
| **autoral** | 20 | Marketing BR + 4 demos 3D/movimento + **12 da vertical Brasil** (`src/remotion/brasil/`) |
| [remotion-bits](https://www.npmjs.com/package/remotion-bits) (MIT) | 10 | **sim** — `MatrixRain`, partículas, Scene3D, StaggeredMotion via `import` do pacote |
| [remocn](https://remocn.dev) | 4 | SoftBlurIn, ShimmerSweep e **Confetti** no Studio; Typewriter remocn ainda card |

Sessenta e oito de cento e duas vieram de uma biblioteca. O valor não está em ter escrito tudo, está em
ter **testado, catalogado e documentado onde quebra**. O RemotionUI tem ~200 componentes — as 68 aqui
são as que sobreviveram ao uso real.

**`AGENTS.md`** — as seis armadilhas do Remotion que este projeto descobriu quebrando alguma coisa, mais três de 3D/WebGL que só aparecem no render headless.
Nenhuma dá erro claro; a maioria falha em silêncio.

### Rodar daqui

```bash
git clone https://github.com/victorsodre/remotion-agent-catalog.git
cd remotion-agent-catalog
npm install

npm run studio          # Studio em http://localhost:3000 — 102 peças 1:1
npm run web             # visualizador em http://localhost:8080/web/
npx remotion-catalog find "transição"
npm run validate && npm test
```

No Studio (`http://localhost:3000`) o catálogo inteiro aparece em pastas (1:1, 1080×1080).
RemotionUI, Bits, remocn (exceto Typewriter), Marketing BR, vertical Brasil e as 4 autorais de 3D/movimento
**rodam o React**. Typewriter remocn (colide a chave com o Typewriter do RemotionUI) ainda mostra o card
com nome + intenção (e o `.webm` quando existir).
Reinicie o Studio depois do `git pull` — `Root.tsx` só é lido no boot.

### Extrair prévia `.webm` (uma ou todas)

As prévias do site saem **deste** repo (não precisa mais do projeto de origem). 540×540, VP8.

```bash
# uma peça (id = nome no Studio, ex. PixQr-Autoral)
npx remotion render PixQr-Autoral web/previews/PixQr-Autoral.webm --codec=vp8 --scale=0.5
node scripts/link-previews.mjs

# lote: todas as que ainda não têm arquivo
npm run previews:render
npm run previews:render -- --only=PixQr,BoletoPix
npm run previews:render -- --force    # refaz as existentes
```

Depois do lote, `catalog.json` ganha o campo `preview` e o site toca o `.webm`.

**Se o Studio abre e o canvas parece vazio:** não é crash. O fundo é papel claro (`THEME.ink` = `#F3F5F9`) e muita peça entra com `spring` a partir do frame 0 — em `00:00.00` o preview é um quadrado branco. Aperta **Space** ou arrasta o playhead. Confere também:

1. `git checkout main && git pull` (o catálogo ao vivo está no `main` desde o merge do Studio)
2. `npm install` (precisa de `culori` e `remotion-bits`)
3. o comando é `npm run studio` → `http://localhost:3000` — **não** é o site do GitHub Pages, e **não** é `npm run web` (`:8080`, só o viewer estático)
4. `localhost:3000` só responde na máquina onde o processo do Studio está rodando

---

## Ferramentas

```bash
npx remotion-catalog find "gancho"     # busca por intenção (campo quando)
npx remotion-catalog show Typewriter
npx remotion-catalog stats
npm run mcp                            # servidor MCP (find_by_intent, show_piece, catalog_stats)
```

O visualizador pagina (24/página), busca acento-insensitive, e mostra `.webm` real quando o campo
`preview` existe. Sem isso, a prévia é **ilustrativa** (família de movimento, não o render da peça).

`npm run validate` trava o CI se o índice divergir do que a documentação promete (102 nomes; 68/20/10/4;
≤4 itens/página; `importa → lib` bem definido; sem colisão de nome nova).

---

## A vertical Brasil

Doze das 20 autorais existem porque **as libs de Remotion são do mercado americano.** Não há PIX,
boleto, parcelamento, frete grátis, CDC, CNPJ nem WhatsApp nos 200 do RemotionUI — e é aí que a venda
brasileira acontece.

`PixQr` · `BoletoPix` · `Parcelamento` · `CarrinhoResumo` · `FreteGratis` · `Cupom` ·
`EstoqueRestante` · `PrazoEntrega` · `AvaliacaoNota` · `SeloGarantia` · `SeloEmpresa` ·
`WhatsappConversa`

Estão no índice **e no Studio**: fonte em `src/remotion/brasil/` (recebem `escala`, não `fontSize` de
`useVideoConfig()`). O Marketing BR (`PrecoAncorado`, selo, prova, CTA WhatsApp) também está, e já
tem [prévia no site](https://victorsodre.github.io/remotion-agent-catalog/).

---

## Honestidade

- **Não reivindico autoria de lib.** RemotionUI e remocn seguem as licenças originais e entram pelo
  CLI. O selo `lib` do `catalog.json` é a fonte da verdade. O Studio deste repo instala RemotionUI
  em `src/remotion/` para as peças rodarem em `localhost:3000` — isso não as torna `AUTORAL`.
- **Os números são contados.** 102 = nomes únicos no `catalog.json`. `npm run validate` confere.
- **A verificação das skills** leu o repo oficial no commit `9f0faa5` (2026-08-14), não a página de marketing.

## Licença

MIT para o conteúdo deste repositório. [Remotion](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)
usa licença de dois níveis — verifique a sua situação antes de produção.

---

Feito por [@ovictor](https://x.com/ovictor). Método, não hype.

# remotion-agent-catalog

> 🇬🇧 [English version](./README.en.md)
>
> **Catálogo ao vivo:** [victorsodre.github.io/remotion-agent-catalog](https://victorsodre.github.io/remotion-agent-catalog/)
> · só prévias reais: […/?reais=1](https://victorsodre.github.io/remotion-agent-catalog/?reais=1)

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

O `catalog.json` aponta o `importa`. As peças de lib entram no *seu* projeto pelo CLI delas (RemotionUI,
remocn, remotion-bits) — este repo **não republica** esse código.

---

## O que tem neste repo

| origem | no índice | código aqui? |
|---|---|---|
| [RemotionUI](https://remotionui.com) | 68 | não (CLI da lib) |
| **autoral** | 20 | **Marketing BR sim** (`src/marketing/`) · vertical Brasil (Pix, boleto…) ainda só no índice |
| [remotion-bits](https://www.npmjs.com/package/remotion-bits) (MIT) | 10 | não (pacote npm) |
| [remocn](https://remocn.dev) | 4 | não (CLI da lib) |

Sessenta e oito de cento e duas vieram de uma biblioteca. O valor não está em ter escrito tudo, está em
ter **testado, catalogado e documentado onde quebra**. O RemotionUI tem ~200 componentes — as 68 aqui
são as que sobreviveram ao uso real.

**`AGENTS.md`** — as seis armadilhas do Remotion que este projeto descobriu quebrando alguma coisa.
Nenhuma dá erro claro; a maioria falha em silêncio.

### Rodar daqui

```bash
git clone https://github.com/victorsodre/remotion-agent-catalog.git
cd remotion-agent-catalog
npm install

npm run studio          # Studio das 4 compositions Marketing BR (autorais)
npm run web             # visualizador em http://localhost:8080/web/
npx remotion-catalog find "transição"
npm run validate && npm test
```

No Studio deste repo você **não** vai ver BlurFocusIn / PixQr / etc. — essas peças não têm fonte aqui
(RemotionUI não se republica; PixQr ainda não foi consolidado). Você **vai** ver `MktPrecoAncorado`,
`MktSeloRegressiva`, `MktProvaSocial`, `MktCtaBrasil`.

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

Estão no índice (intenção + `importa`). O fonte ainda não está neste repo; o Marketing BR (`PrecoAncorado`,
selo, prova, CTA WhatsApp) está, e já tem [prévia real no site](https://victorsodre.github.io/remotion-agent-catalog/?reais=1).

---

## Honestidade

- **Não republico código de terceiros.** RemotionUI e remocn seguem as licenças originais e entram pelo
  CLI de cada uma. Aqui: índice, docs, e as autorais que já são públicas (`src/marketing/`).
- **Os números são contados.** 102 = nomes únicos no `catalog.json`. `npm run validate` confere.
- **A verificação das skills** leu o repo oficial no commit `9f0faa5` (2026-08-14), não a página de marketing.

## Licença

MIT para o conteúdo deste repositório. [Remotion](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)
usa licença de dois níveis — verifique a sua situação antes de produção.

---

Feito por [@ovictor](https://x.com/ovictor). Método, não hype.

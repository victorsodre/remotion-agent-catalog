# Arquitetura deste repositório

Mapa para quem chega do X, clona o repo, ou vai contribuir. Três camadas,
três jobs — não misturar.

```
Agent Skills oficiais   →  COMO escrever Remotion
catalog.json + site     →  O QUÊ já existe, de onde veio, quando usar
AGENTS.md               →  ONDE quebra (e como o defeito se manifesta)
src/marketing           →  código AUTORAL que este repo consegue renderizar
```

## O que este repo é

Um **índice de produção** (102 peças) + um **visualizador** + um **Studio mínimo**
das autorais públicas. Não é um dump das 200 peças do RemotionUI.

## O que tem código aqui

| caminho | o quê |
|---|---|
| `catalog.json` | índice (gerado na origem; neste repo é somente-leitura) |
| `AGENTS.md` | as seis armadilhas — copie para o *seu* projeto Remotion |
| `web/` | visualizador estático (busca, filtro, paginação, prévias) |
| `src/marketing/` | peças autorais **Marketing BR** (`PrecoAncorado`, `SeloDesconto`, `Regressiva`, `ProvaSocial`, `CtaBrasil`) |
| `web/previews/` | `.webm` reais quando existem; o resto do site usa prévia ilustrativa |

## O que **não** tem código aqui (de propósito)

- **RemotionUI (68) e remocn (4):** entram no *seu* projeto pelo CLI de cada lib (modelo shadcn). Republicar o `.tsx` aqui reivindicaria código de terceiro e quebraria a licença. O catálogo aponta o `importa`; o CLI instala a peça.
- **remotion-bits (10):** MIT, instalável com `npx remotion-bits` / o pacote npm. Não duplicamos.
- **Vertical Brasil (PixQr, BoletoPix, …):** autorais, mas o fonte ainda não foi consolidado neste repo. Estão no índice (`quando`, `importa`, `lib: Autoral`). Quando o fonte vier parar em `src/remotion/brasil/`, o Studio passa a renderizá-las do mesmo jeito que o Marketing BR.

## Como as três coisas se combinam no seu projeto

1. `npx skills add remotion-dev/skills` — o agente escreve Remotion certo.
2. Copia `AGENTS.md` + `catalog.json` para a raiz do *seu* Remotion — o agente para de reinventar peça e evita as seis armadilhas.
3. `remotion-ui add` / bits / remocn no *seu* projeto — o `importa` do catálogo passa a resolver.

## Comandos neste repo

| comando | o quê |
|---|---|
| `npm run studio` | Remotion Studio das 4 compositions Marketing BR |
| `npm run web` | visualizador local (`http://localhost:8080/web/`) |
| `npm run validate` | schema + invariantes do `catalog.json` |
| `npm test` | 17 testes (lib, validador, CLI, MCP) |
| `npx remotion-catalog find "…"` | busca por intenção |
| `node scripts/link-previews.mjs` | liga `.webm` em `web/previews/` ao campo `preview` |

Site público: https://victorsodre.github.io/remotion-agent-catalog/

## Prévias reais vs ilustrativas

O card do site mostra o `.webm` se `catalog.json` tiver `preview`. Senão, uma
animação CSS da *família* de movimento (rotulada **ilustrativa**). A grade é
paginada (24/página) para não carregar 100 vídeos de uma vez.

`?reais=1` no site filtra só as que já têm render real.

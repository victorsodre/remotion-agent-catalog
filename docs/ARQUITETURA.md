# Arquitetura deste repositório

Mapa para quem chega do X, clona o repo, ou vai contribuir. Três camadas,
três jobs — não misturar.

```
Agent Skills oficiais   →  COMO escrever Remotion
catalog.json + site     →  O QUÊ já existe, de onde veio, quando usar
AGENTS.md               →  ONDE quebra (e como o defeito se manifesta)
src/marketing           →  código AUTORAL Marketing BR
src/remotion/brasil     →  código AUTORAL vertical Brasil
src/remotion + src/compositions → RemotionUI instalado pelo CLI (não é AUTORAL)
src/demos               →  wrappers 1080×1080 que o Studio usa em localhost:3000
```

## O que este repo é

Um **índice de produção** (102 peças) + um **visualizador** + o **Studio em
`http://localhost:3000`** com uma composition 1080×1080 por peça do catálogo.

## O que tem código aqui

| caminho | o quê |
|---|---|
| `catalog.json` | índice (gerado na origem; neste repo é somente-leitura) |
| `AGENTS.md` | as seis armadilhas — copie para o *seu* projeto Remotion |
| `web/` | visualizador estático (busca, filtro, paginação, prévias) |
| `src/marketing/` | peças autorais **Marketing BR** |
| `src/remotion/brasil/` | peças autorais **vertical Brasil** (`escala`, não `useVideoConfig`) |
| `src/remotion/`, `src/compositions/` | RemotionUI via `npx remotion-ui add` — ver `src/remotion/ORIGIN.md` |
| `src/demos/` | wrappers do Studio (texto, cenas, transições, autorais 3D) |
| `web/previews/` | `.webm` reais quando existem; o resto do site usa prévia ilustrativa |

## O que **não** tem código aqui (de propósito)

- **remocn:** SoftBlurIn, ShimmerSweep e Confetti entram pelo `npx shadcn add @remocn/…` (`src/components/remocn/`). Typewriter remocn ainda é card (a chave `TextoDigitado::Typewriter` já aponta para o Typewriter do RemotionUI).
- **remotion-bits (10):** MIT, importadas de `remotion-bits` em `src/demos/bits.tsx` (não copiamos o fonte). MatrixRain, partículas, Scene3D e StaggeredMotion rodam no Studio.

**Vertical Brasil (12):** AUTORAL em `src/remotion/brasil/` — `escala`, nunca `fontSize` de `useVideoConfig()`. PixQr, boleto, parcelas com juros compostos, frete, CDC, CNPJ, WhatsApp.

**RemotionUI (68):** o Studio deste repo **instala** as peças pelo CLI (shadcn: source you own).
Não marque como `AUTORAL`. O campo `lib` do `catalog.json` manda. `npm run libs` reinstala
e restaura o `Root.tsx` (o CLI tenta injetar `<Composition>`).

## Como as três coisas se combinam no seu projeto

1. `npx skills add remotion-dev/skills` — o agente escreve Remotion certo.
2. Copia `AGENTS.md` + `catalog.json` para a raiz do *seu* Remotion — o agente para de reinventar peça e evita as seis armadilhas.
3. `remotion-ui add` / bits / remocn no *seu* projeto — o `importa` do catálogo passa a resolver.

## Comandos neste repo

| comando | o quê |
|---|---|
| `npm run studio` | Remotion Studio em `http://localhost:3000` — 102 peças 1:1 |
| `npm run libs` | reinstala RemotionUI do catálogo e restaura `src/Root.tsx` |
| `npm run web` | visualizador local (`http://localhost:8080/web/`) |
| `npm run validate` | schema + invariantes do `catalog.json` |
| `npm test` | 17 testes (lib, validador, CLI, MCP) |
| `npx remotion-catalog find "…"` | busca por intenção |
| `npm run previews:render` | renderiza `.webm` 540×540 de cada peça do Studio em `web/previews/` |
| `node scripts/link-previews.mjs` | liga `.webm` em `web/previews/` ao campo `preview` |

Site público: https://victorsodre.github.io/remotion-agent-catalog/

## Prévias reais vs ilustrativas

O card do site mostra o `.webm` se `catalog.json` tiver `preview`. Senão, uma
animação CSS da *família* de movimento (rotulada **ilustrativa**). A grade é
paginada para não carregar 100 vídeos de uma vez. O filtro de biblioteca
(Todas / RemotionUI / Autoral / Bits / Remocn) aceita **uma** seleção.

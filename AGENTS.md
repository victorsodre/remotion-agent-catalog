# AGENTS.md

Este arquivo é o guia para **copiar para o seu projeto Remotion** (agentes leem
antes de escrever composição). Se você está *neste* repositório
(`remotion-agent-catalog`), o mapa do produto está no `README.md` e em
`docs/ARQUITETURA.md`. O `npm run catalog` citado abaixo é o **gerador da origem**
— não existe aqui.

O índice do que existe está em `catalog.json` (gerado — nunca edite à mão).

---

## As seis armadilhas

Todas foram descobertas quebrando alguma coisa aqui. Nenhuma dá erro claro — a maioria falha em silêncio.

### 1. `useVideoConfig()` reporta a COMPOSIÇÃO, não o container

Componentes que calculam tamanho de fonte, safe area ou posição percentual leem `useVideoConfig()`. Isso devolve as dimensões da `<Composition>`, **não** do elemento onde você os colocou.

Consequência: reduzir por `transform: scale()` encolhe o quadro mas **não o texto**, e tudo vaza.

- Para exibir uma cena 1920×1080 dentro de uma célula, use a flag `cena: true` do `Item` — ela renderiza no tamanho real e reduz por transform.
- Para formato vertical, **crie uma `<Composition>` 1080×1920 de verdade**. Não existe atalho.
- `cena: true` também é obrigatório para qualquer componente posicionado por porcentagem do canvas (ex.: `SimulatedCursor`, cujo `x`/`y` são 0–100 do vídeo inteiro).

### 2. `Sequence` renderiza um `AbsoluteFill`

Ele sai do fluxo. Dentro de um flex com `space-between`, todos os blocos colapsam no canto superior esquerdo.

Em peça com várias `Sequence` empilhadas, use **posições absolutas explícitas** (`top`, `left`), como em `src/playground/pecas.tsx`.

### 3. `defaultProps` passa por JSON

Elementos React não sobrevivem: chegam do outro lado como `{key, ref, props}` e o React lança o erro #31.

Nunca passe JSX por `defaultProps`. Crie um componente estável por página no módulo:

```tsx
const COMPONENTES = Object.fromEntries(
  PAGINAS.map((p) => [p.id, () => <Pagina {...p} />]),
);
```

### 4. Em `effects`, a ordem importa — e o tipo do efeito também

- **Gerador** (`checkerboard`, `rings`, `lightLeak`, `zigzag`) desenha imagem nova e ignora o que havia embaixo.
- **Filtro** (`thermalVision`, `halftone`, `pixelate`, `duotone`, `zoomBlur`) lê os pixels existentes e os transforma.

Um filtro sem nada embaixo não produz nada. Um gerador no fim do array apaga tudo que veio antes.

Muitos efeitos com parâmetros default entregam pouco (`duotone({})` sai branco chapado). Sempre configure.

### 5. `TransitionSeries` dura menos que a soma das partes

A duração é **soma das sequências − soma das sobreposições**. Duas de 40 frames com transição de 20 dão 60, não 80.

Se o `<Loop>` for maior que isso, sobra tela preta. Use o helper `cicloTransicao()` em `pages-extra.tsx`.

Prefira blocos curtos e transição longa: senão o espectador quase sempre pega a cena parada em vez do movimento.

### 6. Cenas de mídia nem sempre aceitam vídeo

`MediaFrame` e `SplitScreen` chamam `isVideoSource(src)` e trocam `<Img>` por `<Video>` sozinhas — basta passar um `.mp4`.

`ZoomPanFrame`, `DeviceMockupZoom` e `CalloutSpotlight` renderizam **só `<Img>`**: passar vídeo resulta em quadro vazio, **sem erro**. Extraia um frame:

```bash
ffmpeg -ss 3.2 -i public/video.mp4 -frames:v 1 -q:v 2 public/video.jpg
```

Mídia quadrada em cena 16:9 deixa tarja preta — use `fit="cover"`.

---

## As três armadilhas de 3D

Descobertas portando uma cena three.js autoral para uma composição (`LampadaBrowserFlow`). Numeração separada de propósito: as seis acima são referenciadas por número no código, e renumerar quebraria os comentários.

O padrão das três é o mesmo das seis — **falham em silêncio**. Pior: falham só no render. O Studio mostra a cena certa, o MP4 sai preto. Todas foram isoladas por bissecção, com `npx remotion still` a cada passo.

### 3D-1. `UnrealBloomPass` fora da última posição zera o buffer em headless

Ele tem `needsSwap = false` e compõe o brilho de volta no próprio `readBuffer` — o mesmo alvo cuja textura acabou de amostrar no high-pass. É um feedback loop framebuffer↔textura.

Chrome com GPU tolera. Chromium headless descarta o draw, e **todo pass depois dele lê preto**. Sem erro de shader, sem erro de GL, sem contexto perdido, sem exceção. Nada no console.

Reproduz idêntico em `--gl=angle` e `--gl=swangle`: não é backend, é o headless.

**Resolução**: bloom por último na cadeia. Se precisar de passes depois dele, não use `UnrealBloomPass`.

### 3D-2. Bloom por último reaplica tone mapping e sRGB

Consequência de resolver a anterior. Ao desenhar na tela (`setRenderTarget(null)`) o three aplica `toneMapping` e `outputColorSpace` — é assim que ele trata qualquer material desenhado no canvas. Com um `OutputPass` antes na cadeia, a imagem leva a conversão **duas vezes**.

O sintoma é uma imagem lavada, que passa por "escolha estética" até você medir. Neste projeto, o piso de madeira:

```
(123,101,82)  →  (198,187,176)
```

**Resolução**: remover o `OutputPass` e deixar o renderer converter uma vez, no draw final. Bônus: o bloom volta a operar em HDR linear, que é onde ele foi calibrado — os limiares originais da cena seguem válidos sem retoque.

### 3D-3. `SMAAPass` r168+ ignora o construtor e carrega textura assíncrona

Duas coisas na mesma classe. A assinatura mudou: `new SMAAPass(largura, altura)` compila, roda e **ignora os dois argumentos**. E as lookup textures são montadas atribuindo um data URL a `new Image()` — assíncrono, como o próprio fonte do three anota.

Num browser o loop de animação redesenha e em dois quadros ninguém percebe. Aqui é um tiro por frame.

**Resolução**: MSAA no alvo do composer (`new WebGLRenderTarget(w, h, { samples: 4 })`) resolve sem pass nenhum. Note também que a doc do three pede que passes desse tipo venham **depois** do `OutputPass` — se o seu vem antes, ele está operando em HDR linear, não em sRGB.

### O que vale além do three.js

Cena 3D só entra no vídeo se cada frame for função pura de `useCurrentFrame()`. `useFrame()` do React Three Fiber é loop de relógio e quebra o determinismo — e o defeito não aparece no Studio, só no MP4. Carregamento assíncrono (GLB, textura, shader) precisa de `useDelayRender()`, e o teto padrão de 30 s não cobre cena pesada.

O teste que fecha a conta: renderize o mesmo frame duas vezes, em processos separados, e compare o hash. Se divergir, sobrou relógio em algum lugar.

---

## Regras do ambiente

- **`typescript` fica fixo em `5.x`.** O TS 7 removeu `ts.sys` da API JS e o bundler do Remotion depende dela. Sintoma: `Cannot read properties of undefined (reading 'readFile')`.
- **O alias `@/` precisa estar em dois lugares** — `tsconfig.json` (`paths`) e `remotion.config.ts` (`overrideWebpackConfig`). Só o tsconfig faz o typecheck passar e o render quebrar.
- **Mexeu em `remotion.config.ts` ou `tsconfig.json`? Reinicie o Studio.** Ele lê esses arquivos apenas no boot; hot reload não pega, e o sintoma é tela em branco.
- **Mapas não renderizam headless.** `maplibre-gl` exige WebGL2; o `delayRender` nunca resolve. A página existe em `pages-mapas-ia.tsx` como `PAGINA_MAPAS`, desregistrada de propósito.

## Ao usar o CLI do RemotionUI

- **`remotion-ui add` de um *composition* edita o seu `Root.tsx`**, injetando `<Composition>` e imports fora das suas pastas, sem avisar. Sempre confira o Root depois.
- **`remotion-ui init` cria um projeto novo aninhado** se não achar config. Escreva o `remotion-ui.json` à mão.
- **Atualizar a lib sobrescreve arquivos já copiados.** A 0.7.0 reescreveu `transition-timing.ts` (derrubando quatro wipes) e trocou a API do `TerminalSimulator`. Reinstale os componentes afetados.

---

## Como escrever uma peça aqui

1. **Consulte `catalog.json`** para achar o componente pela intenção (campo `quando`) e o caminho (`importa`).
2. **Cores e fonte vêm do tema.** Importe de `src/shared/theme.ts` (`PALETTE`, `MONO`, `RADIUS`). Nunca escreva hex no meio do componente — quebra a troca de marca em `brand.ts`.
3. **Passe `fontSize` explícito** sempre que o componente aceitar. Sem isso ele calcula a partir de `useVideoConfig()` e não escala.
4. **Uma coisa se move por vez.** Duas animações simultâneas viram ruído; veja as anotações em `src/recipes/recipes.tsx`.
5. **Verifique renderizando**, não lendo. `npx remotion still <Id> out/x.png --frame=N` e olhe a imagem. Metade dos defeitos aqui só apareceu assim.
6. **Rode `npm run catalog`** se acrescentou componente a uma página.

## Convenções

- UI e comentários em **português**; identificadores em **inglês** quando for API, em português quando for domínio do catálogo.
- O selo `AUTORAL` é para o que foi escrito aqui, sem biblioteca. Não marque como `RemotionUI`/`Bits` algo que você escreveu — induz a procurar um componente que não existe.
- **E o inverso é pior:** não marque como `AUTORAL` algo que veio de uma lib. Isso é reivindicar autoria de terceiro. Em caso de dúvida, o campo `lib` do `catalog.json` é a fonte da verdade — não a memória de quem escreve. Este projeto já errou nessa direção uma vez, num vídeo que falava justamente sobre procedência; o conserto foi cruzar cada selo contra o catálogo antes de publicar.
- Grade do catálogo é fixa em **4 itens por página**. Cinco estouram a altura; crie outra página.
- Peças da **vertical Brasil** (`src/remotion/brasil/`) recebem `escala`, nunca `fontSize` calculado de `useVideoConfig()` — é o que permite usá-las dentro de célula reduzida por transform sem cair na armadilha 1.

---

## Relação com as Agent Skills oficiais do Remotion

Em 14/08/2026 o Remotion publicou [Agent Skills](https://www.remotion.dev/docs/ai/skills) — 12 skills
que ensinam um agente a usar o framework (`npx skills add remotion-dev/skills`). Elas resolvem um
problema diferente do deste arquivo, e as duas coisas se somam:

| camada | pergunta que responde | onde vive |
|---|---|---|
| Agent Skills | **como** escrever Remotion corretamente | repositório oficial |
| `catalog.json` | **o quê** já existe pronto neste projeto | aqui |
| `AGENTS.md` | **onde quebra**, e como o defeito se manifesta | aqui |

### Cobertura verificada das seis armadilhas

(As três de 3D estão fora do escopo das skills oficiais: são comportamento do three.js e do Chromium headless, não do Remotion.)

Leitura do conteúdo real das 12 skills (commit `9f0faa5`, 14/08/2026):

| # | armadilha | nas skills oficiais |
|---|---|---|
| 5 | `TransitionSeries` dura menos que a soma | **coberta** — seção dedicada, com a conta |
| 1 | `useVideoConfig()` reporta a composição | parcial — o mecanismo aparece como escape hatch; a consequência e o caso vertical, não |
| 2 | `Sequence` renderiza `AbsoluteFill` | parcial — o fato está documentado; o sintoma no flex, não |
| 3 | `defaultProps` passa por JSON | parcial — "valores precisam ser JSON-serializáveis"; JSX e o erro React #31, não |
| 4 | ordem e tipo dos `effects` | **não coberta** — os ~50 efeitos aparecem numa lista plana, gerador e filtro misturados, e não há um único exemplo com mais de um efeito no array |
| 6 | cenas que só renderizam `<Img>` | fora de escopo — `MediaFrame`, `ZoomPanFrame` e `CalloutSpotlight` são do RemotionUI, não do Remotion |

O padrão das parciais: a documentação enuncia a **regra**, raramente o **modo de falha**. Saber que
props precisam ser serializáveis não é o mesmo que reconhecer o erro #31 quando ele aparece. É essa
distância que este arquivo cobre — e é por isso que ele continua útil mesmo com as skills instaladas.

**Recomendação:** instale as skills oficiais *e* mantenha um `AGENTS.md` do seu projeto. Elas não competem.

---

## Ambiente de agente (cloud)

Comentários explicam o código, nunca a conversa. Sem path de casa, sem e-mail pessoal — ver `.cursor/rules/no-private-leak.mdc`.

Mapa do produto: `docs/ARQUITETURA.md`. Site: `https://victorsodre.github.io/remotion-agent-catalog/`.

**O `npm run catalog` citado no resto deste arquivo é o GERADOR da origem** (deriva o `catalog.json`
de páginas `.tsx`). Esse gerador **não existe neste repo**. Não há script `catalog` no `package.json`
daqui, de propósito. **Trate `catalog.json` como somente-leitura** (exceto o campo `preview`, que o
`scripts/link-previews.mjs` preenche).

**Tooling** (`node`/`jq` já vêm no ambiente):

- `npm install` — Remotion 4.0.x + MCP + ajv. Update script: `if [ -f package.json ]; then npm install; fi`
- `npm run validate` / `npm test` — verificação do índice (CI).
- `npm run studio` — Remotion Studio em `http://localhost:3000`. **102 peças** do `catalog.json` em
  1080×1080 (1:1), pastas por página. RemotionUI + Bits (`src/demos/bits.tsx`) + remocn
  (SoftBlurIn/ShimmerSweep/Confetti) + Marketing BR + vertical Brasil (`src/remotion/brasil/`,
  prop `escala`) + 4 autorais 3D/movimento **rodam o React**. Pasta `TextoEntrada` dura 180f.
  `SlotRoll` precisa de `color` explícita (default claro some no `THEME.ink`). Typewriter remocn
  ainda é card.   `StaggeredMotion` abre com `delay` negativo senão o frame 0 fica vazio.
  Peças Brasil usam `ENTER = -16` no `useSpring` pelo mesmo motivo. Loops Marketing BR
  começam em `Sequence from={-36}`. Se o canvas do Studio parecer branco em `00:00.00`,
  aperta Space — o tema é papel claro, não tela vazia. `localhost:3000` é o Studio
  (`npm run studio`); o site Pages e `npm run web` (:8080) são o viewer estático.
  `remotion-bits@0.2.0` importa `culori` no bundle — o `package.json` daqui declara. Mexeu em
  `remotion.config.ts` ou `tsconfig.json`? Reinicie o Studio. `npx remotion-ui add` **edita
  `Root.tsx`** — depois de `npm run libs`, confira o Root.
- `typescript` fica em **5.x** (o bundler do Remotion depende de `ts.sys`).
- `npm run web` — visualizador em `http://localhost:8080/web/` (precisa de HTTP, não `file://`).
  Filtro de lib é um por vez (Todas / RemotionUI / Autoral / Bits / Remocn). Sem chip “vídeo real”.
  Prévias: `npm run previews:render` (VP8 540×540 em `web/previews/`). Uma peça:
  `npx remotion render PixQr-Autoral web/previews/PixQr-Autoral.webm --codec=vp8 --scale=0.5`
  e `node scripts/link-previews.mjs`. Pula mapas, Typewriter remocn e verticais.
- `npx remotion-catalog find "<intenção>"` / `npm run mcp`

**Não há lint.** `npm run validate` + `npm test` (+ `npm run typecheck` se mexer em `src/`) bastam.

**Nuances de dados intencionais** (o validador trata como exceções — não "conserte"):

- `Typewriter` existe duas vezes (RemotionUI e Remocn) — peças distintas. README conta como Remocn.
- `AnimatedBarChart` multi-listada em `GraficosDados` e `AudioReativo`.
- Trilhas compostas (`"UI + SimulatedCursor"`); token genérico `UI` é ignorado.
- Quatro receitas de reel são stubs (sem `trilhas`).

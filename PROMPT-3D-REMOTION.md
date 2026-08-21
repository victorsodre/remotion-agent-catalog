# Prompt: cena Three.js dentro do Remotion

Cole no seu agente de código (Claude Code, Cursor, Codex, o que você usar).
Ele existe porque tudo aqui falha **em silêncio**: o Studio mostra a cena certa
e o MP4 sai preto.

---

```
Preciso rodar uma cena Three.js dentro de um vídeo Remotion, renderizada
frame a frame.

CONTEXTO
Tenho uma cena Three.js que já funciona num arquivo HTML avulso.
(Se não tiver: crie uma simples primeiro e faça ela funcionar no browser.)
Quero portá-la para uma composição Remotion, preservando o código da cena.

A REGRA QUE GOVERNA TUDO
O Remotion renderiza os frames FORA DE ORDEM e EM PARALELO, em várias abas
de Chromium que não compartilham estado. Portanto cada frame precisa ser
função pura do número do frame.

Na prática:
- Anime com useCurrentFrame() do Remotion. NUNCA com useFrame() do R3F nem
  com requestAnimationFrame.
- Derive o tempo como `frame / fps` (segundos), não como `frame` puro — assim
  a velocidade não muda se eu trocar o fps da composição.
- Qualquer estado que hoje seja acumulador (`x += (alvo - x) * k`) precisa
  virar forma fechada. Amortecimento exponencial vira:
  `x(t) = alvo + (x0 - alvo) * razao^(t - t0)`
- Interação (clique, tecla) não existe em vídeo. Converta para agendamento:
  uma lista de segundos na timeline.

PORTE DA CENA
- Não redigite a cena. Extraia o script e aplique mudanças pontuais.
- Troque o importmap/CDN por `npm i three`.
- O renderer recebe o <canvas> do React e PRECISA de
  `preserveDrawingBuffer: true`, senão o screenshot sai preto.
- Fixe `renderer.setPixelRatio(1)` — devicePixelRatio muda o resultado
  conforme a máquina.
- Tamanho vem por prop, nunca de useVideoConfig(): dentro de um painel o hook
  devolve o tamanho da COMPOSIÇÃO, não do container.
- Tire OrbitControls, HUD e listeners de resize/teclado.

CARREGAMENTO ASSÍNCRONO
GLB, textura e compilação de shader são assíncronos e o Remotion não espera
nada que ele não conheça — ele fotografa o estado de loading.
- Segure com useDelayRender(). O teto padrão é 30 SEGUNDOS; cena pesada
  estoura. Passe timeoutInMilliseconds maior e rotule a chamada.
- Chame renderer.compileAsync() antes de liberar o render.
- Monte a cena UMA vez por aba, não por frame.

CINCO COISAS QUE FALHAM EM SILÊNCIO
Nenhuma dá erro. Nenhuma aparece no Studio. Todas só aparecem no MP4.

1. useFrame() em vez de useCurrentFrame().
   Sintoma: vídeo com movimento errado ou tremido, diferente a cada render.

2. UnrealBloomPass que NÃO é o último pass da cadeia.
   Ele tem needsSwap = false e compõe de volta no mesmo buffer cuja textura
   acabou de amostrar — feedback loop framebuffer<->textura. Chrome com GPU
   tolera; Chromium headless descarta o draw e TODO pass depois lê preto.
   Sintoma: frame inteiro vazio, zero erros.
   Correção: bloom por último. Se precisar de passes depois, não use ele.

3. Bloom por último JUNTO com OutputPass.
   Ao desenhar na tela o three reaplica tone mapping e sRGB, então a
   conversão acontece duas vezes.
   Sintoma: imagem lavada, que passa por "escolha estética".
   Correção: remova o OutputPass e deixe o renderer converter uma vez, no
   draw final. Bônus: o bloom volta a operar em HDR linear, onde ele foi
   calibrado.

4. SMAAPass em three r168+.
   Ignora os argumentos do construtor e carrega lookup textures por <img>
   assíncrono.
   Correção: MSAA no alvo do composer —
   new WebGLRenderTarget(w, h, { samples: 4 }) passado ao EffectComposer.

5. Config.setChromiumOpenGlRenderer() em render server-side.
   Ele SÓ vale para o CLI. Em renderMedia(), Lambda e Vercel é ignorado em
   silêncio e o render cai em software rendering.
   Correção: passar chromiumOptions: { gl: "angle" } explicitamente.

DETALHES QUE ECONOMIZAM UMA HORA
- <Sequence> renderiza uma <div>, proibida dentro de canvas Three.js. Use
  layout="none".
- Cada aba segura um contexto WebGL próprio. Concurrency alta com cena pesada
  vira pressão de memória de GPU. Comece baixo (--concurrency=2) e suba.
- Em cena Three.js o gargalo raramente é baixar arquivo; costuma ser
  compilação de shader no primeiro render. Meça antes de otimizar.

TESTE DE ACEITE — não pule
Renderize o MESMO frame duas vezes, em processos separados, e compare o hash:

  npx remotion still MinhaComp out/a.png --frame=90 --gl=angle
  npx remotion still MinhaComp out/b.png --frame=90 --gl=angle
  shasum -a 256 out/a.png out/b.png

Os dois hashes precisam ser IDÊNTICOS. Se divergirem, sobrou relógio em
algum lugar — procure useFrame, Date.now, Math.random ou algum acumulador.

Enquanto estiver depurando, renderize STILLS e olhe a imagem. Metade dos
defeitos aqui não aparece de outro jeito. E se der preto sem erro, bissecte:
tire um pass por vez até a imagem voltar.
```

---

## Por que este prompt existe

Cada item da lista custou um render preto. As armadilhas 2, 3 e 4 foram
isoladas por bissecção — um `remotion still` por vez até a imagem voltar — e
não aparecem em nenhuma documentação, porque cada uma isolada é
comportamento correto de uma biblioteca diferente.

O teste de aceite é o que fecha a conta. Sem ele você não sabe se o vídeo
funcionou ou se teve sorte.

English version: [`PROMPT-3D-REMOTION.en.md`](./PROMPT-3D-REMOTION.en.md)

/**
 * Episódio #001 da série "criado só com texto".
 *
 * Um vídeo quadrado (1080×1080) que demonstra o próprio catálogo montado
 * inteiramente com peças do catálogo. A recursão é o argumento: nenhum asset
 * externo, nenhuma peça inventada. Todo caminho de import é conferido contra
 * `catalog.json` no carregamento do módulo — se uma peça for renomeada lá, este
 * arquivo lança em vez de renderizar um número errado.
 *
 * Formato: 1080×1080 · 30fps · 1860 frames (62s). Sem trilha nesta v1.
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import { loadFont } from "@remotion/google-fonts/Inter";

import catalog from "../../../catalog.json";

/* ------------------------------------------------------------------ *
 * As peças. Todos os caminhos abaixo saem de `catalog.json` (campo    *
 * `importa`) — a lista USADAS confere isso em tempo de carga.         *
 * ------------------------------------------------------------------ */
import { DynamicGrid } from "@/remotion/primitives/dynamic-grid";
import { ChatToPreview } from "@/remotion/scenes/chat-to-preview";
import { SlotRoll } from "@/remotion/primitives/slot-roll";
import { TrackingIn } from "@/remotion/primitives/tracking-in";
import { ClaudeCode } from "@/remotion/scenes/claude-code";
import { BentoPan } from "@/compositions/bento-pan";
import { CodeReveal } from "@/remotion/scenes/code-reveal";
import { TerminalSimulator } from "@/remotion/scenes/terminal-simulator";
import { CalloutSpotlight } from "@/remotion/scenes/callout-spotlight";
import { StaggeredFadeUp } from "@/remotion/primitives/staggered-fade-up";
import { MetricTicker } from "@/remotion/scenes/metric-ticker";
import { LightSweepText } from "@/remotion/primitives/light-sweep-text";
import { zoomThrough } from "@/remotion/primitives/zoom-through";
import { directionalWipe } from "@/remotion/primitives/directional-wipe";
import { resolveTransitionTiming } from "@/remotion/lib/transition-timing";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

/* ==================================================================== *
 * COPY — todo texto do episódio mora aqui.                             *
 * ==================================================================== */

const COPY = {
  b1: "Este vídeo foi criado apenas com texto.",
  b2Sufixo: "peças.",
  b2Linha: "O método em 60 segundos.",

  b3aLabel: "1. O agente lê o pedido",
  b3bLabel: "2. Ele compõe a partir do catálogo",
  b3cLabel: "3. Preview → ajuste → render",

  b4Kicker: "o repositório",
  b4Titulo: "remotion-agent-catalog",
  b4Sub: "AGENTS.md · catalog.json · o índice do que já existe",
  b4Linha1: "Fazer vídeo com IA não é difícil.",
  b4Linha2: "O que separa slop de resultado é o método.",

  b5Eyebrow: "criado só com texto",
  b5Titulo: "o custo real deste vídeo",
  b5Metricas: ["peças do catálogo", "prompt", "timeline"],
  b5Linha1: "Amanhã: um vídeo do zero com uma ideia dos comentários.",
  b5Linha2: "Manda a tua.",

  b6Handle: "@ovictor",
  b6Assinatura: "método, não hype",

  badge: "criado só com texto · #001",

  /** Pedido que o ClaudeCode digita em B3a. */
  prompt: "monta o episódio 001 só com peças do catálogo",
  /** Conversa do ChatToPreview em B1. */
  chat: [
    { role: "user" as const, text: "um vídeo sobre o catálogo" },
    {
      role: "assistant" as const,
      text: "monto só com o que já existe: a grade de fundo, a cena do terminal, o painel de código e o contador — nenhum asset externo",
    },
    // Cabe no compositor (~33 caracteres antes de cortar na borda).
    { role: "user" as const, text: "e o número vem do catalog.json" },
  ],
  chatPreviewTitulo: "Ep001Metodo",
  chatPreviewLegenda: "1080×1080 · 30fps",
  chatPreviewLabel: "Ep001Metodo",
  chatPlaceholder: "descreve a cena…",

  /** Comando simulado em B3c — o mesmo que renderiza este arquivo. */
  comando: "npx remotion render Ep001Metodo out/ep001.mp4",
  terminalPrompt: "~",
  terminalTitulo: "remotion-agent-catalog",
};

/* ==================================================================== *
 * Dados reais — derivados de catalog.json, nunca digitados à mão.      *
 * ==================================================================== */

type PecaDoCatalogo = {
  nome: string;
  lib: string;
  importa: string;
  ciclo: number;
};

const PECAS_DO_CATALOGO: PecaDoCatalogo[] = [
  ...catalog.paginas.flatMap((pagina) =>
    pagina.itens.map((item) => ({
      nome: item.nome,
      lib: item.lib,
      importa: item.importa,
      ciclo: item.ciclo,
    })),
  ),
  ...catalog.verticais.map((vertical) => ({
    nome: vertical.nome,
    lib: vertical.lib,
    importa: vertical.importa,
    ciclo: vertical.duracao,
  })),
];

/**
 * Mesma regra de contagem do `scripts/validate.mjs`: o catálogo se conta por
 * *nomes únicos*, não por entradas (AnimatedBarChart aparece em duas páginas).
 */
export const TOTAL_PECAS = new Set(PECAS_DO_CATALOGO.map((p) => p.nome)).size;

function doCatalogo(nome: string): PecaDoCatalogo {
  const peca = PECAS_DO_CATALOGO.find((p) => p.nome === nome);
  if (!peca) {
    throw new Error(
      `Ep001Metodo: a peça "${nome}" não existe em catalog.json — número verdadeiro ou nada.`,
    );
  }
  return peca;
}

/**
 * As peças que este arquivo usa, na ordem em que entram em cena. É esta lista
 * que alimenta o CodeReveal de B3b e o número de B5 — os dois olham para a
 * mesma fonte, então não há como um mentir sobre o outro.
 */
export const USADAS = [
  "DynamicGrid",
  "ChatToPreview",
  "SlotRoll",
  "TrackingIn",
  "zoomThrough",
  "ClaudeCode",
  "BentoPan",
  "CodeReveal",
  "TerminalSimulator",
  "directionalWipe",
  "CalloutSpotlight",
  "StaggeredFadeUp",
  "MetricTicker",
  "LightSweepText",
].map(doCatalogo);

const TOTAL_USADAS = USADAS.length;

/**
 * A janela do CodeReveal tem 940px fixos e não aceita fontSize: acima de 72
 * caracteres a linha passa da borda e o `";` some. Quebra no mesmo formato que
 * o Prettier usa quando estoura a largura — os símbolos e caminhos continuam
 * exatamente os que este arquivo importa.
 */
const LARGURA_MAXIMA_DA_LINHA = 72;

function linhasDeImport(peca: PecaDoCatalogo): string[] {
  const linha = `import { ${peca.nome} } from "${peca.importa}";`;
  if (linha.length <= LARGURA_MAXIMA_DA_LINHA) return [linha];
  return ["import {", `  ${peca.nome},`, `} from "${peca.importa}";`];
}

/** O bloco de imports deste próprio arquivo, gerado a partir de USADAS. */
const CODIGO_IMPORTS = [
  `// as ${TOTAL_USADAS} peças deste vídeo — caminhos de catalog.json`,
  ...USADAS.flatMap(linhasDeImport),
].join("\n");

/** O CodeReveal digita a 55 cps e pausa 0.07s por quebra, antes do `speed`. */
const CODIGO_SEGUNDOS =
  CODIGO_IMPORTS.length / 55 + CODIGO_IMPORTS.split("\n").length * 0.07;

/**
 * Colunas do contador de B2.
 *
 * Um `SlotRoll` só, de `"000"` para `"102"`, não é um contador: cada coluna é
 * um cilindro independente, e a dezena nem se mexe — o guarda `from === to`
 * devolve o dígito parado. Lido de fora o número pula (900, 004, 105) e depois
 * aparece 102 do nada.
 *
 * Um hodômetro de verdade dá, em cada casa, os passos que aquela casa dá
 * contando de 0 até o total: 102 na unidade, 10 na dezena, 1 na centena. E as
 * casas altas param antes da unidade — é isso que faz a leitura terminar em
 * 099 → 100 → 101 → 102. Uma `SlotRoll` por dígito reproduz o mecanismo sem
 * tocar na peça.
 */
function colunasDoContador(total: number) {
  const digitos = String(total).split("");
  const casas = digitos.length;

  return digitos.map((digito, i) => {
    const casa = 10 ** (casas - 1 - i);
    const passos = Math.floor(total / casa);
    const alvo = Number(digito);
    // `SlotRoll` anda `spins * 10 + forward`, com `forward = (to - from) mod 10`.
    // forward 0 travaria a coluna, então nunca deixamos `from` cair no alvo.
    const resto = passos % 10 || 9;
    const from = String((alvo - resto + 10) % 10);
    const spins = Math.max(
      passos >= 10 ? 1 : 0,
      Math.round((passos - resto) / 10),
    );
    return { from, to: digito, spins };
  });
}

const CONTADOR = colunasDoContador(TOTAL_PECAS);

/**
 * A unidade roda o rolo inteiro; as casas de cima param na metade, que é onde
 * a unidade cruza a centena sob a curva de entrada do `SlotRoll`.
 */
const ROLO = { unidade: 58, casasAltas: 32 } as const;

/** Cores por lib — as mesmas do site do catálogo (ver `src/CatalogPiece.tsx`). */
const COR_LIB: Record<string, string> = {
  RemotionUI: "#4b8bff",
  Autoral: "#37d399",
  Bits: "#b184ff",
  Remocn: "#ffb020",
};

/** Sparkline determinística a partir do nome — render precisa ser reproduzível. */
function trendDoNome(nome: string): number[] {
  return Array.from({ length: 6 }, (_, i) => {
    const code = nome.charCodeAt((i * 3) % nome.length);
    return 0.32 + ((code + i * 17) % 61) / 90;
  });
}

/** 12 peças reais, três por lib, na ordem do catálogo — a grade de B3b. */
const TILES = (["RemotionUI", "Autoral", "Bits", "Remocn"] as const).flatMap(
  (lib) =>
    PECAS_DO_CATALOGO.filter((p) => p.lib === lib)
      .slice(0, 3)
      .map((p) => ({
        label: p.nome,
        value: `${p.ciclo}f`,
        color: COR_LIB[lib],
        trend: trendDoNome(p.nome),
      })),
);

/**
 * Commits reais deste repositório (`git log --oneline`) — o mock de B4 mostra o
 * histórico que existe, não um placeholder.
 */
const COMMITS = [
  { hash: "091e3a1", texto: "Da caminho de volta: links, rodapé e card de link" },
  { hash: "f1c5385", texto: "Credita o RemotionUI nos 29 arquivos vendorizados" },
  { hash: "67c5a11", texto: "feat(previews): extrair .webm de cada peça (#5)" },
  { hash: "73a264b", texto: "fix(studio): peças visíveis no frame 0 (#4)" },
  { hash: "bbdd223", texto: "feat(studio): catálogo inteiro no localhost:3000 (#3)" },
];

/** Árvore real da raiz do repositório. */
const ARVORE = [
  { nome: "AGENTS.md", nivel: 0, tipo: "regra" as const },
  { nome: "catalog.json", nivel: 0, tipo: "dado" as const },
  { nome: "src/", nivel: 0, tipo: "pasta" as const },
  { nome: "compositions/", nivel: 1, tipo: "pasta" as const },
  { nome: "remotion/", nivel: 1, tipo: "pasta" as const },
  { nome: "scripts/", nivel: 0, tipo: "pasta" as const },
  { nome: "web/", nivel: 0, tipo: "pasta" as const },
];

/* ==================================================================== *
 * Paleta e medidas do quadro                                           *
 * ==================================================================== */

/** Dark do site do catálogo — mesmas cores de `src/CatalogPiece.tsx`. */
export const PALETA = {
  fundo: "#0b0d12",
  painel: "#12151d",
  texto: "#e7ebf3",
  mudo: "#93a0b8",
  fraco: "#63708c",
  acento: "#4b8bff",
} as const;

/** Safe area do quadro: 120px nas quatro bordas. O quadro é simétrico. */
const PAD = 120;
export const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

/** Corpo mínimo na largura de 1080 — post assistido no mudo. */
const CORPO = 72;

/** Durações de cada bloco (as transições descontam da soma — ver AGENTS.md #5). */
const SEQ = {
  b1: 90,
  b2: 135,
  b3a: 240,
  b3b: 390,
  b3c: 312,
  b4: 300,
  b5: 240,
  b6: 180,
} as const;

const TRANSICAO = { zoom: 15, wipe: 12 } as const;

/** Repartição interna de B3b e dos blocos que trocam de peça no meio. */
const CORTE = { bento: 200, callout: 150, ticker: 148 } as const;

/**
 * O frame 0 vira a miniatura do post, então B1 não pode abrir num painel vazio:
 * a cena do ChatToPreview começa pré-rolada e a legenda já entra assentada.
 */
const PRE_ROLO_B1 = 155;
const VELOCIDADE_B1 = 1;

/**
 * `speed` do CodeReveal calculado a partir do próprio texto: a escrita termina
 * em ~80% da janela e sobra respiro no fim. Se a lista de peças crescer, o
 * ritmo acompanha sozinho em vez de a listagem estourar o bloco.
 */
const VELOCIDADE_DO_CODIGO = Number(
  ((CODIGO_SEGUNDOS * 30) / ((SEQ.b3b - CORTE.bento) * 0.8)).toFixed(2),
);

export const EP001_DURATION =
  Object.values(SEQ).reduce((soma, d) => soma + d, 0) -
  TRANSICAO.zoom -
  TRANSICAO.wipe;

/** Frame em que o badge entra e sai (B3 a B5) — depois do zoomThrough. */
const BADGE_DE = SEQ.b1 + SEQ.b2;
const BADGE_ATE = EP001_DURATION - SEQ.b6 - BADGE_DE;

/* ==================================================================== *
 * Peças de cenário deste episódio (não são peças de catálogo)          *
 * ==================================================================== */

/** Véu inferior — segura o contraste da legenda por cima de qualquer cena. */
const Veu: React.FC<{ altura?: number; ancora?: "cima" | "baixo" }> = ({
  altura = 460,
  ancora = "baixo",
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      ...(ancora === "cima" ? { top: 0 } : { bottom: 0 }),
      height: altura,
      background: `linear-gradient(${
        ancora === "cima" ? 0 : 180
      }deg, rgba(11,13,18,0) 0%, rgba(11,13,18,0.82) 55%, ${PALETA.fundo} 100%)`,
      pointerEvents: "none",
    }}
  />
);

/**
 * Legenda do bloco: âncora inferior esquerda, dentro dos 120px de margem.
 * O texto entra com StaggeredFadeUp — a peça de catálogo que respeita ritmo de
 * leitura (ver `escolhas` do catalog.json).
 */
const Legenda: React.FC<{
  texto: string;
  delay?: number;
  tamanho?: number;
  cor?: string;
  /** "cima" tira a legenda de cima da ação quando a cena é ancorada embaixo. */
  ancora?: "cima" | "baixo";
}> = ({
  texto,
  delay = 6,
  tamanho = CORPO,
  cor = PALETA.texto,
  ancora = "baixo",
}) => (
  <>
    <Veu ancora={ancora} />
    <div
      style={{
        position: "absolute",
        left: PAD,
        right: PAD,
        ...(ancora === "cima" ? { top: PAD } : { bottom: PAD }),
        display: "flex",
      }}
    >
      <StaggeredFadeUp
        text={texto}
        fontSize={tamanho}
        color={cor}
        fontWeight={700}
        fontFamily={fontFamily}
        delayInFrames={delay}
        staggerInFrames={3}
        durationInFrames={18}
      />
    </div>
  </>
);

/** Badge discreto, canto superior esquerdo, dentro da safe area. */
const Badge: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: PAD,
        top: PAD,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 22px",
        borderRadius: 999,
        border: `1px solid rgba(231,235,243,0.16)`,
        background: "rgba(11,13,18,0.62)",
        opacity,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: PALETA.acento,
        }}
      />
      <span
        style={{
          fontFamily,
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "0.08em",
          color: PALETA.mudo,
        }}
      >
        {COPY.badge}
      </span>
    </div>
  );
};

/* -------------------------------------------------------------------- *
 * Mock do repositório para o CalloutSpotlight (B4).                      *
 * Geometria fixa: o alvo do spotlight aponta para este retângulo.        *
 * -------------------------------------------------------------------- */

const MOCK = { x: 120, y: 204, w: 840, h: 486 } as const;

const MockRepo: React.FC<{ animarEntrada?: boolean }> = ({
  animarEntrada = true,
}) => {
  const frame = useCurrentFrame();
  const entrada = animarEntrada
    ? interpolate(frame, [0, 18], [0, 1], {
        easing: Easing.out(Easing.cubic),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const corTipo = {
    regra: "#ffb020",
    dado: "#37d399",
    pasta: PALETA.acento,
  } as const;

  return (
    <div
      style={{
        position: "absolute",
        left: MOCK.x,
        top: MOCK.y,
        width: MOCK.w,
        height: MOCK.h,
        borderRadius: 20,
        background: PALETA.painel,
        border: "1px solid rgba(231,235,243,0.10)",
        overflow: "hidden",
        opacity: entrada,
        transform: `translateY(${(1 - entrada) * 18}px)`,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 34px 90px rgba(0,0,0,0.55)",
      }}
    >
      {/* chrome */}
      <div
        style={{
          height: 56,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 22px",
          borderBottom: "1px solid rgba(231,235,243,0.08)",
          background: "rgba(231,235,243,0.03)",
        }}
      >
        {["#ff5f57", "#febc2e", "#28c840"].map((cor) => (
          <div
            key={cor}
            style={{ width: 12, height: 12, borderRadius: "50%", background: cor }}
          />
        ))}
        <span
          style={{
            marginLeft: 16,
            fontFamily: MONO,
            fontSize: 22,
            color: PALETA.mudo,
          }}
        >
          {COPY.b4Titulo}
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* árvore */}
        <div
          style={{
            width: 320,
            flexShrink: 0,
            padding: "22px 20px",
            borderRight: "1px solid rgba(231,235,243,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {ARVORE.map((no) => (
            <div
              key={no.nome}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                paddingLeft: no.nivel * 22,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: corTipo[no.tipo],
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 24,
                  color: no.nivel === 0 ? PALETA.texto : PALETA.mudo,
                }}
              >
                {no.nome}
              </span>
            </div>
          ))}
        </div>

        {/* commits */}
        <div
          style={{
            flex: 1,
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontFamily,
              fontSize: 19,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: PALETA.fraco,
            }}
          >
            commits
          </span>
          {COMMITS.map((commit) => (
            <div
              key={commit.hash}
              style={{ display: "flex", gap: 14, alignItems: "baseline", minWidth: 0 }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 21,
                  color: PALETA.acento,
                  flexShrink: 0,
                }}
              >
                {commit.hash}
              </span>
              <span
                style={{
                  fontFamily,
                  fontSize: 21,
                  color: PALETA.mudo,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {commit.texto}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/** O mock some por trás do texto em vez de brigar com ele. */
const MockRecuado: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 26], [1, 0.14], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      <MockRepo animarEntrada={false} />
    </AbsoluteFill>
  );
};

/** Duas frases grandes, centradas — usadas em B4 e B5. */
const DuasFrases: React.FC<{
  linha1: string;
  linha2: string;
  cor2?: string;
  tamanho?: number;
}> = ({ linha1, linha2, cor2 = PALETA.acento, tamanho = CORPO }) => (
  <AbsoluteFill
    style={{
      padding: PAD,
      alignItems: "flex-start",
      justifyContent: "center",
      gap: 34,
      flexDirection: "column",
      background:
        "radial-gradient(ellipse 90% 70% at 50% 50%, rgba(11,13,18,0.90), rgba(11,13,18,0.99))",
    }}
  >
    <StaggeredFadeUp
      text={linha1}
      fontSize={tamanho}
      color={PALETA.texto}
      fontWeight={700}
      fontFamily={fontFamily}
      delayInFrames={6}
      staggerInFrames={2}
      durationInFrames={14}
    />
    <StaggeredFadeUp
      text={linha2}
      fontSize={tamanho}
      color={cor2}
      fontWeight={700}
      fontFamily={fontFamily}
      delayInFrames={32}
      staggerInFrames={2}
      durationInFrames={14}
    />
  </AbsoluteFill>
);

/* ==================================================================== *
 * Blocos                                                               *
 * ==================================================================== */

/** B1 — o prompt digitando e o vídeo nascendo do outro lado. */
const B1Nascimento: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={-PRE_ROLO_B1} layout="none">
      <AbsoluteFill>
        <ChatToPreview
          messages={COPY.chat}
          previewTitle={COPY.chatPreviewTitulo}
          previewCaption={COPY.chatPreviewLegenda}
          previewLabel={COPY.chatPreviewLabel}
          placeholder={COPY.chatPlaceholder}
          accentColor={PALETA.acento}
          backgroundColor="rgba(4,5,9,0.86)"
          theme="dark"
          speed={VELOCIDADE_B1}
        />
      </AbsoluteFill>
    </Sequence>
    <Legenda texto={COPY.b1} delay={-40} ancora="cima" />
  </AbsoluteFill>
);

/** B2 — a contagem real de peças rolando até o número do catálogo. */
const B2Contagem: React.FC = () => {
  const frame = useCurrentFrame();
  // As colunas em repouso não formam o total (a dezena precisa sair de outro
  // dígito para poder girar), então o número entra já rolando.
  const revela = interpolate(frame, [0, 7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        padding: PAD,
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 26,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 26 }}>
        <div style={{ display: "flex", opacity: revela }}>
          {CONTADOR.map((coluna, i) => (
            <SlotRoll
              key={coluna.to + String(i)}
              from={coluna.from}
              to={coluna.to}
              spins={coluna.spins}
              fontSize={210}
              color={PALETA.texto}
              fontWeight={700}
              durationInFrames={
                i === CONTADOR.length - 1 ? ROLO.unidade : ROLO.casasAltas
              }
              delayInFrames={0}
              staggerInFrames={0}
            />
          ))}
        </div>
        <TrackingIn
          text={COPY.b2Sufixo}
          fontSize={96}
          color={PALETA.acento}
          fontWeight={700}
          fontFamily={fontFamily}
          delayInFrames={54}
          durationInFrames={30}
        />
      </div>
      <StaggeredFadeUp
        text={COPY.b2Linha}
        fontSize={CORPO}
        color={PALETA.mudo}
        fontWeight={600}
        fontFamily={fontFamily}
        delayInFrames={72}
        staggerInFrames={3}
        durationInFrames={18}
      />
      <div
        style={{
          position: "absolute",
          left: PAD,
          bottom: PAD,
          height: 3,
          width: interpolate(frame, [0, 116], [0, 840], {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          background: `linear-gradient(90deg, ${PALETA.acento}, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** B3a — o agente lê o pedido. */
const B3aAgente: React.FC = () => (
  <AbsoluteFill>
    <ClaudeCode
      title="Claude Code"
      userName="victor"
      model="Opus 5"
      cwd="~/ovictor/remotion-agent-catalog"
      placeholder='Try "monta o episódio…"'
      prompt={COPY.prompt}
      accentColor={PALETA.acento}
      theme="dark"
      speed={0.72}
    />
    <Legenda texto={COPY.b3aLabel} delay={12} />
  </AbsoluteFill>
);

/** B3b — a grade do catálogo e, depois, os imports reais deste arquivo. */
const B3bComposicao: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={CORTE.bento + 12} layout="none">
      <AbsoluteFill>
        <BentoPan backgroundColor="transparent" tiles={TILES} />
      </AbsoluteFill>
    </Sequence>

    <Sequence from={CORTE.bento} layout="none">
      <AbsoluteFill>
        <CodeReveal
          code={CODIGO_IMPORTS}
          title="ep001-metodo/index.tsx"
          language="tsx"
          showLineNumbers={false}
          highlightedLines={[1]}
          accentColor={PALETA.acento}
          backgroundColor="transparent"
          theme="dark"
          speed={VELOCIDADE_DO_CODIGO}
        />
      </AbsoluteFill>
    </Sequence>

    <Legenda texto={COPY.b3bLabel} delay={10} />
  </AbsoluteFill>
);

/** B3c — preview, ajuste, render. O comando é o que renderiza este arquivo. */
const B3cRender: React.FC = () => (
  <AbsoluteFill>
    <TerminalSimulator
      command={COPY.comando}
      prompt={COPY.terminalPrompt}
      title={COPY.terminalTitulo}
      shell="zsh"
      steps={[
        { text: "Bundling src/index.ts", work: 1.1, duration: "4.2s" },
        {
          text: `Composition Ep001Metodo · 1080×1080 · ${EP001_DURATION} frames`,
          tone: "info",
        },
        { text: "Rendering frames", work: 2.2, duration: "1m 48s" },
        { text: "Encoding out/ep001.mp4", work: 1.2, duration: "22s" },
      ]}
      summary={`${TOTAL_USADAS} peças do catálogo · 0 assets externos`}
      accentColor={PALETA.acento}
      backgroundColor="transparent"
      theme="dark"
      speed={0.9}
      zoom={1.05}
    />
    <Legenda texto={COPY.b3cLabel} delay={10} />
  </AbsoluteFill>
);

/** B4 — o método é o repositório. */
const B4Metodo: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={CORTE.callout} layout="none">
      <AbsoluteFill>
        <MockRepo />
        <CalloutSpotlight
          kicker={COPY.b4Kicker}
          title={COPY.b4Titulo}
          subtitle={COPY.b4Sub}
          target={{ x: MOCK.x, y: MOCK.y, width: MOCK.w, height: MOCK.h }}
          dim={0.78}
          backgroundColor="transparent"
          accentColor={PALETA.acento}
          theme="dark"
          holdSeconds={3.6}
        />
      </AbsoluteFill>
    </Sequence>

    <Sequence from={CORTE.callout - 38} layout="none">
      <AbsoluteFill>
        <MockRecuado />
        <DuasFrases linha1={COPY.b4Linha1} linha2={COPY.b4Linha2} />
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>
);

/** B5 — o custo real, contado no código, e o convite. */
const B5Numeros: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={CORTE.ticker} layout="none">
      <AbsoluteFill>
        <MetricTicker
          eyebrow={COPY.b5Eyebrow}
          title={COPY.b5Titulo}
          metrics={[
            { label: COPY.b5Metricas[0], value: TOTAL_USADAS, color: PALETA.acento },
            { label: COPY.b5Metricas[1], value: 1, color: "#37d399" },
            { label: COPY.b5Metricas[2], value: 0, color: "#ffb020" },
          ]}
          valueFormatter={(valor) => String(Math.round(valor))}
          backgroundColor="transparent"
          accentColor={PALETA.acento}
          holdSeconds={4.4}
        />
      </AbsoluteFill>
    </Sequence>

    <Sequence from={CORTE.ticker - 16} layout="none">
      <AbsoluteFill>
        <DuasFrases
          linha1={COPY.b5Linha1}
          linha2={COPY.b5Linha2}
          cor2={PALETA.acento}
        />
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>
);

/** B6 — assinatura. Sem confetti. */
const B6Assinatura: React.FC = () => (
  <AbsoluteFill
    style={{
      padding: PAD,
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center",
      gap: 28,
      background:
        "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(11,13,18,0.80), rgba(11,13,18,0.96))",
    }}
  >
    <LightSweepText
      text={COPY.b6Handle}
      fontSize={132}
      fontWeight={700}
      fontFamily={fontFamily}
      baseColor="#aab4c6"
      shineColor="#ffffff"
      bandWidth={14}
      easing={Easing.linear}
      durationInFrames={104}
      delayInFrames={6}
    />
    <LightSweepText
      text={COPY.b6Assinatura}
      fontSize={CORPO}
      fontWeight={600}
      fontFamily={fontFamily}
      baseColor="#6c788d"
      shineColor={PALETA.acento}
      bandWidth={14}
      easing={Easing.linear}
      durationInFrames={104}
      delayInFrames={34}
    />
  </AbsoluteFill>
);

/* ==================================================================== *
 * Composition                                                          *
 * ==================================================================== */

export const Ep001Metodo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: PALETA.fundo, fontFamily }}>
      {/* Fundo do vídeo inteiro. */}
      <DynamicGrid
        backgroundColor={PALETA.fundo}
        lineColor="rgba(231,235,243,0.055)"
        sweepColor="rgba(75,139,255,0.34)"
        spacing={72}
        lineWidth={2}
        speed={0.34}
        sweepDurationInFrames={fps * 9}
      />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SEQ.b1}>
          <B1Nascimento />
        </TransitionSeries.Sequence>

        <TransitionSeries.Sequence durationInFrames={SEQ.b2}>
          <B2Contagem />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={zoomThrough({
            direction: "in",
            maxScale: 1.9,
            blurPeak: 6,
          })}
          timing={resolveTransitionTiming({
            durationInFrames: TRANSICAO.zoom,
          })}
        />

        <TransitionSeries.Sequence durationInFrames={SEQ.b3a}>
          <B3aAgente />
        </TransitionSeries.Sequence>

        <TransitionSeries.Sequence durationInFrames={SEQ.b3b}>
          <B3bComposicao />
        </TransitionSeries.Sequence>

        <TransitionSeries.Sequence durationInFrames={SEQ.b3c}>
          <B3cRender />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={directionalWipe({ direction: "from-left" })}
          timing={resolveTransitionTiming({
            durationInFrames: TRANSICAO.wipe,
          })}
        />

        <TransitionSeries.Sequence durationInFrames={SEQ.b4}>
          <B4Metodo />
        </TransitionSeries.Sequence>

        <TransitionSeries.Sequence durationInFrames={SEQ.b5}>
          <B5Numeros />
        </TransitionSeries.Sequence>

        <TransitionSeries.Sequence durationInFrames={SEQ.b6}>
          <B6Assinatura />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Sequence from={BADGE_DE} durationInFrames={BADGE_ATE} layout="none">
        <AbsoluteFill>
          <Badge />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

/** Números que o vídeo afirma — exportados para conferência fora daqui. */
export const EP001_NUMEROS = {
  totalPecasCatalogo: TOTAL_PECAS,
  pecasUsadas: USADAS.map((p) => p.nome),
  totalPecasUsadas: TOTAL_USADAS,
};

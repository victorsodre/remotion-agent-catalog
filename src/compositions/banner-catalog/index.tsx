/**
 * Banner do perfil no X — 1500×500, um frame só (still).
 *
 * Mesma regra do episódio: nada de asset inventado e nenhum número digitado à
 * mão. O mosaico usa os `.webm` que o próprio Studio renderizou de cada peça, e
 * a contagem sai de `catalog.json` pela mesma conta do `scripts/validate.mjs`
 * (importada de Ep001Metodo, para não existir uma terceira cópia da regra).
 *
 * Duas restrições do formato mandam no layout:
 *
 * 1. **Margem segura de 80px.** O X corta as laterais do banner em telas
 *    estreitas — nada encosta na borda.
 * 2. **O terço inferior esquerdo fica vazio.** É onde o avatar do perfil cobre
 *    o banner. `ZONA_DO_AVATAR` guarda esse retângulo e o módulo lança se
 *    alguma célula ou o bloco de texto invadir — o defeito aparece no render,
 *    não no perfil publicado.
 *
 * Render:  npx remotion still BannerCatalog out/banner.png
 */
import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

import catalog from "../../../catalog.json";
import { DynamicGrid } from "@/remotion/primitives/dynamic-grid";
import { MONO, PALETA, TOTAL_PECAS, USADAS } from "@/compositions/ep001-metodo";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

/* ==================================================================== *
 * COPY                                                                 *
 * ==================================================================== */

const COPY = {
  eyebrow: "criado só com texto",
  titulo: ["remotion-", "agent-catalog"],
  sufixoDaContagem: "peças",
  rodape: "@ovictor · github.com/victorsodre",
};

/* ==================================================================== *
 * As peças do mosaico — prioridade para as do episódio 001             *
 * ==================================================================== */

type Peca = { nome: string; lib: string; preview: string; ciclo: number };

const TODAS: Peca[] = [
  ...catalog.paginas.flatMap((pagina) =>
    pagina.itens.map((item) => ({
      nome: item.nome,
      lib: item.lib,
      preview: "preview" in item && typeof item.preview === "string" ? item.preview : "",
      ciclo: item.ciclo,
    })),
  ),
  ...catalog.verticais.map((vertical) => ({
    nome: vertical.nome,
    lib: vertical.lib,
    preview:
      "preview" in vertical && typeof vertical.preview === "string" ? vertical.preview : "",
    ciclo: vertical.duracao,
  })),
];

function doCatalogo(nome: string): Peca {
  const peca = TODAS.find((p) => p.nome === nome);
  if (!peca) {
    throw new Error(
      `BannerCatalog: a peça "${nome}" não existe em catalog.json — miniatura real ou nada.`,
    );
  }
  if (!peca.preview) {
    throw new Error(
      `BannerCatalog: "${nome}" não tem prévia renderizada (npm run previews:render).`,
    );
  }
  return peca;
}

/**
 * Três das catorze peças do episódio não sobrevivem a um frame parado, e por
 * motivos diferentes:
 *
 * - `DynamicGrid` já é o fundo deste banner — uma miniatura dela seria um
 *   quadrado do mesmo preto.
 * - `zoomThrough` e `directionalWipe` são transições. A prévia delas é um
 *   plano de cor A virando um plano de cor B; num still não sobra transição
 *   nenhuma, só o plano de cor.
 */
const SEM_MINIATURA: Record<string, string> = {
  DynamicGrid: "é o fundo deste banner",
  zoomThrough: "transição — um still não mostra",
  directionalWipe: "transição — um still não mostra",
};

/** Completam as 14 células. Escolhidas por lerem bem em ~100px e por cobrirem
 * o que o episódio não mostra: cena de produto, diagrama e a vertical Brasil. */
const EXTRAS = ["HeroDeviceAssemble", "EcosystemOrbit", "PixQr"];

/**
 * A célula grande. `BentoPan` é a única do episódio que preenche um quadro
 * inteiro sozinha — as cenas de terminal têm margem escura em volta e, no
 * tamanho 2×2, o que aparece é a margem.
 */
const DESTAQUE = "BentoPan";

const DO_EPISODIO = USADAS.map((p) => p.nome).filter((nome) => !(nome in SEM_MINIATURA));

const PECAS: Peca[] = [DESTAQUE, ...[...DO_EPISODIO, ...EXTRAS].filter((n) => n !== DESTAQUE)].map(
  doCatalogo,
);

/**
 * Frame e zoom de cada miniatura, escolhidos olhando o render (AGENTS.md #5).
 * O zoom recorta o miolo: peça de texto ocupa 30% do quadro de 1080 e sumiria
 * numa célula de 100px sem essa aproximação.
 */
const ENQUADRAMENTO: Record<
  string,
  { frame?: number; zoom?: number; origem?: string }
> = {
  ClaudeCode: { frame: 96, zoom: 1.35, origem: "55% 44%" },
  // Frame 132: o painel da direita já montou a cena. Antes disso são duas
  // folhas em branco. A origem joga o recorte no painel, não na divisa.
  ChatToPreview: { frame: 132, zoom: 2, origem: "72% 46%" },
  SlotRoll: { frame: 72, zoom: 3 },
  TrackingIn: { frame: 65, zoom: 2.4 },
  // A janela de código é uma faixa fina no meio do quadro de 1080.
  CodeReveal: { frame: 120, zoom: 3, origem: "50% 45%" },
  TerminalSimulator: { frame: 126, zoom: 2.6, origem: "50% 46%" },
  CalloutSpotlight: { frame: 85, zoom: 1.3 },
  StaggeredFadeUp: { frame: 79, zoom: 1.25 },
  MetricTicker: { frame: 85, zoom: 1.15 },
  BentoPan: { frame: 96, zoom: 1.02 },
  LightSweepText: { frame: 85, zoom: 2.6 },
  HeroDeviceAssemble: { frame: 84, zoom: 1.2 },
  EcosystemOrbit: { frame: 84, zoom: 1.45, origem: "50% 45%" },
  PixQr: { frame: 84, zoom: 1.25 },
};

/** O `.webm` dura pelo menos o ciclo da peça; parar 6 frames antes do fim
 * nunca cai fora do vídeo, mesmo em peça curta. */
function frameDaMiniatura(peca: Peca): number {
  const pedido = ENQUADRAMENTO[peca.nome]?.frame ?? Math.round(peca.ciclo * 0.72);
  return Math.max(6, Math.min(pedido, peca.ciclo - 6));
}

/* ==================================================================== *
 * Grade                                                                *
 * ==================================================================== */

const LARGURA = 1500;
const ALTURA = 500;

/** Margem segura: o X corta as laterais em tela estreita. */
const MARGEM = 80;

/** O avatar do perfil cobre este retângulo. Nada importante entra aqui. */
const ZONA_DO_AVATAR = { x: 0, y: 300, largura: 500, altura: 200 };

const MOSAICO = {
  esquerda: MARGEM,
  topo: MARGEM,
  largura: 780,
  altura: ALTURA - MARGEM * 2,
};
const COLUNAS = 7;
const LINHAS = 3;
const VAO = 12;
const RAIO = 10;

const CELULA_L = (MOSAICO.largura - VAO * (COLUNAS - 1)) / COLUNAS;

/**
 * A altura sai da restrição, não do gosto: dividir a faixa em três daria 105px
 * e o destaque 2×2 (duas células + vão) terminaria 3px dentro do avatar. O teto
 * abaixo é o que faz ele parar antes — com 4px de folga.
 */
const CELULA_A = Math.min(
  (MOSAICO.altura - VAO * (LINHAS - 1)) / LINHAS,
  (ZONA_DO_AVATAR.y - MOSAICO.topo - VAO - 4) / 2,
);

type Retangulo = { x: number; y: number; largura: number; altura: number };

const retangulo = (coluna: number, linha: number, cols = 1, rows = 1): Retangulo => ({
  x: MOSAICO.esquerda + coluna * (CELULA_L + VAO),
  y: MOSAICO.topo + linha * (CELULA_A + VAO),
  largura: cols * CELULA_L + (cols - 1) * VAO,
  altura: rows * CELULA_A + (rows - 1) * VAO,
});

/**
 * Bento: um destaque 2×2 no alto à esquerda e o resto em células de 1×1. A
 * linha de baixo começa só na coluna 4 — as três primeiras ficariam debaixo do
 * avatar. O vazio não é sobra de layout, é a área reservada.
 */
const CELULAS: Retangulo[] = [
  retangulo(0, 0, 2, 2),
  retangulo(2, 0),
  retangulo(3, 0),
  retangulo(4, 0),
  retangulo(5, 0),
  retangulo(6, 0),
  retangulo(2, 1),
  retangulo(3, 1),
  retangulo(4, 1),
  retangulo(5, 1),
  retangulo(6, 1),
  retangulo(4, 2),
  retangulo(5, 2),
  retangulo(6, 2),
];

const TEXTO: Retangulo = {
  x: MOSAICO.esquerda + MOSAICO.largura + 60,
  y: MARGEM,
  largura: LARGURA - MARGEM - (MOSAICO.esquerda + MOSAICO.largura + 60),
  altura: ALTURA - MARGEM * 2,
};

/* -------- invariantes do formato, conferidas no carregamento -------- */

function invade(r: Retangulo, zona: typeof ZONA_DO_AVATAR): boolean {
  return (
    r.x < zona.x + zona.largura &&
    r.x + r.largura > zona.x &&
    r.y < zona.y + zona.altura &&
    r.y + r.altura > zona.y
  );
}

for (const [i, celula] of [...CELULAS, TEXTO].entries()) {
  if (invade(celula, ZONA_DO_AVATAR)) {
    throw new Error(
      `BannerCatalog: o bloco ${i} (x=${Math.round(celula.x)}, y=${Math.round(celula.y)}) cai debaixo do avatar do perfil.`,
    );
  }
  const dentro =
    celula.x >= MARGEM &&
    celula.y >= MARGEM &&
    celula.x + celula.largura <= LARGURA - MARGEM &&
    celula.y + celula.altura <= ALTURA - MARGEM;
  if (!dentro) {
    throw new Error(`BannerCatalog: o bloco ${i} passa da margem segura de ${MARGEM}px.`);
  }
}

if (PECAS.length !== CELULAS.length) {
  throw new Error(
    `BannerCatalog: ${PECAS.length} peças para ${CELULAS.length} células — o mosaico ficaria com buraco.`,
  );
}

/* ==================================================================== *
 * Peças de cenário (não são peças de catálogo)                         *
 * ==================================================================== */

const Miniatura: React.FC<{ peca: Peca; celula: Retangulo }> = ({ peca, celula }) => (
  <div
    style={{
      position: "absolute",
      left: celula.x,
      top: celula.y,
      width: celula.largura,
      height: celula.altura,
      borderRadius: RAIO,
      overflow: "hidden",
      background: PALETA.painel,
      border: "1px solid rgba(231,235,243,0.10)",
      boxShadow: "0 14px 30px rgba(0,0,0,0.45)",
    }}
  >
    <OffthreadVideo
      src={staticFile(peca.preview)}
      trimBefore={frameDaMiniatura(peca)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${ENQUADRAMENTO[peca.nome]?.zoom ?? 1})`,
        transformOrigin: ENQUADRAMENTO[peca.nome]?.origem ?? "center",
      }}
    />
    {/* As prévias saem no tema claro do catálogo; o véu tira o estouro sem
        apagar o conteúdo. */}
    <AbsoluteFill style={{ background: "rgba(11,13,18,0.14)" }} />
  </div>
);

/** Aura atrás do wordmark — segura o contraste do texto sobre a grade. */
const Aura: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(58% 78% at ${
        TEXTO.x + TEXTO.largura * 0.45
      }px 50%, rgba(75,139,255,0.16) 0%, rgba(11,13,18,0) 70%)`,
    }}
  />
);

const Wordmark: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: TEXTO.x,
      top: TEXTO.y,
      width: TEXTO.largura,
      height: TEXTO.altura,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        fontFamily: MONO,
        fontSize: 21,
        fontWeight: 600,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: PALETA.fraco,
      }}
    >
      {COPY.eyebrow}
    </div>

    <div
      style={{
        fontFamily,
        fontSize: 68,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: "-0.025em",
        color: PALETA.texto,
        marginTop: 20,
      }}
    >
      {COPY.titulo.map((linha) => (
        <div key={linha}>{linha}</div>
      ))}
    </div>

    <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 26 }}>
      <span
        style={{
          fontFamily,
          fontSize: 62,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: PALETA.acento,
        }}
      >
        {TOTAL_PECAS}
      </span>
      <span style={{ fontFamily, fontSize: 34, fontWeight: 600, color: PALETA.mudo }}>
        {COPY.sufixoDaContagem}
      </span>
    </div>

    <div style={{ fontFamily: MONO, fontSize: 20, color: PALETA.fraco, marginTop: 24 }}>
      {COPY.rodape}
    </div>
  </div>
);

/* ==================================================================== *
 * Composition                                                          *
 * ==================================================================== */

/**
 * A grade anda e a varredura atravessa o quadro ao longo do ciclo; num still
 * no frame 0 as duas estariam no ponto de partida (grade alinhada, varredura
 * fora da tela). O `Sequence` negativo entrega o fundo já em movimento.
 */
const DERIVA_DO_FUNDO = 235;

export const BannerCatalog: React.FC = () => (
  <AbsoluteFill style={{ background: PALETA.fundo, fontFamily }}>
    <Sequence from={-DERIVA_DO_FUNDO} layout="none">
      <DynamicGrid
        backgroundColor={PALETA.fundo}
        lineColor="rgba(231,235,243,0.055)"
        sweepColor="rgba(75,139,255,0.34)"
        spacing={72}
        lineWidth={2}
        speed={0.34}
        sweepDurationInFrames={270}
      />
    </Sequence>

    <Aura />

    {PECAS.map((peca, i) => (
      <Miniatura key={peca.nome} peca={peca} celula={CELULAS[i]} />
    ))}

    <Wordmark />
  </AbsoluteFill>
);

export const BANNER = { largura: LARGURA, altura: ALTURA };

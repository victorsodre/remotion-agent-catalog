import React from "react";
import { AbsoluteFill, Composition, Folder } from "remotion";
import {
  CtaBrasil,
  PrecoAncorado,
  ProvaSocial,
  provaDefaults,
  Regressiva,
  SeloDesconto,
} from "./marketing/components";
import { THEME, FPS } from "./shared/theme";

/** Loops curtos das peças autorais Marketing BR — o que o Studio deste repo consegue renderizar. */
const LoopPreco: React.FC = () => (
  <AbsoluteFill style={{ background: THEME.ink, alignItems: "center", justifyContent: "center" }}>
    <PrecoAncorado de="R$ 4.800" por="R$ 2.990" parcelas="ou 12x de R$ 249 sem juros" cor={THEME.a3} escala={1.2} />
  </AbsoluteFill>
);

const LoopSelo: React.FC = () => (
  <AbsoluteFill
    style={{ background: THEME.ink, alignItems: "center", justifyContent: "center", gap: 48, flexDirection: "row" }}
  >
    <SeloDesconto texto="38% OFF" cor={THEME.amber} tamanho={260} />
    <Regressiva segundos={900} cor={THEME.text} escala={1.1} rotulo="a oferta acaba em" />
  </AbsoluteFill>
);

const LoopProva: React.FC = () => (
  <AbsoluteFill style={{ background: THEME.ink, alignItems: "center", justifyContent: "center" }}>
    <ProvaSocial {...provaDefaults} escala={1.15} />
  </AbsoluteFill>
);

const LoopCta: React.FC = () => (
  <AbsoluteFill style={{ background: THEME.ink, alignItems: "center", justifyContent: "center" }}>
    <CtaBrasil escala={1.35} />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <Folder name="MarketingBR">
    <Composition id="MktPrecoAncorado" component={LoopPreco} durationInFrames={150} fps={FPS} width={1080} height={1080} />
    <Composition id="MktSeloRegressiva" component={LoopSelo} durationInFrames={180} fps={FPS} width={1080} height={1080} />
    <Composition id="MktProvaSocial" component={LoopProva} durationInFrames={160} fps={FPS} width={1080} height={1080} />
    <Composition id="MktCtaBrasil" component={LoopCta} durationInFrames={150} fps={FPS} width={1080} height={1080} />
  </Folder>
);

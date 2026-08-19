import React from "react";
import { AbsoluteFill, Composition, Folder, Sequence } from "remotion";
import {
  CtaBrasil,
  PrecoAncorado,
  ProvaSocial,
  provaDefaults,
  Regressiva,
  SeloDesconto,
} from "./marketing/components";
import { THEME, FPS } from "./shared/theme";
import { CatalogPiece } from "./CatalogPiece";
import { catalogEntries } from "./catalog-entries";
import { LIVE } from "./demos";

/** Uma composition por peça: código vivo se existir, senão card + webm. */
const CatalogSlot: React.FC<{
  nome: string;
  lib: string;
  quando: string;
  preview: string | null;
  liveKey: string;
}> = ({ liveKey, ...piece }) => {
  const Live = LIVE[liveKey];
  return Live ? <Live /> : <CatalogPiece {...piece} />;
};

const LoopPreco: React.FC = () => (
  <Sequence from={-36} layout="none">
    <AbsoluteFill style={{ background: THEME.ink, alignItems: "center", justifyContent: "center" }}>
      <PrecoAncorado de="R$ 4.800" por="R$ 2.990" parcelas="ou 12x de R$ 249 sem juros" cor={THEME.a3} escala={1.2} />
    </AbsoluteFill>
  </Sequence>
);

const LoopSelo: React.FC = () => (
  <Sequence from={-36} layout="none">
    <AbsoluteFill
      style={{ background: THEME.ink, alignItems: "center", justifyContent: "center", gap: 48, flexDirection: "row" }}
    >
      <SeloDesconto texto="38% OFF" cor={THEME.amber} tamanho={260} />
      <Regressiva segundos={900} cor={THEME.text} escala={1.1} rotulo="a oferta acaba em" />
    </AbsoluteFill>
  </Sequence>
);

const LoopProva: React.FC = () => (
  <Sequence from={-36} layout="none">
    <AbsoluteFill style={{ background: THEME.ink, alignItems: "center", justifyContent: "center" }}>
      <ProvaSocial {...provaDefaults} escala={1.15} />
    </AbsoluteFill>
  </Sequence>
);

const LoopCta: React.FC = () => (
  <Sequence from={-36} layout="none">
    <AbsoluteFill style={{ background: THEME.ink, alignItems: "center", justifyContent: "center" }}>
      <CtaBrasil escala={1.35} />
    </AbsoluteFill>
  </Sequence>
);

const ENTRIES = catalogEntries();
const FOLDERS = [...new Set(ENTRIES.map((e) => e.folder))];

function slotDuration(folder: string, liveKey: string, ciclo: number) {
  if (!LIVE[liveKey]) return ciclo;
  if (folder === "TextoEntrada") return Math.max(ciclo, 180);
  if (
    folder === "Particulas" ||
    folder === "Tridimensional" ||
    folder === "MovimentoComposto" ||
    folder === "FundosAmbiente" ||
    folder === "BrasilPagamento" ||
    folder === "BrasilConversao" ||
    folder === "BrasilConfianca"
  ) {
    return Math.max(ciclo, 150);
  }
  if (liveKey.endsWith("::SoftBlurIn") || liveKey.endsWith("::ShimmerSweep") || liveKey.endsWith("::Confetti")) {
    return Math.max(ciclo, 150);
  }
  if (liveKey.endsWith("::SlotRoll")) return Math.max(ciclo, 110);
  return Math.max(ciclo, 90);
}

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="MarketingBR-codigo">
      <Composition id="MktPrecoAncorado" component={LoopPreco} durationInFrames={150} fps={FPS} width={1080} height={1080} />
      <Composition id="MktSeloRegressiva" component={LoopSelo} durationInFrames={180} fps={FPS} width={1080} height={1080} />
      <Composition id="MktProvaSocial" component={LoopProva} durationInFrames={160} fps={FPS} width={1080} height={1080} />
      <Composition id="MktCtaBrasil" component={LoopCta} durationInFrames={150} fps={FPS} width={1080} height={1080} />
    </Folder>

    {FOLDERS.map((folder) => (
      <Folder key={folder} name={folder}>
        {ENTRIES.filter((e) => e.folder === folder).map((e) => (
          <Composition
            key={e.id}
            id={e.id}
            component={CatalogSlot}
            durationInFrames={slotDuration(folder, e.liveKey, e.durationInFrames)}
            fps={FPS}
            width={1080}
            height={1080}
            defaultProps={{
              nome: e.nome,
              lib: e.lib,
              quando: e.quando,
              preview: e.preview,
              liveKey: e.liveKey,
            }}
          />
        ))}
      </Folder>
    ))}
  </>
);

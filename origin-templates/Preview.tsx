// VAI NA ORIGEM (src/Preview.tsx) — não é buildado no repo do catálogo.
//
// Composition que renderiza UMA peça por vez, escolhida por `importa` (que é
// único; desambigua colisões como Typewriter) ou, como fallback, por `nome`.
// Recebe apenas strings em props (armadilha 3: nada de JSX em defaultProps).

import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { PALETTE } from "@/shared/theme"; // tema da origem
import { PREVIEW_REGISTRY } from "./preview-registry";

export type PreviewProps = { nome: string; importa: string };

export const Preview: React.FC<PreviewProps> = ({ nome, importa }) => {
  useVideoConfig(); // aqui reporta as dimensões reais da prévia (composition), não de uma célula
  const Comp = PREVIEW_REGISTRY[importa] ?? PREVIEW_REGISTRY[nome];
  return (
    <AbsoluteFill
      style={{
        background: PALETTE?.bg ?? "#0b0d12",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {Comp ? <Comp /> : null}
    </AbsoluteFill>
  );
};

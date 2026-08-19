import React from "react";
import { AbsoluteFill } from "remotion";
import {
  CtaBrasil,
  PrecoAncorado,
  ProvaSocial,
  provaDefaults,
  Regressiva,
  SeloDesconto,
} from "../marketing/components";
import { THEME } from "../shared/theme";

const Dark: React.FC<{ children: React.ReactNode; gap?: number; row?: boolean }> = ({
  children,
  gap = 0,
  row,
}) => (
  <AbsoluteFill
    style={{
      background: THEME.ink,
      alignItems: "center",
      justifyContent: "center",
      gap,
      flexDirection: row ? "row" : "column",
    }}
  >
    {children}
  </AbsoluteFill>
);

export const marketingDemos: Record<string, React.FC> = {
  "MarketingBR::PrecoAncorado": () => (
    <Dark>
      <PrecoAncorado de="R$ 4.800" por="R$ 2.990" parcelas="ou 12x de R$ 249 sem juros" cor={THEME.a3} escala={1.2} />
    </Dark>
  ),
  "MarketingBR::SeloDesconto + Regressiva": () => (
    <Dark gap={48} row>
      <SeloDesconto texto="38% OFF" cor={THEME.amber} tamanho={260} />
      <Regressiva segundos={900} cor={THEME.text} escala={1.1} rotulo="a oferta acaba em" />
    </Dark>
  ),
  "MarketingBR::ProvaSocial": () => (
    <Dark>
      <ProvaSocial {...provaDefaults} escala={1.15} />
    </Dark>
  ),
  "MarketingBR::CtaBrasil": () => (
    <Dark>
      <CtaBrasil escala={1.35} />
    </Dark>
  ),
};

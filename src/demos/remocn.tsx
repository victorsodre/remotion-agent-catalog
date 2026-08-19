import React from "react";
import { AbsoluteFill } from "remotion";
import { ShimmerSweep } from "@/components/remocn/shimmer-sweep";
import { SoftBlurIn } from "@/components/remocn/soft-blur-in";
import { THEME } from "../shared/theme";

export const remocnDemos: Record<string, React.FC> = {
  "TextoEfeito::ShimmerSweep": () => (
    <ShimmerSweep text="brilho" fontSize={96} speed={0.7} />
  ),
  "TextoDigitado::SoftBlurIn": () => (
    <AbsoluteFill style={{ background: THEME.ink }}>
      <SoftBlurIn text="entrada macia" fontSize={84} color={THEME.text} speed={0.55} />
    </AbsoluteFill>
  ),
};

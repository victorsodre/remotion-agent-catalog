import React from "react";
import { AbsoluteFill } from "remotion";
import { Confetti } from "@/components/remocn/confetti";
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
  "CenasProntas::Confetti": () => (
    <AbsoluteFill style={{ background: THEME.ink }}>
      <Confetti
        particleCount={160}
        seed={7}
        originY={0.38}
        startFrame={-12}
        lifetime={90}
        power={18}
        gravity={0.42}
        colors={[THEME.a1, THEME.a2, THEME.a3, THEME.amber, THEME.rose, THEME.zap]}
      />
    </AbsoluteFill>
  ),
};

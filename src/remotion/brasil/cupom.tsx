import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../../shared/theme";
import { card, clamp, pop, useSpring } from "./shared";

export const Cupom: React.FC<{ codigo?: string; escala?: number }> = ({
  codigo = "DESCONTO12",
  escala = 1,
}) => {
  const frame = useCurrentFrame();
  const enter = useSpring();
  const chars = Array.from(codigo);
  const shown = Math.min(chars.length, Math.floor(interpolate(frame, [8, 8 + chars.length * 4], [0, chars.length], clamp)));
  const copiou = interpolate(frame, [8 + chars.length * 4 + 6, 8 + chars.length * 4 + 18], [0, 1], clamp);
  const copiouSpring = useSpring(8 + chars.length * 4 + 8, pop);

  return (
    <div style={{ ...card, padding: 36 * escala, textAlign: "center", minWidth: 560 * escala, opacity: enter }}>
      <div style={{ fontSize: 18 * escala, color: THEME.textMute, fontWeight: 700, letterSpacing: 2 }}>CUPOM</div>
      <div
        style={{
          marginTop: 16 * escala,
          fontSize: 42 * escala,
          fontWeight: 800,
          letterSpacing: 6 * escala,
          color: THEME.text,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {chars.map((c, i) => (
          <span key={i} style={{ opacity: i < shown ? 1 : 0.12 }}>
            {c}
          </span>
        ))}
      </div>
      <div
        style={{
          marginTop: 22 * escala,
          display: "inline-block",
          padding: `${8 * escala}px ${16 * escala}px`,
          borderRadius: 999,
          background: THEME.zap,
          color: THEME.onAccent,
          fontWeight: 800,
          fontSize: 18 * escala,
          opacity: copiou,
          transform: `scale(${0.85 + copiouSpring * 0.15})`,
        }}
      >
        copiado
      </div>
    </div>
  );
};

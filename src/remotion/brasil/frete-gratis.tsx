import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../../shared/theme";
import { brl, card, clamp, useSpring } from "./shared";

export const FreteGratis: React.FC<{
  meta?: number;
  escala?: number;
}> = ({ meta = 150, escala = 1 }) => {
  const frame = useCurrentFrame();
  const enter = useSpring(0);
  const valor = interpolate(frame, [8, 70], [48, 188], clamp);
  const falta = Math.max(0, meta - valor);
  const ok = valor >= meta;
  const pct = Math.min(1, valor / meta);

  return (
    <div style={{ ...card, padding: 36 * escala, width: 720 * escala, opacity: enter }}>
      <div
        style={{
          fontSize: 26 * escala,
          fontWeight: 800,
          color: ok ? THEME.zap : THEME.text,
          marginBottom: 18 * escala,
        }}
      >
        {ok ? "frete grátis" : `faltam ${brl(falta)} para o frete grátis`}
      </div>
      <div
        style={{
          height: 18 * escala,
          borderRadius: 99,
          background: THEME.ink,
          overflow: "hidden",
          border: `1px solid ${THEME.hairline}`,
        }}
      >
        <div
          style={{
            width: `${pct * 100}%`,
            height: "100%",
            background: ok ? THEME.zap : THEME.a1,
            borderRadius: 99,
          }}
        />
      </div>
      <div style={{ marginTop: 12 * escala, fontSize: 16 * escala, color: THEME.textMute }}>
        carrinho {brl(valor)} · meta {brl(meta)}
      </div>
    </div>
  );
};

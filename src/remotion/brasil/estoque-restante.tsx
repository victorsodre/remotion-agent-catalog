import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../../shared/theme";
import { card, clamp, useSpring } from "./shared";

export const EstoqueRestante: React.FC<{
  de?: number;
  para?: number;
  limiar?: number;
  escala?: number;
}> = ({ de = 18, para = 3, limiar = 5, escala = 1 }) => {
  const frame = useCurrentFrame();
  const enter = useSpring(0);
  const qtd = Math.round(interpolate(frame, [10, 70], [de, para], clamp));
  const alerta = qtd <= limiar;
  const pulsa = alerta ? 1 + Math.sin(frame / 6) * 0.045 : 1;

  return (
    <div
      style={{
        ...card,
        padding: 36 * escala,
        textAlign: "center",
        width: 560 * escala,
        opacity: enter,
        transform: `scale(${pulsa})`,
        boxShadow: alerta ? `0 18px 40px ${THEME.rose}33` : card.boxShadow,
        borderColor: alerta ? `${THEME.rose}66` : THEME.hairline,
      }}
    >
      <div style={{ fontSize: 18 * escala, color: THEME.textMute, fontWeight: 700 }}>restam</div>
      <div
        style={{
          fontSize: 88 * escala,
          fontWeight: 800,
          color: alerta ? THEME.rose : THEME.text,
          lineHeight: 1.05,
          margin: `${6 * escala}px 0`,
        }}
      >
        {qtd}
      </div>
      <div style={{ fontSize: 20 * escala, color: alerta ? THEME.rose : THEME.textMute, fontWeight: 700 }}>
        {alerta ? "últimas unidades" : "em estoque"}
      </div>
    </div>
  );
};

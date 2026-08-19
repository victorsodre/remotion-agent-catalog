import React from "react";
import { THEME } from "../../shared/theme";
import { card, useSpring } from "./shared";

export const SeloGarantia: React.FC<{ escala?: number }> = ({ escala = 1 }) => {
  const enter = useSpring(0);
  const art = useSpring(16);
  return (
    <div
      style={{
        ...card,
        padding: 36 * escala,
        width: 640 * escala,
        textAlign: "center",
        opacity: enter,
        transform: `scale(${0.94 + enter * 0.06})`,
      }}
    >
      <div style={{ fontSize: 18 * escala, color: THEME.a3, fontWeight: 800, letterSpacing: 1.5 }}>GARANTIA</div>
      <div style={{ fontSize: 56 * escala, fontWeight: 800, color: THEME.text, margin: `${8 * escala}px 0` }}>7 dias</div>
      <div style={{ fontSize: 20 * escala, color: THEME.textMute }}>para desistir da compra</div>
      <div
        style={{
          marginTop: 22 * escala,
          fontSize: 16 * escala,
          color: THEME.text,
          background: THEME.ink,
          borderRadius: THEME.radius,
          padding: `${12 * escala}px ${16 * escala}px`,
          opacity: art,
        }}
      >
        art. 49 do CDC — arrependimento em compras à distância
      </div>
    </div>
  );
};

import React from "react";
import { THEME } from "../../shared/theme";
import { card, useSpring } from "./shared";

const Meio: React.FC<{
  nome: string;
  prazo: string;
  destaque?: boolean;
  escala: number;
  delay: number;
}> = ({ nome, prazo, destaque, escala, delay }) => {
  const enter = useSpring(delay);
  return (
    <div
      style={{
        flex: 1,
        padding: 22 * escala,
        borderRadius: THEME.radius,
        background: destaque ? `${THEME.zap}18` : THEME.ink,
        border: `1px solid ${destaque ? THEME.zap : THEME.hairline}`,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 18}px)`,
      }}
    >
      <div style={{ fontSize: 22 * escala, fontWeight: 800, color: destaque ? THEME.zap : THEME.text }}>{nome}</div>
      <div style={{ fontSize: 18 * escala, color: THEME.textMute, marginTop: 8 * escala }}>{prazo}</div>
    </div>
  );
};

export const BoletoPix: React.FC<{ escala?: number }> = ({ escala = 1 }) => {
  const enter = useSpring(0);
  return (
    <div style={{ ...card, padding: 32 * escala, width: 720 * escala, opacity: enter }}>
      <div style={{ fontSize: 20 * escala, color: THEME.textMute, fontWeight: 700, marginBottom: 18 * escala }}>
        meios e prazos reais
      </div>
      <div style={{ display: "flex", gap: 16 * escala }}>
        <Meio nome="Pix" prazo="aprovado na hora" destaque escala={escala} delay={6} />
        <Meio nome="Boleto" prazo="1 a 3 dias úteis" escala={escala} delay={14} />
      </div>
    </div>
  );
};

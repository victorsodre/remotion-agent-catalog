import React from "react";
import { THEME } from "../../shared/theme";
import { card, useSpring } from "./shared";

const Linha: React.FC<{ k: string; v: string; delay: number; escala: number }> = ({ k, v, delay, escala }) => {
  const s = useSpring(delay);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: `${12 * escala}px 0`,
        borderTop: `1px solid ${THEME.hairline}`,
        opacity: s,
        transform: `translateY(${(1 - s) * 10}px)`,
      }}
    >
      <span style={{ fontSize: 18 * escala, color: THEME.textMute }}>{k}</span>
      <span style={{ fontSize: 18 * escala, fontWeight: 700, color: THEME.text }}>{v}</span>
    </div>
  );
};

export const SeloEmpresa: React.FC<{
  cnpj?: string;
  anos?: number;
  escala?: number;
}> = ({ cnpj = "12.345.678/0001-90", anos = 8, escala = 1 }) => {
  const enter = useSpring(0);
  const itens = [
    { k: "CNPJ", v: cnpj },
    { k: "nota fiscal", v: "emite NF-e" },
    { k: "no mercado", v: `${anos} anos` },
  ];
  return (
    <div style={{ ...card, padding: 32 * escala, width: 680 * escala, opacity: enter }}>
      <div style={{ fontSize: 20 * escala, fontWeight: 800, color: THEME.text, marginBottom: 18 * escala }}>
        empresa verificada
      </div>
      {itens.map((it, i) => (
        <Linha key={it.k} k={it.k} v={it.v} delay={8 + i * 8} escala={escala} />
      ))}
    </div>
  );
};

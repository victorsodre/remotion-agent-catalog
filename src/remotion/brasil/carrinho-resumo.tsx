import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../../shared/theme";
import { brl, card, clamp, useSpring } from "./shared";

const LINHAS = [
  { nome: "curso", valor: 497 },
  { nome: "mentoria", valor: 190 },
];

export const CarrinhoResumo: React.FC<{ escala?: number; descontoPix?: number }> = ({
  escala = 1,
  descontoPix = 50,
}) => {
  const frame = useCurrentFrame();
  const enter = useSpring();
  const sub = LINHAS.reduce((s, l) => s + l.valor, 0);
  const pix = sub - descontoPix;

  return (
    <div style={{ ...card, padding: 32 * escala, width: 640 * escala, opacity: enter }}>
      <div style={{ fontSize: 20 * escala, color: THEME.textMute, fontWeight: 700, marginBottom: 12 * escala }}>
        fechamento
      </div>
      {LINHAS.map((l, i) => (
        <div
          key={l.nome}
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22 * escala,
            color: THEME.text,
            padding: `${8 * escala}px 0`,
            opacity: interpolate(frame, [6 + i * 8, 18 + i * 8], [0, 1], clamp),
          }}
        >
          <span>{l.nome}</span>
          <span>{brl(l.valor)}</span>
        </div>
      ))}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 20 * escala,
          color: THEME.a3,
          padding: `${10 * escala}px 0`,
          opacity: interpolate(frame, [28, 40], [0, 1], clamp),
        }}
      >
        <span>desconto Pix</span>
        <span>−{brl(descontoPix)}</span>
      </div>
      <div style={{ height: 1, background: THEME.hairline, margin: `${8 * escala}px 0` }} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 18 * escala,
          color: THEME.textMute,
          opacity: interpolate(frame, [20, 32], [0, 1], clamp),
        }}
      >
        <span>cartão</span>
        <span style={{ textDecoration: "line-through", textDecorationColor: THEME.rose }}>{brl(sub)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 * escala }}>
        <span style={{ fontSize: 18 * escala, color: THEME.textMute }}>total no Pix</span>
        <span style={{ fontSize: 36 * escala, fontWeight: 800, color: THEME.a3, opacity: interpolate(frame, [34, 48], [0, 1], clamp) }}>
          {brl(pix)}
        </span>
      </div>
    </div>
  );
};

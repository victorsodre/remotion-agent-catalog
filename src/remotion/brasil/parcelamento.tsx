import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../../shared/theme";
import { brl, card, clamp, parcelaMensal, useSpring } from "./shared";

export const Parcelamento: React.FC<{
  principal?: number;
  n?: number;
  jurosMes?: number;
  escala?: number;
}> = ({ principal = 2990, n = 12, jurosMes = 0.0199, escala = 1 }) => {
  const frame = useCurrentFrame();
  const enter = useSpring();
  const sem = parcelaMensal(principal, n, 0);
  const com = parcelaMensal(principal, n, jurosMes);
  const reveal = interpolate(frame, [10, 36], [0, 1], clamp);

  return (
    <div style={{ ...card, padding: 36 * escala, width: 760 * escala, opacity: enter }}>
      <div style={{ fontSize: 20 * escala, color: THEME.textMute, fontWeight: 700 }}>régua de parcelas</div>
      <div style={{ fontSize: 28 * escala, fontWeight: 800, color: THEME.text, margin: `${8 * escala}px 0 ${22 * escala}px` }}>
        {brl(principal)}
      </div>
      <Linha
        escala={escala}
        label={`${n}x sem juros`}
        valor={brl(sem)}
        sub="total = à vista"
        cor={THEME.a3}
        t={reveal}
      />
      <Linha
        escala={escala}
        label={`${n}x com ${(jurosMes * 100).toFixed(2)}% a.m.`}
        valor={brl(com)}
        sub={`juros compostos · total ${brl(com * n)}`}
        cor={THEME.rose}
        t={interpolate(frame, [22, 48], [0, 1], clamp)}
      />
    </div>
  );
};

const Linha: React.FC<{
  label: string;
  valor: string;
  sub: string;
  cor: string;
  t: number;
  escala: number;
}> = ({ label, valor, sub, cor, t, escala }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      padding: `${14 * escala}px 0`,
      borderTop: `1px solid ${THEME.hairline}`,
      opacity: t,
      transform: `translateX(${(1 - t) * 16}px)`,
    }}
  >
    <div>
      <div style={{ fontSize: 20 * escala, fontWeight: 700, color: THEME.text }}>{label}</div>
      <div style={{ fontSize: 15 * escala, color: THEME.textMute, marginTop: 4 * escala }}>{sub}</div>
    </div>
    <div style={{ fontSize: 28 * escala, fontWeight: 800, color: cor }}>{valor}</div>
  </div>
);

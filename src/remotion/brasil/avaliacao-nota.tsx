import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../../shared/theme";
import { card, clamp, ENTER, pop, useSpring } from "./shared";

const DIST = [
  { n: 5, pct: 0.72 },
  { n: 4, pct: 0.18 },
  { n: 3, pct: 0.06 },
  { n: 2, pct: 0.03 },
  { n: 1, pct: 0.01 },
];

const Estrela: React.FC<{ i: number; fill: number; escala: number }> = ({ i, fill, escala }) => {
  const s = useSpring(ENTER + 8 + i * 5, pop);
  const cheia = fill >= i + 1;
  const frac = Math.min(1, Math.max(0, fill - i));
  return (
    <span
      style={{
        fontSize: 28 * escala,
        color: frac > 0 ? THEME.amber : "rgba(11,18,32,0.12)",
        opacity: cheia ? 1 : 0.35 + frac * 0.65,
        transform: `scale(${0.7 + s * 0.3})`,
        display: "inline-block",
      }}
    >
      ★
    </span>
  );
};

export const AvaliacaoNota: React.FC<{
  nota?: number;
  escala?: number;
}> = ({ nota = 4.8, escala = 1 }) => {
  const frame = useCurrentFrame();
  const enter = useSpring();
  const fill = interpolate(frame, [8, 40], [0, nota], clamp);

  return (
    <div style={{ ...card, padding: 32 * escala, width: 760 * escala, display: "flex", gap: 28 * escala, opacity: enter }}>
      <div style={{ minWidth: 200 * escala }}>
        <div style={{ fontSize: 64 * escala, fontWeight: 800, color: THEME.text, lineHeight: 1 }}>{nota.toFixed(1)}</div>
        <div style={{ display: "flex", gap: 4 * escala, marginTop: 10 * escala }}>
          {Array.from({ length: 5 }, (_, i) => (
            <Estrela key={i} i={i} fill={fill} escala={escala} />
          ))}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        {DIST.map((d, i) => {
          const w = interpolate(frame, [16 + i * 4, 40 + i * 4], [0, d.pct], clamp);
          return (
            <div key={d.n} style={{ display: "flex", alignItems: "center", gap: 10 * escala, marginBottom: 8 * escala }}>
              <span style={{ width: 14 * escala, fontSize: 14 * escala, color: THEME.textMute }}>{d.n}</span>
              <div style={{ flex: 1, height: 10 * escala, background: THEME.ink, borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: `${w * 100}%`, height: "100%", background: THEME.amber, borderRadius: 99 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

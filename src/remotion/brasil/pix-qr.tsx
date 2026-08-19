import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../../shared/theme";
import { card, clamp, useSpring } from "./shared";

const N = 21;

function inFinder(x: number, y: number) {
  const near = (a: number, b: number) => a < 7 && b < 7;
  return near(x, y) || near(x, N - 1 - y) || near(N - 1 - x, y);
}

function finderOn(x: number, y: number) {
  const lx = x < 7 ? x : x >= N - 7 ? x - (N - 7) : x;
  const ly = y < 7 ? y : y >= N - 7 ? y - (N - 7) : y;
  const ring = lx === 0 || ly === 0 || lx === 6 || ly === 6;
  const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
  return ring || core;
}

function dataOn(x: number, y: number) {
  return (x * 13 + y * 29 + 7) % 5 > 1;
}

export const PixQr: React.FC<{
  valor?: string;
  escala?: number;
}> = ({ valor = "R$ 297,00", escala = 1 }) => {
  const frame = useCurrentFrame();
  const enter = useSpring();
  const drawn = interpolate(frame, [4, 48], [0, 1], clamp);
  const ok = interpolate(frame, [58, 72], [0, 1], clamp);
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) cells.push({ x, y });
  }
  const size = 14 * escala;
  const gap = 1.2 * escala;

  return (
    <div
      style={{
        ...card,
        padding: 36 * escala,
        textAlign: "center",
        opacity: enter,
        transform: `scale(${0.94 + enter * 0.06})`,
      }}
    >
      <div style={{ fontSize: 18 * escala, color: THEME.textMute, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase" }}>
        Pix
      </div>
      <div style={{ fontSize: 36 * escala, color: THEME.text, fontWeight: 800, margin: `${10 * escala}px 0 ${22 * escala}px` }}>
        {valor}
      </div>
      <div style={{ position: "relative", display: "inline-block" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${N}, ${size}px)`,
            gap,
            padding: 12 * escala,
            background: THEME.panel,
            borderRadius: 8,
          }}
        >
          {cells.map(({ x, y }, i) => {
            const on = inFinder(x, y) ? finderOn(x, y) : dataOn(x, y);
            const appear = i < cells.length * drawn ? 1 : 0;
            return (
              <div
                key={`${x}-${y}`}
                style={{
                  width: size,
                  height: size,
                  borderRadius: 1,
                  background: on ? THEME.text : "transparent",
                  opacity: on ? appear : 0,
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: ok,
            transform: `scale(${0.7 + ok * 0.3})`,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: THEME.zap,
              color: THEME.onAccent,
              fontWeight: 800,
              fontSize: 22 * escala,
              padding: `${10 * escala}px ${18 * escala}px`,
              borderRadius: 999,
              boxShadow: `0 10px 28px ${THEME.zap}66`,
            }}
          >
            Pix aprovado
          </div>
        </div>
      </div>
      <div style={{ marginTop: 18 * escala, fontSize: 16 * escala, color: ok > 0.5 ? THEME.zap : THEME.textMute, fontWeight: 700 }}>
        {ok > 0.5 ? "na hora" : "aguardando pagamento"}
      </div>
    </div>
  );
};

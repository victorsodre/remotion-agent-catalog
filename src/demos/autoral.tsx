import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../shared/theme";

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      background: THEME.ink,
      perspective: 1100,
      alignItems: "center",
      justifyContent: "center",
      overflow: "visible",
      transformStyle: "preserve-3d",
    }}
  >
    {children}
  </AbsoluteFill>
);

export const DemoCarrossel: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const rot = interpolate(frame, [0, durationInFrames], [0, 360]);
  const cards = ["PIX", "12x", "frete", "CDC"];
  return (
    <Stage>
      <div
        style={{
          position: "relative",
          width: 520,
          height: 320,
          transformStyle: "preserve-3d",
          transform: `rotateX(14deg) rotateY(${rot}deg)`,
        }}
      >
        {cards.map((label, i) => {
          const a = i * 90;
          return (
            <div
              key={label}
              style={{
                position: "absolute",
                inset: 40,
                background: "#fff",
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 48,
                fontWeight: 800,
                color: THEME.text,
                boxShadow: "0 18px 40px rgba(11,18,32,0.12)",
                transform: `rotateY(${a}deg) translateZ(220px)`,
                backfaceVisibility: "hidden",
              }}
            >
              {label}
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

export const DemoCamadas: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 40], [0.4, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const planes = [
    { z: -160, s: 0.78, op: 0.35, label: "fundo" },
    { z: 0, s: 0.92, op: 0.7, label: "meio" },
    { z: 140, s: 1, op: 1, label: "frente" },
  ];
  return (
    <Stage>
      <div style={{ position: "relative", width: 480, height: 320, transformStyle: "preserve-3d", transform: `rotateX(${8 * t}deg) rotateY(${-16 * t}deg)` }}>
        {planes.map((p) => (
          <div
            key={p.label}
            style={{
              position: "absolute",
              inset: 0,
              background: "#fff",
              borderRadius: 24,
              opacity: p.op,
              transform: `translateZ(${p.z * t}px) scale(${p.s})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 800,
              color: THEME.text,
              boxShadow: "0 12px 32px rgba(11,18,32,0.1)",
            }}
          >
            {p.label}
          </div>
        ))}
      </div>
    </Stage>
  );
};

export const DemoFratura: React.FC = () => {
  const frame = useCurrentFrame();
  const blocks = Array.from({ length: 8 }, (_, i) => i);
  return (
    <Stage>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 140px)", gap: 16 }}>
        {blocks.map((i) => {
          const delay = i * 4;
          const p = interpolate(frame - delay, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div
              key={i}
              style={{
                height: 140,
                borderRadius: 16,
                background: i % 2 ? THEME.a1 : THEME.a3,
                transform: `translateY(${(1 - p) * 40}px)`,
                opacity: p,
              }}
            />
          );
        })}
      </div>
    </Stage>
  );
};

export const DemoCurvas: React.FC = () => {
  const frame = useCurrentFrame();
  const easings = [
    { name: "linear", fn: Easing.linear },
    { name: "cubic", fn: Easing.inOut(Easing.cubic) },
    { name: "expo", fn: Easing.out(Easing.exp) },
    { name: "bounce", fn: Easing.out(Easing.bounce) },
  ];
  return (
    <Stage>
      <div style={{ width: 800 }}>
        {easings.map((e, i) => {
          const x = interpolate(frame % 90, [0, 70], [0, 1], {
            extrapolateRight: "clamp",
            easing: e.fn,
          });
          return (
            <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
              <div style={{ width: 120, color: THEME.textMute, fontSize: 22 }}>{e.name}</div>
              <div style={{ flex: 1, height: 8, background: THEME.hairline, borderRadius: 99, position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    left: `${x * 100}%`,
                    width: 28,
                    height: 28,
                    borderRadius: 99,
                    background: i % 2 ? THEME.a1 : THEME.a3,
                    marginLeft: -14,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

export const autoralDemos: Record<string, React.FC> = {
  "Tridimensional::Carrossel": DemoCarrossel,
  "Tridimensional::Camadas": DemoCamadas,
  "MovimentoComposto::Fratura": DemoFratura,
  "MovimentoComposto::Curvas de easing": DemoCurvas,
};

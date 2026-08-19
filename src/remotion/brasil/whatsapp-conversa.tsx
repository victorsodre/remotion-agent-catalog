import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../../shared/theme";
import { card, clamp, useSpring } from "./shared";

const MSGS: { de: "eles" | "loja"; texto: string; at: number }[] = [
  { de: "eles", texto: "oi, tem em 12x?", at: 18 },
  { de: "loja", texto: "tem sim — 12x sem juros no cartão", at: 48 },
  { de: "loja", texto: "ou 8% off no Pix", at: 70 },
];

const Digitando: React.FC<{ escala: number }> = ({ escala }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        alignSelf: "flex-start",
        background: THEME.ink,
        borderRadius: 16,
        padding: `${10 * escala}px ${14 * escala}px`,
        display: "flex",
        gap: 6 * escala,
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 8 * escala,
            height: 8 * escala,
            borderRadius: 99,
            background: THEME.textMute,
            opacity: 0.35 + ((Math.sin((frame - i * 4) / 5) + 1) / 2) * 0.65,
          }}
        />
      ))}
    </div>
  );
};

export const WhatsappConversa: React.FC<{ escala?: number }> = ({ escala = 1 }) => {
  const frame = useCurrentFrame();
  const enter = useSpring(0);
  const typing = frame >= 8 && frame < 18;

  return (
    <div
      style={{
        ...card,
        padding: 28 * escala,
        width: 640 * escala,
        display: "flex",
        flexDirection: "column",
        gap: 12 * escala,
        opacity: enter,
        background: "#efeae2",
      }}
    >
      <div style={{ fontSize: 16 * escala, color: THEME.textMute, fontWeight: 700, marginBottom: 4 * escala }}>
        atendimento
      </div>
      {typing ? <Digitando escala={escala} /> : null}
      {MSGS.map((m) => {
        const t = interpolate(frame, [m.at, m.at + 10], [0, 1], clamp);
        if (t <= 0) return null;
        const loja = m.de === "loja";
        return (
          <div
            key={m.texto}
            style={{
              alignSelf: loja ? "flex-end" : "flex-start",
              maxWidth: "82%",
              background: loja ? "#d9fdd3" : THEME.panel,
              color: THEME.text,
              padding: `${12 * escala}px ${16 * escala}px`,
              borderRadius: 16,
              fontSize: 20 * escala,
              fontWeight: 600,
              opacity: t,
              transform: `translateY(${(1 - t) * 12}px)`,
              boxShadow: `0 4px 12px ${THEME.shadow}`,
            }}
          >
            {m.texto}
          </div>
        );
      })}
    </div>
  );
};

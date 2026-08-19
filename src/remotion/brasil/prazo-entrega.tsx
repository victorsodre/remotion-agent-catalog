import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../../shared/theme";
import { card, clamp, useSpring } from "./shared";

const ETAPAS = ["pedido", "separação", "rota", "entrega"];

export const PrazoEntrega: React.FC<{ escala?: number }> = ({ escala = 1 }) => {
  const frame = useCurrentFrame();
  const enter = useSpring(0);
  const ativo = Math.min(ETAPAS.length - 1, Math.floor(interpolate(frame, [8, 80], [0, ETAPAS.length], clamp)));

  return (
    <div style={{ ...card, padding: 36 * escala, width: 780 * escala, opacity: enter }}>
      <div style={{ fontSize: 32 * escala, fontWeight: 800, color: THEME.text, marginBottom: 28 * escala }}>
        chega amanhã
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        {ETAPAS.map((nome, i) => {
          const on = i <= ativo;
          return (
            <React.Fragment key={nome}>
              <div style={{ textAlign: "center", flex: "0 0 auto" }}>
                <div
                  style={{
                    width: 22 * escala,
                    height: 22 * escala,
                    borderRadius: 99,
                    margin: "0 auto",
                    background: on ? THEME.a1 : THEME.ink,
                    border: `2px solid ${on ? THEME.a1 : THEME.hairline}`,
                    boxShadow: on ? `0 0 0 6px ${THEME.a1}22` : undefined,
                  }}
                />
                <div
                  style={{
                    marginTop: 10 * escala,
                    fontSize: 16 * escala,
                    fontWeight: 700,
                    color: on ? THEME.text : THEME.textMute,
                  }}
                >
                  {nome}
                </div>
              </div>
              {i < ETAPAS.length - 1 ? (
                <div
                  style={{
                    flex: 1,
                    height: 3 * escala,
                    margin: `0 ${8 * escala}px ${22 * escala}px`,
                    background: i < ativo ? THEME.a1 : THEME.hairline,
                    borderRadius: 99,
                  }}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

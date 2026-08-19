import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../shared/theme";

export const Stage: React.FC<{ children: React.ReactNode; bg?: string; pad?: number }> = ({
  children,
  bg = THEME.ink,
  pad = 64,
}) => (
  <AbsoluteFill
    style={{
      background: bg,
      alignItems: "center",
      justifyContent: "center",
      padding: pad,
      fontFamily: THEME.fonte,
    }}
  >
    {children}
  </AbsoluteFill>
);

export const Plate: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <AbsoluteFill style={{ background: color, alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontSize: 120, fontWeight: 800, color: "#fff", letterSpacing: -2 }}>{label}</div>
  </AbsoluteFill>
);

export const STILL = "demo-still.svg";
export const TONE = "demo-tone.wav";

export function usePop(delay = 0) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.55, stiffness: 140 } });
}

export function useSweep(period = 90) {
  const frame = useCurrentFrame();
  return interpolate(frame % period, [0, period], [0, 1]);
}

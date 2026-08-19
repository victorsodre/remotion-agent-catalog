import type { CSSProperties } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../../shared/theme";

export const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const soft = { damping: 14, mass: 0.55, stiffness: 140 };
export const pop = { damping: 9, mass: 0.5, stiffness: 160 };

/**
 * Delay negativo no enter: no Studio o frame 0 deixa de ser um quadrado
 * em branco (o spring ainda não saiu do 0). Mesma ideia do StaggeredMotion.
 */
export const ENTER = -16;

export function useSpring(delay = ENTER, config = soft) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
}

export const card: CSSProperties = {
  background: THEME.panel,
  border: `1px solid ${THEME.hairline}`,
  borderRadius: THEME.radius * 1.4,
  boxShadow: `0 18px 40px ${THEME.shadow}`,
  fontFamily: THEME.fonte,
};

/** Price table: compound monthly installment. i = 0 → equal splits. */
export function parcelaMensal(principal: number, n: number, i: number): number {
  if (n <= 0) return principal;
  if (i <= 0) return principal / n;
  const f = (1 + i) ** n;
  return (principal * i * f) / (f - 1);
}

export function brl(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

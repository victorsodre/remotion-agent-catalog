import React, { useState } from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";

export type CatalogPieceProps = {
  nome: string;
  lib: string;
  quando: string;
  preview: string | null;
};

const LIB_COLOR: Record<string, string> = {
  RemotionUI: "#4b8bff",
  Autoral: "#37d399",
  Bits: "#b184ff",
  Remocn: "#ffb020",
};

/** 1:1 — toca o .webm real se existir; senão um card com nome + intenção. */
export const CatalogPiece: React.FC<CatalogPieceProps> = ({ nome, lib, quando, preview }) => {
  const [failed, setFailed] = useState(false);
  const color = LIB_COLOR[lib] ?? "#93a0b8";

  if (preview && !failed) {
    return (
      <AbsoluteFill style={{ background: "#0b0d12" }}>
        <OffthreadVideo
          src={staticFile(preview)}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          onError={() => setFailed(true)}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        background: "#0b0d12",
        alignItems: "center",
        justifyContent: "center",
        padding: 72,
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 860,
          border: `1px solid ${color}44`,
          borderRadius: 24,
          padding: 56,
          background: "#12151d",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: 1, textTransform: "uppercase" }}>{lib}</div>
        <div style={{ fontSize: 56, fontWeight: 800, color: "#e7ebf3", marginTop: 16, lineHeight: 1.15 }}>{nome}</div>
        <div style={{ fontSize: 28, color: "#93a0b8", marginTop: 24, lineHeight: 1.4 }}>{quando}</div>
        <div style={{ fontSize: 20, color: "#63708c", marginTop: 36 }}>prévia ainda não renderizada</div>
      </div>
    </AbsoluteFill>
  );
};

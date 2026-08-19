import type React from "react";
import { autoralDemos } from "./autoral";
import { marketingDemos } from "./marketing";
import { remocnDemos } from "./remocn";
import { uiDemos } from "./ui";

/** Chave: `${folder}::${nome}` — pasta do catálogo + nome da peça. */
export const LIVE: Partial<Record<string, React.FC>> = {
  ...uiDemos,
  ...marketingDemos,
  ...autoralDemos,
  ...remocnDemos,
};

export const liveKey = (folder: string, nome: string) => `${folder}::${nome}`;

import type React from "react";
import { autoralDemos } from "./autoral";
import { bitsDemos } from "./bits";
import { brasilDemos } from "./brasil";
import { marketingDemos } from "./marketing";
import { remocnDemos } from "./remocn";
import { uiDemos } from "./ui";

/** Chave: `${folder}::${nome}` — pasta do catálogo + nome da peça. */
export const LIVE: Partial<Record<string, React.FC>> = {
  ...uiDemos,
  ...marketingDemos,
  ...autoralDemos,
  ...brasilDemos,
  ...remocnDemos,
  ...bitsDemos,
};

export const liveKey = (folder: string, nome: string) => `${folder}::${nome}`;
